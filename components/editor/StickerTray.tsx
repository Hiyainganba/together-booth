"use client";

import React, { useState } from "react";
import { STICKER_PRESETS, StickerPreset } from "@/lib/stickers";
import { Smile, Heart, Sparkles, Award, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickerTrayProps {
  onAddSticker: (content: string, category: StickerPreset["category"]) => void;
  placedCount: number;
  onClearAll?: () => void;
}

export function StickerTray({ onAddSticker, placedCount, onClearAll }: StickerTrayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "heart", label: "Hearts" },
    { id: "emoji", label: "Cute" },
    { id: "badge", label: "Badges" },
    { id: "stamp", label: "Stamps" },
  ];

  const filtered =
    selectedCategory === "all"
      ? STICKER_PRESETS
      : STICKER_PRESETS.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Smile className="w-4 h-4 text-pink-400" />
            <span>Sticker Studio</span>
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Click any item to place and drag anywhere on your strip.
          </p>
        </div>

        {placedCount > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear ({placedCount})</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-800/80 border border-white/10 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
              selectedCategory === c.id
                ? "bg-pink-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto no-scrollbar p-1">
        {filtered.map((s) => (
          <button
            key={s.id}
            onClick={() => onAddSticker(s.content, s.category)}
            className="p-3 rounded-2xl bg-zinc-800/60 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/40 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 group relative"
            title={s.name}
          >
            <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
              {s.content}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
