/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
    esmExternals: false,
  },
};

module.exports = nextConfig;
