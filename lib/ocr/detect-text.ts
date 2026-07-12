import {
  loadTesseractBrowser,
  type TesseractWorker,
} from "@/lib/ocr/tesseract-browser";

export type OcrLine = {
  text: string;
  top: number;
  confidence: number;
};

export type OcrProgress = {
  status: string;
  progress: number;
};

type TesseractLine = {
  text: string;
  confidence: number;
  bbox: {
    y0: number;
  };
};

const OCR_TIMEOUT_MS = 120_000;

let workerPromise: Promise<TesseractWorker> | null = null;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function normalizeOcrError(error: unknown): Error {
  if (error instanceof Error && error.message) {
    return error;
  }

  if (typeof error === "string" && error.length > 0) {
    return new Error(error);
  }

  return new Error(
    "Receipt scan failed. Try again or enter items manually.",
  );
}

function formatProgressStatus(status: string): string {
  switch (status) {
    case "loading tesseract core":
    case "initializing tesseract":
    case "initializing api":
      return "Getting ready…";
    case "recognizing text":
      return "Reading receipt…";
    default:
      return "Scanning receipt…";
  }
}

async function getWorker(onProgress?: (progress: OcrProgress) => void) {
  if (!workerPromise) {
    workerPromise = (async () => {
      const Tesseract = await loadTesseractBrowser();
      return Tesseract.createWorker("eng", 1, {
        workerPath: "/tesseract/worker.min.js",
        errorHandler: (error: unknown) => {
          throw normalizeOcrError(error);
        },
        logger: (message) => {
          if (!onProgress || message.status === undefined) {
            return;
          }

          onProgress({
            status: formatProgressStatus(message.status),
            progress: message.progress ?? 0,
          });
        },
      });
    })();
  }

  return workerPromise;
}

export function mapTesseractLines(lines: TesseractLine[]): OcrLine[] {
  return lines
    .map((line) => ({
      text: line.text.trim(),
      top: line.bbox.y0,
      confidence: line.confidence,
    }))
    .filter((line) => line.text.length > 0)
    .sort((left, right) => left.top - right.top);
}

export function extractLinesFromPage(page: {
  blocks: Array<{
    paragraphs: Array<{
      lines: TesseractLine[];
    }>;
  }> | null;
  text: string;
}): OcrLine[] {
  const lines: TesseractLine[] = [];

  if (page.blocks) {
    for (const block of page.blocks) {
      for (const paragraph of block.paragraphs) {
        lines.push(...paragraph.lines);
      }
    }
  }

  if (lines.length > 0) {
    return mapTesseractLines(lines);
  }

  return page.text
    .split("\n")
    .map((text, index) => ({
      text: text.trim(),
      top: index,
      confidence: 0,
    }))
    .filter((line) => line.text.length > 0);
}

export async function detectTextFromImage(
  image: File | string,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrLine[]> {
  if (typeof window === "undefined") {
    throw new Error("Receipt scan is only available in the browser.");
  }

  try {
    const worker = await getWorker(onProgress);

    const result = await withTimeout(
      worker.recognize(
        image,
        { rotateAuto: true },
        {
          text: true,
          blocks: true,
          hocr: false,
          tsv: false,
        },
      ),
      OCR_TIMEOUT_MS,
      "Receipt scan timed out. Try again or enter items manually.",
    );

    const lines = extractLinesFromPage(result.data);

    console.log("[receipt-ocr] scan results", {
      rawTextLines: result.data.text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      lines,
      lineConfidences: lines.map(({ text, confidence, top }) => ({
        text,
        confidence,
        top,
      })),
    });

    return lines;
  } catch (error) {
    await terminateOcrWorker();
    throw normalizeOcrError(error);
  }
}

export async function terminateOcrWorker(): Promise<void> {
  if (!workerPromise) {
    return;
  }

  const pending = workerPromise;
  workerPromise = null;

  try {
    const worker = await pending;
    await worker.terminate();
  } catch {
    // Worker may have failed during initialization.
  }
}
