import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { MatrixPills } from "./matrix-pills";
import { VisitorCounter } from "./visitor-counter";
import { SocialIcon } from "./icons";
import { CopyEmail, LocalTime, Magnetic } from "./live-bits";
import { site } from "@/data/site";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Life", href: "/life" },
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
];

/**
 * Footer: a closing line + CTA, the "choose your path" artwork, then a
 * structured base (identity, pages, socials, contact) and a cropped
 * gradient wordmark. Spacing separates the parts — no rules.
 */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-head" data-reveal>
        <h2 className="footer-title">Let&apos;s build<br /><em>something real</em></h2>
        <p className="footer-sub">One message is enough. Tell me the idea and I&apos;ll take it from there.</p>
        <Magnetic>
          <a href={`mailto:${site.email}`} className="footer-cta">
            Say hello <ArrowUpRight size={17} />
          </a>
        </Magnetic>
      </div>

      <MatrixPills />

      <div className="fbase" data-reveal>
        <div className="fbase-grid">
          <div className="fbase-id">
            <Link href="/" className="fbase-brand" aria-label={`${site.name} — home`}>
              <span className="fbase-mark" aria-hidden="true">AR</span>
              <span className="fbase-name">{site.name}</span>
            </Link>
            <p className="fbase-line">{site.tagline}</p>
            <p className="fbase-status">
              <span className="status-dot" aria-hidden="true" />
              Available for work
            </p>
          </div>

          <nav className="fbase-col" aria-label="Footer">
            <p className="fbase-label">Pages</p>
            <ul>
              {NAV.map((l) => (
                <li key={l.href}><Link href={l.href} className="fbase-link">{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="fbase-col">
            <p className="fbase-label">Elsewhere</p>
            <ul>
              {site.socials.filter((s) => s.icon !== "mail").map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fbase-link fbase-social"
                  >
                    <span className="fbase-social-icon" aria-hidden="true"><SocialIcon name={s.icon} width={14} height={14} /></span>
                    {s.label}
                    <ArrowUpRight size={12} className="fbase-social-arrow" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="fbase-col fbase-contact">
            <p className="fbase-label">Contact</p>
            <CopyEmail email={site.email} />
            <p className="fbase-time">
              <span className="fbase-time-label">Faisalabad</span>
              <LocalTime />
            </p>
          </div>
        </div>

        <div className="fbase-bottom">
          <p className="fbase-copy">© {new Date().getFullYear()} {site.name} <span aria-hidden="true">·</span> {site.location}</p>
          <VisitorCounter />
          <a href="#main" className="fbase-top">
            Back to top <span className="fbase-top-icon" aria-hidden="true"><ArrowUp size={13} /></span>
          </a>
        </div>
      </div>

      <div className="footer-wordmark" aria-hidden="true">
        <span>{site.name}</span>
      </div>
    </footer>
  );
}
