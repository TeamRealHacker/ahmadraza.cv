"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { VideoInfo } from "./project-video";

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
