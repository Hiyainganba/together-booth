"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Camera,
  Scissors,
  Printer,
  Sparkles,
  HeartHandshake,
  Heart,
  Palette,
  Layers,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    tag: "STEP ONE",
    icon: Ticket,
    title: "Tear a Ticket & Share the Key",
    desc: "Create a private booth in 1 click and send your 6-digit code. No bulky app downloads required — your partner or friends jump straight in.",
    accent: "from-[#FF6F61] to-[#F0718F]",
    doodle: "🎟️",
  },
  {
    step: "02",
    tag: "STEP TWO",
    icon: Camera,
    title: "3... 2... 1... Cheeeese!",
    desc: "Our synced countdown timer ticks on all devices in unison. Pose, laugh, and snap simultaneous shots captured at the exact same heartbeat.",
    accent: "from-[#E9A842] to-[#FF7E67]",
    doodle: "📸",
  },
  {
    step: "03",
    tag: "STEP THREE",
    icon: Scissors,
    title: "Trim Backgrounds & Step in Velvet",
    desc: "Trim real physical clutter with 1-click AI body isolation. Place yourselves side-by-side in front of red velvet curtains, retro stripes, or Parisian sunsets.",
    accent: "from-[#F0718F] to-[#E2D9F3]",
    doodle: "🎪",
  },
  {
    step: "04",
    tag: "STEP FOUR",
    icon: Printer,
    title: "Print & Keep Your Strip Forever",
    desc: "Plaster with stickers, write cute date stamps, copy directly to your clipboard, or export printable 2×6″ high-DPI strips ready for real photo paper.",
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
            <span>HOW IT FEELS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#FAF6F0] tracking-tight">
            Four simple steps to a lasting memory.
          </h2>
          <p className="text-[#B8AFA9] text-sm sm:text-base font-normal">
            Designed to feel just like stumbling into a cozy vintage photobooth in the middle of a bustling city.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative rounded-3xl p-6 bg-[#1A1816] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${s.accent} flex items-center justify-center text-white shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-white/20 group-hover:text-[#FF6F61]/50 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-300/90 block mb-1">
                      {s.tag}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-white mb-2 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-hand">
                  <span>photobooth magic</span>
                  <span className="text-base">{s.doodle}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
