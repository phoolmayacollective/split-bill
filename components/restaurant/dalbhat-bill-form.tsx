"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

import { ErrorMessage } from "@/components/feedback/error-message";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";
import { StepIndicator } from "@/components/layout/step-indicator";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { EmptyState } from "@/components/feedback/empty-state";
import { EuroAmount, QtyControls } from "@/components/restaurant/menu-controls";
import { MenuSearchFilter } from "@/components/restaurant/menu-search-filter";
import { MenuSearchHighlight } from "@/components/restaurant/menu-search-highlight";
import { ParticipantListEditor } from "@/components/participant-list-editor";
import { usePayerCircle } from "@/hooks/use-payer-circle";
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
import type { BillItem } from "@/lib/database.types";
import {
  buildBillItemId,
  CATEGORY_LABELS,
  dalbhatMenu,
  DRINK_CATEGORY_LABELS,
  formatExtraName,
  formatMenuItemName,
  type DrinkItem,
  type MenuItem,
  type RecommendationItem,
} from "@/lib/restaurants/dalbhat-menu";
import { formatEuro } from "@/lib/restaurants/format-euro";
import {
  filterDalbhatMenu,
  isMenuFiltered,
  type MenuFilterId,
} from "@/lib/restaurants/dalbhat-menu-search";
import { cn } from "@/lib/utils";

const PAYER_STEPS = [
  { label: "Items" },
  { label: "Payment" },
  { label: "Share" },
];

type CartLine = {
  key: string;
  id: string;
  name: string;
  price: number;
  qty: number;
};

function getCartQty(cart: CartLine[], key: string): number {
  return cart.find((line) => line.key === key)?.qty ?? 0;
}

function upsertCartLine(cart: CartLine[], line: CartLine): CartLine[] {
  const existing = cart.find((entry) => entry.key === line.key);
  if (existing) {
    return cart.map((entry) =>
      entry.key === line.key
        ? { ...entry, qty: entry.qty + line.qty }
        : entry,
    );
  }
  return [...cart, line];
}

function changeCartQty(cart: CartLine[], key: string, delta: number): CartLine[] {
  return cart
    .map((line) =>
      line.key === key ? { ...line, qty: line.qty + delta } : line,
    )
    .filter((line) => line.qty > 0);
}

function cartToBillItems(cart: CartLine[]): BillItem[] {
  return cart.map((line) => ({
    id: line.id,
    name: line.name,
    price: roundMoney(line.price),
    qty: line.qty,
  }));
}

type MenuItemRowProps = {
  category: string;
  item: MenuItem;
  cart: CartLine[];
  onCartChange: (cart: CartLine[]) => void;
  searchQuery: string;
};

function MenuItemRow({
  category,
  item,
  cart,
  onCartChange,
  searchQuery,
}: MenuItemRowProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    () => new Set(),
  );

  const optionExtra = (item.options ?? []).reduce(
    (sum, option) =>
      selectedOptions.has(option.id) ? sum + option.extra_charge : sum,
    0,
  );
  const unitPrice = roundMoney(item.price + optionExtra);
  const optionSuffix =
    selectedOptions.size > 0
      ? (item.options ?? [])
          .filter((option) => selectedOptions.has(option.id))
          .map((option) => option.name)
          .join(", ")
      : "";
  const lineKey = buildBillItemId(
    category,
    item.id,
    optionSuffix ? [...selectedOptions].sort().join("-") : undefined,
  );
  const qty = getCartQty(cart, lineKey);
  const displayName = optionSuffix
    ? `${formatMenuItemName(item)} (${optionSuffix})`
    : formatMenuItemName(item);

  function syncQty(nextQty: number) {
    if (nextQty <= 0) {
      onCartChange(cart.filter((line) => line.key !== lineKey));
      return;
    }

    const existing = cart.find((line) => line.key === lineKey);
    if (existing) {
      onCartChange(
        cart.map((line) =>
          line.key === lineKey ? { ...line, qty: nextQty } : line,
        ),
      );
      return;
    }

    onCartChange(
      upsertCartLine(cart, {
        key: lineKey,
        id: lineKey,
        name: displayName,
        price: unitPrice,
        qty: nextQty,
      }),
    );
  }

  return (
    <div className="space-y-2 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium leading-snug">
            <MenuSearchHighlight
              text={formatMenuItemName(item)}
              query={searchQuery}
            />
          </p>
          {item.description_en ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              <MenuSearchHighlight
                text={item.description_en}
                query={searchQuery}
              />
            </p>
          ) : null}
          {item.allergens?.length ? (
            <p className="text-muted-foreground text-xs">
              Allergens: {item.allergens.join(", ")}
            </p>
          ) : null}
        </div>
        <EuroAmount amount={unitPrice} className="shrink-0 text-sm font-semibold" />
      </div>

      {item.options?.length ? (
        <div className="space-y-2">
          {item.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-start gap-2 text-sm"
            >
              <Checkbox
                checked={selectedOptions.has(option.id)}
                onCheckedChange={(checked) => {
                  setSelectedOptions((current) => {
                    const next = new Set(current);
                    if (checked) {
                      next.add(option.id);
                    } else {
                      next.delete(option.id);
                    }
                    return next;
                  });
                  if (qty > 0) {
                    onCartChange(cart.filter((line) => line.key !== lineKey));
                  }
                }}
              />
              <span>
                {option.name}{" "}
                <span className="text-muted-foreground">
                  (+{formatEuro(option.extra_charge)})
                </span>
              </span>
            </label>
          ))}
        </div>
      ) : null}

      <QtyControls
        qty={qty}
        onIncrement={() => syncQty(qty + 1)}
        onDecrement={() => syncQty(qty - 1)}
      />
    </div>
  );
}

