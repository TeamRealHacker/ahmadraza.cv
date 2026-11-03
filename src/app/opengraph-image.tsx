import { ogSize, renderOg } from "@/lib/og";

export const alt = "Ahmad Raza — Developer & Designer";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Ahmad Raza", "Founder & Developer · RealHackers");
}
