import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletContextProvider } from "../components/WalletContextProvider";
import { AuthProvider } from "../lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WordMint",
  description: "Spell-to-Earn on Solana",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}