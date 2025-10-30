import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MERCHANT_API_KEY: process.env.NEXT_PUBLIC_MERCHANT_API_KEY,
    NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS:
      process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS,
  },
};

export default nextConfig;
