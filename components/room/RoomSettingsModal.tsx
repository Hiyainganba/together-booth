"use client";

import React from "react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Camera, FlipHorizontal, Mic } from "lucide-react";

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCameras: MediaDeviceInfo[];
  selectedCameraId: string;
  isMirrored: boolean;
  onSelectCamera: (deviceId: string) => void;
  onToggleMirror: () => void;
}

export function RoomSettingsModal({
  isOpen,
  onClose,
  availableCameras,
  selectedCameraId,
  isMirrored,
  onSelectCamera,
  onToggleMirror,
}: RoomSettingsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Camera & Studio Settings"
      description="Adjust your local video device and photobooth preferences."
      maxWidth="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4 text-pink-400" />
            <span>Camera Device</span>
          </label>
          {availableCameras.length > 0 ? (
            <select
              value={selectedCameraId}
              onChange={(e) => onSelectCamera(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-800 border border-white/10 text-white focus:outline-none focus:border-pink-500 text-sm cursor-pointer"
            >
              {availableCameras.map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-zinc-500">Default webcam active</p>
          )}
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/60 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-zinc-200">
              <FlipHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Mirror Preview</h4>
              <p className="text-xs text-zinc-400">Flip your camera feed horizontally</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleMirror}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              isMirrored ? "bg-pink-500" : "bg-zinc-700"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isMirrored ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="pt-2">
          <Button variant="primary" size="md" className="w-full" onClick={onClose}>
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}
