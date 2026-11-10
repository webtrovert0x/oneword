import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load root .env so REOWN_ID and CONTRACT_ADDRESS live in a single root .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, "../"),
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/core/client": false,
      "@x402/evm": false,
      "@x402/evm/exact/client": false,
      "@x402/evm/upto/client": false,
      "@x402/svm/exact/client": false,
    };
    return config;
  },
};

export default nextConfig;
