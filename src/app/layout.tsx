import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { themeInitScript } from "@/lib/theme";
import { site } from "@/data/site";
import "./globals.css";

const pixel = localFont({
  src: "../fonts/pixelify.woff2",
  variable: "--font-pixelify",
  weight: "400 700",
  display: "swap",
  preload: true,
});

const hand = localFont({
  src: "../fonts/handwriting.woff2",
  variable: "--font-hand",
  weight: "600",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Ahmad Raza", "MrRealORG", "portfolio", "developer", "designer", "RealHackers",
    "Next.js", "React", "AI tools", "web developer", "Faisalabad", "Python", "automation",
    "NookNook", "free-ui", "Kanso UI", "GTA-REAL", "Tide Island", "dotnote",
    "CenterFace AI", "Kite", "open source", "GitHub",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${pixel.variable} ${hand.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
        >
          Skip to content
        </a>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
