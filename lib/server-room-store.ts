import { Room, Participant } from "@/types/room";
import { SignalMessage } from "@/types/webrtc";

declare global {
  var __together_booth_rooms: Map<string, Room> | undefined;
  var __together_booth_signals: Map<string, SignalMessage[]> | undefined;
}

const roomsStore: Map<string, Room> =
  globalThis.__together_booth_rooms || (globalThis.__together_booth_rooms = new Map());

const signalsStore: Map<string, SignalMessage[]> =
  globalThis.__together_booth_signals || (globalThis.__together_booth_signals = new Map());

export const serverRoomStore = {
  saveRoom(room: Room): Room {
    roomsStore.set(room.id, room);
    if (room.code) {
      roomsStore.set(room.code.toUpperCase(), room);
    }
    return room;
  },

  getRoom(roomIdOrCode: string): Room | null {
    const clean = roomIdOrCode.trim();
    if (roomsStore.has(clean)) {
      return roomsStore.get(clean)!;
    }
    if (roomsStore.has(clean.toUpperCase())) {
      return roomsStore.get(clean.toUpperCase())!;
    }
    for (const r of roomsStore.values()) {
      if (r.id === clean || (r.code && r.code.toUpperCase() === clean.toUpperCase())) {
        return r;
      }
    }
    return null;
  },

  updateRoom(roomId: string, updates: Partial<Room>): Room | null {
    const existing = this.getRoom(roomId);
    if (!existing) return null;

    const merged: Room = {
      ...existing,
      ...updates,
      participants: updates.participants
        ? { ...existing.participants, ...updates.participants }
        : existing.participants,
    };

    roomsStore.set(existing.id, merged);
    if (merged.code) {
      roomsStore.set(merged.code.toUpperCase(), merged);
    }
    return merged;
  },

  joinRoom(roomId: string, participant: Participant): Room | null {
    const existing = this.getRoom(roomId);
    if (!existing) return null;

    const count = Object.keys(existing.participants || {}).length;
    if (count >= existing.maxParticipants && !existing.participants[participant.uid]) {
      throw new Error(`Room is full (max ${existing.maxParticipants} participants)`);
    }

    const updatedParticipants = {
      ...(existing.participants || {}),
      [participant.uid]: participant,
    };

    const updatedRoom: Room = {
      ...existing,
      participants: updatedParticipants,
    };

    return this.saveRoom(updatedRoom);
  },

  leaveRoom(roomId: string, uid: string): Room | null {
    const existing = this.getRoom(roomId);
    if (!existing) return null;

    const updatedParticipants = { ...existing.participants };
    delete updatedParticipants[uid];

    const updatedRoom: Room = {
      ...existing,
      participants: updatedParticipants,
    };

    return this.saveRoom(updatedRoom);
  },

  addSignal(roomId: string, signal: SignalMessage): void {
    const cleanId = roomId.trim().toUpperCase();
    const roomSignals = signalsStore.get(cleanId) || signalsStore.get(roomId) || [];
    roomSignals.push({ ...signal, timestamp: signal.timestamp || Date.now() });

    if (roomSignals.length > 200) {
      roomSignals.splice(0, roomSignals.length - 200);
    }
    signalsStore.set(cleanId, roomSignals);
    if (cleanId !== roomId) {
      signalsStore.set(roomId, roomSignals);
    }
  },

  getSignals(roomId: string, receiverId: string, since: number = 0): SignalMessage[] {
    const cleanId = roomId.trim().toUpperCase();
    const roomSignals = signalsStore.get(cleanId) || signalsStore.get(roomId) || [];
    return roomSignals.filter(
      (s) =>
        (s.receiverId === receiverId || s.receiverId === "all") &&
        (!since || (s.timestamp || 0) > since)
    );
  },
};
