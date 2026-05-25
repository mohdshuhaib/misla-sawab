import { CheckCircle2, CircleDashed } from "lucide-react";

import type { KhatamState } from "@/lib/majlis/khatam";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type KhatamProgressProps = {
  khatam: KhatamState;
};

export function KhatamProgress({ khatam }: KhatamProgressProps) {
  const selectedCount = khatam.contributions.length;
  const percentage = Math.round((selectedCount / 30) * 100);
  const completed = khatam.status === "completed" || selectedCount >= 30;

  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-emerald-900 dark:bg-slate-950/40">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <CircleDashed className="h-5 w-5 text-emerald-600" />
            )}

            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
              ഖത്തം {khatam.khatam_number}
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {selectedCount} / 30 ജുസ് തിരഞ്ഞെടുക്കപ്പെട്ടു
          </p>
        </div>

        <Badge
          variant={completed ? "default" : "outline"}
          className={
            completed
              ? "rounded-full bg-emerald-600 px-4 py-2 text-white"
              : "rounded-full border-emerald-200 px-4 py-2 text-emerald-800 dark:border-emerald-800 dark:text-emerald-100"
          }
        >
          {completed ? "പൂർത്തിയായി" : `${percentage}% പൂർത്തിയായി`}
        </Badge>
      </div>

      <Progress value={percentage} className="h-3 rounded-full" />

      {completed ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          അൽഹംദുലില്ലാഹ്. ഈ ഖത്തം പൂർത്തിയായി. പുതിയ ഖത്തം സൃഷ്ടിച്ച്
          തുടർന്നും പങ്കെടുക്കാം.
        </p>
      ) : null}
    </div>
  );
}