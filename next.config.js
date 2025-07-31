/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: { unoptimized: true },
    // Completely disable SWC to fix memory access error
    swcMinify: false,
    experimental: {
        forceSwcTransforms: false,
        esmExternals: false,
    },
    // Force use of Babel instead of SWC
    webpack: (config, { dev, isServer }) => {
        // Disable SWC loader
        config.module.rules.forEach((rule) => {
            if (rule.use && rule.use.loader === 'next-swc-loader') {
                rule.use.loader = 'babel-loader';
            }
        });
        return config;
    },
};

module.exports = nextConfig;