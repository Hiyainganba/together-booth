"use client";

import React from "react";
import { FilterType } from "@/types/filter";
import { FILTER_PRESETS } from "@/lib/filters";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSelectorProps {
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  sampleImage?: string;
}

export function FilterSelector({
  activeFilter,
  onSelectFilter,
  sampleImage,
}: FilterSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Aesthetic Shaders</span>
        </h4>
        <p className="text-xs text-zinc-400 mt-0.5">
          Select real-time analog film and color grades for your strip.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
        {FILTER_PRESETS.map((f) => {
          const isSelected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              className={cn(
                "group p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between",
                isSelected
                  ? "bg-pink-500/15 border-pink-500 shadow-lg shadow-pink-500/20"
                  : "bg-zinc-800/60 border-white/10 hover:border-white/25 hover:bg-zinc-800"
              )}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-zinc-900 border border-white/5">
                {sampleImage ? (
                  <img
                    src={sampleImage}
                    alt={f.name}
                    style={{ filter: f.cssFilter }}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: f.accentColor }}
                  >
                    <span className="text-2xl">✨</span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                  {f.name}
                </h5>
                <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{f.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
