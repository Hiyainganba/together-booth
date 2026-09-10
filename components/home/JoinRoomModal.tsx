"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { roomService } from "@/services/roomService";
import { LogIn, ArrowRight, Sparkles, Ticket } from "lucide-react";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const { user, isAuthenticated, signInAsGuest } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError("Please enter a room code or link");
      return;
    }

    setIsLoading(true);
    setError(null);

    let parsedCode = roomCode.trim();
    if (parsedCode.includes("/room/")) {
      const parts = parsedCode.split("/room/");
      parsedCode = parts[1].split("?")[0].split("#")[0];
    }

    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInAsGuest(guestName.trim() || "Guest Explorer");
      }

      const room = await roomService.getRoom(parsedCode);
      if (!room) {
        throw new Error("No active photobooth room found with this code");
      }

      onClose();
      router.push(`/room/${room.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join a Photobooth Room"
      description="Enter the 6-character room code or full invite URL from your friend."
      maxWidth="md"
    >
      <form onSubmit={handleJoin} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Room Code or Invite Link
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="e.g. TOG-8492 or paste invite link"
            className="w-full px-4 py-3.5 rounded-2xl bg-[#1A1816] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-base font-mono tracking-wider transition-all"
            autoFocus
          />
        </div>

        {!isAuthenticated && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Your Nickname
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Jordan 🧸"
              maxLength={20}
              className="w-full px-4 py-3 rounded-2xl bg-[#1A1816] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-sm transition-all"
            />
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          isLoading={isLoading}
        >
          <LogIn className="w-4 h-4" />
          <span>Enter Photobooth</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>
    </Modal>
  );
}
