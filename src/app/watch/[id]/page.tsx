'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Info, Tv, Globe, Tag } from 'lucide-react';
import { Channel, iptvApi } from '../../../services/iptvApi';
import VideoPlayer from '../../../components/VideoPlayer';
import Link from 'next/link';
import Image from 'next/image';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [relatedChannels, setRelatedChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (params.id) {
      loadChannel(decodeURIComponent(params.id as string));
    }
  }, [params.id]);

  const loadChannel = async (channelId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const channels = await iptvApi.getChannels();
      const foundChannel = channels.find(ch => ch.id === channelId);
      
      if (!foundChannel) {
        setError('Channel not found');
        return;
      }
      
      setChannel(foundChannel);
      
      // Load related channels (same category or country)
      const related = channels
        .filter(ch => 
          ch.id !== channelId && 
          (ch.category === foundChannel.category || ch.country === foundChannel.country)
        )
        .slice(0, 8);
      setRelatedChannels(related);
      
    } catch (err) {
      console.error('Error loading channel:', err);
      setError('Failed to load channel');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Channel...</p>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Tv className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{error || 'Channel not found'}</h2>
          <p className="text-gray-400 mb-6">The channel you're looking for doesn't exist or is unavailable.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Channels
          </Link>
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
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                {channel.logo && (
                  <Image
                    src={channel.logo}
                    alt={channel.name}
                    width={32}
                    height={32}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold text-white">{channel.name}</h1>
                  <p className="text-sm text-gray-400">{channel.country}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Info className="h-4 w-4" />
              <span>Info</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-lg overflow-hidden">
              {channel.url ? (
                <VideoPlayer
                  src={channel.url}
                  poster={channel.logo}
                  autoPlay={true}
                  className="w-full aspect-video"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <Tv className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Stream URL not available</p>
                    <p className="text-sm text-gray-500">Channel ID: {channel.id}</p>
                    <p className="text-sm text-gray-500">URL: {channel.url || 'None'}</p>
                    {/* Test with a known working stream */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">HLS Test Streams</h4>
                      
                      {/* NASA TV Test */}
                      <div className="mb-4">
                        <h5 className="text-xs text-gray-400 mb-1">NASA TV (Known Working HLS)</h5>
                        <VideoPlayer
                          src="https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8"
                          poster={channel.logo}
                          autoPlay={false}
                          className="w-full aspect-video mb-1"
                        />
                        <p className="text-xs text-gray-600">URL: https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8</p>
                      </div>
                      
                      {/* Big Buck Bunny Test */}
                      <div className="mb-4">
                        <h5 className="text-xs text-gray-400 mb-1">Big Buck Bunny (HLS Test)</h5>
                        <VideoPlayer
                          src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                          poster={channel.logo}
                          autoPlay={false}
                          className="w-full aspect-video mb-1"
                        />
                        <p className="text-xs text-gray-600">URL: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8</p>
                      </div>
                      
                      {/* Apple Sample Stream */}
                      <div className="mb-4">
                        <h5 className="text-xs text-gray-400 mb-1">Apple Sample Stream</h5>
                        <VideoPlayer
                          src="https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"
                          poster={channel.logo}
                          autoPlay={false}
                          className="w-full aspect-video mb-1"
                        />
                        <p className="text-xs text-gray-600">URL: https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8</p>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        These test streams help verify HLS functionality and debug DEMUXER_ERROR_DETECTED_HLS issues.
                        Check browser console for detailed error information.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Channel Info Panel */}
            {showInfo && (
              <div className="mt-6 bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Channel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Tv className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{channel.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Country:</span>
                      <span className="text-white">{channel.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{channel.category}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Language:</span>
                      <span className="text-white">{channel.language}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Group:</span>
                      <span className="text-white">{channel.group}</span>
                    </div>
                    {channel.tvg_id && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">TVG ID:</span>
                        <span className="text-white">{channel.tvg_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Channels Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Related Channels</h3>
              <div className="space-y-3">
                {relatedChannels.length > 0 ? (
                  relatedChannels.map((relatedChannel) => (
                    <Link
                      key={relatedChannel.id}
                      href={`/watch/${encodeURIComponent(relatedChannel.id)}`}
                      className="flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        {relatedChannel.logo ? (
                          <Image
                            src={relatedChannel.logo}
                            alt={relatedChannel.name}
                            width={40}
                            height={40}
                            className="object-contain rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center">
                            <Tv className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-blue-300">
                          {relatedChannel.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {relatedChannel.country}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No related channels found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}