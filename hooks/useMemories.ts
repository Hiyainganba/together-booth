"use client";

import { useState, useEffect, useCallback } from "react";
import { MemoryItem } from "@/types/memory";
import { memoryService } from "@/services/memoryService";
import { useAuthStore } from "@/store/useAuthStore";

export function useMemories() {
  const { user } = useAuthStore();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const items = await memoryService.getMemories();
      setMemories(items);
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories, user]);

  const saveMemory = async (memory: MemoryItem) => {
    await memoryService.saveMemory(memory);
    setMemories((prev) => [memory, ...prev.filter((m) => m.id !== memory.id)]);
  };

  const deleteMemory = async (memoryId: string) => {
    await memoryService.deleteMemory(memoryId);
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
  };

  const likeMemory = async (memoryId: string) => {
    await memoryService.likeMemory(memoryId);
    setMemories((prev) =>
      prev.map((m) =>
        m.id === memoryId ? { ...m, likesCount: (m.likesCount || 0) + 1 } : m
      )
    );
  };

  return {
    memories,
    loading,
    refreshMemories: fetchMemories,
    saveMemory,
    deleteMemory,
    likeMemory,
  };
}
