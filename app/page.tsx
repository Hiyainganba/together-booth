"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { RecentMemories } from "@/components/home/RecentMemories";
import { Footer } from "@/components/home/Footer";
import { CreateRoomModal } from "@/components/home/CreateRoomModal";
import { JoinRoomModal } from "@/components/home/JoinRoomModal";

export default function HomePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-pink-500 selection:text-white">
      <Navbar
        onCreateRoomClick={() => setIsCreateOpen(true)}
        onJoinRoomClick={() => setIsJoinOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          onCreateClick={() => setIsCreateOpen(true)}
          onJoinClick={() => setIsJoinOpen(true)}
        />

        <RecentMemories />

        <FeatureGrid />
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
