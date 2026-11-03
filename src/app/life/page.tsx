import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { LifeContent } from "@/components/life-content";
import { readBoard } from "@/lib/board";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Life",
  description: `Life from ${site.name} — an empty wall he fills himself. Upload a moment, react with an emoji, or add an animated one.`,
  alternates: { canonical: "/life" },
  openGraph: {
    type: "website",
    url: `${site.url}/life`,
    title: `Life — ${site.name}`,
    description: "An empty wall by default — upload a moment, react with an emoji, or add an animated one.",
    images: [{ url: "/life/opengraph-image", width: 1200, height: 630, alt: "Life — moments from Ahmad Raza" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Life — ${site.name}`,
    description: "An empty wall by default — upload a moment, react with an emoji, or add an animated one.",
    images: ["/life/opengraph-image"],
  },
};

export default async function LifePage() {
  const board = await readBoard();
  return (
    <>
      <LifeContent initialPosts={board.posts} initialCounts={board.counts} />
      <Footer />
    </>
  );
}
