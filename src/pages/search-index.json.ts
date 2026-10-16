import { searchIndex } from '../lib/search-index';
export async function GET() {
  return new Response(await searchIndex(), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
