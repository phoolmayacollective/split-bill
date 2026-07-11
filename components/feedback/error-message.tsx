import { cn } from "@/lib/utils";

type ErrorMessageProps = {
  message: string;
  className?: string;
  centered?: boolean;
};

export function ErrorMessage({
  message,
  className,
  centered = false,
}: ErrorMessageProps) {
  return (
    <p
      className={cn(
        "text-destructive text-sm",
        centered && "text-center",
        className,
      )}
      role="alert"
    >
      {message}
    </p>
  );
}
