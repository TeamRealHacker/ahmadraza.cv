import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/providers";
import { MenuNotch } from "@/components/menu-notch";
import { themeInitScript } from "@/lib/theme";
import { site } from "@/data/site";
import "./globals.css";
import "./polish.css";

/* Display accent: a refined serif used sparingly (italic accent words,
   the banner line). Everything else is Geist Sans. */
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

/* Ultra-minimal first-visit intro. Runs before paint: it only flags <html>
   when this tab hasn't seen the intro yet and motion is allowed. The overlay
   itself is pure CSS and fades itself out, so it can never block content,
   even if JavaScript fails after this line. */
const introScript = `try{if(!sessionStorage.getItem('ar-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-intro','');sessionStorage.setItem('ar-intro','1');setTimeout(function(){document.documentElement.removeAttribute('data-intro')},3000)}}catch(e){}`;

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
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${serif.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <div className="intro" aria-hidden="true">
          <span className="intro-mark">Ahmad Raza</span>
          <span className="intro-track"><span className="intro-fill" /></span>
        </div>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
        >
          Skip to content
        </a>
        <Providers>
          <header className="site-top pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-5 sm:px-6">
            <MenuNotch />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
