/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  experimental: {
    optimizePackageImports: ['@/components/ui']
  }
}

module.exports = nextConfig 