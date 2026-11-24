import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { projects as seedProjects, type Project } from "@/data/projects";
import { ProjectVideoFrame } from "./project-video";
import { PhoneFrame } from "./phone-frame";

type Props = { projects?: Project[]; limit?: number; showMore?: boolean };

/**
 * Editorial project showcase: one full-width cinematic feature followed by
 * alternating split spreads. Recordings play on hover (case study pages use
 * eager autoplay) — see project-video.tsx for the loading strategy.
 */
export function ProjectShowcase({ projects = seedProjects, limit, showMore = false }: Props) {
  const all = projects;
  const list = limit ? all.slice(0, limit) : all;
  const [feature, ...rest] = list;
  const remaining = all.slice(list.length);

  if (!feature) return null;

  const bar = (p: Project) => (
    <div className="showcase-bar" aria-hidden="true">
      <span className="project-dots"><i /><i /><i /></span>
      <span className="project-url">
        {p.href ? p.href.replace(/^https?:\/\//, "").replace(/\/$/, "") : `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.app`}
      </span>
      <span className="showcase-bar-live">{p.year} · {p.role}</span>
    </div>
  );

  return (
    <div className={`showcase-list ${showMore && remaining.length ? "has-more" : ""}`}>
      <article
        className="showcase-feature"
        style={{ "--accent-project": feature.accent } as CSSProperties}
        data-reveal
      >
        <Link href={`/work/${feature.slug}`} className="showcase-media" aria-label={`${feature.title} — view case study`}>
          <div className="showcase-frame">
            {bar(feature)}
            <div className="showcase-screen">
              <ProjectVideoFrame
                slug={feature.slug}
                image={feature.image}
                alt={`${feature.title} — ${feature.tagline}`}
                sizes="(max-width: 1024px) 100vw, 960px"
                mode="hover"
              />
            </div>
          </div>
        </Link>
        <span className="showcase-accent" aria-hidden="true" />

        <div className="showcase-feature-caption">
          <div>
            <h3>{feature.title}</h3>
            <p className="showcase-tagline">{feature.tagline}</p>
          </div>
          <div className="showcase-links">
            <Link href={`/work/${feature.slug}`} className="showcase-open">
              Explore project <ArrowRight size={15} />
            </Link>
            {feature.href && (
              <a href={feature.href} target="_blank" rel="noopener noreferrer" className="showcase-live">
                Live site <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </article>

      {rest.map((p, i) => (
        <article
          key={p.slug}
          className={`showcase-row ${i % 2 ? "is-flipped" : ""}`}
          style={{ "--accent-project": p.accent } as CSSProperties}
          data-reveal
        >
          <Link href={`/work/${p.slug}`} className="showcase-media" aria-label={`${p.title} — view case study`}>
            <div className="showcase-frame">
              {bar(p)}
              {p.slug === "kite" ? (
                <PhoneFrame label="Kite — running on Android">
                  <ProjectVideoFrame
                    slug={p.slug}
                    image={p.image}
                    alt={`${p.title} — ${p.tagline}`}
                    sizes="(max-width: 820px) 80vw, 230px"
                    mode="hover"
                  />
                </PhoneFrame>
              ) : (
                <div className="showcase-screen">
                  <ProjectVideoFrame
                    slug={p.slug}
                    image={p.image}
                    alt={`${p.title} — ${p.tagline}`}
                    sizes="(max-width: 820px) 100vw, 560px"
                    mode="hover"
                  />
                </div>
              )}
            </div>
          </Link>

          <div className="showcase-info">
            <h3 className="showcase-title">{p.title}</h3>
            <p className="showcase-tagline">{p.tagline}</p>
            <div className="showcase-links">
              <Link href={`/work/${p.slug}`} className="showcase-open">
                Explore project <ArrowRight size={15} />
              </Link>
              {p.href && (
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="showcase-live">
                  Live site <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </article>
      ))}

      {showMore && remaining.length > 0 && (
        <div className="showcase-more" data-reveal>
          <div className="showcase-more-head">
            <Link href="/work" className="showcase-more-cta">
              View all projects <ArrowRight size={20} />
            </Link>
          </div>
          <ul className="showcase-more-list">
            {remaining.map((p) => (
              <li key={p.slug}>
                <Link href={`/work/${p.slug}`} style={{ "--accent-project": p.accent } as CSSProperties}>
                  <span className="showcase-more-dot" aria-hidden="true" />
                  {p.title}<ArrowUpRight size={12} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
