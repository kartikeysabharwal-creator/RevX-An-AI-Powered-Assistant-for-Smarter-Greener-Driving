/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@revx/shared', '@revx/analytics'],
};

export default nextConfig;
