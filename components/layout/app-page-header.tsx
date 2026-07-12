"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PageHeaderLeading } from "@/components/layout/page-header-leading";
import { PayerHeaderTrailing } from "@/components/layout/payer-header-trailing";
import { usePayerSession } from "@/components/payer-session-provider";

type AppPageHeaderProps = Omit<
  React.ComponentProps<typeof PageHeader>,
  "leading" | "trailing"
> & {
  backHref?: string;
  backLabel?: string;
  /** Override the default logged-in trailing slot */
  trailing?: React.ReactNode;
  /** When false, omit the home brand link (e.g. home page) */
  showHome?: boolean;
};

export function AppPageHeader({
  backHref,
  backLabel,
  trailing,
  showHome = true,
  ...pageHeaderProps
}: AppPageHeaderProps) {
  const { isLoggedIn, isLoading } = usePayerSession();

  const leading = showHome ? (
    <PageHeaderLeading backHref={backHref} backLabel={backLabel} />
  ) : undefined;

  const defaultTrailing =
    !isLoading && isLoggedIn ? <PayerHeaderTrailing /> : null;

  const resolvedTrailing = trailing !== undefined ? trailing : defaultTrailing;

  return (
    <PageHeader
      leading={leading}
      trailing={resolvedTrailing}
      {...pageHeaderProps}
    />
  );
}
