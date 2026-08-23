import type { Metadata } from "next";
import Header from "@/components/common/Header";
import { SessionProvider } from "@/lib/use-session";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sihteammatcher.vercel.app"),
  title: "SIH Team Matcher - Smart India Hackathon",
  description: "Find your ideal hackathon teammates with AI-powered compatibility matching, 28 official SIH 2026 problem statements, and real-time squad chat.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "256x256", type: "image/png" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "SIH Team Matcher - Forge Your Winning Squad",
    description: "AI-powered teammate compatibility scoring, official SIH problem statement matching, skill gap analysis, and real-time collaboration for Smart India Hackathon.",
    url: "https://sihteammatcher.vercel.app",
    siteName: "SIH Team Matcher",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SIH Team Matcher - Smart India Hackathon 2026",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIH Team Matcher - Forge Your Winning Squad",
    description: "AI-powered teammate compatibility scoring, official SIH problem statement matching, skill gap analysis, and real-time collaboration.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen antialiased text-slate-100`}>
        <SessionProvider>
          <div className="mesh-bg" />
          <Header />
          <main className="relative min-h-[calc(100vh-57px)]">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
