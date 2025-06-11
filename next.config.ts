import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for Firebase hosting
  experimental: {
    allowedDevOrigins: [
      "https://9000-firebase-studio-1748298724664.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Custom config, not a built-in Next.js option
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;