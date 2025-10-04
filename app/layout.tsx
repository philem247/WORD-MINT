"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletContextProvider } from "../components/WalletContextProvider";
import { AuthProvider } from "../lib/auth";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>WordMint</title>
        <meta name="description" content="Spell-to-Earn on Solana" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}