import { useRef } from "react";
import { ImageEditorState } from "@/types/image-editor";

interface ActionButtonsProps {
  state: ImageEditorState;
  setState: React.Dispatch<React.SetStateAction<ImageEditorState>>;
  uploadOnly?: boolean;
}

export default function ActionButtons({
  state,
  setState,
  uploadOnly = false,
}: ActionButtonsProps) {
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
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 text-gray-900 bg-white border rounded-lg hover:bg-gray-50 flex-1"
      >
        Upload Image
      </button>

      {!uploadOnly && state.currentImage && (
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-gray-900 bg-white border rounded-lg hover:bg-gray-50 flex-1"
        >
          Download
        </button>
      )}
    </div>
  );
}
