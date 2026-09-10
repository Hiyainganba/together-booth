"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { MemoriesGallery } from "@/components/memories/MemoriesGallery";
import { useMemories } from "@/hooks/useMemories";
import { Badge } from "@/ui/Badge";
import { Sparkles, Camera } from "lucide-react";
import { Button } from "@/ui/Button";

export default function MemoriesPage() {
  const router = useRouter();
  const { memories, loading, likeMemory, deleteMemory } = useMemories();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-pink-500 selection:text-white">
      <Navbar />

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
              Personal Photo Vault
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-xl">
              All your studio photobooth strips, high-res captures, and customized memories in one place.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/booth")}
            className="self-start sm:self-auto shadow-xl shadow-pink-500/25"
          >
            <Camera className="w-4 h-4 mr-2" />
            <span>Enter Photobooth</span>
          </Button>
        </div>

        <MemoriesGallery
          memories={memories}
          loading={loading}
          onLike={likeMemory}
          onDelete={deleteMemory}
          onCreateClick={() => router.push("/booth")}
        />
      </main>

      <Footer />
    </div>
  );
}
