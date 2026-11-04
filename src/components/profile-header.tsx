import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe, Mail, MapPin } from "lucide-react";
import { GithubIcon } from "./icons";
import { site } from "@/data/site";
import { projects } from "@/data/projects";

/**
 * Intro block under the banner: portrait, name, bio, two actions, and a
 * quiet meta row. Spacing does the separating — no rules or dividers.
 */
export function ProfileHeader() {
  return (
    <section
      id="main-content"
      aria-labelledby="profile-name"
      className="profile-editorial relative z-10 mx-auto max-w-5xl scroll-mt-24 px-5 sm:px-8"
    >
      <div className="profile-top" data-reveal>
        <div className="profile-portrait">
          <Image
            src="/images/avatar.webp"
            alt={`Portrait of ${site.name}`}
            width={400}
            height={400}
            sizes="(max-width: 640px) 88px, 132px"
          />
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
            <a href={`mailto:${site.email}`} className="profile-button profile-button-primary">
              <Mail size={15} aria-hidden="true" /> Say hello
            </a>
            <a href={site.socials[0].href} target="_blank" rel="noopener noreferrer" className="profile-button">
              <GithubIcon width={15} height={15} /> Follow
            </a>
            <Link href="/work" className="profile-tagline">
              {site.tagline} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="profile-foot">
            <ul className="profile-meta">
              <li><MapPin size={14} aria-hidden="true" /> {site.location}</li>
              <li><Globe size={14} aria-hidden="true" /><a href={site.url}>{site.domain}</a></li>
            </ul>
            <dl className="profile-stats">
              <div><dd>{String(projects.length).padStart(2, "0")}</dd><dt>projects</dt></div>
              <div><dd>{String(site.skills.length).padStart(2, "0")}</dd><dt>skills</dt></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
