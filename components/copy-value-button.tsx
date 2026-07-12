"use client";

import { CopyField } from "@/components/feedback/copy-field";

type CopyValueButtonProps = {
  value: string;
  label: string;
  allowShare?: boolean;
  shareAs?: "url" | "text";
};

/** @deprecated Use CopyField variant="button" directly */
export function CopyValueButton({
  value,
  label,
  allowShare,
  shareAs,
}: CopyValueButtonProps) {
  return (
    <CopyField
      value={value}
      label={label}
      variant="button"
      allowShare={allowShare}
      shareAs={shareAs}
    />
  );
}
