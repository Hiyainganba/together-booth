"use client";

import React from "react";
import { LocalVideoCard } from "./LocalVideoCard";
import { PeerVideoCard } from "./PeerVideoCard";
import { Room, Participant } from "@/types/room";
import { FilterType } from "@/types/filter";
import { cn } from "@/lib/utils";
import { Heart, Copy, Share2, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/ui/Button";

interface VideoGridProps {
  room: Room;
  localUid: string;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMicActive: boolean;
  isCameraActive: boolean;
  isMirrored: boolean;
  filter: FilterType;
  onShareClick?: () => void;
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
  onShareClick,
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

  const streamKeys = Object.keys(remoteStreams).filter((k) => k !== localUid);
  const knownRemoteUids = new Set(participantsList.filter((p) => p.uid !== localUid).map((p) => p.uid));

  const allRemotePeers: Participant[] = [
    ...participantsList.filter((p) => p.uid !== localUid),
  ];

  streamKeys.forEach((key) => {
    if (!knownRemoteUids.has(key)) {
      allRemotePeers.push({
        uid: key,
        displayName: "Partner 🧸",
        isHost: false,
        isAudioMuted: false,
        isVideoMuted: false,
        joinedAt: Date.now(),
      });
      knownRemoteUids.add(key);
    }
  });

  const isCoupleMode = room.mode === "couple" || room.layout === "2-split" || (room.maxParticipants === 2);
  const currentVirtualBg = room.virtualBackground || "none";
  const currentCustomBg = room.customBackgroundUrl;
  const isHost = Boolean(room.hostId === localUid || room.participants[localUid]?.isHost);

  const getStreamForPeer = (peer: Participant, index: number): MediaStream | undefined => {
    if (remoteStreams[peer.uid]) return remoteStreams[peer.uid];
    if (streamKeys[index] && remoteStreams[streamKeys[index]]) return remoteStreams[streamKeys[index]];
    if (streamKeys.length === 1) return remoteStreams[streamKeys[0]];
    return undefined;
  };

  if (isCoupleMode) {
    const remotePeer = allRemotePeers[0];
    const remoteStream = remotePeer ? getStreamForPeer(remotePeer, 0) : streamKeys.length > 0 ? remoteStreams[streamKeys[0]] : undefined;

    return (
      <div className="w-full h-full max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center justify-center">
        <div className="w-full h-[55vh] md:h-[65vh] max-h-[560px]">
          <LocalVideoCard
            stream={localStream}
            displayName={localParticipant.displayName}
            isMicActive={isMicActive}
            isCameraActive={isCameraActive}
            isMirrored={isMirrored}
            filter={filter}
            isHost={isHost}
            virtualBackground={currentVirtualBg}
            customBackgroundUrl={currentCustomBg}
          />
        </div>

        <div className="w-full h-[55vh] md:h-[65vh] max-h-[560px]">
          {remotePeer || remoteStream ? (
            <PeerVideoCard
              peerId={remotePeer?.uid || "remote_partner"}
              stream={remoteStream}
              displayName={remotePeer?.displayName || "Partner 🧸"}
              isAudioMuted={remotePeer?.isAudioMuted || false}
              filter={filter}
              isHost={!isHost}
              virtualBackground={currentVirtualBg}
              customBackgroundUrl={currentCustomBg}
            />
          ) : (
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#1A1816] border-2 border-dashed border-white/15 shadow-2xl flex flex-col items-center justify-center p-6 text-center group hover:border-[#FF6F61]/50 transition-all">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF6F61]/20 to-[#E9A842]/20 border border-[#FF6F61]/40 flex items-center justify-center text-[#FF6F61] shadow-lg shadow-[#FF6F61]/10">
                  <Heart className="w-9 h-9 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#FF6F61]/30 animate-ping opacity-30 pointer-events-none" />
              </div>

              <h3 className="font-serif text-xl font-bold text-white mb-1.5">Waiting for Partner...</h3>
              <p className="text-xs text-zinc-400 max-w-xs mb-5 leading-relaxed font-sans">
                Share your 6-digit code or invite link so your partner can step into the screen next to you.
              </p>

              <div className="flex items-center gap-2 p-2 px-4 rounded-2xl bg-[#11100F] border border-white/10 mb-5">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Room Code:</span>
                <span className="font-mono font-black text-amber-300 tracking-wider text-base">{room.code || room.id}</span>
              </div>

              {onShareClick && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={onShareClick}
                  className="flex items-center gap-2 shadow-lg shadow-[#FF6F61]/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite Your Partner</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  let gridClasses = "grid-cols-1 md:grid-cols-2";
  const totalCount = 1 + allRemotePeers.length;

  if (room.layout === "3-grid" || totalCount === 3) {
    gridClasses = "grid-cols-1 md:grid-cols-3";
  } else if (room.layout === "4-grid" || totalCount >= 4) {
    gridClasses = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
  }

  return (
    <div
      className={cn(
        "w-full h-full max-w-7xl mx-auto p-4 sm:p-6 grid gap-4 items-center justify-center transition-all duration-300",
        gridClasses
      )}
    >
      <div className="w-full h-[45vh] md:h-[55vh] max-h-[500px]">
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
      </div>

      {allRemotePeers.map((peer, idx) => (
        <div key={peer.uid} className="w-full h-[45vh] md:h-[55vh] max-h-[500px]">
          <PeerVideoCard
            peerId={peer.uid}
            stream={getStreamForPeer(peer, idx)}
            displayName={peer.displayName}
            isAudioMuted={peer.isAudioMuted}
            filter={filter}
            virtualBackground={currentVirtualBg}
            customBackgroundUrl={currentCustomBg}
          />
        </div>
      ))}
    </div>
  );
}
