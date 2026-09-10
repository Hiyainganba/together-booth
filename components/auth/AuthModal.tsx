"use client";

import React, { useState } from "react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  UserCheck,
  ArrowRight,
  Mail,
  Lock,
  User,
  Heart,
  LogIn,
  UserPlus,
  Phone,
  KeyRound,
  Check,
  ArrowLeft,
  ShieldCheck,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Maya",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Leo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Chloe",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sam",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Luna",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Kai",
];

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset,
    resetPassword,
    sendPhoneOtp,
    registerOrLoginWithPhone,
    signInWithGoogle,
    signInAsGuest,
  } = useAuth();

  const [authTab, setAuthTab] = useState<"signin" | "register" | "phone" | "forgot" | "guest">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [guestName, setGuestName] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "new_password">("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFormState = () => {
    setError(null);
    setPhoneOtpSent(false);
    setDemoOtpHint(null);
    setForgotStep("email");
    setResetSuccessMessage(null);
  };

  const handleSwitchTab = (tab: "signin" | "register" | "phone" | "forgot" | "guest") => {
    setAuthTab(tab);
    resetFormState();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authTab === "register") {
        if (!email.trim() || !password || !displayName.trim()) {
          throw new Error("Please fill in your name, email, and password.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await registerWithEmail(email, password, displayName, selectedAvatar);
      } else if (authTab === "signin") {
        if (!email.trim() || !password) {
          throw new Error("Please enter your email and password.");
        }
        await signInWithEmail(email, password);
      } else if (authTab === "guest") {
        await signInAsGuest(guestName.trim() || "Guest Creator");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!phoneNumber.trim()) {
        throw new Error("Please enter your mobile phone number with country code.");
      }
      const res = await sendPhoneOtp(phoneNumber);
      setPhoneOtpSent(true);
      setDemoOtpHint(res.verificationCode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send SMS code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!phoneOtp.trim()) {
        throw new Error("Please enter the 6-digit verification code.");
      }
      await registerOrLoginWithPhone(
        phoneNumber,
        phoneOtp,
        displayName.trim() || `Creator ${phoneNumber.slice(-4)}`,
        selectedAvatar
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!forgotEmail.trim()) {
        throw new Error("Please enter your registered email address.");
      }
      const res = await sendPasswordReset(forgotEmail);
      setForgotStep("new_password");
      setResetSuccessMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process password reset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match. Please re-enter.");
      }

      await resetPassword(forgotEmail, newPassword);
      setResetSuccessMessage("Password reset successfully! Signing you in...");

      setTimeout(async () => {
        try {
          await signInWithEmail(forgotEmail, newPassword);
        } catch {
          setAuthTab("signin");
          setEmail(forgotEmail);
        }
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={
        authTab === "register"
          ? "Create Your Member Profile"
          : authTab === "signin"
          ? "Welcome Back to Together Booth"
          : authTab === "phone"
          ? "Phone & SMS Authentication"
          : authTab === "forgot"
          ? "Reset Your Password"
          : "Quick Guest Mode"
      }
      description={
        authTab === "register"
          ? "Register with email, Google, or phone to save all your photostrips online."
          : authTab === "forgot"
          ? "Enter your email to verify your account and set a new password."
          : authTab === "phone"
          ? "Sign in or create an account with instant mobile SMS code."
          : "Sign in to access your online memory vault and join live photobooths."
      }
      maxWidth="md"
    >
      <div className="space-y-5">
        {authTab !== "forgot" && (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#1A1816] border border-white/10 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleSwitchTab("signin")}
              className={cn(
                "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                authTab === "signin"
                  ? "bg-[#FF6F61] text-white shadow-md shadow-[#FF6F61]/25"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("register")}
              className={cn(
                "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                authTab === "register"
                  ? "bg-[#FF6F61] text-white shadow-md shadow-[#FF6F61]/25"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("phone")}
              className={cn(
                "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                authTab === "phone"
                  ? "bg-[#FF6F61] text-white shadow-md shadow-[#FF6F61]/25"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("guest")}
              className={cn(
                "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                authTab === "guest"
                  ? "bg-[#FF6F61] text-white shadow-md shadow-[#FF6F61]/25"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Guest</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {resetSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {authTab !== "forgot" && authTab !== "phone" && (
          <Button
            variant="glass"
            size="lg"
            className="w-full flex items-center justify-center gap-3 bg-white text-zinc-950 hover:bg-zinc-100 font-bold shadow-lg border-white/20"
            onClick={handleGoogle}
            disabled={isLoading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs">Continue with Google</span>
          </Button>
        )}

        {authTab !== "forgot" && authTab !== "phone" && (
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#1A1816] px-3 text-[10px] uppercase tracking-wider text-zinc-500 font-bold absolute">
              {authTab === "register" ? "Or register with details" : authTab === "signin" ? "Or sign in with email" : "Guest info"}
            </span>
          </div>
        )}

        {(authTab === "signin" || authTab === "register" || authTab === "guest") && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authTab === "register" && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Maya Lin 🌸"
                      maxLength={24}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Choose Profile Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {AVATAR_PRESETS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={cn(
                          "w-10 h-10 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer bg-zinc-800 shrink-0",
                          selectedAvatar === avatar
                            ? "border-[#FF6F61] scale-110 shadow-md shadow-[#FF6F61]/30"
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {authTab !== "guest" && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Password
                    </label>
                    {authTab === "signin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          handleSwitchTab("forgot");
                        }}
                        className="text-[11px] font-semibold text-[#FF7E67] hover:text-[#FFA28B] transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {authTab === "guest" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Your Nickname
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Jordan 🧸"
                    maxLength={20}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 mt-2"
              isLoading={isLoading}
            >
              <span>
                {authTab === "register"
                  ? "Create Account & Enter"
                  : authTab === "signin"
                  ? "Sign In"
                  : "Enter as Guest"}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        {authTab === "phone" && (
          <div className="space-y-4">
            {!phoneOtpSent ? (
              <form onSubmit={handleSendPhoneCode} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 234-5678 or +91 98765 43210"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Enter full number with international country code (+1, +44, +91, etc.)
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                  isLoading={isLoading}
                >
                  <Send className="w-4 h-4" />
                  <span>Send 6-Digit SMS Code</span>
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneLogin} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                  <span>SMS Code Sent to <strong>{phoneNumber}</strong></span>
                  {demoOtpHint && (
                    <span className="font-mono px-2 py-0.5 rounded bg-amber-500/20 font-bold">
                      Code: {demoOtpHint}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Enter 6-Digit Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-base font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Jordan Rivera 🌸"
                      maxLength={24}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Choose Profile Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {AVATAR_PRESETS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={cn(
                          "w-10 h-10 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer bg-zinc-800 shrink-0",
                          selectedAvatar === avatar
                            ? "border-[#FF6F61] scale-110 shadow-md shadow-[#FF6F61]/30"
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPhoneOtpSent(false)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
                    title="Change Phone Number"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1 flex items-center justify-center gap-2"
                    isLoading={isLoading}
                  >
                    <span>Verify & Enter</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {authTab === "forgot" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => handleSwitchTab("signin")}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </div>

            {forgotStep === "email" ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    We will verify your account and allow you to set a fresh new password.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                  isLoading={isLoading}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Email & Continue</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 mt-2"
                  isLoading={isLoading}
                >
                  <Check className="w-4 h-4" />
                  <span>Save New Password & Sign In</span>
                </Button>
              </form>
            )}
          </div>
        )}

        <p className="text-[10px] text-center text-zinc-500">
          Secure private accounts • Free cloud memory vault • Instant room code sharing
        </p>
      </div>
    </Modal>
  );
}
