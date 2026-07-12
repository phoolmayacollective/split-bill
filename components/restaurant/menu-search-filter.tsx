"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isMenuFiltered,
  MENU_FILTER_OPTIONS,
  type MenuFilterId,
} from "@/lib/restaurants/dalbhat-menu-search";
import { cn } from "@/lib/utils";

type MenuSearchFilterProps = {
  query: string;
  onQueryChange: (query: string) => void;
  activeFilter: MenuFilterId;
  onFilterChange: (filter: MenuFilterId) => void;
  resultCount: number;
};

export function MenuSearchFilter({
  query,
  onQueryChange,
  activeFilter,
  onFilterChange,
  resultCount,
}: MenuSearchFilterProps) {
  const filtered = isMenuFiltered(query, activeFilter);

  return (
    <div className="shadow-card sticky top-0 z-10 -mx-4 space-y-3 rounded-xl border bg-background/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85 sm:-mx-6 sm:px-6">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search menu…"
          className="h-11 pr-10 pl-9"
          aria-label="Search menu"
        />
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
          >
            <X />
          </Button>
        ) : null}
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Menu categories"
      >
        {MENU_FILTER_OPTIONS.map((option) => {
          const selected = activeFilter === option.id;

          return (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              className={cn("shrink-0", selected && "shadow-sm")}
              onClick={() => onFilterChange(option.id)}
              role="tab"
              aria-selected={selected}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      {filtered ? (
        <p className="text-muted-foreground text-xs">
          {resultCount === 0
            ? "No items match your search."
            : `${resultCount} item${resultCount === 1 ? "" : "s"} found`}
        </p>
      ) : null}
    </div>
  );
}
