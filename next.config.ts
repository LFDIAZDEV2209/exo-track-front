import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz de Turbopack: sin esto, Next infiere C:\Users\Luis como raíz
  // (por un package-lock.json ajeno en el home) y el primer compile muere
  // intentando rastrear todo el directorio personal.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/:path*`,
      },
    ];
  },
};

export default nextConfig;