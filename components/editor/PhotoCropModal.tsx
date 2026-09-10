"use client";

import React, { useState } from "react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { CapturedShot, ShotTransform } from "@/types/photobooth";
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  shots: CapturedShot[];
  onUpdateShotTransform: (shotIndex: number, transform: ShotTransform, applyToAll?: boolean) => void;
}

export function PhotoCropModal({
  isOpen,
  onClose,
  shots,
  onUpdateShotTransform,
}: PhotoCropModalProps) {
  const [selectedShotIndex, setSelectedShotIndex] = useState<number>(1);
  const [applyToAll, setApplyToAll] = useState(false);

  const currentShot = shots.find((s) => s.shotIndex === selectedShotIndex) || shots[0];

  const defaultTransform: ShotTransform = {
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    flipX: false,
    flipY: false,
  };

  const [transform, setTransform] = useState<ShotTransform>(
    currentShot?.transform || defaultTransform
  );

  React.useEffect(() => {
    if (currentShot) {
      setTransform(currentShot.transform || defaultTransform);
    }
  }, [selectedShotIndex, currentShot]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransform((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }));
  };

  const handlePanXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransform((prev) => ({ ...prev, panX: parseFloat(e.target.value) }));
  };

  const handlePanYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransform((prev) => ({ ...prev, panY: parseFloat(e.target.value) }));
  };

  const handleRotate = () => {
    setTransform((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const handleFlip = () => {
    setTransform((prev) => ({ ...prev, flipX: !prev.flipX }));
  };

  const handleReset = () => {
    setTransform(defaultTransform);
  };

  const handleSave = () => {
    onUpdateShotTransform(selectedShotIndex, transform, applyToAll);
    onClose();
  };

  if (!currentShot) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crop, Zoom & Align Photo"
      description="Adjust the position, zoom scale, and orientation for your photobooth frames."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {shots.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold uppercase text-zinc-400 mr-1">Select Frame:</span>
            {shots.map((s) => (
              <button
                key={s.shotIndex}
                type="button"
                onClick={() => {
                  onUpdateShotTransform(selectedShotIndex, transform, false);
                  setSelectedShotIndex(s.shotIndex);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  selectedShotIndex === s.shotIndex
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/25"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                )}
              >
                Shot #{s.shotIndex}
              </button>
            ))}
          </div>
        )}

        <div className="relative aspect-[4/3] max-h-[320px] rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl flex items-center justify-center mx-auto">
          <div className="absolute inset-0 border border-white/20 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 opacity-30">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          <img
            src={currentShot.compositeDataUrl}
            alt={`Shot ${selectedShotIndex}`}
            style={{
              transform: `scale(${transform.zoom}) translate(${transform.panX}px, ${transform.panY}px) rotate(${transform.rotation}deg) scaleX(${
                transform.flipX ? -1 : 1
              })`,
              transition: "transform 0.1s ease-out",
            }}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-800/40 p-4 rounded-2xl border border-white/10">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5 font-bold">
                  <ZoomIn className="w-3.5 h-3.5 text-pink-400" /> Zoom Scale
                </span>
                <span className="font-mono font-bold text-pink-300">
                  {transform.zoom.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={transform.zoom}
                onChange={handleZoomChange}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
                <span className="font-bold">Horizontal Pan (X)</span>
                <span className="font-mono text-zinc-400">{Math.round(transform.panX)}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="2"
                value={transform.panX}
                onChange={handlePanXChange}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
                <span className="font-bold">Vertical Pan (Y)</span>
                <span className="font-mono text-zinc-400">{Math.round(transform.panY)}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="2"
                value={transform.panY}
                onChange={handlePanYChange}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={handleRotate}
                className="flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4 text-amber-400" />
                <span>Rotate 90°</span>
              </Button>

              <Button
                variant="glass"
                size="sm"
                onClick={handleFlip}
                className="flex items-center justify-center gap-2"
              >
                <FlipHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Flip Mirror</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 border-zinc-700 hover:border-zinc-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Crop & Pan</span>
            </Button>

            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between">
              <span className="text-xs text-pink-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Apply crop to all frames
              </span>
              <button
                type="button"
                onClick={() => setApplyToAll(!applyToAll)}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  applyToAll ? "bg-pink-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    applyToAll ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Apply Crop</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
