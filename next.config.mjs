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
