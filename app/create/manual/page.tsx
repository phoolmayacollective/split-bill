"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { Plus } from "lucide-react";

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
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import {
  buildTotals,
  calculateSubtotal,
  calculateTotal,
  roundMoney,
} from "@/lib/bill-totals";
import type { BillItem } from "@/lib/database.types";

const PAYER_STEPS = [
  { label: "Items" },
  { label: "Payment" },
  { label: "Share" },
];

function createEmptyItem(): BillItem {
  return {
    id: nanoid(),
    name: "",
    price: 0,
    qty: 1,
  };
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

export default function ManualBillPage() {
  const router = useRouter();
  const { circleMembers } = usePayerCircle();
  const [items, setItems] = useState<BillItem[]>([createEmptyItem()]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invalidItemIds, setInvalidItemIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(() => calculateSubtotal(items), [items]);
  const total = useMemo(
    () => calculateTotal(subtotal, tax, tip),
    [subtotal, tax, tip],
  );

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
      totals: buildTotals(validItems, tax, tip),
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
          title="Add bill items"
          description="Enter each line item. You'll add payment details on the next step."
          backHref="/create"
        />

        <StepIndicator steps={PAYER_STEPS} currentStep={1} />

        <form id="manual-bill-form" onSubmit={handleSubmit} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bill-tax">Tax</Label>
                <NumericInput
                  id="bill-tax"
                  value={tax}
                  onChange={setTax}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-tip">Tip</Label>
                <NumericInput
                  id="bill-tip"
                  value={tip}
                  onChange={setTip}
                />
              </div>
            </div>

            <MoneyBreakdown
              lines={[
                { label: "Subtotal", amount: subtotal },
                { label: "Tax", amount: tax },
                { label: "Tip", amount: tip },
              ]}
              total={total}
            />
          </SectionCard>

          {error ? <ErrorMessage message={error} /> : null}
        </form>
      </PageShell>

      <StickyActionBar>
        <Button
          type="submit"
          form="manual-bill-form"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating bill…" : "Continue to payment"}
        </Button>
      </StickyActionBar>
    </>
  );
}
