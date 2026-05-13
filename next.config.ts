import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/portal", destination: "/students", permanent: true },
      { source: "/portal/:path*", destination: "/students/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
