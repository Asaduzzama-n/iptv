'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Tv, Globe, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { iptvApi } from '@/services/iptvApi';
import type { Channel, Country, Category } from '@/services/iptvApi';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChannels, setTotalChannels] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pageSize = 20;

  const loadChannels = async (page: number = 1, resetToInitial: boolean = false) => {
    try {
      setLoading(true);
      
      let result;
      if (resetToInitial || (isInitialLoad && !searchQuery && !selectedCountry && !selectedCategory)) {
        // Load initial filtered channels (Bangladeshi and Sports)
        const initialChannels = await iptvApi.getInitialChannels();
        const totalInitial = initialChannels.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedInitial = initialChannels.slice(startIndex, endIndex);
        
        result = {
          channels: paginatedInitial,
          totalPages: Math.ceil(totalInitial / pageSize),
          currentPage: page,
          totalChannels: totalInitial
        };
        setIsInitialLoad(false);
      } else {
        // Use pagination with filters
        result = await iptvApi.getPaginatedChannels(page, pageSize, {
          country: selectedCountry || undefined,
          category: selectedCategory || undefined,
          searchQuery: searchQuery || undefined
        });
      }
      
      setChannels(result.channels);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalChannels(result.totalChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesData, categoriesData] = await Promise.all([
          iptvApi.getCountries(),
          iptvApi.getCategories()
        ]);
        
        setCountries(countriesData);
        setCategories(categoriesData);
        
        // Load initial channels
        await loadChannels(1, true);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      setCurrentPage(1);
      loadChannels(1);
    }
  }, [searchQuery, selectedCountry, selectedCategory]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadChannels(page);
    }
  };

  const handleShowAllChannels = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedCategory('');
    setIsInitialLoad(false);
    loadChannels(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedCategory('');
    setCurrentPage(1);
    loadChannels(1, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading TV Channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tv className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">IPTV Platform</h1>
            </div>
            <div className="text-sm text-gray-300">
              {totalChannels} channels available
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search channels, countries, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            <div className="flex space-x-2">
              {(selectedCountry || selectedCategory || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={handleShowAllChannels}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Show All Channels
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Channels Grid */}
        {channels.length === 0 ? (
          <div className="text-center py-12">
            <Tv className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No channels found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {channels.map((channel) => (
              <Link
                key={channel.id}
                href={`/watch/${encodeURIComponent(channel.id)}`}
                className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="aspect-video bg-gray-700 relative overflow-hidden">
                  {channel.logo ? (
                    <Image
                      src={channel.logo || '/placeholder-logo.svg'}
                      alt={channel.name}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-200 bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-logo.svg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Tv className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-blue-600 rounded-full p-3">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate mb-1">
                    {channel.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{channel.country}</span>
                  </div>
                  {channel.category && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                        {channel.category}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
