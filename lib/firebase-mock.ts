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
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  }

  static getUserByEmail(email: string): (UserProfile & { password?: string }) | null {
    const users = this.getRegisteredUsers();
    const clean = email.trim().toLowerCase();
    const list = Object.values(users);
    const found = list.find((u) => u.email && u.email.trim().toLowerCase() === clean);
    return found || null;
  }

  static getUserByPhone(phone: string): (UserProfile & { password?: string }) | null {
    const users = this.getRegisteredUsers();
    const cleanDigits = phone.replace(/[^\d+]/g, "");
    const list = Object.values(users);
    const found = list.find((u) => {
      if (!u.phoneNumber) return false;
      const uDigits = u.phoneNumber.replace(/[^\d+]/g, "");
      return uDigits === cleanDigits || uDigits.slice(-10) === cleanDigits.slice(-10);
    });
    return found || null;
  }

  static getUserByEmailOrPhone(identifier: string): (UserProfile & { password?: string }) | null {
    const clean = identifier.trim().toLowerCase();
    const byEmail = this.getUserByEmail(clean);
    if (byEmail) return byEmail;
    return this.getUserByPhone(identifier);
  }

  static resetUserPassword(emailOrPhone: string, newPass: string): boolean {
    if (typeof window === "undefined") return false;
    const users = this.getRegisteredUsers();
    const user = this.getUserByEmailOrPhone(emailOrPhone);
    if (!user) return false;

    user.password = newPass;
    users[user.uid] = user;
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    const current = this.getUser();
    if (current && current.uid === user.uid) {
      this.setUser(user);
    }
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
