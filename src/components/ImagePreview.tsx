import { useRef, useState, useEffect } from "react";
import { ImageData, MaskData, ViewMode } from "@/types/image-editor";

interface ImagePreviewProps {
  image: ImageData;
  mask: MaskData | null;
  onMaskChange: (mask: MaskData | null) => void;
  viewMode: ViewMode;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export default function ImagePreview({
  image,
  mask,
  onMaskChange,
  viewMode,
  onEditStart,
  onEditEnd,
}: ImagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [zoom, setZoom] = useState(1);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Update image size when image loads
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const updateImageSize = () => {
      setImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    // Wait for image to load to get natural dimensions
    if (img.complete) {
      updateImageSize();
    } else {
      img.addEventListener("load", updateImageSize);
    }
    return () => img.removeEventListener("load", updateImageSize);
  }, [image.url]);

  // Create mask preview
  useEffect(() => {
    if (!mask || !imageRef.current || !imageSize) {
      setMaskPreview(null);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match original image dimensions
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;

    // Draw black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw white mask
    ctx.fillStyle = "white";
    ctx.fillRect(mask.x, mask.y, mask.width, mask.height);

    setMaskPreview(canvas.toDataURL());
  }, [mask, imageSize]);

  // Get coordinates relative to image
  const getImageCoordinates = (e: React.MouseEvent) => {
    const img = imageRef.current;
    if (!img || !imageSize) return null;

    const rect = img.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;

    // Calculate coordinates relative to the image's natural dimensions
    let x = ((e.clientX - rect.left) * scaleX) / zoom;
    let y = ((e.clientY - rect.top) * scaleY) / zoom;

    // Constrain coordinates to image boundaries
    x = Math.max(0, Math.min(x, imageSize.width));
    y = Math.max(0, Math.min(y, imageSize.height));

    // Check if point is inside image
    if (x < 0 || x > imageSize.width || y < 0 || y > imageSize.height) {
      return null;
    }

    return { x, y };
  };

  // Handle mouse events for drawing mask
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent image dragging

    const coords = getImageCoordinates(e);
    if (!coords) return;

    setIsDragging(true);
    setStartPoint(coords);
    onEditStart();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPoint || !imageSize) return;

    const coords = getImageCoordinates(e);
    if (!coords) return;

    // Constrain coordinates to image boundaries
    const x = Math.max(0, Math.min(coords.x, imageSize.width));
    const y = Math.max(0, Math.min(coords.y, imageSize.height));

    const maskData: MaskData = {
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    };

    // Include image dimensions with the mask data
    onMaskChange({
      ...maskData,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setStartPoint(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const coords = getImageCoordinates(e);

    // If clicking outside image, clear mask
    if (!coords) {
      if (mask) {
        onEditEnd();
        onMaskChange(null);
      }
      return;
    }

    // Only clear mask if clicking outside the mask area but inside image
    if (mask && !isDragging) {
      const isInsideMask =
        coords.x >= mask.x &&
        coords.x <= mask.x + mask.width &&
        coords.y >= mask.y &&
        coords.y <= mask.y + mask.height;

      if (!isInsideMask) {
        onEditEnd();
        onMaskChange(null);
      }
    }
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel as any, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel as any);
    };
  }, []);

  return (
    <div className="relative flex-1 h-full">
      {/* Main Image Preview */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <div
          className="relative transition-transform duration-200 ease-in-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          }}
        >
          <div className="relative">
            <img
              ref={imageRef}
              src={image.url}
              alt={image.prompt || "Generated image"}
              className="max-w-full max-h-[calc(100vh-16rem)] object-contain select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleClick}
              draggable={false}
            />

            {mask && imageSize && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                style={{
                  left: `${mask.x}px`,
                  top: `${mask.y}px`,
                  width: `${mask.width}px`,
                  height: `${mask.height}px`,
                }}
              />
            )}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 space-x-2">
          <button
            onClick={() => setZoom((prev) => Math.min(prev * 1.1, 5))}
            className="p-2 hover:bg-gray-100 rounded text-gray-900"
          >
            +
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(prev * 0.9, 0.1))}
            className="p-2 hover:bg-gray-100 rounded text-gray-900"
          >
            -
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 hover:bg-gray-100 rounded text-gray-900"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mask Preview */}
      {maskPreview && (
        <div className="absolute top-4 right-4 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b">
            <h4 className="text-sm font-medium text-gray-900">Mask Preview</h4>
          </div>
          <div className="p-2">
            <img
              src={maskPreview}
              alt="Mask preview"
              className="w-full aspect-square object-contain bg-gray-100 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
