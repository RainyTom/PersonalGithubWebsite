export interface SearchItem {
  id: string; title: string; summary: string; date: string; tags: string[];
  kind: string; url: string; path: string; score?: number;
}
export interface Filters { tag: string; from: string; to: string; scope: string; order: string; }
