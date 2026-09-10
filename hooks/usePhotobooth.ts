"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePhotoboothStore } from "@/store/usePhotoboothStore";
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

      const getWidth = (el: HTMLVideoElement | HTMLCanvasElement) =>
        el instanceof HTMLVideoElement ? el.videoWidth || 1280 : el.width || 1280;
      const getHeight = (el: HTMLVideoElement | HTMLCanvasElement) =>
        el instanceof HTMLVideoElement ? el.videoHeight || 720 : el.height || 720;

      if (elements.length === 0 || !ctx) {
        canvas.width = 1200;
        canvas.height = 900;
        if (ctx) {
          ctx.fillStyle = "#18181b";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return {
          shotIndex,
          timestamp: Date.now(),
          compositeDataUrl: canvas.toDataURL("image/jpeg", 0.95),
          individualFrames: [],
        };
      }

      const el = elements[0];
      canvas.width = 1200;
      canvas.height = 900;

      const srcW = getWidth(el);
      const srcH = getHeight(el);
      const targetRatio = canvas.width / canvas.height;
      const srcRatio = srcW / srcH;

      let sw = srcW;
      let sh = srcH;
      let sx = 0;
      let sy = 0;

      if (srcRatio > targetRatio) {
        sw = srcH * targetRatio;
        sx = (srcW - sw) / 2;
      } else {
        sh = srcW / targetRatio;
        sy = (srcH - sh) / 2;
      }

      if (isMirrored && el instanceof HTMLVideoElement) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(el, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(el, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      frames.push({
        peerId: "local",
        displayName: "You",
        dataUrl,
      });

      return {
        shotIndex,
        timestamp: Date.now(),
        compositeDataUrl: dataUrl,
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
