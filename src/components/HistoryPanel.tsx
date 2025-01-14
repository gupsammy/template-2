import { ImageData } from "@/types/image-editor";
import { Download } from "lucide-react";

interface HistoryPanelProps {
  history: ImageData[];
  onSelectImage: (image: ImageData) => void;
  className?: string;
}

export default function HistoryPanel({
  history,
  onSelectImage,
  className = "",
}: HistoryPanelProps) {
  const handleDownload = (e: React.MouseEvent, image: ImageData) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  <img
                    src={image.url}
                    alt={image.prompt || "Generated image"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                  {/* Download Button Overlay */}
                  <button
                    onClick={(e) => handleDownload(e, image)}
                    className="absolute top-2 right-2 p-2 bg-white shadow-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                    title="Download Image"
                  >
                    <Download className="text-gray-700" size={16} />
                  </button>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
