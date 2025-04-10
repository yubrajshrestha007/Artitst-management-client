import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/', // Match the root path exactly
        destination: '/login', // Redirect to the login page
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
