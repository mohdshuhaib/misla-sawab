"use client";

import { useEffect, useRef, useState } from "react";
import { Check, UserRound } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

type ContributorSuggestion = {
  id: string;
  display_name: string;
  normalized_name: string;
};

type NameAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function NameAutocomplete({
  value,
  onChange,
  placeholder = "നിങ്ങളുടെ പേര് നൽകുക",
}: NameAutocompleteProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [suggestions, setSuggestions] = useState<ContributorSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const normalizedValue = normalizeName(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);

        let query = supabase
          .from("contributors")
          .select("id, display_name, normalized_name")
          .order("created_at", { ascending: false })
          .limit(8);

        if (normalizedValue.length > 0) {
          query = query.ilike("normalized_name", `%${normalizedValue}%`);
        }

        const { data, error } = await query;

        if (error) {
          setSuggestions([]);
          return;
        }

        setSuggestions(data || []);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [normalizedValue]);

  const exactMatch = suggestions.some(
    (suggestion) => suggestion.normalized_name === normalizedValue
  );

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700 dark:text-emerald-300" />

        <Input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-13 rounded-2xl border-emerald-200 bg-white/80 pl-11 text-base dark:border-emerald-900 dark:bg-slate-950/50"
        />
      </div>

      {isOpen && (value.length > 0 || suggestions.length > 0) ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-2 shadow-xl shadow-emerald-950/10 dark:border-emerald-900 dark:bg-slate-950">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              പേരുകൾ തിരയുന്നു...
            </div>
          ) : null}

          {!isLoading && suggestions.length === 0 ? (
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                <UserRound className="h-4 w-4" />
              </span>

              <span>
                <span className="block text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                  പുതിയ പേര് ഉപയോഗിക്കുക
                </span>
                <span className="block text-xs text-muted-foreground">
                  {value}
                </span>
              </span>
            </button>
          ) : null}

          {suggestions.map((suggestion) => {
            const selected = suggestion.normalized_name === normalizedValue;

            return (
              <button
                key={suggestion.id}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950",
                  selected && "bg-emerald-50 dark:bg-emerald-950"
                )}
                onClick={() => {
                  onChange(suggestion.display_name);
                  setIsOpen(false);
                }}
              >
                <span>
                  <span className="block text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                    {suggestion.display_name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Saved contributor
                  </span>
                </span>

                {selected ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : null}
              </button>
            );
          })}

          {value.length >= 2 && !exactMatch ? (
            <button
              type="button"
              className="mt-1 flex w-full items-center gap-3 rounded-2xl border border-dashed border-emerald-200 px-4 py-3 text-left hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                <UserRound className="h-4 w-4" />
              </span>

              <span>
                <span className="block text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                  പുതിയ contributor ആയി ഉപയോഗിക്കുക
                </span>
                <span className="block text-xs text-muted-foreground">
                  {value}
                </span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}