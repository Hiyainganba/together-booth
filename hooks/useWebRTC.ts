"use client";

import { useEffect, useRef, useCallback } from "react";
import { PeerJSManager, PeerMessagePayload } from "@/lib/peerjs-manager";
import { useRoomStore } from "@/store/useRoomStore";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { FilterType } from "@/types/filter";

export function useWebRTC(
  roomId?: string,
  localUid?: string,
  displayName: string = "User",
  isHost: boolean = false,
  onCustomMessage?: (peerId: string, data: unknown) => void
) {
  const peerjsRef = useRef<PeerJSManager | null>(null);

  const { addRemoteStream, removeRemoteStream, addOrUpdateParticipant } = useRoomStore();
  const { localStream, setCountdownValue, triggerFlash, setActiveFilter } = usePhotoboothStore();

  const handleDataMessage = useCallback(
    (senderId: string, payload: unknown) => {
      if (typeof payload === "object" && payload !== null) {
        const data = payload as PeerMessagePayload;
        if (data.type === "countdown_tick") {
          setCountdownValue(data.value ?? null);
        } else if (data.type === "flash") {
          triggerFlash();
        } else if (data.type === "filter_change" && data.filter) {
          setActiveFilter(data.filter as FilterType);
        }
      }
      onCustomMessage?.(senderId, payload);
    },
    [setCountdownValue, triggerFlash, setActiveFilter, onCustomMessage]
  );

  useEffect(() => {
    if (!roomId || !localUid) return;

    const peerjs = new PeerJSManager(
      roomId,
      localUid,
      displayName,
      isHost,
      (remoteStream) => {
        addRemoteStream("partner", remoteStream);
      },
      () => {
        removeRemoteStream("partner");
      },
      (senderId, data) => {
        handleDataMessage(senderId, data);
      },
      (partnerUid, partnerName) => {
        addOrUpdateParticipant({
          uid: partnerUid,
          displayName: partnerName,
          isHost: !isHost,
          isAudioMuted: false,
          isVideoMuted: false,
          joinedAt: Date.now(),
        });
      }
    );

    peerjsRef.current = peerjs;

    return () => {
      peerjs.destroy();
      peerjsRef.current = null;
    };
  }, [roomId, localUid, displayName, isHost, addRemoteStream, removeRemoteStream, handleDataMessage, addOrUpdateParticipant]);

  useEffect(() => {
    if (localStream && peerjsRef.current) {
      peerjsRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  const broadcastEvent = useCallback((event: Record<string, unknown>) => {
    if (peerjsRef.current) {
      peerjsRef.current.broadcast(event as PeerMessagePayload);
    }
  }, []);

  return {
    broadcastEvent,
  };
}
