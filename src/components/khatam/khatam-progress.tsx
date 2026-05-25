import { CheckCircle2, CircleDashed } from "lucide-react";

import type { KhatamState } from "@/lib/majlis/khatam";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type KhatamProgressProps = {
  khatam: KhatamState;
};

export function KhatamProgress({ khatam }: KhatamProgressProps) {
  const reservedCount = khatam.contributions.length;
  const completedCount = khatam.contributions.filter(
    (item) => item.status === "completed"
  ).length;

  const reservedPercentage = Math.round((reservedCount / 30) * 100);
  const completedPercentage = Math.round((completedCount / 30) * 100);

  const completed = khatam.status === "completed" || completedCount >= 30;

  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <CircleDashed className="h-5 w-5 text-emerald-600" />
            )}

            <h2 className="text-xl font-black text-emerald-950">
              ഖത്തം {khatam.khatam_number}
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Reserved: {reservedCount} / 30 · Completed: {completedCount} / 30
          </p>
        </div>

        <Badge
          variant={completed ? "default" : "outline"}
          className={
            completed
              ? "rounded-full bg-emerald-600 px-4 py-2 text-white"
              : "rounded-full border-emerald-200 px-4 py-2 text-emerald-800"
          }
        >
          {completed ? "പൂർത്തിയായി" : `${completedPercentage}% completed`}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Reserved / Selected</span>
            <span>{reservedPercentage}%</span>
          </div>
          <Progress value={reservedPercentage} className="h-3 rounded-full" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Actually Completed</span>
            <span>{completedPercentage}%</span>
          </div>
          <Progress value={completedPercentage} className="h-3 rounded-full" />
        </div>
      </div>

      {completed ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          അൽഹംദുലില്ലാഹ്. ഈ ഖത്തം പാരായണം പൂർത്തിയായി. പുതിയ ഖത്തം സൃഷ്ടിച്ച്
          തുടർന്നും പങ്കെടുക്കാം.
        </p>
      ) : (
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          ശ്രദ്ധിക്കുക: ജുസ് തിരഞ്ഞെടുക്കുന്നത് reserve മാത്രമാണ്. പാരായണം
          പൂർത്തിയാക്കിയ ശേഷം completed ആയി mark ചെയ്യണം.
        </p>
      )}
    </div>
  );
}