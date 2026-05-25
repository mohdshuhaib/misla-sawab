"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Heart,
  History,
  Loader2,
  MessageCircleHeart,
  RefreshCw,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  getMajlisStats,
  type MajlisStatsState,
  type RecentActivityItem,
  type TopContributorStat,
} from "@/lib/majlis/stats";
import { useMajlisRealtime, type RealtimeTable } from "@/hooks/use-majlis-realtime";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type StatsClientProps = {
  roomId: string;
  slug: string;
  title: string;
  forWhom: string;
  purpose: string;
};

export function StatsClient({
  roomId,
  slug,
  title,
  forWhom,
  purpose,
}: StatsClientProps) {
  const [stats, setStats] = useState<MajlisStatsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const realtimeTables = useMemo<RealtimeTable[]>(
    () => [
      "juz_contributions",
      "khatams",
      "dhikr_contributions",
      "simple_recitations",
    ],
    []
  );

  const loadStats = useCallback(async () => {
    try {
      const state = await getMajlisStats(roomId);
      setStats(state);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "കണക്കുകൾ ലഭിച്ചില്ല";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useMajlisRealtime({
    roomId,
    tables: realtimeTables,
    onChange: loadStats,
  });

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
                <BarChart3 className="h-4 w-4" />
                മജ്ലിസ് കണക്കുകൾ
              </div>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-4xl lg:text-5xl">
                {title}
              </h1>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoBox label="ആർക്കുവേണ്ടി" value={forWhom} />
                <InfoBox label="നിയ്യത്ത് / ഉദ്ദേശ്യം" value={purpose} />
              </div>

              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
                ഖത്ത്മുൽ ഖുർആൻ, സൂറത്ത് പാരായണം, ദിക്റ് / അദ്കാർ എന്നിവയുടെ
                മൊത്തം പുരോഗതിയും പുതിയ പ്രവർത്തനങ്ങളും ഇവിടെ കാണാം.
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
                  കണക്കുകൾ ലോഡ് ചെയ്യുന്നു...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            icon={UsersRound}
            label="മൊത്തം സംഭാവകർ"
            value={stats?.totalContributors || 0}
          />

          <StatsCard
            icon={CheckCircle2}
            label="പൂർത്തിയായ ഖത്തങ്ങൾ"
            value={stats?.totalCompletedKhatams || 0}
          />

          <StatsCard
            icon={BookOpen}
            label="മൊത്തം Juz തിരഞ്ഞെടുപ്പ്"
            value={stats?.totalJuzSelected || 0}
          />

          <StatsCard
            icon={MessageCircleHeart}
            label="മൊത്തം ദിക്റ്"
            value={stats?.totalDhikrCount || 0}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatsCard
            icon={Sparkles}
            label="മൊത്തം ഫാത്തിഹ"
            value={stats?.totalFathihaCount || 0}
          />

          <StatsCard
            icon={Heart}
            label="മൊത്തം യാസീൻ"
            value={stats?.totalYaseenCount || 0}
          />

          <CurrentKhatamCard stats={stats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TopContributorsCard contributors={stats?.topContributors || []} />
          <RecentActivityCard recentActivity={stats?.recentActivity || []} />
        </div>

        <CompletedKhatamHistoryCard stats={stats} />

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={loadStats}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </main>
  );
}

type InfoBoxProps = {
  label: string;
  value: string;
};

function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4 dark:border-emerald-900 dark:bg-slate-950/30">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-50">
        {value}
      </p>
    </div>
  );
}

type StatsCardProps = {
  icon: typeof UsersRound;
  label: string;
  value: number;
};

function StatsCard({ icon: Icon, label, value }: StatsCardProps) {
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

function CurrentKhatamCard({ stats }: { stats: MajlisStatsState | null }) {
  const current = stats?.currentKhatamProgress;

  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <CardContent className="p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
          {current?.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <CircleDashed className="h-5 w-5" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">Current Khatam Progress</p>

        {current ? (
          <>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="text-3xl font-black text-emerald-950 dark:text-emerald-50">
                {current.percentage}%
              </p>
              <Badge
                variant="outline"
                className="mb-1 rounded-full border-emerald-200 dark:border-emerald-800"
              >
                Khatam {current.khatam_number}
              </Badge>
            </div>

            <Progress value={current.percentage} className="mt-4 h-3" />

            <p className="mt-3 text-sm text-muted-foreground">
              {current.selected_juz_count} / 30 Juz selected
            </p>
          </>
        ) : (
          <p className="mt-1 text-3xl font-black text-emerald-950 dark:text-emerald-50">
            0%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TopContributorsCard({
  contributors,
}: {
  contributors: TopContributorStat[];
}) {
  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <Trophy className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
              Top Contributors
            </h2>
            <p className="text-sm text-muted-foreground">
              എല്ലാ പ്രവർത്തനങ്ങളും ചേർന്നുള്ള കണക്ക്
            </p>
          </div>
        </div>

        {contributors.length === 0 ? (
          <p className="rounded-3xl bg-emerald-50 p-4 text-sm text-muted-foreground dark:bg-emerald-950/40">
            ഇതുവരെ contributor stats ലഭ്യമല്ല.
          </p>
        ) : (
          <div className="space-y-3">
            {contributors.map((item, index) => (
              <div
                key={item.contributor_id}
                className="rounded-3xl border border-emerald-100 bg-white/70 p-4 dark:border-emerald-900 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-bold text-emerald-950 dark:text-emerald-50">
                        {item.contributor_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Activity score:{" "}
                        {item.total_activity_score.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <Badge className="rounded-full bg-emerald-600 text-white">
                    #{index + 1}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <MiniStat label="Juz" value={item.juz_count} />
                  <MiniStat label="Dhikr" value={item.dhikr_count} />
                  <MiniStat label="Fathiha" value={item.fathiha_count} />
                  <MiniStat label="Ya-Sin" value={item.yaseen_count} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-black text-emerald-950 dark:text-emerald-50">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function RecentActivityCard({
  recentActivity,
}: {
  recentActivity: RecentActivityItem[];
}) {
  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <History className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
              Recent Activity
            </h2>
            <p className="text-sm text-muted-foreground">
              പുതിയ സംഭാവനകൾ
            </p>
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <p className="rounded-3xl bg-emerald-50 p-4 text-sm text-muted-foreground dark:bg-emerald-950/40">
            ഇതുവരെ പ്രവർത്തനങ്ങളില്ല.
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-3xl border border-emerald-100 bg-white/70 p-4 dark:border-emerald-900 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ActivityBadge type={item.type} />
                      <p className="font-bold text-emerald-950 dark:text-emerald-50">
                        {item.contributor_name}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.label}
                    </p>
                  </div>

                  <Badge className="rounded-full bg-emerald-600 text-white">
                    {item.count.toLocaleString("en-IN")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityBadge({ type }: { type: RecentActivityItem["type"] }) {
  const labelMap = {
    juz: "Juz",
    dhikr: "Dhikr",
    fathiha: "Fathiha",
    yaseen: "Ya-Sin",
  };

  return (
    <Badge
      variant="outline"
      className="rounded-full border-emerald-200 text-emerald-800 dark:border-emerald-800 dark:text-emerald-100"
    >
      {labelMap[type]}
    </Badge>
  );
}

function CompletedKhatamHistoryCard({
  stats,
}: {
  stats: MajlisStatsState | null;
}) {
  const history = stats?.completedKhatamHistory || [];

  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
              Completed Khatam History
            </h2>
            <p className="text-sm text-muted-foreground">
              പൂർത്തിയായ ഖത്തങ്ങളുടെ പട്ടിക
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="rounded-3xl bg-emerald-50 p-4 text-sm text-muted-foreground dark:bg-emerald-950/40">
            ഇതുവരെ ഖത്തം പൂർത്തിയായിട്ടില്ല.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-emerald-100 bg-white/70 p-4 dark:border-emerald-900 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-emerald-950 dark:text-emerald-50">
                      Khatam {item.khatam_number}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.selected_juz_count} / 30 Juz
                    </p>
                  </div>

                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs text-muted-foreground dark:bg-emerald-950/40">
                  {item.completed_at
                    ? new Date(item.completed_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Completed"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}