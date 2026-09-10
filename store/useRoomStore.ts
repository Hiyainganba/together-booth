import { create } from "zustand";
import { Room, Participant, LayoutMode } from "@/types/room";

interface RoomState {
  room: Room | null;
  localParticipant: Participant | null;
  remoteStreams: Record<string, MediaStream>;
  isConnecting: boolean;
  error: string | null;
  setRoom: (room: Room | null) => void;
  setLocalParticipant: (participant: Participant | null) => void;
  addRemoteStream: (peerId: string, stream: MediaStream) => void;
  removeRemoteStream: (peerId: string) => void;
  setIsConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  updateLayout: (layout: LayoutMode) => void;
  addOrUpdateParticipant: (participant: Participant) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  localParticipant: null,
  remoteStreams: {},
  isConnecting: false,
  error: null,
  setRoom: (room) => set({ room }),
  setLocalParticipant: (localParticipant) => set({ localParticipant }),
  addRemoteStream: (peerId, stream) =>
    set((state) => ({
      remoteStreams: { ...state.remoteStreams, [peerId]: stream },
    })),
  removeRemoteStream: (peerId) =>
    set((state) => {
      const copy = { ...state.remoteStreams };
      delete copy[peerId];
      return { remoteStreams: copy };
    }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),
  updateLayout: (layout) =>
    set((state) => (state.room ? { room: { ...state.room, layout } } : {})),
  addOrUpdateParticipant: (participant) =>
    set((state) => {
      if (!state.room) return {};
      return {
        room: {
          ...state.room,
          participants: {
            ...state.room.participants,
            [participant.uid]: participant,
          },
        },
      };
    }),
  clearRoom: () =>
    set({
      room: null,
      localParticipant: null,
      remoteStreams: {},
      isConnecting: false,
      error: null,
    }),
}));
