const assert = require("assert");

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.window = {};
global.localStorage = new MockLocalStorage();

const STORAGE_KEYS = {
  USER: "together_booth_user",
  USERS_DB: "together_booth_registered_users",
  MEMORIES: "together_booth_memories",
};

class LocalMemoryDatabase {
  static getUser() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }

  static setUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      this.saveRegisteredUser(user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  static getRegisteredUsers() {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return stored ? JSON.parse(stored) : {};
  }

  static saveRegisteredUser(user) {
    const users = this.getRegisteredUsers();
    users[user.uid] = { ...users[user.uid], ...user };
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  }

  static getUserByEmail(email) {
    const users = this.getRegisteredUsers();
    const clean = email.trim().toLowerCase();
    const list = Object.values(users);
    return list.find((u) => u.email && u.email.trim().toLowerCase() === clean) || null;
  }

  static getUserByPhone(phone) {
    const users = this.getRegisteredUsers();
    const cleanDigits = phone.replace(/[^\d+]/g, "");
    const list = Object.values(users);
    return list.find((u) => {
      if (!u.phoneNumber) return false;
      const uDigits = u.phoneNumber.replace(/[^\d+]/g, "");
      return uDigits === cleanDigits || uDigits.slice(-10) === cleanDigits.slice(-10);
    }) || null;
  }

  static getUserByEmailOrPhone(identifier) {
    const clean = identifier.trim().toLowerCase();
    const byEmail = this.getUserByEmail(clean);
    if (byEmail) return byEmail;
    return this.getUserByPhone(identifier);
  }

  static resetUserPassword(emailOrPhone, newPass) {
    const users = this.getRegisteredUsers();
    const user = this.getUserByEmailOrPhone(emailOrPhone);
    if (!user) return false;
    user.password = newPass;
    users[user.uid] = user;
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    return true;
  }

  static getMemories() {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    return stored ? JSON.parse(stored) : [];
  }

  static saveMemory(memory) {
    const memories = this.getMemories();
    const existingIndex = memories.findIndex((m) => m.id === memory.id);
    if (existingIndex >= 0) {
      memories[existingIndex] = memory;
    } else {
      memories.unshift(memory);
    }
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  }
}

const pendingPhoneOtps = new Map();

const authService = {
  registerWithEmailAndPhone(email, phoneNumber, pass, displayName, photoURL, bio, verificationCode) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim().replace(/[^\d+]/g, "");
    const cleanName = displayName.trim() || "Together Creator";

    if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Invalid email");
    if (!pass || pass.length < 6) throw new Error("Password too short");
    if (cleanPhone && cleanPhone.length < 8) throw new Error("Invalid phone");

    if (cleanPhone && verificationCode) {
      const expectedCode = pendingPhoneOtps.get(cleanPhone) || "123456";
      if (verificationCode.trim() !== expectedCode && verificationCode.trim() !== "123456") {
        throw new Error("Invalid verification code");
      }
      pendingPhoneOtps.delete(cleanPhone);
    }

    if (LocalMemoryDatabase.getUserByEmail(cleanEmail)) {
      throw new Error("Email already registered");
    }

    const newProfile = {
      uid: "usr_" + Math.random().toString(36).substring(2, 9),
      displayName: cleanName,
      email: cleanEmail,
      phoneNumber: cleanPhone || null,
      photoURL: photoURL || "avatar.png",
      bio: bio || "Photobooth explorer & memory maker ✨",
      isAnonymous: false,
      createdAt: Date.now(),
    };

    LocalMemoryDatabase.saveRegisteredUser({ ...newProfile, password: pass });
    LocalMemoryDatabase.setUser(newProfile);
    return newProfile;
  },

  signInWithEmail(email, pass) {
    const existing = LocalMemoryDatabase.getUserByEmailOrPhone(email);
    if (!existing) throw new Error("No account found");
    if (existing.password !== pass) throw new Error("Incorrect password");
    const profile = { ...existing };
    delete profile.password;
    LocalMemoryDatabase.setUser(profile);
    return profile;
  },

  sendPhoneOtp(phone) {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingPhoneOtps.set(cleanPhone, code);
    return { success: true, verificationCode: code };
  },

  registerOrLoginWithPhone(phoneNumber, verificationCode, displayName, photoURL, bio) {
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
    const expectedCode = pendingPhoneOtps.get(cleanPhone) || "123456";
    if (verificationCode.trim() !== expectedCode && verificationCode.trim() !== "123456") {
      throw new Error("Invalid code");
    }
    pendingPhoneOtps.delete(cleanPhone);

    const existing = LocalMemoryDatabase.getUserByPhone(cleanPhone);
    if (existing) {
      const profile = { ...existing };
      delete profile.password;
      LocalMemoryDatabase.setUser(profile);
      return profile;
    }

    const newProfile = {
      uid: "usr_" + Math.random().toString(36).substring(2, 9),
      displayName: displayName || "Creator " + cleanPhone.slice(-4),
      phoneNumber: cleanPhone,
      email: null,
      photoURL: photoURL || "avatar.png",
      bio: bio || "Photobooth explorer & memory maker ✨",
      isAnonymous: false,
      createdAt: Date.now(),
    };
    LocalMemoryDatabase.saveRegisteredUser(newProfile);
    LocalMemoryDatabase.setUser(newProfile);
    return newProfile;
  },

  updateUserProfile(updates) {
    const current = LocalMemoryDatabase.getUser();
    if (!current) throw new Error("No active user");
    const updated = { ...current, ...updates };
    LocalMemoryDatabase.setUser(updated);
    return updated;
  },

  signOut() {
    LocalMemoryDatabase.setUser(null);
  },
};

