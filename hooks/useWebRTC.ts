"use client";

import { useEffect, useRef, useCallback } from "react";
import { WebRTCMeshManager } from "@/lib/webrtc-mesh";
import { PeerJSManager, PeerMessagePayload } from "@/lib/peerjs-manager";
import { useRoomStore } from "@/store/useRoomStore";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { FilterType } from "@/types/filter";
import { LayoutMode } from "@/types/room";
import { SignalMessage } from "@/types/webrtc";

export function useWebRTC(
  roomId?: string,
  localUid?: string,
  displayName: string = "User",
  isHost: boolean = false,
  onCustomMessage?: (peerId: string, data: unknown) => void
) {
  const meshManagerRef = useRef<WebRTCMeshManager | null>(null);
  const peerjsManagerRef = useRef<PeerJSManager | null>(null);
  const lastSignalTimeRef = useRef<number>(0);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { addRemoteStream, removeRemoteStream, updateLayout, setRoom, addOrUpdateParticipant } = useRoomStore();
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
        } else if (data.type === "layout_change" && data.layout) {
          updateLayout(data.layout as LayoutMode);
        } else if (data.type === "background_change" && data.background) {
          const current = useRoomStore.getState().room;
          if (current) {
            setRoom({
              ...current,
              virtualBackground: data.background,
              customBackgroundUrl: data.customUrl,
            });
          }
        }
      }
      onCustomMessage?.(senderId, payload);
    },
    [setCountdownValue, triggerFlash, setActiveFilter, updateLayout, setRoom, onCustomMessage]
  );

  const sendSignal = useCallback(
    async (signal: SignalMessage) => {
      if (!roomId) return;
      try {
        await fetch(`/api/rooms/${roomId}/signals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signal),
        });
      } catch {}
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId || !localUid) return;

    const mesh = new WebRTCMeshManager(
      localUid,
      sendSignal,
      (peerId, stream) => {
        addRemoteStream(peerId, stream);
      },
      (peerId) => {
        removeRemoteStream(peerId);
      },
      (peerId, data) => {
        handleDataMessage(peerId, data);
      }
    );
    meshManagerRef.current = mesh;

    const peerjs = new PeerJSManager(
      roomId,
      localUid,
      displayName,
      isHost,
      (uid, stream, streamDisplayName) => {
        addRemoteStream(uid, stream);
        if (streamDisplayName) {
          addOrUpdateParticipant({
            uid,
            displayName: streamDisplayName,
            isHost: false,
            isAudioMuted: false,
            isVideoMuted: false,
            joinedAt: Date.now(),
          });
        }
      },
      (uid) => {
        removeRemoteStream(uid);
      },
      (senderId, data) => {
        handleDataMessage(senderId, data);
      },
      undefined,
      (uid, peerDisplayName) => {
        addOrUpdateParticipant({
          uid,
          displayName: peerDisplayName,
          isHost: false,
          isAudioMuted: false,
          isVideoMuted: false,
          joinedAt: Date.now(),
        });
      }
    );
    peerjsManagerRef.current = peerjs;

    lastSignalTimeRef.current = Date.now() - 5000;

    const pollSignals = async () => {
      if (!meshManagerRef.current) return;
      try {
        const url = `/api/rooms/${roomId}/signals?receiverId=${encodeURIComponent(localUid)}&since=${lastSignalTimeRef.current}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.signals) && data.signals.length > 0) {
            for (const sig of data.signals) {
              if (sig.timestamp > lastSignalTimeRef.current) {
                lastSignalTimeRef.current = sig.timestamp;
              }
              await meshManagerRef.current.handleSignal(sig);
            }
          }
        }

        const currentRoom = useRoomStore.getState().room;
        if (currentRoom && currentRoom.participants) {
          for (const uid of Object.keys(currentRoom.participants)) {
            if (uid !== localUid) {
              meshManagerRef.current.ensureConnectionWithPeer(uid);
            }
          }
        }
      } catch {}
    };

    pollSignals();
    pollTimerRef.current = setInterval(pollSignals, 800);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      mesh.destroy();
      meshManagerRef.current = null;
      peerjs.destroy();
      peerjsManagerRef.current = null;
    };
  }, [
    roomId,
    localUid,
    displayName,
    isHost,
    sendSignal,
    addRemoteStream,
    removeRemoteStream,
    handleDataMessage,
    addOrUpdateParticipant,
  ]);

  useEffect(() => {
    if (localStream) {
      if (meshManagerRef.current) {
        meshManagerRef.current.setLocalStream(localStream);
      }
      if (peerjsManagerRef.current) {
        peerjsManagerRef.current.setLocalStream(localStream);
      }
    }
  }, [localStream]);

  const broadcastEvent = useCallback((event: Record<string, unknown>) => {
    if (meshManagerRef.current) {
      meshManagerRef.current.broadcastData(event);
    }
    if (peerjsManagerRef.current) {
      peerjsManagerRef.current.broadcast(event as PeerMessagePayload);
    }
  }, []);

  return {
    broadcastEvent,
  };
}
