"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  ArrowRight,
  Images,
  Sparkles,
  Heart,
} from "lucide-react";

const HERO_FILTERS = [
  { id: "warm", name: "Warm Film 🎞️", css: "sepia(0.25) contrast(1.15) brightness(1.05)" },
  { id: "golden", name: "Golden Hour 🌅", css: "contrast(1.2) hue-rotate(-10deg) saturate(1.3)" },
  { id: "sakura", name: "Sakura Kiss 🌸", css: "contrast(1.1) brightness(1.08) hue-rotate(15deg)" },
  { id: "noir", name: "Noir 1960 🖤", css: "grayscale(1) contrast(1.35) brightness(0.95)" },
];

export function HeroSection() {
  const [activeFilterId, setActiveFilterId] = useState("warm");
  const currentFilter = HERO_FILTERS.find((f) => f.id === activeFilterId) || HERO_FILTERS[0];

  return (
    <section className="relative pt-12 pb-24 md:pt-20 md:pb-36 overflow-hidden paper-grain">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#FF6F61]/15 via-[#F0718F]/15 to-[#E9A842]/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 text-center lg:text-left space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#23201D] border border-white/10 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF6F61] animate-ping" />
              <span className="text-xs font-semibold text-zinc-300">
                Your personal aesthetic studio photobooth
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#FAF6F0] leading-[1.08]">
                Smile, pose & create. <br />
                <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FF7E67] via-[#F0718F] to-[#E9A842]">
                  Step into the studio booth.
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <p className="text-base sm:text-lg text-[#D6CECA] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Step into your private aesthetic photobooth right from your screen. Vintage film grain, Korean Life4Cuts photo strips, customizable frames, cute stickers, and printable 2×6″ photo strips ready in seconds.
              </p>

              <div className="hidden sm:block absolute -top-3 -right-6 font-hand text-xl text-amber-200/90 rotate-6 pointer-events-none">
                ✦ smile & snap ✦
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/booth"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-[#FF6F61] via-[#F0718F] to-[#E9A842] text-white shadow-xl shadow-[#FF6F61]/25 hover:shadow-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Enter Photobooth 📸</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                href="/memories"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl text-base font-semibold bg-[#1F1C1A] hover:bg-[#282421] border border-white/10 text-[#FAF6F0] hover:border-white/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Images className="w-4 h-4 text-[#FF7E67]" />
                <span>My Saved Memories</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-black text-white">Instant</div>
                <div className="text-xs text-zinc-400 font-medium">Solo Camera Studio</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-black text-[#FF7E67]">2×6″</div>
                <div className="text-xs text-zinc-400 font-medium">Printable Strips</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-black text-[#E9A842]">100%</div>
                <div className="text-xs text-zinc-400 font-medium">Private & Free</div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="mb-3 flex items-center gap-1.5 p-1 rounded-2xl bg-[#1A1816] border border-white/10 shadow-lg">
              {HERO_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilterId(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilterId === f.id
                      ? "bg-[#FF6F61] text-white shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              className="relative w-72 sm:w-80 rounded-3xl p-5 bg-[#FAF6F0] text-zinc-950 shadow-2xl border border-zinc-300 transition-all select-none"
            >
              <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 text-zinc-800 font-mono text-[10px] font-bold tracking-widest uppercase border border-amber-300/40">
                STUDIO BOOTH • 2026
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    alt="Portrait"
                    style={{ filter: currentFilter.css }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute bottom-2 right-2 text-2xl drop-shadow">💖</div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[9px] font-mono">
                    WARM VINTAGE
                  </div>
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
                    alt="Smile"
                    style={{ filter: currentFilter.css }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-2 right-2 text-2xl drop-shadow">✨</div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[9px] font-mono">
                    SAKURA KISS
                  </div>
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80"
                    alt="Pose"
                    style={{ filter: currentFilter.css }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute bottom-2 right-2 text-2xl drop-shadow">🌸</div>
                </div>

                <div className="text-center pt-3 pb-1 border-t border-zinc-300">
                  <p className="font-serif font-bold text-sm tracking-widest uppercase text-zinc-900">
                    LIFE 4 CUTS • STUDIO
                  </p>
                  <p className="font-hand text-sm text-zinc-600 font-bold -mt-0.5">
                    "Smile, snap, and keep the memory forever!"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
