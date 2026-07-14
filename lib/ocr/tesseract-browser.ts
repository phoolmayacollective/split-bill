/**
 * Load Tesseract's pre-built browser bundle from /public.
 * Avoids bundling tesseract.js via npm — Turbopack resolves its Node worker in client code.
 */

const TESSERACT_SCRIPT = "/tesseract/tesseract.min.js";

export type TesseractLoggerMessage = {
  status: string;
  progress?: number;
};

export type TesseractWorkerOptions = {
  workerPath?: string;
  corePath?: string;
  langPath?: string;
  logger?: (message: TesseractLoggerMessage) => void;
  errorHandler?: (error: unknown) => void;
};

export type TesseractRecognizeOutput = {
  text: string;
  blocks: Array<{
    paragraphs: Array<{
      lines: Array<{
        text: string;
        confidence: number;
        bbox: { y0: number };
      }>;
    }>;
  }> | null;
};

export type TesseractWorker = {
  recognize: (
    image: File | Blob | string,
    options?: { rotateAuto?: boolean },
    output?: {
      text?: boolean;
      blocks?: boolean;
      hocr?: boolean;
      tsv?: boolean;
    },
  ) => Promise<{ data: TesseractRecognizeOutput }>;
  terminate: () => Promise<void>;
};

export type TesseractBrowser = {
  createWorker: (
    langs?: string,
    oem?: number,
    options?: TesseractWorkerOptions,
  ) => Promise<TesseractWorker>;
};

declare global {
  interface Window {
    Tesseract?: TesseractBrowser;
  }
}

let loadPromise: Promise<TesseractBrowser> | null = null;

export function loadTesseractBrowser(): Promise<TesseractBrowser> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Receipt scan is only available in the browser."),
    );
  }

  if (window.Tesseract) {
    return Promise.resolve(window.Tesseract);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TESSERACT_SCRIPT;
      script.async = true;
      script.dataset.tesseractBundle = "true";
      script.onload = () => {
        if (window.Tesseract) {
          resolve(window.Tesseract);
          return;
        }
        reject(new Error("Receipt scanner is unavailable. Try again or enter items manually."));
      };
      script.onerror = () => {
        loadPromise = null;
        reject(new Error("Could not start receipt scanner. Try again or enter items manually."));
      };
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
