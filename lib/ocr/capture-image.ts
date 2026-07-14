export type ImageCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function loadImageBitmap(source: string | Blob | File): Promise<ImageBitmap> {
  if (typeof source === "string") {
    const response = await fetch(source);
    const blob = await response.blob();
    return createImageBitmap(blob);
  }

  return createImageBitmap(source);
}

/**
 * Crop a region from an image and return a JPEG blob suitable for OCR.
 */
export async function cropImageToBlob(
  imageSource: string | Blob | File,
  crop: ImageCropArea,
  mimeType = "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const bitmap = await loadImageBitmap(imageSource);

  try {
    const width = Math.max(1, Math.round(crop.width));
    const height = Math.max(1, Math.round(crop.height));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not crop image.");
    }

    context.drawImage(
      bitmap,
      Math.round(crop.x),
      Math.round(crop.y),
      width,
      height,
      0,
      0,
      width,
      height,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) {
      throw new Error("Could not crop image.");
    }

    return blob;
  } finally {
    bitmap.close();
  }
}

export function readImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Tesseract is slower and often less accurate on multi-megapixel phone
 * photos. Cap the longest edge; receipts stay perfectly legible at this size.
 */
export const OCR_MAX_DIMENSION = 2000;

export function getScaledDimensions(
  width: number,
  height: number,
  maxDimension: number = OCR_MAX_DIMENSION,
): { width: number; height: number } {
  const longestEdge = Math.max(width, height);

  if (longestEdge <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longestEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/**
 * Downscale a receipt photo before OCR. Returns the original file when the
 * image is already small enough or when preprocessing is unavailable.
 */
export async function prepareImageForOcr(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);

    try {
      const { width, height } = getScaledDimensions(
        bitmap.width,
        bitmap.height,
      );

      if (width === bitmap.width && height === bitmap.height) {
        return file;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        return file;
      }

      context.drawImage(bitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      return blob ?? file;
    } finally {
      bitmap.close();
    }
  } catch {
    // HEIC or other formats the browser can't decode into a bitmap —
    // let Tesseract try the original file.
    return file;
  }
}
