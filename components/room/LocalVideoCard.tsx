"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Mic, MicOff, VideoOff, Sparkles } from "lucide-react";
import { FilterType } from "@/types/filter";
import { getFilterPreset } from "@/lib/filters";
import { getVirtualBackground } from "@/lib/virtual-backgrounds";
import { segmentationEngine } from "@/lib/segmentation-engine";
import { cn } from "@/lib/utils";

interface LocalVideoCardProps {
  stream: MediaStream | null;
  displayName: string;
  isMicActive: boolean;
  isCameraActive: boolean;
  isMirrored: boolean;
  filter: FilterType;
  virtualBackground?: string;
  customBackgroundUrl?: string;
  className?: string;
}

export function LocalVideoCard({
  stream,
  displayName,
  isMicActive,
  isCameraActive,
  isMirrored,
  filter,
  virtualBackground = "none",
  customBackgroundUrl,
  className,
}: LocalVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterPreset = useMemo(() => getFilterPreset(filter), [filter]);
  const bgPreset = useMemo(
    () => getVirtualBackground(virtualBackground, customBackgroundUrl),
    [virtualBackground, customBackgroundUrl]
  );

  const isSegmenting = bgPreset.type !== "none";

  useEffect(() => {
    segmentationEngine.init();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.setAttribute("playsinline", "true");
      videoRef.current.setAttribute("webkit-playsinline", "true");
      videoRef.current.playsInline = true;
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    let animId: number;

    const renderLoop = async () => {
      if (
        isSegmenting &&
        videoRef.current &&
        canvasRef.current &&
        isCameraActive &&
        videoRef.current.readyState >= 2
      ) {
        await segmentationEngine.renderSegmentedFrame(
          videoRef.current,
          canvasRef.current,
          bgPreset,
          isMirrored,
          "local"
        );
      }
      animId = requestAnimationFrame(renderLoop);
    };

    if (isCameraActive) {
      animId = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isSegmenting, bgPreset, isMirrored, isCameraActive]);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[260px] rounded-3xl overflow-hidden bg-[#181614] border border-white/10 shadow-2xl flex items-center justify-center group",
        className
      )}
    >
      {stream && isCameraActive ? (
        <>
          <video
            ref={videoRef}
            data-video-source={!isSegmenting ? "true" : undefined}
            autoPlay
            playsInline
            muted
            style={{
              filter: filterPreset.cssFilter,
              position: isSegmenting ? "absolute" : "relative",
              opacity: isSegmenting ? 0 : 1,
              pointerEvents: "none",
            }}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              isMirrored && "-scale-x-100"
            )}
          />

          <canvas
            ref={canvasRef}
            data-video-source={isSegmenting ? "true" : undefined}
            style={{
              filter: filterPreset.cssFilter,
              position: isSegmenting ? "relative" : "absolute",
              opacity: isSegmenting ? 1 : 0,
              pointerEvents: "none",
            }}
            className="w-full h-full object-cover transition-opacity duration-200"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-zinc-500 gap-3 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-400">
            <VideoOff className="w-8 h-8" />
          </div>
          <span className="text-xs font-semibold text-zinc-400 font-sans">Camera is turned off</span>
        </div>
      )}

      {filterPreset.overlayGradient && isCameraActive && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
          style={{ background: filterPreset.overlayGradient }}
        />
      )}

      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold text-white border border-white/15 flex items-center gap-2 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F61] shadow-sm shadow-[#FF6F61]/50 animate-pulse" />
          <span className="tracking-wide">{displayName} (You)</span>
        </span>
        {isSegmenting && (
          <span className="px-2.5 py-1 rounded-full bg-pink-500/20 backdrop-blur-md text-[11px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {bgPreset.name}
          </span>
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "p-2 rounded-full backdrop-blur-md border text-xs shadow-md transition-all",
              isMicActive
                ? "bg-black/60 text-white border-white/10"
                : "bg-red-500/80 text-white border-red-400"
            )}
          >
            {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    </div>
  );
}
