import { Eye, Flame, Heart, Smile, Sparkles } from "lucide-react";

type Props = { name: string; active?: boolean; size?: number; className?: string };

/** Built-in line icons, or the raw emoji glyph for a visitor-added reaction. */
export function ReactionIcon({ name, active, size = 16, className }: Props) {
  const common = { strokeWidth: active ? 2.2 : 1.7, size, className };
  switch (name) {
    case "heart":
      return <Heart {...common} fill={active ? "currentColor" : "none"} />;
    case "fire":
      return <Flame {...common} fill={active ? "currentColor" : "none"} />;
    case "spark":
      return <Sparkles {...common} fill={active ? "currentColor" : "none"} />;
    case "smile":
      return <Smile {...common} />;
    case "eye":
      return <Eye {...common} />;
    default:
      return (
        <span className={className} aria-hidden="true" style={{ fontSize: size, lineHeight: 1, fontFamily: "var(--font-emoji)" }}>
          {name}
        </span>
      );
  }
}