type RecommendationRowProps = {
  item: RecommendationItem;
  cart: CartLine[];
  onCartChange: (cart: CartLine[]) => void;
  searchQuery: string;
};

function RecommendationRow({
  item,
  cart,
  onCartChange,
  searchQuery,
}: RecommendationRowProps) {
  return (
    <div className="space-y-3 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
      <div className="space-y-1">
        <p className="font-medium">
          <MenuSearchHighlight text={item.name} query={searchQuery} />
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <MenuSearchHighlight text={item.description_en} query={searchQuery} />
        </p>
      </div>
      <div className="space-y-2">
        {item.pricing.map((portion) => {
          const lineKey = buildBillItemId("recommendations", item.id, portion.id);
          const qty = getCartQty(cart, lineKey);

          return (
            <div
              key={portion.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  <MenuSearchHighlight
                    text={portion.portion}
                    query={searchQuery}
                  />
                </p>
                <EuroAmount amount={portion.price} className="text-sm" />
              </div>
              <QtyControls
                qty={qty}
                onIncrement={() =>
                  onCartChange(
                    upsertCartLine(cart, {
                      key: lineKey,
                      id: lineKey,
                      name: `${item.name} (${portion.portion})`,
                      price: portion.price,
                      qty: 1,
                    }),
                  )
                }
                onDecrement={() =>
                  onCartChange(changeCartQty(cart, lineKey, -1))
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

type MomoPickerProps = {
  cart: CartLine[];
  onCartChange: (cart: CartLine[]) => void;
  searchQuery: string;
};

function MomoPicker({ cart, onCartChange, searchQuery }: MomoPickerProps) {
  const { momo } = dalbhatMenu.menu;
  const [fillingId, setFillingId] = useState(momo.fillings[0]?.id ?? "vegan");
  const [styleId, setStyleId] = useState(momo.styles_and_pricing[0]?.id ?? "steamed");
  const [pieceCount, setPieceCount] = useState(
    momo.styles_and_pricing[0]?.prices[0]?.quantity ?? 6,
  );

  const selectedStyle = momo.styles_and_pricing.find(
    (style) => style.id === styleId,
  );
  const selectedFilling = momo.fillings.find(
    (filling) => filling.id === fillingId,
  );
  const selectedPrice = selectedStyle?.prices.find(
    (entry) => entry.quantity === pieceCount,
  );

  const lineKey = buildBillItemId(
    "momo",
    "momo",
    `${styleId}-${fillingId}-${pieceCount}`,
  );
  const orderQty = getCartQty(cart, lineKey);

  function syncOrderQty(nextQty: number) {
    if (!selectedStyle || !selectedFilling || !selectedPrice) {
      return;
    }

    if (nextQty <= 0) {
      onCartChange(cart.filter((line) => line.key !== lineKey));
      return;
    }

    const name = `Momo ${selectedStyle.style_en} (${pieceCount} pc) — ${selectedFilling.name}`;
    const existing = cart.find((line) => line.key === lineKey);

    if (existing) {
      onCartChange(
        cart.map((line) =>
          line.key === lineKey ? { ...line, qty: nextQty } : line,
        ),
      );
      return;
    }

    onCartChange(
      upsertCartLine(cart, {
        key: lineKey,
        id: lineKey,
        name,
        price: selectedPrice.price,
        qty: nextQty,
      }),
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        <MenuSearchHighlight text={momo.description} query={searchQuery} />
      </p>

      <div className="space-y-2">
        <Label>Filling</Label>
        <div className="flex flex-wrap gap-2">
          {momo.fillings.map((filling) => (
            <Button
              key={filling.id}
              type="button"
              size="sm"
              variant={fillingId === filling.id ? "default" : "outline"}
              onClick={() => {
                setFillingId(filling.id);
                if (orderQty > 0) {
                  onCartChange(cart.filter((line) => line.key !== lineKey));
                }
              }}
            >
              {filling.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Style</Label>
        <div className="space-y-2">
          {momo.styles_and_pricing.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                setStyleId(style.id);
                setPieceCount(style.prices[0]?.quantity ?? 6);
                if (orderQty > 0) {
                  onCartChange(cart.filter((line) => line.key !== lineKey));
                }
              }}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                styleId === style.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/40",
              )}
            >
              <p className="font-medium">
                <MenuSearchHighlight
                  text={`${style.style_de} / ${style.style_en}`}
                  query={searchQuery}
                />
              </p>
              {style.description_en ? (
                <p className="text-muted-foreground text-sm">
                  <MenuSearchHighlight
                    text={style.description_en}
                    query={searchQuery}
                  />
                </p>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {selectedStyle ? (
        <div className="space-y-2">
          <Label>Pieces per order</Label>
          <p className="text-muted-foreground text-xs">
            Choose 6 or 10 dumplings per portion. Use +/− below to order multiple
            portions of the same kind.
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedStyle.prices.map((entry) => (
              <Button
                key={entry.quantity}
                type="button"
                size="sm"
                variant={pieceCount === entry.quantity ? "default" : "outline"}
                onClick={() => {
                  setPieceCount(entry.quantity);
                  if (orderQty > 0) {
                    onCartChange(cart.filter((line) => line.key !== lineKey));
                  }
                }}
              >
                {entry.quantity} pc — {formatEuro(entry.price)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {selectedPrice
            ? `${pieceCount} pc · ${formatEuro(selectedPrice.price)} each`
            : "Select options above"}
        </p>
        <QtyControls
          qty={orderQty}
          onIncrement={() => syncOrderQty(orderQty + 1)}
          onDecrement={() => syncOrderQty(orderQty - 1)}
        />
      </div>
    </div>
  );
}

type DrinkRowProps = {
  category: string;
  item: DrinkItem;
  cart: CartLine[];
  onCartChange: (cart: CartLine[]) => void;
  searchQuery: string;
};

function DrinkRow({
  category,
  item,
  cart,
  onCartChange,
  searchQuery,
}: DrinkRowProps) {
  const [selectedSize, setSelectedSize] = useState(
    item.sizes?.[0]?.size ?? item.size ?? "default",
  );

  const sizeOptions = item.sizes
    ? item.sizes
    : item.size
      ? [{ size: item.size, price: item.price ?? 0 }]
      : [{ size: "default", price: item.price ?? 0 }];

  const activeSize =
    sizeOptions.find((entry) => entry.size === selectedSize) ?? sizeOptions[0];
  const variantKey =
    sizeOptions.length > 1 ? activeSize.size.replace(/\./g, "") : undefined;
  const lineKey = buildBillItemId(category, item.id, variantKey);
  const qty = getCartQty(cart, lineKey);
  const displayName =
    activeSize.size === "default"
      ? item.name
      : `${item.name} (${activeSize.size})`;

  function syncQty(nextQty: number) {
    if (nextQty <= 0) {
      onCartChange(cart.filter((line) => line.key !== lineKey));
      return;
    }

    const existing = cart.find((line) => line.key === lineKey);
    if (existing) {
      onCartChange(
        cart.map((line) =>
          line.key === lineKey ? { ...line, qty: nextQty } : line,
        ),
      );
      return;
    }

    onCartChange(
      upsertCartLine(cart, {
        key: lineKey,
        id: lineKey,
        name: displayName,
        price: activeSize.price,
        qty: nextQty,
      }),
    );
  }

  return (
    <div className="space-y-2 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium leading-snug">
            <MenuSearchHighlight text={item.name} query={searchQuery} />
          </p>
          {item.description ? (
            <p className="text-muted-foreground text-sm">
              <MenuSearchHighlight text={item.description} query={searchQuery} />
            </p>
          ) : null}
          {item.producer ? (
            <p className="text-muted-foreground text-sm">
              <MenuSearchHighlight text={item.producer} query={searchQuery} />
            </p>
          ) : null}
        </div>
        <EuroAmount
          amount={activeSize.price}
          className="shrink-0 text-sm font-semibold"
        />
      </div>

      {sizeOptions.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((entry) => (
            <Button
              key={entry.size}
              type="button"
              size="sm"
              variant={selectedSize === entry.size ? "default" : "outline"}
              onClick={() => {
                setSelectedSize(entry.size);
                if (qty > 0) {
                  onCartChange(cart.filter((line) => line.key !== lineKey));
                }
              }}
            >
              {entry.size} — {formatEuro(entry.price)}
            </Button>
          ))}
        </div>
      ) : null}

      <QtyControls
        qty={qty}
        onIncrement={() => syncQty(qty + 1)}
        onDecrement={() => syncQty(qty - 1)}
      />
    </div>
  );
}

type EuroBreakdownProps = {
  lines: Array<{ label: string; amount: number }>;
  total: number;
};

function EuroBreakdown({ lines, total }: EuroBreakdownProps) {
  return (
    <dl className="space-y-2 text-sm">
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{line.label}</dt>
          <dd>
            <EuroAmount amount={line.amount} />
          </dd>
        </div>
      ))}
      <div className="border-border border-t pt-2">
        <div className="flex justify-between gap-3 text-base">
          <dt className="font-medium">Total</dt>
          <dd>
            <EuroAmount amount={total} className="font-semibold" />
          </dd>
        </div>
      </div>
    </dl>
  );
}

export function DalbhatBillForm() {
  const router = useRouter();
  const { circleMembers } = usePayerCircle();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MenuFilterId>("all");

  const filteredMenu = useMemo(
    () => filterDalbhatMenu(searchQuery, activeFilter),
    [searchQuery, activeFilter],
  );
  const menuIsFiltered = isMenuFiltered(searchQuery, activeFilter);

  const billItems = useMemo(() => cartToBillItems(cart), [cart]);
  const subtotal = useMemo(() => calculateSubtotal(billItems), [billItems]);
  const total = useMemo(
    () => calculateTotal(subtotal, tax, tip),
    [subtotal, tax, tip],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (billItems.length === 0) {
      setError("Add at least one menu item to continue.");
      return;
    }

    const payload = {
      items: billItems,
      totals: buildTotals(billItems, tax, tip),
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
      <PageShell withStickyFooter wide>
        <AppPageHeader
          title={dalbhatMenu.restaurant}
          description="Select items from the menu to create a split bill."
          icon={
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
              <UtensilsCrossed className="text-primary size-6" />
            </div>
          }
        />

        <StepIndicator steps={PAYER_STEPS} currentStep={1} />

        <MenuSearchFilter
          query={searchQuery}
          onQueryChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          resultCount={filteredMenu.resultCount}
        />

        <form id="dalbhat-bill-form" onSubmit={handleSubmit} className="space-y-4">
          {!filteredMenu.hasResults && menuIsFiltered ? (
            <EmptyState
              title="No menu items found"
              description="Try a different search term or category filter."
            />
          ) : null}

          {filteredMenu.kleine_teller_small_plates.length > 0 ? (
            <SectionCard
              title={CATEGORY_LABELS.kleine_teller_small_plates}
              id="small-plates"
            >
              <div className="space-y-4">
                {filteredMenu.kleine_teller_small_plates.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    category="kleine_teller"
                    item={item}
                    cart={cart}
                    onCartChange={setCart}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </SectionCard>
          ) : null}

          {filteredMenu.recommendations.length > 0 ? (
            <SectionCard
              title={CATEGORY_LABELS.recommendations}
              id="recommendations"
            >
              {filteredMenu.recommendations.map((item) => (
                <RecommendationRow
                  key={item.id}
                  item={item}
                  cart={cart}
                  onCartChange={setCart}
                  searchQuery={searchQuery}
                />
              ))}
            </SectionCard>
          ) : null}

          {filteredMenu.classics.length > 0 ? (
            <SectionCard title={CATEGORY_LABELS.classics} id="classics">
              <div className="space-y-4">
                {filteredMenu.classics.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    category="classics"
                    item={item}
                    cart={cart}
                    onCartChange={setCart}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </SectionCard>
          ) : null}

          {filteredMenu.dalbhat.length > 0 ? (
            <SectionCard title={CATEGORY_LABELS.dalbhat} id="dalbhat">
              <div className="space-y-4">
                {filteredMenu.dalbhat.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    category="dalbhat"
                    item={item}
                    cart={cart}
                    onCartChange={setCart}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </SectionCard>
          ) : null}

          {filteredMenu.showMomo ? (
            <SectionCard title="Momo" id="momo">
              <MomoPicker
                cart={cart}
                onCartChange={setCart}
                searchQuery={searchQuery}
              />
            </SectionCard>
          ) : null}

          {filteredMenu.desserts.length > 0 ? (
            <SectionCard title={CATEGORY_LABELS.desserts} id="desserts">
              <div className="space-y-4">
                {filteredMenu.desserts.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    category="desserts"
                    item={item}
                    cart={cart}
                    onCartChange={setCart}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </SectionCard>
          ) : null}

          {filteredMenu.extras.length > 0 ? (
            <SectionCard title={CATEGORY_LABELS.extras} id="extras">
              <div className="space-y-4">
                {filteredMenu.extras.map((item) => {
                  const lineKey = buildBillItemId("extras", item.id);
                  const qty = getCartQty(cart, lineKey);
                  const name = formatExtraName(item);

                  return (
                    <div
                      key={item.id}
                      className="space-y-2 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium">
                            <MenuSearchHighlight text={name} query={searchQuery} />
                          </p>
                          {item.note ? (
                            <p className="text-muted-foreground text-sm">
                              <MenuSearchHighlight
                                text={item.note}
                                query={searchQuery}
                              />
                            </p>
                          ) : null}
                        </div>
                        <EuroAmount
                          amount={item.price}
                          className="shrink-0 text-sm font-semibold"
                        />
                      </div>
                      <QtyControls
                        qty={qty}
                        onIncrement={() =>
                          setCart(
                            upsertCartLine(cart, {
                              key: lineKey,
                              id: lineKey,
                              name,
                              price: item.price,
                              qty: 1,
                            }),
                          )
                        }
                        onDecrement={() =>
                          setCart(changeCartQty(cart, lineKey, -1))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ) : null}

          {Object.entries(filteredMenu.drinks).map(([categoryKey, drinks]) => (
            <SectionCard
              key={categoryKey}
              title={DRINK_CATEGORY_LABELS[categoryKey] ?? categoryKey}
              id={`drinks-${categoryKey}`}
            >
              <div className="space-y-4">
                {drinks.map((item) => (
                  <DrinkRow
                    key={item.id}
                    category={`drinks/${categoryKey}`}
                    item={item}
                    cart={cart}
                    onCartChange={setCart}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </SectionCard>
          ))}

          {cart.length > 0 ? (
            <SectionCard title="Your order" highlight>
              <div className="space-y-3">
                {cart.map((line) => (
                  <div
                    key={line.key}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{line.name}</p>
                      <p className="text-muted-foreground">
                        {line.qty} × {formatEuro(line.price)}
                      </p>
                    </div>
                    <EuroAmount
                      amount={roundMoney(line.price * line.qty)}
                      className="font-semibold"
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <ParticipantListEditor
            participants={participants}
            onChange={setParticipants}
            circleMembers={circleMembers}
          />

          <SectionCard title="Tax & tip">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dalbhat-tax">Tax</Label>
                <NumericInput
                  id="dalbhat-tax"
                  value={tax}
                  onChange={setTax}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dalbhat-tip">Tip</Label>
                <NumericInput
                  id="dalbhat-tip"
                  value={tip}
                  onChange={setTip}
                />
              </div>
            </div>
            <EuroBreakdown
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
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2 px-4">
          {cart.length > 0 ? (
            <p className="text-muted-foreground text-center text-sm">
              {cart.reduce((sum, line) => sum + line.qty, 0)} items ·{" "}
              <EuroAmount amount={total} className="font-semibold" />
            </p>
          ) : null}
          <Button
            type="submit"
            form="dalbhat-bill-form"
            size="lg"
            className="w-full"
            disabled={isSubmitting || cart.length === 0}
          >
            {isSubmitting ? "Creating bill…" : "Continue to payment"}
          </Button>
        </div>
      </StickyActionBar>
    </>
  );
}
