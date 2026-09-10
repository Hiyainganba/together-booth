"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Scissors,
  Printer,
  Sparkles,
  Palette,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    tag: "STEP ONE",
    icon: Camera,
    title: "Step Inside Your Private Booth",
    desc: "Launch the studio booth in 1 click right from your browser. No bulky app downloads, room codes, or waiting required.",
    accent: "from-[#FF6F61] to-[#F0718F]",
    doodle: "📸",
  },
  {
    step: "02",
    tag: "STEP TWO",
    icon: Sparkles,
    title: "3... 2... 1... Cheeeese!",
    desc: "The studio countdown timer ticks down (3s, 5s, or 10s). Pose, smile, and snap high-resolution photo bursts with authentic shutter flash.",
    accent: "from-[#E9A842] to-[#FF7E67]",
    doodle: "✨",
  },
  {
    step: "03",
    tag: "STEP THREE",
    icon: Scissors,
    title: "Studio Backdrops & Vintage Film",
    desc: "Warm film, Sakura kiss, Golden hour, or Noir. Add Korean photo booth velvet curtains or custom neon studio backgrounds.",
    accent: "from-[#F0718F] to-[#E2D9F3]",
    doodle: "🎞️",
  },
  {
    step: "04",
    tag: "STEP FOUR",
    icon: Printer,
    title: "Print, Sticker & Keep Forever",
    desc: "Decorate with cute stickers, custom date stamps, download high-resolution PNGs, export printable 2×6″ strips, or save to your vault.",
    accent: "from-[#2A9D8F] to-[#E9A842]",
    doodle: "💌",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#141210] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#23201D] border border-white/10 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STUDIO EXPERIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#FAF6F0] tracking-tight">
            Four simple steps to a lasting memory.
          </h2>
          <p className="text-[#B8AFA9] text-sm sm:text-base font-normal">
            Designed to feel just like stepping into a private vintage photobooth in the heart of Seoul.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative rounded-3xl p-7 bg-[#1A1816] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 group-hover:text-amber-300 transition-colors">
                      {s.tag}
                    </div>
                    <span className="text-2xl">{s.doodle}</span>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${s.accent} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-white font-serif tracking-tight leading-snug">
                    {s.title}
                  </h3>

                  <p className="text-xs text-[#B8AFA9] leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-white/15 group-hover:text-white/30 transition-colors">
                    {s.step}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
