import { FilterType } from "./filter";

export type StripLayoutType =
  | "strip-3"
  | "strip-4"
  | "grid-4"
  | "polaroid-single"
  | "couple-split";

export type FrameStyleType =
  | "classic-white"
  | "luxury-black"
  | "pastel-pink"
  | "pastel-blue"
  | "cyber-chrome"
  | "vintage-paper"
  | "heart-romance"
  | "y2k-grid";

export interface ShotTransform {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface CapturedParticipantFrame {
  peerId: string;
  displayName: string;
  dataUrl: string;
  personOnlyDataUrl?: string;
}

export interface CapturedShot {
  shotIndex: number;
  timestamp: number;
  compositeDataUrl: string;
  originalDataUrl?: string;
  personOnlyDataUrl?: string;
  isBackgroundRemoved?: boolean;
  individualFrames: CapturedParticipantFrame[];
  transform?: ShotTransform;
}

export interface StickerItem {
  id: string;
  content: string;
  category: "emoji" | "doodle" | "heart" | "badge" | "stamp" | "tape";
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface TextItem {
  id: string;
  text: string;
  fontFamily: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

export interface PhotoStripProject {
  id: string;
  roomId?: string;
  roomName?: string;
  createdAt: number;
  shots: CapturedShot[];
  layout: StripLayoutType;
  filter: FilterType;
  frameStyle: FrameStyleType;
  backgroundColor: string;
  virtualBackground?: string;
  customBackgroundUrl?: string;
  photoBackdrop?: string;
  shotsBackgroundRemoved?: boolean;
  stickers: StickerItem[];
  texts: TextItem[];
  showDateStamp: boolean;
  showRoomStamp: boolean;
  customStampText: string;
  applyToAllUsers?: boolean;
}

export type ExportFormat = "png" | "jpg" | "pdf";

