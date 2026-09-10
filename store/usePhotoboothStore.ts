import { create } from "zustand";
import { FilterType } from "@/types/filter";
import { CapturedShot } from "@/types/photobooth";

interface PhotoboothState {
  localStream: MediaStream | null;
  isCameraActive: boolean;
  isMicActive: boolean;
  isMirrored: boolean;
  activeFilter: FilterType;
  capturedShots: CapturedShot[];
  isCapturing: boolean;
  countdownValue: number | null;
  showFlash: boolean;
  availableCameras: MediaDeviceInfo[];
  selectedCameraId: string;
  setLocalStream: (stream: MediaStream | null) => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleMirror: () => void;
  setActiveFilter: (filter: FilterType) => void;
  addCapturedShot: (shot: CapturedShot) => void;
  clearCapturedShots: () => void;
  setIsCapturing: (capturing: boolean) => void;
  setCountdownValue: (val: number | null) => void;
  triggerFlash: () => void;
  setAvailableCameras: (cameras: MediaDeviceInfo[]) => void;
  setSelectedCameraId: (id: string) => void;
}

export const usePhotoboothStore = create<PhotoboothState>((set, get) => ({
  localStream: null,
  isCameraActive: true,
  isMicActive: true,
  isMirrored: true,
  activeFilter: "normal",
  capturedShots: [],
  isCapturing: false,
  countdownValue: null,
  showFlash: false,
  availableCameras: [],
  selectedCameraId: "",
  setLocalStream: (stream) => set({ localStream: stream }),
  toggleCamera: () => {
    const { localStream, isCameraActive } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = !isCameraActive));
      set({ isCameraActive: !isCameraActive });
    }
  },
  toggleMic: () => {
    const { localStream, isMicActive } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = !isMicActive));
      set({ isMicActive: !isMicActive });
    }
  },
  toggleMirror: () => set((state) => ({ isMirrored: !state.isMirrored })),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  addCapturedShot: (shot) =>
    set((state) => ({ capturedShots: [...state.capturedShots, shot] })),
  clearCapturedShots: () => set({ capturedShots: [] }),
  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setCountdownValue: (countdownValue) => set({ countdownValue }),
  triggerFlash: () => {
    set({ showFlash: true });
    setTimeout(() => set({ showFlash: false }), 450);
  },
  setAvailableCameras: (availableCameras) => set({ availableCameras }),
  setSelectedCameraId: (selectedCameraId) => set({ selectedCameraId }),
}));
