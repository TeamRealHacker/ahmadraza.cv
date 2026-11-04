import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bot, Clock, Globe, Hammer, Mail, MapPin, Smartphone, Workflow } from "lucide-react";
import { GithubIcon } from "./icons";
import { CountUp, LocalTime, Magnetic } from "./live-bits";
import { site } from "@/data/site";
import { projects } from "@/data/projects";

/* Small, honest stack row: what the bio and skills already say. */
const STACK = [
  { label: "Web", icon: Globe },
  { label: "AI tools", icon: Bot },
  { label: "Mobile", icon: Smartphone },
  { label: "Automation", icon: Workflow },
];

/**
 * Intro block under the banner: portrait with a slow ring and status dot,
 * name, bio, actions, a row of small info chips and count-up stats.
 */
export function ProfileHeader() {
  return (
    <section
      id="main-content"
      aria-labelledby="profile-name"
      className="profile-editorial relative z-10 mx-auto max-w-5xl scroll-mt-24 px-5 sm:px-8"
    >
      <div className="profile-top" data-reveal>
        <div className="profile-avatar">
          <span className="profile-ring" aria-hidden="true" />
          <div className="profile-portrait">
            <Image
              src="/images/avatar.webp"
              alt={`Portrait of ${site.name}`}
              width={400}
              height={400}
              sizes="(max-width: 640px) 88px, 132px"
            />
          </div>
          <span className="profile-status" title="Available for work"><span className="sr-only">Available for work</span></span>
        </div>

        <div className="profile-main">
          <h2 id="profile-name" className="profile-name">{site.name}</h2>
          <p className="profile-handle">
            <span>@{site.handle}</span>
            <span className="profile-dot" aria-hidden="true" />
            <span>{site.role}</span>
          </p>

          <p className="profile-bio">{site.bio}</p>

          <div className="profile-actions">
            <Magnetic>
              <a href={`mailto:${site.email}`} className="profile-button profile-button-primary">
                <Mail size={15} aria-hidden="true" /> Say hello
              </a>
            </Magnetic>
            <a href={site.socials[0].href} target="_blank" rel="noopener noreferrer" className="profile-button">
              <GithubIcon width={15} height={15} /> Follow
            </a>
            <Link href="/work" className="profile-tagline">
              {site.tagline} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <ul className="profile-chips" aria-label="Quick facts">
            <li className="pchip pchip-avail"><span className="status-dot" aria-hidden="true" /> Available for work</li>
            <li className="pchip"><MapPin size={13} aria-hidden="true" /> {site.location}</li>
            <li className="pchip"><Clock size={13} aria-hidden="true" /> <LocalTime /></li>
            <li className="pchip"><Hammer size={13} aria-hidden="true" /> Building since 2024</li>
            <li className="pchip pchip-stack">
              {STACK.map(({ label, icon: Icon }) => (
                <span key={label} className="pchip-stack-item" title={label}>
                  <Icon size={13} aria-hidden="true" /><span className="pchip-stack-label">{label}</span>
                </span>
              ))}
            </li>
          </ul>

          <dl className="profile-stats">
            <div>
              <dd><CountUp value={projects.length} /></dd>
              <dt>projects shipped</dt>
            </div>
            <div>
              <dd><CountUp value={site.skills.length} /></dd>
              <dt>skills</dt>
            </div>
            <div className="profile-stats-site">
              <dd><Globe size={15} aria-hidden="true" /></dd>
              <dt><a href={site.url}>{site.domain}</a></dt>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
