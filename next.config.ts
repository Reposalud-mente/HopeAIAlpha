import type { NextConfig } from "next";

// Standardize on the Alpha environment
const appEnv = 'alpha';

// Base configuration for the Alpha environment
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

// Alpha environment configuration
const alphaConfig: NextConfig = {
  // Alpha testing environment settings
  env: {
    FEATURE_FLAGS_ENABLED: 'true',
    MONITORING_ENABLED: 'true',
    FEEDBACK_WIDGET_ENABLED: 'true',
  },
};

// Merge the base config with Alpha environment config
const nextConfig: NextConfig = {
  ...baseConfig,
  ...alphaConfig,
  env: {
    ...baseConfig.env,
    ...alphaConfig.env,
  },
};

export default nextConfig;
