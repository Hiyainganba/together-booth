import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  deleteField,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Room, RoomMode, LayoutMode, Participant } from "@/types/room";
import { UserProfile } from "@/types/auth";
import { generateRoomCode } from "@/lib/utils";
import { LocalMemoryDatabase } from "@/lib/firebase-mock";

export const roomService = {
  async createRoom(
    hostUser: UserProfile,
    mode: RoomMode = "couple",
    name: string = "Together Photobooth"
  ): Promise<Room> {
    const code = generateRoomCode();
    const roomId = code;

    let layout: LayoutMode = "2-split";
    let maxParticipants = 2;
    if (mode === "solo") {
      layout = "1-person";
      maxParticipants = 1;
    } else if (mode === "group") {
      layout = "4-grid";
      maxParticipants = 8;
    }

    const hostParticipant: Participant = {
      uid: hostUser.uid,
      displayName: hostUser.displayName,
      photoURL: hostUser.photoURL,
      isHost: true,
      isAudioMuted: false,
      isVideoMuted: false,
      joinedAt: Date.now(),
    };

    const newRoom: Room = {
      id: roomId,
      code,
      name: name.trim() || "Together Photobooth",
      hostId: hostUser.uid,
      mode,
      layout,
      maxParticipants,
      createdAt: Date.now(),
      isActive: true,
      shotCount: 3,
      countdownDuration: 3,
      isCountdownActive: false,
      currentShotIndex: 0,
      participants: {
        [hostUser.uid]: hostParticipant,
      },
    };

    if (isFirebaseConfigured && db) {
      try {
        const roomRef = doc(db, "rooms", roomId);
        await setDoc(roomRef, newRoom);
      } catch {}
    } else {
      LocalMemoryDatabase.saveRoom(newRoom);
      try {
        await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: newRoom }),
        });
      } catch {}
    }

    return newRoom;
  },

  async getRoom(roomIdOrCode: string): Promise<Room | null> {
    const cleanId = roomIdOrCode.trim().toUpperCase();
    if (!cleanId) return null;

    if (isFirebaseConfigured && db) {
      try {
        const roomRef = doc(db, "rooms", cleanId);
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          return snap.data() as Room;
        }

        const q = query(
          collection(db, "rooms"),
          where("code", "==", cleanId)
        );
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          return querySnap.docs[0].data() as Room;
        }
      } catch {}
    }

    const localRoom = LocalMemoryDatabase.getRoom(cleanId);
    if (localRoom) return localRoom;

    try {
      const isCode = cleanId.length <= 10 && !cleanId.startsWith("ROOM_");
      const url = isCode
        ? `/api/rooms?code=${encodeURIComponent(cleanId)}`
        : `/api/rooms/${encodeURIComponent(cleanId)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          LocalMemoryDatabase.saveRoom(data.room);
          return data.room as Room;
        }
      }
    } catch {}

    const fallbackRoom: Room = {
      id: cleanId,
      code: cleanId,
      name: "Together Photobooth",
      hostId: "",
      mode: "couple",
      layout: "2-split",
      maxParticipants: 8,
      createdAt: Date.now(),
      isActive: true,
      shotCount: 3,
      countdownDuration: 3,
      isCountdownActive: false,
      currentShotIndex: 0,
      participants: {},
    };

    return fallbackRoom;
  },

  async joinRoom(
    roomIdOrCode: string,
    user: UserProfile
  ): Promise<{ room: Room; participant: Participant }> {
    const cleanId = roomIdOrCode.trim().toUpperCase();
    let existing = await this.getRoom(cleanId);
    if (!existing) {
      existing = {
        id: cleanId,
        code: cleanId,
        name: "Together Photobooth",
        hostId: user.uid,
        mode: "couple",
        layout: "2-split",
        maxParticipants: 8,
        createdAt: Date.now(),
        isActive: true,
        shotCount: 3,
        countdownDuration: 3,
        isCountdownActive: false,
        currentShotIndex: 0,
        participants: {},
      };
    }

    const participant: Participant = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isHost: existing.hostId === user.uid || Object.keys(existing.participants || {}).length === 0,
      isAudioMuted: false,
      isVideoMuted: false,
      joinedAt: Date.now(),
    };

    if (participant.isHost && !existing.hostId) {
      existing.hostId = user.uid;
    }

    const updatedParticipants = {
      ...(existing.participants || {}),
      [user.uid]: participant,
    };

    const updatedRoom: Room = {
      ...existing,
      participants: updatedParticipants,
    };

    if (isFirebaseConfigured && db) {
      try {
        const roomRef = doc(db, "rooms", existing.id);
        await updateDoc(roomRef, {
          [`participants.${user.uid}`]: participant,
        });
      } catch {}
    } else {
      LocalMemoryDatabase.saveRoom(updatedRoom);
      try {
        await fetch(`/api/rooms/${existing.id}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participant }),
        });
      } catch {}
    }

    return { room: updatedRoom, participant };
  },

  async leaveRoom(roomId: string, uid: string): Promise<void> {
    const cleanId = roomId.trim().toUpperCase();
    if (isFirebaseConfigured && db) {
      try {
        const roomRef = doc(db, "rooms", cleanId);
        await updateDoc(roomRef, {
          [`participants.${uid}`]: deleteField(),
        });
      } catch {}
    } else {
      const room = LocalMemoryDatabase.getRoom(cleanId);
      if (room && room.participants[uid]) {
        delete room.participants[uid];
        LocalMemoryDatabase.saveRoom(room);
      }
      try {
        await fetch(`/api/rooms/${cleanId}/leave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
      } catch {}
    }
  },

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
    const cleanId = roomId.trim().toUpperCase();
    if (isFirebaseConfigured && db) {
      try {
        const roomRef = doc(db, "rooms", cleanId);
        await updateDoc(roomRef, updates);
      } catch {}
    } else {
      const room = LocalMemoryDatabase.getRoom(cleanId);
      if (room) {
        const merged = { ...room, ...updates };
        LocalMemoryDatabase.saveRoom(merged);
      }
      try {
        await fetch(`/api/rooms/${cleanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async triggerCountdown(roomId: string, duration: number = 3): Promise<void> {
    const cleanId = roomId.trim().toUpperCase();
    const targetTime = Date.now() + duration * 1000;
    await this.updateRoom(cleanId, {
      isCountdownActive: true,
      countdownDuration: duration,
      countdownTargetTime: targetTime,
    });
  },

  async cancelCountdown(roomId: string): Promise<void> {
    const cleanId = roomId.trim().toUpperCase();
    await this.updateRoom(cleanId, {
      isCountdownActive: false,
      countdownTargetTime: undefined,
    });
  },

  subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
    const cleanId = roomId.trim().toUpperCase();
    if (isFirebaseConfigured && db) {
      const roomRef = doc(db, "rooms", cleanId);
      return onSnapshot(roomRef, (snap) => {
        if (snap.exists()) {
          callback(snap.data() as Room);
        } else {
          callback(null);
        }
      });
    }

    const initial = LocalMemoryDatabase.getRoom(cleanId);
    if (initial) {
      callback(initial);
    } else {
      callback({
        id: cleanId,
        code: cleanId,
        name: "Together Photobooth",
        hostId: "",
        mode: "couple",
        layout: "2-split",
        maxParticipants: 8,
        createdAt: Date.now(),
        isActive: true,
        shotCount: 3,
        countdownDuration: 3,
        isCountdownActive: false,
        currentShotIndex: 0,
        participants: {},
      });
    }

    let isSubscribed = true;

    const pollServer = async () => {
      if (!isSubscribed) return;
      try {
        const res = await fetch(`/api/rooms/${cleanId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.room && isSubscribed) {
            LocalMemoryDatabase.saveRoom(data.room);
            callback(data.room);
          }
        }
      } catch {}
    };

    pollServer();
    const intervalId = setInterval(pollServer, 1000);

    const channel = LocalMemoryDatabase.getChannel();
    let handler: ((event: MessageEvent) => void) | null = null;
    if (channel) {
      handler = (event: MessageEvent) => {
        if (event.data?.type === "room_update" && event.data.payload?.id === cleanId && isSubscribed) {
          callback(event.data.payload as Room);
        }
      };
      channel.addEventListener("message", handler);
    }

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      if (channel && handler) {
        channel.removeEventListener("message", handler);
      }
    };
  },
};
