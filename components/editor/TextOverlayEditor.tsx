"use client";

import React, { useState } from "react";
import { Type, Plus, Trash2 } from "lucide-react";
import { Button } from "@/ui/Button";
import { FONT_OPTIONS } from "@/lib/stickers";
import { TextItem } from "@/types/photobooth";

interface TextOverlayEditorProps {
  texts: TextItem[];
  onAddText: (text: string, fontFamily: string, color: string) => void;
  onRemoveText: (id: string) => void;
}

export function TextOverlayEditor({
  texts,
  onAddText,
  onRemoveText,
}: TextOverlayEditorProps) {
  const [inputText, setInputText] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].family);
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  const colors = [
    "#ffffff",
    "#f43f5e",
    "#ec4899",
    "#a855f7",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#18181b",
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddText(inputText.trim(), selectedFont, selectedColor);
    setInputText("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Type className="w-4 h-4 text-pink-400" />
          <span>Custom Text Captions</span>
        </h4>
        <p className="text-xs text-zinc-400 mt-0.5">
          Stamp personalized dates, nicknames, and handwritten notes.
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-4">
        <div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your memory caption..."
            maxLength={36}
            className="w-full px-4 py-3 rounded-2xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-2">
            Typography Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FONT_OPTIONS.map((font) => (
              <button
                type="button"
                key={font.id}
                onClick={() => setSelectedFont(font.family)}
                style={{ fontFamily: font.family }}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  selectedFont === font.family
                    ? "bg-pink-500/20 border-pink-500 text-white shadow-sm"
                    : "bg-zinc-800/60 border-white/10 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-2">
            Text Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {colors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  selectedColor === c ? "scale-125 border-pink-500 shadow-md" : "border-white/20"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full flex items-center justify-center gap-2"
          disabled={!inputText.trim()}
        >
          <Plus className="w-4 h-4" />
          <span>Stamp Text on Strip</span>
        </Button>
      </form>

      {texts.length > 0 && (
        <div className="pt-3 border-t border-white/10 space-y-2">
          <span className="text-[11px] uppercase font-bold text-zinc-400 block">
            Placed Texts ({texts.length})
          </span>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
            {texts.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/80 border border-white/10 text-xs"
              >
                <span
                  style={{ fontFamily: t.fontFamily, color: t.color }}
                  className="font-bold truncate max-w-[200px]"
                >
                  {t.text}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveText(t.id)}
                  className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
