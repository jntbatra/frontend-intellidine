import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { AuthInitializer } from "@/components/providers/auth-initializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intellidine - Smart Restaurant Ordering",
  description: "AI-powered restaurant ordering system with dynamic pricing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthInitializer />
        <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
      </body>
    </html>
  );
}
