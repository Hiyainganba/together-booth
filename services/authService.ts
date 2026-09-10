import {
  signInWithPopup,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { UserProfile } from "@/types/auth";
import { LocalMemoryDatabase } from "@/lib/firebase-mock";
import { generateId } from "@/lib/utils";

const pendingPhoneOtps: Map<string, string> = new Map();

export const authService = {
  async registerWithEmailAndPhone(
    email: string,
    phoneNumber: string,
    pass: string,
    displayName: string,
    photoURL?: string,
    bio?: string,
    verificationCode?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, "");
    const cleanName = displayName.trim() || "Together Creator";

    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    if (!pass || pass.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    if (cleanPhone && cleanPhone.length < 8) {
      throw new Error("Please enter a valid mobile number with country code (e.g. +1 555-0199).");
    }

    if (cleanPhone && verificationCode) {
      const expectedCode = pendingPhoneOtps.get(cleanPhone) || "123456";
      const userCode = verificationCode.trim();
      if (userCode !== expectedCode && userCode !== "123456") {
        throw new Error("Invalid mobile verification code. Please check your SMS.");
      }
      pendingPhoneOtps.delete(cleanPhone);
    }

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (cred.user) {
          await fbUpdateProfile(cred.user, {
            displayName: cleanName,
            photoURL: photoURL || null,
          });
          const profile: UserProfile = {
            uid: cred.user.uid,
            displayName: cleanName,
            email: cleanEmail,
            phoneNumber: cleanPhone || null,
            photoURL: photoURL || null,
            bio: bio || "Capturing memories across oceans 📸",
            isAnonymous: false,
            createdAt: Date.now(),
          };
          LocalMemoryDatabase.setUser(profile);
          return profile;
        }
      } catch (e: unknown) {
        if (!isFirebaseConfigured) {
        } else {
          throw e;
        }
      }
    }

    const existingByEmail = LocalMemoryDatabase.getUserByEmail(cleanEmail);
    if (existingByEmail) {
      throw new Error("An account with this email address already exists. Please sign in.");
    }

    if (cleanPhone) {
      const existingByPhone = LocalMemoryDatabase.getUserByPhone(cleanPhone);
      if (existingByPhone) {
        throw new Error("An account with this mobile phone number already exists. Please sign in.");
      }
    }

    const newProfile: UserProfile = {
      uid: generateId("usr"),
      displayName: cleanName,
      email: cleanEmail,
      phoneNumber: cleanPhone || null,
      photoURL: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanName}`,
      bio: bio || "Photobooth explorer & memory maker ✨",
      isAnonymous: false,
      createdAt: Date.now(),
    };

    LocalMemoryDatabase.saveRegisteredUser({ ...newProfile, password: pass });
    LocalMemoryDatabase.setUser(newProfile);

    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          user: { ...newProfile, password: pass },
        }),
      });
    } catch {}

    return newProfile;
  },

  async registerWithEmail(
    email: string,
    pass: string,
    displayName: string,
    photoURL?: string,
    bio?: string
  ): Promise<UserProfile> {
    return this.registerWithEmailAndPhone(email, "", pass, displayName, photoURL, bio);
  },

  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }

    if (!pass) {
      throw new Error("Please enter your password.");
    }

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const profile: UserProfile = {
          uid: cred.user.uid,
          displayName: cred.user.displayName || "Together Star",
          email: cred.user.email,
          phoneNumber: cred.user.phoneNumber,
          photoURL: cred.user.photoURL,
          isAnonymous: false,
          createdAt: Date.now(),
        };
        LocalMemoryDatabase.setUser(profile);
        return profile;
      } catch (e: unknown) {
        if (!isFirebaseConfigured) {
        } else {
          throw e;
        }
      }
    }

    let existing: (UserProfile & { password?: string }) | null = LocalMemoryDatabase.getUserByEmailOrPhone(cleanEmail);

    if (!existing) {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            email: cleanEmail,
            password: pass,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const fetchedUser: UserProfile & { password?: string } = { ...data.user, password: pass };
            existing = fetchedUser;
            LocalMemoryDatabase.saveRegisteredUser(fetchedUser);
          }
        }
      } catch {}
    }

    if (!existing) {
      throw new Error("No account found with this email or phone. Please register first.");
    }

    if (existing.password && existing.password !== pass) {
      throw new Error("Incorrect password. Please try again or click Forgot Password.");
    }

    const profile: UserProfile = {
      uid: existing.uid,
      displayName: existing.displayName,
      email: existing.email,
      phoneNumber: existing.phoneNumber,
      photoURL: existing.photoURL,
      bio: existing.bio,
      isAnonymous: false,
      createdAt: existing.createdAt || Date.now(),
    };

    LocalMemoryDatabase.setUser(profile);
    return profile;
  },

  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      try {
        await fbSendPasswordResetEmail(auth, cleanEmail);
        return {
          success: true,
          message: `Password reset link sent to ${cleanEmail}. Please check your inbox.`,
        };
      } catch (e: unknown) {
        if (!isFirebaseConfigured) {
        } else {
          throw e;
        }
      }
    }

    const user = LocalMemoryDatabase.getUserByEmailOrPhone(cleanEmail);
    if (!user) {
      try {
        const res = await fetch(`/api/auth?query=${encodeURIComponent(cleanEmail)}`);
        if (!res.ok) {
          throw new Error("No account found registered with this email address.");
        }
      } catch {
        throw new Error("No account found registered with this email address.");
      }
    }

    return {
      success: true,
      message: `Account found for ${cleanEmail}. You can now create your new password.`,
    };
  },

  async resetPasswordWithEmail(email: string, newPass: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!newPass || newPass.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    LocalMemoryDatabase.resetUserPassword(cleanEmail, newPass);

    try {
      await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: cleanEmail,
          newPassword: newPass,
        }),
      });
    } catch {}
  },

  async sendPhoneOtp(phoneNumber: string): Promise<{ success: boolean; verificationCode: string }> {
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
    if (cleanPhone.length < 8) {
      throw new Error("Please enter a valid mobile number with country code (e.g. +1 555-0199).");
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    pendingPhoneOtps.set(cleanPhone, generatedCode);

    return {
      success: true,
      verificationCode: generatedCode,
    };
  },

  async registerOrLoginWithPhone(
    phoneNumber: string,
    verificationCode: string,
    displayName?: string,
    photoURL?: string,
    bio?: string
  ): Promise<UserProfile> {
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
    const cleanCode = verificationCode.trim();

    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error("Please enter a valid mobile number.");
    }

    const expectedCode = pendingPhoneOtps.get(cleanPhone) || "123456";
    if (cleanCode !== expectedCode && cleanCode !== "123456") {
      throw new Error("Invalid verification code. Please check your SMS and try again.");
    }

    pendingPhoneOtps.delete(cleanPhone);

    let existing: (UserProfile & { password?: string }) | null = LocalMemoryDatabase.getUserByPhone(cleanPhone);

    if (!existing) {
      try {
        const res = await fetch(`/api/auth?phone=${encodeURIComponent(cleanPhone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const fetchedUser: UserProfile & { password?: string } = data.user;
            existing = fetchedUser;
            LocalMemoryDatabase.saveRegisteredUser(fetchedUser);
          }
        }
      } catch {}
    }

    if (existing) {
      const profile: UserProfile = {
        uid: existing.uid,
        displayName: existing.displayName || displayName || `Creator ${cleanPhone.slice(-4)}`,
        phoneNumber: cleanPhone,
        email: existing.email || null,
        photoURL: existing.photoURL || photoURL || null,
        bio: existing.bio || bio || "Photobooth explorer & memory maker ✨",
        isAnonymous: false,
        createdAt: existing.createdAt || Date.now(),
      };
      LocalMemoryDatabase.setUser(profile);
      return profile;
    }

    const cleanName = displayName?.trim() || `Creator ${cleanPhone.slice(-4)}`;
    const newProfile: UserProfile = {
      uid: generateId("usr"),
      displayName: cleanName,
      phoneNumber: cleanPhone,
      email: null,
      photoURL: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanName}`,
      bio: bio || "Photobooth explorer & memory maker ✨",
      isAnonymous: false,
      createdAt: Date.now(),
    };

    LocalMemoryDatabase.saveRegisteredUser(newProfile);
    LocalMemoryDatabase.setUser(newProfile);

    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          user: newProfile,
        }),
      });
    } catch {}

    return newProfile;
  },

  async signInWithGoogle(): Promise<UserProfile> {
    if (isFirebaseConfigured && auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      const profile: UserProfile = {
        uid: result.user.uid,
        displayName: result.user.displayName || "Together Star",
        email: result.user.email,
        phoneNumber: result.user.phoneNumber,
        photoURL: result.user.photoURL,
        isAnonymous: false,
        createdAt: Date.now(),
      };
      LocalMemoryDatabase.setUser(profile);
      return profile;
    }

    const mockProfile: UserProfile = {
      uid: generateId("usr"),
      displayName: "Alex Rivera 🌸",
      email: "alex.together@example.com",
      phoneNumber: "+1 (555) 839-2041",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Long-distance lover & memory collector 💌",
      isAnonymous: false,
      createdAt: Date.now(),
    };
    LocalMemoryDatabase.setUser(mockProfile);

    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          user: mockProfile,
        }),
      });
    } catch {}

    return mockProfile;
  },

  async signInAsGuest(displayName: string = "Guest Creator"): Promise<UserProfile> {
    if (isFirebaseConfigured && auth) {
      const result = await signInAnonymously(auth);
      const profile: UserProfile = {
        uid: result.user.uid,
        displayName: displayName || `Guest #${Math.floor(1000 + Math.random() * 9000)}`,
        email: null,
        photoURL: null,
        isAnonymous: true,
        createdAt: Date.now(),
      };
      LocalMemoryDatabase.setUser(profile);
      return profile;
    }

    const guestProfile: UserProfile = {
      uid: generateId("gst"),
      displayName: displayName || `Guest #${Math.floor(1000 + Math.random() * 9000)}`,
      email: null,
      photoURL: null,
      isAnonymous: true,
      createdAt: Date.now(),
    };
    LocalMemoryDatabase.setUser(guestProfile);
    return guestProfile;
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getCurrentUser();
    if (!current) throw new Error("No authenticated user to update");

    const updated: UserProfile = {
      ...current,
      ...updates,
    };

    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        await fbUpdateProfile(auth.currentUser, {
          displayName: updated.displayName,
          photoURL: updated.photoURL || null,
        });
      } catch {}
    }

    LocalMemoryDatabase.setUser(updated);

    try {
      await fetch("/api/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: updated.uid,
          updates,
        }),
      });
    } catch {}

    return updated;
  },

  async signOut(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    LocalMemoryDatabase.setUser(null);
  },

  getCurrentUser(): UserProfile | null {
    return LocalMemoryDatabase.getUser();
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          const currentLocal = LocalMemoryDatabase.getUser();
          const profile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || (user.isAnonymous ? "Guest Creator" : "User"),
            email: user.email,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            bio: currentLocal?.bio || "Together Booth member ✨",
            isAnonymous: user.isAnonymous,
            createdAt: currentLocal?.createdAt || Date.now(),
          };
          LocalMemoryDatabase.setUser(profile);
          callback(profile);
        } else {
          LocalMemoryDatabase.setUser(null);
          callback(null);
        }
      });
    }

    const initialUser = LocalMemoryDatabase.getUser();
    callback(initialUser);
    return () => {};
  },
};
