export type RoomMode = "solo" | "couple" | "group";

export type LayoutMode =
  | "1-person"
  | "2-split"
  | "2-vertical"
  | "3-grid"
  | "4-grid"
  | "dynamic";

export interface Participant {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  isHost: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  joinedAt: number;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  hostId: string;
  mode: RoomMode;
  layout: LayoutMode;
  maxParticipants: number;
  createdAt: number;
  isActive: boolean;
  shotCount: number;
  countdownDuration: number;
  isCountdownActive: boolean;
  countdownTargetTime?: number;
  currentShotIndex: number;
  virtualBackground?: string;
  customBackgroundUrl?: string;
  backgroundBlur?: boolean;
  unifiedBackgroundMode?: boolean;
  participants: Record<string, Participant>;
}

export interface CaptureSignal {
  type: "countdown_start" | "countdown_cancel" | "capture_now" | "capture_completed";
  duration?: number;
  shotIndex?: number;
  timestamp: number;
  senderId: string;
}
