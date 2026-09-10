"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { PhotoStripProject, ExportFormat } from "@/types/photobooth";
import { renderPhotoStripToCanvas } from "@/lib/canvas-renderer";
import { downloadPhotoStripPdf } from "@/lib/pdf-generator";
import { storageService } from "@/services/storageService";
import { memoryService } from "@/services/memoryService";
import { useAuth } from "@/hooks/useAuth";
import { generateId } from "@/lib/utils";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Share2,
  Check,
  Cloud,
  Copy,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PhotoStripProject;
}

export function ExportModal({ isOpen, onClose, project }: ExportModalProps) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [savedMemoryId, setSavedMemoryId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleDownloadImage = async (format: "png" | "jpg") => {
    setIsExporting(true);
    setExportType(format);
    try {
      const canvas = await renderPhotoStripToCanvas(project, 3);
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mime, 0.95);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `together-booth-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      triggerCelebration();
    } catch {
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    setExportType("copy");
    try {
      const canvas = await renderPhotoStripToCanvas(project, 2);
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setIsCopied(true);
          triggerCelebration();
          setTimeout(() => setIsCopied(false), 3000);
        }
      }, "image/png");
    } catch {
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportType("pdf");
    try {
      await downloadPhotoStripPdf(project, `together-strip-${Date.now()}.pdf`);
      triggerCelebration();
    } catch {
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleSaveToMemories = async () => {
    setIsExporting(true);
    setExportType("cloud");
    try {
      const canvas = await renderPhotoStripToCanvas(project, 2);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      const memoryId = generateId("mem");
      const storagePath = `memories/${user?.uid || "guest"}/${memoryId}.jpg`;
      const uploadedUrl = await storageService.uploadDataUrl(storagePath, dataUrl);

      await memoryService.saveMemory({
        id: memoryId,
        userId: user?.uid || "guest",
        userName: user?.displayName || "Guest Creator",
        userPhoto: user?.photoURL,
        roomId: project.roomId,
        roomName: project.roomName,
        imageUrl: uploadedUrl,
        layout: project.layout,
        filter: project.filter,
        frameStyle: project.frameStyle,
        participants: [user?.displayName || "Me"],
        createdAt: Date.now(),
        isPrivate: false,
        likesCount: 1,
      });

      setSavedMemoryId(memoryId);
      triggerCelebration();
    } catch {
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Save Your Memories"
      description="Download high-resolution photostrips, copy to clipboard, or generate printable 2x6″ photo cuts."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="glass"
            size="lg"
            onClick={() => handleDownloadImage("png")}
            disabled={isExporting}
            isLoading={isExporting && exportType === "png"}
            className="flex items-center justify-center gap-2.5 p-5 h-auto flex-col text-center"
          >
            <ImageIcon className="w-6 h-6 text-pink-400" />
            <div>
              <span className="font-bold text-sm block text-white">Download PNG</span>
              <span className="text-[11px] text-zinc-400 font-normal">Lossless high-DPI image</span>
            </div>
          </Button>

          <Button
            variant="glass"
            size="lg"
            onClick={() => handleDownloadImage("jpg")}
            disabled={isExporting}
            isLoading={isExporting && exportType === "jpg"}
            className="flex items-center justify-center gap-2.5 p-5 h-auto flex-col text-center"
          >
            <Download className="w-6 h-6 text-amber-400" />
            <div>
              <span className="font-bold text-sm block text-white">Download JPG</span>
              <span className="text-[11px] text-zinc-400 font-normal">Compact sharing file</span>
            </div>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="glass"
            size="md"
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            isLoading={isExporting && exportType === "copy"}
            className="flex items-center justify-center gap-2 p-3.5"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Copy Image to Clipboard</span>
              </>
            )}
          </Button>

          <Button
            variant="glass"
            size="md"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            isLoading={isExporting && exportType === "pdf"}
            className="flex items-center justify-center gap-2 p-3.5"
          >
            <FileText className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-bold text-white">Printable 2×6″ PDF</span>
          </Button>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleSaveToMemories}
          disabled={isExporting || Boolean(savedMemoryId)}
          isLoading={isExporting && exportType === "cloud"}
          className="w-full flex items-center justify-center gap-2.5 py-4"
        >
          {savedMemoryId ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>Saved to Memories Vault!</span>
            </>
          ) : (
            <>
              <Cloud className="w-5 h-5" />
              <span>Save to Memories Vault & Cloud</span>
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
