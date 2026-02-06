export interface SearchResult {
  id: string;
  url: string;
  title: string;
  text?: string;
  summary?: string;
  highlights?: string[];
  highlightScores?: number[];
  publishedDate?: string;
  author?: string;
  score?: number;
  image?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  autopromptString?: string;
  requestId?: string;
}

export interface SearchRequest {
  query: string;
  numResults?: number;
  type?: "keyword" | "neural" | "auto";
  useAutoprompt?: boolean;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  category?: string;
}

// Answer Mode Types
export interface Citation {
  id: string;
  url: string;
  title: string;
}

export interface AnswerResponse {
  answer: string;
  citations: Citation[];
}

export interface AnswerRequest {
  query: string;
}

// Research Mode Types
export interface ResearchCitation {
  title: string;
  url: string;
}

export interface ResearchCost {
  total: number;
  numPages: number;
  numSearches: number;
}

export interface ResearchResponse {
  status: string;
  taskId?: string;
  output?: {
    content: string;
  };
  citations?: ResearchCitation[];
  costDollars?: ResearchCost;
}
