import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { AboutContent } from "@/components/about-content";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} — ${site.bio.slice(0, 150)}`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About — ${site.name}`,
    description: site.bio.slice(0, 180),
    images: ["/images/avatar.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: `About — ${site.name}`,
    description: site.bio.slice(0, 180),
    images: ["/images/avatar.webp"],
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutContent />
      <Footer />
    </>
  );
}
