"use client";

import React from "react";
import { FrameStyleType } from "@/types/photobooth";
import { FRAME_OPTIONS } from "@/lib/frames";
import { Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface FrameSelectorProps {
  activeFrame: FrameStyleType;
  onSelectFrame: (frame: FrameStyleType) => void;
}

export function FrameSelector({ activeFrame, onSelectFrame }: FrameSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-pink-400" />
          <span>Borders & Frames</span>
        </h4>
        <p className="text-xs text-zinc-400 mt-0.5">
          Choose a photo card border and luxury material aesthetic.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
        {FRAME_OPTIONS.map((f) => {
          const isSelected = activeFrame === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFrame(f.id)}
              className={cn(
                "group p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between",
                isSelected
                  ? "bg-pink-500/15 border-pink-500 shadow-lg shadow-pink-500/20"
                  : "bg-zinc-800/60 border-white/10 hover:border-white/25 hover:bg-zinc-800"
              )}
            >
              <div
                className="w-full h-16 rounded-xl mb-2 flex items-center justify-center p-2 shadow-inner border border-white/10 relative overflow-hidden"
                style={{ background: f.bgGradient }}
              >
                <div
                  className="w-full h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm"
                  style={{ backgroundColor: f.previewColor, color: f.textColor }}
                >
                  {f.name}
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                  {f.name}
                </h5>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                  {f.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
