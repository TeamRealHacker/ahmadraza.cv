import { ogSize, renderOg } from "@/lib/og";

export const alt = "Life — moments from Ahmad Raza";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Life, unfiltered.", "Random moments, quietly collected.");
}
