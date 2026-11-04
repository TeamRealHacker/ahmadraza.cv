import { ArrowUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MatrixPills } from "./matrix-pills";
import { VisitorCounter } from "./visitor-counter";
import { SocialIcon, PakistanFlag } from "./icons";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-head" data-reveal>
        <p className="footer-eyebrow"><span className="footer-eyebrow-line" aria-hidden="true" /> Choose wisely</p>
        <h2 className="footer-title">Let&apos;s build<br /><em>something real</em></h2>
        <p className="footer-sub">One message is enough. Tell me the idea and I&apos;ll take it from there.</p>
        <a href={`mailto:${site.email}`} className="footer-cta">
          Say hello <ArrowUpRight size={17} />
        </a>
        <a href={`mailto:${site.email}`} className="footer-mail-link">{site.email}</a>
      </div>

      <MatrixPills />

      <div className="footer-end" data-reveal>
        <div className="footer-extra">
          <nav className="footer-quicknav" aria-label="Footer navigation">
            <Link href="/">Home</Link>
            <Link href="/work">Work</Link>
            <Link href="/life">Life</Link>
            <Link href="/about">About</Link>
            <Link href="/experience">Experience</Link>
          </nav>
          <p className="footer-signature">
            <span>— Ahmad</span> <PakistanFlag size={14} /> <em>Faisalabad, Pakistan</em>
          </p>
        </div>

        <div className="footer-end-row">
          <p className="footer-meta">
            © {new Date().getFullYear()} {site.name} <PakistanFlag size={15} /> {site.location}
          </p>
          <ul className="footer-links" aria-label="Social links">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  <SocialIcon name={s.icon} width={14} height={14} />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <VisitorCounter />
        </div>

        <div className="footer-wordmark" aria-hidden="true">{site.name}</div>

        <div className="footer-end-line">
          <span>Designed and built in Faisalabad, Pakistan.</span>
          <a href="#main" className="footer-top">Back to top <ArrowUp size={13} /></a>
        </div>
      </div>
    </footer>
  );
}
