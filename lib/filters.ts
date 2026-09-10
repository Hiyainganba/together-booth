import { FilterPreset, FilterType } from "@/types/filter";

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "normal",
    name: "Natural",
    description: "Crisp, true-to-life studio capture",
    cssFilter: "none",
    accentColor: "#a1a1aa",
  },
  {
    id: "vintage",
    name: "Vintage 1970",
    description: "Warm nostalgic sepia with soft analog grain",
    cssFilter: "sepia(0.38) contrast(1.15) brightness(1.05) saturate(1.2) hue-rotate(-10deg)",
    overlayGradient: "radial-gradient(circle, rgba(255,230,180,0.15) 0%, rgba(80,40,10,0.25) 100%)",
    accentColor: "#d97706",
  },
  {
    id: "polaroid",
    name: "Polaroid SX-70",
    description: "Classic instant film look with elevated mid-tones",
    cssFilter: "contrast(1.18) brightness(1.08) saturate(0.9) hue-rotate(5deg)",
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,20,50,0.1) 100%)",
    accentColor: "#0284c7",
  },
  {
    id: "film",
    name: "35mm Cinema",
    description: "Rich cinematic saturation with deep shadow tones",
    cssFilter: "contrast(1.22) brightness(0.98) saturate(1.35) hue-rotate(-5deg)",
    overlayGradient: "linear-gradient(135deg, rgba(0,255,200,0.05) 0%, rgba(255,0,100,0.08) 100%)",
    accentColor: "#e11d48",
  },
  {
    id: "bw",
    name: "Noir Classic",
    description: "High-contrast editorial monochrome",
    cssFilter: "grayscale(1) contrast(1.35) brightness(1.05)",
    accentColor: "#71717a",
  },
  {
    id: "warm",
    name: "Golden Hour",
    description: "Sun-kissed honey glow and soft sunset warmth",
    cssFilter: "brightness(1.06) saturate(1.3) sepia(0.22) hue-rotate(-12deg)",
    overlayGradient: "radial-gradient(circle at 70% 30%, rgba(255,180,50,0.2) 0%, rgba(255,100,50,0.1) 100%)",
    accentColor: "#f59e0b",
  },
  {
    id: "cool",
    name: "Nordic Frost",
    description: "Clean modern cool tones with pastel cyan highlights",
    cssFilter: "brightness(1.04) saturate(0.95) hue-rotate(25deg) contrast(1.08)",
    overlayGradient: "linear-gradient(180deg, rgba(100,200,255,0.12) 0%, rgba(0,50,150,0.08) 100%)",
    accentColor: "#06b6d4",
  },
  {
    id: "dreamy",
    name: "Pastel Dream",
    description: "Soft ethereal bloom and gentle luminous haze",
    cssFilter: "brightness(1.15) contrast(0.92) saturate(1.25)",
    overlayGradient: "radial-gradient(circle, rgba(255,200,240,0.25) 0%, rgba(180,220,255,0.15) 100%)",
    accentColor: "#ec4899",
  },
  {
    id: "y2k",
    name: "Cyber Y2K",
    description: "Futuristic digital edge with neon saturation",
    cssFilter: "contrast(1.3) saturate(1.65) brightness(1.08) hue-rotate(180deg)",
    overlayGradient: "linear-gradient(45deg, rgba(255,0,128,0.2) 0%, rgba(0,255,255,0.2) 100%)",
    accentColor: "#8b5cf6",
  },
];

export function getFilterPreset(id: FilterType): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) || FILTER_PRESETS[0];
}

export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterType: FilterType
): void {
  const preset = getFilterPreset(filterType);
  if (filterType === "normal" || !preset) return;

  if (filterType === "vintage") {
    ctx.fillStyle = "rgba(255, 220, 150, 0.12)";
    ctx.fillRect(0, 0, width, height);
  } else if (filterType === "warm") {
    const grad = ctx.createRadialGradient(
      width * 0.7,
      height * 0.3,
      10,
      width * 0.5,
      height * 0.5,
      width
    );
    grad.addColorStop(0, "rgba(255, 170, 50, 0.18)");
    grad.addColorStop(1, "rgba(255, 80, 50, 0.08)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (filterType === "cool") {
    ctx.fillStyle = "rgba(100, 210, 255, 0.1)";
    ctx.fillRect(0, 0, width, height);
  } else if (filterType === "dreamy") {
    ctx.fillStyle = "rgba(255, 192, 230, 0.15)";
    ctx.fillRect(0, 0, width, height);
  } else if (filterType === "y2k") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "rgba(255, 0, 150, 0.12)");
    grad.addColorStop(1, "rgba(0, 255, 255, 0.12)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}
