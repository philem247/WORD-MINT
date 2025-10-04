import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WordMint - Spelling Game",
  description: "Listen, type, and win!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
