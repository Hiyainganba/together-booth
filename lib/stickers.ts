export interface StickerPreset {
  id: string;
  category: "emoji" | "doodle" | "heart" | "badge" | "stamp" | "tape";
  content: string;
  name: string;
}

export const STICKER_PRESETS: StickerPreset[] = [
  { id: "s_heart_1", category: "heart", content: "💖", name: "Sparkle Heart" },
  { id: "s_heart_2", category: "heart", content: "❤️", name: "Red Heart" },
  { id: "s_heart_3", category: "heart", content: "🤍", name: "White Heart" },
  { id: "s_heart_4", category: "heart", content: "💞", name: "Revolving Hearts" },
  { id: "s_heart_5", category: "heart", content: "💌", name: "Love Letter" },
  { id: "s_heart_6", category: "heart", content: "💘", name: "Heart Arrow" },
  { id: "s_emoji_1", category: "emoji", content: "✨", name: "Sparkles" },
  { id: "s_emoji_2", category: "emoji", content: "🎀", name: "Pink Ribbon" },
  { id: "s_emoji_3", category: "emoji", content: "🧸", name: "Teddy Bear" },
  { id: "s_emoji_4", category: "emoji", content: "📸", name: "Vintage Camera" },
  { id: "s_emoji_5", category: "emoji", content: "🌸", name: "Cherry Blossom" },
  { id: "s_emoji_6", category: "emoji", content: "🍒", name: "Cherries" },
  { id: "s_emoji_7", category: "emoji", content: "🌙", name: "Crescent Moon" },
  { id: "s_emoji_8", category: "emoji", content: "🦋", name: "Butterfly" },
  { id: "s_emoji_9", category: "emoji", content: "🥂", name: "Cheers Glasses" },
  { id: "s_emoji_10", category: "emoji", content: "🍓", name: "Strawberry" },
  { id: "s_emoji_11", category: "emoji", content: "☁️", name: "Cloud" },
  { id: "s_emoji_12", category: "emoji", content: "🌷", name: "Tulip" },
  { id: "s_badge_1", category: "badge", content: "BESTIES 🌟", name: "Besties Badge" },
  { id: "s_badge_2", category: "badge", content: "LOVE YOU 💘", name: "Love You Badge" },
  { id: "s_badge_3", category: "badge", content: "XOXO 💋", name: "XOXO Stamp" },
  { id: "s_badge_4", category: "badge", content: "FOREVER & ALWAYS ♾️", name: "Forever Badge" },
  { id: "s_badge_5", category: "badge", content: "SO CUTE 🥰", name: "So Cute Stamp" },
  { id: "s_badge_6", category: "badge", content: "DATE NIGHT 🥂", name: "Date Night Stamp" },
  { id: "s_badge_7", category: "badge", content: "Y2K ANGEL 👼", name: "Y2K Angel" },
  { id: "s_badge_8", category: "badge", content: "VIBES ONLY 🌈", name: "Vibes Only" },
  { id: "s_stamp_1", category: "stamp", content: "PASSED WITH LOVE", name: "Love Stamp" },
  { id: "s_stamp_2", category: "stamp", content: "OFFICIAL MEMORY", name: "Memory Stamp" },
  { id: "s_stamp_3", category: "stamp", content: "TOKYO • PARIS • NYC", name: "Cities Stamp" },
  { id: "s_tape_1", category: "tape", content: "━━━━ TAPE ━━━━", name: "Washi Tape" },
];

export const FONT_OPTIONS = [
  { id: "font-sans", name: "Clean Modern", family: "system-ui, -apple-system, sans-serif" },
  { id: "font-serif", name: "Editorial Serif", family: "Georgia, 'Times New Roman', serif" },
  { id: "font-mono", name: "Retro Typewriter", family: "'Courier New', Courier, monospace" },
  { id: "font-hand", name: "Cursive Script", family: "'Brush Script MT', cursive, sans-serif" },
];
