import { PhotoStripProject, ShotTransform } from "@/types/photobooth";
import { getFrameOption } from "./frames";
import { getFilterPreset } from "./filters";

function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  transform?: ShotTransform
) {
  const zoom = transform?.zoom || 1;
  const panX = transform?.panX || 0;
  const panY = transform?.panY || 0;
  const rotation = transform?.rotation || 0;
  const flipX = transform?.flipX ? -1 : 1;
  const flipY = transform?.flipY ? -1 : 1;

  ctx.save();
  ctx.translate(x + width / 2 + panX, y + height / 2 + panY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(zoom * flipX, zoom * flipY);

  const imgAspect = img.width / (img.height || 1);
  const targetAspect = width / (height || 1);
  let drawW = width;
  let drawH = height;

  if (imgAspect > targetAspect) {
    drawH = height;
    drawW = height * imgAspect;
  } else {
    drawW = width;
    drawH = width / imgAspect;
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

export async function renderPhotoStripToCanvas(
  project: PhotoStripProject,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context");

  const isVerticalStrip = project.layout === "strip-3" || project.layout === "strip-4";
  const isGrid = project.layout === "grid-4";
  const isCoupleSplit = project.layout === "couple-split";

  let baseWidth = 400;
  let baseHeight = 1200;

  if (project.layout === "strip-3") {
    baseWidth = 400;
    baseHeight = 1050;
  } else if (project.layout === "strip-4") {
    baseWidth = 400;
    baseHeight = 1350;
  } else if (isGrid) {
    baseWidth = 800;
    baseHeight = 960;
  } else if (isCoupleSplit) {
    baseWidth = 720;
    baseHeight = 900;
  } else {
    baseWidth = 500;
    baseHeight = 650;
  }

  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;

  ctx.scale(scale, scale);

  const frame = getFrameOption(project.frameStyle);

  const loadImg = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  if (
    project.backgroundColor.startsWith("data:image") ||
    project.backgroundColor.startsWith("http")
  ) {
    try {
      const bgImage = await loadImg(project.backgroundColor);
      const imgAspect = bgImage.width / (bgImage.height || 1);
      const canvasAspect = baseWidth / (baseHeight || 1);
      let drawW = baseWidth;
      let drawH = baseHeight;
      let drawX = 0;
      let drawY = 0;

      if (imgAspect > canvasAspect) {
        drawW = baseHeight * imgAspect;
        drawX = (baseWidth - drawW) / 2;
      } else {
        drawH = baseWidth / imgAspect;
        drawY = (baseHeight - drawH) / 2;
      }

      ctx.drawImage(bgImage, drawX, drawY, drawW, drawH);
    } catch {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, baseWidth, baseHeight);
    }
  } else if (project.backgroundColor.includes("gradient")) {
    const bgGrad = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
    if (project.backgroundColor.includes("#ff4b72")) {
      bgGrad.addColorStop(0, "#ff4b72");
      bgGrad.addColorStop(0.25, "#ffa14a");
      bgGrad.addColorStop(0.5, "#ffd54a");
      bgGrad.addColorStop(0.75, "#38ef7d");
      bgGrad.addColorStop(1, "#11998e");
    } else if (project.backgroundColor.includes("#fa709a")) {
      bgGrad.addColorStop(0, "#fa709a");
      bgGrad.addColorStop(1, "#fee140");
    } else if (project.backgroundColor.includes("#fdf2f8")) {
      bgGrad.addColorStop(0, "#fdf2f8");
      bgGrad.addColorStop(0.5, "#fce7f3");
      bgGrad.addColorStop(1, "#fed7aa");
    } else if (project.backgroundColor.includes("#fef3c7")) {
      bgGrad.addColorStop(0, "#fef3c7");
      bgGrad.addColorStop(0.5, "#fed7aa");
      bgGrad.addColorStop(1, "#fbcfe8");
    } else {
      bgGrad.addColorStop(0, "#1e1b4b");
      bgGrad.addColorStop(0.5, "#0f172a");
      bgGrad.addColorStop(1, "#311042");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, baseWidth, baseHeight);
  } else if (
    project.backgroundColor.startsWith("#") ||
    project.backgroundColor.startsWith("rgb")
  ) {
    ctx.fillStyle = project.backgroundColor;
    ctx.fillRect(0, 0, baseWidth, baseHeight);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, baseHeight);
    if (project.frameStyle === "luxury-black") {
      bgGrad.addColorStop(0, "#18181b");
      bgGrad.addColorStop(1, "#09090b");
    } else if (project.frameStyle === "pastel-pink") {
      bgGrad.addColorStop(0, "#fdf2f8");
      bgGrad.addColorStop(1, "#fce7f3");
    } else if (project.frameStyle === "pastel-blue") {
      bgGrad.addColorStop(0, "#f0f9ff");
      bgGrad.addColorStop(1, "#e0f2fe");
    } else if (project.frameStyle === "cyber-chrome") {
      bgGrad.addColorStop(0, "#1e1b4b");
      bgGrad.addColorStop(0.5, "#0f172a");
      bgGrad.addColorStop(1, "#311042");
    } else if (project.frameStyle === "vintage-paper") {
      bgGrad.addColorStop(0, "#fef3c7");
      bgGrad.addColorStop(1, "#fde68a");
    } else if (project.frameStyle === "heart-romance") {
      bgGrad.addColorStop(0, "#fff1f2");
      bgGrad.addColorStop(1, "#ffe4e6");
    } else if (project.frameStyle === "y2k-grid") {
      bgGrad.addColorStop(0, "#1e1b4b");
      bgGrad.addColorStop(1, "#030712");
    } else {
      bgGrad.addColorStop(0, "#ffffff");
      bgGrad.addColorStop(1, "#fafafa");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, baseWidth, baseHeight);
  }

  const marginX = 24;
  const marginTop = 28;
  const gap = 16;
  const bottomFooterHeight = 80;

  const filterPreset = getFilterPreset(project.filter);

  const drawFrameBackdrop = async (x: number, y: number, w: number, h: number) => {
    const backdrop =
      project.photoBackdrop ||
      (project.backgroundColor !== "transparent" ? project.backgroundColor : "");

    if (backdrop.startsWith("http") || backdrop.startsWith("data:image")) {
      try {
        const bgImg = await loadImg(backdrop);
        ctx.drawImage(bgImg, x, y, w, h);
        return;
      } catch {}
    }

    if (backdrop.includes("gradient")) {
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, "#fa709a");
      grad.addColorStop(1, "#fee140");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
      return;
    }

    if (backdrop && backdrop.startsWith("#")) {
      ctx.fillStyle = backdrop;
      ctx.fillRect(x, y, w, h);
      return;
    }

    ctx.fillStyle = "#18181b";
    ctx.fillRect(x, y, w, h);
  };

  if (isVerticalStrip) {
    const photoCount = project.layout === "strip-3" ? 3 : 4;
    const photoWidth = baseWidth - marginX * 2;
    const availableHeight = baseHeight - marginTop - bottomFooterHeight - gap * (photoCount - 1);
    const photoHeight = availableHeight / photoCount;

    for (let i = 0; i < photoCount; i++) {
      const shot = project.shots[i % Math.max(1, project.shots.length)];
      const yPos = marginTop + i * (photoHeight + gap);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(marginX, yPos, photoWidth, photoHeight, 8);
      ctx.clip();

      if (shot) {
        if (shot.isBackgroundRemoved && shot.personOnlyDataUrl) {
          try {
            await drawFrameBackdrop(marginX, yPos, photoWidth, photoHeight);
            const personImg = await loadImg(shot.personOnlyDataUrl);
            ctx.filter = filterPreset.cssFilter;
            drawTransformedImage(ctx, personImg, marginX, yPos, photoWidth, photoHeight, shot.transform);
            ctx.filter = "none";
          } catch {
            ctx.fillStyle = "#27272a";
            ctx.fillRect(marginX, yPos, photoWidth, photoHeight);
          }
        } else if (shot.compositeDataUrl) {
          try {
            const img = await loadImg(shot.compositeDataUrl);
            ctx.filter = filterPreset.cssFilter;
            drawTransformedImage(ctx, img, marginX, yPos, photoWidth, photoHeight, shot.transform);
            ctx.filter = "none";
          } catch {
            ctx.fillStyle = "#27272a";
            ctx.fillRect(marginX, yPos, photoWidth, photoHeight);
          }
        } else {
          ctx.fillStyle = "#27272a";
          ctx.fillRect(marginX, yPos, photoWidth, photoHeight);
        }
      } else {
        ctx.fillStyle = "#27272a";
        ctx.fillRect(marginX, yPos, photoWidth, photoHeight);
      }

      ctx.restore();

      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(marginX, yPos, photoWidth, photoHeight, 8);
      ctx.stroke();
    }
  } else if (isGrid) {
    const gridCols = 2;
    const gridRows = 2;
    const photoWidth = (baseWidth - marginX * 2 - gap) / gridCols;
    const photoHeight = (baseHeight - marginTop - bottomFooterHeight - gap) / gridRows;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const xPos = marginX + col * (photoWidth + gap);
      const yPos = marginTop + row * (photoHeight + gap);

      const shot = project.shots[i % Math.max(1, project.shots.length)];

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(xPos, yPos, photoWidth, photoHeight, 8);
      ctx.clip();

      if (shot) {
        if (shot.isBackgroundRemoved && shot.personOnlyDataUrl) {
          try {
            await drawFrameBackdrop(xPos, yPos, photoWidth, photoHeight);
            const personImg = await loadImg(shot.personOnlyDataUrl);
            ctx.filter = filterPreset.cssFilter;
            drawTransformedImage(ctx, personImg, xPos, yPos, photoWidth, photoHeight, shot.transform);
            ctx.filter = "none";
          } catch {
            ctx.fillStyle = "#27272a";
            ctx.fillRect(xPos, yPos, photoWidth, photoHeight);
          }
        } else if (shot.compositeDataUrl) {
          try {
            const img = await loadImg(shot.compositeDataUrl);
            ctx.filter = filterPreset.cssFilter;
            drawTransformedImage(ctx, img, xPos, yPos, photoWidth, photoHeight, shot.transform);
            ctx.filter = "none";
          } catch {
            ctx.fillStyle = "#27272a";
            ctx.fillRect(xPos, yPos, photoWidth, photoHeight);
          }
        } else {
          ctx.fillStyle = "#27272a";
          ctx.fillRect(xPos, yPos, photoWidth, photoHeight);
        }
      } else {
        ctx.fillStyle = "#27272a";
        ctx.fillRect(xPos, yPos, photoWidth, photoHeight);
      }

      ctx.restore();

      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(xPos, yPos, photoWidth, photoHeight, 8);
      ctx.stroke();
    }
  } else if (isCoupleSplit) {
    const photoWidth = (baseWidth - marginX * 2 - gap) / 2;
    const photoHeight = baseHeight - marginTop - bottomFooterHeight;

    for (let i = 0; i < 2; i++) {
      const xPos = marginX + i * (photoWidth + gap);
      const yPos = marginTop;
      const shot = project.shots[0];
      const participantFrame = shot?.individualFrames?.[i];

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(xPos, yPos, photoWidth, photoHeight, 12);
      ctx.clip();

      const isBgRemoved = Boolean(shot?.isBackgroundRemoved && shot?.personOnlyDataUrl);
      const src = isBgRemoved
        ? shot.personOnlyDataUrl
        : participantFrame?.dataUrl || shot?.compositeDataUrl;

      if (src) {
        try {
          if (isBgRemoved) {
            await drawFrameBackdrop(xPos, yPos, photoWidth, photoHeight);
          }
          const img = await loadImg(src);
          ctx.filter = filterPreset.cssFilter;
          drawTransformedImage(ctx, img, xPos, yPos, photoWidth, photoHeight, shot?.transform);
          ctx.filter = "none";
        } catch {
          ctx.fillStyle = "#27272a";
          ctx.fillRect(xPos, yPos, photoWidth, photoHeight);
        }
      }

      ctx.restore();

      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(xPos, yPos, photoWidth, photoHeight, 12);
      ctx.stroke();
    }
  } else {
    const photoWidth = baseWidth - marginX * 2;
    const photoHeight = baseHeight - marginTop - bottomFooterHeight;
    const shot = project.shots[0];

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(marginX, marginTop, photoWidth, photoHeight, 12);
    ctx.clip();

    const isBgRemoved = Boolean(shot?.isBackgroundRemoved && shot?.personOnlyDataUrl);
    const src = isBgRemoved
      ? shot.personOnlyDataUrl
      : shot?.compositeDataUrl;

    if (src) {
      try {
        if (isBgRemoved) {
          await drawFrameBackdrop(marginX, marginTop, photoWidth, photoHeight);
        }
        const img = await loadImg(src);
        ctx.filter = filterPreset.cssFilter;
        drawTransformedImage(ctx, img, marginX, marginTop, photoWidth, photoHeight, shot?.transform);
        ctx.filter = "none";
      } catch {
        ctx.fillStyle = "#27272a";
        ctx.fillRect(marginX, marginTop, photoWidth, photoHeight);
      }
    }

    ctx.restore();
    ctx.strokeStyle = frame.borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(marginX, marginTop, photoWidth, photoHeight, 12);
    ctx.stroke();
  }

  const footerY = baseHeight - 48;
  ctx.fillStyle = frame.textColor;
  ctx.textAlign = "center";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";

  const brandTitle = project.customStampText || "TOGETHER BOOTH";
  ctx.fillText(brandTitle, baseWidth / 2, footerY);

  if (project.showDateStamp) {
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = frame.stampColor;
    const dateFormatted = new Date(project.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    ctx.fillText(`• ${dateFormatted} •`, baseWidth / 2, footerY + 20);
  }

  for (const sticker of project.stickers) {
    ctx.save();
    const x = (sticker.x / 100) * baseWidth;
    const y = (sticker.y / 100) * baseHeight;
    ctx.translate(x, y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.scale(sticker.scale, sticker.scale);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "38px system-ui, Apple Color Emoji, Segoe UI Emoji";
    ctx.fillText(sticker.content, 0, 0);
    ctx.restore();
  }

  for (const textItem of project.texts) {
    ctx.save();
    const x = (textItem.x / 100) * baseWidth;
    const y = (textItem.y / 100) * baseHeight;
    ctx.translate(x, y);
    ctx.rotate((textItem.rotation * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${textItem.fontSize}px ${textItem.fontFamily}`;
    ctx.fillStyle = textItem.color;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(textItem.text, 0, 0);
    ctx.restore();
  }

  return canvas;
}
