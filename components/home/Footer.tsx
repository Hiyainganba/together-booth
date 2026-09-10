"use client";

import React from "react";
import Link from "next/link";
import { Camera, Heart, Sparkles, Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0E0D0C] py-14 paper-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6F61] to-[#E9A842] flex items-center justify-center text-white shadow-md">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-black text-white tracking-tight">
                Together<span className="text-[#FF7E67] font-serif italic">Booth</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-normal">
              A cozy virtual photobooth for long-distance couples, best friends, and squads.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/memories" className="hover:text-white transition-colors">
              Memories Vault
            </Link>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2 text-xs text-zinc-400 font-hand text-base">
            <span>Made with love for people who miss each other</span>
            <Heart className="w-4 h-4 text-[#FF6F61] fill-current animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
