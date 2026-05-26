"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookHeart,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  addSurahRecitation,
  getSurahState,
  type SurahActivityType,
  type SurahState,
} from "@/lib/majlis/surah";
import { useMajlisRealtime } from "@/hooks/use-majlis-realtime";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NameAutocomplete } from "@/components/majlis/name-autocomplete";

type SurahClientProps = {
  roomId: string;
  slug: string;
  title: string;
  forWhom: string;
  activityType: SurahActivityType;
};

const quickCounts = [1, 3, 5, 7, 10, 11, 41, 100];

const surahConfig = {
  yaseen: {
    pageBadge: "സൂറത്ത് യാസീൻ പാരായണ മജ്ലിസ്",
    heading: "സൂറത്ത് യാസീൻ",
    description:
      "നിങ്ങൾ പാരായണം ചെയ്ത സൂറത്ത് യാസീൻ എണ്ണം നിങ്ങളുടെ പേരിൽ രേഖപ്പെടുത്തുക.",
    totalLabel: "മൊത്തം യാസീൻ പാരായണം",
    submitSuccess: "സൂറത്ത് യാസീൻ പാരായണം രേഖപ്പെടുത്തി",
    placeholder: "ഉദാ: 1",
    icon: BookHeart,
  },
  fathiha: {
    pageBadge: "Fathiha + Ikhlas + Falaq + Naas Recitation Majlis",
    heading: "Fathiha + Ikhlas + Falaq + Naas",
    description:
      "Record the number of Fathiha + Ikhlas + Falaq + Naas recitations under your name.",
    totalLabel: "Total Fathiha + Ikhlas + Falaq + Naas Recitations",
    submitSuccess: "Fathiha + Ikhlas + Falaq + Naas recitation recorded",
    placeholder: "Example: 11",
    icon: Sparkles,
  },
} as const;

export function SurahClient({
  roomId,
  slug,
  title,
  forWhom,
  activityType,
}: SurahClientProps) {
  const config = surahConfig[activityType];
  const PageIcon = config.icon;

  const [surahState, setSurahState] = useState<SurahState | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [count, setCount] = useState(activityType === "fathiha" ? "11" : "1");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const realtimeTables = useMemo(() => ["simple_recitations"] as const, []);

  const loadSurah = useCallback(async () => {
    try {
      const state = await getSurahState({
        roomId,
        activityType,
      });

      setSurahState(state);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "പാരായണ വിവരങ്ങൾ ലഭിച്ചില്ല";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, activityType]);

  useEffect(() => {
    loadSurah();
  }, [loadSurah]);

  useMajlisRealtime({
    roomId,
    tables: [...realtimeTables],
    onChange: loadSurah,
  });

  async function submitRecitation() {
    const numericCount = Number.parseInt(count, 10);

    if (displayName.trim().length < 2) {
      toast.error("പേര് ശരിയായി നൽകുക");
      return;
    }

    if (!Number.isFinite(numericCount) || numericCount <= 0) {
      toast.error("എണ്ണം ശരിയായി നൽകുക");
      return;
    }

    try {
      setIsSubmitting(true);

      await addSurahRecitation({
        roomId,
        activityType,
        displayName,
        count: numericCount,
      });

      toast.success(config.submitSuccess);
      setCount(activityType === "fathiha" ? "11" : "1");

      await loadSurah();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "പാരായണം രേഖപ്പെടുത്താൻ കഴിഞ്ഞില്ല";

      toast.error(message);
      await loadSurah();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="safe-container py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button
          asChild
          variant="ghost"
          className="rounded-full text-emerald-800 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-emerald-950"
        >
          <Link href={`/m/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            മജ്ലിസിലേക്ക് മടങ്ങുക
          </Link>
        </Button>

        <Card className="glass-card overflow-hidden rounded-[2.25rem] border-emerald-100">
          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-700/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
                <PageIcon className="h-4 w-4" />
                {config.pageBadge}
              </div>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-4xl lg:text-5xl">
                {title}
              </h1>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4 dark:border-emerald-900 dark:bg-slate-950/30">
                  <p className="text-sm text-muted-foreground">ആർക്കുവേണ്ടി</p>
                  <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-50">
                    {forWhom}
                  </p>
                </div>

              </div>

              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
                {config.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="glass-card rounded-[2rem]">
            <CardContent className="flex min-h-56 items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                <p className="mt-3 text-muted-foreground">
                  പാരായണ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={PageIcon}
            label={config.totalLabel}
            value={surahState?.totalCount || 0}
          />

          <StatCard
            icon={UserRound}
            label="സംഭാവനകൾ"
            value={surahState?.totalContributions || 0}
          />

          <StatCard
            icon={HeartHandshake}
            label="സംഭാവകർ"
            value={surahState?.contributorStats.length || 0}
          />
        </div>

        <Card className="glass-card rounded-[2rem] border-emerald-100">
          <CardContent className="space-y-6 p-5 sm:p-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
                {config.heading} പാരായണം രേഖപ്പെടുത്തുക
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                നിങ്ങളുടെ പേര് നൽകി പാരായണ എണ്ണം രേഖപ്പെടുത്തുക.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                നിങ്ങളുടെ പേര്
              </label>

              <NameAutocomplete
                value={displayName}
                onChange={setDisplayName}
                placeholder="ഉദാ: Shuhaib"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                പാരായണ എണ്ണം
              </label>

              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={count}
                onChange={(event) => setCount(event.target.value)}
                placeholder={config.placeholder}
                className="h-13 rounded-2xl border-emerald-200 bg-white/80 text-base dark:border-emerald-900 dark:bg-slate-950/50"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {quickCounts.map((quickCount) => (
                  <Button
                    key={quickCount}
                    type="button"
                    variant="outline"
                    className="rounded-full border-emerald-200 bg-white/70 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
                    onClick={() => setCount(String(quickCount))}
                  >
                    {quickCount.toLocaleString("en-IN")}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected</p>
                  <p className="font-bold text-emerald-950 dark:text-emerald-50">
                    {config.heading} × {Number(count || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                  onClick={submitRecitation}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      രേഖപ്പെടുത്തുന്നു...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      സംഭാവന രേഖപ്പെടുത്തുക
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={loadSurah}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </main>
  );
}

type StatCardProps = {
  icon: typeof Sparkles;
  label: string;
  value: number;
};

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <CardContent className="p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
          <Icon className="h-5 w-5" />
        </div>

        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-black text-emerald-950 dark:text-emerald-50">
          {value.toLocaleString("en-IN")}
        </p>
      </CardContent>
    </Card>
  );
}

