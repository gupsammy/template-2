import { useState } from "react";
import { ImageEditorState, MaskData, ImageData } from "@/types/image-editor";
import ImagePreview from "./ImagePreview";
import { EDITING_MODELS } from "@/lib/models";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize2,
  Download,
} from "lucide-react";

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
      viewMode: "single", // Force single view when editing
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (state.generatedImages[newIndex]) {
        handleImageSelect(state.generatedImages[newIndex]);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < state.generatedImages.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (state.generatedImages[newIndex]) {
        handleImageSelect(state.generatedImages[newIndex]);
      }
    }
  };

  const toggleViewMode = () => {
    if (state.editMask) {
      return; // Don't allow view mode change during edit
    }
    setState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "single" ? "grid" : "single",
    }));
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
    <div className="flex-1 p-6 flex flex-col">
      {state.currentImage ? (
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* View Mode Toggle and Download */}
          {!state.editMask && (
            <div className="flex justify-end gap-2 mb-4">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="p-2.5 bg-white shadow-md rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2 text-gray-700"
                title="Download Image"
              >
                <Download size={18} className="text-gray-700" />
                <span className="text-sm font-medium">Download</span>
              </button>

              {/* View Toggle Button */}
              <button
                onClick={toggleViewMode}
                className="p-2.5 bg-white shadow-md rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2 text-gray-700"
                title={
                  state.viewMode === "single"
                    ? "Switch to Grid View"
                    : "Switch to Single View"
                }
              >
                {state.viewMode === "single" ? (
                  <>
                    <LayoutGrid size={18} className="text-gray-700" />
                    <span className="text-sm font-medium">Grid View</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={18} className="text-gray-700" />
                    <span className="text-sm font-medium">Single View</span>
                  </>
                )}
              </button>
            </div>
          )}

          {state.viewMode === "single" ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0">
                <ImagePreview
                  image={state.currentImage}
                  mask={state.editMask}
                  onMaskChange={handleMaskChange}
                  viewMode={state.viewMode}
                  onEditStart={handleEditStart}
                  onEditEnd={handleEditEnd}
                />
              </div>

              {/* Navigation Controls */}
              {state.generatedImages.length > 1 && !state.editMask && (
                <div className="flex items-center justify-center gap-4 mt-4 py-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`p-2.5 bg-white shadow-md rounded-lg border border-gray-200 flex items-center
                      ${
                        currentIndex === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    title="Previous Image"
                  >
                    <ChevronLeft size={20} strokeWidth={2} />
                  </button>

                  <div className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full shadow-sm">
                    <span className="text-sm font-medium">
                      {currentIndex + 1} of {state.generatedImages.length}
                    </span>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === state.generatedImages.length - 1}
                    className={`p-2.5 bg-white shadow-md rounded-lg border border-gray-200 flex items-center
                      ${
                        currentIndex === state.generatedImages.length - 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    title="Next Image"
                  >
                    <ChevronRight size={20} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Grid View
            <div className="flex-1 grid grid-cols-2 gap-4">
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
