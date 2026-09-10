"use client";

import React, { useRef, useState } from "react";
import { Palette, Check, Upload, Trash2, Sparkles, Image as ImageIcon } from "lucide-react";
import { VIRTUAL_BACKGROUNDS } from "@/lib/virtual-backgrounds";
import { cn } from "@/lib/utils";

interface BackgroundColorPickerProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
}

const PALETTES = [
  { id: "default", name: "Card Default", color: "transparent" },
  { id: "pure-white", name: "Polaroid White", color: "#ffffff" },
  { id: "soft-cream", name: "Warm Cream", color: "#fef3c7" },
  { id: "blush-pink", name: "Sakura Pink", color: "#fdf2f8" },
  { id: "sky-pastel", name: "Baby Blue", color: "#f0f9ff" },
  { id: "mint-glow", name: "Fresh Mint", color: "#f0fdf4" },
  { id: "lavender-mist", name: "Lavender", color: "#faf5ff" },
  { id: "midnight", name: "Onyx Black", color: "#09090b" },
  { id: "cyber-indigo", name: "Cyber Violet", color: "#1e1b4b" },
  { id: "ruby-rose", name: "Ruby Rose", color: "#881337" },
  { id: "emerald-lux", name: "Emerald Studio", color: "#064e3b" },
  { id: "golden-amber", name: "Golden Glow", color: "#78350f" },
];

export function BackgroundColorPicker({
  currentColor,
  onSelectColor,
}: BackgroundColorPickerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"backdrops" | "colors">("backdrops");
  const [backdropCategory, setBackdropCategory] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "all", label: "All" },
    { id: "curtains", label: "Curtains 🎪" },
    { id: "strips", label: "Color Strips 🎨" },
    { id: "scenic", label: "Scenic ✈️" },
    { id: "aesthetic", label: "Aesthetic 🌸" },
    { id: "studio", label: "Studio ✨" },
  ];

  const handleCustomPatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onSelectColor(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isCustomImage = currentColor.startsWith("data:image");
  const presetBackdrops = VIRTUAL_BACKGROUNDS.filter((b) => {
    if (b.id === "none") return false;
    if (backdropCategory === "all") return true;
    return b.category === backdropCategory;
  });

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Background & Design Backdrops</span>
        </h4>
        <p className="text-xs text-zinc-400 mt-0.5">
          Choose velvet curtains, color stripes, scenic wallpapers, or studio colorways.
        </p>
      </div>

      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-800/80 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveSubTab("backdrops")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeSubTab === "backdrops"
              ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Design Themes & Curtains</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("colors")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeSubTab === "colors"
              ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Studio Colors</span>
        </button>
      </div>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCustomPatternUpload}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full p-3.5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/5",
            isCustomImage ? "border-pink-500 bg-pink-500/10" : "border-white/20 text-zinc-300"
          )}
        >
          <Upload className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold text-white">
            {isCustomImage ? "Replace Uploaded Card Wallpaper" : "Upload Custom Image / Wallpaper"}
          </span>
        </div>

        {isCustomImage && (
          <button
            onClick={() => onSelectColor("transparent")}
            className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer mx-auto pt-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Reset to Default Theme</span>
          </button>
        )}
      </div>

      {activeSubTab === "backdrops" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-800/60 border border-white/10 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setBackdropCategory(c.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  backdropCategory === c.id
                    ? "bg-pink-500 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto no-scrollbar p-1">
            {presetBackdrops.map((bg) => {
              const bgValue = bg.imageUrl || bg.gradient || bg.color || "#18181b";
              const isSelected = currentColor === bgValue;

              return (
                <button
                  key={bg.id}
                  onClick={() => onSelectColor(bgValue)}
                  className={cn(
                    "p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between overflow-hidden group",
                    isSelected
                      ? "border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/25 scale-102"
                      : "border-white/10 bg-zinc-800/60 hover:bg-zinc-800 hover:border-white/25"
                  )}
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2 bg-zinc-900 border border-white/10 flex items-center justify-center">
                    {bg.type === "image" && bg.imageUrl ? (
                      <img
                        src={bg.imageUrl}
                        alt={bg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : bg.type === "gradient" ? (
                      <div className="w-full h-full" style={{ background: bg.gradient }} />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                        Solid
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                      {bg.name}
                    </h5>
                    <p className="text-[9px] text-zinc-400 truncate mt-0.5">{bg.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "colors" && (
        <div className="grid grid-cols-3 gap-2.5">
          {PALETTES.map((p) => {
            const isSelected = currentColor === p.color;
            return (
              <button
                key={p.id}
                onClick={() => onSelectColor(p.color)}
                className={cn(
                  "p-2.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5",
                  isSelected
                    ? "border-pink-500 bg-pink-500/15 shadow-md shadow-pink-500/20 scale-102"
                    : "border-white/10 bg-zinc-800/60 hover:bg-zinc-800"
                )}
              >
                <div
                  className="w-9 h-9 rounded-full border border-white/20 shadow-inner flex items-center justify-center relative"
                  style={{
                    backgroundColor: p.color === "transparent" ? "#18181b" : p.color,
                  }}
                >
                  {isSelected && (
                    <Check
                      className={cn(
                        "w-4 h-4 stroke-[3]",
                        p.color === "#ffffff" || p.color === "#fef3c7"
                          ? "text-zinc-950"
                          : "text-white"
                      )}
                    />
                  )}
                </div>
                <span className="text-[10px] font-semibold text-zinc-300 truncate max-w-full">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


