"use client";

import React from "react";
import { MemoryItem } from "@/types/memory";
import { GlassCard } from "@/ui/GlassCard";
import { formatDate } from "@/lib/utils";
import { Heart, Download, Trash2, Eye, Lock, Globe } from "lucide-react";

interface MemoryCardProps {
  memory: MemoryItem;
  onView: (memory: MemoryItem) => void;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MemoryCard({ memory, onView, onLike, onDelete }: MemoryCardProps) {
  return (
    <GlassCard hoverEffect className="p-4 flex flex-col justify-between h-full bg-zinc-900/80 group">
      <div className="space-y-3">
        <div
          onClick={() => onView(memory)}
          className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 cursor-pointer"
        >
          <img
            src={memory.imageUrl}
            alt={memory.roomName || "Memory"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
              {memory.filter.toUpperCase()}
            </span>
            {memory.isPrivate ? (
              <span className="p-1 rounded-full bg-black/60 text-amber-300 border border-white/10">
                <Lock className="w-3 h-3" />
              </span>
            ) : (
              <span className="p-1 rounded-full bg-black/60 text-pink-300 border border-white/10">
                <Globe className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
            <span className="font-semibold drop-shadow">{formatDate(memory.createdAt)}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10">
              {memory.layout}
            </span>
          </div>
        </div>

        <div>
          <h3
            onClick={() => onView(memory)}
            className="font-bold text-white text-base group-hover:text-pink-300 transition-colors line-clamp-1 cursor-pointer"
          >
            {memory.roomName || "Together Photobooth"}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {memory.participants?.map((p, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/5"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <button
          onClick={() => onLike?.(memory.id)}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>{memory.likesCount || 1}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = memory.imageUrl;
              a.download = `together-memory-${memory.id}.jpg`;
              a.target = "_blank";
              a.click();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Download Photostrip"
          >
            <Download className="w-4 h-4" />
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete Memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
