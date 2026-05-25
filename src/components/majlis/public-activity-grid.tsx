import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  HeartHandshake,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";

import type { ActivityType } from "@/lib/majlis/get-majlis";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PublicActivityGridProps = {
  slug: string;
  enabledActivities: ActivityType[];
};

const activityCards: {
  type: ActivityType;
  title: string;
  description: string;
  href: (slug: string) => string;
  icon: typeof BookOpen;
}[] = [
  {
    type: "khatmul_quran",
    title: "ഖത്ത്മുൽ ഖുർആൻ",
    description: "നിങ്ങൾക്ക് പാരായണം ചെയ്യാൻ കഴിയുന്ന ജുസ് തിരഞ്ഞെടുക്കുക.",
    href: (slug) => `/m/${slug}/khatmul-quran`,
    icon: BookOpen,
  },
  {
    type: "dhikr",
    title: "ദിക്റ് / അദ്കാർ",
    description: "നിങ്ങൾ ചൊല്ലിയ ദിക്റും എണ്ണവും രേഖപ്പെടുത്തുക.",
    href: (slug) => `/m/${slug}/dhikr`,
    icon: MessageCircleHeart,
  },
  {
    type: "yaseen",
    title: "സൂറത്ത് യാസീൻ",
    description: "സൂറത്ത് യാസീൻ പാരായണ എണ്ണം രേഖപ്പെടുത്തുക.",
    href: (slug) => `/m/${slug}/surah-yaseen`,
    icon: HeartHandshake,
  },
  {
    type: "fathiha",
    title: "സൂറത്തുൽ ഫാത്തിഹ",
    description: "ഫാത്തിഹ പാരായണ എണ്ണം രേഖപ്പെടുത്തുക.",
    href: (slug) => `/m/${slug}/surah-fathiha`,
    icon: Sparkles,
  },
];

export function PublicActivityGrid({
  slug,
  enabledActivities,
}: PublicActivityGridProps) {
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
                {activity.title}
              </h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                {activity.description}
              </p>

              <Button
                asChild
                className="mt-5 h-12 w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Link href={activity.href(slug)}>ഇതിൽ പങ്കെടുക്കുക</Link>
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
            മജ്ലിസ് കണക്കുകൾ
          </h2>

          <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
            മൊത്തം സംഭാവകർ, ഖത്തം പുരോഗതി, ദിക്റ് എണ്ണം, പുതിയ പ്രവർത്തനങ്ങൾ കാണുക.
          </p>

          <Button
            asChild
            variant="outline"
            className="mt-5 h-12 w-full rounded-full"
          >
            <Link href={`/m/${slug}/stats`}>Stats കാണുക</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}