"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageCropEditorProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  cropSize?: number;
  outputSize?: number;
  outputQuality?: number;
}

interface Position {
  x: number;
  y: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const DEFAULT_CROP_SIZE = 220;
const DEFAULT_OUTPUT_SIZE = 256;
const DEFAULT_QUALITY = 0.9;

export function ImageCropEditor({
  imageSrc,
  onCropComplete,
  cropSize = DEFAULT_CROP_SIZE,
  outputSize = DEFAULT_OUTPUT_SIZE,
  outputQuality = DEFAULT_QUALITY,
}: ImageCropEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    img.onerror = () => {
      console.error("[ImageCropEditor] Failed to load image");
    };
    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  // Draw the image on canvas whenever zoom/position changes
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasSize = cropSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Save context for circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate image dimensions to fit the crop area
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth: number;
    let drawHeight: number;

    if (imgAspect > 1) {
      // Landscape: height fits, width extends
      drawHeight = canvasSize * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      // Portrait or square: width fits, height extends
      drawWidth = canvasSize * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    const drawX = (canvasSize - drawWidth) / 2 + position.x;
    const drawY = (canvasSize - drawHeight) / 2 + position.y;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }, [zoom, position, cropSize, imageLoaded]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Generate cropped output
  const generateCroppedImage = useCallback((): string => {
    const img = imageRef.current;
    if (!img) return "";

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return "";

    // Draw circular crop at output size
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth: number;
    let drawHeight: number;

    const scale = outputSize / cropSize;

    if (imgAspect > 1) {
      drawHeight = outputSize * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = outputSize * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    const drawX = (outputSize - drawWidth) / 2 + position.x * scale;
    const drawY = (outputSize - drawHeight) / 2 + position.y * scale;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    return outputCanvas.toDataURL("image/jpeg", outputQuality);
  }, [zoom, position, cropSize, outputSize, outputQuality]);

  // Emit cropped image on changes
  useEffect(() => {
    if (!imageLoaded) return;
    const dataUrl = generateCroppedImage();
    if (dataUrl) {
      onCropComplete(dataUrl);
    }
  }, [imageLoaded, generateCroppedImage, onCropComplete]);

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain movement so image doesn't leave the crop area
      const maxOffset = (cropSize * (zoom - 1)) / 2;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      });
    },
    [isDragging, dragStart, zoom, cropSize],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [],
  );

  // Zoom handlers
  const handleZoomChange = useCallback(
    (value: number[]) => {
      const newZoom = value[0];
      // When zooming out, constrain position
      const maxOffset = (cropSize * (newZoom - 1)) / 2;
      setPosition((prev) => ({
        x: Math.max(-maxOffset, Math.min(maxOffset, prev.x)),
        y: Math.max(-maxOffset, Math.min(maxOffset, prev.y)),
      }));
      setZoom(newZoom);
    },
    [cropSize],
  );

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomPercentage = Math.round(((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100);

  return (
    <div className="flex flex-col items-center gap-4" data-testid="image-crop-editor">
      {/* Crop preview area */}
      <div className="relative">
        {/* Checkerboard background */}
        <div
          className="rounded-full overflow-hidden"
          style={{ width: cropSize, height: cropSize }}
        >
          <div
            ref={containerRef}
            className={cn(
              "relative rounded-full overflow-hidden border-4 border-[#1E392A]/20",
              "shadow-lg bg-muted",
              isDragging ? "cursor-grabbing" : "cursor-grab",
            )}
            style={{ width: cropSize, height: cropSize }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            data-testid="crop-area"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: cropSize, height: cropSize }}
            />
          </div>
        </div>

        {/* Move indicator */}
        {imageLoaded && zoom > 1 && (
          <div className="absolute bottom-1 right-1 p-1 bg-black/50 rounded-full text-white">
            <Move className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Drag hint */}
      {imageLoaded && zoom > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Drag to reposition the image
        </p>
      )}

      {/* Zoom controls */}
      <div className="w-full max-w-xs space-y-3" data-testid="zoom-controls">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleZoomChange([Math.max(MIN_ZOOM, zoom - 0.1)])}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            data-testid="zoom-out-btn"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            onValueChange={handleZoomChange}
            className="flex-1"
            aria-label="Zoom level"
            data-testid="zoom-slider"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleZoomChange([Math.min(MAX_ZOOM, zoom + 0.1)])}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            data-testid="zoom-in-btn"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Zoom: {zoomPercentage}%</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleReset}
            data-testid="reset-btn"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Image info */}
      {imageLoaded && imageNaturalSize.width > 0 && (
        <p className="text-xs text-muted-foreground" data-testid="image-info">
          Original: {imageNaturalSize.width} x {imageNaturalSize.height}px
          {" | "}
          Output: {outputSize} x {outputSize}px
        </p>
      )}
    </div>
  );
}
