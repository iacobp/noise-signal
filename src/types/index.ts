export interface ResearchQuery {
  query: string;
}

export interface ResearchData {
  source: string;
  content: string;
  confidence: number;
  timestamp: string;
  url?: string;
  fetchedBy?: 'perplexity' | 'exa';
}

export interface ClassifiedData {
  signals: ResearchData[];
  noise: ResearchData[];
  strategicDecision: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 