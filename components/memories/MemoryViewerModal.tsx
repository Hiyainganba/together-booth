"use client";

import React from "react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { MemoryItem } from "@/types/memory";
import { formatDate } from "@/lib/utils";
import { Download, Share2, Heart, Calendar, Users, Sparkles } from "lucide-react";

interface MemoryViewerModalProps {
  memory: MemoryItem | null;
  onClose: () => void;
  onLike?: (id: string) => void;
}

export function MemoryViewerModal({
  memory,
  onClose,
  onLike,
}: MemoryViewerModalProps) {
  if (!memory) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = memory.imageUrl;
    a.download = `together-${memory.roomName || "strip"}-${Date.now()}.jpg`;
    a.target = "_blank";
    a.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: memory.roomName || "Together Photobooth",
          text: `Check out our photobooth strip from Together Booth!`,
          url: memory.imageUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(memory.imageUrl);
      alert("Image link copied to clipboard!");
    }
  };

  return (
    <Modal
      isOpen={Boolean(memory)}
      onClose={onClose}
      title={memory.roomName || "Photobooth Memory"}
      description={`Preserved on ${formatDate(memory.createdAt)}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="relative aspect-[3/4] max-h-[480px] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl flex items-center justify-center">
          <img
            src={memory.imageUrl}
            alt={memory.roomName || "Memory"}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-800/80 border border-white/10 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Users className="w-3.5 h-3.5 text-pink-400" />
              <span>{memory.participants?.join(", ") || "Me & Friends"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{memory.filter} shader • {memory.frameStyle} frame</span>
            </div>
          </div>

          <button
            onClick={() => onLike?.(memory.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/15 text-pink-300 border border-pink-500/30 font-bold hover:bg-pink-500/25 transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{memory.likesCount || 1}</span>
          </button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="glass"
            size="md"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Link</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
