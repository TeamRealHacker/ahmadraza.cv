import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { ProjectShowcase } from "@/components/project-showcase";
import { getProjects } from "@/lib/projects-store";

/* Projects can be published from the admin console at runtime. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects by Ahmad Raza — AI tools, web apps, mobile apps and client builds.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const allProjects = await getProjects();
  return (
    <>
      <main id="main" className="work-page">
        <header className="work-page-head" data-reveal>
          <div className="work-head work-head--lg">
            <h1 className="work-head-title">Things I&apos;ve <em>shipped</em></h1>
            <div className="work-head-rule" aria-hidden="true"><span /><span /><span /><span /><span /><i /></div>
            <div className="work-head-foot">
              <p className="work-head-note">
                Web products, AI tools, client builds and a mobile app — designed and shipped end to end.
              </p>
            </div>
          </div>
        </header>
        <ProjectShowcase projects={allProjects} />
      </main>
      <Footer />
    </>
  );
}
