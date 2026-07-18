/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Prevent build failures due to ESLint FlatConfig serialization issues in worker threads
    ignoreDuringBuilds: true,
  },
  env: {
    APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '',
    VITE_API_URL: process.env.VITE_API_URL || '',
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;


