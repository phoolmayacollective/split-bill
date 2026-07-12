"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Camera, ImageUp, Plus } from "lucide-react";

import { BillItemEditor } from "@/components/bill-item-editor";
import { MoneyBreakdown } from "@/components/bill/money-breakdown";
import { ParticipantListEditor } from "@/components/participant-list-editor";
import { usePayerCircle } from "@/hooks/use-payer-circle";
import { ErrorMessage } from "@/components/feedback/error-message";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";
import { StepIndicator } from "@/components/layout/step-indicator";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import {
  buildTotals,
  calculateSubtotal,
  calculateTotal,
  roundMoney,
} from "@/lib/bill-totals";
import {
  readImagePreviewUrl,
  revokeImagePreviewUrl,
} from "@/lib/ocr/capture-image";
import type { OcrProgress } from "@/lib/ocr/detect-text";
import type { ParsedReceipt } from "@/lib/ocr/parse-receipt-text";
import type { BillItem } from "@/lib/database.types";

const PAYER_STEPS = [
  { label: "Items" },
  { label: "Payment" },
  { label: "Share" },
];

type ScanStep = "capture" | "review";

function createEmptyItem(): BillItem {
  return {
    id: nanoid(),
    name: "",
    price: 0,
    qty: 1,
  };
}

function createItemsFromParsed(
  parsedItems: Array<{ name: string; price: number; qty: number }>,
): BillItem[] {
  if (parsedItems.length === 0) {
    return [createEmptyItem()];
  }

  return parsedItems.map((item) => ({
    id: nanoid(),
    name: item.name,
    price: roundMoney(item.price),
    qty: item.qty,
  }));
}

function isItemValid(item: BillItem): boolean {
  return item.name.trim().length > 0 && item.price > 0 && item.qty > 0;
}

function getItemError(item: BillItem): string | null {
  if (!item.name.trim()) {
    return "Add a name for this item.";
  }
  if (item.price <= 0) {
    return "Price must be greater than zero.";
  }
  return null;
}

function formatConfidence(confidence: number): string {
  if (confidence <= 0) {
    return "n/a";
  }
  return `${Math.round(confidence)}%`;
}

type ParseReceiptResult =
  | { ok: true; parsed: ParsedReceipt }
  | { ok: false; error: string };

async function parseReceiptFromOcrLines(
  lines: string[],
  onProgress?: (progress: OcrProgress) => void,
): Promise<ParseReceiptResult> {
  onProgress?.({ status: "Parsing line items…", progress: 1 });

  try {
    const response = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });

    const data = (await response.json()) as ParsedReceipt & { error?: string };

    if (!response.ok) {
      return {
        ok: false,
        error: data.error ?? "Failed to parse receipt. Add items manually.",
      };
    }

    return { ok: true, parsed: data };
  } catch {
    return {
      ok: false,
      error: "Could not read the receipt. Add items manually.",
    };
  }
}

