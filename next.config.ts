import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    config.externals = [...(config.externals || []), 'sqlite3', 'sqlite'];
    
    return config;
  },
  serverExternalPackages: ['sqlite3', 'sqlite'],
};

export default nextConfig;
