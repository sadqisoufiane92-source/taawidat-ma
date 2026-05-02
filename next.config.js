const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.taawidat.ma" }],
        destination: "https://taawidat.ma/:path*",
        permanent: true,
      },
    ];
  },

  webpack: (config) => {
    config.resolve.alias["../../data/tarifs_decret_2-10-319.json"] = path.resolve(
      __dirname,
      "data/tarifs_1812.json"
    );
    return config;
  },
};

module.exports = nextConfig;
