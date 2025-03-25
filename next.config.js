module.exports = {
  // ...other config
  images: {
    domains: [
      // ...other domains
      'maps.googleapis.com',
      'maps.gstatic.com'
    ],
  },
  // Add security headers to allow Google Maps
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https://*.googleapis.com https://*.gstatic.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.googleapis.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
} 