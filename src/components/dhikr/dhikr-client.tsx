"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Loader2,
  MessageCircleHeart,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  addDhikrContribution,
  getDhikrState,
  type DhikrState,
} from "@/lib/majlis/dhikr";
import { useMajlisRealtime } from "@/hooks/use-majlis-realtime";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NameAutocomplete } from "@/components/majlis/name-autocomplete";

type DhikrClientProps = {
  roomId: string;
  slug: string;
  title: string;
  forWhom: string;
};

const predefinedDhikr = [
  "La ilaha illallah",
  "Allahumma salli ala Muhammed ya Rabbi salli alaihiva sallim",
];

const quickCounts = [100, 300, 500, 1000, 5000];

export function DhikrClient({
  roomId,
  slug,
  title,
  forWhom,
}: DhikrClientProps) {
  const [dhikrState, setDhikrState] = useState<DhikrState | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [selectedDhikr, setSelectedDhikr] = useState(predefinedDhikr[0]);
  const [count, setCount] = useState("100");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDhikr = useCallback(async () => {
    try {
      const state = await getDhikrState(roomId);
      setDhikrState(state);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ദിക്റ് വിവരങ്ങൾ ലഭിച്ചില്ല";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadDhikr();
  }, [loadDhikr]);

  useMajlisRealtime({
    roomId,
    tables: ["dhikr_contributions"],
    onChange: loadDhikr,
  });

  const finalDhikrType = useMemo(() => {
    return selectedDhikr.trim();
  }, [selectedDhikr]);

  async function submitDhikr() {
    const numericCount = Number.parseInt(count, 10);

    if (displayName.trim().length < 2) {
      toast.error("പേര് ശരിയായി നൽകുക");
      return;
    }

    if (finalDhikrType.length < 2) {
      toast.error("ദിക്റ് / അദ്കാർ തരം നൽകുക");
      return;
    }

    if (!Number.isFinite(numericCount) || numericCount <= 0) {
      toast.error("എണ്ണം ശരിയായി നൽകുക");
      return;
    }

    try {
      setIsSubmitting(true);

      await addDhikrContribution({
        roomId,
        displayName,
        dhikrType: finalDhikrType,
        count: numericCount,
      });

      toast.success("ദിക്റ് സംഭാവന രേഖപ്പെടുത്തി");
      setCount("100");
      await loadDhikr();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ദിക്റ് സംഭാവന രേഖപ്പെടുത്താൻ കഴിഞ്ഞില്ല";

      toast.error(message);
      await loadDhikr();
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
                <MessageCircleHeart className="h-4 w-4" />
                ദിക്റ് / അദ്കാർ മജ്ലിസ്
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
                നിങ്ങൾ ചൊല്ലിയ ദിക്റ് / അദ്കാർ തരം തിരഞ്ഞെടുക്കുക, എണ്ണം നൽകുക,
                തുടർന്ന് നിങ്ങളുടെ പേരിൽ സംഭാവന രേഖപ്പെടുത്തുക.
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
                  ദിക്റ് വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Heart}
            label="മൊത്തം ദിക്റ് എണ്ണം"
            value={dhikrState?.totalCount || 0}
          />

          <StatCard
            icon={UserRound}
            label="സംഭാവനകൾ"
            value={dhikrState?.totalContributions || 0}
          />

          <StatCard
            icon={Sparkles}
            label="ദിക്റ് തരങ്ങൾ"
            value={dhikrState?.dhikrTypeStats.length || 0}
          />
        </div>

        <Card className="glass-card rounded-[2rem] border-emerald-100">
          <CardContent className="space-y-6 p-5 sm:p-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
                നിങ്ങളുടെ ദിക്റ് സംഭാവന രേഖപ്പെടുത്തുക
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                പേര് autocomplete ഉപയോഗിച്ച് പഴയ contributor-നെ തിരഞ്ഞെടുക്കാം.
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
                Dhikr / Adhkar type
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {predefinedDhikr.map((dhikr) => (
                  <button
                    key={dhikr}
                    type="button"
                    onClick={() => setSelectedDhikr(dhikr)}
                    className={cn(
                      "min-h-14 break-words rounded-2xl border px-4 py-3 text-left text-sm font-semibold whitespace-normal transition",
                      selectedDhikr === dhikr
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        : "border-emerald-100 bg-white/80 text-emerald-950 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-950/40 dark:text-emerald-50 dark:hover:bg-emerald-950/40"
                    )}
                  >
                    {dhikr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                എണ്ണം
              </label>

              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={count}
                onChange={(event) => setCount(event.target.value)}
                placeholder="100"
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
                    {finalDhikrType || "ദിക്റ് തിരഞ്ഞെടുക്കുക"} ×{" "}
                    {Number(count || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                  onClick={submitDhikr}
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

        <DhikrTypeStatsList state={dhikrState} />

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={loadDhikr}
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
  icon: typeof Heart;
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

function DhikrTypeStatsList({ state }: { state: DhikrState | null }) {
  const dhikrTypes = state?.dhikrTypeStats || [];

  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <CardContent className="p-5">
        <div className="mb-4">
          <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
            ദിക്റ് / അദ്കാർ തരം അനുസരിച്ചുള്ള കണക്ക്
          </h2>
          <p className="text-sm text-muted-foreground">
            ഓരോ ദിക്റിന്റെയും മൊത്തം എണ്ണം
          </p>
        </div>

        {dhikrTypes.length === 0 ? (
          <p className="rounded-3xl bg-emerald-50 p-4 text-sm text-muted-foreground dark:bg-emerald-950/40">
            ഇതുവരെ ദിക്റ് തരം കണക്കുകൾ ലഭ്യമല്ല.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dhikrTypes.map((item) => (
              <div
                key={item.dhikr_type}
                className="rounded-3xl border border-emerald-100 bg-white/70 p-4 dark:border-emerald-900 dark:bg-slate-950/40"
              >
                <p className="line-clamp-2 min-h-10 font-bold text-emerald-950 dark:text-emerald-50">
                  {item.dhikr_type}
                </p>

                <p className="mt-3 text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {item.total_count.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {item.contribution_count} contributions
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
