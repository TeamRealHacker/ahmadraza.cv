import { site } from "@/data/site";

/**
 * Plain-text robots.txt. Hidden routes are disallowed from indexing.
 */
export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /vault/

Sitemap: ${site.url}/sitemap.xml
Host: ${site.url}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
