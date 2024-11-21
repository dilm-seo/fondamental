import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Globe, Newspaper, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { NewsCard } from './components/NewsCard';
import { Settings } from './components/Settings';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProgressBar } from './components/ProgressBar';
import { useApiKey } from './hooks/useApiKey';
import { fetchNews } from './services/api';
import type { NewsItem } from './types';

function App() {
  const [apiKey, setApiKey] = useApiKey();
  const queryClient = useQueryClient();

  const { 
    data: news,
    isLoading: newsLoading,
    isError: newsError,
    error: newsErrorDetails
  } = useQuery<NewsItem[], Error>(
    ['news', apiKey],
    () => fetchNews(apiKey),
    { 
      enabled: !!apiKey,
      refetchInterval: 3000000, // Refetch every 50 minutes
      retry: 2,
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      }
    }
  );

  const handleRefresh = () => {
    toast.promise(
      queryClient.invalidateQueries('news'),
      {
        loading: 'Refreshing news...',
        success: 'News refreshed successfully',
        error: 'Failed to refresh news'
      }
    );
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Forex Market Analysis</h1>
            <p className="mt-2 text-gray-600">Please configure your OpenAI API key to get started</p>
          </div>
          <Settings onApiKeyChange={setApiKey} currentApiKey={apiKey} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Forex Market Analysis</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={newsLoading}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${newsLoading ? 'animate-spin' : ''}`} />
              </button>
              <Settings onApiKeyChange={setApiKey} currentApiKey={apiKey} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Newspaper className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900 ml-2">Latest Market News</h2>
            </div>
            {newsLoading && <LoadingSpinner />}
          </div>
          
          {newsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {newsErrorDetails?.message || 'Failed to load news feed'}
            </div>
          ) : newsLoading && !news ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-md p-6 h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {news?.map((item) => (
                <NewsCard key={item.link} news={item} />
              ))}
            </div>
          )}
        </section>

        {news && (
          <section className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Analysis Progress</h2>
            <div className="space-y-4">
              <ProgressBar
                label="Sentiment Analysis"
                progress={news ? (news.filter(n => n.sentiment).length / news.length) * 100 : 0}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
