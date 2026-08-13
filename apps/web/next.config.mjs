/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 让 web 直接消费 packages/ui-kit 的 TS 源码
  transpilePackages: ["@yo-skill/ui-kit"],
};

export default nextConfig;
