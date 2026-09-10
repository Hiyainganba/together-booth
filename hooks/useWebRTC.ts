"use client";

import { useEffect, useRef, useCallback } from "react";
import { WebRTCMeshManager } from "@/lib/webrtc-mesh";
import { signalingService } from "@/services/signalingService";
import { SignalMessage } from "@/types/webrtc";
import { useRoomStore } from "@/store/useRoomStore";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { FilterType } from "@/types/filter";
import { LayoutMode } from "@/types/room";

export function useWebRTC(
  roomId?: string,
  localUid?: string,
  onCustomMessage?: (peerId: string, data: unknown) => void
) {
  const meshManagerRef = useRef<WebRTCMeshManager | null>(null);
  const { addRemoteStream, removeRemoteStream, updateLayout, setRoom, room } = useRoomStore();
  const { localStream, setCountdownValue, triggerFlash, setActiveFilter } = usePhotoboothStore();

  const handleDataMessage = useCallback(
    (peerId: string, data: unknown) => {
      if (typeof data === "object" && data !== null) {
        const payload = data as {
          type?: string;
          value?: number;
          filter?: FilterType;
          background?: string;
          customUrl?: string;
          layout?: LayoutMode;
        };

        if (payload.type === "countdown_tick") {
          setCountdownValue(payload.value ?? null);
        } else if (payload.type === "flash") {
          triggerFlash();
        } else if (payload.type === "filter_change" && payload.filter) {
          setActiveFilter(payload.filter);
        } else if (payload.type === "layout_change" && payload.layout) {
          updateLayout(payload.layout);
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
      }

      onCustomMessage?.(peerId, data);
    },
    [setCountdownValue, triggerFlash, setActiveFilter, updateLayout, setRoom, onCustomMessage]
  );

  useEffect(() => {
    if (!roomId || !localUid) return;

    const manager = new WebRTCMeshManager(
      localUid,
      (signal: SignalMessage) => {
        signalingService.sendSignal(roomId, signal);
      },
      (peerId: string, stream: MediaStream) => {
        addRemoteStream(peerId, stream);
      },
      (peerId: string) => {
        removeRemoteStream(peerId);
      },
      handleDataMessage
    );

    meshManagerRef.current = manager;

    const unsubSignals = signalingService.subscribeToSignals(
      roomId,
      localUid,
      (signal) => {
        manager.handleSignal(signal);
      }
    );

    return () => {
      unsubSignals();
      manager.destroy();
      meshManagerRef.current = null;
    };
  }, [roomId, localUid, addRemoteStream, removeRemoteStream, handleDataMessage]);

  useEffect(() => {
    if (meshManagerRef.current && localStream) {
      meshManagerRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  const connectToPeer = useCallback(
    (remotePeerId: string) => {
      if (meshManagerRef.current && localUid && remotePeerId > localUid) {
        meshManagerRef.current.createPeerConnection(remotePeerId, true);
      }
    },
    [localUid]
  );

  const broadcastEvent = useCallback((event: unknown) => {
    if (meshManagerRef.current) {
      meshManagerRef.current.broadcastData(event);
    }
  }, []);

  return {
    connectToPeer,
    broadcastEvent,
  };
}

