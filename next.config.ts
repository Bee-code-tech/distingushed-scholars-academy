// // import type { NextConfig } from "next";

// // const nextConfig: NextConfig = {
// //   /* config options here */
// //   reactCompiler: true,
// // };

// // export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactCompiler: true,
//   productionBrowserSourceMaps: false,
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   async headers() {
//     // Defence in depth. No CSP yet — the app loads Paystack, Cloudinary and
//     // Google Fonts, so one written blind would break checkout; add it
//     // deliberately, in report-only first.
//     return [
//       {
//         source: '/:path*',
//         headers: [
//           // Stay on HTTPS for two years, once the domain is happy on it.
//           {
//             key: 'Strict-Transport-Security',
//             value: 'max-age=63072000; includeSubDomains',
//           },
//           // Nobody frames the admin panel into a clickjacking overlay.
//           { key: 'X-Frame-Options', value: 'DENY' },
//           { key: 'X-Content-Type-Options', value: 'nosniff' },
//           // Don't leak the page someone came from to other sites.
//           { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
//           {
//             key: 'Permissions-Policy',
//             value: 'camera=(), microphone=(self), geolocation=(), payment=(self)',
//           },
//         ],
//       },
//     ]
//   },
//   async redirects() {
//     // Quiz360Pro was renamed to Scholars Drill. The old public URLs stay alive so
//     // existing links, bookmarks and indexed search results do not 404.
//     return [
//       {
//         source: "/quiz360pro",
//         destination: "/scholars-drill",
//         permanent: true,
//       },
//       {
//         source: "/dashboard/quiz360",
//         destination: "/dashboard/scholars-drill",
//         permanent: true,
//       },
//     ];
//   },
//   webpack: (config) => {
//     // Limits cache and memory consumption during build processing
//     config.performance = {
//       ...config.performance,
//       hints: false,
//     };
//     return config;
//   },
// };

// export default nextConfig;
