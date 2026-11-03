/** Banner sky themes — shared by the home banner, /about and /life. */
export const SKY_STORAGE_KEY = "ar_sky_theme";

export type SkyId = "space" | "redmoon" | "sun" | "sunset" | "midnight";

/** Each chip uses a real NASA / spacecraft photo of a celestial body. */
export const SKIES: {
  id: SkyId;
  label: string;
  planet: string;
  accent: string;
  focus: string;
}[] = [
  { id: "space", label: "Space", planet: "/images/planet-space.webp", accent: "#a78bfa", focus: "50% 50%" },
  { id: "redmoon", label: "Red Moon", planet: "/images/planet-redmoon.webp", accent: "#ff8258", focus: "50% 50%" },
  { id: "sun", label: "Sun", planet: "/images/planet-sun.webp", accent: "#ffc46b", focus: "50% 50%" },
  { id: "sunset", label: "Sunset", planet: "/images/planet-sunset.webp", accent: "#ff9066", focus: "50% 50%" },
  { id: "midnight", label: "Midnight", planet: "/images/planet-midnight.webp", accent: "#63d6e8", focus: "70% 50%" },
];

export const SKY_ACCENTS: Record<SkyId, string> = {
  space: "#a78bfa",
  redmoon: "#ff8258",
  sun: "#ffc46b",
  sunset: "#ff9066",
  midnight: "#63d6e8",
};
