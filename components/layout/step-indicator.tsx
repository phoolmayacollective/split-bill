import { cn } from "@/lib/utils";

type Step = {
  label: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
  className?: string;
};

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <nav
      aria-label="Progress"
      className={cn("w-full", className)}
    >
      <ol className="flex items-center gap-1">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={step.label} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-primary/25 ring-4",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? "✓" : stepNumber}
                </div>
                <span
                  className={cn(
                    "w-full truncate text-center text-[0.65rem] font-medium sm:text-xs",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-1 mb-5 h-0.5 min-w-2 flex-1 rounded-full",
                    isComplete ? "bg-primary/40" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
