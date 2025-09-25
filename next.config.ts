import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude heavy Solana dependencies from server-side bundles
      config.externals = config.externals || [];
      config.externals.push({
        '@solana/web3.js': '@solana/web3.js',
        '@solana/spl-token': '@solana/spl-token',
        '@solana/wallet-adapter-react': '@solana/wallet-adapter-react',
        '@solana/wallet-adapter-react-ui': '@solana/wallet-adapter-react-ui',
        '@solana/wallet-adapter-wallets': '@solana/wallet-adapter-wallets',
      });
    }
    return config;
  },
};

export default nextConfig;
