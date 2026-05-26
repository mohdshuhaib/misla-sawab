"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  MessageCircleHeart,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { MajlisActivity } from "@/lib/majlis/create-majlis";
import {
  archiveManagerMajlis,
  deleteManagerDhikrContribution,
  deleteManagerJuzContribution,
  deleteManagerSimpleRecitation,
  getManagerMajlis,
  updateManagerMajlis,
  type ManagerDhikrContribution,
  type ManagerJuzContribution,
  type ManagerMajlisState,
  type ManagerSimpleRecitation,
} from "@/lib/majlis/manager";
import { useMajlisRealtime } from "@/hooks/use-majlis-realtime";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ManagerClientProps = {
  slug: string;
};

const activityOptions: {
  value: MajlisActivity;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
    {
      value: "khatmul_quran",
      label: "ഖത്ത്മുൽ ഖുർആൻ",
      description: "Juz selection and Khatam progress",
      icon: BookOpen,
    },
    {
      value: "dhikr",
      label: "ദിക്റ് / അദ്കാർ",
      description: "Dhikr counts and contributor stats",
      icon: MessageCircleHeart,
    },
    {
      value: "yaseen",
      label: "സൂറത്ത് യാസീൻ",
      description: "Surah Ya-Sin recitation count",
      icon: HeartHandshake,
    },
    {
      value: "fathiha",
      label: "Fathiha + Ikhlas + Falaq + Naas",
      description: "Fathiha + Ikhlas + Falaq + Naas recitation count",
      icon: Sparkles,
    },
  ];

