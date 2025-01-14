import { useState, useRef } from "react";
import { ImageEditorState, ModelConfig } from "@/types/image-editor";
import { generateImage } from "@/lib/api";
import { GENERATION_MODELS, EDITING_MODELS } from "@/lib/models";
import ModelSelector from "./ModelSelector";
import DynamicForm from "./DynamicForm";

interface ControlPanelProps {
  state: ImageEditorState;
  setState: React.Dispatch<React.SetStateAction<ImageEditorState>>;
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
}

export default function ControlPanel({
  state,
  setState,
  isDrawing,
  setIsDrawing,
}: ControlPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModelSelect = (model: ModelConfig) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
    setFormData({});
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: Date.now().toString(),
        url: e.target?.result as string,
        timestamp: Date.now(),
        modelId: "upload",
      };
      setState((prev) => ({
        ...prev,
        currentImage: newImage,
        history: [newImage, ...prev.history],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!state.selectedModel) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await generateImage({
        modelId: state.selectedModel.id,
        parameters: {
          ...formData,
          mask: state.editMask,
          image: state.currentImage?.url,
        },
      });

      const newImage = {
        id: result.id,
        url: result.url,
        prompt: formData.prompt,
        timestamp: Date.now(),
        modelId: state.selectedModel.id,
        parameters: formData,
      };

      setState((prev) => ({
        ...prev,
        currentImage: newImage,
        history: [newImage, ...prev.history],
        isLoading: false,
        editMask: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to generate image",
      }));
    }
  };

  const handleDownload = () => {
    if (!state.currentImage?.url) return;
    const link = document.createElement("a");
    link.href = state.currentImage.url;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-96 bg-white border-l p-6 space-y-6 overflow-y-auto">
      {/* Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Image</h3>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-2 border-2 border-dashed rounded-lg hover:bg-gray-50 text-gray-600"
        >
          Click to upload or drag and drop
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Model</h3>
        <ModelSelector
          models={isDrawing ? EDITING_MODELS : GENERATION_MODELS}
          selectedModel={state.selectedModel}
          onSelect={handleModelSelect}
        />
      </div>

      {state.selectedModel && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Parameters</h3>
          <DynamicForm
            parameters={state.selectedModel.parameters}
            values={formData}
            onChange={setFormData}
          />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Actions</h3>

        {state.currentImage && !isDrawing && (
          <button
            onClick={() => setIsDrawing(true)}
            className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Edit Image
          </button>
        )}

        {isDrawing && (
          <button
            onClick={() => setIsDrawing(false)}
            className="w-full px-4 py-2 border rounded-lg bg-blue-50 border-blue-500 text-blue-700"
          >
            Cancel Edit
          </button>
        )}

        <button
          onClick={handleGenerate}
          disabled={state.isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {state.isLoading
            ? "Processing..."
            : isDrawing
            ? "Apply Edit"
            : "Generate"}
        </button>

        {state.currentImage && (
          <button
            onClick={handleDownload}
            className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Download
          </button>
        )}
      </div>

      {state.error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {state.error}
        </div>
      )}
    </div>
  );
}
