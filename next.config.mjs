/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["fitnessapp20250501224647.azurewebsites.net"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://185.233.183.203/api/:path*",
      },
    ];
  },
};

export default nextConfig;
