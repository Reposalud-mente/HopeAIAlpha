import type { NextConfig } from "next";

// Determine the current environment
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';

// Base configuration shared across all environments
const baseConfig: NextConfig = {
  distDir: 'build',  // Specify the build output directory
  reactStrictMode: true,
  // output: 'export',  // Static export disabled to support dynamic routes

  // Disable TypeScript and ESLint checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // SWC minification is enabled by default in newer Next.js versions
  experimental: {
    // App Router is now stable in Next.js 13.4+
  },

  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/public/uploads/:path*',
      },
    ];
  },

  // Add this configuration for images from placeholder services
  images: {
    domains: [
      'placehold.co',
      'via.placeholder.com',
      'placekitten.com',
      'picsum.photos',
      'randomuser.me',
      'images.unsplash.com'
    ],
    // Set up image remotePatterns for better security (Next.js 13+)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables that will be available at build time
  env: {
    APP_ENV: appEnv,
  },
};

// Environment-specific configurations
const envConfig: Record<string, NextConfig> = {
  development: {
    // Development-specific settings
  },
  alpha: {
    // Alpha testing environment settings
    env: {
      FEATURE_FLAGS_ENABLED: 'true',
      MONITORING_ENABLED: 'true',
      FEEDBACK_WIDGET_ENABLED: 'true',
    },
  },
  production: {
    // Production-specific settings
  },
};

// Merge the base config with environment-specific config
const nextConfig: NextConfig = {
  ...baseConfig,
  ...(envConfig[appEnv] || {}),
  env: {
    ...baseConfig.env,
    ...(envConfig[appEnv]?.env || {}),
  },
};

export default nextConfig;
