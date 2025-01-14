import { ImageData } from "@/types/image-editor";

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
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="px-6 py-3 border-b">
        <h2 className="text-lg font-medium">History</h2>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No images generated yet
          </div>
        ) : (
          <div className="flex gap-4 h-full">
            {history.map((image) => (
              <button
                key={image.id}
                onClick={() => onSelectImage(image)}
                className="group relative aspect-square h-full overflow-hidden rounded-lg border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={image.url}
                  alt={image.prompt || "Generated image"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
