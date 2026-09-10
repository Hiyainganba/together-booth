"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Mic, MicOff, User, Sparkles } from "lucide-react";
import { FilterType } from "@/types/filter";
import { getFilterPreset } from "@/lib/filters";
import { getVirtualBackground } from "@/lib/virtual-backgrounds";
import { segmentationEngine } from "@/lib/segmentation-engine";
import { cn } from "@/lib/utils";

interface PeerVideoCardProps {
  stream?: MediaStream;
  displayName: string;
  peerId?: string;
  isAudioMuted?: boolean;
  filter: FilterType;
  virtualBackground?: string;
  customBackgroundUrl?: string;
  className?: string;
}

export function PeerVideoCard({
  stream,
  displayName,
  peerId = "peer",
  isAudioMuted = false,
  filter,
  virtualBackground = "none",
  customBackgroundUrl,
  className,
}: PeerVideoCardProps) {
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
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    let animId: number;

    const renderLoop = async () => {
      if (
        isSegmenting &&
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState >= 2
      ) {
        await segmentationEngine.renderSegmentedFrame(
          videoRef.current,
          canvasRef.current,
          bgPreset,
          false,
          `peer_${peerId}`
        );
      }
      animId = requestAnimationFrame(renderLoop);
    };

    if (stream) {
      animId = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isSegmenting, bgPreset, stream, peerId]);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[260px] rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl flex items-center justify-center group",
        className
      )}
    >
      {stream ? (
        <>
          <video
            ref={videoRef}
            data-video-source={!isSegmenting ? "true" : undefined}
            autoPlay
            playsInline
            style={{
              filter: filterPreset.cssFilter,
              position: isSegmenting ? "absolute" : "relative",
              opacity: isSegmenting ? 0 : 1,
              pointerEvents: "none",
            }}
            className="w-full h-full object-cover transition-opacity duration-200"
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
        <div className="flex flex-col items-center justify-center text-zinc-500 gap-2">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 animate-pulse">
            <User className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold">Connecting stream...</span>
        </div>
      )}

      {filterPreset.overlayGradient && stream && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
          style={{ background: filterPreset.overlayGradient }}
        />
      )}

      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white border border-white/10 flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {displayName}
        </span>
        {isSegmenting && (
          <span className="px-2 py-0.5 rounded-full bg-pink-500/20 backdrop-blur-md text-[10px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {bgPreset.name}
          </span>
        )}
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <div
          className={cn(
            "p-2 rounded-full backdrop-blur-md border text-xs shadow-md",
            !isAudioMuted
              ? "bg-black/60 text-white border-white/10"
              : "bg-red-500/80 text-white border-red-400"
          )}
        >
          {!isAudioMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
}
