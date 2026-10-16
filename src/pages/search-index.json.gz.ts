import { gzipSync } from 'node:zlib';
import { searchIndex } from '../lib/search-index';
export async function GET() {
  return new Response(new Uint8Array(gzipSync(await searchIndex())), { headers: { 'Content-Type': 'application/gzip' } });
}
