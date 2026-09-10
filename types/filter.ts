export type FilterType =
  | "normal"
  | "vintage"
  | "polaroid"
  | "film"
  | "bw"
  | "warm"
  | "cool"
  | "dreamy"
  | "y2k";

export interface FilterPreset {
  id: FilterType;
  name: string;
  description: string;
  cssFilter: string;
  overlayGradient?: string;
  canvasFilter?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  accentColor: string;
}
