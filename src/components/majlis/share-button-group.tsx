"use client";

import { useState } from "react";
import { BookOpen, HeartHandshake, MessageCircleHeart, Share2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ActivityType } from "@/lib/majlis/get-majlis";
import type { ShareActivityType } from "@/lib/share/messages";

import { Button } from "@/components/ui/button";
import { ShareMajlisModal } from "@/components/majlis/share-majlis-modal";

type ShareButtonGroupProps = {
  enabledActivities: ActivityType[];
  slug: string;
  forWhom: string;
};

const shareOptions: {
  type: ShareActivityType;
  labelKey: string;
  activityType?: ActivityType;
  icon: typeof Share2;
}[] = [
  {
    type: "full",
    labelKey: "fullMajlis",
    icon: Share2,
  },
  {
    type: "khatmul_quran",
    activityType: "khatmul_quran",
    labelKey: "khatmulQuran",
    icon: BookOpen,
  },
  {
    type: "dhikr",
    activityType: "dhikr",
    labelKey: "dhikr",
    icon: MessageCircleHeart,
  },
  {
    type: "yaseen",
    activityType: "yaseen",
    labelKey: "yaseen",
    icon: HeartHandshake,
  },
  {
    type: "fathiha",
    activityType: "fathiha",
    labelKey: "fathiha",
    icon: Sparkles,
  },
];

export function ShareButtonGroup({
  enabledActivities,
  slug,
  forWhom,
}: ShareButtonGroupProps) {
  const share = useTranslations("share");
  const activities = useTranslations("activities");
  const [selectedShare, setSelectedShare] = useState<{
    type: ShareActivityType;
    label: string;
  } | null>(null);

  const visibleShareOptions = shareOptions.filter((option) => {
    if (option.type === "full") {
      return true;
    }

    return option.activityType
      ? enabledActivities.includes(option.activityType)
      : false;
  });

  return (
    <>
      <div className="rounded-[2rem] border border-emerald-100 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-emerald-900 dark:bg-slate-950/40">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-emerald-950 dark:text-emerald-50">
              {share("title")}
            </p>
            <p className="text-sm text-muted-foreground">
              {share("description")}
            </p>
          </div>

          <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100 sm:flex">
            <Share2 className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleShareOptions.map((option) => {
            const Icon = option.icon;
            const label =
              option.type === "full"
                ? share("fullMajlis")
                : activities(option.labelKey);

            return (
              <Button
                key={option.type}
                type="button"
                variant="outline"
                className="h-auto min-h-12 w-full justify-start rounded-2xl border-emerald-200 bg-white/80 px-4 py-3 text-left text-emerald-800 whitespace-normal hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
                onClick={() =>
                  setSelectedShare({
                    type: option.type,
                    label,
                  })
                }
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="min-w-0 wrap-break-word leading-5">
                  {share("shareButton", { label })}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {selectedShare ? (
        <ShareMajlisModal
          open={!!selectedShare}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedShare(null);
            }
          }}
          activityType={selectedShare.type}
          activityLabel={selectedShare.label}
          slug={slug}
          forWhom={forWhom}
        />
      ) : null}
    </>
  );
}
