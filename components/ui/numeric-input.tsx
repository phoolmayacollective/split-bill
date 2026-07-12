"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

type NumericInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: number;
  onChange: (value: number) => void;
  integer?: boolean;
  min?: number;
};

function isAllowedInput(text: string, integer: boolean): boolean {
  if (text === "") {
    return true;
  }

  if (integer) {
    return /^\d+$/.test(text);
  }

  return /^\d*\.?\d*$/.test(text);
}

function parseInput(text: string, integer: boolean, min: number): number {
  if (text === "" || text === ".") {
    return min;
  }

  const parsed = integer ? Number.parseInt(text, 10) : Number.parseFloat(text);
  if (Number.isNaN(parsed)) {
    return min;
  }

  return Math.max(min, parsed);
}

function formatForDisplay(
  value: number,
  integer: boolean,
  min: number,
): string {
  if (!integer && value === 0 && min === 0) {
    return "";
  }

  return integer ? String(Math.trunc(value)) : String(value);
}

function NumericInput({
  value,
  onChange,
  integer = false,
  min = 0,
  placeholder,
  onBlur,
  onFocus,
  ...props
}: NumericInputProps) {
  const [text, setText] = React.useState(() =>
    formatForDisplay(value, integer, min),
  );
  const focusedRef = React.useRef(false);

  React.useEffect(() => {
    if (!focusedRef.current) {
      setText(formatForDisplay(value, integer, min));
    }
  }, [value, integer, min]);

  const inputMode = integer ? "numeric" : "decimal";

  return (
    <Input
      {...props}
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      placeholder={placeholder ?? (integer ? "0" : "0.00")}
      value={text}
      onFocus={(event) => {
        focusedRef.current = true;
        onFocus?.(event);
      }}
      onBlur={(event) => {
        focusedRef.current = false;
        const parsed = parseInput(text, integer, min);
        setText(formatForDisplay(parsed, integer, min));
        onChange(parsed);
        onBlur?.(event);
      }}
      onChange={(event) => {
        const next = event.target.value;
        if (!isAllowedInput(next, integer)) {
          return;
        }

        setText(next);

        if (next === "" || next === ".") {
          return;
        }

        onChange(parseInput(next, integer, min));
      }}
    />
  );
}

export { NumericInput };
