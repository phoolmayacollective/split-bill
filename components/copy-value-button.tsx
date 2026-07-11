"use client";

import { CopyField } from "@/components/feedback/copy-field";

type CopyValueButtonProps = {
  value: string;
  label: string;
};

/** @deprecated Use CopyField variant="button" directly */
export function CopyValueButton({ value, label }: CopyValueButtonProps) {
  return <CopyField value={value} label={label} variant="button" />;
}
