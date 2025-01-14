import { useState } from "react";
import { ImageEditorState, MaskData } from "@/types/image-editor";
import ImagePreview from "./ImagePreview";
import { EDITING_MODELS } from "@/lib/models";

interface ImageWorkspaceProps {
  state: ImageEditorState;
  setState: React.Dispatch<React.SetStateAction<ImageEditorState>>;
}

export default function ImageWorkspace({
  state,
  setState,
}: ImageWorkspaceProps) {
  const handleMaskChange = (mask: MaskData | null) => {
    setState((prev) => ({ ...prev, editMask: mask }));
  };

  const handleEditStart = () => {
    // Switch to editing mode and select first editing model if none selected
    setState((prev) => ({
      ...prev,
      selectedModel:
        prev.selectedModel?.type === "editing"
          ? prev.selectedModel
          : EDITING_MODELS[0],
    }));
  };

  const handleEditEnd = () => {
    // Clear mask and reset model selection
    setState((prev) => ({
      ...prev,
      editMask: null,
      selectedModel: null,
    }));
  };

  return (
    <div className="flex-1 flex">
      {/* Image Preview Area */}
      <div className="flex-1 p-6">
        {state.currentImage ? (
          <ImagePreview
            image={state.currentImage}
            mask={state.editMask}
            onMaskChange={handleMaskChange}
            viewMode={state.viewMode}
            onEditStart={handleEditStart}
            onEditEnd={handleEditEnd}
          />
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                No Image Selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload an image or generate one to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
