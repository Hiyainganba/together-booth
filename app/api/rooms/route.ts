import { NextRequest, NextResponse } from "next/server";
import { serverRoomStore } from "@/lib/server-room-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const id = searchParams.get("id");

  const queryParam = code || id;
  if (!queryParam) {
    return NextResponse.json({ error: "Missing room code or id" }, { status: 400 });
  }

  const room = serverRoomStore.getRoom(queryParam);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ room });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room } = body;
    if (!room || !room.id) {
      return NextResponse.json({ error: "Invalid room payload" }, { status: 400 });
    }

    const saved = serverRoomStore.saveRoom(room);
    return NextResponse.json({ room: saved });
  } catch {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
