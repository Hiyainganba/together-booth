"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/store/useEditorStore";
import { PhotoStripEditor } from "@/components/editor/PhotoStripEditor";
import { PhotoStripProject } from "@/types/photobooth";

export default function EditorPage() {
  const urlParams = useParams();
  const rawId = urlParams?.id;
  const projectId = Array.isArray(rawId) ? rawId[0] : rawId || "demo";
  const { project } = useEditorStore();

  const fallbackProject: PhotoStripProject = project || {
    id: projectId,
    createdAt: Date.now(),
    shots: [
      {
        shotIndex: 1,
        timestamp: Date.now(),
        compositeDataUrl:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
        individualFrames: [],
      },
      {
        shotIndex: 2,
        timestamp: Date.now(),
        compositeDataUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
        individualFrames: [],
      },
      {
        shotIndex: 3,
        timestamp: Date.now(),
        compositeDataUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        individualFrames: [],
      },
    ],
    layout: "strip-3",
    filter: "vintage",
    frameStyle: "classic-white",
    backgroundColor: "transparent",
    stickers: [
      {
        id: "stk_demo_1",
        content: "💖",
        category: "heart",
        x: 82,
        y: 28,
        scale: 1.1,
        rotation: 12,
        zIndex: 10,
      },
      {
        id: "stk_demo_2",
        content: "✨",
        category: "emoji",
        x: 14,
        y: 60,
        scale: 1,
        rotation: -8,
        zIndex: 11,
      },
    ],
    texts: [],
    showDateStamp: true,
    showRoomStamp: true,
    customStampText: "TOGETHER BOOTH",
  };

  return <PhotoStripEditor initialProject={project || fallbackProject} />;
}
