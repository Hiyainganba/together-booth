"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowRight, Download, Share2, Eye, Pin } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";

interface SampleMemory {
  id: string;
  title: string;
  date: string;
  locationNote: string;
  image: string;
  layout: string;
  filter: string;
  participants: string[];
  likes: number;
  rotation: string;
}

const SAMPLE_MEMORIES: SampleMemory[] = [
  {
    id: "mem_1",
    title: "Late Night Tokyo & London Date",
    date: "Sep 9, 2026",
    locationNote: "5,950 miles apart • 2:00 AM Call",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
    layout: "3-Cut Strip",
    filter: "Vintage '70",
    participants: ["Maya", "Leo"],
    likes: 42,
    rotation: "-rotate-2",
  },
  {
    id: "mem_2",
    title: "College Roomies Reunion",
    date: "Sep 8, 2026",
    locationNote: "NYC & Austin • 4 years of laughs",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80",
    layout: "4-Cut Grid",
    filter: "Golden Hour",
    participants: ["Sara", "Alex", "Chloe", "Sam"],
    likes: 89,
    rotation: "rotate-2",
  },
  {
    id: "mem_3",
    title: "Sweet 2-Year Anniversary",
    date: "Sep 7, 2026",
    locationNote: "Seattle & Chicago • Miss you tons",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    layout: "Couple Split",
    filter: "Pastel Dream",
    participants: ["Daniel", "Elena"],
    likes: 128,
    rotation: "-rotate-1",
  },
  {
    id: "mem_4",
    title: "Cyber Y2K Birthday Party",
    date: "Sep 6, 2026",
    locationNote: "Virtual cake & late night chats",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    layout: "Polaroid Cut",
    filter: "Cyber Y2K",
    participants: ["Zoe", "Kai", "Nate"],
    likes: 74,
    rotation: "rotate-1",
  },
];

export function RecentMemories() {
  const [selectedMemory, setSelectedMemory] = useState<SampleMemory | null>(null);

  return (
    <section className="py-24 bg-[#11100F] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#23201D] border border-white/10 text-xs font-semibold text-[#FF7E67]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMUNITY SCRAPBOOK</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#FAF6F0] tracking-tight">
              Pinned on our community wall.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl font-normal">
              Real photobooth moments captured across continents, printed and preserved with love.
            </p>
          </div>

          <Link
            href="/memories"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF7E67] hover:text-[#FFA28B] transition-colors"
          >
            <span>Explore Entire Memories Vault</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {SAMPLE_MEMORIES.map((mem, idx) => (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, rotate: 0 }}
              className={`relative rounded-3xl p-4 bg-[#FAF6F0] text-zinc-950 shadow-2xl border border-zinc-200 cursor-pointer transition-all ${mem.rotation}`}
              onClick={() => setSelectedMemory(mem)}
            >
              <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-zinc-800 font-mono text-[9px] font-bold">
                {mem.layout}
              </div>

              <div className="space-y-3 pt-2">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner">
                  <img
                    src={mem.image}
                    alt={mem.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 font-mono">
                      {mem.filter}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs font-semibold drop-shadow">
                    <span>{mem.date}</span>
                    <div className="flex items-center gap-1 text-rose-300">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{mem.likes}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-zinc-950 text-base leading-snug line-clamp-1">
                    {mem.title}
                  </h3>
                  <p className="font-hand text-xs text-zinc-600 font-bold mt-0.5 truncate">
                    {mem.locationNote}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {mem.participants.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/80 text-zinc-800"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedMemory)}
        onClose={() => setSelectedMemory(null)}
        title={selectedMemory?.title}
        description={`${selectedMemory?.locationNote} • ${selectedMemory?.date}`}
        maxWidth="md"
      >
        {selectedMemory && (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl">
              <img
                src={selectedMemory.image}
                alt={selectedMemory.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400">Participants:</span>
                <span className="text-xs text-white font-medium">
                  {selectedMemory.participants.join(", ")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = selectedMemory.image;
                    a.download = `${selectedMemory.title}.jpg`;
                    a.target = "_blank";
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
