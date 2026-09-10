"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CaptureFlashProps {
  showFlash: boolean;
}

export function CaptureFlash({ showFlash }: CaptureFlashProps) {
  return (
    <AnimatePresence>
      {showFlash && (
        <motion.div
          initial={{ opacity: 0.95 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-white pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
