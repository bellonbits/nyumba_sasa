"use client";

import { cn } from "@/lib/utils";

type FilterOption = { label: string; value: string };

interface FilterChipsProps {
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FilterChips({ options, selected, onChange, className }: FilterChipsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-none pb-1", className)}>
      {options.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 select-none",
            selected === value
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-[#FF6A00] hover:text-[#FF6A00]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
