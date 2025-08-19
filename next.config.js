/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Removed output: 'export' - needed for API routes and server-side functionality
  // Removed trailingSlash: true - can cause issues with API routes
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
  webpack: (config, { isServer }) => {
    // Exclude contracts directory from Next.js build
    config.resolve.alias = {
      ...config.resolve.alias,
      'hardhat': false,
    };
    
    // Exclude contracts directory from webpack processing
    config.module.rules.push({
      test: /\.ts$/,
      exclude: /contracts/,
    });
    
    return config;
  },
};

module.exports = nextConfig;
