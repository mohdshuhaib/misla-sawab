"use client";

import { useState } from "react";
import { BookOpen, HeartHandshake, MessageCircleHeart, Share2, Sparkles } from "lucide-react";

import type { ActivityType } from "@/lib/majlis/get-majlis";
import type { ShareActivityType } from "@/lib/share/messages";

import { Button } from "@/components/ui/button";
import { ShareMajlisModal } from "@/components/majlis/share-majlis-modal";

type ShareButtonGroupProps = {
  enabledActivities: ActivityType[];
  slug: string;
  forWhom: string;
  purpose: string;
};

const shareOptions: {
  type: ShareActivityType;
  label: string;
  activityType?: ActivityType;
  icon: typeof Share2;
}[] = [
  {
    type: "full",
    label: "Full Majlis",
    icon: Share2,
  },
  {
    type: "khatmul_quran",
    activityType: "khatmul_quran",
    label: "Khatmul Qur’an",
    icon: BookOpen,
  },
  {
    type: "dhikr",
    activityType: "dhikr",
    label: "Dhikr / Adhkar",
    icon: MessageCircleHeart,
  },
  {
    type: "yaseen",
    activityType: "yaseen",
    label: "Surah Ya-Sin",
    icon: HeartHandshake,
  },
  {
    type: "fathiha",
    activityType: "fathiha",
    label: "Surah Al-Fatihah",
    icon: Sparkles,
  },
];

export function ShareButtonGroup({
  enabledActivities,
  slug,
  forWhom,
  purpose,
}: ShareButtonGroupProps) {
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
              Share Majlis
            </p>
            <p className="text-sm text-muted-foreground">
              Malayalam message തയ്യാറാക്കി WhatsApp-ൽ share ചെയ്യാം.
            </p>
          </div>

          <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100 sm:flex">
            <Share2 className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleShareOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Button
                key={option.type}
                type="button"
                variant="outline"
                className="h-12 justify-start rounded-full border-emerald-200 bg-white/80 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
                onClick={() =>
                  setSelectedShare({
                    type: option.type,
                    label: option.label,
                  })
                }
              >
                <Icon className="mr-2 h-4 w-4" />
                Share {option.label}
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
          purpose={purpose}
        />
      ) : null}
    </>
  );
}