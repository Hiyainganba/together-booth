"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePhotobooth } from "@/hooks/usePhotobooth";
import { useAuth } from "@/hooks/useAuth";
import { useEditorStore } from "@/store/useEditorStore";
import { LocalVideoCard } from "@/components/room/LocalVideoCard";
import { CountdownOverlay } from "@/components/room/CountdownOverlay";
import { CaptureFlash } from "@/components/room/CaptureFlash";
import { RoomSettingsModal } from "@/components/room/RoomSettingsModal";
import { BackgroundSelectorModal } from "@/components/room/BackgroundSelectorModal";
import { PhotoStripProject, CapturedShot } from "@/types/photobooth";
import { FilterType, FilterPreset } from "@/types/filter";
import { FILTER_PRESETS } from "@/lib/filters";
import { generateId } from "@/lib/utils";
import { Button } from "@/ui/Button";
import {
  Camera,
  Settings,
  Sparkles,
  FlipHorizontal,
  Clock,
  Layers,
  ArrowLeft,
  Image as ImageIcon,
  Palette,
  Heart,
  Sliders,
} from "lucide-react";

export default function SoloBoothPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setProject } = useEditorStore();

  const {
    localStream,
    isCameraActive,
    isMicActive,
    isMirrored,
    activeFilter,
    isCapturing,
    countdownValue,
    showFlash,
    availableCameras,
    selectedCameraId,
    toggleCamera,
    toggleMic,
    toggleMirror,
    setActiveFilter,
    setSelectedCameraId,
    startPhotoSession,
  } = usePhotobooth();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState<number>(3);
  const [shotCount, setShotCount] = useState<number>(3);
  const [virtualBackground, setVirtualBackground] = useState<string>("none");
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | undefined>(undefined);

  const displayName = user?.displayName || "You";

  const handleStartCapture = () => {
    if (isCapturing) return;

    startPhotoSession(
      shotCount,
      countdownDuration,
      (shots: CapturedShot[]) => {
        const projectId = generateId("proj");
        const initialProject: PhotoStripProject = {
          id: projectId,
          roomId: "SOLO",
          roomName: "Studio Photobooth",
          createdAt: Date.now(),
          shots,
          layout: shotCount === 4 ? "grid-4" : "strip-3",
          filter: activeFilter,
          frameStyle: "classic-white",
          backgroundColor: "transparent",
          virtualBackground,
          customBackgroundUrl,
          stickers: [],
          texts: [],
          showDateStamp: true,
          showRoomStamp: true,
          customStampText: "TOGETHER BOOTH",
          applyToAllUsers: true,
        };

        setProject(initialProject);
        router.push(`/editor/${projectId}`);
      }
    );
  };

  const handleSelectBackdrop = (bgId: string, customUrl?: string) => {
    setVirtualBackground(bgId);
    if (customUrl) {
      setCustomBackgroundUrl(customUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-white flex flex-col justify-between overflow-hidden relative selection:bg-pink-500 selection:text-white">
      <header className="h-16 border-b border-white/10 bg-[#161412]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F61] shadow-sm shadow-[#FF6F61]/50 animate-pulse" />
            <h1 className="text-sm sm:text-base font-bold tracking-wider font-serif uppercase text-white">
              Studio Photobooth
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/memories"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 border border-white/10 transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>My Memories</span>
          </Link>

          <button
            onClick={() => setIsBackdropOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all"
            title="Choose Virtual Backdrop"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all"
            title="Camera Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-full h-[58vh] sm:h-[64vh] max-h-[580px] max-w-3xl relative">
          <LocalVideoCard
            stream={localStream}
            displayName={displayName}
            isMicActive={isMicActive}
            isCameraActive={isCameraActive}
            isMirrored={isMirrored}
            filter={activeFilter}
            isHost={true}
            virtualBackground={virtualBackground}
            customBackgroundUrl={customBackgroundUrl}
          />
        </div>

        <div className="w-full max-w-2xl mt-4 flex items-center justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_PRESETS.map((f: FilterPreset) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === f.id
                  ? "bg-gradient-to-r from-[#FF6F61] to-[#E9A842] text-white shadow-md font-bold scale-105"
                  : "bg-[#1C1A18] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </main>

      <footer className="w-full bg-[#141210]/95 border-t border-white/10 backdrop-blur-xl p-3 sm:p-4 z-30">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1C1A18] p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setCountdownDuration(3)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  countdownDuration === 3 ? "bg-[#FF6F61] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                3s
              </button>
              <button
                onClick={() => setCountdownDuration(5)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  countdownDuration === 5 ? "bg-[#FF6F61] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                5s
              </button>
              <button
                onClick={() => setCountdownDuration(10)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  countdownDuration === 10 ? "bg-[#FF6F61] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                10s
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#1C1A18] p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setShotCount(3)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  shotCount === 3 ? "bg-[#E9A842] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                3-Strip
              </button>
              <button
                onClick={() => setShotCount(4)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  shotCount === 4 ? "bg-[#E9A842] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                4-Grid
              </button>
            </div>

            <button
              onClick={toggleMirror}
              className={`p-2 rounded-xl border transition-all ${
                isMirrored ? "bg-white/15 border-white/20 text-white" : "bg-[#1C1A18] border-white/10 text-zinc-400"
              }`}
              title="Toggle Camera Mirror"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleStartCapture}
            disabled={isCapturing}
            className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-r from-[#FF6F61] via-[#F0718F] to-[#E9A842] text-white shadow-lg shadow-[#FF6F61]/25 hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-5 h-5 animate-pulse" />
            <span>Take Photos 📸</span>
          </button>
        </div>
      </footer>

      <CountdownOverlay countdownValue={countdownValue} />
      <CaptureFlash showFlash={showFlash} />

      <RoomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        availableCameras={availableCameras}
        selectedCameraId={selectedCameraId}
        isMirrored={isMirrored}
        onSelectCamera={setSelectedCameraId}
        onToggleMirror={toggleMirror}
      />

      <BackgroundSelectorModal
        isOpen={isBackdropOpen}
        onClose={() => setIsBackdropOpen(false)}
        selectedBackgroundId={virtualBackground}
        customBackgroundUrl={customBackgroundUrl}
        onSelectBackground={handleSelectBackdrop}
        isHost={true}
      />
    </div>
  );
}
