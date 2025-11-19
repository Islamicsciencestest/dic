export interface WordEntry {
  id: string;
  word: string;
  translation: string; // New: Direct translation
  definition: string;
  partOfSpeech: string; // e.g., noun, verb, adjective
  examples: string[];
  notes: string;
  createdAt: number;
  tags: string[];
}

export interface SentenceEntry {
  id: string;
  content: string;
  translation: string;
  category: string;
  notes: string;
  createdAt: number;
}

export interface AIResponse {
  translation: string;
  definition: string;
  partOfSpeech: string;
  examples: string[];
  tags: string[];
}

export enum SortOption {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  ALPHABETICAL = 'ALPHABETICAL'
}

export type AppTab = 'WORDS' | 'SENTENCES';