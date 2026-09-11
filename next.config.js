/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: true,
  },
  experimental: {
    viewTransition: true,
  },
};

module.exports = nextConfig;
