import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe, Mail, MapPin } from "lucide-react";
import { GithubIcon } from "./icons";
import { site } from "@/data/site";
import { projects } from "@/data/projects";

export function ProfileHeader() {
  return (
    <section
      id="main-content"
      aria-labelledby="profile-name"
      className="profile-editorial relative z-10 mx-auto max-w-5xl scroll-mt-24 px-5 pt-8 sm:px-8 sm:pt-10"
    >
      <div className="profile-top" data-reveal>
        <div className="profile-portrait">
          <Image
            src="/images/avatar.webp"
            alt={`Portrait of ${site.name}`}
            width={400}
            height={400}
            sizes="(max-width: 640px) 96px, 176px"
          />
        </div>

        <div className="profile-main">

          <h2 id="profile-name" className="profile-name">{site.name}</h2>
          <p className="profile-handle">@{site.handle} <span aria-hidden="true">/</span> {site.role}</p>

          <p className="profile-bio">{site.bio}</p>

          <div className="profile-links">
            <Link href="/work" className="profile-tagline">
              {site.tagline} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <div className="profile-actions">
              <a href={`mailto:${site.email}`} className="profile-button">
                <Mail size={15} /> <span className="hidden sm:inline">Say hello</span><span className="sm:hidden">Hello</span>
              </a>
              <a href={site.socials[0].href} target="_blank" rel="noopener noreferrer" className="profile-button profile-button-primary">
                <GithubIcon width={15} height={15} /> Follow
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-foot">
        <ul className="profile-meta">
          <li><MapPin size={13} /> {site.location}</li>
          <li><Globe size={13} /><a href={site.url} className="hover:text-fg">{site.domain}</a></li>
        </ul>
        <dl className="profile-stats">
          <div><dd>{String(projects.length).padStart(2, "0")}</dd><dt>projects</dt></div>
          <div><dd>{String(site.skills.length).padStart(2, "0")}</dd><dt>skills</dt></div>
        </dl>
      </div>
    </section>
  );
}
