"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    onChange: loadKhatam,
  });

  const takenJuzNumbers = useMemo(() => {
    return new Set(khatam?.contributions.map((item) => item.juz_number) || []);
  }, [khatam]);

  const availableJuzNumbers = useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => index + 1).filter(
      (juzNumber) => !takenJuzNumbers.has(juzNumber)
    );
  }, [takenJuzNumbers]);

  const isCompleted = khatam
    ? khatam.status === "completed" || khatam.contributions.length >= 30
    : false;

  function toggleJuz(juzNumber: number) {
    if (takenJuzNumbers.has(juzNumber) || isCompleted || isSubmitting) return;

    setSelectedJuz((current) => {
      if (current.includes(juzNumber)) {
        return current.filter((item) => item !== juzNumber);
      }

      return [...current, juzNumber].sort((a, b) => a - b);
    });
  }

  function selectAllAvailable() {
    if (isCompleted || isSubmitting) return;
    setSelectedJuz(availableJuzNumbers);
  }

  function clearSelection() {
    setSelectedJuz([]);
  }

  async function submitSelection() {
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
      setIsSubmitting(true);

      await selectJuzContribution({
        roomId,
        khatamId: khatam.id,
        juzNumbers: selectedJuz,
        displayName,
      });

      toast.success("ജുസ് വിജയകരമായി രേഖപ്പെടുത്തി");
      setSelectedJuz([]);

      // Always refetch after critical submit.
      await loadKhatam();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ഈ ജുസ് ഇതിനകം തിരഞ്ഞെടുക്കപ്പെട്ടിരിക്കുന്നു.";

      toast.error(message);

      // Refetch because another user may have selected it.
      await loadKhatam();
    } finally {
      setIsSubmitting(false);
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
                <BookOpen className="h-4 w-4" />
                ഖത്ത്മുൽ ഖുർആൻ മജ്ലിസ്
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

                <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4 dark:border-emerald-900 dark:bg-slate-950/30">
                  <p className="text-sm text-muted-foreground">
                    നിയ്യത്ത് / ഉദ്ദേശ്യം
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-50">
                    {purpose}
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
                നിങ്ങൾക്ക് പാരായണം ചെയ്യാൻ കഴിയുന്ന ഒരു ജുസ്, ഒന്നിലധികം ജുസ്,
                അല്ലെങ്കിൽ ലഭ്യമായ എല്ലാ ജുസുകളും തിരഞ്ഞെടുക്കാം. ഒരേ ജുസ്
                രണ്ടുപേർക്ക് തിരഞ്ഞെടുക്കാൻ കഴിയില്ല.
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
              <h2 className="mt-4 text-2xl font-black text-emerald-950 dark:text-emerald-50">
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

            {isCompleted ? (
              <Card className="glass-card rounded-[2rem] border-emerald-100">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />

                  <h2 className="mt-4 text-2xl font-black text-emerald-950 dark:text-emerald-50">
                    ഖത്തം {khatam.khatam_number} പൂർത്തിയായി
                  </h2>

                  <p className="mx-auto mt-2 max-w-2xl leading-7 text-muted-foreground">
                    അൽഹംദുലില്ലാഹ്. ഈ ഖത്തം പൂർത്തിയായി. ഇനി പുതിയ ഖത്തം
                    സൃഷ്ടിച്ച് കൂടുതൽ ആളുകൾക്ക് പങ്കെടുക്കാം.
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
              <Card className="glass-card rounded-[2rem] border-emerald-100">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-semibold text-emerald-950 dark:text-emerald-50">
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

                  <div className="rounded-3xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                        <UsersRound className="h-5 w-5" />
                        <p className="font-semibold">
                          {selectedJuz.length > 0
                            ? `തിരഞ്ഞെടുത്ത ജുസുകൾ: ${selectedJuz.join(", ")}`
                            : "ജുസ് തിരഞ്ഞെടുക്കുക"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        disabled={isSubmitting || selectedJuz.length === 0}
                        className="h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                        onClick={submitSelection}
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

                  <JuzGrid
                    contributions={khatam.contributions}
                    selectedJuz={selectedJuz}
                    disabled={isSubmitting}
                    onToggleJuz={toggleJuz}
                  />

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
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}