"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  gradient?: boolean;
  hoverEffect?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GlassCard({
  gradient = false,
  hoverEffect = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative rounded-3xl backdrop-blur-2xl border border-white/10 shadow-2xl transition-colors duration-200 overflow-hidden",
        gradient
          ? "bg-gradient-to-b from-white/[0.08] to-white/[0.02]"
          : "bg-zinc-900/70",
        hoverEffect && "hover:border-white/20 hover:shadow-pink-500/10",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
