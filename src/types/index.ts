export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  sentiment?: {
    score: number;
    analysis: string;
  };
}