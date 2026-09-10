"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { useWebRTC } from "@/hooks/useWebRTC";
import { usePhotobooth } from "@/hooks/usePhotobooth";
import { useAuth } from "@/hooks/useAuth";
import { roomService } from "@/services/roomService";
import { RoomHeader } from "@/components/room/RoomHeader";
import { VideoGrid } from "@/components/room/VideoGrid";
import { RoomControls } from "@/components/room/RoomControls";
import { CountdownOverlay } from "@/components/room/CountdownOverlay";
import { CaptureFlash } from "@/components/room/CaptureFlash";
import { RoomShareModal } from "@/components/room/RoomShareModal";
import { RoomSettingsModal } from "@/components/room/RoomSettingsModal";
import { BackgroundSelectorModal } from "@/components/room/BackgroundSelectorModal";
import { PhotoStripProject, CapturedShot } from "@/types/photobooth";
import { useEditorStore } from "@/store/useEditorStore";
import { useRoomStore } from "@/store/useRoomStore";
import { FilterType } from "@/types/filter";
import { LayoutMode } from "@/types/room";
import { generateId } from "@/lib/utils";
import { Sparkles, Loader2, AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/ui/Button";

export default function RoomPage() {
  const router = useRouter();
  const urlParams = useParams();
  const rawId = urlParams?.id;
  const roomId = (Array.isArray(rawId) ? rawId[0] : rawId || "").toUpperCase();

  const { user, isAuthenticated, openAuthModal, signInAsGuest } = useAuth();
  const {
    room,
    remoteStreams,
    isConnecting,
    error,
    isHost,
    joinCurrentRoom,
    changeLayout,
  } = useRoom(roomId);

  const localUid = user?.uid || "";
  const displayName = user?.displayName || "Guest";
  const { broadcastEvent } = useWebRTC(roomId, localUid, displayName, isHost);

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

  const { setProject } = useEditorStore();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBackdropModalOpen, setIsBackdropModalOpen] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(3);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [isJoiningGuest, setIsJoiningGuest] = useState(false);

  useEffect(() => {
    if (user && roomId && (!room || !room.participants[user.uid])) {
      joinCurrentRoom();
    }
  }, [user, roomId, room, joinCurrentRoom]);

  const handleSelectVirtualBackground = async (bgId: string, customUrl?: string) => {
    if (roomId) {
      if (room) {
        useRoomStore.getState().setRoom({
          ...room,
          virtualBackground: bgId,
          customBackgroundUrl: customUrl || (bgId === "custom" ? room.customBackgroundUrl : undefined),
        });
      }
      await roomService.updateRoom(roomId, {
        virtualBackground: bgId,
        customBackgroundUrl: customUrl || (bgId === "custom" ? room?.customBackgroundUrl : undefined),
      });
      broadcastEvent({
        type: "background_change",
        background: bgId,
        customUrl: customUrl || room?.customBackgroundUrl,
      });
    }
  };

  const handleFilterSelect = (filter: FilterType) => {
    setActiveFilter(filter);
    broadcastEvent({
      type: "filter_change",
      filter,
    });
  };

  const handleLayoutChange = (layout: LayoutMode) => {
    changeLayout(layout);
    broadcastEvent({
      type: "layout_change",
      layout,
    });
  };

  const handleStartCaptureSession = () => {
    broadcastEvent({ type: "session_start" });
    const shotsToTake = room?.mode === "group" ? 4 : 3;

    startPhotoSession(
      shotsToTake,
      countdownDuration,
      (shots: CapturedShot[]) => {
        const initialProject: PhotoStripProject = {
          id: generateId("proj"),
          roomId,
          roomName: room?.name || "Together Photobooth",
          createdAt: Date.now(),
          shots,
          layout: room?.mode === "group" ? "grid-4" : room?.mode === "couple" ? "strip-3" : "strip-3",
          filter: activeFilter,
          frameStyle: room?.mode === "couple" ? "heart-romance" : "classic-white",
          backgroundColor: "transparent",
          virtualBackground: room?.virtualBackground,
          customBackgroundUrl: room?.customBackgroundUrl,
          stickers: [],
          texts: [],
          showDateStamp: true,
          showRoomStamp: true,
          customStampText: room?.name ? room.name.toUpperCase() : "TOGETHER BOOTH",
          applyToAllUsers: true,
        };

        setProject(initialProject);
        router.push(`/editor/${initialProject.id}`);
      },
      (tick) => {
        broadcastEvent({ type: "countdown_tick", value: tick });
      },
      () => {
        broadcastEvent({ type: "flash" });
      }
    );
  };

  const handleGuestJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoiningGuest(true);
    try {
      await signInAsGuest(guestNameInput.trim() || "Photobooth Guest");
    } finally {
      setIsJoiningGuest(false);
    }
  };

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/30">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Join Photobooth</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter a display name or sign in to join this live booth session.
            </p>
          </div>

          <form onSubmit={handleGuestJoinSubmit} className="space-y-4">
            <input
              type="text"
              value={guestNameInput}
              onChange={(e) => setGuestNameInput(e.target.value)}
              placeholder="Your nickname (e.g. Maya 🌸)"
              className="w-full px-4 py-3 rounded-2xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-pink-500 transition-all"
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isJoiningGuest}
            >
              <span>Join Photobooth Session</span>
            </Button>
          </form>

          <div className="pt-2 border-t border-white/10">
            <Button
              variant="glass"
              size="sm"
              onClick={openAuthModal}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span>Or Sign In / Register Account</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting || !room) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          <div>
            <h3 className="text-base font-bold text-white">Connecting to Photobooth...</h3>
            <p className="text-xs text-zinc-500 mt-1">Initializing peer-to-peer live camera channels</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md p-6 rounded-3xl bg-zinc-900 border border-red-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Could Not Join Room</h3>
          <p className="text-xs text-zinc-400">{error}</p>
          <Button variant="primary" size="md" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const participantCount = Object.keys(room.participants || {}).length;
  const currentVirtualBg = room.virtualBackground || "none";
  const currentCustomBg = room.customBackgroundUrl;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between overflow-hidden relative selection:bg-pink-500 selection:text-white">
      <RoomHeader
        room={room}
        participantCount={participantCount}
        onShareClick={() => setIsShareModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onLayoutChange={handleLayoutChange}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center relative overflow-hidden">
        <VideoGrid
          room={room}
          localUid={localUid}
          localStream={localStream}
          remoteStreams={remoteStreams}
          isMicActive={isMicActive}
          isCameraActive={isCameraActive}
          isMirrored={isMirrored}
          filter={activeFilter}
          onShareClick={() => setIsShareModalOpen(true)}
        />
      </main>

      <RoomControls
        isMicActive={isMicActive}
        isCameraActive={isCameraActive}
        isMirrored={isMirrored}
        activeFilter={activeFilter}
        virtualBackground={currentVirtualBg}
        countdownDuration={countdownDuration}
        isCapturing={isCapturing}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleMirror={toggleMirror}
        onSelectFilter={handleFilterSelect}
        onSelectCountdown={setCountdownDuration}
        onStartCapture={handleStartCaptureSession}
        onOpenBackdropModal={() => setIsBackdropModalOpen(true)}
        onSelectBackground={handleSelectVirtualBackground}
      />

      <CountdownOverlay countdownValue={countdownValue} />
      <CaptureFlash showFlash={showFlash} />

      <RoomShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomCode={room.code || roomId}
        roomName={room.name}
      />

      <RoomSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        availableCameras={availableCameras}
        selectedCameraId={selectedCameraId}
        isMirrored={isMirrored}
        onSelectCamera={setSelectedCameraId}
        onToggleMirror={toggleMirror}
      />

      <BackgroundSelectorModal
        isOpen={isBackdropModalOpen}
        onClose={() => setIsBackdropModalOpen(false)}
        selectedBackgroundId={currentVirtualBg}
        customBackgroundUrl={currentCustomBg}
        onSelectBackground={handleSelectVirtualBackground}
        isHost={isHost}
      />
    </div>
  );
}
