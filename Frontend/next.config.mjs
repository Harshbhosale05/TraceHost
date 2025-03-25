/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production builds
  reactStrictMode: true,
  
  // Minimize code and enable compression
  swcMinify: true,
  
  // Configure environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
  
  // Image optimization
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Transpile modules that need to be compiled
  transpilePackages: ['jspdf', 'jspdf-autotable'],
  
  // Configure webpack for optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
      };
      
      // Set production mode
      config.mode = 'production';
    }
    
    return config;
  },
  
  // Add security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configure redirects for clean URLs
  async redirects() {
    return [
      {
        source: '/analyze',
        destination: '/analyze',
        permanent: true,
      },
    ];
  },
};

export default nextConfig; 