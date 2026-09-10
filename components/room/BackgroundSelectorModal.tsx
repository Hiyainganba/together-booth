"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { VIRTUAL_BACKGROUNDS, VirtualBackgroundPreset, getVirtualBackground } from "@/lib/virtual-backgrounds";
import {
  Sparkles,
  Check,
  Image as ImageIcon,
  Upload,
  Users,
  Eye,
  Trash2,
  Palette,
  Camera,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BackgroundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBackgroundId: string;
  customBackgroundUrl?: string;
  onSelectBackground: (bgId: string, customUrl?: string) => void;
  isHost?: boolean;
}

export function BackgroundSelectorModal({
  isOpen,
  onClose,
  selectedBackgroundId,
  customBackgroundUrl,
  onSelectBackground,
  isHost = true,
}: BackgroundSelectorModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [customImage, setCustomImage] = useState<string | undefined>(customBackgroundUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "all", label: "All Backdrops" },
    { id: "curtains", label: "Curtains 🎪" },
    { id: "strips", label: "Color Strips 🎨" },
    { id: "scenic", label: "Scenic & Travel ✈️" },
    { id: "aesthetic", label: "Aesthetic 🌸" },
    { id: "studio", label: "Studio Colors ✨" },
    { id: "cyber", label: "Cyber Y2K ⚡" },
  ];

  const filtered =
    activeCategory === "all"
      ? VIRTUAL_BACKGROUNDS.filter((b) => b.id !== "none")
      : VIRTUAL_BACKGROUNDS.filter((b) => b.category === activeCategory && b.id !== "none");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomImage(result);
        onSelectBackground("custom", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isRealBackground = selectedBackgroundId === "none";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Background & Virtual Backdrop Studio"
      description="Choose whether to keep your real physical background or trim your body and apply a shared design backdrop in real time."
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-zinc-800/80 border border-white/10">
          <button
            type="button"
            onClick={() => onSelectBackground("none")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
              isRealBackground
                ? "bg-white text-zinc-950 shadow-md scale-102"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Camera className="w-4 h-4" />
            <span>Keep Real Background</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isRealBackground) {
                onSelectBackground(customImage ? "custom" : "cozy-curtain", customImage);
              }
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
              !isRealBackground
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-500/20 scale-102"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Trim & Apply Design</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Synced for all users:</strong> Click any backdrop to switch it live instantly!
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
              Upload Any Custom Background
            </span>
            {customImage && (
              <button
                onClick={() => {
                  setCustomImage(undefined);
                  if (selectedBackgroundId === "custom") onSelectBackground("cozy-curtain");
                }}
                className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Custom Image</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full p-4 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/5",
              selectedBackgroundId === "custom" && customImage
                ? "border-pink-500 bg-pink-500/10"
                : "border-white/20 text-zinc-300"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shadow-inner">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-white block">
                {customImage ? "Replace Uploaded Custom Design" : "Upload Your Own Background Design (JPG / PNG)"}
              </span>
              <span className="text-[11px] text-zinc-400">
                Choose any couple photo, anime landscape, vacation wallpaper, or aesthetic poster
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-800 border border-white/10 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  activeCategory === c.id
                    ? "bg-pink-500 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto no-scrollbar p-1">
            {filtered.map((bg) => {
              const isSelected = selectedBackgroundId === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => onSelectBackground(bg.id)}
                  className={cn(
                    "group p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between overflow-hidden",
                    isSelected
                      ? "bg-pink-500/20 border-pink-500 shadow-lg shadow-pink-500/25 scale-102"
                      : "bg-zinc-800/60 border-white/10 hover:border-white/25 hover:bg-zinc-800"
                  )}
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-zinc-900 border border-white/10 flex items-center justify-center">
                    {bg.type === "image" && bg.imageUrl ? (
                      <img
                        src={bg.imageUrl}
                        alt={bg.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : bg.type === "gradient" ? (
                      <div
                        className="w-full h-full"
                        style={{ background: bg.gradient }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-900/60 to-pink-900/60 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white">
                        Blur
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                      {bg.name}
                    </h5>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {bg.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <Button variant="primary" size="md" onClick={onClose}>
            <span>Done & Close</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
