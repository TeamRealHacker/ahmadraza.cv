import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { EXPERIENCE } from "@/data/experience";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Experience",
  description: `Where ${site.name} has worked — Team RealHackers, WASA Faisalabad, and Minal Enterprises.`,
  alternates: { canonical: "/experience" },
  openGraph: {
    title: `Experience — ${site.name}`,
    description: "Where Ahmad Raza has worked, all in one place.",
    images: ["/images/avatar.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: `Experience — ${site.name}`,
    description: "Where Ahmad Raza has worked, all in one place.",
    images: ["/images/avatar.webp"],
  },
};

/**
 * Experience gets its own page (not a cramped grid inside About):
 * one full-width row per place, period as a pill (never a vertical strip),
 * and no repeated "Worked with" — the description already says it.
 * Entries only carry dates/roles Ahmad actually gave; WASA and Minal
 * show location and sector instead of invented titles.
 */
export default function ExperiencePage() {
  return (
    <>
      <main id="main">
        <section className="projects-section">
          <div className="projects-head" data-reveal>
            <div className="work-head">
              <h1 className="work-head-title work-head-title--sm">
                Exper<em>ience</em>
              </h1>
              <p className="work-head-note">Every place, client and collaboration — all in one place.</p>
            </div>
          </div>

          <ul className="exp-list">
            {EXPERIENCE.map((e, i) => (
              <li key={e.org} className="exp-card" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="exp-meta">
                  {e.period && <span className="exp-period">{e.period}</span>}
                  {!e.period && e.sector && <span className="exp-period exp-period--muted">{e.sector}</span>}
                  <span className="exp-location">{e.location}</span>
                </div>
                <div className="exp-body">
                  <h2 className="exp-org">{e.org}</h2>
                  {e.role !== "Worked with" && <p className="exp-role">{e.role}</p>}
                  <p className="exp-note">{e.note}</p>
                  {e.sector && e.period && <p className="exp-sector">{e.sector}</p>}
                </div>
              </li>
            ))}
          </ul>

          <p className="exp-footnote" data-reveal>
            More experience gets added here as it comes.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
