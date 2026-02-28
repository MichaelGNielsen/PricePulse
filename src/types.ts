export type SearchLocation = 'DK' | 'Nordics' | 'EU' | 'Global';

export interface Deal {
  id: string;
  title: string;
  price: string;
  store: string;
  url: string;
  description?: string;
  rating?: string;
  imageUrl?: string;
}

export interface SearchResult {
  deals: Deal[];
  summary: string;
  sources: { title: string; uri: string }[];
}

export interface SavedSearch {
  id: string;
  query: string;
  location: SearchLocation;
  timestamp: number;
  result: SearchResult;
}

export interface SavedItem {
  id: string;
  deal: Deal;
  query: string;
  location: SearchLocation;
  timestamp: number;
}
