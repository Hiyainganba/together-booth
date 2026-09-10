"use client";

import { useEffect, useCallback } from "react";
import { useRoomStore } from "@/store/useRoomStore";
import { useAuthStore } from "@/store/useAuthStore";
import { roomService } from "@/services/roomService";
import { LayoutMode, RoomMode } from "@/types/room";

export function useRoom(roomId?: string) {
  const { user } = useAuthStore();
  const {
    room,
    localParticipant,
    remoteStreams,
    isConnecting,
    error,
    setRoom,
    setLocalParticipant,
    setIsConnecting,
    setError,
    updateLayout,
    clearRoom,
  } = useRoomStore();

  useEffect(() => {
    if (!roomId) return;

    setIsConnecting(true);
    setError(null);

    const unsub = roomService.subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      setIsConnecting(false);
    });

    return () => {
      unsub();
      clearRoom();
    };
  }, [roomId, setRoom, setIsConnecting, setError, clearRoom]);

  const joinCurrentRoom = useCallback(async () => {
    if (!roomId || !user) return;
    try {
      setIsConnecting(true);
      const { room: joined, participant } = await roomService.joinRoom(roomId, user);
      setRoom(joined);
      setLocalParticipant(participant);
      setIsConnecting(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join room");
      setIsConnecting(false);
    }
  }, [roomId, user, setRoom, setLocalParticipant, setIsConnecting, setError]);

  const changeLayout = useCallback(
    async (layout: LayoutMode) => {
      if (!roomId) return;
      updateLayout(layout);
      await roomService.updateRoom(roomId, { layout });
    },
    [roomId, updateLayout]
  );

  const startCountdown = useCallback(
    async (duration: number = 3) => {
      if (!roomId) return;
      await roomService.triggerCountdown(roomId, duration);
    },
    [roomId]
  );

  const stopCountdown = useCallback(async () => {
    if (!roomId) return;
    await roomService.cancelCountdown(roomId);
  }, [roomId]);

  const isHost = Boolean(user && room && room.hostId === user.uid);

  return {
    room,
    localParticipant,
    remoteStreams,
    isConnecting,
    error,
    isHost,
    joinCurrentRoom,
    changeLayout,
    startCountdown,
    stopCountdown,
  };
}
