import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const remove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== option));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-9 w-full items-start flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer text-left",
            className
          )}
          aria-expanded={open}
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground self-center py-0.5 flex-1">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap gap-1.5 flex-1">
              {value.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="text-xs h-5 pl-2 pr-1 gap-1 font-normal"
                >
                  {v}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => remove(v, e)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(value.filter(x => x !== v)); } }}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
                    aria-label={`Remove ${v}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                </Badge>
              ))}
            </span>
          )}
          <span className="flex items-center gap-1 self-center ml-auto pl-1 shrink-0">
            {value.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                onClick={clearAll}
                onKeyDown={(e) => { if (e.key === 'Enter') clearAll(e as any); }}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
                aria-label="Clear all"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            )}
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg"
        align="start"
        sideOffset={4}
      >
        {/* Search */}
        <div className="border-b border-border px-3 py-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Options */}
        <div className="max-h-56 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No results found.</p>
          ) : (
            filtered.map((option) => {
              const selected = value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    selected && "font-medium"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                    selected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                  )}>
                    {selected && <Check className="w-2.5 h-2.5" />}
                  </span>
                  {option}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {value.length > 0 && (
          <div className="border-t border-border px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{value.length} selected</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => { onChange([]); }}>
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
