"use client";

import { useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";
import type { ImageCropArea } from "@/lib/ocr/capture-image";

type ReceiptImageCropperProps = {
  imageUrl: string;
  disabled?: boolean;
  onConfirm: (cropArea: ImageCropArea) => void;
  onUseFullImage: () => void;
  onCancel: () => void;
};

export function ReceiptImageCropper({
  imageUrl,
  disabled = false,
  onConfirm,
  onUseFullImage,
  onCancel,
}: ReceiptImageCropperProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = event.currentTarget;

    // Start with a generous default frame so users only need to nudge corners.
    const initialCrop: Crop = {
      unit: "%",
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    };
    setCrop(initialCrop);
    setPixelCrop({
      unit: "px",
      x: Math.round(width * 0.05),
      y: Math.round(height * 0.05),
      width: Math.round(width * 0.9),
      height: Math.round(height * 0.9),
    });
  }

  function confirmCrop() {
    const image = imageRef.current;

    if (!image || !pixelCrop || pixelCrop.width < 1 || pixelCrop.height < 1) {
      return;
    }

    // react-image-crop reports coordinates in displayed-image pixels;
    // scale them to the natural image size for canvas cropping.
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    onConfirm({
      x: pixelCrop.x * scaleX,
      y: pixelCrop.y * scaleY,
      width: pixelCrop.width * scaleX,
      height: pixelCrop.height * scaleY,
    });
  }

  return (
    <div className="space-y-4">
      <div className="mx-auto w-fit max-w-full overflow-hidden rounded-lg bg-black">
        <ReactCrop
          crop={crop}
          onChange={(nextPixelCrop, nextPercentCrop) => {
            setCrop(nextPercentCrop);
            setPixelCrop(nextPixelCrop);
          }}
          disabled={disabled}
          keepSelection
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Receipt to crop"
            onLoad={handleImageLoad}
            className="max-h-[min(65vh,36rem)] w-auto max-w-full"
          />
        </ReactCrop>
      </div>

      <p className="text-muted-foreground text-xs">
        Drag the corners or edges to frame the receipt — any shape and size
        works. Drag inside the box to move it. Only the framed area is scanned.
      </p>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={
            disabled || !pixelCrop || pixelCrop.width < 1 || pixelCrop.height < 1
          }
          onClick={confirmCrop}
        >
          Scan framed area
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={disabled}
          onClick={onUseFullImage}
        >
          Scan full image
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={disabled}
          onClick={onCancel}
        >
          Choose a different photo
        </Button>
      </div>
    </div>
  );
}
