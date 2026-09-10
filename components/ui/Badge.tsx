"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "glow" | "outline";
  className?: string;
}

export function Badge({ children, variant = "primary", className }: BadgeProps) {
  const variants = {
    primary: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    secondary: "bg-zinc-800 text-zinc-300 border-zinc-700",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    glow: "bg-white/10 text-white border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.2)]",
    outline: "bg-transparent text-zinc-400 border-zinc-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
