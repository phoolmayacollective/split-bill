/**
 * Compare the total computed from parsed line items against the grand total
 * printed on the receipt. The printed total is the best available ground
 * truth — a mismatch usually means the scan missed or misread a line.
 */

const DEFAULT_TOLERANCE = 0.05;

export type TotalMismatch = {
  computedTotal: number;
  receiptTotal: number;
  difference: number;
};

export function reconcileTotals(
  computedTotal: number,
  receiptTotal: number | undefined,
  tolerance: number = DEFAULT_TOLERANCE,
): TotalMismatch | null {
  if (receiptTotal === undefined || receiptTotal <= 0 || computedTotal <= 0) {
    return null;
  }

  const difference = Math.abs(computedTotal - receiptTotal);

  if (difference <= tolerance) {
    return null;
  }

  return {
    computedTotal,
    receiptTotal,
    difference,
  };
}
