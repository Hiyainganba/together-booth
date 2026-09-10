"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { roomService } from "@/services/roomService";
import { RoomMode } from "@/types/room";
import { Heart, Users, User, Sparkles, ArrowRight, ShieldCheck, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal, signInAsGuest } = useAuth();
  const [roomName, setRoomName] = useState("");
  const [mode, setMode] = useState<RoomMode>("couple");
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modes: { id: RoomMode; title: string; desc: string; icon: React.ComponentType<{ className?: string }>; badge: string }[] = [
    {
      id: "couple",
      title: "Couple Mode 💑",
      desc: "Side-by-side split screen with romantic film filters",
      icon: Heart,
      badge: "2 People",
    },
    {
      id: "group",
      title: "Group Mode 🎉",
      desc: "Synchronized grid photobooth for faraway besties & squads",
      icon: Users,
      badge: "3–8 People",
    },
    {
      id: "solo",
      title: "Solo Studio 📸",
      desc: "Single creator booth for portrait strips & self-timer reels",
      icon: User,
      badge: "1 Person",
    },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInAsGuest(guestName.trim() || "Host Creator");
      }

      const room = await roomService.createRoom(
        currentUser,
        mode,
        roomName.trim() || `${mode.toUpperCase()} Photobooth`
      );

      onClose();
      router.push(`/room/${room.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Your Photobooth Session"
      description="Select your session mode and invite your favorite person or group."
      maxWidth="lg"
    >
      <form onSubmit={handleCreate} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Select Booth Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {modes.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative flex flex-col justify-between",
                    isSelected
                      ? "bg-gradient-to-b from-[#FF6F61]/20 to-[#E9A842]/10 border-[#FF6F61] shadow-lg shadow-[#FF6F61]/15 scale-102"
                      : "bg-[#1A1816] border-white/10 hover:border-white/20 hover:bg-[#221F1C]"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center",
                          isSelected ? "bg-[#FF6F61] text-white" : "bg-white/10 text-zinc-300"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                        {m.badge}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-white mb-1">{m.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug font-normal">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Booth Name (Optional)
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. 2 AM FaceTime Date ❤️, Friday Besties"
            maxLength={40}
            className="w-full px-4 py-3 rounded-2xl bg-[#1A1816] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-sm transition-all"
          />
        </div>

        {!isAuthenticated && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Your Host Nickname
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Maya 🌸"
              maxLength={20}
              className="w-full px-4 py-3 rounded-2xl bg-[#1A1816] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-sm transition-all"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Private P2P Encrypted Shutter</span>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            <span>Step Inside Booth</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
