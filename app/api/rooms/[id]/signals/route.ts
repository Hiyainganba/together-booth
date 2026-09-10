import { NextRequest, NextResponse } from "next/server";
import { serverRoomStore } from "@/lib/server-room-store";
import { SignalMessage } from "@/types/webrtc";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const receiverId = searchParams.get("receiverId");
  const since = Number(searchParams.get("since") || "0");

  if (!receiverId) {
    return NextResponse.json({ error: "Missing receiverId parameter" }, { status: 400 });
  }

  const signals = serverRoomStore.getSignals(id, receiverId, since);
  return NextResponse.json({ signals });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const signal: SignalMessage = body;
    if (!signal || !signal.senderId || !signal.receiverId) {
      return NextResponse.json({ error: "Invalid signal payload" }, { status: 400 });
    }

    serverRoomStore.addSignal(id, signal);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send signal" }, { status: 500 });
  }
}
