"use client";

import React from "react";
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  FlipHorizontal,
  Clock,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/ui/Button";
import { FilterType } from "@/types/filter";
import { FILTER_PRESETS } from "@/lib/filters";
import { getVirtualBackground, VIRTUAL_BACKGROUNDS } from "@/lib/virtual-backgrounds";
import { cn } from "@/lib/utils";

interface RoomControlsProps {
  isMicActive: boolean;
  isCameraActive: boolean;
  isMirrored: boolean;
  activeFilter: FilterType;
  virtualBackground?: string;
  countdownDuration: number;
  isCapturing: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleMirror: () => void;
  onSelectFilter: (filter: FilterType) => void;
  onSelectCountdown: (sec: number) => void;
  onStartCapture: () => void;
  onOpenBackdropModal: () => void;
  onSelectBackground?: (bgId: string) => void;
}

const QUICK_BACKDROPS = [
  { id: "none", name: "Real Room", icon: "📷" },
  { id: "cozy-curtain", name: "Red Velvet", icon: "🎪" },
  { id: "pink-curtain", name: "Blush Silk", icon: "🎀" },
  { id: "pastel-stripes", name: "Pastel Bars", icon: "🎨" },
  { id: "retro-rainbow", name: "Rainbow", icon: "🌈" },
  { id: "paris-sunset", name: "Paris", icon: "🗼" },
  { id: "cherry-blossom", name: "Tokyo Sakura", icon: "🌸" },
  { id: "sunset-vibes", name: "Sunset Glow", icon: "🌅" },
  { id: "neon-wave-stripes", name: "Neon Wave", icon: "⚡" },
  { id: "starry-galaxy", name: "Galaxy", icon: "🌌" },
];

export function RoomControls({
  isMicActive,
  isCameraActive,
  isMirrored,
  activeFilter,
  virtualBackground = "none",
  countdownDuration,
  isCapturing,
  onToggleMic,
  onToggleCamera,
  onToggleMirror,
  onSelectFilter,
  onSelectCountdown,
  onStartCapture,
  onOpenBackdropModal,
  onSelectBackground,
}: RoomControlsProps) {
  const countdownOptions = [3, 5, 10];
  const currentBgPreset = getVirtualBackground(virtualBackground);

  return (
    <div className="w-full bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 px-4 py-3 flex flex-col items-center gap-3 z-30">
      <div className="w-full max-w-5xl flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-white/10 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-zinc-400 pl-2 pr-1 flex items-center gap-1 shrink-0">
            <ImageIcon className="w-3 h-3 text-pink-400" />
            Backdrop:
          </span>

          {QUICK_BACKDROPS.map((b) => {
            const isSelected = virtualBackground === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBackground?.(b.id)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer select-none flex items-center gap-1",
                  isSelected
                    ? "bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/25 scale-102"
                    : "bg-zinc-800/80 text-zinc-300 border-white/5 hover:border-white/20 hover:text-white"
                )}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onOpenBackdropModal}
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-pink-300 bg-pink-500/15 border border-pink-500/30 hover:bg-pink-500/25 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
          >
            <span>More (20+)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FILTER_PRESETS.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFilter(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer select-none",
                  isSelected
                    ? "bg-white text-zinc-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105"
                    : "bg-zinc-900/80 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: f.accentColor }}
                />
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-4xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMic}
            className={cn(
              "p-3 rounded-2xl border transition-all cursor-pointer",
              isMicActive
                ? "bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800"
                : "bg-red-500/20 border-red-500/40 text-red-400"
            )}
            title={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onToggleCamera}
            className={cn(
              "p-3 rounded-2xl border transition-all cursor-pointer",
              isCameraActive
                ? "bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800"
                : "bg-red-500/20 border-red-500/40 text-red-400"
            )}
            title={isCameraActive ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isCameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onToggleMirror}
            className={cn(
              "p-3 rounded-2xl border transition-all cursor-pointer",
              isMirrored
                ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white"
            )}
            title="Mirror Local Camera"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartCapture}
            disabled={isCapturing}
            className="px-8 py-3.5 rounded-full text-base font-bold shadow-2xl shadow-pink-500/40 flex items-center gap-2.5 scale-105 hover:scale-110 active:scale-95 transition-transform"
          >
            <Camera className="w-5 h-5 animate-pulse" />
            <span>{isCapturing ? "Capturing Strip..." : "Capture Photo Strip"}</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/10">
          <span className="text-[11px] font-semibold text-zinc-400 pl-2 pr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Timer:
          </span>
          {countdownOptions.map((sec) => (
            <button
              key={sec}
              onClick={() => onSelectCountdown(sec)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                countdownDuration === sec
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
