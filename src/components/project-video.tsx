"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { projectVideo, type ProjectVideo } from "@/data/project-videos";

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
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
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
  }, [video.src]);

  return (
    <>
      <video
        ref={ref}
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
        aria-label={`${video.title} — recorded preview, playing automatically`}
      />
      {showRec && <span className="ar-video-rec" aria-hidden="true"><i /> REC</span>}
      {children}
      {onExpand && (
        <button type="button" className="ar-video-expand" onClick={onExpand} aria-label={`Open ${video.title} full screen`} title="Full screen">
          <Maximize2 size={13} />
        </button>
      )}
    </>
  );
}

/** Full-screen player with controls — an optional extra, never required to watch. */
export function VideoModal({ video, onClose }: { video: VideoInfo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="project-video-modal" role="dialog" aria-modal="true" aria-label={`${video.title} recording`} onClick={onClose}>
      <div className="project-video-modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="project-video-modal-head">
          <div>
            <p>{video.kind} · recorded from the live build</p>
            <h3>{video.title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close recording"><X size={18} /></button>
        </div>
        <video
          src={`${video.src}#t=${video.startAt ?? 1.2}`}
          poster={video.poster}
          controls
          autoPlay
          loop
          playsInline
          preload="metadata"
        />
        <p className="project-video-modal-foot">{video.source} · Esc to close</p>
      </div>
    </div>,
    document.body,
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
