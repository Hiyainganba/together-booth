"use client";

import React from "react";
import { LocalVideoCard } from "./LocalVideoCard";
import { PeerVideoCard } from "./PeerVideoCard";
import { Room, LayoutMode, Participant } from "@/types/room";
import { FilterType } from "@/types/filter";
import { cn } from "@/lib/utils";

interface VideoGridProps {
  room: Room;
  localUid: string;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMicActive: boolean;
  isCameraActive: boolean;
  isMirrored: boolean;
  filter: FilterType;
}

export function VideoGrid({
  room,
  localUid,
  localStream,
  remoteStreams,
  isMicActive,
  isCameraActive,
  isMirrored,
  filter,
}: VideoGridProps) {
  const participantsList = Object.values(room.participants || {});
  const localParticipant = room.participants[localUid] || {
    uid: localUid,
    displayName: "You",
    isHost: false,
    isAudioMuted: !isMicActive,
    isVideoMuted: !isCameraActive,
    joinedAt: Date.now(),
  };

  const remoteParticipants = participantsList.filter((p) => p.uid !== localUid);
  const totalCount = 1 + remoteParticipants.length;
  const currentVirtualBg = room.virtualBackground || "none";
  const currentCustomBg = room.customBackgroundUrl;

  let gridClasses = "grid-cols-1";

  if (room.layout === "2-split") {
    gridClasses = "grid-cols-1 md:grid-cols-2";
  } else if (room.layout === "3-grid") {
    gridClasses = "grid-cols-1 md:grid-cols-3";
  } else if (room.layout === "4-grid") {
    gridClasses = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
  } else if (room.layout === "dynamic") {
    if (totalCount === 1) gridClasses = "grid-cols-1 max-w-2xl mx-auto";
    else if (totalCount === 2) gridClasses = "grid-cols-1 md:grid-cols-2";
    else if (totalCount === 3) gridClasses = "grid-cols-1 md:grid-cols-3";
    else if (totalCount === 4) gridClasses = "grid-cols-1 sm:grid-cols-2";
    else gridClasses = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }

  return (
    <div
      className={cn(
        "w-full h-full p-4 sm:p-6 grid gap-4 items-center justify-center transition-all duration-300",
        gridClasses
      )}
    >
      <LocalVideoCard
        stream={localStream}
        displayName={localParticipant.displayName}
        isMicActive={isMicActive}
        isCameraActive={isCameraActive}
        isMirrored={isMirrored}
        filter={filter}
        virtualBackground={currentVirtualBg}
        customBackgroundUrl={currentCustomBg}
      />

      {remoteParticipants.map((peer) => (
        <PeerVideoCard
          key={peer.uid}
          peerId={peer.uid}
          stream={remoteStreams[peer.uid]}
          displayName={peer.displayName}
          isAudioMuted={peer.isAudioMuted}
          filter={filter}
          virtualBackground={currentVirtualBg}
          customBackgroundUrl={currentCustomBg}
        />
      ))}
    </div>
  );
}
