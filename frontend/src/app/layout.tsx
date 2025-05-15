import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "SolViz Studio - Solana Blockchain Visualizations",
  description:
    "Create beautiful visualizations of Solana blockchain data using natural language",
  themeColor: "#141420",
};

// Use PropTypes or just plain JS for compatibility
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-500 text-slate-100`}
      >
        <div className="fixed inset-0 bg-gradient-to-br from-dark-400 to-dark-600 animate-gradient-y -z-10"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(157,92,255,0.1),transparent_50%)] -z-10"></div>
        <div className="relative z-0">{children}</div>
      </body>
    </html>
  );
}
