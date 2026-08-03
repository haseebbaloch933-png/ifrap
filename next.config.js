/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94LWZhbGxiYWNrIiwicSI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6In0.placeholder',
  },
  poweredByHeader: false,
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    // Content-Security-Policy. Notes on the necessary relaxations:
    //  - script-src 'unsafe-inline': Next.js injects inline hydration scripts.
    //    'unsafe-eval' is added in dev only (HMR/dev runtime uses eval).
    //  - style-src 'unsafe-inline': Tailwind/framer-motion emit inline styles.
    //  - *.cartocdn.com: MapLibre basemap style, tiles, sprites and glyphs
    //    (see components/DecolonialMap.tsx). blob:/worker-src: MapLibre workers.
    //  - dev also allows ws:/localhost for the HMR socket.
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.cartocdn.com",
      "font-src 'self' data:",
      `connect-src 'self' https://*.cartocdn.com${isDev ? ' ws: wss: http://localhost:*' : ''}`,
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
