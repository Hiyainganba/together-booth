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
  Eye,
  EyeOff,
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
    registerWithEmailAndPhone,
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
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [guestName, setGuestName] = useState("");

  const [regPhone, setRegPhone] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpHint, setRegOtpHint] = useState<string | null>(null);

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
    setRegOtpSent(false);
    setRegOtpHint(null);
    setForgotStep("email");
    setResetSuccessMessage(null);
  };

  const handleSwitchTab = (tab: "signin" | "register" | "phone" | "forgot" | "guest") => {
    setAuthTab(tab);
    resetFormState();
  };

  const handleSendRegPhoneCode = async () => {
    if (!regPhone.trim()) {
      setError("Please enter your mobile phone number with country code first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(regPhone);
      setRegOtpSent(true);
      setRegOtpHint(res.verificationCode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send SMS code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!displayName.trim()) {
        throw new Error("Please enter your display name.");
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }
      if (!regPhone.trim()) {
        throw new Error("Please enter your mobile phone number.");
      }
      if (regOtpSent && !regOtp.trim()) {
        throw new Error("Please enter the 6-digit mobile verification code sent to your phone.");
      }
      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      await registerWithEmailAndPhone(
        email,
        regPhone,
        password,
        displayName,
        selectedAvatar,
        "Photobooth explorer & memory maker ✨",
        regOtp.trim() || undefined
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email.trim() || !password) {
        throw new Error("Please enter your registered email/phone and password.");
      }
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInAsGuest(guestName.trim() || "Guest Creator");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Guest sign in failed");
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
          ? "Create Verified Member Profile"
          : authTab === "signin"
          ? "Welcome Back to Together Booth"
          : authTab === "phone"
          ? "Phone & SMS OTP Authentication"
          : authTab === "forgot"
          ? "Reset Your Password"
          : "Quick Guest Mode"
      }
      description={
        authTab === "register"
          ? "Strict registration with email, mobile phone code, and memory vault."
          : authTab === "forgot"
          ? "Verify your account and set a fresh new password."
          : authTab === "phone"
          ? "Sign in or register instantly using 6-digit SMS verification code."
          : "Sign in to access your personal memory vault and launch photobooths."
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {authTab !== "forgot" && (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#1A1816] border border-white/10 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleSwitchTab("signin")}
              className={cn(
                "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
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
                "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
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
                "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                authTab === "phone"
                  ? "bg-[#FF6F61] text-white shadow-md shadow-[#FF6F61]/25"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("guest")}
              className={cn(
                "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
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
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {resetSuccessMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {authTab !== "forgot" && authTab !== "phone" && authTab !== "register" && (
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

        {authTab !== "forgot" && authTab !== "phone" && authTab !== "register" && (
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#1A1816] px-3 text-[10px] uppercase tracking-wider text-zinc-500 font-bold absolute">
              {authTab === "signin" ? "Or sign in with email/phone" : "Guest info"}
            </span>
          </div>
        )}

        {authTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[62vh] overflow-y-auto pr-1 no-scrollbar">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Display Name / Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Lin 🌸"
                  maxLength={28}
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Mobile Phone Number (SMS Code)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 555-0199 or +91 9876543210"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendRegPhoneCode}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#FFA28B] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border border-white/10 shrink-0"
                >
                  {regOtpSent ? "Resend Code" : "Send SMS Code"}
                </button>
              </div>

              {regOtpSent && (
                <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                  <span>SMS Code Sent!</span>
                  {regOtpHint && (
                    <span className="font-mono px-2 py-0.5 rounded bg-amber-500/20 font-bold">
                      Code: {regOtpHint}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                6-Digit Mobile Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all font-mono tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min 6 characters)"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {AVATAR_PRESETS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={cn(
                      "w-9 h-9 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer bg-zinc-800 shrink-0",
                      selectedAvatar === avatar
                        ? "border-[#FF6F61] scale-105 shadow-md shadow-[#FF6F61]/30"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 mt-3"
              isLoading={isLoading}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Register & Enter Vault</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        {authTab === "signin" && (
          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address or Mobile Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com or +1 555-0199"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
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
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 mt-2"
              isLoading={isLoading}
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        {authTab === "guest" && (
          <form onSubmit={handleGuestSubmit} className="space-y-3.5">
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 mt-2"
              isLoading={isLoading}
            >
              <span>Enter as Guest</span>
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
                    Your Name (for new creators)
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
                    Your Registered Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
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
                  <span>Verify Account & Continue</span>
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
          Secure private accounts • Isolated personal memory vault • Instant room access
        </p>
      </div>
    </Modal>
  );
}
