import { ArrowUp, ArrowUpRight } from "lucide-react";
import { MatrixPills } from "./matrix-pills";
import { VisitorCounter } from "./visitor-counter";
import { SocialIcon } from "./icons";
import { site } from "@/data/site";

/** Clean footer: one bottom row, nothing repeated. */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-head" data-reveal>
        <h2 className="footer-title">Let&apos;s build<br /><em>something real</em></h2>
        <p className="footer-sub">One message is enough. Tell me the idea and I&apos;ll take it from there.</p>
        <a href={`mailto:${site.email}`} className="footer-cta">
          Say hello <ArrowUpRight size={17} />
        </a>
        <a href={`mailto:${site.email}`} className="footer-mail-link">{site.email}</a>
      </div>

      <MatrixPills />

      <div className="footer-end" data-reveal>
        <div className="footer-end-row">
          <p className="footer-meta">
            © {new Date().getFullYear()} {site.name} <span aria-hidden="true">·</span> {site.location}
          </p>
          <ul className="footer-links" aria-label="Social links">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  <SocialIcon name={s.icon} width={16} height={16} />
                </a>
              </li>
            ))}
          </ul>
          <VisitorCounter />
          <a href="#main" className="footer-top">Back to top <ArrowUp size={13} /></a>
        </div>

        <div className="footer-wordmark" aria-hidden="true">{site.name}</div>
      </div>
    </footer>
  );
}
