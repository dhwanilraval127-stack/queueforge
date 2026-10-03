/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production build to finish even if there are minor type warnings
    ignoreBuildErrors: false,
  },
  headers: async () => [
    {
      source: '/dashboard/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ],
};

module.exports = nextConfig;