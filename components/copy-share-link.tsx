"use client";

import { CopyField } from "@/components/feedback/copy-field";

type CopyShareLinkProps = {
  shareUrl: string;
};

/** @deprecated Use CopyField directly */
export function CopyShareLink({ shareUrl }: CopyShareLinkProps) {
  return <CopyField value={shareUrl} label="Share link" allowShare />;
}
