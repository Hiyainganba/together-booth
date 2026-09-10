"use client";

import React from "react";
import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { RecentMemories } from "@/components/home/RecentMemories";
import { Footer } from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-pink-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <RecentMemories />
        <FeatureGrid />
      </main>

      <Footer />
    </div>
  );
}
