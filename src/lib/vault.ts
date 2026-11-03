/**
 * Vault / admin gate — paths and riddle text only.
 *
 * Nothing in this file is a credential. There is no admin token and no key
 * hash here: unlocking is checked server-side in /api/admin/unlock, and the
 * admin API only accepts the HttpOnly session cookie that route sets.
 * This file is safe to ship to the browser.
 */
export const VAULT_PATH = "/vault/9f4c2e";
export const ADMIN_PATH = "/admin";

export const VAULT_RIDDLE =
  "A door that no map lists. Three keys: the count, the creed, the choice. Join them as one word.";

/** Vague pointers shown on the gate itself — no explicit clues. */
export const VAULT_HINT_LOCATIONS = [
  "count — something counted twice, in two different places.",
  "creed — say the banner out loud; one word survives.",
  "choice — a figure from a film, drawn at the very end of the site.",
] as const;
