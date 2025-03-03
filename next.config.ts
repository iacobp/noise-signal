import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['*'],
  },
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_PERPLEXITY_API_KEY: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY,
    NEXT_PUBLIC_EXA_API_KEY: process.env.NEXT_PUBLIC_EXA_API_KEY,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  },
};

export default nextConfig;
