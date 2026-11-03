import { SKIES, SKY_STORAGE_KEY, type SkyId } from "@/data/skies";

/** Same-tab sky changes (the native `storage` event only fires in other tabs). */
export const SKY_EVENT = "ar:sky";

export function isValidSky(id: unknown): id is SkyId {
  return typeof id === "string" && SKIES.some((s) => s.id === id);
}

export function getSkyTheme(): SkyId {
  try {
    const saved = window.localStorage.getItem(SKY_STORAGE_KEY);
    return isValidSky(saved) ? saved : "space";
  } catch {
    return "space";
  }
}

/** Cycle to the next sky — used by the right-click quick menu on any page. */
export function cycleSkyTheme(): SkyId {
  const current = getSkyTheme();
  const i = SKIES.findIndex((s) => s.id === current);
  const next = SKIES[(i + 1) % SKIES.length].id;
  setSkyTheme(next);
  return next;
}

/** Persist the choice and let every page's ambient background react instantly. */
export function setSkyTheme(id: SkyId) {
  try {
    window.localStorage.setItem(SKY_STORAGE_KEY, id);
  } catch {
    /* storage unavailable — the choice still applies for this visit */
  }
  window.dispatchEvent(new CustomEvent(SKY_EVENT, { detail: id }));
}
