/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
            hostname: 'ash-dev.modhanami.com'
        }]
    }
};

module.exports = nextConfig;
