import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PakistanFlag } from "./icons";
import { ProjectShowcase } from "./project-showcase";
import type { Project } from "@/data/projects";

const HOME_COUNT = 4;

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="projects-section">
      <div className="projects-head" data-reveal>
        <div className="work-head">
          <p className="work-head-kicker"><span className="work-head-bar" aria-hidden="true" /> Selected work <PakistanFlag size={14} className="work-head-flag" /></p>
          <h2 id="projects-title" className="work-head-title work-head-title--sm">
            Things I&apos;ve <em>shipped</em>
          </h2>
          <div className="work-head-rule" aria-hidden="true"><span /><span /><span /><span /><span /><i /></div>
          <p className="work-head-note">A few things I designed, built and actually put out into the world.</p>
        </div>
        <Link href="/work" className="projects-all">
          All work <ArrowRight size={15} />
        </Link>
      </div>
      <ProjectShowcase projects={projects} limit={HOME_COUNT} showMore />
    </section>
  );
}
