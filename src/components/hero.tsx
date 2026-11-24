import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { SocialIcon } from "./icons";
import { site } from "@/data/site";
import { projects } from "@/data/projects";

const HEADING = "I build software that actually ships.";

/**
 * Editorial hero: eyebrow + availability chip, one clear headline, the bio,
 * two CTAs — and a profile card (portrait, role, socials) beside it.
 * Pure CSS background (dot grid + glows), no wallpapers, no canvas: the
 * first paint is instant and scrolling stays smooth.
 */
export function Hero() {
  return (
    <section aria-label="Introduction" className="hero section">
      <div className="hero-grid">
        <div>
          <p className="hero-eyebrow">
            <span className="hero-status">
              <span className="hero-status-dot" aria-hidden="true" />
              Available for new work
            </span>
            <span>{site.name} — {site.location}</span>
          </p>

          <h1 className="hero-title" aria-label={HEADING}>
            I build software that <em>actually ships.</em>
          </h1>

          <p className="hero-sub">
            Founder &amp; developer at <strong>RealHackers</strong> — premium websites, AI-powered
            tools, desktop apps and automation systems. Self-taught, obsessed with details,
            performance and things that just work.
          </p>

          <div className="hero-cta-row">
            <Link href="/work" className="btn btn-primary">
              See the work <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <a href={`mailto:${site.email}`} className="btn">
              Say hello
            </a>
          </div>

          <p className="hero-meta">
            <span>{site.domain}</span>
            <span aria-hidden="true" className="hero-meta-sep">/</span>
            <a href={`https://github.com/${site.handle}`} target="_blank" rel="noopener noreferrer">
              @{site.handle}
            </a>
            <span aria-hidden="true" className="hero-meta-sep">/</span>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>

        <aside className="hero-card" aria-label="Profile">
          <div className="hero-portrait">
            <Image
              src="/images/avatar.webp"
              alt={`Portrait of ${site.name}`}
              width={440}
              height={440}
              priority
              sizes="(max-width: 960px) 320px, 380px"
            />
          </div>
          <h2 className="hero-card-name">{site.name}</h2>
          <p className="hero-card-role">{site.role} @ RealHackers</p>
          <div className="hero-card-row">
            <span className="hero-card-location">
              <MapPin size={12} aria-hidden="true" /> {site.location}
            </span>
            <div className="hero-card-socials">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  <SocialIcon name={s.icon} width={16} height={16} />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Stats — real <ul> markup with visible labels, so it can never
          render as run-together text. */}
      <ul className="hero-stats" aria-label="At a glance">
        <li className="hero-stat">
          <span className="hero-stat-num">{String(projects.length).padStart(2, "0")}</span>
          <span className="hero-stat-label">Projects shipped</span>
        </li>
        <li className="hero-stat">
          <span className="hero-stat-num">{String(site.skills.length).padStart(2, "0")}</span>
          <span className="hero-stat-label">Tools in the kit</span>
        </li>
        <li className="hero-stat">
          <span className="hero-stat-num">01</span>
          <span className="hero-stat-label">Human behind it all</span>
        </li>
      </ul>
    </section>
  );
}
