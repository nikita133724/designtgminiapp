import type {NextConfig} from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/app';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  trailingSlash: true,
  eslint: {
    // The legacy AI Studio page is migrated during the build. TypeScript remains strict;
    // lint cleanup will be handled while the page is split into components.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['motion'],
};

export default nextConfig;
