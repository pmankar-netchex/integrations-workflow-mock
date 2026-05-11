/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repo = process.env.GH_PAGES_REPO || '';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProd && repo ? `/${repo}` : '',
  assetPrefix: isProd && repo ? `/${repo}/` : '',
  trailingSlash: true,
};

export default nextConfig;
