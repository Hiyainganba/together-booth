"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useMemories } from "@/hooks/useMemories";
import { MemoryItem } from "@/types/memory";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";
import {
  User,
  Camera,
  Heart,
  Calendar,
  Sparkles,
  Download,
  Trash2,
  Edit3,
  Check,
  PlusCircle,
  Share2,
  Copy,
  Images,
  ShieldCheck,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Maya",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Leo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Chloe",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sam",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Luna",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Kai",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, updateProfile, signOut, openAuthModal } = useAuth();
  const { memories, loading: memoriesLoading, deleteMemory } = useMemories();

  const [activeTab, setActiveTab] = useState<"vault" | "settings">("vault");

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.displayName || "");
      setEditBio(user.bio || "Photobooth explorer & memory maker ✨");
      setEditPhone(user.phoneNumber || "");
      setEditAvatar(user.photoURL || AVATAR_PRESETS[0]);
    }
  }, [user]);

  const userMemories = memories.filter((m) => {
    if (!user) return false;
    if (user.isAnonymous) {
      return m.userId === user.uid || m.userId === "guest";
    }
    return m.userId === user.uid;
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        displayName: editName.trim() || "Together Star",
        bio: editBio.trim(),
        phoneNumber: editPhone.trim() || null,
        photoURL: editAvatar,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCopyMemoryLink = (mem: MemoryItem) => {
    navigator.clipboard.writeText(mem.imageUrl);
    setCopiedId(mem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#11100F] text-[#FAF6F0] selection:bg-[#FF6F61] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!isAuthenticated && !authLoading ? (
          <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#1A1816] border border-white/10 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#FF6F61]/20 text-[#FF6F61] flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">Your Profile & Vault</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Sign in or register to store all your photostrip memories online and personalize your profile.
              </p>
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={openAuthModal}>
              <span>Sign In / Create Account</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative rounded-3xl p-6 sm:p-8 bg-[#1A1816] border border-white/10 shadow-2xl overflow-hidden paper-grain">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FF6F61]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#FF6F61] shadow-xl bg-zinc-800 p-1">
                      <img
                        src={user?.photoURL || AVATAR_PRESETS[0]}
                        alt={user?.displayName || "Profile"}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-[#FF6F61] text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      title="Edit Avatar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                      <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
                        {user?.displayName || "Together Star"}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FF6F61]/20 text-[#FFA28B] text-[10px] font-bold border border-[#FF6F61]/30">
                        {user?.isAnonymous ? "Guest Mode" : "Verified Member 🌟"}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 max-w-md font-normal">
                      {user?.bio || "Photobooth explorer & memory maker ✨"}
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500 pt-1 font-mono flex-wrap">
                      {user?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          {user.email}
                        </span>
                      )}
                      {user?.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          {user.phoneNumber}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "2026"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push("/booth")}
                    className="flex items-center gap-2 shadow-lg"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>New Photobooth</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10 max-w-md">
                <div className="text-center sm:text-left">
                  <div className="font-serif text-xl sm:text-2xl font-black text-white">
                    {userMemories.length}
                  </div>
                  <div className="text-[11px] text-zinc-400">Saved Photo Strips</div>
                </div>

                <div className="text-center sm:text-left">
                  <div className="font-serif text-xl sm:text-2xl font-black text-[#FF6F61]">
                    {userMemories.reduce((acc, m) => acc + (m.likesCount || 0), 0)}
                  </div>
                  <div className="text-[11px] text-zinc-400">Total Likes</div>
                </div>

                <div className="text-center sm:text-left">
                  <div className="font-serif text-xl sm:text-2xl font-black text-amber-300">
                    Unlimited
                  </div>
                  <div className="text-[11px] text-zinc-400">Cloud Storage</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#1A1816] border border-white/10 max-w-sm">
              <button
                type="button"
                onClick={() => setActiveTab("vault")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "vault"
                    ? "bg-[#FF6F61] text-white shadow-md shadow-[#FF6F61]/25"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                <span>My Saved Strips ({userMemories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-[#FF6F61] text-white shadow-md shadow-[#FF6F61]/25"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {activeTab === "vault" && (
              <div className="space-y-6">
                {userMemories.length === 0 ? (
                  <div className="rounded-3xl p-12 bg-[#1A1816]/60 border border-white/10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h3 className="font-serif text-lg font-bold text-white">No Photo Strips in Vault Yet</h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Start a photobooth session, invite a friend or your partner, customize your strip, and save it to your online vault!
                      </p>
                    </div>
                    <Button variant="primary" size="md" onClick={() => router.push("/booth")}>
                      <PlusCircle className="w-4 h-4 mr-1.5" />
                      <span>Launch Your Photobooth</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {userMemories.map((mem) => (
                      <div
                        key={mem.id}
                        className="rounded-3xl p-4 bg-[#FAF6F0] text-zinc-950 shadow-2xl border border-zinc-200 flex flex-col justify-between group transition-all hover:scale-102"
                      >
                        <div className="space-y-3">
                          <div
                            onClick={() => setSelectedMemory(mem)}
                            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner cursor-pointer"
                          >
                            <img
                              src={mem.imageUrl}
                              alt={mem.roomName}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-white font-mono">
                                {mem.layout || "Strip"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-sm text-zinc-900 truncate">
                              {mem.roomName || "Photobooth Memory"}
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              {new Date(mem.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                              {(mem.participants || ["Me"]).map((p, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-700"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyMemoryLink(mem)}
                            className="p-2 rounded-xl bg-zinc-200/80 hover:bg-zinc-300 text-zinc-800 transition-colors cursor-pointer"
                            title="Copy Image Link"
                          >
                            {copiedId === mem.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <a
                            href={mem.imageUrl}
                            download={`photobooth-${mem.id}.jpg`}
                            className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => deleteMemory(mem.id)}
                            className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors cursor-pointer"
                            title="Delete Memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-xl rounded-3xl p-6 sm:p-8 bg-[#1A1816] border border-white/10 shadow-2xl space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Profile Details & Settings</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Customize how your name, phone, and avatar appear in rooms and memories.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Profile saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Maya Lin 🌸"
                      maxLength={30}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Bio / Status Tagline
                    </label>
                    <input
                      type="text"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="e.g. Capturing 2 AM calls across 5,000 miles 💌"
                      maxLength={80}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141210] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6F61] text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Select Avatar
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(preset)}
                          className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 cursor-pointer bg-zinc-800 ${
                            editAvatar === preset
                              ? "border-[#FF6F61] scale-105 shadow-md shadow-[#FF6F61]/30"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={preset} alt="Preset" className="w-full h-full object-cover rounded-xl" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="text-xs text-red-400 hover:text-red-300 cursor-pointer font-semibold"
                    >
                      Sign Out of Account
                    </button>

                    <Button type="submit" variant="primary" size="md" isLoading={isSavingProfile}>
                      <Check className="w-4 h-4 mr-1.5" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <Modal
        isOpen={Boolean(selectedMemory)}
        onClose={() => setSelectedMemory(null)}
        title={selectedMemory?.roomName || "Photobooth Strip"}
        description={`Saved on ${selectedMemory?.createdAt ? new Date(selectedMemory.createdAt).toLocaleDateString() : "Online Vault"}`}
        maxWidth="md"
      >
        {selectedMemory && (
          <div className="space-y-4 text-center">
            <div className="aspect-[3/4] max-h-[420px] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 mx-auto">
              <img src={selectedMemory.imageUrl} alt="Strip" className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-400">
                With: {selectedMemory.participants.join(", ")}
              </span>

              <a
                href={selectedMemory.imageUrl}
                download={`together-strip-${selectedMemory.id}.jpg`}
                className="px-4 py-2 rounded-xl bg-[#FF6F61] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Photo</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
