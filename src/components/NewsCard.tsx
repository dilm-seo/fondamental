import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const getSentimentIcon = () => {
    if (!news.sentiment) return <Minus className="w-5 h-5 text-gray-500" />;
    return news.sentiment.score > 0 ? (
      <TrendingUp className="w-5 h-5 text-green-500" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-500" />
    );
  };

  const getSentimentColor = () => {
    if (!news.sentiment) return 'bg-gray-100';
    return news.sentiment.score > 0 ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${getSentimentColor()}`}>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{news.title}</h3>
        <div className="ml-4 flex items-center">
          {getSentimentIcon()}
          {news.sentiment && (
            <span className="ml-2 text-sm font-medium">
              {(news.sentiment.score * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{news.content}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(news.pubDate), { addSuffix: true })}
        </span>
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Read more →
        </a>
      </div>
      {news.sentiment && (
        <div className="mt-3 text-sm text-gray-600 border-t pt-3">
          {news.sentiment.analysis}
        </div>
      )}
    </div>
  );
};