/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  swcMinify: true, // ✅ Turn this ON — Terser issues often come from old Webpack+Terser combo, not SWC
  experimental: {
    forceSwcTransforms: true, // ✅ Force SWC for all transforms
    esmExternals: true,       // ✅ ESM external modules preferred on Vercel
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