export default function ScanBillPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { circleMembers } = usePayerCircle();

  const [step, setStep] = useState<ScanStep>("capture");
  const [items, setItems] = useState<BillItem[]>([createEmptyItem()]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [tax, setTax] = useState(0);
  const [parsedTax, setParsedTax] = useState(0);
  const [taxInclusive, setTaxInclusive] = useState(true);
  const [tip, setTip] = useState(0);
  const [rawText, setRawText] = useState<string[]>([]);
  const [lineConfidences, setLineConfidences] = useState<number[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalidItemIds, setInvalidItemIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(() => calculateSubtotal(items), [items]);
  const effectiveTax = taxInclusive ? 0 : tax;
  const total = useMemo(
    () => calculateTotal(subtotal, effectiveTax, tip),
    [subtotal, effectiveTax, tip],
  );
  const averageConfidence = useMemo(() => {
    const scored = lineConfidences.filter((value) => value > 0);
    if (scored.length === 0) {
      return null;
    }
    return scored.reduce((sum, value) => sum + value, 0) / scored.length;
  }, [lineConfidences]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokeImagePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      void import("@/lib/ocr/detect-text").then((ocr) => ocr.terminateOcrWorker());
    };
  }, []);

  function cancelScan() {
    setIsScanning(false);
    setScanProgress(null);
    setError(null);
    void import("@/lib/ocr/detect-text").then((ocr) => ocr.terminateOcrWorker());
  }

  async function processReceiptImage(file: File) {
    setError(null);
    setIsScanning(true);
    setScanProgress({ status: "Getting ready…", progress: 0 });

    if (previewUrl) {
      revokeImagePreviewUrl(previewUrl);
    }
    setPreviewUrl(readImagePreviewUrl(file));

    try {
      const { detectTextFromImage } = await import("@/lib/ocr/detect-text");
      const lines = await detectTextFromImage(file, setScanProgress);
      const detectedText = lines.map((line) => line.text);
      const parseResult = await parseReceiptFromOcrLines(
        detectedText,
        setScanProgress,
      );

      setRawText(detectedText);
      setLineConfidences(lines.map((line) => line.confidence));
      setInvalidItemIds(new Set());
      setStep("review");

      if (parseResult.ok) {
        const { parsed } = parseResult;
        setItems(createItemsFromParsed(parsed.items));
        setParsedTax(parsed.tax ?? 0);
        setTaxInclusive(true);
        setTax(0);
        setTip(parsed.tip ?? 0);

        if (parsed.items.length === 0) {
          setError(
            "We read the receipt but couldn't find line items. Review the extracted text below and add items manually.",
          );
        }
      } else {
        setItems([createEmptyItem()]);
        setParsedTax(0);
        setTaxInclusive(true);
        setTax(0);
        setTip(0);
        setError(parseResult.error);
      }
    } catch (scanError) {
      const message =
        scanError instanceof Error
          ? scanError.message
          : "Receipt scan failed. Try again or enter items manually.";
      setError(message);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await processReceiptImage(file);
  }

  function updateItem(index: number, nextItem: BillItem) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? nextItem : item,
      ),
    );
    if (invalidItemIds.has(nextItem.id)) {
      setInvalidItemIds((current) => {
        const next = new Set(current);
        if (isItemValid(nextItem)) {
          next.delete(nextItem.id);
        }
        return next;
      });
    }
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    setItems((current) => [...current, createEmptyItem()]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const invalidIds = new Set<string>();
    for (const item of items) {
      if (!isItemValid(item)) {
        invalidIds.add(item.id);
      }
    }

    if (invalidIds.size > 0) {
      setInvalidItemIds(invalidIds);
      setError("Fix the highlighted items before continuing.");
      return;
    }

    const validItems = items.filter(isItemValid);
    const payload = {
      items: validItems.map((item) => ({
        ...item,
        name: item.name.trim(),
        price: roundMoney(item.price),
        qty: item.qty,
      })),
      totals: buildTotals(validItems, effectiveTax, tip),
      ...(participants.length > 0 ? { participants } : {}),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        billId?: string;
        error?: string;
      };

      if (!response.ok || !data.billId) {
        setError(data.error ?? "Failed to create bill. Please try again.");
        return;
      }

      router.push(`/create/${data.billId}/payment`);
    } catch {
      setError("Failed to create bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageShell withStickyFooter>
        <AppPageHeader
          title={step === "capture" ? "Scan a receipt" : "Review scanned items"}
          description={
            step === "capture"
              ? "Upload or photograph a receipt. We'll pull out the line items for you to review."
              : "Check every line item before continuing. Scans can miss prices or names."
          }
          backHref="/create"
        />

        <StepIndicator steps={PAYER_STEPS} currentStep={1} />

        {step === "capture" ? (
          <div className="space-y-4">
            <SectionCard>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  The first scan may take a little longer while we get ready.
                  After that, recognition usually takes 10–30 seconds on a phone.
                </p>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="absolute h-px w-px overflow-hidden opacity-0"
                  tabIndex={-1}
                  aria-hidden
                  onChange={handleFileUpload}
                />
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  className="absolute h-px w-px overflow-hidden opacity-0"
                  tabIndex={-1}
                  aria-hidden
                  onChange={handleFileUpload}
                />

                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="h-auto w-full flex-col items-start gap-2 px-5 py-5 text-left"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isScanning}
                  >
                    <span className="flex items-center gap-2.5 text-base font-medium">
                      <Camera className="size-5" aria-hidden />
                      Take photo
                    </span>
                    <span className="text-primary-foreground/80 text-sm font-normal">
                      Opens your camera on mobile
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-auto w-full flex-col items-start gap-2 px-5 py-5 text-left"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={isScanning}
                  >
                    <span className="flex items-center gap-2.5 text-base font-medium">
                      <ImageUp className="size-5" aria-hidden />
                      Upload receipt image
                    </span>
                    <span className="text-muted-foreground text-sm font-normal">
                      Try a photo from your gallery or desktop
                    </span>
                  </Button>
                </div>
              </div>
            </SectionCard>

            {isScanning && scanProgress ? (
              <SectionCard title="Scanning receipt">
                <p className="text-sm">{scanProgress.status}</p>
                <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(scanProgress.progress * 100)}%`,
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 w-full"
                  onClick={cancelScan}
                >
                  Cancel scan
                </Button>
              </SectionCard>
            ) : null}

            {error ? <ErrorMessage message={error} /> : null}
          </div>
        ) : (
          <form id="scan-bill-form" onSubmit={handleSubmit} className="space-y-4">
            {previewUrl ? (
              <SectionCard title="Receipt image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Uploaded receipt"
                  className="max-h-64 w-full rounded-lg object-contain"
                />
              </SectionCard>
            ) : null}

            <div className="space-y-3">
              {items.map((item, index) => (
                <BillItemEditor
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={(nextItem) => updateItem(index, nextItem)}
                  onRemove={() => removeItem(index)}
                  canRemove={items.length > 1}
                  invalid={invalidItemIds.has(item.id)}
                  errorMessage={
                    invalidItemIds.has(item.id) ? getItemError(item) : null
                  }
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full"
            >
              <Plus />
              Add item
            </Button>

            <ParticipantListEditor
              participants={participants}
              onChange={setParticipants}
              circleMembers={circleMembers}
            />

            <SectionCard title="Tax & tip">
              <div className="mb-4 flex items-start gap-3">
                <Checkbox
                  id="scan-tax-inclusive"
                  checked={taxInclusive}
                  onCheckedChange={(checked) => {
                    setTaxInclusive(checked);
                    if (checked) {
                      setTax(0);
                    } else {
                      setTax(parsedTax);
                    }
                  }}
                />
                <div className="space-y-1">
                  <Label htmlFor="scan-tax-inclusive" className="cursor-pointer">
                    Line item prices include tax
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    {taxInclusive
                      ? "Tax on the receipt is already in each item price (typical in Germany/EU)."
                      : "Tax is added on top of item prices (e.g. US-style sales tax)."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="scan-bill-tax">Tax</Label>
                  <NumericInput
                    id="scan-bill-tax"
                    value={taxInclusive ? 0 : tax}
                    onChange={setTax}
                    disabled={taxInclusive}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scan-bill-tip">Tip</Label>
                  <NumericInput
                    id="scan-bill-tip"
                    value={tip}
                    onChange={setTip}
                  />
                </div>
              </div>

              <MoneyBreakdown
                lines={[
                  { label: "Subtotal", amount: subtotal },
                  ...(taxInclusive
                    ? []
                    : [{ label: "Tax", amount: effectiveTax }]),
                  { label: "Tip", amount: tip },
                ]}
                total={total}
              />
            </SectionCard>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("capture");
                setError(null);
              }}
            >
              Scan another receipt
            </Button>

            {error ? <ErrorMessage message={error} /> : null}
          </form>
        )}
      </PageShell>

      {step === "review" ? (
        <StickyActionBar>
          <Button
            type="submit"
            form="scan-bill-form"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating bill…" : "Continue to payment"}
          </Button>
        </StickyActionBar>
      ) : null}
    </>
  );
}
