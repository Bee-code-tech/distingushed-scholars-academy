// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Limits cache and memory consumption during build processing
    config.performance = {
      ...config.performance,
      hints: false,
    };
    return config;
  },
};

export default nextConfig;