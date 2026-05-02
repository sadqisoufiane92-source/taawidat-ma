const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["../../data/tarifs_decret_2-10-319.json"] = path.resolve(
      __dirname,
      "data/tarifs_1812.json"
    );
    return config;
  },
}

module.exports = nextConfig
