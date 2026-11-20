// Short addresses for on-screen captions ("thehumorindex.com/seinfeld"). TikTok
// gives no clickable link under 1,000 followers and its in-app browser drops the
// referrer, so the tag is the only way social visits show up in Analytics.
const SHORT_LINKS = [
  ['seinfeld', 'seinfeld'],
  ['office', 'the-office'],
  ['theoffice', 'the-office'],
  ['friends', 'friends'],
  ['30rock', '30-rock'],
  ['sunny', 'its-always-sunny'],
  ['alwayssunny', 'its-always-sunny'],
  ['parks', 'parks-and-recreation'],
  ['veep', 'veep'],
  ['ad', 'arrested-development'],
  ['arresteddevelopment', 'arrested-development'],
  ['fleabag', 'fleabag'],
  ['chappelle', 'chappelles-show'],
  ['conchords', 'flight-of-the-conchords'],
  ['schitts', 'schitts-creek'],
  ['broadcity', 'broad-city'],
  ['larrysanders', 'the-larry-sanders-show'],
  ['freaksandgeeks', 'freaks-and-geeks'],
  ['simpsons', 'the-simpsons'],
  ['community', 'community'],
  ['curb', 'curb-your-enthusiasm'],
  ['futurama', 'futurama'],
  ['taxi', 'taxi'],
  ['freshprince', 'the-fresh-prince-of-bel-air'],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    // The search API reads the joke index from disk at runtime; ship it with that function.
    outputFileTracingIncludes: { '/api/search': ['./public/data/search-index.json', './public/data/movies/*.json'] },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
    ],
  },
  redirects: async () => [
    ...SHORT_LINKS.flatMap(([from, slug]) => [`/${from}`, `/${from}/`].map(source => ({
      source,
      destination: `/shows/${slug}/?utm_source=shortlink&utm_medium=social&utm_campaign=${from}`,
      permanent: false,
    }))),
    // Retired the Broad City launch post; send old links to the show page.
    {
      source: '/blog/broad-city-launch',
      destination: '/shows/broad-city/',
      permanent: true,
    },
    // Retired 2026-08-19: posts built on pre-rescore scores that contradict current data.
    {
      source: '/blog/freaks-and-geeks-launch',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/chappelles-show-launch',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/curb-your-enthusiasm-launch',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/larry-sanders-launch',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/taxi-launch',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/schitts-creek-last-on-board-first-on-impact',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/arrested-development-takes-the-crown',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/arrested-development-craft-leaderboard',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/30-rock-takes-the-crown',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/display-scale-recalibration',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/comedy-war',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/seinfeld-vs-the-office',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/funniest-characters-cross-show',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/parks-passes-office',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/humor-index-explorer',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/community-gas-leak-year',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/humor-index-vs-imdb-three-ways',
      destination: '/blog/',
      permanent: true,
    },
    // Retired 2026-11-10: posts about shows still on pre-2026 scores, or built on
    // numbers the rescore replaced. Text is kept in git history for republishing.
    {
      source: '/blog/futurama-launch',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/the-simpsons-all-20-seasons',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/fresh-prince-geoffrey-butler',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/sunny-renaissance',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/war-reconciliation',
      destination: '/blog/',
      permanent: true,
    },
    {
      source: '/blog/character-comedy-spectrum',
      destination: '/blog/',
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: '/data/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
      ],
    },
    {
      source: '/:path*.json',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
      ],
    },
  ],
  compress: true,
};

export default nextConfig;
