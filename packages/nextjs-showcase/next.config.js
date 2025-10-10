/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fhevm-sdk'],
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
