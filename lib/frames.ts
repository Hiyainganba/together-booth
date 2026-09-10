import { FrameStyleType } from "@/types/photobooth";

export interface FrameOption {
  id: FrameStyleType;
  name: string;
  category: "classic" | "aesthetic" | "retro" | "cyber";
  previewColor: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  accentBadge: string;
  stampColor: string;
  borderWidth: number;
}

export const FRAME_OPTIONS: FrameOption[] = [
  {
    id: "classic-white",
    name: "Polaroid White",
    category: "classic",
    previewColor: "#ffffff",
    bgGradient: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
    borderColor: "#e4e4e7",
    textColor: "#18181b",
    accentBadge: "bg-zinc-100 text-zinc-900 border-zinc-300",
    stampColor: "#71717a",
    borderWidth: 16,
  },
  {
    id: "luxury-black",
    name: "Onyx Matte",
    category: "classic",
    previewColor: "#121214",
    bgGradient: "linear-gradient(180deg, #18181b 0%, #09090b 100%)",
    borderColor: "#27272a",
    textColor: "#f43f5e",
    accentBadge: "bg-zinc-800 text-zinc-100 border-zinc-700",
    stampColor: "#a1a1aa",
    borderWidth: 16,
  },
  {
    id: "pastel-pink",
    name: "Sakura Blush",
    category: "aesthetic",
    previewColor: "#fdf2f8",
    bgGradient: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)",
    borderColor: "#fbcfe8",
    textColor: "#be185d",
    accentBadge: "bg-pink-100 text-pink-900 border-pink-300",
    stampColor: "#db2777",
    borderWidth: 16,
  },
  {
    id: "pastel-blue",
    name: "Baby Sky",
    category: "aesthetic",
    previewColor: "#f0f9ff",
    bgGradient: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)",
    borderColor: "#bae6fd",
    textColor: "#0369a1",
    accentBadge: "bg-sky-100 text-sky-900 border-sky-300",
    stampColor: "#0284c7",
    borderWidth: 16,
  },
  {
    id: "cyber-chrome",
    name: "Cyber Hologram",
    category: "cyber",
    previewColor: "#0f172a",
    bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #311042 100%)",
    borderColor: "#818cf8",
    textColor: "#38bdf8",
    accentBadge: "bg-indigo-950 text-cyan-300 border-cyan-500",
    stampColor: "#818cf8",
    borderWidth: 16,
  },
  {
    id: "vintage-paper",
    name: "Sepia Press",
    category: "retro",
    previewColor: "#fef3c7",
    bgGradient: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)",
    borderColor: "#fcd34d",
    textColor: "#78350f",
    accentBadge: "bg-amber-100 text-amber-900 border-amber-300",
    stampColor: "#92400e",
    borderWidth: 16,
  },
  {
    id: "heart-romance",
    name: "Sweethearts",
    category: "aesthetic",
    previewColor: "#fff1f2",
    bgGradient: "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)",
    borderColor: "#fecdd3",
    textColor: "#e11d48",
    accentBadge: "bg-rose-100 text-rose-900 border-rose-300",
    stampColor: "#e11d48",
    borderWidth: 16,
  },
  {
    id: "y2k-grid",
    name: "Y2K Matrix",
    category: "cyber",
    previewColor: "#030712",
    bgGradient: "radial-gradient(circle at top left, #1e1b4b 0%, #030712 100%)",
    borderColor: "#a855f7",
    textColor: "#c084fc",
    accentBadge: "bg-purple-950 text-purple-200 border-purple-600",
    stampColor: "#c084fc",
    borderWidth: 16,
  },
];

export function getFrameOption(id: FrameStyleType): FrameOption {
  return FRAME_OPTIONS.find((f) => f.id === id) || FRAME_OPTIONS[0];
}
