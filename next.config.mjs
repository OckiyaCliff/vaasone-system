/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    /* Remove in production once all types are resolved */
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  /* Suppress known Stellar SDK warnings in edge environments */
  serverExternalPackages: ['@stellar/stellar-sdk'],
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    }]
  },
}

export default nextConfig
