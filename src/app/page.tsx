import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { GithubGraph } from "@/components/github-graph";
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
        <Projects projects={allProjects} />
        <div className="section pt-0" data-reveal>
          <GithubGraph />
        </div>
        <section aria-label="Experience" className="section pt-0" data-reveal>
          <Link
            href="/experience"
            className="exp-card group flex flex-wrap items-center justify-between gap-4"
          >
            <span>
              <span className="work-head-kicker">Where I&apos;ve worked</span>
              <span className="mt-2 block text-xl font-semibold">Experience</span>
              <span className="mt-1 block text-sm text-muted">
                Team RealHackers · WASA, Faisalabad · Minal Enterprises
              </span>
            </span>
            <span className="gh-chip">
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
