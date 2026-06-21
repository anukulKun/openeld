/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/platform',
        destination: 'https://openeld-platform.vercel.app',
      },
      {
        source: '/platform/:path*',
        destination: 'https://openeld-platform.vercel.app/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
