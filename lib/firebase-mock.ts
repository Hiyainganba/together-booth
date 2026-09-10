import { UserProfile } from "@/types/auth";
import { Room, Participant, CaptureSignal } from "@/types/room";
import { MemoryItem, Album } from "@/types/memory";
import { SignalMessage } from "@/types/webrtc";

const STORAGE_KEYS = {
  USER: "together_booth_user",
  USERS_DB: "together_booth_registered_users",
  ROOMS: "together_booth_rooms",
  MEMORIES: "together_booth_memories",
  ALBUMS: "together_booth_albums",
};

export class LocalMemoryDatabase {
  static getUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }

  static setUser(user: UserProfile | null): void {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      this.saveRegisteredUser(user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  static getRegisteredUsers(): Record<string, UserProfile & { password?: string }> {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return stored ? JSON.parse(stored) : {};
  }

  static saveRegisteredUser(user: UserProfile & { password?: string }): void {
    if (typeof window === "undefined") return;
    const users = this.getRegisteredUsers();
    users[user.uid] = { ...users[user.uid], ...user };
    if (user.email) {
      users[user.email.toLowerCase()] = { ...users[user.uid], ...user };
    }
    if (user.phoneNumber) {
      users[user.phoneNumber] = { ...users[user.uid], ...user };
    }
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  }

  static getUserByEmailOrPhone(identifier: string): (UserProfile & { password?: string }) | null {
    const users = this.getRegisteredUsers();
    const clean = identifier.trim().toLowerCase();
    if (users[clean]) return users[clean];
    const found = Object.values(users).find(
      (u) =>
        (u.email && u.email.toLowerCase() === clean) ||
        (u.phoneNumber && u.phoneNumber.replace(/\s+/g, "") === clean.replace(/\s+/g, ""))
    );
    return found || null;
  }

  static resetUserPassword(emailOrPhone: string, newPass: string): boolean {
    if (typeof window === "undefined") return false;
    const users = this.getRegisteredUsers();
    const user = this.getUserByEmailOrPhone(emailOrPhone);
    if (!user) return false;

    user.password = newPass;
    users[user.uid] = user;
    if (user.email) {
      users[user.email.toLowerCase()] = user;
    }
    if (user.phoneNumber) {
      users[user.phoneNumber] = user;
    }
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    return true;
  }

  static getRooms(): Record<string, Room> {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return stored ? JSON.parse(stored) : {};
  }

  static getRoom(roomIdOrCode: string): Room | null {
    const rooms = this.getRooms();
    if (rooms[roomIdOrCode]) return rooms[roomIdOrCode];
    const found = Object.values(rooms).find(
      (r) => r.code.toUpperCase() === roomIdOrCode.toUpperCase()
    );
    return found || null;
  }

  static saveRoom(room: Room): void {
    if (typeof window === "undefined") return;
    const rooms = this.getRooms();
    rooms[room.id] = room;
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    this.broadcast("room_update", room);
  }

  static getMemories(): MemoryItem[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    return stored ? JSON.parse(stored) : [];
  }

  static saveMemory(memory: MemoryItem): void {
    if (typeof window === "undefined") return;
    const memories = this.getMemories();
    const existingIndex = memories.findIndex((m) => m.id === memory.id);
    if (existingIndex >= 0) {
      memories[existingIndex] = memory;
    } else {
      memories.unshift(memory);
    }
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  }

  static deleteMemory(memoryId: string): void {
    if (typeof window === "undefined") return;
    const memories = this.getMemories().filter((m) => m.id !== memoryId);
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  }

  static getAlbums(): Album[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ALBUMS);
    return stored ? JSON.parse(stored) : [];
  }

  static saveAlbum(album: Album): void {
    if (typeof window === "undefined") return;
    const albums = this.getAlbums();
    const existingIndex = albums.findIndex((a) => a.id === album.id);
    if (existingIndex >= 0) {
      albums[existingIndex] = album;
    } else {
      albums.unshift(album);
    }
    localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  }

  private static channels: Map<string, BroadcastChannel> = new Map();

  static getChannel(name: string = "together_booth_sync"): BroadcastChannel | null {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
    if (!this.channels.has(name)) {
      this.channels.set(name, new BroadcastChannel(name));
    }
    return this.channels.get(name)!;
  }

  static broadcast(type: string, payload: unknown): void {
    const ch = this.getChannel();
    if (ch) {
      ch.postMessage({ type, payload, timestamp: Date.now() });
    }
  }
}
