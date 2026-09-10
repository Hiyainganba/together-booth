"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  PlusCircle,
  LogIn,
  Sparkles,
  Heart,
  ArrowRight,
  Smile,
  Sliders,
  Printer,
  Compass,
} from "lucide-react";
import { Button } from "@/ui/Button";

interface HeroSectionProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

const HERO_FILTERS = [
  { id: "warm", name: "Warm Film 🎞️", css: "sepia(0.25) contrast(1.15) brightness(1.05)" },
  { id: "golden", name: "Golden Hour 🌅", css: "contrast(1.2) hue-rotate(-10deg) saturate(1.3)" },
  { id: "sakura", name: "Sakura Kiss 🌸", css: "contrast(1.1) brightness(1.08) hue-rotate(15deg)" },
  { id: "noir", name: "Noir 1960 🖤", css: "grayscale(1) contrast(1.35) brightness(0.95)" },
];

export function HeroSection({ onCreateClick, onJoinClick }: HeroSectionProps) {
  const [activeFilterId, setActiveFilterId] = useState("warm");
  const [activeSticker, setActiveSticker] = useState("💖");

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
                Crafted for long-distance love & faraway besties
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#FAF6F0] leading-[1.08]">
                Distance is just geography. <br />
                <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FF7E67] via-[#F0718F] to-[#E9A842]">
                  Step into the booth together.
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
                Remember squeezing into a photo booth, pulling the curtain, and making silly faces?
                Together Booth brings that exact feeling to your screens. Synchronized shutters, vintage film grain,
                AI body trimming, and printable 2×6″ photo strips you can stick on your wall.
              </p>

              <div className="hidden sm:block absolute -top-3 -right-6 font-hand text-xl text-amber-200/90 rotate-6 pointer-events-none">
                ✦ pull the curtain & smile ✦
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={onCreateClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-[#FF6F61] via-[#F0718F] to-[#E9A842] text-white shadow-xl shadow-[#FF6F61]/25 hover:shadow-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Start a Photobooth Session</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={onJoinClick}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl text-base font-semibold bg-[#1F1C1A] hover:bg-[#282421] border border-white/10 text-[#FAF6F0] hover:border-white/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#FF7E67]" />
                <span>Have a Room Code?</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-black text-white">0.0s</div>
                <div className="text-xs text-zinc-400 font-medium">Synced Shutter Click</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-black text-[#FF7E67]">2×6″</div>
                <div className="text-xs text-zinc-400 font-medium">Printable PDF Cuts</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-black text-[#E9A842]">100%</div>
                <div className="text-xs text-zinc-400 font-medium">Free & Private</div>
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
                TOGETHER BOOTH • 2026
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80"
                    alt="Couple Smiling"
                    style={{ filter: currentFilter.css }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute bottom-2 right-2 text-2xl drop-shadow">💖</div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[9px] font-mono">
                    SAN FRANCISCO 11:30 PM
                  </div>
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
                    alt="Couple Laughing"
                    style={{ filter: currentFilter.css }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-2 right-2 text-2xl drop-shadow">✨</div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[9px] font-mono">
                    SEOUL 4:30 PM
                  </div>
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    alt="Together Moment"
                    style={{ filter: currentFilter.css }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute bottom-2 right-2 text-2xl drop-shadow">🌸</div>
                </div>

                <div className="text-center pt-3 pb-1 border-t border-zinc-300">
                  <p className="font-serif font-bold text-sm tracking-widest uppercase text-zinc-900">
                    OUR FAVORITE MEMORIES
                  </p>
                  <p className="font-hand text-sm text-zinc-600 font-bold -mt-0.5">
                    "Still the best photo we ever took together!"
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">
                    • 5,420 MILES APART • SAME SMILE •
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 40 }}
              animate={{ opacity: 1, scale: 0.95, x: 70, y: 50, rotate: 6 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="hidden sm:block absolute -right-6 -bottom-8 w-56 rounded-3xl p-3.5 bg-[#FAF6F0] text-zinc-950 shadow-2xl border border-zinc-300 pointer-events-none"
            >
              <div className="washi-tape-pink absolute -top-2.5 right-6 px-3 py-0.5 text-zinc-800 font-mono text-[9px] font-bold">
                STICKER NOTE
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 mb-2 mt-1 border border-zinc-200">
                <img
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&auto=format&fit=crop&q=80"
                  alt="Besties"
                  className="w-full h-full object-cover sepia-[0.2]"
                />
              </div>
              <p className="font-hand text-base text-center font-bold text-zinc-800">
                Long distance besties 💌
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
