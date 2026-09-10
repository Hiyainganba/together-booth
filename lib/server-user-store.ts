import { UserProfile } from "@/types/auth";

declare global {
  var __together_booth_users_db: Map<string, UserProfile & { password?: string }> | undefined;
}

const usersDb: Map<string, UserProfile & { password?: string }> =
  globalThis.__together_booth_users_db || (globalThis.__together_booth_users_db = new Map());

export const serverUserStore = {
  saveUser(user: UserProfile & { password?: string }): UserProfile & { password?: string } {
    usersDb.set(user.uid, user);
    if (user.email) {
      usersDb.set(`email_${user.email.toLowerCase()}`, user);
    }
    if (user.phoneNumber) {
      const clean = user.phoneNumber.replace(/[^\d+]/g, "");
      usersDb.set(`phone_${clean}`, user);
    }
    return user;
  },

  getUserById(uid: string): (UserProfile & { password?: string }) | null {
    if (usersDb.has(uid)) {
      return usersDb.get(uid)!;
    }
    return null;
  },

  getUserByEmail(email: string): (UserProfile & { password?: string }) | null {
    const clean = email.trim().toLowerCase();
    if (usersDb.has(`email_${clean}`)) {
      return usersDb.get(`email_${clean}`)!;
    }
    for (const u of usersDb.values()) {
      if (u.email && u.email.trim().toLowerCase() === clean) {
        return u;
      }
    }
    return null;
  },

  getUserByPhone(phone: string): (UserProfile & { password?: string }) | null {
    const cleanDigits = phone.replace(/[^\d+]/g, "");
    if (usersDb.has(`phone_${cleanDigits}`)) {
      return usersDb.get(`phone_${cleanDigits}`)!;
    }
    for (const u of usersDb.values()) {
      if (u.phoneNumber) {
        const uDigits = u.phoneNumber.replace(/[^\d+]/g, "");
        if (uDigits === cleanDigits || uDigits.slice(-10) === cleanDigits.slice(-10)) {
          return u;
        }
      }
    }
    return null;
  },

  getUserByEmailOrPhone(identifier: string): (UserProfile & { password?: string }) | null {
    const clean = identifier.trim().toLowerCase();
    const byEmail = this.getUserByEmail(clean);
    if (byEmail) return byEmail;
    return this.getUserByPhone(identifier);
  },

  resetPassword(emailOrPhone: string, newPass: string): boolean {
    const user = this.getUserByEmailOrPhone(emailOrPhone);
    if (!user) return false;
    user.password = newPass;
    this.saveUser(user);
    return true;
  },

  getAllUsers(): UserProfile[] {
    const list: UserProfile[] = [];
    const seenUids = new Set<string>();
    for (const u of usersDb.values()) {
      if (!seenUids.has(u.uid)) {
        seenUids.add(u.uid);
        const { password, ...cleanProfile } = u;
        list.push(cleanProfile);
      }
    }
    return list;
  },
};
