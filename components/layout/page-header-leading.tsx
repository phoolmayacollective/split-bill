import { BackLink } from "@/components/layout/back-link";
import { SiteBrandLink } from "@/components/layout/site-brand-link";

type PageHeaderLeadingProps = {
  backHref?: string;
  backLabel?: string;
};

export function PageHeaderLeading({
  backHref,
  backLabel,
}: PageHeaderLeadingProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SiteBrandLink />
      {backHref ? <BackLink href={backHref} label={backLabel} /> : null}
    </div>
  );
}
