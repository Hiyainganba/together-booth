"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Copy, Check, Share2, Sparkles, Ticket } from "lucide-react";

interface RoomShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  roomName: string;
}

export function RoomShareModal({
  isOpen,
  onClose,
  roomCode,
  roomName,
}: RoomShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    if (shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: "#11100f",
          light: "#faf6f0",
        },
      })
        .then((url) => setQrUrl(url))
        .catch(() => {});
    }
  }, [shareUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${roomName} on Together Booth`,
          text: `Hop in our virtual photobooth room! Use code ${roomCode} or click the link:`,
          url: shareUrl,
        });
      } catch {}
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Your Partner or Squad"
      description="Share this link or 6-digit room code with friends across the world."
      maxWidth="md"
    >
      <div className="space-y-6 text-center">
        {qrUrl && (
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-[#FAF6F0] rounded-3xl shadow-xl border border-zinc-200 inline-block">
              <img src={qrUrl} alt="Room QR Code" className="w-44 h-44 rounded-2xl" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-hand text-sm">Scan with mobile phone camera to join</p>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-[#1A1816] border border-white/10 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">6-Digit Room Code</span>
            <span className="text-xl font-mono font-black text-amber-300 tracking-wider">{roomCode}</span>
          </div>
          <Button variant="glass" size="sm" onClick={handleCopyCode}>
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? "Copied" : "Copy Code"}</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Full Invite Link"}</span>
          </Button>

          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <Button
              variant="primary"
              size="md"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
