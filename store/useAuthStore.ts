import { create } from "zustand";
import { UserProfile, AuthState } from "@/types/auth";
import { authService } from "@/services/authService";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setUser: (user: UserProfile | null) => set({ user, loading: false }),
}));
