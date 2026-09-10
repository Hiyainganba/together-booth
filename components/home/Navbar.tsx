"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Camera, Sparkles, Images, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/auth/UserAvatar";

export function Navbar() {
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#11100F]/85 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6F61] via-[#F0718F] to-[#E9A842] flex items-center justify-center text-white shadow-lg shadow-[#FF6F61]/25 group-hover:rotate-6 transition-transform duration-300">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#FAF6F0] flex items-center gap-1.5">
              Together<span className="text-[#FF7E67] font-serif italic">Booth</span>
            </span>
            <span className="text-[10px] font-hand text-amber-200/80 -mt-1 block tracking-wider">
              ✦ your personal studio photobooth ✦
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          <Link
            href="/memories"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Images className="w-4 h-4 text-[#FF7E67]" />
            <span>My Memories</span>
          </Link>

          {isAuthenticated && (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <User className="w-4 h-4 text-amber-300" />
              <span>Profile & Vault</span>
            </Link>
          )}

          <Link
            href="/booth"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#FF6F61] via-[#F0718F] to-[#E9A842] text-white shadow-lg shadow-[#FF6F61]/25 hover:shadow-xl hover:scale-102 active:scale-98 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Enter Photobooth 📸</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer select-none"
              >
                <UserAvatar user={user} size="sm" showStatus isOnline />
                <span className="text-xs font-semibold text-zinc-200 hidden sm:inline-block max-w-[120px] truncate">
                  {user.displayName}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1A1816]/95 border border-white/15 shadow-2xl p-2 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {user.isAnonymous ? "Guest Mode" : user.email || user.phoneNumber || "Verified Member 🌟"}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile & Photos</span>
                  </Link>
                  <Link
                    href="/memories"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Images className="w-3.5 h-3.5" />
                    <span>Saved Photo Strips</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF7E67]" />
              <span>Sign In / Join</span>
            </button>
          )}

          <Link
            href="/booth"
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6F61] to-[#E9A842] text-white shadow-md"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Booth</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
