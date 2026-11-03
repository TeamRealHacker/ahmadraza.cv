"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AutoVideo, TOUR_VIDEO } from "./project-video";

const VideoModal = dynamic(() => import("./video-modal").then((m) => m.VideoModal), { ssr: false });

/** A recorded scroll-through of the live site, already playing in place. */
export function SiteTour() {
  const [open, setOpen] = useState(false);

  return (
    <section id="tour" className="tour-section" aria-labelledby="tour-title">
      <div className="tour-inner">
        <div className="tour-copy" data-reveal>
          <p className="tour-kicker"><span aria-hidden="true" /> The whole thing</p>
          <h2 id="tour-title" className="tour-title">In twenty<br /><em>seconds.</em></h2>
          <p className="tour-sub">A recorded scroll-through of every page — home, work, about, life and a case study. No mockups. The real site, in motion.</p>
          <Link href="/work" className="tour-link">Explore the work <ArrowUpRight size={15} /></Link>
        </div>

        <div className="tour-frame" data-reveal>
          <AutoVideo
            video={TOUR_VIDEO}
            startAt={0.9}
            className="tour-video"
            showRec={false}
            onExpand={() => setOpen(true)}
          />
          <span className="tour-rec" aria-hidden="true"><i /> REC</span>
          {open && <VideoModal video={TOUR_VIDEO} onClose={() => setOpen(false)} />}
        </div>
      </div>
    </section>
  );
}
