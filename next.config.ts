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
  async redirects() {
    // Quiz360Pro was renamed to Scholars Drill. The old public URLs stay alive so
    // existing links, bookmarks and indexed search results do not 404.
    return [
      {
        source: "/quiz360pro",
        destination: "/scholars-drill",
        permanent: true,
      },
      {
        source: "/dashboard/quiz360",
        destination: "/dashboard/scholars-drill",
        permanent: true,
      },
    ];
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
