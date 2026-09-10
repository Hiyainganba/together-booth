"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { PhotoStripProject, StickerItem, TextItem } from "@/types/photobooth";
import { getFrameOption } from "@/lib/frames";
import { getFilterPreset } from "@/lib/filters";
import { formatDate } from "@/lib/utils";
import {
  X,
  Crop,
  Sparkles,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Plus,
} from "lucide-react";

interface PhotoStripCanvasProps {
  project: PhotoStripProject;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onRemoveSticker: (id: string) => void;
  onUpdateText: (id: string, updates: Partial<TextItem>) => void;
  onRemoveText: (id: string) => void;
  onOpenCropModal?: (shotIndex: number) => void;
  onToggleRemoveBackground?: (shotIndex: number) => void;
  onDeleteShot?: (shotIndex: number) => void;
  onMoveShot?: (fromIndex: number, toIndex: number) => void;
  onReplaceShot?: (shotIndex: number, file: File) => void;
  isRemovingBg?: boolean;
}

export function PhotoStripCanvas({
  project,
  onUpdateSticker,
  onRemoveSticker,
  onUpdateText,
  onRemoveText,
  onOpenCropModal,
  onToggleRemoveBackground,
  onDeleteShot,
  onMoveShot,
  onReplaceShot,
  isRemovingBg = false,
}: PhotoStripCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const activeReplaceIndexRef = useRef<number>(1);

  const frame = getFrameOption(project.frameStyle);
  const filterPreset = getFilterPreset(project.filter);

  const isVertical = project.layout === "strip-3" || project.layout === "strip-4";
  const isGrid = project.layout === "grid-4";
  const isCoupleSplit = project.layout === "couple-split";

  const totalShots = project.shots.length;

  const isImageBg =
    project.backgroundColor.startsWith("data:image") || project.backgroundColor.startsWith("http");
  const isGradientBg = project.backgroundColor.includes("gradient");
  const isCustomColor =
    project.backgroundColor &&
    project.backgroundColor !== "transparent" &&
    !isImageBg &&
    !isGradientBg;

  const bgStyle: React.CSSProperties = isImageBg
    ? {
        backgroundImage: `url("${project.backgroundColor}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : isGradientBg
    ? {
        background: project.backgroundColor,
      }
    : isCustomColor
    ? {
        backgroundColor: project.backgroundColor,
      }
    : {
        background: frame.bgGradient,
      };

  const getShotTransformStyle = (shotIndex: number) => {
    const shot = project.shots.find((s) => s.shotIndex === shotIndex) || project.shots[shotIndex - 1];
    if (!shot?.transform) return undefined;
    const { zoom, panX, panY, rotation, flipX, flipY } = shot.transform;
    return {
      transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg) scaleX(${
        flipX ? -1 : 1
      }) scaleY(${flipY ? -1 : 1})`,
      transition: "transform 0.15s ease-out",
    };
  };

  const getFrameBackdropStyle = () => {
    const backdrop =
      project.photoBackdrop ||
      (isImageBg || isGradientBg || isCustomColor ? project.backgroundColor : "");

    if (backdrop.startsWith("data:image") || backdrop.startsWith("http")) {
      return {
        backgroundImage: `url("${backdrop}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (backdrop.includes("gradient")) {
      return { background: backdrop };
    }
    if (backdrop && backdrop !== "transparent") {
      return { backgroundColor: backdrop };
    }
    return {
      background: "radial-gradient(circle at center, #27272a 0%, #18181b 100%)",
    };
  };

  const triggerReplacePhoto = (shotIndex: number) => {
    activeReplaceIndexRef.current = shotIndex;
    replaceFileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReplaceShot) {
      onReplaceShot(activeReplaceIndexRef.current, file);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center p-4 sm:p-8 select-none">
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        ref={containerRef}
        style={bgStyle}
        className={`relative rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border transition-all duration-300 ${
          isVertical
            ? "w-[300px] sm:w-[340px]"
            : isGrid
            ? "w-[340px] sm:w-[460px]"
            : isCoupleSplit
            ? "w-[340px] sm:w-[480px]"
            : "w-[300px] sm:w-[380px]"
        }`}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-200/90 text-amber-950 font-mono text-[10px] font-bold uppercase rounded shadow-sm z-20">
          ━━━━ TOGETHER BOOTH ━━━━
        </div>

        {isVertical && (
          <div className="space-y-3.5 pt-3">
            {project.shots.map((shot, idx) => {
              const shotIndex = shot.shotIndex;
              const transformStyle = getShotTransformStyle(shotIndex);
              const isBgRemoved = Boolean(shot?.isBackgroundRemoved && shot?.personOnlyDataUrl);
              const displaySrc = isBgRemoved ? shot.personOnlyDataUrl : shot?.compositeDataUrl;

              return (
                <div
                  key={shotIndex}
                  style={isBgRemoved ? getFrameBackdropStyle() : undefined}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-inner group"
                >
                  {displaySrc ? (
                    <img
                      src={displaySrc}
                      alt={`Shot ${shotIndex}`}
                      style={{
                        filter: filterPreset.cssFilter,
                        ...transformStyle,
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-semibold">
                      Photo {shotIndex}
                    </div>
                  )}
                  {filterPreset.overlayGradient && (
                    <div
                      className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
                      style={{ background: filterPreset.overlayGradient }}
                    />
                  )}

                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {onMoveShot && totalShots > 1 && (
                      <div className="flex items-center gap-0.5 bg-zinc-950/80 backdrop-blur-md rounded-lg p-0.5 border border-white/10">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => onMoveShot(idx, idx - 1)}
                            className="p-1 text-zinc-300 hover:text-white cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {idx < totalShots - 1 && (
                          <button
                            type="button"
                            onClick={() => onMoveShot(idx, idx + 1)}
                            className="p-1 text-zinc-300 hover:text-white cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    {onDeleteShot && totalShots > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteShot(shotIndex)}
                        className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white shadow-md cursor-pointer transition-colors"
                        title="Delete this photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {onToggleRemoveBackground && (
                      <button
                        type="button"
                        disabled={isRemovingBg}
                        onClick={() => onToggleRemoveBackground(shotIndex)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer shadow-lg flex items-center gap-1 ${
                          isBgRemoved
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-zinc-950/85 backdrop-blur-md border-white/20 text-white hover:bg-pink-500"
                        }`}
                      >
                        {isRemovingBg ? (
                          <Loader2 className="w-3 h-3 animate-spin text-white" />
                        ) : isBgRemoved ? (
                          <>
                            <Sparkles className="w-3 h-3 text-emerald-200" />
                            <span>✓ Trimmed</span>
                          </>
                        ) : (
                          <span>✂️ Remove BG</span>
                        )}
                      </button>
                    )}

                    {onReplaceShot && (
                      <button
                        type="button"
                        onClick={() => triggerReplacePhoto(shotIndex)}
                        className="p-1.5 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white hover:bg-pink-500 cursor-pointer shadow-lg"
                        title="Replace Photo"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                    )}

                    {onOpenCropModal && (
                      <button
                        type="button"
                        onClick={() => onOpenCropModal(shotIndex)}
                        className="px-2.5 py-1 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1 shadow-lg hover:bg-pink-500 cursor-pointer"
                      >
                        <Crop className="w-3 h-3" />
                        <span>Crop</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isGrid && (
          <div className="grid grid-cols-2 gap-3 pt-3">
            {project.shots.map((shot, idx) => {
              const shotIndex = shot.shotIndex;
              const transformStyle = getShotTransformStyle(shotIndex);
              const isBgRemoved = Boolean(shot?.isBackgroundRemoved && shot?.personOnlyDataUrl);
              const displaySrc = isBgRemoved ? shot.personOnlyDataUrl : shot?.compositeDataUrl;

              return (
                <div
                  key={shotIndex}
                  style={isBgRemoved ? getFrameBackdropStyle() : undefined}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-inner group"
                >
                  {displaySrc ? (
                    <img
                      src={displaySrc}
                      alt={`Grid ${shotIndex}`}
                      style={{
                        filter: filterPreset.cssFilter,
                        ...transformStyle,
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-semibold">
                      Frame {shotIndex}
                    </div>
                  )}

                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {onDeleteShot && totalShots > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteShot(shotIndex)}
                        className="p-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white shadow cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {onToggleRemoveBackground && (
                      <button
                        type="button"
                        disabled={isRemovingBg}
                        onClick={() => onToggleRemoveBackground(shotIndex)}
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer shadow ${
                          isBgRemoved
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-zinc-950/85 backdrop-blur-md border-white/20 text-white hover:bg-pink-500"
                        }`}
                      >
                        {isRemovingBg ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : isBgRemoved ? "✓" : "✂️"}
                      </button>
                    )}
                    {onReplaceShot && (
                      <button
                        type="button"
                        onClick={() => triggerReplacePhoto(shotIndex)}
                        className="p-1 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-white/20 text-white hover:bg-pink-500 cursor-pointer shadow"
                      >
                        <Upload className="w-2.5 h-2.5" />
                      </button>
                    )}
                    {onOpenCropModal && (
                      <button
                        type="button"
                        onClick={() => onOpenCropModal(shotIndex)}
                        className="px-2 py-0.5 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white flex items-center gap-1 shadow hover:bg-pink-500 cursor-pointer"
                      >
                        <Crop className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isCoupleSplit && (
          <div className="grid grid-cols-2 gap-3 pt-3">
            {Array.from({ length: 2 }).map((_, idx) => {
              const shot = project.shots[0];
              const participantFrame = shot?.individualFrames?.[idx];
              const isBgRemoved = Boolean(shot?.isBackgroundRemoved && shot?.personOnlyDataUrl);
              const src = isBgRemoved
                ? shot.personOnlyDataUrl
                : participantFrame?.dataUrl || shot?.compositeDataUrl;
              const transformStyle = getShotTransformStyle(shot?.shotIndex || 1);

              return (
                <div
                  key={idx}
                  style={isBgRemoved ? getFrameBackdropStyle() : undefined}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-inner group"
                >
                  {src ? (
                    <img
                      src={src}
                      alt={`Partner ${idx + 1}`}
                      style={{
                        filter: filterPreset.cssFilter,
                        ...transformStyle,
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-semibold">
                      User {idx + 1}
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {onToggleRemoveBackground && (
                      <button
                        type="button"
                        disabled={isRemovingBg}
                        onClick={() => onToggleRemoveBackground(1)}
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer shadow ${
                          isBgRemoved
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-zinc-950/85 backdrop-blur-md border-white/20 text-white hover:bg-pink-500"
                        }`}
                      >
                        {isRemovingBg ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : isBgRemoved ? "✓ Trim" : "✂️ BG"}
                      </button>
                    )}
                    {onOpenCropModal && (
                      <button
                        type="button"
                        onClick={() => onOpenCropModal(1)}
                        className="px-2 py-0.5 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white flex items-center gap-1 shadow hover:bg-pink-500 cursor-pointer"
                      >
                        <Crop className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isVertical && !isGrid && !isCoupleSplit && (
          <div className="pt-3">
            <div
              style={project.shots[0]?.isBackgroundRemoved ? getFrameBackdropStyle() : undefined}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-inner group"
            >
              {project.shots[0]?.compositeDataUrl ? (
                <img
                  src={
                    project.shots[0]?.isBackgroundRemoved && project.shots[0]?.personOnlyDataUrl
                      ? project.shots[0].personOnlyDataUrl
                      : project.shots[0].compositeDataUrl
                  }
                  alt="Single Shot"
                  style={{
                    filter: filterPreset.cssFilter,
                    ...getShotTransformStyle(project.shots[0].shotIndex || 1),
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-semibold">
                  Photo Shot
                </div>
              )}

              <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {onToggleRemoveBackground && (
                  <button
                    type="button"
                    disabled={isRemovingBg}
                    onClick={() => onToggleRemoveBackground(project.shots[0]?.shotIndex || 1)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow hover:bg-pink-500 cursor-pointer flex items-center gap-1"
                  >
                    {isRemovingBg ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : project.shots[0]?.isBackgroundRemoved ? (
                      "✓ Trimmed"
                    ) : (
                      "✂️ Remove BG"
                    )}
                  </button>
                )}
                {onReplaceShot && (
                  <button
                    type="button"
                    onClick={() => triggerReplacePhoto(project.shots[0]?.shotIndex || 1)}
                    className="p-1.5 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white hover:bg-pink-500 cursor-pointer shadow-lg"
                    title="Replace Photo"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                )}
                {onOpenCropModal && (
                  <button
                    type="button"
                    onClick={() => onOpenCropModal(project.shots[0]?.shotIndex || 1)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg hover:bg-pink-500 cursor-pointer"
                  >
                    <Crop className="w-3 h-3" />
                    <span>Crop</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-4 pb-1 border-t border-white/10 mt-4">
          <p
            style={{ color: frame.textColor }}
            className="font-extrabold text-sm sm:text-base tracking-widest uppercase font-mono"
          >
            {project.customStampText || "TOGETHER BOOTH"}
          </p>
          {project.showDateStamp && (
            <p
              style={{ color: frame.stampColor }}
              className="text-[11px] font-mono mt-0.5 tracking-wider font-semibold"
            >
              • {formatDate(project.createdAt)} •
            </p>
          )}
        </div>

        {project.stickers.map((stk) => (
          <motion.div
            key={stk.id}
            drag
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
            style={{
              position: "absolute",
              top: `${stk.y}%`,
              left: `${stk.x}%`,
              zIndex: stk.zIndex || 20,
              rotate: stk.rotation,
              scale: stk.scale,
            }}
            className="cursor-grab active:cursor-grabbing group relative select-none"
          >
            <span className="text-3xl sm:text-4xl drop-shadow-lg block pointer-events-none">
              {stk.content}
            </span>
            <button
              onClick={() => onRemoveSticker(stk.id)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}

        {project.texts.map((t) => (
          <motion.div
            key={t.id}
            drag
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
            style={{
              position: "absolute",
              top: `${t.y}%`,
              left: `${t.x}%`,
              zIndex: t.zIndex || 25,
              fontFamily: t.fontFamily,
              color: t.color,
              fontSize: `${t.fontSize}px`,
            }}
            className="cursor-grab active:cursor-grabbing group relative select-none font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-2 py-0.5 rounded border border-transparent hover:border-dashed hover:border-white/40"
          >
            <span>{t.text}</span>
            <button
              onClick={() => onRemoveText(t.id)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
