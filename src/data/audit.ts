import { projects } from "@/data/projects";
import { SKIES } from "@/data/skies";
import { site } from "@/data/site";

/** Machine-readable site map — powers the admin "Site audit" tab. */
export const PUBLIC_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/work", label: "Work" },
  { path: "/life", label: "Life" },
  { path: "/experience", label: "Experience" },
  ...projects.map((p) => ({ path: `/work/${p.slug}`, label: p.title })),
] as { path: string; label: string }[];

export const HIDDEN_ROUTES = [
  { path: "/vault/9f4c2e", label: "Vault gate" },
  { path: "/admin", label: "Admin console" },
] as { path: string; label: string }[];

export const API_ROUTES = [
  "/api/board", "/api/reactions", "/api/visitors", "/api/github", "/api/health", "/api/admin",
];

export const SITE_FACTS = {
  name: site.name,
  handle: site.handle,
  domain: site.domain,
  url: site.url,
  location: site.location,
  email: site.email,
  skills: [...site.skills],
  socials: site.socials.map((s) => s.label),
  projectCount: projects.length,
  projects: projects.map((p) => ({ slug: p.slug, title: p.title, year: p.year, accent: p.accent })),
  skies: SKIES.map((s) => ({ id: s.id, label: s.label, accent: s.accent })),
  database: "Cloudflare D1 (SQLite) with a local-JSON fallback",
  framework: "Next.js 16 · React 19",
  storage: "D1 binding / D1 REST API / local JSON files in /data + browser localStorage",
};
