export interface ImageData {
  id: string;
  url: string;
  prompt?: string;
  timestamp: number;
  modelId: string;
  parameters?: Record<string, any>;
}

export interface MaskData {
  x: number;
  y: number;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: "generation" | "editing";
  parameters: ModelParameter[];
}

export interface ModelParameter {
  name: string;
  type: "text" | "number" | "select" | "range";
  label: string;
  default?: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface HistoryItem extends ImageData {
  parentImageId?: string;
  editType?: "generation" | "editing";
  mask?: MaskData;
}

export type ViewMode = "single" | "grid";

export interface ImageEditorState {
  currentImage: ImageData | null;
  generatedImages: ImageData[];
  editMask: MaskData | null;
  selectedModel: ModelConfig | null;
  history: HistoryItem[];
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  parameters: Record<string, any>;
}
