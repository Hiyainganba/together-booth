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
  isHost?: boolean;
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
  isHost = false,
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
    const videoEl = videoRef.current;
    if (!videoEl || !stream) return;

    videoEl.setAttribute("playsinline", "true");
    videoEl.setAttribute("webkit-playsinline", "true");
    videoEl.playsInline = true;
    videoEl.autoplay = true;
    videoEl.srcObject = stream;

    const playVideo = () => {
      videoEl.play().catch(() => {
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      });
    };

    playVideo();
    videoEl.onloadedmetadata = playVideo;

    const handleTrack = () => {
      videoEl.srcObject = stream;
      playVideo();
    };

    stream.addEventListener("addtrack", handleTrack);
    stream.addEventListener("removetrack", handleTrack);

    return () => {
      stream.removeEventListener("addtrack", handleTrack);
      stream.removeEventListener("removetrack", handleTrack);
      videoEl.onloadedmetadata = null;
    };
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

  const userRole = isHost ? "host" : "guest";

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[260px] rounded-3xl overflow-hidden bg-[#181614] border border-white/10 shadow-2xl flex items-center justify-center group",
        className
      )}
    >
      {stream ? (
        <>
          <video
            ref={videoRef}
            data-video-source="true"
            data-video-role="remote"
            data-video-user={userRole}
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
            data-video-source="true"
            data-video-role="remote"
            data-video-user={userRole}
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
          <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-400 animate-pulse">
            <User className="w-8 h-8" />
          </div>
          <span className="text-xs font-semibold text-zinc-400 font-sans">Connecting live video...</span>
        </div>
      )}

      {filterPreset.overlayGradient && stream && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
          style={{ background: filterPreset.overlayGradient }}
        />
      )}

      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold text-white border border-white/15 flex items-center gap-2 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
          <span className="tracking-wide">{displayName}</span>
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
              !isAudioMuted
                ? "bg-black/60 text-white border-white/10"
                : "bg-red-500/80 text-white border-red-400"
            )}
          >
            {!isAudioMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    </div>
  );
}
