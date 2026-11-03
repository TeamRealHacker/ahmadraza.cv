import { projects as SEED, type Project } from "@/data/projects";
import { getStore } from "@/lib/storage";

/**
 * Projects are editable from the admin console. On Cloudflare they live in the
 * D1 `projects` table; locally they fall back to `data/projects.json`.
 * Until the first change, the compiled seed list is used.
 */
export async function getProjects(): Promise<Project[]> {
  const overrides = await (await getStore()).getProjects();
  return overrides?.length ? overrides : SEED;
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}

async function save(list: Project[]): Promise<void> {
  await (await getStore()).setProjects(list);
}

const clean = (value: unknown, max = 240) => String(value ?? "").trim().slice(0, max);
const safeImage = (value: unknown) => {
  const v = clean(value, 200);
  return v.startsWith("/images/") || v.startsWith("https://") ? v : "/images/phone-app.webp";
};
const safeHref = (value: unknown) => {
  const v = clean(value, 300);
  return /^https?:\/\//.test(v) ? v : "";
};
const safeAccent = (value: unknown) => {
  const v = clean(value, 9);
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : "#a78bfa";
};
const safeSlug = (value: unknown) => clean(value, 48).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

function build(input: Record<string, unknown>, index: number): Project | null {
  const slug = safeSlug(input.slug);
  if (slug.length < 2) return null;
  const highlights = Array.isArray(input.highlights)
    ? (input.highlights as unknown[]).map((h) => clean(h, 120)).filter(Boolean).slice(0, 6)
    : clean(input.highlights, 400).split(/[,\n]/).map((h) => h.trim()).filter(Boolean).slice(0, 6);
  const stack = Array.isArray(input.stack)
    ? (input.stack as unknown[]).map((h) => clean(h, 60)).filter(Boolean).slice(0, 8)
    : clean(input.stack, 300).split(/[,\n]/).map((h) => h.trim()).filter(Boolean).slice(0, 8);
  const title = clean(input.title, 80) || "Untitled project";
  const description = clean(input.description, 600) || "A project by Ahmad Raza.";
  return {
    slug,
    number: clean(input.number, 4) || String(index + 1).padStart(2, "0"),
    title,
    tagline: clean(input.tagline, 120) || "Selected work",
    description,
    longDescription: clean(input.longDescription, 1200) || description,
    highlights: highlights.length ? highlights : ["Designed and shipped end to end"],
    image: safeImage(input.image),
    href: safeHref(input.href),
    stack: stack.length ? stack : ["Web"],
    year: clean(input.year, 8) || String(new Date().getFullYear()),
    role: clean(input.role, 80) || "Design & Build",
    client: clean(input.client, 80) || "Personal project",
    featured: Boolean(input.featured),
    accent: safeAccent(input.accent),
  };
}

/** Creates a project, or replaces an existing one with the same slug. */
export async function upsertProject(input: Record<string, unknown>): Promise<Project[] | null> {
  const list = await getProjects();
  const slug = safeSlug(input.slug);
  const existingIndex = list.findIndex((p) => p.slug === slug);
  const index = existingIndex >= 0 ? existingIndex : list.length;
  const next = build({ ...(existingIndex >= 0 ? list[existingIndex] : {}), ...input }, index);
  if (!next) return null;
  const copy = [...list];
  if (existingIndex >= 0) copy[existingIndex] = next;
  else copy.push(next);
  await save(copy);
  return copy;
}

export async function deleteProject(slug: string): Promise<Project[] | null> {
  const list = await getProjects();
  if (!list.some((p) => p.slug === slug)) return null;
  const next = list.filter((p) => p.slug !== slug);
  await save(next);
  return next;
}

export async function resetProjects(): Promise<Project[]> {
  await save(SEED);
  return SEED;
}
