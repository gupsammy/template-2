import { useState } from "react";
import { ImageEditorState, MaskData, ImageData } from "@/types/image-editor";
import ImagePreview from "./ImagePreview";
import { EDITING_MODELS } from "@/lib/models";
import { ChevronLeft, ChevronRight, Grid, Maximize } from "lucide-react";

interface ImageWorkspaceProps {
  state: ImageEditorState;
  setState: React.Dispatch<React.SetStateAction<ImageEditorState>>;
}

export default function ImageWorkspace({
  state,
  setState,
}: ImageWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleMaskChange = (mask: MaskData | null) => {
    setState((prev) => ({ ...prev, editMask: mask }));
  };

  const handleEditStart = () => {
    setState((prev) => ({
      ...prev,
      selectedModel:
        prev.selectedModel?.type === "editing"
          ? prev.selectedModel
          : EDITING_MODELS[0],
    }));
  };

  const handleEditEnd = () => {
    setState((prev) => ({
      ...prev,
      editMask: null,
      selectedModel: null,
    }));
  };

  const handleImageSelect = (image: ImageData) => {
    const index = state.generatedImages.findIndex((img) => img.id === image.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
    setState((prev) => ({
      ...prev,
      currentImage: image,
      editMask: null,
    }));
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      if (state.generatedImages[currentIndex - 1]) {
        handleImageSelect(state.generatedImages[currentIndex - 1]);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < state.generatedImages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      if (state.generatedImages[currentIndex + 1]) {
        handleImageSelect(state.generatedImages[currentIndex + 1]);
      }
    }
  };

  const toggleViewMode = () => {
    setState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "single" ? "grid" : "single",
    }));
  };

  return (
    <div className="flex-1 p-6">
      {state.currentImage ? (
        <div className="relative h-full">
          {/* View Mode Toggle */}
          <button
            onClick={toggleViewMode}
            className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white/100 transition-colors border border-gray-200 flex items-center gap-2"
          >
            {state.viewMode === "single" ? (
              <>
                <Grid size={18} />
                <span className="text-sm font-medium">Grid View</span>
              </>
            ) : (
              <>
                <Maximize size={18} />
                <span className="text-sm font-medium">Single View</span>
              </>
            )}
          </button>

          {state.viewMode === "single" ? (
            // Single Image View
            <div className="relative h-full">
              <ImagePreview
                image={state.currentImage}
                mask={state.editMask}
                onMaskChange={handleMaskChange}
                viewMode={state.viewMode}
                onEditStart={handleEditStart}
                onEditEnd={handleEditEnd}
              />

              {/* Navigation Controls */}
              {state.generatedImages.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200
                      ${
                        currentIndex === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-white/100 transition-colors"
                      }`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === state.generatedImages.length - 1}
                    className={`p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200
                      ${
                        currentIndex === state.generatedImages.length - 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-white/100 transition-colors"
                      }`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-2 gap-4 h-full">
              {state.generatedImages.slice(0, 4).map((image) => (
                <div
                  key={image.id}
                  className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200
                    ${
                      image.id === state.currentImage?.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image.url}
                    alt={image.prompt || "Generated image"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
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
  );
}
