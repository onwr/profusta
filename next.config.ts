import type { NextConfig } from "next";

function safeCdnHostname(): string {
  const raw = process.env.CDN_BASE_URL?.trim();
  if (!raw) return "cdn.littlemomstore.com";
  try {
    return new URL(raw).hostname;
  } catch {
    return "cdn.littlemomstore.com";
  }
}

const cdnHost = safeCdnHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: cdnHost,
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
