import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack config (Turbopack se deshabilita con variable de entorno)
  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;
