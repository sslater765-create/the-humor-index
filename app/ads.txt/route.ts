// ads.txt, generated from the AdSense publisher id so it can never drift from
// the id the ad tags use. 404 until NEXT_PUBLIC_ADSENSE_ID is set.
// When Journey by Mediavine approves the site, replace this with the ads.txt
// redirect they provide.
export const dynamic = 'force-static';

export function GET() {
  const id = (process.env.NEXT_PUBLIC_ADSENSE_ID || '').replace(/^ca-/, '');
  if (!id) return new Response('Not found', { status: 404 });
  return new Response(`google.com, ${id}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
