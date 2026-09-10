"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
  countdownValue: number | null;
}

export function CountdownOverlay({ countdownValue }: CountdownOverlayProps) {
  if (countdownValue === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {countdownValue > 0 ? (
          <motion.div
            key={countdownValue}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex items-center justify-center w-40 h-40 rounded-full bg-black/60 backdrop-blur-2xl border-4 border-pink-500 shadow-[0_0_80px_rgba(244,63,94,0.6)]"
          >
            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-rose-400 via-pink-300 to-amber-200">
              {countdownValue}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="smile"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-8 py-4 rounded-3xl bg-pink-500/90 backdrop-blur-2xl border border-white/40 shadow-2xl text-white font-extrabold text-3xl tracking-wider uppercase flex items-center gap-3"
          >
            <span>📸 SMILE!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
