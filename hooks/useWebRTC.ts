"use client";

import { useEffect, useRef, useCallback } from "react";
import { PeerJSManager, PeerMessagePayload } from "@/lib/peerjs-manager";
import { useRoomStore } from "@/store/useRoomStore";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { FilterType } from "@/types/filter";
import { LayoutMode, Room } from "@/types/room";

export function useWebRTC(
  roomId?: string,
  localUid?: string,
  displayName: string = "User",
  isHost: boolean = false,
  onCustomMessage?: (peerId: string, data: unknown) => void
) {
  const managerRef = useRef<PeerJSManager | null>(null);
  const { addRemoteStream, removeRemoteStream, updateLayout, setRoom } = useRoomStore();
  const { localStream, setCountdownValue, triggerFlash, setActiveFilter } = usePhotoboothStore();

  const handleDataMessage = useCallback(
    (senderId: string, payload: PeerMessagePayload) => {
      if (payload.type === "countdown_tick") {
        setCountdownValue(payload.value ?? null);
      } else if (payload.type === "flash") {
        triggerFlash();
      } else if (payload.type === "filter_change" && payload.filter) {
        setActiveFilter(payload.filter as FilterType);
      } else if (payload.type === "layout_change" && payload.layout) {
        updateLayout(payload.layout as LayoutMode);
      } else if (payload.type === "background_change" && payload.background) {
        const current = useRoomStore.getState().room;
        if (current) {
          setRoom({
            ...current,
            virtualBackground: payload.background,
            customBackgroundUrl: payload.customUrl,
          });
        }
      }

      onCustomMessage?.(senderId, payload);
    },
    [setCountdownValue, triggerFlash, setActiveFilter, updateLayout, setRoom, onCustomMessage]
  );

  const handleRoomSync = useCallback(
    (syncedRoom: Room) => {
      setRoom(syncedRoom);
    },
    [setRoom]
  );

  const handlePeerHandshake = useCallback(
    (remoteUid: string, remoteDisplayName: string) => {
      const currentRoom = useRoomStore.getState().room;
      if (currentRoom) {
        setRoom({
          ...currentRoom,
          participants: {
            ...currentRoom.participants,
            [remoteUid]: {
              uid: remoteUid,
              displayName: remoteDisplayName,
              isHost: false,
              isAudioMuted: false,
              isVideoMuted: false,
              joinedAt: Date.now(),
            },
          },
        });
      }
    },
    [setRoom]
  );

  useEffect(() => {
    if (!roomId || !localUid) return;

    const manager = new PeerJSManager(
      roomId,
      localUid,
      displayName,
      isHost,
      (uid, stream) => {
        addRemoteStream(uid, stream);
      },
      (uid) => {
        removeRemoteStream(uid);
      },
      (senderId, data) => {
        handleDataMessage(senderId, data);
      },
      (syncedRoom) => {
        handleRoomSync(syncedRoom);
      },
      (remoteUid, remoteName) => {
        handlePeerHandshake(remoteUid, remoteName);
      }
    );

    managerRef.current = manager;

    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, [roomId, localUid, displayName, isHost, addRemoteStream, removeRemoteStream, handleDataMessage, handleRoomSync, handlePeerHandshake]);

  useEffect(() => {
    if (managerRef.current && localStream) {
      managerRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  const broadcastEvent = useCallback((event: Record<string, unknown>) => {
    if (managerRef.current) {
      managerRef.current.broadcast(event as PeerMessagePayload);
    }
  }, []);

  return {
    broadcastEvent,
  };
}
