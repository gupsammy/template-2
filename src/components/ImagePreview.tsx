import { useRef, useState, useEffect } from "react";
import { ImageData, MaskData, ViewMode, PaintMode } from "@/types/image-editor";

interface ImagePreviewProps {
  image: ImageData;
  mask: MaskData | null;
  onMaskChange: (mask: MaskData | null) => void;
  viewMode: ViewMode;
  paintMode: PaintMode;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export default function ImagePreview({
  image,
  mask,
  onMaskChange,
  viewMode,
  paintMode,
  onEditStart,
  onEditEnd,
}: ImagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);

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

    if (img.complete) {
      updateImageSize();
    } else {
      img.addEventListener("load", updateImageSize);
    }
    return () => img.removeEventListener("load", updateImageSize);
  }, [image.url]);

  // Get coordinates relative to image
  const getImageCoordinates = (
    e: React.MouseEvent
  ): { x: number; y: number } | null => {
    // Add debugging logs
    const img = imageRef.current;
    if (!img || !imageSize) return null;

    const rect = img.getBoundingClientRect();

    // Get click coordinates relative to image display size
    // Account for padding and borders
    const style = window.getComputedStyle(img);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingTop = parseFloat(style.paddingTop);
    const borderLeft = parseFloat(style.borderLeftWidth);
    const borderTop = parseFloat(style.borderTopWidth);

    let x = e.clientX - rect.left - (paddingLeft + borderLeft);
    let y = e.clientY - rect.top - (paddingTop + borderTop);

    // Convert to natural image coordinates
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;

    x = Math.round(x * scaleX);
    y = Math.round(y * scaleY);

    // Ensure coordinates are within image bounds
    if (x < 0 || x > imageSize.width || y < 0 || y > imageSize.height) {
      return null;
    }

    // Log coordinates for debugging
    console.log("Mouse Coordinates:", {
      clientX: e.clientX,
      clientY: e.clientY,
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      calculated: { x, y },
      imageNaturalSize: {
        width: imageSize.width,
        height: imageSize.height,
      },
    });

    return { x, y };
  };

  // Create mask preview
  useEffect(() => {
    if (!mask || !imageSize) {
      setMaskPreview(null);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageSize.width;
    canvas.height = imageSize.height;

    // Invert colors for outpainting mode
    ctx.fillStyle = paintMode === "outpaint" ? "white" : "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = paintMode === "outpaint" ? "black" : "white";
    ctx.fillRect(
      Math.max(0, Math.min(mask.x, imageSize.width)),
      Math.max(0, Math.min(mask.y, imageSize.height)),
      Math.min(mask.width, imageSize.width - mask.x),
      Math.min(mask.height, imageSize.height - mask.y)
    );

    setMaskPreview(canvas.toDataURL());
  }, [mask, imageSize, paintMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const coords = getImageCoordinates(e);
    if (!coords) return;

    setIsDragging(true);
    setStartPoint(coords);
    onEditStart();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Log mask creation
    if (!isDragging || !startPoint || !imageSize) return;

    const coords = getImageCoordinates(e);
    if (!coords) return;

    // Calculate mask dimensions
    const x = Math.max(
      0,
      Math.min(Math.min(startPoint.x, coords.x), imageSize.width)
    );
    const y = Math.max(
      0,
      Math.min(Math.min(startPoint.y, coords.y), imageSize.height)
    );
    const width = Math.min(
      Math.abs(coords.x - startPoint.x),
      imageSize.width - x
    );
    const height = Math.min(
      Math.abs(coords.y - startPoint.y),
      imageSize.height - y
    );

    // Update mask with image dimensions
    // Log mask dimensions before updating
    console.log("Creating Mask:", {
      x,
      y,
      width,
      height,
      imageSize,
    });

    onMaskChange({
      x,
      y,
      width,
      height,
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
    if (!coords || !mask || isDragging) return;

    const isInsideMask =
      coords.x >= mask.x &&
      coords.x <= mask.x + mask.width &&
      coords.y >= mask.y &&
      coords.y <= mask.y + mask.height;

    if (!isInsideMask) {
      onEditEnd();
      onMaskChange(null);
    }
  };

  return (
    <div className="relative flex-1 h-full">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center"
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
                left: `${(mask.x / imageSize.width) * 100}%`,
                top: `${(mask.y / imageSize.height) * 100}%`,
                width: `${(mask.width / imageSize.width) * 100}%`,
                height: `${(mask.height / imageSize.height) * 100}%`,
              }}
            />
          )}
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
