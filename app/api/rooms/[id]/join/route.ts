import { NextRequest, NextResponse } from "next/server";
import { serverRoomStore } from "@/lib/server-room-store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { participant } = body;
    if (!participant || !participant.uid) {
      return NextResponse.json({ error: "Invalid participant payload" }, { status: 400 });
    }

    const updated = serverRoomStore.joinRoom(id, participant);
    if (!updated) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room: updated, participant });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to join room";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
