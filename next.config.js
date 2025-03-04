/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure modules are found properly
  webpack: (config, { isServer }) => {
    // Add fallbacks and handle module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Add additional resolver plugins and paths
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      './node_modules'
    ];
    
    // Improve module resolution
    config.resolve.symlinks = true;
    
    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Optimize caching for builds
  experimental: {
    optimizeCss: true
  },
}

module.exports = nextConfig 