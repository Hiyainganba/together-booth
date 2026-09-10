import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { MemoryItem } from "@/types/memory";
import { LocalMemoryDatabase } from "@/lib/firebase-mock";

export const memoryService = {
  async saveMemory(memory: MemoryItem): Promise<void> {
    if (isFirebaseConfigured && db) {
      const memRef = doc(db, "memories", memory.id);
      await setDoc(memRef, memory);
    }
    LocalMemoryDatabase.saveMemory(memory);
  },

  async getMemories(userId?: string, isPrivate?: boolean): Promise<MemoryItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const memRef = collection(db, "memories");
        let q = query(memRef, orderBy("createdAt", "desc"), limit(50));

        if (userId) {
          q = query(memRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
        } else if (isPrivate === false) {
          q = query(memRef, where("isPrivate", "==", false), orderBy("createdAt", "desc"), limit(50));
        }

        const snap = await getDocs(q);
        const results: MemoryItem[] = [];
        snap.forEach((d) => results.push(d.data() as MemoryItem));
        if (results.length > 0) return results;
      } catch {}
    }

    const local = LocalMemoryDatabase.getMemories();
    if (userId) {
      return local.filter((m) => m.userId === userId);
    }
    if (isPrivate === false) {
      return local.filter((m) => !m.isPrivate);
    }
    return local;
  },

  async getRecentMemories(count: number = 8): Promise<MemoryItem[]> {
    const memories = await this.getMemories(undefined, false);
    return memories.slice(0, count);
  },

  async deleteMemory(memoryId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const memRef = doc(db, "memories", memoryId);
        await deleteDoc(memRef);
      } catch {}
    }
    LocalMemoryDatabase.deleteMemory(memoryId);
  },

  async likeMemory(memoryId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const memRef = doc(db, "memories", memoryId);
        await updateDoc(memRef, {
          likesCount: increment(1),
        });
      } catch {}
    }
    const local = LocalMemoryDatabase.getMemories();
    const found = local.find((m) => m.id === memoryId);
    if (found) {
      found.likesCount = (found.likesCount || 0) + 1;
      LocalMemoryDatabase.saveMemory(found);
    }
  },
};
