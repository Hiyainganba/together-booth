import { getVirtualBackground, VirtualBackgroundPreset } from "./virtual-backgrounds";

interface SelfieSegmentationInstance {
  setOptions: (options: { modelSelection: number; selfieMode?: boolean }) => void;
  onResults: (callback: (results: SegmentationResults) => void) => void;
  send: (input: { image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | ImageBitmap }) => Promise<void>;
  close?: () => void;
}

interface SegmentationResults {
  image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
  segmentationMask: HTMLCanvasElement | ImageBitmap;
}

interface StreamProcessor {
  instance: SelfieSegmentationInstance;
  isProcessing: boolean;
  pendingCallback: ((results: SegmentationResults) => void) | null;
}

class SegmentationEngine {
  private scriptLoaded = false;
  private scriptPromise: Promise<boolean> | null = null;
  private processors: Map<string, StreamProcessor> = new Map();
  private bgImageCache: Map<string, HTMLImageElement> = new Map();
  private offscreenMaskCanvas: HTMLCanvasElement | null = null;
  private offscreenPersonCanvas: HTMLCanvasElement | null = null;

  async init(): Promise<boolean> {
    if (this.scriptLoaded) return true;
    if (this.scriptPromise) return this.scriptPromise;
    if (typeof window === "undefined") return false;

    this.scriptPromise = (async () => {
      try {
        if (!(window as unknown as { SelfieSegmentation?: new (config: unknown) => SelfieSegmentationInstance }).SelfieSegmentation) {
          const existingScript = document.querySelector('script[src*="selfie_segmentation"]');
          if (!existingScript) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
              script.crossOrigin = "anonymous";
              script.onload = () => resolve();
              script.onerror = () => reject(new Error("Failed to load script"));
              document.head.appendChild(script);
            });
          } else {
            await new Promise<void>((resolve) => {
              if ((window as unknown as { SelfieSegmentation?: new (config: unknown) => SelfieSegmentationInstance }).SelfieSegmentation) {
                resolve();
              } else {
                existingScript.addEventListener("load", () => resolve());
                setTimeout(resolve, 1000);
              }
            });
          }
        }

        this.scriptLoaded = true;
        return true;
      } catch {
        this.scriptLoaded = false;
        return false;
      }
    })();

    return this.scriptPromise;
  }

  private async getOrCreateProcessor(streamId: string = "default"): Promise<StreamProcessor | null> {
    if (this.processors.has(streamId)) {
      return this.processors.get(streamId)!;
    }

    const loaded = await this.init();
    if (!loaded) return null;

    try {
      const SelfieSegClass = (window as unknown as { SelfieSegmentation: new (config: { locateFile: (file: string) => string }) => SelfieSegmentationInstance }).SelfieSegmentation;
      if (!SelfieSegClass) return null;

      const instance = new SelfieSegClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      instance.setOptions({
        modelSelection: 1,
      });

      const processor: StreamProcessor = {
        instance,
        isProcessing: false,
        pendingCallback: null,
      };

      instance.onResults((results) => {
        processor.isProcessing = false;
        if (processor.pendingCallback) {
          const cb = processor.pendingCallback;
          processor.pendingCallback = null;
          cb(results);
        }
      });

      this.processors.set(streamId, processor);
      return processor;
    } catch {
      return null;
    }
  }

  async getBackgroundImage(url?: string): Promise<HTMLImageElement | null> {
    if (!url) return null;
    if (this.bgImageCache.has(url)) return this.bgImageCache.get(url)!;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.bgImageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private getOffscreenCanvases(width: number, height: number) {
    if (!this.offscreenMaskCanvas) {
      this.offscreenMaskCanvas = document.createElement("canvas");
    }
    if (!this.offscreenPersonCanvas) {
      this.offscreenPersonCanvas = document.createElement("canvas");
    }
    if (this.offscreenMaskCanvas.width !== width || this.offscreenMaskCanvas.height !== height) {
      this.offscreenMaskCanvas.width = width;
      this.offscreenMaskCanvas.height = height;
    }
    if (this.offscreenPersonCanvas.width !== width || this.offscreenPersonCanvas.height !== height) {
      this.offscreenPersonCanvas.width = width;
      this.offscreenPersonCanvas.height = height;
    }
    return {
      maskCanvas: this.offscreenMaskCanvas,
      personCanvas: this.offscreenPersonCanvas,
    };
  }

  async removeBackgroundFromImage(sourceImageOrUrl: string | HTMLImageElement): Promise<string> {
    const img = typeof sourceImageOrUrl === "string"
      ? await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = "anonymous";
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = sourceImageOrUrl;
        })
      : sourceImageOrUrl;

    const width = img.naturalWidth || img.width || 800;
    const height = img.naturalHeight || img.height || 600;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return typeof sourceImageOrUrl === "string" ? sourceImageOrUrl : img.src;

    const processor = await this.getOrCreateProcessor("static_image");

    if (processor) {
      let waitAttempts = 0;
      while (processor.isProcessing && waitAttempts < 25) {
        await new Promise((r) => setTimeout(r, 40));
        waitAttempts++;
      }

      try {
        const transparentDataUrl = await new Promise<string>((resolve) => {
          const timer = setTimeout(() => {
            processor.isProcessing = false;
            processor.pendingCallback = null;
            this.cvAutoSegmentPerson(img, canvas, ctx);
            resolve(canvas.toDataURL("image/png"));
          }, 4000);

          processor.pendingCallback = (results: SegmentationResults) => {
            clearTimeout(timer);
            ctx.clearRect(0, 0, width, height);

            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = width;
            maskCanvas.height = height;
            const mCtx = maskCanvas.getContext("2d", { willReadFrequently: true });

            if (mCtx) {
              mCtx.drawImage(results.segmentationMask, 0, 0, width, height);
              const maskImgData = mCtx.getImageData(0, 0, width, height);
              const d = maskImgData.data;

              for (let i = 0; i < d.length; i += 4) {
                const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
                if (lum <= 18) {
                  d[i + 3] = 0;
                } else if (lum >= 90) {
                  d[i + 3] = 255;
                } else {
                  const factor = (lum - 18) / 72;
                  d[i + 3] = Math.round(255 * (factor * factor * (3 - 2 * factor)));
                }
              }

              mCtx.putImageData(maskImgData, 0, 0);
              mCtx.globalCompositeOperation = "source-in";
              mCtx.drawImage(img, 0, 0, width, height);
              ctx.drawImage(maskCanvas, 0, 0, width, height);
            } else {
              ctx.drawImage(img, 0, 0, width, height);
            }

            resolve(canvas.toDataURL("image/png"));
          };

          processor.isProcessing = true;
          processor.instance.send({ image: img }).catch(() => {
            clearTimeout(timer);
            processor.isProcessing = false;
            processor.pendingCallback = null;
            this.cvAutoSegmentPerson(img, canvas, ctx);
            resolve(canvas.toDataURL("image/png"));
          });
        });

        return transparentDataUrl;
      } catch {
        this.cvAutoSegmentPerson(img, canvas, ctx);
        return canvas.toDataURL("image/png");
      }
    }

    this.cvAutoSegmentPerson(img, canvas, ctx);
    return canvas.toDataURL("image/png");
  }

  private cvAutoSegmentPerson(
    img: HTMLImageElement | HTMLVideoElement,
    targetCanvas: HTMLCanvasElement,
    targetCtx: CanvasRenderingContext2D
  ) {
    const width = targetCanvas.width;
    const height = targetCanvas.height;

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = width;
    srcCanvas.height = height;
    const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
    if (!srcCtx) {
      targetCtx.drawImage(img, 0, 0, width, height);
      return;
    }

    srcCtx.drawImage(img, 0, 0, width, height);
    const srcData = srcCtx.getImageData(0, 0, width, height);
    const pixels = srcData.data;

    let bgR = 0, bgG = 0, bgB = 0;
    let bgSamples = 0;
    const cornerSize = Math.max(10, Math.floor(Math.min(width, height) * 0.12));

    for (let y = 0; y < cornerSize; y++) {
      for (let x = 0; x < cornerSize; x++) {
        const i1 = (y * width + x) * 4;
        const i2 = (y * width + (width - 1 - x)) * 4;
        const i3 = ((height - 1 - y) * width + x) * 4;
        const i4 = ((height - 1 - y) * width + (width - 1 - x)) * 4;

        bgR += pixels[i1] + pixels[i2] + pixels[i3] + pixels[i4];
        bgG += pixels[i1 + 1] + pixels[i2 + 1] + pixels[i3 + 1] + pixels[i4 + 1];
        bgB += pixels[i1 + 2] + pixels[i2 + 2] + pixels[i3 + 2] + pixels[i4 + 2];
        bgSamples += 4;
      }
    }

    bgR /= bgSamples;
    bgG /= bgSamples;
    bgB /= bgSamples;

    const centerX = width / 2;
    const centerY = height * 0.52;
    const radiusX = width * 0.44;
    const radiusY = height * 0.48;

    const mask = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      const dy = (y - centerY) / radiusY;
      for (let x = 0; x < width; x++) {
        const dx = (x - centerX) / radiusX;
        const distSq = dx * dx + dy * dy;
        const idx = (y * width + x) * 4;

        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        const isSkin =
          r > 60 && g > 40 && b > 20 &&
          r > g && r > b &&
          (r - g) >= 10 &&
          Math.abs(r - g) > 8 &&
          r - b > 12;

        const dr = r - bgR;
        const dg = g - bgG;
        const db = b - bgB;
        const colorDiff = Math.sqrt(dr * dr + dg * dg + db * db);

        let confidence = 0;

        if (distSq < 0.7) {
          confidence = isSkin ? 255 : colorDiff > 28 ? 240 : 180;
        } else if (distSq < 1.05) {
          const edgeFalloff = (1.05 - distSq) / 0.35;
          if (isSkin || colorDiff > 42) {
            confidence = Math.round(220 * edgeFalloff);
          } else if (colorDiff > 25) {
            confidence = Math.round(150 * edgeFalloff);
          }
        } else if (distSq < 1.25 && y > height * 0.6) {
          if (colorDiff > 35) {
            confidence = Math.round(180 * ((1.25 - distSq) / 0.2));
          }
        }

        mask[y * width + x] = Math.min(255, Math.max(0, confidence));
      }
    }

    const smoothedMask = new Uint8Array(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p =
          mask[(y - 1) * width + (x - 1)] +
          mask[(y - 1) * width + x] * 2 +
          mask[(y - 1) * width + (x + 1)] +
          mask[y * width + (x - 1)] * 2 +
          mask[y * width + x] * 4 +
          mask[y * width + (x + 1)] * 2 +
          mask[(y + 1) * width + (x - 1)] +
          mask[(y + 1) * width + x] * 2 +
          mask[(y + 1) * width + (x + 1)];

        smoothedMask[y * width + x] = Math.round(p / 16);
      }
    }

    targetCtx.clearRect(0, 0, width, height);
    const outData = targetCtx.createImageData(width, height);
    const outPixels = outData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const pixIdx = i / 4;
      const alphaVal = smoothedMask[pixIdx];

      outPixels[i] = pixels[i];
      outPixels[i + 1] = pixels[i + 1];
      outPixels[i + 2] = pixels[i + 2];
      outPixels[i + 3] = alphaVal > 25 ? alphaVal : 0;
    }

    targetCtx.putImageData(outData, 0, 0);
  }

  async renderSegmentedFrame(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    bgPreset: VirtualBackgroundPreset,
    isMirrored: boolean = false,
    streamId: string = "default"
  ): Promise<void> {
    const ctx = canvas.getContext("2d");
    if (!ctx || !video || video.videoWidth === 0 || video.videoHeight === 0) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const width = canvas.width;
    const height = canvas.height;

    if (bgPreset.type === "none") {
      ctx.save();
      if (isMirrored) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
      return;
    }

    const processor = await this.getOrCreateProcessor(streamId);

    if (!processor) {
      await this.renderBackdropLayer(ctx, width, height, bgPreset, video, isMirrored);
      const { personCanvas } = this.getOffscreenCanvases(width, height);
      const pCtx = personCanvas.getContext("2d");
      if (pCtx) {
        this.cvAutoSegmentPerson(video, personCanvas, pCtx);
        ctx.save();
        if (isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(personCanvas, 0, 0, width, height);
        ctx.restore();
      }
      return;
    }

    if (processor.isProcessing) {
      return;
    }

    processor.isProcessing = true;

    processor.pendingCallback = async (results: SegmentationResults) => {
      await this.renderBackdropLayer(ctx, width, height, bgPreset, video, isMirrored);

      const { maskCanvas, personCanvas } = this.getOffscreenCanvases(width, height);
      const mCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      const pCtx = personCanvas.getContext("2d");

      if (mCtx && pCtx) {
        mCtx.clearRect(0, 0, width, height);
        mCtx.drawImage(results.segmentationMask, 0, 0, width, height);

        const maskImgData = mCtx.getImageData(0, 0, width, height);
        const d = maskImgData.data;

        for (let i = 0; i < d.length; i += 4) {
          const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (lum <= 18) {
            d[i + 3] = 0;
          } else if (lum >= 85) {
            d[i + 3] = 255;
          } else {
            const t = (lum - 18) / 67;
            d[i + 3] = Math.round(255 * (t * t * (3 - 2 * t)));
          }
        }
        mCtx.putImageData(maskImgData, 0, 0);

        pCtx.clearRect(0, 0, width, height);
        pCtx.drawImage(maskCanvas, 0, 0, width, height);
        pCtx.globalCompositeOperation = "source-in";
        pCtx.drawImage(video, 0, 0, width, height);
        pCtx.globalCompositeOperation = "source-over";

        ctx.save();
        if (isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(personCanvas, 0, 0, width, height);
        ctx.restore();
      }
    };

    processor.instance.send({ image: video }).catch(() => {
      processor.isProcessing = false;
      processor.pendingCallback = null;
    });
  }

  private async renderBackdropLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bgPreset: VirtualBackgroundPreset,
    video: HTMLVideoElement,
    isMirrored: boolean
  ) {
    ctx.clearRect(0, 0, width, height);

    if (bgPreset.type === "blur") {
      ctx.save();
      ctx.filter = "blur(20px) brightness(0.85)";
      if (isMirrored) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    } else if ((bgPreset.type === "image" || bgPreset.type === "custom") && bgPreset.imageUrl) {
      const bgImg = await this.getBackgroundImage(bgPreset.imageUrl);
      if (bgImg) {
        const imgAspect = bgImg.width / (bgImg.height || 1);
        const canvasAspect = width / (height || 1);
        let drawW = width;
        let drawH = height;
        let drawX = 0;
        let drawY = 0;

        if (imgAspect > canvasAspect) {
          drawW = height * imgAspect;
          drawX = (width - drawW) / 2;
        } else {
          drawH = width / imgAspect;
          drawY = (height - drawH) / 2;
        }

        ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
      } else {
        ctx.fillStyle = bgPreset.color || "#18181b";
        ctx.fillRect(0, 0, width, height);
      }
    } else if (bgPreset.color) {
      ctx.fillStyle = bgPreset.color;
      ctx.fillRect(0, 0, width, height);
    } else if (bgPreset.type === "gradient" && bgPreset.gradient) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (bgPreset.id === "pastel-blush") {
        grad.addColorStop(0, "#fdf2f8");
        grad.addColorStop(0.5, "#fce7f3");
        grad.addColorStop(1, "#fed7aa");
      } else if (bgPreset.id === "beige-arch") {
        grad.addColorStop(0, "#fef3c7");
        grad.addColorStop(0.5, "#fde68a");
        grad.addColorStop(1, "#d97706");
      } else if (bgPreset.id === "studio-white") {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, "#e4e4e7");
      } else if (bgPreset.id === "studio-black") {
        grad.addColorStop(0, "#18181b");
        grad.addColorStop(1, "#09090b");
      } else if (bgPreset.id === "retro-rainbow") {
        grad.addColorStop(0, "#ff4b72");
        grad.addColorStop(0.2, "#ffa14a");
        grad.addColorStop(0.4, "#ffd54a");
        grad.addColorStop(0.6, "#38ef7d");
        grad.addColorStop(0.8, "#11998e");
        grad.addColorStop(1, "#667eea");
      } else if (bgPreset.id === "sunset-vibes") {
        grad.addColorStop(0, "#fa709a");
        grad.addColorStop(1, "#fee140");
      } else {
        grad.addColorStop(0, "#311042");
        grad.addColorStop(0.7, "#0f172a");
        grad.addColorStop(1, "#020617");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

export const segmentationEngine = new SegmentationEngine();
