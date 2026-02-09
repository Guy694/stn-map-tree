/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/stn-tree',
  assetPrefix: '/stn-tree',
  // allowedDevOrigins: ['192.168.100.95:3000', 'localhost:3000'],
  output: 'standalone',
  reactCompiler: true,
  trailingSlash: true
};

export default nextConfig;
