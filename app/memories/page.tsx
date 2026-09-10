"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { MemoriesGallery } from "@/components/memories/MemoriesGallery";
import { CreateRoomModal } from "@/components/home/CreateRoomModal";
import { JoinRoomModal } from "@/components/home/JoinRoomModal";
import { useMemories } from "@/hooks/useMemories";
import { Badge } from "@/ui/Badge";
import { Sparkles, Images, PlusCircle } from "lucide-react";
import { Button } from "@/ui/Button";

export default function MemoriesPage() {
  const { memories, loading, likeMemory, deleteMemory } = useMemories();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-pink-500 selection:text-white">
      <Navbar
        onCreateRoomClick={() => setIsCreateOpen(true)}
        onJoinRoomClick={() => setIsJoinOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="glow">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Memory Vault</span>
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Shared & Private Albums
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-xl">
              All your virtual photobooth strips, high-res captures, and customized memories in one place.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            className="self-start sm:self-auto shadow-xl shadow-pink-500/25"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            <span>New Photobooth</span>
          </Button>
        </div>

        <MemoriesGallery
          memories={memories}
          loading={loading}
          onLike={likeMemory}
          onDelete={deleteMemory}
          onCreateClick={() => setIsCreateOpen(true)}
        />
      </main>

      <Footer />

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
    </div>
  );
}
