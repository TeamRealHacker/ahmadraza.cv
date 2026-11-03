import { Hero } from "@/components/hero";
import { GithubGraph } from "@/components/github-graph";
import { ProfileHeader } from "@/components/profile-header";
import { Projects } from "@/components/projects";
import { GithubRepos } from "@/components/github-repos";
import { SiteTour } from "@/components/site-tour";
import { Footer } from "@/components/footer";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects-store";

/* Projects can be published from the admin console at runtime. */
export const dynamic = "force-dynamic";

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
        <GithubRepos />
        <SiteTour />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
