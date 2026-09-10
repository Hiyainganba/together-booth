import { create } from "zustand";
import {
  PhotoStripProject,
  StripLayoutType,
  FrameStyleType,
  StickerItem,
  TextItem,
  ShotTransform,
  CapturedShot,
} from "@/types/photobooth";
import { FilterType } from "@/types/filter";
import { generateId } from "@/lib/utils";
import { segmentationEngine } from "@/lib/segmentation-engine";

interface EditorState {
  project: PhotoStripProject | null;
  activeTab: "layout" | "filter" | "frame" | "stickers" | "text" | "background" | "export";
  selectedStickerId: string | null;
  selectedTextId: string | null;
  isExporting: boolean;
  isCropModalOpen: boolean;
  activeCropShotIndex: number;
  isRemovingBackground: boolean;
  setProject: (project: PhotoStripProject | null) => void;
  setActiveTab: (tab: EditorState["activeTab"]) => void;
  setSelectedStickerId: (id: string | null) => void;
  setSelectedTextId: (id: string | null) => void;
  setIsExporting: (exporting: boolean) => void;
  setIsCropModalOpen: (open: boolean, shotIndex?: number) => void;
  setLayout: (layout: StripLayoutType) => void;
  setFilter: (filter: FilterType) => void;
  setFrameStyle: (frameStyle: FrameStyleType) => void;
  setBackgroundColor: (color: string) => void;
  setPhotoBackdrop: (backdrop: string) => void;
  setVirtualBackground: (bgId: string, customUrl?: string) => void;
  setCustomStampText: (text: string) => void;
  toggleDateStamp: () => void;
  toggleRoomStamp: () => void;
  setApplyToAllUsers: (apply: boolean) => void;
  updateShotTransform: (shotIndex: number, transform: ShotTransform, applyToAll?: boolean) => void;
  removeShotBackground: (shotIndex: number) => Promise<void>;
  toggleAllBackgroundRemoval: () => Promise<void>;
  deleteShot: (shotIndex: number) => void;
  moveShot: (fromIndex: number, toIndex: number) => void;
  replaceShotImage: (shotIndex: number, dataUrl: string) => void;
  addShot: (shot: CapturedShot) => void;
  addSticker: (content: string, category: StickerItem["category"]) => void;
  updateSticker: (id: string, updates: Partial<StickerItem>) => void;
  removeSticker: (id: string) => void;
  addText: (text: string, fontFamily?: string, color?: string) => void;
  updateText: (id: string, updates: Partial<TextItem>) => void;
  removeText: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  activeTab: "layout",
  selectedStickerId: null,
  selectedTextId: null,
  isExporting: false,
  isCropModalOpen: false,
  activeCropShotIndex: 1,
  isRemovingBackground: false,
  setProject: (project) => set({ project }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedStickerId: (selectedStickerId) => set({ selectedStickerId }),
  setSelectedTextId: (selectedTextId) => set({ selectedTextId }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setIsCropModalOpen: (isCropModalOpen, shotIndex) =>
    set({
      isCropModalOpen,
      ...(shotIndex !== undefined ? { activeCropShotIndex: shotIndex } : {}),
    }),
  setLayout: (layout) => {
    const { project } = get();
    if (project) set({ project: { ...project, layout } });
  },
  setFilter: (filter) => {
    const { project } = get();
    if (project) set({ project: { ...project, filter } });
  },
  setFrameStyle: (frameStyle) => {
    const { project } = get();
    if (project) set({ project: { ...project, frameStyle } });
  },
  setBackgroundColor: (backgroundColor) => {
    const { project } = get();
    if (!project) return;
    set({
      project: {
        ...project,
        backgroundColor,
        photoBackdrop: backgroundColor !== "transparent" ? backgroundColor : project.photoBackdrop,
      },
    });
    if (backgroundColor !== "transparent") {
      get().toggleAllBackgroundRemoval();
    }
  },
  setPhotoBackdrop: (photoBackdrop) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, photoBackdrop } });
    if (photoBackdrop && photoBackdrop !== "transparent") {
      get().toggleAllBackgroundRemoval();
    }
  },
  setVirtualBackground: (virtualBackground, customBackgroundUrl) => {
    const { project } = get();
    if (project) {
      set({
        project: {
          ...project,
          virtualBackground,
          customBackgroundUrl: customBackgroundUrl || project.customBackgroundUrl,
        },
      });
    }
  },
  setCustomStampText: (customStampText) => {
    const { project } = get();
    if (project) set({ project: { ...project, customStampText } });
  },
  toggleDateStamp: () => {
    const { project } = get();
    if (project) set({ project: { ...project, showDateStamp: !project.showDateStamp } });
  },
  toggleRoomStamp: () => {
    const { project } = get();
    if (project) set({ project: { ...project, showRoomStamp: !project.showRoomStamp } });
  },
  setApplyToAllUsers: (applyToAllUsers) => {
    const { project } = get();
    if (project) set({ project: { ...project, applyToAllUsers } });
  },
  updateShotTransform: (shotIndex, transform, applyToAll = false) => {
    const { project } = get();
    if (!project) return;
    const updatedShots = project.shots.map((s) => {
      if (applyToAll || s.shotIndex === shotIndex) {
        return { ...s, transform };
      }
      return s;
    });
    set({ project: { ...project, shots: updatedShots } });
  },
  deleteShot: (shotIndex: number) => {
    const { project } = get();
    if (!project || project.shots.length <= 1) return;
    const filtered = project.shots.filter((s) => s.shotIndex !== shotIndex);
    const reindexed = filtered.map((s, idx) => ({ ...s, shotIndex: idx + 1 }));
    let updatedLayout = project.layout;
    if (reindexed.length === 3 && project.layout === "strip-4") {
      updatedLayout = "strip-3";
    }
    set({ project: { ...project, shots: reindexed, layout: updatedLayout } });
  },
  moveShot: (fromIndex: number, toIndex: number) => {
    const { project } = get();
    if (!project) return;
    const shotsCopy = [...project.shots];
    if (fromIndex < 0 || fromIndex >= shotsCopy.length || toIndex < 0 || toIndex >= shotsCopy.length) {
      return;
    }
    const [moved] = shotsCopy.splice(fromIndex, 1);
    shotsCopy.splice(toIndex, 0, moved);
    const reindexed = shotsCopy.map((s, idx) => ({ ...s, shotIndex: idx + 1 }));
    set({ project: { ...project, shots: reindexed } });
  },
  replaceShotImage: (shotIndex: number, dataUrl: string) => {
    const { project } = get();
    if (!project) return;
    const updated = project.shots.map((s) => {
      if (s.shotIndex === shotIndex) {
        return {
          ...s,
          compositeDataUrl: dataUrl,
          originalDataUrl: dataUrl,
          personOnlyDataUrl: undefined,
          isBackgroundRemoved: false,
        };
      }
      return s;
    });
    set({ project: { ...project, shots: updated } });
  },
  addShot: (shot: CapturedShot) => {
    const { project } = get();
    if (!project) return;
    const newShots = [...project.shots, { ...shot, shotIndex: project.shots.length + 1 }];
    set({ project: { ...project, shots: newShots } });
  },
  removeShotBackground: async (shotIndex: number) => {
    const { project } = get();
    if (!project) return;
    set({ isRemovingBackground: true });
    try {
      const shot = project.shots.find((s) => s.shotIndex === shotIndex);
      if (!shot) return;

      const originalSrc = shot.originalDataUrl || shot.compositeDataUrl;
      const isCurrentlyRemoved = shot.isBackgroundRemoved;

      if (isCurrentlyRemoved) {
        const updatedShots = project.shots.map((s) =>
          s.shotIndex === shotIndex ? { ...s, isBackgroundRemoved: false } : s
        );
        set({ project: { ...project, shots: updatedShots } });
        return;
      }

      const personOnlyDataUrl =
        shot.personOnlyDataUrl || (await segmentationEngine.removeBackgroundFromImage(originalSrc));

      const updatedShots = project.shots.map((s) => {
        if (s.shotIndex === shotIndex) {
          return {
            ...s,
            originalDataUrl: originalSrc,
            personOnlyDataUrl,
            isBackgroundRemoved: true,
          };
        }
        return s;
      });
      set({ project: { ...project, shots: updatedShots } });
    } finally {
      set({ isRemovingBackground: false });
    }
  },
  toggleAllBackgroundRemoval: async () => {
    const { project } = get();
    if (!project) return;
    const nextState = !project.shotsBackgroundRemoved || project.shots.some((s) => !s.isBackgroundRemoved);
    set({ isRemovingBackground: true });
    try {
      const updatedShots = await Promise.all(
        project.shots.map(async (s) => {
          if (nextState) {
            const originalSrc = s.originalDataUrl || s.compositeDataUrl;
            const personOnlyDataUrl =
              s.personOnlyDataUrl ||
              (await segmentationEngine.removeBackgroundFromImage(originalSrc));
            return {
              ...s,
              originalDataUrl: originalSrc,
              personOnlyDataUrl,
              isBackgroundRemoved: true,
            };
          } else {
            return {
              ...s,
              isBackgroundRemoved: false,
            };
          }
        })
      );
      set({
        project: {
          ...project,
          shots: updatedShots,
          shotsBackgroundRemoved: nextState,
        },
      });
    } finally {
      set({ isRemovingBackground: false });
    }
  },
  addSticker: (content, category) => {
    const { project } = get();
    if (!project) return;
    const newSticker: StickerItem = {
      id: generateId("stk"),
      content,
      category,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10),
      scale: 1,
      rotation: Math.floor(Math.random() * 30 - 15),
      zIndex: (project.stickers.length || 0) + 1,
    };
    set({
      project: { ...project, stickers: [...project.stickers, newSticker] },
      selectedStickerId: newSticker.id,
    });
  },
  updateSticker: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const updated = project.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s));
    set({ project: { ...project, stickers: updated } });
  },
  removeSticker: (id) => {
    const { project } = get();
    if (!project) return;
    set({
      project: { ...project, stickers: project.stickers.filter((s) => s.id !== id) },
      selectedStickerId: null,
    });
  },
  addText: (text, fontFamily = "system-ui, -apple-system, sans-serif", color = "#ffffff") => {
    const { project } = get();
    if (!project) return;
    const newText: TextItem = {
      id: generateId("txt"),
      text: text || "Together Moments",
      fontFamily,
      color,
      fontSize: 24,
      x: 50,
      y: 50,
      rotation: 0,
      zIndex: (project.texts.length || 0) + 10,
    };
    set({
      project: { ...project, texts: [...project.texts, newText] },
      selectedTextId: newText.id,
    });
  },
  updateText: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const updated = project.texts.map((t) => (t.id === id ? { ...t, ...updates } : t));
    set({ project: { ...project, texts: updated } });
  },
  removeText: (id) => {
    const { project } = get();
    if (!project) return;
    set({
      project: { ...project, texts: project.texts.filter((t) => t.id !== id) },
      selectedTextId: null,
    });
  },
}));
