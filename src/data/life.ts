/** Posts for the "Life" tab. The wall starts empty on purpose — Ahmad uploads
 *  his own photos with the composer. New posts live in data/board.json (no DB). */
export type LifePost = {
  id: string;
  /** Empty string = a text-only moment (no stock photo is used). */
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  date: string;
};

/** No seeded photographs. The wall belongs entirely to uploaded moments. */
export const lifePosts: LifePost[] = [];

export const reactionOptions = [
  { key: "heart", label: "Love" },
  { key: "fire", label: "Fire" },
  { key: "spark", label: "Magic" },
  { key: "smile", label: "Smile" },
  { key: "eye", label: "Seen" },
] as const;

/** Built-in reaction keys, or any emoji a visitor adds themselves. */
export type ReactionKey = string;

/** A small starter set for the "+" emoji picker. Visitors can also paste any emoji. */
export const emojiChoices = [
  "😀", "😂", "🥹", "😍", "🤩", "🥳", "😎", "🤔", "🫠", "😴", "🤯", "🥺",
  "😭", "😤", "🤝", "👏", "🙌", "💪", "🔥", "✨", "⭐", "💯", "❤️", "🧡",
  "💛", "💚", "💙", "💜", "🚀", "☕", "🌙", "📸", "🎧", "🧠", "👀", "🎉",
] as const;

export type EmojiAnim = "bob" | "wiggle" | "pulse" | "spin" | "flicker" | "float" | "twinkle" | "beat";

/** Animated reaction stickers — CSS motion, no GIFs or network assets. */
export const animatedEmojis: { emoji: string; anim: EmojiAnim; label: string }[] = [
  { emoji: "🔥", anim: "flicker", label: "Burn" },
  { emoji: "✨", anim: "twinkle", label: "Shimmer" },
  { emoji: "💫", anim: "spin", label: "Dizzy" },
  { emoji: "🎉", anim: "pulse", label: "Party" },
  { emoji: "💥", anim: "pulse", label: "Boom" },
  { emoji: "🌟", anim: "float", label: "Star" },
  { emoji: "💖", anim: "beat", label: "Heartbeat" },
  { emoji: "🚀", anim: "float", label: "Launch" },
  { emoji: "⚡", anim: "flicker", label: "Zap" },
  { emoji: "🫶", anim: "wiggle", label: "Thanks" },
  { emoji: "🌈", anim: "bob", label: "Rainbow" },
  { emoji: "🥳", anim: "wiggle", label: "Celebrate" },
];

/** Which motion an emoji uses when added as a reaction. */
export function animForEmoji(emoji: string): EmojiAnim | undefined {
  return animatedEmojis.find((x) => x.emoji === emoji)?.anim;
}
