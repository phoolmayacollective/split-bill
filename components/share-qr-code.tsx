"use client";

import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

import { cn } from "@/lib/utils";

type ShareQrCodeProps = {
  value: string;
  className?: string;
};

export function ShareQrCode({ value, className }: ShareQrCodeProps) {
  if (!value) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
        <QrCode className="size-3.5" aria-hidden />
        Scan to open
      </p>
      <div
        className="bg-card border-border mx-auto w-fit rounded-xl border p-4 shadow-card"
        role="img"
        aria-label="QR code for share link"
      >
        <QRCode
          value={value}
          size={168}
          level="M"
          bgColor="transparent"
          fgColor="currentColor"
          className="text-foreground"
        />
      </div>
    </div>
  );
}
