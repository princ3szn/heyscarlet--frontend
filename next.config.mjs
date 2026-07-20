/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://api.heyscarlet.ai/:path*',
      },
    ]
  },
};

export default nextConfig;