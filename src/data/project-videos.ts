/** Short screen recordings attached to each project. Posters reuse the
 *  existing case-study screenshots, so no extra image files are needed. */
export type ProjectVideo = {
  slug: string;
  title: string;
  src: string;
  poster: string;
  kind: "Live site" | "Case study";
  source: string;
};

export const PROJECT_VIDEOS: ProjectVideo[] = [
  { slug: "centerface-ai", title: "CenterFace Ai", src: "/videos/project-centerface-ai.webm", poster: "/images/centerface-ai.webp", kind: "Live site", source: "centerface.web.app" },
  { slug: "auto-max", title: "Auto Max", src: "/videos/project-auto-max.webm", poster: "/images/auto-max.webp", kind: "Live site", source: "aut0max.web.app" },
  { slug: "realxrtts", title: "RealXrTTs", src: "/videos/project-realxrtts.webm", poster: "/images/realxrtts.webp", kind: "Live site", source: "real-xr-tts-3o8s.vercel.app" },
  { slug: "danger-agent-x", title: "Danger Agent X", src: "/videos/project-danger-agent-x.webm", poster: "/images/danger-agent-x.webp", kind: "Live site", source: "dangeragentx.web.app" },
  { slug: "minal-enterprises", title: "Minal Enterprises", src: "/videos/project-minal-enterprises.webm", poster: "/images/minal-enterprises.webp", kind: "Live site", source: "minalenterprises.org" },
  { slug: "tark-place", title: "Tark Place", src: "/videos/project-tark-place.webm", poster: "/images/tark-place.webp", kind: "Case study", source: "/work/tark-place" },
  { slug: "kite", title: "Kite", src: "/videos/project-kite.webm", poster: "/images/kite-app.webp", kind: "Case study", source: "/work/kite" },
];

export function projectVideo(slug: string): ProjectVideo | undefined {
  return PROJECT_VIDEOS.find((v) => v.slug === slug);
}
