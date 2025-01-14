import { StoredImage } from "@/lib/db";
import { Download, X } from "lucide-react";
import Image from "next/image";

interface ImageMetadataModalProps {
  image: StoredImage;
  onClose: () => void;
}

export default function ImageMetadataModal({
  image,
  onClose,
}: ImageMetadataModalProps) {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Image Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Image */}
          <div className="space-y-2">
            <div className="font-medium text-gray-900">Generated Image</div>
            <div className="relative aspect-square w-full max-w-md mx-auto">
              <Image
                src={image.url}
                alt="Generated image"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={() =>
                handleDownload(image.url, `generated-${image.id}.png`)
              }
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg mx-auto text-gray-700 hover:text-gray-900"
            >
              <Download className="w-4 h-4" />
              Download Image
            </button>
          </div>

          {/* Generation Parameters */}
          <div className="space-y-2">
            <div className="font-medium text-gray-900">
              Generation Parameters
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-gray-700">
              <div>
                <span className="font-medium text-gray-900">Model:</span>{" "}
                {image.modelId}
              </div>
              {image.prompt && (
                <div>
                  <span className="font-medium text-gray-900">Prompt:</span>{" "}
                  <span className="text-gray-800">{image.prompt}</span>
                </div>
              )}
              {image.parameters &&
                Object.entries(image.parameters).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-900">{key}:</span>{" "}
                    <span className="text-gray-800">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Input Image and Mask (for edit operations) */}
          {image.editType === "editing" && (
            <div className="space-y-4">
              {image.inputImage && (
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">Input Image</div>
                  <div className="relative aspect-square w-full max-w-md mx-auto">
                    <Image
                      src={image.inputImage}
                      alt="Input image"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={() =>
                      handleDownload(image.inputImage!, `input-${image.id}.png`)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg mx-auto text-gray-700 hover:text-gray-900"
                  >
                    <Download className="w-4 h-4" />
                    Download Input Image
                  </button>
                </div>
              )}

              {image.maskImage && (
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">Mask</div>
                  <div className="relative aspect-square w-full max-w-md mx-auto">
                    <Image
                      src={image.maskImage}
                      alt="Mask"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={() =>
                      handleDownload(image.maskImage!, `mask-${image.id}.png`)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg mx-auto text-gray-700 hover:text-gray-900"
                  >
                    <Download className="w-4 h-4" />
                    Download Mask
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-sm text-gray-600">
            Generated on: {new Date(image.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
