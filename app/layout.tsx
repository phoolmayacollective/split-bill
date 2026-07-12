import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { DemoPersonaBanner } from "@/components/demo-persona-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { isDemoModeEnabled } from "@/lib/demo-mode";
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
  title: "Split Bill",
  description: "No-signup bill splitter — create, share, and claim what you owe.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background min-h-full flex flex-col">
        <div className="from-primary/8 via-background to-background pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b" />
        {isDemoModeEnabled() ? (
          <Suspense fallback={null}>
            <DemoPersonaBanner />
          </Suspense>
        ) : null}
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
