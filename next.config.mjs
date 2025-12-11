import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Setup Cloudflare dev platform for local development
if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
