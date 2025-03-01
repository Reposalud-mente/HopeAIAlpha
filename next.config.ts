import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: 'build',  // Optional: specify the build output directory
  reactStrictMode: true,
  
  // SWC minification is enabled by default in newer Next.js versions
  experimental: {
    // App Router is now stable in Next.js 13.4+
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
  }
};

export default nextConfig;
