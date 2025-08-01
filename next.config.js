/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  swcMinify: false, // Still okay to keep this off
  experimental: {
    forceSwcTransforms: false,
    esmExternals: false,
  },
  // ✅ Remove the webpack override block
};

module.exports = nextConfig;

