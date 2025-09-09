import axios from 'axios';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  country: string;
  language: string;
  category: string;
  tvg_id?: string;
  tvg_name?: string;
}

interface Stream {
  channel: string | null;
  feed: string | null;
  title: string;
  url: string;
  referrer: string | null;
  user_agent: string | null;
  quality: string | null;
}

export interface Country {
  name: string;
  code: string;
  flag: string;
}

export interface Category {
  id: string;
  name: string;
}

const BASE_URL = 'https://iptv-org.github.io/api';

class IPTVApiService {
  private cache: {
    channels?: Channel[];
    streams?: Stream[];
    countries?: Country[];
    categories?: Category[];
    lastFetch?: number;
  } = {};

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(): boolean {
    return (
      this.cache.lastFetch &&
      Date.now() - this.cache.lastFetch < this.CACHE_DURATION
    );
  }

  async getStreams(): Promise<Stream[]> {
    if (this.cache.streams && this.isCacheValid()) {
      return this.cache.streams;
    }

    try {
      const response = await axios.get(`${BASE_URL}/streams.json`);
      const streams: Stream[] = response.data.map((stream: any) => ({
        channel: stream.channel,
        feed: stream.feed,
        title: stream.title || 'Unknown Stream',
        url: stream.url || '',
        referrer: stream.referrer,
        user_agent: stream.user_agent,
        quality: stream.quality,
      }));

      this.cache.streams = streams;
      return streams;
    } catch (error) {
      console.error('Error fetching streams:', error);
      return this.cache.streams || [];
    }
  }

  async getChannels(): Promise<Channel[]> {
    if (this.cache.channels && this.isCacheValid()) {
      return this.cache.channels;
    }

    try {
      const [channelsResponse, streams] = await Promise.all([
        axios.get(`${BASE_URL}/channels.json`),
        this.getStreams()
      ]);

      console.log(`Fetched ${channelsResponse.data.length} channels and ${streams.length} streams`);

      // Create a map of channel ID to streams for faster lookup
      const streamsByChannel = new Map<string, Stream[]>();
      streams.forEach(stream => {
        if (stream.channel) {
          if (!streamsByChannel.has(stream.channel)) {
            streamsByChannel.set(stream.channel, []);
          }
          streamsByChannel.get(stream.channel)!.push(stream);
        }
      });

      console.log(`Created stream map with ${streamsByChannel.size} channel entries`);

      const channels: Channel[] = channelsResponse.data.map((channel: any) => {
        // Find the best quality stream for this channel
        const channelStreams = streamsByChannel.get(channel.id) || [];
        let bestStream = channelStreams.find(s => s.quality === '1080p') ||
                        channelStreams.find(s => s.quality === '720p') ||
                        channelStreams.find(s => s.quality === '480p') ||
                        channelStreams[0]; // fallback to first available stream

        return {
          id: channel.id || `${channel.name}-${Math.random()}`,
          name: channel.name || 'Unknown Channel',
          logo: channel.logo && channel.logo.trim() !== '' ? channel.logo : '',
          group: channel.categories?.[0] || 'General',
          url: bestStream?.url || '',
          country: channel.country || 'Unknown',
          language: channel.languages?.[0] || 'Unknown',
          category: channel.categories?.[0] || 'General',
          tvg_id: channel.id,
          tvg_name: channel.name,
        };
      });

      // Filter out channels without valid stream URLs
      const validChannels = channels.filter(channel => 
        channel.url && 
        channel.url.trim() !== '' && 
        (channel.url.includes('.m3u8') || channel.url.includes('.ts') || channel.url.includes('http'))
      );

      console.log(`Total channels: ${channels.length}, Valid channels with URLs: ${validChannels.length}`);
      
      // Log some examples of channels without URLs for debugging
      const channelsWithoutUrls = channels.filter(ch => !ch.url || ch.url.trim() === '');
      if (channelsWithoutUrls.length > 0) {
        console.log(`Sample channels without URLs:`, channelsWithoutUrls.slice(0, 3).map(ch => ({
          id: ch.id,
          name: ch.name,
          url: ch.url
        })));
      }

      this.cache.channels = validChannels;
      this.cache.lastFetch = Date.now();
      return validChannels;
    } catch (error) {
      console.error('Error fetching channels:', error);
      return this.cache.channels || [];
    }
  }

