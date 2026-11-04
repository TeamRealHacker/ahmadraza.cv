import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { NextProject } from "@/components/next-project";
import { ProjectTheme } from "@/components/project-theme";
import { Footer } from "@/components/footer";
import { getProjects } from "@/lib/projects-store";
import { ProjectVideoFrame } from "@/components/project-video";
import { PhoneFrame } from "@/components/phone-frame";
import { site } from "@/data/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProjects()).find((x) => x.slug === slug);
  if (!p) return { title: "Project not found" };
  return {
    title: `${p.title} — ${p.tagline}`,
    description: p.description.slice(0, 180),
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} — ${site.name}`, description: p.description.slice(0, 180), images: [p.image] },
  };
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const all = await getProjects();
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();
  const next = all[(all.findIndex((x) => x.slug === p.slug) + 1) % all.length];

  return (
    <>
      <ProjectTheme accent={p.accent} slug={p.slug} />
      <main id="main" className="mx-auto max-w-5xl px-5 pt-28 sm:px-8 sm:pt-36">
        <Link href="/work" className="case-back"><ArrowLeft size={15} /> All work</Link>

        <header className="case-header" style={{ "--accent-project": p.accent } as CSSProperties}>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Case study</p>
          <h1 className="case-title">{p.title}</h1>
          <p className="case-tagline">{p.tagline}</p>
        </header>

        {p.slug === "kite" ? (
          <PhoneFrame label="Kite — running on Android">
            <ProjectVideoFrame slug={p.slug} image={p.image} alt={`${p.title} — ${p.tagline}`} sizes="(max-width: 640px) 80vw, 300px" priority />
          </PhoneFrame>
        ) : (
        <div className="case-showcase">
          <div className="case-bar">
            <span className="project-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="project-url">{p.title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.app</span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Preview</span>
          </div>
          <div className="case-image">
            <ProjectVideoFrame slug={p.slug} image={p.image} alt={`${p.title} — ${p.tagline}`} sizes="(max-width: 1024px) 100vw, 960px" priority />
          </div>
        </div>
        )}

        <div className="case-body">
          <div>
            <h2 className="case-h2">What it does</h2>
            <ul className="case-highlights">
              {p.highlights.slice(0, 3).map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
          <div>
            <p className="case-description">{p.description}</p>
            <div className="case-actions">
              {p.href && (
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="case-button-primary">
                  Visit live site <ArrowUpRight size={16} />
                </a>
              )}
              <a href={`mailto:${site.email}`} className="case-button">Start a project <ArrowRight size={16} /></a>
            </div>
          </div>
        </div>

        <NextProject title={next.title} slug={next.slug} image={next.image} accent={next.accent} />

      </main>
      <Footer />
    </>
  );
}
