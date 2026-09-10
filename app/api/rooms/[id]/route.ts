import { NextRequest, NextResponse } from "next/server";
import { serverRoomStore } from "@/lib/server-room-store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const room = serverRoomStore.getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json({ room });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const updated = serverRoomStore.updateRoom(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ room: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}
