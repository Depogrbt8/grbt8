/** @type {import('next').NextConfig} */
const nextConfig = {
  // Güvenlik ayarları
  poweredByHeader: false, // X-Powered-By header'ı kaldır
  
  // Performance optimizasyonları
  compress: true, // Gzip compression
  
  // Image optimization
  images: {
    domains: [
      'grbt8.store',
      'www.grbt8.store',
      'anasite.grbt8.store',
      'lh3.googleusercontent.com', // Google OAuth avatars
      'platform-lookaside.fbsbx.com', // Facebook OAuth avatars
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // 1 dakika cache
  },
  
  // Webpack optimizasyonları (Next.js 13.5.6 uyumlu)
  webpack: (config, { isServer }) => {
    // Production'da source map boyutunu küçült
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.devtool = 'source-map';
    }
    return config;
  },
  
  // Strict mode
  reactStrictMode: true,
  
  // SWC minification (Next.js 13+ default)
  swcMinify: true,
  
  // Experimental features (Next.js 13.5.6 için güvenli)
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast'], // Tree shaking
  },
  
  // HTTP headers (ekstra güvenlik)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
