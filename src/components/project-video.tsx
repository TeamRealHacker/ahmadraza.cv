/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Maximize2 } from "lucide-react";
import { projectVideo, type ProjectVideo } from "@/data/project-videos";

/** The full-screen modal loads only when someone opens it, never on first paint. */
const VideoModal = dynamic(() => import("./video-modal").then((m) => m.VideoModal), { ssr: false });

export type VideoInfo = {
  title: string;
  src: string;
  poster: string;
  kind: string;
  source: string;
  startAt?: number;
};

/** The full site tour shares the same player as the project recordings. */
export const TOUR_VIDEO: VideoInfo = {
  title: "The whole site",
  src: "/videos/ar-tour.webm",
  poster: "/images/tour-poster.webp",
  kind: "Full site tour",
  source: "home · work · about · life · case study",
  startAt: 0.9,
};

type AutoVideoProps = {
  video: VideoInfo;
  startAt?: number;
  className?: string;
  controls?: boolean;
  onExpand?: () => void;
  showRec?: boolean;
  /** Keep the video invisible until real frames are playing, so the
   *  screenshot underneath is what shows while it loads or buffers. */
  revealOnPlay?: boolean;
  children?: ReactNode;
};

/**
 * A screen recording that is ALREADY PLAYING — no play button, no click needed.
 * Muted + looped + inline so browsers allow autoplay; a ref effect re-kicks
 * playback because React does not always emit the `muted` attribute in SSR HTML.
 *
 * Lazy by design: no video bytes are fetched until the player is near the
 * viewport (IntersectionObserver, 400px margin). Until then the poster shows
 * (the project's real screenshot), so offscreen recordings (the tour, every
 * project below the fold) cost nothing on first paint.
 */
export function AutoVideo({
  video,
  startAt = 1.2,
  className = "ar-video-fill",
  controls = false,
  onExpand,
  showRec = false,
  revealOnPlay = false,
  children,
}: AutoVideoProps) {
  const targetRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) { setInView(true); return; }
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const v = videoRef.current;
    if (!v) return;
    const kick = () => {
      // Some browsers ignore the SSR `muted` attribute; set the property too.
      v.muted = true;
      const promise = v.play();
      if (promise && typeof promise.catch === "function") promise.catch(() => {});
    };
    kick();
    v.addEventListener("loadeddata", kick);
    v.addEventListener("canplay", kick);
    const onVisibility = () => (document.hidden ? v.pause() : kick());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      v.removeEventListener("loadeddata", kick);
      v.removeEventListener("canplay", kick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [video.src, inView]);

  const expand = onExpand ? (
    <button type="button" className="ar-video-expand" onClick={onExpand} aria-label={`Open ${video.title} full screen`} title="Full screen">
      <Maximize2 size={13} />
    </button>
  ) : null;

  if (!inView) {
    return (
      <>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          ref={(el) => { targetRef.current = el; }}
          src={video.poster}
          alt=""
          aria-hidden="true"
          className={className}
          loading="lazy"
        />
        {showRec && <span className="ar-video-rec" aria-hidden="true"><i /> REC</span>}
        {children}
        {expand}
      </>
    );
  }

  return (
    <>
      <video
        ref={(el) => { videoRef.current = el; targetRef.current = el; }}
        className={revealOnPlay ? `${className} ar-video-reveal${playing ? " is-playing" : ""}` : className}
        onTimeUpdate={revealOnPlay ? (e) => {
          const v = e.currentTarget;
          // On each loop, skip the recording's dark lead-in.
          if (v.currentTime < startAt - 0.05) { v.currentTime = startAt; return; }
          if (!playing && v.currentTime >= startAt + 0.4) setPlaying(true);
        } : undefined}
        src={`${video.src}#t=${startAt}`}
        poster={video.poster}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        preload="metadata"
        disablePictureInPicture
        aria-label={`${video.title} — recorded preview, playing automatically`}
      />
      {showRec && <span className="ar-video-rec" aria-hidden="true"><i /> REC</span>}
      {children}
      {expand}
    </>
  );
}

/**
 * Replaces a project's static screenshot inside an existing frame. Projects
 * without a recording keep their Next/Image screenshot.
 */
export function ProjectVideoFrame({
  slug,
  image,
  alt,
  sizes,
  priority = false,
  startAt = 1.2,
  hover = false,
}: {
  slug: string;
  image: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  startAt?: number;
  /** Cards: show the screenshot, play the recording only while hovered. */
  hover?: boolean;
}) {
  const video: ProjectVideo | undefined = projectVideo(slug);
  const still = <Image src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />;
  if (!video) return still;
  if (hover) {
    return (
      <>
        {still}
        <HoverVideo video={video} startAt={startAt} />
      </>
    );
  }
  /* The real screenshot is always painted first; the recording fades in on
     top only once it is actually playing. */
  return (
    <>
      {still}
      <AutoVideo video={video} startAt={startAt} revealOnPlay />
    </>
  );
}

/**
 * A recording that stays dormant (no bytes fetched) until the card it sits in
 * is hovered on a pointer device, then fades in over the screenshot and
 * pauses again on leave. Touch devices simply keep the real screenshot.
 */
function HoverVideo({ video, startAt }: { video: ProjectVideo; startAt: number }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    const host = v?.closest("a, article") as HTMLElement | null;
    if (!v || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const enter = () => {
      setArmed(true);
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    const leave = () => { v.pause(); setPlaying(false); };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={`ar-video-fill ar-video-reveal${playing ? " is-playing" : ""}`}
      src={armed ? `${video.src}#t=${startAt}` : undefined}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        if (v.currentTime < startAt - 0.05) { v.currentTime = startAt; return; }
        if (!playing && !v.paused && v.currentTime >= startAt + 0.3) setPlaying(true);
      }}
    />
  );
}

type Props = { slug: string; variant?: "button" | "card" };

/** Small "full screen" affordance in the caption / an auto-playing admin tile. */
export function WatchProject({ slug, variant = "button" }: Props) {
  const video = projectVideo(slug);
  const [open, setOpen] = useState(false);
  if (!video) return null;

  if (variant === "card") {
    return (
      <>
        <button
          type="button"
          className="project-video-card"
          onClick={() => setOpen(true)}
          aria-label={`Open the ${video.title} recording full screen`}
          title={`${video.title} — full screen`}
        >
          <AutoVideo video={video} showRec={false} />
          <span className="project-video-card-overlay">
            <span className="project-video-card-expand"><Maximize2 size={14} /></span>
            <strong>{video.title}</strong>
            <small>{video.kind} · {video.source}</small>
          </span>
        </button>
        {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className="project-video-btn"
        onClick={() => setOpen(true)}
        aria-label={`Open the ${video.title} recording full screen`}
        title="Full screen recording"
      >
        <Maximize2 size={12} /> Full screen
      </button>
      {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
    </>
  );
}
