import raw from '../generated/catalog.json';
export interface Breadcrumb { text: string; path: string; url?: string; }
export interface Entry {
  title: string; relativePath: string; url: string; summary: string; date: string;
  tags: string[]; source: string; kind: string; breadcrumbs: Breadcrumb[];
}
export interface Category { name: string; path: string; }
export default raw as { pages: Entry[]; categories: Category[] };
