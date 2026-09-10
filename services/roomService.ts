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
import { generateRoomCode, generateId } from "@/lib/utils";
import { LocalMemoryDatabase } from "@/lib/firebase-mock";

export const roomService = {
  async createRoom(
    hostUser: UserProfile,
    mode: RoomMode = "couple",
    name: string = "Together Photobooth"
  ): Promise<Room> {
    const roomId = generateId("room");
    const code = generateRoomCode();

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
      const roomRef = doc(db, "rooms", roomId);
      await setDoc(roomRef, newRoom);
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
    const cleanId = roomIdOrCode.trim();

    if (isFirebaseConfigured && db) {
      const roomRef = doc(db, "rooms", cleanId);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        return snap.data() as Room;
      }

      const q = query(
        collection(db, "rooms"),
        where("code", "==", cleanId.toUpperCase())
      );
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs[0].data() as Room;
      }
    }

    const localRoom = LocalMemoryDatabase.getRoom(cleanId);
    if (localRoom) return localRoom;

    try {
      const isCode = cleanId.length <= 10 && !cleanId.startsWith("room_");
      const url = isCode
        ? `/api/rooms?code=${encodeURIComponent(cleanId.toUpperCase())}`
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

    return null;
  },

  async joinRoom(
    roomIdOrCode: string,
    user: UserProfile
  ): Promise<{ room: Room; participant: Participant }> {
    const existing = await this.getRoom(roomIdOrCode);
    if (!existing) {
      throw new Error("Photobooth room not found with this code or link");
    }

    const participantCount = Object.keys(existing.participants || {}).length;
    if (participantCount >= existing.maxParticipants && !existing.participants[user.uid]) {
      throw new Error(`Room is full (maximum ${existing.maxParticipants} participants)`);
    }

    const participant: Participant = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isHost: existing.hostId === user.uid,
      isAudioMuted: false,
      isVideoMuted: false,
      joinedAt: Date.now(),
    };

    const updatedParticipants = {
      ...(existing.participants || {}),
      [user.uid]: participant,
    };

    const updatedRoom: Room = {
      ...existing,
      participants: updatedParticipants,
    };

    if (isFirebaseConfigured && db) {
      const roomRef = doc(db, "rooms", existing.id);
      await updateDoc(roomRef, {
        [`participants.${user.uid}`]: participant,
      });
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
    if (isFirebaseConfigured && db) {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        [`participants.${uid}`]: deleteField(),
      });
    } else {
      const room = LocalMemoryDatabase.getRoom(roomId);
      if (room && room.participants[uid]) {
        delete room.participants[uid];
        LocalMemoryDatabase.saveRoom(room);
      }
      try {
        await fetch(`/api/rooms/${roomId}/leave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
      } catch {}
    }
  },

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
    if (isFirebaseConfigured && db) {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, updates);
    } else {
      const room = LocalMemoryDatabase.getRoom(roomId);
      if (room) {
        const merged = { ...room, ...updates };
        LocalMemoryDatabase.saveRoom(merged);
      }
      try {
        await fetch(`/api/rooms/${roomId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async triggerCountdown(roomId: string, duration: number = 3): Promise<void> {
    const targetTime = Date.now() + duration * 1000;
    await this.updateRoom(roomId, {
      isCountdownActive: true,
      countdownDuration: duration,
      countdownTargetTime: targetTime,
    });
  },

  async cancelCountdown(roomId: string): Promise<void> {
    await this.updateRoom(roomId, {
      isCountdownActive: false,
      countdownTargetTime: undefined,
    });
  },

  subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
    if (isFirebaseConfigured && db) {
      const roomRef = doc(db, "rooms", roomId);
      return onSnapshot(roomRef, (snap) => {
        if (snap.exists()) {
          callback(snap.data() as Room);
        } else {
          callback(null);
        }
      });
    }

    const initial = LocalMemoryDatabase.getRoom(roomId);
    if (initial) callback(initial);

    let isSubscribed = true;

    const pollServer = async () => {
      if (!isSubscribed) return;
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
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
    const intervalId = setInterval(pollServer, 800);

    const channel = LocalMemoryDatabase.getChannel();
    let handler: ((event: MessageEvent) => void) | null = null;
    if (channel) {
      handler = (event: MessageEvent) => {
        if (event.data?.type === "room_update" && event.data.payload?.id === roomId && isSubscribed) {
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
