"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MemoryItem } from "@/types/memory";
import { MemoryCard } from "./MemoryCard";
import { MemoryViewerModal } from "./MemoryViewerModal";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { Tabs, TabOption } from "@/ui/Tabs";
import { Images, PlusCircle, Search, Sparkles, Heart, Globe, Lock } from "lucide-react";

interface MemoriesGalleryProps {
  memories: MemoryItem[];
  loading: boolean;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateClick?: () => void;
}

export function MemoriesGallery({
  memories,
  loading,
  onLike,
  onDelete,
  onCreateClick,
}: MemoriesGalleryProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  const tabs: TabOption[] = [
    { id: "all", label: "All Memories", icon: Images },
    { id: "shared", label: "Public & Shared", icon: Globe },
    { id: "private", label: "Private Vault", icon: Lock },
  ];

  const filtered = memories.filter((m) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "shared"
        ? !m.isPrivate
        : m.isPrivate;

    const matchesSearch =
      searchQuery.trim() === "" ||
      (m.roomName && m.roomName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.participants?.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="w-full sm:w-auto"
        />

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or squad..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-pink-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-3xl bg-zinc-900/60 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((mem) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onView={setSelectedMemory}
              onLike={onLike}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto mb-4 border border-pink-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Memories Found</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">
            Capture a live session with your partner or friends to build your shared album.
          </p>
          {onCreateClick ? (
            <Button variant="primary" size="md" onClick={onCreateClick}>
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>Launch New Booth</span>
            </Button>
          ) : (
            <Link href="/">
              <Button variant="primary" size="md">
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Go to Home</span>
              </Button>
            </Link>
          )}
        </div>
      )}

      <MemoryViewerModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onLike={onLike}
      />
    </div>
  );
}
