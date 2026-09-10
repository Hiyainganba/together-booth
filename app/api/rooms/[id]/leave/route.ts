import { NextRequest, NextResponse } from "next/server";
import { serverRoomStore } from "@/lib/server-room-store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { uid } = body;
    if (!uid) {
      return NextResponse.json({ error: "Missing participant uid" }, { status: 400 });
    }

    const updated = serverRoomStore.leaveRoom(id, uid);
    return NextResponse.json({ success: true, room: updated });
  } catch {
    return NextResponse.json({ error: "Failed to leave room" }, { status: 500 });
  }
}
