import { fuzzyMatch } from "@/lib/fuzzy-search";
import { cn } from "@/lib/utils";

type MenuSearchHighlightProps = {
  text: string;
  query: string;
  className?: string;
};

export function MenuSearchHighlight({
  text,
  query,
  className,
}: MenuSearchHighlightProps) {
  const { match, indices } = fuzzyMatch(text, query);

  if (!query.trim() || !match || indices.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const highlighted = new Set(indices);
  const parts: Array<{ text: string; highlight: boolean }> = [];
  let current = "";
  let currentHighlight = highlighted.has(0);

  for (let index = 0; index < text.length; index += 1) {
    const nextHighlight = highlighted.has(index);

    if (index > 0 && nextHighlight !== currentHighlight) {
      parts.push({ text: current, highlight: currentHighlight });
      current = "";
    }

    currentHighlight = nextHighlight;
    current += text[index];
  }

  if (current.length > 0) {
    parts.push({ text: current, highlight: currentHighlight });
  }

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark
            key={index}
            className={cn(
              "rounded-sm bg-primary/20 text-inherit",
              "dark:bg-primary/30",
            )}
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </span>
  );
}
