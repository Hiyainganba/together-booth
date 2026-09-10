"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
import { useRoomStore } from "@/store/useRoomStore";
import { soundEffects } from "@/lib/sound-effects";
import { CapturedShot, CapturedParticipantFrame } from "@/types/photobooth";

export function usePhotobooth() {
  const {
    localStream,
    isCameraActive,
    isMicActive,
    isMirrored,
    activeFilter,
    capturedShots,
    isCapturing,
    countdownValue,
    showFlash,
    availableCameras,
    selectedCameraId,
    setLocalStream,
    toggleCamera,
    toggleMic,
    toggleMirror,
    setActiveFilter,
    addCapturedShot,
    clearCapturedShots,
    setIsCapturing,
    setCountdownValue,
    triggerFlash,
    setAvailableCameras,
    setSelectedCameraId,
  } = usePhotoboothStore();

  const { room } = useRoomStore();
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initMedia = useCallback(async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
        },
        audio: true,
      });

      setLocalStream(stream);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(videoDevs);
    } catch {
      try {
        const streamOnlyVideo = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setLocalStream(streamOnlyVideo);
      } catch {}
    }
  }, [selectedCameraId, setLocalStream, setAvailableCameras]);

  useEffect(() => {
    initMedia();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureCurrentComposition = useCallback(
    (shotIndex: number): CapturedShot => {
      const frames: CapturedParticipantFrame[] = [];

      const markedElements = document.querySelectorAll<HTMLVideoElement | HTMLCanvasElement>(
        "[data-video-source='true']"
      );
      const elements: (HTMLVideoElement | HTMLCanvasElement)[] =
        markedElements.length > 0
          ? Array.from(markedElements)
          : Array.from(document.querySelectorAll<HTMLVideoElement>("video"));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (elements.length === 0 || !ctx) {
        canvas.width = 800;
        canvas.height = 600;
        if (ctx) {
          ctx.fillStyle = "#18181b";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return {
          shotIndex,
          timestamp: Date.now(),
          compositeDataUrl: canvas.toDataURL("image/jpeg", 0.92),
          individualFrames: [],
        };
      }

      const totalElements = elements.length;

      const getWidth = (el: HTMLVideoElement | HTMLCanvasElement) =>
        el instanceof HTMLVideoElement ? el.videoWidth || 800 : el.width || 800;
      const getHeight = (el: HTMLVideoElement | HTMLCanvasElement) =>
        el instanceof HTMLVideoElement ? el.videoHeight || 600 : el.height || 600;

      if (totalElements === 1) {
        const el = elements[0];
        canvas.width = getWidth(el);
        canvas.height = getHeight(el);

        if (isMirrored && el instanceof HTMLVideoElement) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
        if (isMirrored && el instanceof HTMLVideoElement) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        frames.push({
          peerId: "local",
          displayName: "Me",
          dataUrl,
        });

        return {
          shotIndex,
          timestamp: Date.now(),
          compositeDataUrl: dataUrl,
          individualFrames: frames,
        };
      }

      if (totalElements === 2) {
        canvas.width = 1280;
        canvas.height = 720;
        const halfWidth = canvas.width / 2;

        elements.forEach((el, idx) => {
          const singleCanvas = document.createElement("canvas");
          singleCanvas.width = getWidth(el);
          singleCanvas.height = getHeight(el);
          const sCtx = singleCanvas.getContext("2d");
          if (sCtx) {
            sCtx.drawImage(el, 0, 0, singleCanvas.width, singleCanvas.height);
          }
          const sDataUrl = singleCanvas.toDataURL("image/jpeg", 0.9);
          frames.push({
            peerId: idx === 0 ? "local" : `peer_${idx}`,
            displayName: idx === 0 ? "You" : `Friend ${idx}`,
            dataUrl: sDataUrl,
          });

          ctx.save();
          ctx.beginPath();
          ctx.rect(idx * halfWidth, 0, halfWidth, canvas.height);
          ctx.clip();
          ctx.drawImage(el, idx * halfWidth, 0, halfWidth, canvas.height);
          ctx.restore();
        });

        return {
          shotIndex,
          timestamp: Date.now(),
          compositeDataUrl: canvas.toDataURL("image/jpeg", 0.92),
          individualFrames: frames,
        };
      }

      canvas.width = 1200;
      canvas.height = 900;
      const cols = totalElements <= 4 ? 2 : 3;
      const rows = Math.ceil(totalElements / cols);
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      elements.forEach((el, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);

        const singleCanvas = document.createElement("canvas");
        singleCanvas.width = getWidth(el);
        singleCanvas.height = getHeight(el);
        const sCtx = singleCanvas.getContext("2d");
        if (sCtx) {
          sCtx.drawImage(el, 0, 0, singleCanvas.width, singleCanvas.height);
        }
        const sDataUrl = singleCanvas.toDataURL("image/jpeg", 0.9);
        frames.push({
          peerId: idx === 0 ? "local" : `peer_${idx}`,
          displayName: idx === 0 ? "You" : `Friend ${idx}`,
          dataUrl: sDataUrl,
        });

        ctx.drawImage(el, c * cellWidth, r * cellHeight, cellWidth, cellHeight);
      });

      return {
        shotIndex,
        timestamp: Date.now(),
        compositeDataUrl: canvas.toDataURL("image/jpeg", 0.92),
        individualFrames: frames,
      };
    },
    [isMirrored]
  );

  const startPhotoSession = useCallback(
    async (
      totalShots: number = 3,
      countdownSec: number = 3,
      onComplete?: (shots: CapturedShot[]) => void,
      onTick?: (val: number | null) => void,
      onFlash?: () => void
    ) => {
      if (isCapturing) return;
      setIsCapturing(true);
      clearCapturedShots();

      const collected: CapturedShot[] = [];

      for (let shot = 1; shot <= totalShots; shot++) {
        for (let cd = countdownSec; cd > 0; cd--) {
          setCountdownValue(cd);
          onTick?.(cd);
          soundEffects.playCountdownTick(cd === 1);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setCountdownValue(0);
        onTick?.(0);
        soundEffects.playShutter();
        triggerFlash();
        onFlash?.();

        await new Promise((resolve) => setTimeout(resolve, 150));
        const shotData = captureCurrentComposition(shot);
        collected.push(shotData);
        addCapturedShot(shotData);

        setCountdownValue(null);
        onTick?.(null);

        if (shot < totalShots) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }

      soundEffects.playSuccess();
      setIsCapturing(false);
      onComplete?.(collected);
    },
    [
      isCapturing,
      setIsCapturing,
      clearCapturedShots,
      setCountdownValue,
      triggerFlash,
      captureCurrentComposition,
      addCapturedShot,
    ]
  );

  const cancelSession = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCapturing(false);
    setCountdownValue(null);
  }, [setIsCapturing, setCountdownValue]);

  return {
    localStream,
    isCameraActive,
    isMicActive,
    isMirrored,
    activeFilter,
    capturedShots,
    isCapturing,
    countdownValue,
    showFlash,
    availableCameras,
    selectedCameraId,
    toggleCamera,
    toggleMic,
    toggleMirror,
    setActiveFilter,
    setSelectedCameraId,
    startPhotoSession,
    cancelSession,
    clearCapturedShots,
  };
}
