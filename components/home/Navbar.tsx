"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Camera, Sparkles, Images, PlusCircle, LogIn, LogOut, Heart, Ticket, User } from "lucide-react";
import { Button } from "@/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/auth/UserAvatar";

interface NavbarProps {
  onCreateRoomClick?: () => void;
  onJoinRoomClick?: () => void;
}

export function Navbar({ onCreateRoomClick, onJoinRoomClick }: NavbarProps) {
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
              ✦ virtual photobooth for two & more ✦
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          <Link
            href="/memories"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Images className="w-4 h-4 text-[#FF7E67]" />
            <span>Community Wall</span>
          </Link>

          {isAuthenticated && (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <User className="w-4 h-4 text-amber-300" />
              <span>My Profile & Vault</span>
            </Link>
          )}

          {onJoinRoomClick && (
            <button
              onClick={onJoinRoomClick}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>Enter Room Code</span>
            </button>
          )}

          {onCreateRoomClick && (
            <button
              onClick={onCreateRoomClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#FF6F61] to-[#E9A842] text-white shadow-lg shadow-[#FF6F61]/25 hover:shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Step Inside Booth</span>
            </button>
          )}
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
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-300" />
                    <span>My Profile & Vault</span>
                  </Link>
                  <Link
                    href="/memories"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Images className="w-4 h-4 text-[#FF7E67]" />
                    <span>Community Wall</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="glass"
              size="sm"
              onClick={openAuthModal}
              className="rounded-full border-white/15 text-xs font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
