import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Profile photo (2 MB) + certification (5 MB) + form fields
      bodySizeLimit: "8mb",
    },
  },
  async redirects() {
    return [
      { source: "/portal", destination: "/students", permanent: true },
      { source: "/portal/:path*", destination: "/students/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