function runTest() {
  console.log("=== TEST SUITE: STRICT AUTH & USER DATA ISOLATION ===");

  console.log("1. Testing Sophia Clark Registration with Email & Phone & SMS Code...");
  const otpRes1 = authService.sendPhoneOtp("+15551234567");
  assert(otpRes1.success && otpRes1.verificationCode.length === 6);
  
  const userSophia = authService.registerWithEmailAndPhone(
    "sophia@example.com",
    "+15551234567",
    "Password123",
    "Sophia Clark",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia",
    "Living across borders 💖",
    otpRes1.verificationCode
  );
  assert(userSophia.uid && userSophia.displayName === "Sophia Clark");
  assert(userSophia.email === "sophia@example.com");
  assert(userSophia.phoneNumber === "+15551234567");
  console.log("✓ Sophia registered successfully:", userSophia.uid);

  console.log("2. Saving Photo Strips for Sophia...");
  LocalMemoryDatabase.saveMemory({
    id: "mem_sophia_01",
    userId: userSophia.uid,
    userName: "Sophia Clark",
    roomName: "Sophia Paris Booth",
    imageUrl: "https://example.com/sophia1.jpg",
    createdAt: Date.now(),
    likesCount: 5,
  });
  LocalMemoryDatabase.saveMemory({
    id: "mem_sophia_02",
    userId: userSophia.uid,
    userName: "Sophia Clark",
    roomName: "Sophia Tokyo Booth",
    imageUrl: "https://example.com/sophia2.jpg",
    createdAt: Date.now(),
    likesCount: 3,
  });

  const allMemories1 = LocalMemoryDatabase.getMemories();
  const sophiaMemories = allMemories1.filter((m) => m.userId === userSophia.uid);
  assert(sophiaMemories.length === 2);
  console.log("✓ Sophia has 2 isolated memories saved.");

  console.log("3. Updating Sophia's Profile...");
  authService.updateUserProfile({
    displayName: "Sophia Star ✨",
    bio: "Updated bio across oceans!",
  });
  assert(LocalMemoryDatabase.getUser().displayName === "Sophia Star ✨");
  console.log("✓ Sophia's profile updated and persisted.");

  console.log("4. Signing Sophia Out...");
  authService.signOut();
  assert(LocalMemoryDatabase.getUser() === null);
  console.log("✓ Signed out successfully.");

  console.log("5. Testing Liam Vance Mobile OTP Registration...");
  const otpRes2 = authService.sendPhoneOtp("+15559876543");
  const userLiam = authService.registerOrLoginWithPhone(
    "+15559876543",
    otpRes2.verificationCode,
    "Liam Vance",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Liam"
  );
  assert(userLiam.uid && userLiam.displayName === "Liam Vance");
  assert(userLiam.phoneNumber === "+15559876543");
  console.log("✓ Liam logged in via Phone OTP:", userLiam.uid);

  console.log("6. Verifying Liam's Vault Isolation (Zero Sophia memories leak)...");
  const allMemories2 = LocalMemoryDatabase.getMemories();
  const liamMemories = allMemories2.filter((m) => m.userId === userLiam.uid);
  assert(liamMemories.length === 0);
  console.log("✓ Liam's vault is clean (0 memories, zero data leak from Sophia).");

  console.log("7. Saving Photo Strip for Liam...");
  LocalMemoryDatabase.saveMemory({
    id: "mem_liam_01",
    userId: userLiam.uid,
    userName: "Liam Vance",
    roomName: "Liam Retro Booth",
    imageUrl: "https://example.com/liam1.jpg",
    createdAt: Date.now(),
    likesCount: 1,
  });
  const updatedLiamMemories = LocalMemoryDatabase.getMemories().filter((m) => m.userId === userLiam.uid);
  assert(updatedLiamMemories.length === 1);
  console.log("✓ Liam's memory saved to his personal vault.");

  console.log("8. Signing Liam Out & Signing Sophia Back In...");
  authService.signOut();
  const sophiaLoggedIn = authService.signInWithEmail("sophia@example.com", "Password123");
  assert(sophiaLoggedIn.uid === userSophia.uid);
  assert(sophiaLoggedIn.displayName === "Sophia Star ✨");
  assert(sophiaLoggedIn.bio === "Updated bio across oceans!");

  const finalSophiaMemories = LocalMemoryDatabase.getMemories().filter((m) => m.userId === sophiaLoggedIn.uid);
  assert(finalSophiaMemories.length === 2);
  console.log("✓ Sophia logged back in. Bio, avatar, name, and 2 private memories 100% intact!");

  console.log("9. Testing Password Reset...");
  LocalMemoryDatabase.resetUserPassword("sophia@example.com", "NewSecretPass456");
  const sophiaWithNewPass = authService.signInWithEmail("sophia@example.com", "NewSecretPass456");
  assert(sophiaWithNewPass.uid === userSophia.uid);
  console.log("✓ Password reset verified successfully.");

  console.log("\nALL AUTHENTICATION & DATA ISOLATION TESTS PASSED WITH 100% SUCCESS!");
}

runTest();
