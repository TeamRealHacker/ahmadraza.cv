import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { GithubGraph } from "@/components/github-graph";
import { ProfileHeader } from "@/components/profile-header";
import { Projects } from "@/components/projects";
import { GithubRepos } from "@/components/github-repos";
import { Reviews } from "@/components/reviews";

import Link from "next/link";
import { Footer } from "@/components/footer";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects-store";

/* Projects can be published from the admin console at runtime. */
export const revalidate = 3600;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  alternateName: site.handle,
  jobTitle: site.role,
  description: site.description,
  image: `${site.url}/images/avatar.webp`,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Faisalabad", addressRegion: "Punjab", addressCountry: "PK" },
  knowsAbout: [...site.skills],
  sameAs: site.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
};

export default async function HomePage() {
  const allProjects = await getProjects();
  return (
    <>
      <main id="main">
        <Hero />
        <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8" data-reveal>
          <GithubGraph />
        </div>
        <ProfileHeader />
        <Projects projects={allProjects} />
        <section aria-label="Experience" className="mx-auto max-w-5xl px-5 sm:px-8" data-reveal>
          <Link
            href="/experience"
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-5 transition hover:-translate-y-0.5"
          >
            <span>
              <span className="text-xs uppercase tracking-[0.16em] text-muted">Where I&apos;ve worked</span>
              <span className="mt-1 block text-xl font-semibold">Experience</span>
              <span className="mt-1 block text-sm text-muted">Team RealHackers · WASA, Faisalabad · Minal Enterprises</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs">
              See full experience <ArrowUpRight size={12} />
            </span>
          </Link>
        </section>
        <Reviews />
        <GithubRepos />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
