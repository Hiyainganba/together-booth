export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  bio?: string;
  isAnonymous: boolean;
  createdAt?: number;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setUser: (user: UserProfile | null) => void;
}
