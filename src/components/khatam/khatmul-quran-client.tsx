"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  completeJuzContribution,
  createNextKhatam,
  getLatestKhatamState,
  selectJuzContribution,
  type KhatamState,
} from "@/lib/majlis/khatam";
import { useMajlisRealtime } from "@/hooks/use-majlis-realtime";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NameAutocomplete } from "@/components/majlis/name-autocomplete";
import { JuzGrid } from "@/components/khatam/juz-grid";
import { KhatamProgress } from "@/components/khatam/khatam-progress";

type KhatmulQuranClientProps = {
  roomId: string;
  slug: string;
  title: string;
  forWhom: string;
  purpose: string;
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function KhatmulQuranClient({
  roomId,
  slug,
  title,
  forWhom,
  purpose,
}: KhatmulQuranClientProps) {
  const [khatam, setKhatam] = useState<KhatamState | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<number[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCreatingNext, setIsCreatingNext] = useState(false);

  const loadKhatam = useCallback(async () => {
    try {
      const latestKhatam = await getLatestKhatamState(roomId);
      setKhatam(latestKhatam);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ഖത്തം വിവരങ്ങൾ ലഭിച്ചില്ല";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadKhatam();
  }, [loadKhatam]);

  useMajlisRealtime({
    roomId,
    tables: ["juz_contributions", "khatams"],
    onChange: loadKhatam,
  });

  const reservedJuzNumbers = useMemo(() => {
    return new Set(khatam?.contributions.map((item) => item.juz_number) || []);
  }, [khatam]);

  const availableJuzNumbers = useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => index + 1).filter(
      (juzNumber) => !reservedJuzNumbers.has(juzNumber)
    );
  }, [reservedJuzNumbers]);

  const completedCount = useMemo(() => {
    return (
      khatam?.contributions.filter((item) => item.status === "completed")
        .length || 0
    );
  }, [khatam]);

  const reservedCount = khatam?.contributions.length || 0;

  const isCompleted = khatam
    ? khatam.status === "completed" || completedCount >= 30
    : false;

  const myPendingJuz = useMemo(() => {
    const name = normalizeName(displayName);

    if (!khatam || name.length < 2) {
      return [];
    }

    return khatam.contributions
      .filter(
        (item) =>
          item.status === "selected" &&
          normalizeName(item.contributor_name) === name
      )
      .sort((a, b) => a.juz_number - b.juz_number);
  }, [khatam, displayName]);

  const myCompletedJuz = useMemo(() => {
    const name = normalizeName(displayName);

    if (!khatam || name.length < 2) {
      return [];
    }

    return khatam.contributions
      .filter(
        (item) =>
          item.status === "completed" &&
          normalizeName(item.contributor_name) === name
      )
      .sort((a, b) => a.juz_number - b.juz_number);
  }, [khatam, displayName]);

  function toggleJuz(juzNumber: number) {
    if (reservedJuzNumbers.has(juzNumber) || isCompleted || isReserving) return;

    setSelectedJuz((current) => {
      if (current.includes(juzNumber)) {
        return current.filter((item) => item !== juzNumber);
      }

      return [...current, juzNumber].sort((a, b) => a - b);
    });
  }

  function selectAllAvailable() {
    if (isCompleted || isReserving) return;
    setSelectedJuz(availableJuzNumbers);
  }

  function clearSelection() {
    setSelectedJuz([]);
  }

  async function reserveSelectedJuz() {
    if (!khatam) return;

    if (displayName.trim().length < 2) {
      toast.error("പേര് ശരിയായി നൽകുക");
      return;
    }

    if (selectedJuz.length === 0) {
      toast.error("കുറഞ്ഞത് ഒരു ജുസ് തിരഞ്ഞെടുക്കുക");
      return;
    }

    try {
      setIsReserving(true);

      await selectJuzContribution({
        roomId,
        khatamId: khatam.id,
        juzNumbers: selectedJuz,
        displayName,
      });

      toast.success(
        "ജുസ് reserve ചെയ്തു. പാരായണം പൂർത്തിയായ ശേഷം completed ആയി mark ചെയ്യുക."
      );

      setSelectedJuz([]);

      await loadKhatam();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ഈ ജുസ് ഇതിനകം തിരഞ്ഞെടുക്കപ്പെട്ടിരിക്കുന്നു.";

      toast.error(message);
      await loadKhatam();
    } finally {
      setIsReserving(false);
    }
  }

  async function completeMyPendingJuz() {
    if (!khatam) return;

    if (displayName.trim().length < 2) {
      toast.error("പേര് ശരിയായി നൽകുക");
      return;
    }

    const pendingNumbers = myPendingJuz.map((item) => item.juz_number);

    if (pendingNumbers.length === 0) {
      toast.error("നിങ്ങളുടെ pending Juz കണ്ടെത്താനായില്ല");
      return;
    }

    try {
      setIsCompleting(true);

      const result = await completeJuzContribution({
        roomId,
        khatamId: khatam.id,
        juzNumbers: pendingNumbers,
        displayName,
      });

      if (result?.khatam_completed) {
        toast.success("അൽഹംദുലില്ലാഹ്. ഖത്തം പൂർത്തിയായി.");
      } else {
        toast.success("നിങ്ങളുടെ ജുസ് completed ആയി mark ചെയ്തു");
      }

      await loadKhatam();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Completed ആയി mark ചെയ്യാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
      await loadKhatam();
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleCreateNextKhatam() {
    try {
      setIsCreatingNext(true);

      await createNextKhatam(roomId);

      toast.success("പുതിയ ഖത്തം സൃഷ്ടിച്ചു");
      setSelectedJuz([]);

      await loadKhatam();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "പുതിയ ഖത്തം സൃഷ്ടിക്കാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
    } finally {
      setIsCreatingNext(false);
    }
  }

  return (
    <main className="safe-container py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button
          asChild
          variant="ghost"
          className="rounded-full text-emerald-800 hover:bg-emerald-50"
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
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800">
                <BookOpen className="h-4 w-4" />
                ഖത്ത്മുൽ ഖുർആൻ മജ്ലിസ്
              </div>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl lg:text-5xl">
                {title}
              </h1>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4">
                  <p className="text-sm text-muted-foreground">ആർക്കുവേണ്ടി</p>
                  <p className="mt-1 text-lg font-bold text-emerald-950">
                    {forWhom}
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4">
                  <p className="text-sm text-muted-foreground">
                    നിയ്യത്ത് / ഉദ്ദേശ്യം
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-950">
                    {purpose}
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
                നിങ്ങൾക്ക് പാരായണം ചെയ്യാൻ കഴിയുന്ന ജുസ് ആദ്യം reserve ചെയ്യുക.
                പാരായണം പൂർത്തിയായ ശേഷം അതേ പേരിൽ completed ആയി mark ചെയ്യുക.
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
                  ഖത്തം വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !khatam ? (
          <Card className="glass-card rounded-[2rem]">
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-4 text-2xl font-black text-emerald-950">
                ഖത്തം കണ്ടെത്തിയില്ല
              </h2>
              <p className="mt-2 text-muted-foreground">
                ഈ മജ്ലിസിൽ ഖത്തം സൃഷ്ടിച്ചിട്ടില്ല.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {khatam ? (
          <>
            <KhatamProgress khatam={khatam} />

            <div className="grid gap-4 md:grid-cols-3">
              <MiniStatusCard
                label="Available Juz"
                value={availableJuzNumbers.length}
                tone="white"
              />
              <MiniStatusCard
                label="Reserved / Pending"
                value={reservedCount - completedCount}
                tone="amber"
              />
              <MiniStatusCard
                label="Completed"
                value={completedCount}
                tone="emerald"
              />
            </div>

            {isCompleted ? (
              <Card className="glass-card rounded-[2rem] border-emerald-100">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />

                  <h2 className="mt-4 text-2xl font-black text-emerald-950">
                    ഖത്തം {khatam.khatam_number} പൂർത്തിയായി
                  </h2>

                  <p className="mx-auto mt-2 max-w-2xl leading-7 text-muted-foreground">
                    അൽഹംദുലില്ലാഹ്. 30 ജുസുകളും completed ആയി mark ചെയ്തു.
                    ഇനി പുതിയ ഖത്തം സൃഷ്ടിച്ച് തുടർന്നും പങ്കെടുക്കാം.
                  </p>

                  <Button
                    type="button"
                    disabled={isCreatingNext}
                    className="mt-6 h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                    onClick={handleCreateNextKhatam}
                  >
                    {isCreatingNext ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        സൃഷ്ടിക്കുന്നു...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        പുതിയ ഖത്തം സൃഷ്ടിക്കുക
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="glass-card rounded-[2rem] border-emerald-100">
                  <CardContent className="space-y-5 p-5 sm:p-6">
                    <div>
                      <h2 className="text-2xl font-black text-emerald-950">
                        ജുസ് Reserve ചെയ്യുക
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        ആദ്യം നിങ്ങളുടെ പേര് നൽകി ജുസ് reserve ചെയ്യുക. ഇത്
                        ഇപ്പോൾ completed ആയി count ചെയ്യില്ല.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-semibold text-emerald-950">
                          നിങ്ങളുടെ പേര്
                        </label>

                        <NameAutocomplete
                          value={displayName}
                          onChange={setDisplayName}
                          placeholder="ഉദാ: Shuhaib"
                        />
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-13 rounded-full"
                          onClick={selectAllAvailable}
                          disabled={availableJuzNumbers.length === 0}
                        >
                          All available select
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="h-13 rounded-full"
                          onClick={clearSelection}
                          disabled={selectedJuz.length === 0}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-emerald-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-emerald-900">
                          <UsersRound className="h-5 w-5" />
                          <p className="font-semibold">
                            {selectedJuz.length > 0
                              ? `Reserve ചെയ്യാൻ തിരഞ്ഞെടുത്തത്: ${selectedJuz.join(
                                  ", "
                                )}`
                              : "Reserve ചെയ്യാൻ ജുസ് തിരഞ്ഞെടുക്കുക"}
                          </p>
                        </div>

                        <Button
                          type="button"
                          disabled={isReserving || selectedJuz.length === 0}
                          className="h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                          onClick={reserveSelectedJuz}
                        >
                          {isReserving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Reserving...
                            </>
                          ) : (
                            <>
                              <Clock3 className="mr-2 h-4 w-4" />
                              Reserve Juz
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <JuzGrid
                      contributions={khatam.contributions}
                      selectedJuz={selectedJuz}
                      disabled={isReserving}
                      onToggleJuz={toggleJuz}
                    />
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-[2rem] border-amber-100">
                  <CardContent className="space-y-5 p-5 sm:p-6">
                    <div>
                      <h2 className="text-2xl font-black text-emerald-950">
                        എന്റെ pending Juz completed ആയി mark ചെയ്യുക
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        നിങ്ങൾ പാരായണം പൂർത്തിയാക്കിയ ശേഷം, അതേ പേര് നൽകി
                        completed ആയി mark ചെയ്യുക.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
                        <p className="flex items-center gap-2 font-bold text-amber-900">
                          <Clock3 className="h-5 w-5" />
                          My Pending Juz
                        </p>

                        {displayName.trim().length < 2 ? (
                          <p className="mt-3 text-sm text-amber-800">
                            നിങ്ങളുടെ പേര് നൽകുമ്പോൾ pending Juz ഇവിടെ കാണിക്കും.
                          </p>
                        ) : myPendingJuz.length === 0 ? (
                          <p className="mt-3 text-sm text-amber-800">
                            ഈ പേരിൽ pending Juz ഇല്ല.
                          </p>
                        ) : (
                          <p className="mt-3 text-sm font-semibold text-amber-900">
                            Juz{" "}
                            {myPendingJuz
                              .map((item) => item.juz_number)
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="flex items-center gap-2 font-bold text-emerald-900">
                          <CheckCircle2 className="h-5 w-5" />
                          My Completed Juz
                        </p>

                        {displayName.trim().length < 2 ? (
                          <p className="mt-3 text-sm text-emerald-800">
                            നിങ്ങളുടെ പേര് നൽകുമ്പോൾ completed Juz ഇവിടെ കാണിക്കും.
                          </p>
                        ) : myCompletedJuz.length === 0 ? (
                          <p className="mt-3 text-sm text-emerald-800">
                            ഈ പേരിൽ completed Juz ഇല്ല.
                          </p>
                        ) : (
                          <p className="mt-3 text-sm font-semibold text-emerald-900">
                            Juz{" "}
                            {myCompletedJuz
                              .map((item) => item.juz_number)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      disabled={isCompleting || myPendingJuz.length === 0}
                      className="h-12 w-full rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                      onClick={completeMyPendingJuz}
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Marking completed...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          ഞാൻ പാരായണം പൂർത്തിയാക്കി
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={loadKhatam}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

function MiniStatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-100 bg-amber-50 text-amber-900"
      : tone === "emerald"
        ? "border-emerald-100 bg-emerald-50 text-emerald-900"
        : "border-emerald-100 bg-white/70 text-emerald-950";

  return (
    <Card className={`rounded-[2rem] ${toneClass}`}>
      <CardContent className="p-5">
        <p className="text-sm opacity-80">{label}</p>
        <p className="mt-1 text-3xl font-black">
          {value.toLocaleString("en-IN")}
        </p>
      </CardContent>
    </Card>
  );
}