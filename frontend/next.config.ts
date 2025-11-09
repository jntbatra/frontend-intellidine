import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://intellidine-api.aahil-khan.tech/api/:path*',
      },
    ];
  },
};

export default nextConfig;
