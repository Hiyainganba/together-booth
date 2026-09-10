import { NextRequest, NextResponse } from "next/server";
import { serverUserStore } from "@/lib/server-user-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const query = searchParams.get("query");

  if (email) {
    const user = serverUserStore.getUserByEmail(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  }

  if (phone) {
    const user = serverUserStore.getUserByPhone(phone);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  }

  if (query) {
    const user = serverUserStore.getUserByEmailOrPhone(query);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  }

  const users = serverUserStore.getAllUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user, email, phone, password } = body;

    if (action === "register") {
      if (!user || !user.uid) {
        return NextResponse.json({ error: "Invalid user payload" }, { status: 400 });
      }

      if (user.email) {
        const existingEmail = serverUserStore.getUserByEmail(user.email);
        if (existingEmail && existingEmail.uid !== user.uid) {
          return NextResponse.json({ error: "Email already registered on server" }, { status: 409 });
        }
      }

      if (user.phoneNumber) {
        const existingPhone = serverUserStore.getUserByPhone(user.phoneNumber);
        if (existingPhone && existingPhone.uid !== user.uid) {
          return NextResponse.json({ error: "Phone number already registered on server" }, { status: 409 });
        }
      }

      const saved = serverUserStore.saveUser(user);
      const { password: _, ...safeUser } = saved;
      return NextResponse.json({ user: safeUser });
    }

    if (action === "login") {
      const identifier = email || phone;
      if (!identifier || !password) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
      }

      const existing = serverUserStore.getUserByEmailOrPhone(identifier);
      if (!existing) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }

      if (existing.password && existing.password !== password) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
      }

      const { password: _, ...safeUser } = existing;
      return NextResponse.json({ user: safeUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Authentication server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, updates } = body;

    if (!uid || !updates) {
      return NextResponse.json({ error: "Missing uid or updates" }, { status: 400 });
    }

    const existing = serverUserStore.getUserById(uid) || serverUserStore.getUserByEmailOrPhone(uid);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const merged = { ...existing, ...updates };
    const saved = serverUserStore.saveUser(merged);
    const { password: _, ...safeUser } = saved;
    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrPhone, newPassword } = body;

    if (!emailOrPhone || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const success = serverUserStore.resetPassword(emailOrPhone, newPassword);
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
