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
