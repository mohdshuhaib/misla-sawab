import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  HeartHandshake,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { ActivityType } from "@/lib/majlis/get-majlis";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PublicActivityGridProps = {
  slug: string;
  enabledActivities: ActivityType[];
};

const activityCards: {
  type: ActivityType;
  titleKey: string;
  descriptionKey: string;
  href: (slug: string) => string;
  icon: typeof BookOpen;
}[] = [
  {
    type: "khatmul_quran",
    titleKey: "khatmulQuran",
    descriptionKey: "khatmulQuranCardDescription",
    href: (slug) => `/m/${slug}/khatmul-quran`,
    icon: BookOpen,
  },
  {
    type: "dhikr",
    titleKey: "dhikr",
    descriptionKey: "dhikrCardDescription",
    href: (slug) => `/m/${slug}/dhikr`,
    icon: MessageCircleHeart,
  },
  {
    type: "yaseen",
    titleKey: "yaseen",
    descriptionKey: "yaseenCardDescription",
    href: (slug) => `/m/${slug}/surah-yaseen`,
    icon: HeartHandshake,
  },
  {
    type: "fathiha",
    titleKey: "fathiha",
    descriptionKey: "fathihaCardDescription",
    href: (slug) => `/m/${slug}/surah-fathiha`,
    icon: Sparkles,
  },
];

export async function PublicActivityGrid({
  slug,
  enabledActivities,
}: PublicActivityGridProps) {
  const t = await getTranslations("activities");
  const visibleCards = activityCards.filter((card) =>
    enabledActivities.includes(card.type)
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visibleCards.map((activity) => {
        const Icon = activity.icon;

        return (
          <Card
            key={activity.type}
            className="glass-card group overflow-hidden rounded-[2rem] transition hover:-translate-y-1 hover:shadow-xl"
          >
            <CardContent className="p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-900 dark:text-emerald-100">
                  <Icon className="h-6 w-6" />
                </div>

                <ArrowRight className="mt-3 h-5 w-5 text-emerald-700 transition group-hover:translate-x-1 dark:text-emerald-300" />
              </div>

              <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
                {t(activity.titleKey)}
              </h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                {t(activity.descriptionKey)}
              </p>

              <Button
                asChild
                className="mt-5 h-12 w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Link href={activity.href(slug)}>{t("participate")}</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Card className="glass-card rounded-[2rem] border-dashed border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-5">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
            <BarChart3 className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
            {t("majlisStats")}
          </h2>

          <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
            {t("majlisStatsDescription")}
          </p>

          <Button
            asChild
            variant="outline"
            className="mt-5 h-12 w-full rounded-full"
          >
            <Link href={`/m/${slug}/stats`}>{t("viewStats")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
