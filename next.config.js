/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    // 支持服务端组件
    serverComponentsExternalPackages: [],
  },
  // 图片优化配置
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Webpack配置优化
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // 添加服务器配置
  devServer: {
    host: 'localhost',
    port: 3000
  }
}

module.exports = nextConfig 