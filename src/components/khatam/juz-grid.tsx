"use client";

import { Check, Clock3, Lock } from "lucide-react";

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

        const isReserved = Boolean(contribution);
        const isCompleted = contribution?.status === "completed";
        const isPending = contribution?.status === "selected";
        const isSelectedNow = selectedJuz.includes(juzNumber);

        return (
          <button
            key={juzNumber}
            type="button"
            disabled={disabled || isReserved}
            onClick={() => onToggleJuz(juzNumber)}
            className={cn(
              "group min-h-28 rounded-3xl border p-3 text-left transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",

              !isReserved &&
                !isSelectedNow &&
                "border-emerald-100 bg-white/80 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50",

              isSelectedNow &&
                "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",

              isPending &&
                "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-950",

              isCompleted &&
                "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-950"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-black">Juz {juzNumber}</span>

              {isCompleted ? (
                <Check className="h-4 w-4 text-emerald-700" />
              ) : isPending ? (
                <Clock3 className="h-4 w-4 text-amber-700" />
              ) : isSelectedNow ? (
                <Check className="h-4 w-4" />
              ) : isReserved ? (
                <Lock className="h-4 w-4" />
              ) : null}
            </div>

            <div className="mt-3 min-h-12">
              {isCompleted ? (
                <>
                  <p className="line-clamp-1 text-xs font-semibold text-emerald-800">
                    Completed
                  </p>
                  <p className="line-clamp-2 text-xs leading-5">
                    {contribution?.contributor_name}
                  </p>
                </>
              ) : isPending ? (
                <>
                  <p className="line-clamp-1 text-xs font-semibold text-amber-800">
                    Reserved / Pending
                  </p>
                  <p className="line-clamp-2 text-xs leading-5">
                    {contribution?.contributor_name}
                  </p>
                </>
              ) : isSelectedNow ? (
                <p className="text-xs leading-5 text-white/90">
                  ഇപ്പോൾ select ചെയ്തു
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