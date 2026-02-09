/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/stn-tree',
  assetPrefix: '/stn-tree',
  allowedDevOrigins: ['192.168.100.95:3000', 'localhost:3000'],
  reactCompiler: true,
};

export default nextConfig;
