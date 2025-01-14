import { useState } from "react";
import { StoredImage } from "@/lib/db";
import { Download, Info } from "lucide-react";
import ImageMetadataModal from "./ImageMetadataModal";
import Image from "next/image";

interface HistoryPanelProps {
  history: StoredImage[];
  onSelectImage: (image: StoredImage) => void;
  className?: string;
}

export default function HistoryPanel({
  history,
  onSelectImage,
  className = "",
}: HistoryPanelProps) {
  const [selectedMetadata, setSelectedMetadata] = useState<StoredImage | null>(
    null
  );

  const handleDownload = (e: React.MouseEvent, image: StoredImage) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInfoClick = (e: React.MouseEvent, image: StoredImage) => {
    e.stopPropagation();
    if (image.editType) {
      setSelectedMetadata(image);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          {history.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {history.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 font-medium">
            No images generated yet
          </div>
        ) : (
          <div className="flex gap-4 h-full">
            {history.map((image) => (
              <div key={image.id} className="relative group">
                <button
                  onClick={() => onSelectImage(image)}
                  className="relative aspect-square h-full overflow-hidden rounded-lg border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Image
                    src={image.url}
                    alt={image.prompt || "Generated image"}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </button>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {image.editType && (
                    <button
                      onClick={(e) => handleInfoClick(e, image)}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm"
                    >
                      <Info className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDownload(e, image)}
                    className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMetadata && (
        <ImageMetadataModal
          image={selectedMetadata}
          onClose={() => setSelectedMetadata(null)}
        />
      )}
    </div>
  );
}
