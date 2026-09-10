"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl overflow-x-auto no-scrollbar",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-150 z-10 whitespace-nowrap cursor-pointer select-none",
              isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/80 via-pink-500/80 to-amber-500/80 shadow-md shadow-pink-500/20"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