export function ManagerClient({ slug }: ManagerClientProps) {
  const router = useRouter();

  const [managerToken, setManagerToken] = useState("");
  const [state, setState] = useState<ManagerMajlisState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const [title, setTitle] = useState("");
  const [forWhom, setForWhom] = useState("");
  const [description, setDescription] = useState("");
  const [activities, setActivities] = useState<MajlisActivity[]>([]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const params = new URLSearchParams(hash);
    const token = params.get("token") || "";

    setManagerToken(token);
  }, []);

  const loadManagerData = useCallback(async () => {
    if (!managerToken) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getManagerMajlis({
        slug,
        managerToken,
      });

      setState(data);

      setTitle(data.room.title);
      setForWhom(data.room.for_whom);
      setDescription(data.room.description || "");
      setActivities(
        data.activities
          .filter((activity) => activity.enabled)
          .map((activity) => activity.activity_type)
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Manager data ലഭിച്ചില്ല";

      toast.error(message);
      setState(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, managerToken]);

  useEffect(() => {
    loadManagerData();
  }, [loadManagerData]);

  useMajlisRealtime({
    roomId: state?.room.id || "",
    onChange: loadManagerData,
  });

  const publicLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/m/${slug}`;
  }, [slug]);

  async function copyPublicLink() {
    await navigator.clipboard.writeText(publicLink);
    toast.success("ലിങ്ക് കോപ്പി ചെയ്തു");
  }

  function toggleActivity(activity: MajlisActivity) {
    setActivities((current) => {
      if (current.includes(activity)) {
        return current.filter((item) => item !== activity);
      }

      return [...current, activity];
    });
  }

  async function saveChanges() {
    if (!state) return;

    if (title.trim().length < 2) {
      toast.error("മജ്ലിസ് പേര് നൽകുക");
      return;
    }

    if (forWhom.trim().length < 2) {
      toast.error("ആർക്കുവേണ്ടിയാണെന്ന് നൽകുക");
      return;
    }

    if (activities.length === 0) {
      toast.error("കുറഞ്ഞത് ഒരു പ്രവർത്തനം തിരഞ്ഞെടുക്കുക");
      return;
    }

    try {
      setIsSaving(true);

      await updateManagerMajlis({
        roomId: state.room.id,
        managerToken,
        title,
        forWhom,
        description,
        defaultLanguage: state.room.default_language,
        activities,
      });

      toast.success("മജ്ലിസ് വിവരങ്ങൾ update ചെയ്തു");
      await loadManagerData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Update ചെയ്യാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveMajlis() {
    if (!state) return;

    const confirmed = window.confirm(
      "ഈ മജ്ലിസ് archive ചെയ്യണോ? Public contributors-ക്ക് പിന്നീട് ഇത് കാണാനാകില്ല."
    );

    if (!confirmed) return;

    try {
      setIsArchiving(true);

      await archiveManagerMajlis({
        roomId: state.room.id,
        managerToken,
      });

      toast.success("മജ്ലിസ് archive ചെയ്തു");
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Archive ചെയ്യാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
    } finally {
      setIsArchiving(false);
    }
  }

  async function deleteJuzContribution(contributionId: string) {
    const confirmed = window.confirm("ഈ Juz contribution remove ചെയ്യണോ?");
    if (!confirmed) return;

    try {
      await deleteManagerJuzContribution({
        contributionId,
        managerToken,
      });

      toast.success("Juz contribution removed");
      await loadManagerData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Remove ചെയ്യാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
    }
  }

  async function deleteDhikrContribution(contributionId: string) {
    const confirmed = window.confirm("ഈ Dhikr contribution remove ചെയ്യണോ?");
    if (!confirmed) return;

    try {
      await deleteManagerDhikrContribution({
        contributionId,
        managerToken,
      });

      toast.success("Dhikr contribution removed");
      await loadManagerData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Remove ചെയ്യാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
    }
  }

  async function deleteSimpleRecitation(contributionId: string) {
    const confirmed = window.confirm("ഈ Surah recitation remove ചെയ്യണോ?");
    if (!confirmed) return;

    try {
      await deleteManagerSimpleRecitation({
        contributionId,
        managerToken,
      });

      toast.success("Surah recitation removed");
      await loadManagerData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Remove ചെയ്യാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
    }
  }

  if (!managerToken && !isLoading) {
    return <MissingManagerToken slug={slug} />;
  }

  if (isLoading) {
    return (
      <main className="safe-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-10">
        <Card className="glass-card rounded-[2rem]">
          <CardContent className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
            <p className="mt-3 text-muted-foreground">
              Manager panel ലോഡ് ചെയ്യുന്നു...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!state) {
    return <InvalidManagerLink slug={slug} />;
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
            Public Majlis കാണുക
          </Link>
        </Button>

        <Card className="glass-card overflow-hidden rounded-[2.25rem] border-emerald-100">
          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-700/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                <LockKeyhole className="h-4 w-4" />
                Private Manager Panel
              </div>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-4xl lg:text-5xl">
                {state.room.title}
              </h1>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <InfoBox label="Status" value={state.room.status} />
                <InfoBox label="ആർക്കുവേണ്ടി" value={state.room.for_whom} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={copyPublicLink}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Public Link Copy
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-full"
                  disabled={isArchiving || state.room.status === "archived"}
                  onClick={archiveMajlis}
                >
                  {isArchiving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Majlis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid h-auto grid-cols-3 rounded-3xl bg-white/70 p-1 dark:bg-slate-950/40">
            <TabsTrigger value="overview" className="rounded-2xl">
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-2xl">
              Settings
            </TabsTrigger>
            <TabsTrigger value="contributions" className="rounded-2xl">
              Contributions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ManagerOverview state={state} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="glass-card rounded-[2rem] border-emerald-100">
              <CardContent className="space-y-6 p-5 sm:p-6">
                <div>
                  <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
                    Majlis Settings
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Public page information and enabled activities manage ചെയ്യാം.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold">
                      Majlis Title
                    </label>
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="h-12 rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      For whom
                    </label>
                    <Input
                      value={forWhom}
                      onChange={(event) => setForWhom(event.target.value)}
                      className="h-12 rounded-2xl"
                    />
                  </div>


                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="min-h-28 rounded-2xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold">
                    Enabled Activities
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {activityOptions.map((activity) => {
                      const Icon = activity.icon;
                      const checked = activities.includes(activity.value);

                      function handleToggleActivity() {
                        toggleActivity(activity.value);
                      }

                      return (
                        <div
                          key={activity.value}
                          role="checkbox"
                          aria-checked={checked}
                          tabIndex={0}
                          onClick={handleToggleActivity}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleToggleActivity();
                            }
                          }}
                          className={cn(
                            "flex min-h-24 cursor-pointer items-start gap-3 rounded-3xl border p-4 text-left transition",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                            checked
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-emerald-100 bg-white/60 hover:bg-emerald-50"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                              checked
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-emerald-950">
                                {activity.label}
                              </p>

                              <span
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                                  checked
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-emerald-300 bg-white"
                                )}
                                aria-hidden="true"
                              >
                                {checked ? <Check className="h-3.5 w-3.5" /> : null}
                              </span>
                            </div>

                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={isSaving}
                    className="h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                    onClick={saveChanges}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-6">
            <ContributionManagement
              state={state}
              onDeleteJuz={deleteJuzContribution}
              onDeleteDhikr={deleteDhikrContribution}
              onDeleteSimple={deleteSimpleRecitation}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={loadManagerData}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4 dark:border-emerald-900 dark:bg-slate-950/30">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-50">
        {value}
      </p>
    </div>
  );
}

function ManagerOverview({ state }: { state: ManagerMajlisState }) {
  const activeActivities = state.activities.filter((item) => item.enabled);
  const completedKhatams = state.khatams.filter(
    (item) => item.status === "completed"
  );

  const totalDhikr = state.dhikr_contributions.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const totalFathiha = state.simple_recitations
    .filter((item) => item.activity_type === "fathiha")
    .reduce((sum, item) => sum + item.count, 0);

  const totalYaseen = state.simple_recitations
    .filter((item) => item.activity_type === "yaseen")
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard
        label="Enabled Activities"
        value={activeActivities.length}
        icon={Check}
      />
      <ManagerStatCard
        label="Completed Khatams"
        value={completedKhatams.length}
        icon={BookOpen}
      />
      <ManagerStatCard
        label="Total Dhikr"
        value={totalDhikr}
        icon={MessageCircleHeart}
      />
      <ManagerStatCard
        label="Total Fathiha Set + Ya-Sin"
        value={totalFathiha + totalYaseen}
        icon={Sparkles}
      />
    </div>
  );
}

function ManagerStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Check;
}) {
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

function ContributionManagement({
  state,
  onDeleteJuz,
  onDeleteDhikr,
  onDeleteSimple,
}: {
  state: ManagerMajlisState;
  onDeleteJuz: (id: string) => void;
  onDeleteDhikr: (id: string) => void;
  onDeleteSimple: (id: string) => void;
}) {
  return (
    <>
      <JuzManagerList
        contributions={state.juz_contributions}
        onDelete={onDeleteJuz}
      />

      <DhikrManagerList
        contributions={state.dhikr_contributions}
        onDelete={onDeleteDhikr}
      />

      <SimpleRecitationManagerList
        contributions={state.simple_recitations}
        onDelete={onDeleteSimple}
      />
    </>
  );
}

function JuzManagerList({
  contributions,
  onDelete,
}: {
  contributions: ManagerJuzContribution[];
  onDelete: (id: string) => void;
}) {
  return (
    <ManagerListCard title="Juz Contributions" count={contributions.length}>
      {contributions.length === 0 ? (
        <EmptyManagerList />
      ) : (
        contributions.map((item) => (
          <ContributionRow
            key={item.id}
            title={`${item.contributor_name}`}
            subtitle={`Khatam ${item.khatam_number} - Juz ${item.juz_number}`}
            badge="Juz"
            date={item.created_at}
            onDelete={() => onDelete(item.id)}
          />
        ))
      )}
    </ManagerListCard>
  );
}

function DhikrManagerList({
  contributions,
  onDelete,
}: {
  contributions: ManagerDhikrContribution[];
  onDelete: (id: string) => void;
}) {
  return (
    <ManagerListCard title="Dhikr Contributions" count={contributions.length}>
      {contributions.length === 0 ? (
        <EmptyManagerList />
      ) : (
        contributions.map((item) => (
          <ContributionRow
            key={item.id}
            title={item.contributor_name}
            subtitle={`${item.dhikr_type} × ${item.count.toLocaleString(
              "en-IN"
            )}`}
            badge="Dhikr"
            date={item.created_at}
            onDelete={() => onDelete(item.id)}
          />
        ))
      )}
    </ManagerListCard>
  );
}

function SimpleRecitationManagerList({
  contributions,
  onDelete,
}: {
  contributions: ManagerSimpleRecitation[];
  onDelete: (id: string) => void;
}) {
  return (
    <ManagerListCard title="Surah Recitations" count={contributions.length}>
      {contributions.length === 0 ? (
        <EmptyManagerList />
      ) : (
        contributions.map((item) => (
          <ContributionRow
            key={item.id}
            title={item.contributor_name}
            subtitle={`${item.activity_type === "fathiha"
              ? "Fathiha + Ikhlas + Falaq + Naas"
              : "Surah Ya-Sin"
              } ? × ${item.count.toLocaleString("en-IN")}`}
            badge={item.activity_type === "fathiha" ? "Fathiha + Ikhlas + Falaq + Naas" : "Ya-Sin"}
            date={item.created_at}
            onDelete={() => onDelete(item.id)}
          />
        ))
      )}
    </ManagerListCard>
  );
}

function ManagerListCard({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Wrong contributions remove ചെയ്യാം.
            </p>
          </div>

          <Badge variant="outline" className="rounded-full">
            {count}
          </Badge>
        </div>

        <div className="space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function ContributionRow({
  title,
  subtitle,
  badge,
  date,
  onDelete,
}: {
  title: string;
  subtitle: string;
  badge: string;
  date: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white/70 p-4 dark:border-emerald-900 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-emerald-200 text-emerald-800 dark:border-emerald-800 dark:text-emerald-100"
          >
            {badge}
          </Badge>

          <p className="font-bold text-emerald-950 dark:text-emerald-50">
            {title}
          </p>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="rounded-full"
        onClick={onDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Remove
      </Button>
    </div>
  );
}

function EmptyManagerList() {
  return (
    <p className="rounded-3xl bg-emerald-50 p-4 text-sm text-muted-foreground dark:bg-emerald-950/40">
      ഒന്നും ലഭ്യമല്ല.
    </p>
  );
}

function MissingManagerToken({ slug }: { slug: string }) {
  return (
    <ManagerErrorShell
      title="Manager token കാണുന്നില്ല"
      description="ഈ page തുറക്കാൻ private manager link വേണം. Public link ഉപയോഗിച്ച് manager panel തുറക്കാൻ കഴിയില്ല."
      slug={slug}
    />
  );
}

function InvalidManagerLink({ slug }: { slug: string }) {
  return (
    <ManagerErrorShell
      title="Manager link ശരിയല്ല"
      description="ഈ manager token തെറ്റായതാകാം, അല്ലെങ്കിൽ ഈ Majlis-നുള്ള token അല്ല."
      slug={slug}
    />
  );
}

function ManagerErrorShell({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  return (
    <main className="safe-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-10">
      <Card className="glass-card max-w-xl rounded-[2rem] text-center">
        <CardContent className="p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-100">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
            {title}
          </h1>

          <p className="mt-3 leading-7 text-muted-foreground">
            {description}
          </p>

          <Button
            asChild
            className="mt-6 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Link href={`/m/${slug}`}>Public Majlis കാണുക</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}