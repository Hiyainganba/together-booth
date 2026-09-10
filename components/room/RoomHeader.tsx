"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Copy, Check, Share2, LogOut, Grid, Sparkles, Settings, Users, Ticket } from "lucide-react";
import { Button } from "@/ui/Button";
import { Room, LayoutMode } from "@/types/room";

interface RoomHeaderProps {
  room: Room;
  participantCount: number;
  onShareClick: () => void;
  onSettingsClick: () => void;
  onLayoutChange: (layout: LayoutMode) => void;
}

export function RoomHeader({
  room,
  participantCount,
  onShareClick,
  onSettingsClick,
  onLayoutChange,
}: RoomHeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const layouts: { id: LayoutMode; label: string }[] = [
    { id: "1-person", label: "Solo" },
    { id: "2-split", label: "2-Split" },
    { id: "3-grid", label: "3-Grid" },
    { id: "4-grid", label: "4-Grid" },
    { id: "dynamic", label: "Auto" },
  ];

  return (
    <header className="w-full bg-[#11100F]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-30">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <Camera className="w-4 h-4 text-[#FF7E67]" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-sm sm:text-base font-bold text-white tracking-tight">
              {room.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#FF6F61]/20 text-[#FFA28B] text-[10px] font-bold border border-[#FF6F61]/30">
              {room.mode.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-mono bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              <Ticket className="w-3 h-3 text-amber-300" />
              <span>Room Code: <strong className="text-amber-300">{room.code}</strong></span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            </button>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-pink-400" /> {participantCount} live
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#1A1816] border border-white/10">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => onLayoutChange(l.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                room.layout === l.id
                  ? "bg-[#FF6F61] text-white font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={onShareClick}
          className="px-3 py-1.5 rounded-xl bg-[#FF6F61]/20 hover:bg-[#FF6F61]/30 border border-[#FF6F61]/40 text-[#FFA28B] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite & Share</span>
        </button>

        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="w-4 h-4 text-zinc-300" />
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => router.push("/")}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
      </div>
    </header>
  );
}
