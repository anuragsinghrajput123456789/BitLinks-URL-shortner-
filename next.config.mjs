/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["framer-motion"],
  env: {
    APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '',
    VITE_API_URL: process.env.VITE_API_URL || '',
  },
};

export default nextConfig;

