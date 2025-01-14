import { useRef } from "react";
import { ImageEditorState } from "@/types/image-editor";
import { generateImage } from "@/lib/api";
import { GENERATION_MODELS } from "@/lib/models";

interface ActionButtonsProps {
  state: ImageEditorState;
  setState: React.Dispatch<React.SetStateAction<ImageEditorState>>;
}

export default function ActionButtons({ state, setState }: ActionButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        generatedImages: [newImage],
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
          ...state.parameters,
          mask: state.editMask,
          image: state.currentImage?.url,
        },
      });

      // Create array of new images from URLs
      const newImages = result.urls.map((url, index) => ({
        id: `${Date.now()}-${index}`,
        url,
        prompt: state.parameters?.prompt,
        timestamp: Date.now(),
        modelId: state.selectedModel!.id,
        parameters: state.parameters,
      }));

      // Update state with all generated images
      setState((prev) => ({
        ...prev,
        currentImage: newImages[0],
        generatedImages: newImages,
        history: [...newImages, ...prev.history],
        isLoading: false,
        editMask: null,
        selectedModel: state.editMask
          ? GENERATION_MODELS[0]
          : prev.selectedModel,
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
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 text-gray-900 bg-white border rounded-lg hover:bg-gray-50"
      >
        Upload Image
      </button>

      {state.editMask ? (
        <>
          <button
            onClick={() => {
              setState((prev) => ({
                ...prev,
                editMask: null,
                selectedModel: GENERATION_MODELS[0],
              }));
            }}
            className="px-4 py-2 text-gray-900 bg-white border rounded-lg hover:bg-gray-50"
          >
            Cancel Edit
          </button>
          <button
            onClick={handleGenerate}
            disabled={state.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {state.isLoading ? "Processing..." : "Apply Edit"}
          </button>
        </>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={state.isLoading || !state.selectedModel}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {state.isLoading ? "Generating..." : "Generate"}
        </button>
      )}

      {state.currentImage && (
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-gray-900 bg-white border rounded-lg hover:bg-gray-50"
        >
          Download
        </button>
      )}
    </>
  );
}
