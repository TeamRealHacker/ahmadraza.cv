import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const ogSize = { width: 1200, height: 630 };

export function renderOg(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0b0d",
          color: "#ecebe6",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(236,225,196,0.22), rgba(11,11,13,0) 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#8b8a85" }}>
          <svg width="36" height="36" viewBox="0 0 24 24">
            <path d="M3.5 18.5 2.5 7l5.2 4.6L12 4l4.3 7.6L21.5 7l-1 11.5h-17Z" fill="#ecebe6" />
          </svg>
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 34, color: "#8b8a85" }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 26, color: "#8b8a85" }}>{site.domain}</div>
      </div>
    ),
    ogSize,
  );
}
