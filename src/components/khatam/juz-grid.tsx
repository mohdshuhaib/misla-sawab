"use client";

import { Check, Lock } from "lucide-react";

import type { JuzContribution } from "@/lib/majlis/khatam";
import { cn } from "@/lib/utils";

type JuzGridProps = {
  contributions: JuzContribution[];
  selectedJuz: number[];
  disabled?: boolean;
  onToggleJuz: (juzNumber: number) => void;
};

export function JuzGrid({
  contributions,
  selectedJuz,
  disabled = false,
  onToggleJuz,
}: JuzGridProps) {
  const contributionMap = new Map(
    contributions.map((item) => [item.juz_number, item])
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: 30 }, (_, index) => {
        const juzNumber = index + 1;
        const contribution = contributionMap.get(juzNumber);
        const isTaken = Boolean(contribution);
        const isSelected = selectedJuz.includes(juzNumber);

        return (
          <button
            key={juzNumber}
            type="button"
            disabled={disabled || isTaken}
            onClick={() => onToggleJuz(juzNumber)}
            className={cn(
              "group min-h-24 rounded-3xl border p-3 text-left transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              isTaken &&
                "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100",
              !isTaken &&
                !isSelected &&
                "border-emerald-100 bg-white/80 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-950/40 dark:hover:bg-emerald-950/40",
              isSelected &&
                "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-black">Juz {juzNumber}</span>

              {isTaken ? (
                <Lock className="h-4 w-4" />
              ) : isSelected ? (
                <Check className="h-4 w-4" />
              ) : null}
            </div>

            <div className="mt-3 min-h-8">
              {isTaken ? (
                <p className="line-clamp-2 text-xs leading-5">
                  {contribution?.contributor_name}
                </p>
              ) : isSelected ? (
                <p className="text-xs leading-5 text-white/90">
                  തിരഞ്ഞെടുക്കപ്പെട്ടു
                </p>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  ലഭ്യമാണ്
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}