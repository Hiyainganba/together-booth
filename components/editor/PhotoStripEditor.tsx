"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhotoStripProject, StripLayoutType, CapturedShot } from "@/types/photobooth";
import { useEditorStore } from "@/store/useEditorStore";
import { PhotoStripCanvas } from "./PhotoStripCanvas";
import { FilterSelector } from "./FilterSelector";
import { FrameSelector } from "./FrameSelector";
import { StickerTray } from "./StickerTray";
import { TextOverlayEditor } from "./TextOverlayEditor";
import { BackgroundColorPicker } from "./BackgroundColorPicker";
import { PhotoCropModal } from "./PhotoCropModal";
import { ExportModal } from "./ExportModal";
import { Tabs, TabOption } from "@/ui/Tabs";
import { Button } from "@/ui/Button";
import {
  ArrowLeft,
  Download,
  LayoutGrid,
  Sparkles,
  Layers,
  Smile,
  Type,
  Palette,
  Camera,
  Calendar,
  Settings2,
  Crop,
  Users,
  Check,
  Scissors,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

interface PhotoStripEditorProps {
  initialProject: PhotoStripProject;
}

export function PhotoStripEditor({ initialProject }: PhotoStripEditorProps) {
  const router = useRouter();
  const addPhotoInputRef = useRef<HTMLInputElement>(null);

  const {
    project,
    activeTab,
    isCropModalOpen,
    activeCropShotIndex,
    isRemovingBackground,
    setProject,
    setActiveTab,
    setLayout,
    setFilter,
    setFrameStyle,
    setBackgroundColor,
    setPhotoBackdrop,
    setVirtualBackground,
    addSticker,
    updateSticker,
    removeSticker,
    addText,
    updateText,
    removeText,
    setCustomStampText,
    toggleDateStamp,
    setIsCropModalOpen,
    updateShotTransform,
    setApplyToAllUsers,
    removeShotBackground,
    toggleAllBackgroundRemoval,
    deleteShot,
    moveShot,
    replaceShotImage,
    addShot,
  } = useEditorStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  React.useEffect(() => {
    setProject(initialProject);
  }, [initialProject, setProject]);

  const currentProject = project || initialProject;

  const tabs: TabOption[] = [
    { id: "layout", label: "Layout", icon: LayoutGrid },
    { id: "filter", label: "Filters", icon: Sparkles },
    { id: "frame", label: "Frames", icon: Layers },
    { id: "stickers", label: "Stickers", icon: Smile },
    { id: "text", label: "Text", icon: Type },
    { id: "background", label: "Backdrop", icon: Palette },
  ];

  const layouts: { id: StripLayoutType; label: string; desc: string }[] = [
    { id: "strip-3", label: "Classic 3-Cut Strip", desc: "Timeless vertical photobooth strip" },
    { id: "strip-4", label: "4-Cut Strip", desc: "Long format 4-shot sequence" },
    { id: "grid-4", label: "2×2 Square Grid", desc: "Modern Instagram square collage" },
    { id: "couple-split", label: "Couple Split Screen", desc: "Romantic side-by-side frame" },
    { id: "polaroid-single", label: "Polaroid Single", desc: "Classic wide instant photo" },
  ];

  const allShotsRemoved = Boolean(
    currentProject.shotsBackgroundRemoved ||
      (currentProject.shots.length > 0 &&
        currentProject.shots.every((s) => s.isBackgroundRemoved && s.personOnlyDataUrl))
  );

  const handleReplaceShot = (shotIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        replaceShotImage(shotIndex, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newShot: CapturedShot = {
            shotIndex: currentProject.shots.length + 1,
            timestamp: Date.now(),
            compositeDataUrl: dataUrl,
            originalDataUrl: dataUrl,
            individualFrames: [],
          };
          addShot(newShot);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <input
        ref={addPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleAddCustomPhoto}
        className="hidden"
      />

      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Booth</span>
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Photobooth Customizer</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Studio
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="glass"
            size="md"
            disabled={isRemovingBackground}
            onClick={() => toggleAllBackgroundRemoval()}
            className={`flex items-center gap-2 transition-all cursor-pointer ${
              allShotsRemoved
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-pink-500/40 text-pink-300 hover:bg-pink-500/20 shadow-md shadow-pink-500/15"
            }`}
          >
            {isRemovingBackground ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                <span className="hidden sm:inline">Trimming Background...</span>
              </>
            ) : allShotsRemoved ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">✓ Backgrounds Trimmed</span>
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4 text-pink-400" />
                <span className="hidden sm:inline">✂️ AI Background Remover</span>
              </>
            )}
          </Button>

          <Button
            variant="glass"
            size="md"
            onClick={() => setIsCropModalOpen(true, 1)}
            className="flex items-center gap-2 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
          >
            <Crop className="w-4 h-4 text-zinc-300" />
            <span className="hidden sm:inline">Crop & Align</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsExportModalOpen(true)}
            className="shadow-xl shadow-pink-500/25 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export & Save</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[500px] rounded-3xl bg-zinc-900/40 border border-white/10 p-4 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Live Preview ({currentProject.shots.length} Photos)</span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => addPhotoInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-pink-300 flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Photo</span>
            </button>

            <button
              onClick={() => setIsCropModalOpen(true, 1)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop</span>
            </button>
          </div>

          <PhotoStripCanvas
            project={currentProject}
            onUpdateSticker={updateSticker}
            onRemoveSticker={removeSticker}
            onUpdateText={updateText}
            onRemoveText={removeText}
            onOpenCropModal={(shotIndex) => setIsCropModalOpen(true, shotIndex)}
            onToggleRemoveBackground={removeShotBackground}
            onDeleteShot={deleteShot}
            onMoveShot={moveShot}
            onReplaceShot={handleReplaceShot}
            isRemovingBg={isRemovingBackground}
          />
        </div>

        <div className="lg:col-span-5 rounded-3xl bg-zinc-900/80 border border-white/10 p-6 backdrop-blur-2xl shadow-2xl space-y-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tabId: string) => setActiveTab(tabId as typeof activeTab)}
          />

          <div className="min-h-[360px]">
            {activeTab === "layout" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-pink-400" />
                    <span>Photo Strip Format</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Choose vertical strip cuts, square grids, or split screens.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {layouts.map((l) => {
                    const isSelected = currentProject.layout === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setLayout(l.id)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-pink-500/15 border-pink-500 shadow-md shadow-pink-500/20"
                            : "bg-zinc-800/60 border-white/10 hover:bg-zinc-800"
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-bold text-white">{l.label}</h5>
                          <p className="text-[11px] text-zinc-400">{l.desc}</p>
                        </div>
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "filter" && (
              <FilterSelector
                activeFilter={currentProject.filter}
                onSelectFilter={setFilter}
                sampleImage={currentProject.shots[0]?.compositeDataUrl}
              />
            )}

            {activeTab === "frame" && (
              <FrameSelector
                activeFrame={currentProject.frameStyle}
                onSelectFrame={setFrameStyle}
              />
            )}

            {activeTab === "stickers" && (
              <StickerTray
                onAddSticker={addSticker}
                placedCount={currentProject.stickers.length}
                onClearAll={() => {
                  currentProject.stickers.forEach((s) => removeSticker(s.id));
                }}
              />
            )}

            {activeTab === "text" && (
              <TextOverlayEditor
                texts={currentProject.texts}
                onAddText={addText}
                onRemoveText={removeText}
              />
            )}

            {activeTab === "background" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Trim Body & Remove Real BG
                      </span>
                      <span className="text-[10px] text-zinc-300">
                        Isolate person body parts on all shots
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={allShotsRemoved ? "secondary" : "primary"}
                    disabled={isRemovingBackground}
                    onClick={() => toggleAllBackgroundRemoval()}
                    className="text-xs"
                  >
                    {isRemovingBackground ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : allShotsRemoved ? (
                      "✓ Trimmed"
                    ) : (
                      "Trim Now"
                    )}
                  </Button>
                </div>

                <BackgroundColorPicker
                  currentColor={currentProject.backgroundColor}
                  onSelectColor={setBackgroundColor}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Apply Design to All Users
                  </span>
                  <span className="text-[10px] text-pink-300/80">
                    Sync strip layout, filter, frame & theme to room
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setApplyToAllUsers(!currentProject.applyToAllUsers)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  currentProject.applyToAllUsers ? "bg-pink-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    currentProject.applyToAllUsers ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Card Footer Stamp</span>
              </h5>

              <input
                type="text"
                value={currentProject.customStampText}
                onChange={(e) => setCustomStampText(e.target.value)}
                placeholder="Custom Header Title (e.g. TOGETHER BOOTH)"
                maxLength={30}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-pink-500"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Show Date & Timestamp</span>
                <button
                  type="button"
                  onClick={toggleDateStamp}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    currentProject.showDateStamp ? "bg-pink-500" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      currentProject.showDateStamp ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PhotoCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        shots={currentProject.shots}
        onUpdateShotTransform={updateShotTransform}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={currentProject}
      />
    </div>
  );
}
