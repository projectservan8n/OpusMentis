/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  images: {
    domains: ['images.clerk.dev', 'www.gravatar.com']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Suppress non-critical Radix UI accessibility warnings in development
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      }
    }
    return config
  },
  // Suppress console warnings for Radix UI accessibility in production
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
  }),
}

module.exports = nextConfig