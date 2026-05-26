"use client";

import { CheckCircle2, CircleDashed } from "lucide-react";
import { useTranslations } from "next-intl";

import type { KhatamState } from "@/lib/majlis/khatam";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type KhatamProgressProps = {
  khatam: KhatamState;
};

export function KhatamProgress({ khatam }: KhatamProgressProps) {
  const t = useTranslations("khatam");
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
              {t("khatamNumber", { number: khatam.khatam_number })}
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("reservedSummary", {
              reserved: reservedCount,
              completed: completedCount,
            })}
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
          {completed
            ? t("completed")
            : t("completedPercent", { percent: completedPercentage })}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("reservedSelected")}</span>
            <span>{reservedPercentage}%</span>
          </div>
          <Progress value={reservedPercentage} className="h-3 rounded-full" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("actuallyCompleted")}</span>
            <span>{completedPercentage}%</span>
          </div>
          <Progress value={completedPercentage} className="h-3 rounded-full" />
        </div>
      </div>

      <p
        className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${
          completed ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {completed ? t("completedMessage") : t("pendingMessage")}
      </p>
    </div>
  );
}