  async getInitialChannels(): Promise<Channel[]> {
    const allChannels = await this.getChannels();
    
    // Debug: Log sample channel data to understand structure
    console.log('Sample channels for debugging:', allChannels.slice(0, 5).map(ch => ({
      name: ch.name,
      country: ch.country,
      category: ch.category,
      group: ch.group,
      logo: ch.logo
    })));
    
    // Debug: Check for Bangladeshi channels specifically
    const bangladeshiChannels = allChannels.filter(channel => 
      channel.country.toLowerCase().includes('bangladesh') ||
      channel.country.toLowerCase().includes('bd') ||
      channel.name.toLowerCase().includes('bangladesh') ||
      channel.name.toLowerCase().includes('bangla')
    );
    console.log(`Found ${bangladeshiChannels.length} Bangladeshi channels:`, bangladeshiChannels.slice(0, 3).map(ch => ch.name));
    
    // Debug: Check for Sports channels
    const sportsChannels = allChannels.filter(channel => 
      channel.category.toLowerCase().includes('sport') ||
      channel.group.toLowerCase().includes('sport') ||
      channel.name.toLowerCase().includes('sport')
    );
    console.log(`Found ${sportsChannels.length} Sports channels`);
    
    // Filter for Bangladeshi and Sports channels initially
    const filteredChannels = allChannels.filter(channel => 
      channel.country.toLowerCase().includes('bangladesh') ||
      channel.country.toLowerCase().includes('bd') ||
      channel.name.toLowerCase().includes('bangladesh') ||
      channel.name.toLowerCase().includes('bangla') ||
      channel.category.toLowerCase().includes('sport') ||
      channel.group.toLowerCase().includes('sport') ||
      channel.name.toLowerCase().includes('sport')
    );
    
    console.log(`Initial filtered channels: ${filteredChannels.length}`);
    return filteredChannels;
  }

  async getPaginatedChannels(page: number = 1, pageSize: number = 20, filters?: {
    country?: string;
    category?: string;
    searchQuery?: string;
  }): Promise<{
    channels: Channel[];
    totalPages: number;
    currentPage: number;
    totalChannels: number;
  }> {
    let channels = await this.getChannels();
    
    // Apply filters
    if (filters) {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        channels = channels.filter(channel =>
          channel.name.toLowerCase().includes(query) ||
          channel.group.toLowerCase().includes(query) ||
          channel.country.toLowerCase().includes(query) ||
          channel.category.toLowerCase().includes(query)
        );
      }
      
      if (filters.country) {
        channels = channels.filter(channel => 
          channel.country.toLowerCase().includes(filters.country!.toLowerCase())
        );
      }
      
      if (filters.category) {
        channels = channels.filter(channel => 
          channel.category.toLowerCase().includes(filters.category!.toLowerCase()) ||
          channel.group.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }
    }
    
    const totalChannels = channels.length;
    const totalPages = Math.ceil(totalChannels / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedChannels = channels.slice(startIndex, endIndex);
    
    return {
      channels: paginatedChannels,
      totalPages,
      currentPage: page,
      totalChannels
    };
  }

  async getCountries(): Promise<Country[]> {
    if (this.cache.countries && this.isCacheValid()) {
      return this.cache.countries;
    }

    try {
      const response = await axios.get(`${BASE_URL}/countries.json`);
      const countries: Country[] = response.data.map((country: any) => ({
        name: country.name,
        code: country.code,
        flag: country.flag || '',
      }));

      console.log(`Loaded ${countries.length} countries. Sample:`, countries.slice(0, 5));
      
      // Check if Bangladesh is in the countries list
      const bangladeshCountry = countries.find(c => 
        c.name.toLowerCase().includes('bangladesh') || 
        c.code.toLowerCase() === 'bd'
      );
      if (bangladeshCountry) {
        console.log('Found Bangladesh in countries:', bangladeshCountry);
      } else {
        console.log('Bangladesh not found in countries list');
      }

      this.cache.countries = countries;
      return countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return this.cache.countries || [];
    }
  }

  async getCategories(): Promise<Category[]> {
    if (this.cache.categories && this.isCacheValid()) {
      return this.cache.categories;
    }

    try {
      const response = await axios.get(`${BASE_URL}/categories.json`);
      const categories: Category[] = response.data.map((category: any) => ({
        id: category.id,
        name: category.name,
      }));

      console.log(`Loaded ${categories.length} categories. Sample:`, categories.slice(0, 10));

      this.cache.categories = categories;
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.cache.categories || [];
    }
  }

  async searchChannels(query: string): Promise<Channel[]> {
    const channels = await this.getChannels();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return channels;

    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(searchTerm) ||
        channel.group.toLowerCase().includes(searchTerm) ||
        channel.country.toLowerCase().includes(searchTerm) ||
        channel.category.toLowerCase().includes(searchTerm)
    );
  }

  async filterChannels({
    country,
    category,
    language,
  }: {
    country?: string;
    category?: string;
    language?: string;
  }): Promise<Channel[]> {
    const channels = await this.getChannels();
    
    console.log('Filtering channels with filters:', { country, category, language });
    console.log('Total channels before filtering:', channels.length);
    
    const filtered = channels.filter((channel) => {
       if (country && !channel.country.toLowerCase().includes(country.toLowerCase())) return false;
       if (category && 
           !channel.category.toLowerCase().includes(category.toLowerCase()) &&
           !channel.group.toLowerCase().includes(category.toLowerCase())) return false;
       if (language && !channel.language.toLowerCase().includes(language.toLowerCase())) return false;
       return true;
     });
    
    console.log('Channels after filtering:', filtered.length);
    if (category) {
      console.log('Sample channels with category filter:', filtered.slice(0, 3).map(ch => ({
        name: ch.name,
        category: ch.category,
        group: ch.group
      })));
    }
    
    return filtered;
  }

  clearCache(): void {
    this.cache = {};
  }
}

export const iptvApi = new IPTVApiService();
export default iptvApi;