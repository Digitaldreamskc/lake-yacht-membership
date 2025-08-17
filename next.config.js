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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' https://js.stripe.com https://explorer-api.walletconnect.com https://cdn.walletconnect.com https://unpkg.com; " +
              "connect-src 'self' https://api.privy.io https://auth.privy.io https://explorer-api.walletconnect.com https://pulse.walletconnect.org https://api.web3modal.org https://cdn.walletconnect.com https://relay.walletconnect.org https://relay.walletconnect.com; " +
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://auth.privy.io https://console.privy.io; " +
              "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' data: https:;"
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
