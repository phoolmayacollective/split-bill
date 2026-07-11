import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({
  className,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "border-input bg-background accent-primary focus-visible:border-ring focus-visible:ring-ring/50 size-5 shrink-0 cursor-pointer rounded border shadow-xs transition-shadow outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      {...props}
    />
  );
}
