"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { Plus } from "lucide-react";

import { BillItemEditor } from "@/components/bill-item-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildTotals,
  calculateSubtotal,
  calculateTotal,
  formatMoney,
  roundMoney,
} from "@/lib/bill-totals";
import type { BillItem } from "@/lib/database.types";

function createEmptyItem(): BillItem {
  return {
    id: nanoid(),
    name: "",
    price: 0,
    qty: 1,
  };
}

function isItemValid(item: BillItem): boolean {
  return item.name.trim().length > 0 && item.price >= 0 && item.qty > 0;
}

export default function ManualBillPage() {
  const router = useRouter();
  const [items, setItems] = useState<BillItem[]>([createEmptyItem()]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

    const validItems = items.filter(isItemValid);

    if (validItems.length === 0) {
      setError("Add at least one item with a name and price.");
      return;
    }

    const payload = {
      items: validItems.map((item) => ({
        ...item,
        name: item.name.trim(),
        price: roundMoney(item.price),
        qty: item.qty,
      })),
      totals: buildTotals(validItems, tax, tip),
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

      router.push(`/bill/${data.billId}/share`);
    } catch {
      setError("Failed to create bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 pb-28">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="space-y-2">
          <Link
            href="/create"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add bill items
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Enter each line item. You can review and share when you&apos;re
            done.
          </p>
        </div>

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
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="h-10 w-full"
          >
            <Plus />
            Add item
          </Button>

          <div className="bg-card space-y-4 rounded-xl border p-4">
            <h2 className="font-medium">Tax & tip</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bill-tax">Tax</Label>
                <Input
                  id="bill-tax"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(event) =>
                    setTax(
                      event.target.value === ""
                        ? 0
                        : Math.max(0, Number(event.target.value)),
                    )
                  }
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-tip">Tip</Label>
                <Input
                  id="bill-tip"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={tip}
                  onChange={(event) =>
                    setTip(
                      event.target.value === ""
                        ? 0
                        : Math.max(0, Number(event.target.value)),
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium tabular-nums">
                  {formatMoney(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd className="font-medium tabular-nums">{formatMoney(tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tip</dt>
                <dd className="font-medium tabular-nums">{formatMoney(tip)}</dd>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-base">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatMoney(total)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </main>

      <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 border-t p-4 backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          <Button
            type="submit"
            form="manual-bill-form"
            size="lg"
            className="h-11 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating bill…" : "Create & share"}
          </Button>
        </div>
      </div>
    </div>
  );
}
