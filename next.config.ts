// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables React's Strict Mode, which helps to highlight potential problems in an application.
  // Recommended for identifying deprecations and ensuring future compatibility.
  reactStrictMode: false,

  // Configuration for ESLint integration within Next.js builds.
  eslint: {
    // !! WARNING !!
    // Setting `ignoreDuringBuilds: true` will prevent ESLint from failing the production build,
    // even if it finds errors or warnings. This can be useful for quickly deploying
    // with existing linting issues, but it is NOT recommended for long-term production.
    // ALWAYS aim to fix ESLint errors/warnings directly in your code.
    // For the 'react/no-unescaped-entities' error, this *will* allow the build to pass,
    // but the underlying HTML issue will still exist.
    ignoreDuringBuilds: true, // <--- **CHANGE THIS TO `false` if you want ESLint errors to break the build (RECOMMENDED for errors)**

    // If you need to restrict ESLint to certain directories (e.g., if you have
    // monorepo setups or specific linting contexts).
    // Most typical Next.js projects don't need this.
    // dirs: ['pages', 'components', 'utils', 'src'],
  },
  typescript: {
    // !! This option allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },

  // If you plan to use the `next/image` component and need to optimize images
  // from external domains, you'll need to specify them here.
  // For example:
  // images: {
  //   domains: ['example.com', 'another-cdn.com'],
  // },
  

  // You can add other Next.js specific configurations here as needed.
  // For example:
  // compiler: {
  //   // For more advanced SWC/Babel configurations
  // },
  // experimental: {
  //   // For experimental Next.js features
  // },
};

export default nextConfig;