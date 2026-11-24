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
  children?: ReactNode;
};

/**
 * A screen recording that is ALREADY PLAYING — no play button, no click needed.
 * Muted + looped + inline so browsers allow autoplay; a ref effect re-kicks
 * playback because React does not always emit the `muted` attribute in SSR HTML.
 *
 * Lazy by design: no video bytes are fetched until the player is near the
 * viewport (IntersectionObserver, 400px margin). Once mounted it also PAUSES
 * when scrolled away, so offscreen recordings stop decoding instead of
 * looping forever in the background. Reduced-motion users and failed loads
 * fall back to the static poster — the "Loading recording…" hint only ever
 * appears while bytes are genuinely being fetched, so it can never get stuck.
 */
export function AutoVideo({
  video,
  startAt = 1.2,
  className = "ar-video-fill",
  controls = false,
  onExpand,
  showRec = false,
  children,
}: AutoVideoProps) {
  const targetRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);

  /* Reduced-motion users get the static poster — no autoplaying video at all. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* One observer for the whole lifecycle. It re-runs when `started` swaps the
     observed element from the placeholder <img> to the real <video>, so
     leaving the viewport reliably pauses the player. */
  useEffect(() => {
    const el = targetRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const kick = () => {
      const v = videoRef.current;
      if (!v) return;
      // Some browsers ignore the SSR `muted` attribute; set the property too.
      v.muted = true;
      const promise = v.play();
      if (promise && typeof promise.catch === "function") promise.catch(() => {});
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          kick();
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const v = videoRef.current;
    if (!v) return;
    const kick = () => {
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
  }, [video.src, started]);

  const expand = onExpand ? (
    <button type="button" className="ar-video-expand" onClick={onExpand} aria-label={`Open ${video.title} full screen`} title="Full screen">
      <Maximize2 size={13} />
    </button>
  ) : null;

  /* Poster-only states: before the player reaches the viewport, for
     reduced-motion users, or when the recording failed to load. No loading
     badge here — nothing is loading, and crawlers/no-JS visitors should not
     see a wall of "Loading recording…" strings. */
  if (!started || reduced || failed) {
    return (
      <>
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
        className={className}
        src={`${video.src}#t=${startAt}`}
        poster={video.poster}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        preload="metadata"
        disablePictureInPicture
        onCanPlay={() => setCanPlay(true)}
        onLoadedData={() => setCanPlay(true)}
        onError={() => setFailed(true)}
        aria-label={`${video.title} — recorded preview, playing automatically`}
      />
      {!canPlay && <span className="ar-video-loading" aria-hidden="true">Loading recording…</span>}
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
}: {
  slug: string;
  image: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  startAt?: number;
}) {
  const video: ProjectVideo | undefined = projectVideo(slug);
  if (!video) {
    return <Image src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />;
  }
  return <AutoVideo video={video} startAt={startAt} />;
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
