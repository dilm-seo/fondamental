import OpenAI from 'openai';
import axios from 'axios';
import type { NewsItem } from '../types';

// Using a more reliable CORS proxy
const CORS_PROXY = 'https://corsproxy.io/?';
const RSS_URL = `${CORS_PROXY}${encodeURIComponent('https://www.forexlive.com/feed/news/')}`;

const parseRSSFeed = (xmlString: string): NewsItem[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Invalid XML format');
    }

    const items = xmlDoc.querySelectorAll('item');
    return Array.from(items).map(item => ({
      title: item.querySelector('title')?.textContent?.trim() || '',
      link: item.querySelector('link')?.textContent?.trim() || '',
      pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
      content: (
        item.querySelector('content\\:encoded')?.textContent?.trim() ||
        item.querySelector('description')?.textContent?.trim() ||
        ''
      )
    }));
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw new Error('Failed to parse news feed');
  }
};

export const fetchNews = async (apiKey: string): Promise<NewsItem[]> => {
  try {
    const { data: feedXml } = await axios.get(RSS_URL, {
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; ForexDashboard/1.0)'
      },
      timeout: 10000
    });

    if (!feedXml || typeof feedXml !== 'string') {
      throw new Error('Invalid RSS feed response');
    }

    const feedItems = parseRSSFeed(feedXml);
    
    if (!feedItems.length) {
      throw new Error('No news items found in the feed');
    }

    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const news = await Promise.all(
      feedItems.slice(0, 10).map(async (item) => {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "system",
              content: "Analyze the following forex news. Return a JSON with score (number between -1 and 1, where -1 is very bearish and 1 is very bullish) and a brief analysis in french."
            }, {
              role: "user",
              content: `${item.title}\n${item.content}`
            }],
            temperature: 0.7,
            max_tokens: 150
          });

          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error('Empty response from OpenAI');
          }

          const sentiment = JSON.parse(content);
          return {
            ...item,
            sentiment
          };
        } catch (error) {
          console.error('Error analyzing sentiment:', error);
          return {
            ...item,
            sentiment: {
              score: 0,
              analysis: 'Analysis temporarily unavailable'
            }
          };
        }
      })
    );

    return news;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching news:', errorMessage);
    throw new Error(`Failed to fetch news: ${errorMessage}`);
  }
};
