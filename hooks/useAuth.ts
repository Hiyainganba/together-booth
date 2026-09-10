"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types/auth";

export function useAuth() {
  const { user, loading, isAuthModalOpen, openAuthModal, closeAuthModal, setUser } =
    useAuthStore();

  useEffect(() => {
    const unsub = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, [setUser]);

  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    photoURL?: string,
    bio?: string
  ) => {
    const u = await authService.registerWithEmail(email, pass, displayName, photoURL, bio);
    setUser(u);
    closeAuthModal();
    return u;
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const u = await authService.signInWithEmail(email, pass);
    setUser(u);
    closeAuthModal();
    return u;
  };

  const sendPasswordReset = async (email: string) => {
    return await authService.sendPasswordResetEmail(email);
  };

  const resetPassword = async (email: string, newPass: string) => {
    await authService.resetPasswordWithEmail(email, newPass);
  };

  const sendPhoneOtp = async (phoneNumber: string) => {
    return await authService.sendPhoneOtp(phoneNumber);
  };

  const registerOrLoginWithPhone = async (
    phoneNumber: string,
    verificationCode: string,
    displayName?: string,
    photoURL?: string,
    bio?: string
  ) => {
    const u = await authService.registerOrLoginWithPhone(
      phoneNumber,
      verificationCode,
      displayName,
      photoURL,
      bio
    );
    setUser(u);
    closeAuthModal();
    return u;
  };

  const signInWithGoogle = async () => {
    const u = await authService.signInWithGoogle();
    setUser(u);
    closeAuthModal();
    return u;
  };

  const signInAsGuest = async (displayName: string) => {
    const u = await authService.signInAsGuest(displayName);
    setUser(u);
    closeAuthModal();
    return u;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const u = await authService.updateUserProfile(updates);
    setUser(u);
    return u;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isGuest: Boolean(user?.isAnonymous),
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset,
    resetPassword,
    sendPhoneOtp,
    registerOrLoginWithPhone,
    signInWithGoogle,
    signInAsGuest,
    updateProfile,
    signOut,
  };
}
