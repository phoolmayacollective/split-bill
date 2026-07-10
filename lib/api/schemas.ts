import { z } from "zod";

export const billIdSchema = z.uuid({ error: "Invalid bill id" });

export const billItemSchema = z.object({
  id: z.string().min(1, "Item id is required"),
  name: z.string().trim().min(1, "Item name is required"),
  price: z.number().nonnegative("Item price must be zero or greater"),
  qty: z.number().positive("Item quantity must be greater than zero"),
});

export const billTotalsSchema = z.object({
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  tip: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const createBillSchema = z.object({
  items: z.array(billItemSchema).min(1, "At least one item is required"),
  totals: billTotalsSchema,
});

export const claimInputSchema = z.object({
  item_id: z.string().min(1, "Item id is required"),
  share: z.number().positive("Share must be greater than zero").default(1),
});

export const createClaimsSchema = z
  .object({
    ower_name: z.string().trim().min(1, "Ower name is required"),
    claims: z.array(claimInputSchema).min(1, "At least one claim is required"),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();

    for (const [index, claim] of value.claims.entries()) {
      const key = `${value.ower_name}::${claim.item_id}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate claim for the same item",
          path: ["claims", index, "item_id"],
        });
      }
      seen.add(key);
    }
  });

export type CreateBillInput = z.infer<typeof createBillSchema>;
export type CreateClaimsInput = z.infer<typeof createClaimsSchema>;
