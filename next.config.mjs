/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
    ],
  },
  redirects: async () => [
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
