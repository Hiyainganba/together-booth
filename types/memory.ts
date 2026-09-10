import { FilterType } from "./filter";
import { FrameStyleType, StripLayoutType } from "./photobooth";

export interface MemoryItem {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  roomId?: string;
  roomName?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  layout: StripLayoutType;
  filter: FilterType;
  frameStyle: FrameStyleType;
  participants: string[];
  createdAt: number;
  isPrivate: boolean;
  albumId?: string;
  likesCount: number;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdBy: string;
  isPrivate: boolean;
  itemCount: number;
  createdAt: number;
}
