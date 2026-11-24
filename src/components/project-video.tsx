/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Maximize2, Play } from "lucide-react";
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

/**
 * HOW RECORDINGS LOAD NOW (this used to be the "stuck Loading recording…"
 * bug):
 *
 *  - hover mode (cards on the home / work pages): the poster image renders
 *    instantly and ZERO video bytes are fetched until the visitor actually
 *    hovers the card. The video mounts on pointer-enter, unmounts on leave.
 *  - eager mode (case study pages): the recording mounts when it scrolls
 *    into view and plays muted + looped, as before.
 *
 * In both modes the "Loading" pill only exists while a mounted video is
 * still buffering, and it disappears for good on error — the poster always
 * stays underneath, so nothing is ever stuck or blank.
 */
export function AutoVideo({
  video,
  startAt = 1.2,
  className = "ar-video-fill",
  controls = false,
  onExpand,
  showRec = false,
  children,
  mode = "eager",
}: {
  video: VideoInfo;
  startAt?: number;
  className?: string;
  controls?: boolean;
  onExpand?: () => void;
  showRec?: boolean;
  children?: ReactNode;
  mode?: "hover" | "eager";
}) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(mode === "eager" && !controls ? false : true);
  const [armed, setArmed] = useState(mode === "eager"); // hover mode: armed by pointer
  const [canPlay, setCanPlay] = useState(false);
  const [failed, setFailed] = useState(false);

  /* eager overlay mode: mount when near the viewport. The observer needs a
     real layout box, which is why the overlay wrapper is .ar-video-box
     (position: absolute) rather than display: contents. */
  useEffect(() => {
    if (mode !== "eager" || controls) return;
    const el = targetRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, controls]);

  /* (Re)start playback whenever the element mounts. */
  useEffect(() => {
    if (!inView || !armed) return;
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
    return () => {
      v.removeEventListener("loadeddata", kick);
      v.removeEventListener("canplay", kick);
    };
  }, [inView, armed]);

  const showVideo = inView && armed && !failed;
  const buffering = showVideo && !canPlay;
  /* `controls` players (the admin console tour) render in normal document
     flow; overlay cards render absolutely inside a positioned frame. */
  const flow = Boolean(controls);

  const expand = onExpand ? (
    <button type="button" className="ar-video-expand" onClick={onExpand} aria-label={`Open ${video.title} full screen`} title="Full screen">
      <Maximize2 size={13} />
    </button>
  ) : null;

  if (flow) {
    return (
      <div
        ref={targetRef}
        className="contents"
        onPointerEnter={(e) => {
          if (mode === "hover" && (e.pointerType === "mouse" || e.pointerType === "pen")) setArmed(true);
        }}
        onPointerLeave={() => { if (mode === "hover") setArmed(false); }}
      >
        {showVideo ? (
          <video
            ref={videoRef}
            className={className}
            src={`${video.src}#t=${startAt}`}
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
            aria-label={`${video.title} — recorded preview`}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={video.poster}
            alt=""
            className={className}
            style={{ aspectRatio: "16 / 9", objectFit: "cover" }}
            loading="lazy"
            aria-hidden="true"
          />
        )}
        {children}
        {expand}
      </div>
    );
  }

  return (
    <div
      ref={targetRef}
      className="ar-video-box"
      onPointerEnter={(e) => {
        if (mode === "hover" && (e.pointerType === "mouse" || e.pointerType === "pen")) setArmed(true);
      }}
      onPointerLeave={() => { if (mode === "hover") setArmed(false); }}
      onFocus={() => { if (mode === "hover") setArmed(true); }}
      onBlur={() => { if (mode === "hover") setArmed(false); }}
    >
      {/* Poster is always underneath the video — instant paint, graceful
          fallback if the recording can't load or can't play (e.g. old
          Safari without WebM). */}
      <Image
        src={video.poster}
        alt=""
        fill
        sizes="(max-width: 820px) 100vw, 960px"
        aria-hidden="true"
        className={`ar-poster-fill${showVideo && canPlay ? " opacity-0" : ""}`}
        style={{ transition: "opacity .25s ease" }}
      />

      {showVideo && (
        <video
          ref={videoRef}
          className={className}
          src={`${video.src}#t=${startAt}`}
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
          aria-label={`${video.title} — recorded preview`}
        />
      )}

      {buffering && <span className="ar-video-loading" aria-hidden="true">Loading…</span>}
      {showRec && <span className="ar-video-rec" aria-hidden="true"><i /> REC</span>}
      {mode === "hover" && !showVideo && (
        <span className="ar-video-hover-hint" aria-hidden="true"><Play size={10} /> Hover to play</span>
      )}
      {children}
      {expand}
    </div>
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
  mode = "hover",
}: {
  slug: string;
  image: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  startAt?: number;
  mode?: "hover" | "eager";
}) {
  const video: ProjectVideo | undefined = projectVideo(slug);
  if (!video) {
    return <Image src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />;
  }
  return <AutoVideo video={video} startAt={startAt} mode={mode} />;
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
          <AutoVideo video={video} showRec={false} mode="eager" />
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
