import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SiteBrandLinkProps = {
  className?: string;
};

export function SiteBrandLink({ className }: SiteBrandLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "hover:text-foreground text-foreground inline-flex items-center gap-2 text-sm font-semibold transition-colors",
        className,
      )}
    >
      <Image
        src="/icon.png"
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-lg shadow-sm"
        aria-hidden
      />
      Split Bill
    </Link>
  );
}
