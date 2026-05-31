"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  completeJuzContribution,
  createNextKhatam,
  getKhatamOverview,
  selectJuzContribution,
  type KhatamOverview,
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
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isKhatamCompleted(khatam: KhatamState) {
  return (
    khatam.status === "completed" ||
    khatam.contributions.filter((item) => item.status === "completed").length >= 30
  );
}

function isFullyReserved(khatam: KhatamState) {
  return khatam.contributions.length >= 30;
}

export function KhatmulQuranClient({ roomId, slug, title }: KhatmulQuranClientProps) {
  const [overview, setOverview] = useState<KhatamOverview | null>(null);
  const [expandedKhatamId, setExpandedKhatamId] = useState<string | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<number[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCreatingNext, setIsCreatingNext] = useState(false);
  const markSectionRef = useRef<HTMLDivElement | null>(null);
  

  const loadKhatam = useCallback(async () => {
    try {
      const nextOverview = await getKhatamOverview(roomId);
      setOverview(nextOverview);
      setExpandedKhatamId((current) => {
        const allIds = [
          nextOverview.currentKhatam?.id,
          ...nextOverview.reservedPendingKhatams.map((khatam) => khatam.id),
        ].filter(Boolean);
        if (current && allIds.includes(current)) return current;
        return null;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load Khatam details");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadKhatam();
  }, [loadKhatam]);

  useMajlisRealtime({ roomId, tables: ["juz_contributions", "khatams"], onChange: loadKhatam });

  const activeKhatams = useMemo(() => {
    if (!overview) return [];
    return [overview.currentKhatam, ...overview.reservedPendingKhatams].filter(Boolean) as KhatamState[];
  }, [overview]);

  const canCreateNext = overview?.latestKhatam ? isFullyReserved(overview.latestKhatam) && !overview.currentKhatam : false;

  function toggleExpanded(khatamId: string) {
    setExpandedKhatamId((current) => (current === khatamId ? null : khatamId));
    setSelectedJuz([]);
  }

  async function handleCreateNextKhatam() {
    try {
      setIsCreatingNext(true);
      await createNextKhatam(roomId);
      toast.success("പുതിയ ختم القرآن തുടങ്ങി.");
      setSelectedJuz([]);
      await loadKhatam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create a new Khatam");
    } finally {
      setIsCreatingNext(false);
    }
  }

  function scrollToMarkSection() {
    markSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="safe-container py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button asChild variant="ghost" className="rounded-full text-emerald-800 hover:bg-emerald-50">
          <Link href={"/m/" + slug}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Majlis
          </Link>
        </Button>

        <Card className="glass-card overflow-hidden rounded-[2.25rem] border-emerald-100">
          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800">
                <BookOpen className="h-4 w-4" />
                ختم القرآن
              </div>
              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl lg:text-5xl">{title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
                നിങ്ങൾക്ക് പാരായണം ചെയ്യാൻ കഴിയുന്ന ജുസ് ഏറ്റെടുക്കുക. പൂർത്തിയായ ശേഷം അതേ പേരിൽ ജുസ് പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്തുക.
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="glass-card rounded-[2rem]">
            <CardContent className="flex min-h-56 items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                <p className="mt-3 text-muted-foreground">ختم القرآن വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && activeKhatams.length === 0 ? (
          <Card className="glass-card rounded-[2rem]">
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-4 text-2xl font-black text-emerald-950">ختم القرآن കണ്ടെത്തിയില്ല</h2>
              <p className="mt-2 text-muted-foreground">ഈ മജ്ലിസിൽ സജീവമായ ختم القرآن ലഭ്യമല്ല.</p>
              {canCreateNext ? <CreateNextButton isCreating={isCreatingNext} onClick={handleCreateNextKhatam} /> : null}
            </CardContent>
          </Card>
        ) : null}

        {overview?.currentKhatam ? (
          <KhatamPanel
            khatam={overview.currentKhatam}
            expanded={expandedKhatamId === overview.currentKhatam.id}
            title="നിലവിലെ ختم القرآن"
            description="ഈ ختم القرآن-ൽ ഇപ്പോഴും ഏറ്റെടുക്കാൻ ജുസുകൾ ലഭ്യമാണ്."
            selectedJuz={selectedJuz}
            setSelectedJuz={setSelectedJuz}
            displayName={displayName}
            setDisplayName={setDisplayName}
            isReserving={isReserving}
            setIsReserving={setIsReserving}
            isCompleting={isCompleting}
            setIsCompleting={setIsCompleting}
            roomId={roomId}
            onReload={loadKhatam}
            onToggle={() => toggleExpanded(overview.currentKhatam!.id)}
            markSectionRef={expandedKhatamId === overview.currentKhatam.id ? markSectionRef : null}
            onJumpToMark={scrollToMarkSection}
            allowReserve
          />
        ) : null}

        {overview && overview.reservedPendingKhatams.length > 0 ? (
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-black text-emerald-950">പൂര്‍ത്തിയാക്കാൻ ബാക്കിയുള്ള ختم القرآن</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ഇവയിലെ എല്ലാ ജുസുകളും ഏറ്റെടുത്തിട്ടുണ്ട്. പക്ഷേ എല്ലാം പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്തിയിട്ടില്ല. നിങ്ങളുടെ ختم القرآن തുറന്ന് ജുസ് നില പുതുക്കാം.
              </p>
            </div>
            {overview.reservedPendingKhatams.map((khatam) => (
              <KhatamPanel
                key={khatam.id}
                khatam={khatam}
                expanded={expandedKhatamId === khatam.id}
                title={"ختم القرآن " + khatam.khatam_number}
                description="എല്ലാ ജുസുകളും ഏറ്റെടുത്തിട്ടുണ്ട്. ഓരോരുത്തർക്കും സ്വന്തം ജുസ് പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്താം."
                selectedJuz={selectedJuz}
                setSelectedJuz={setSelectedJuz}
                displayName={displayName}
                setDisplayName={setDisplayName}
                isReserving={isReserving}
                setIsReserving={setIsReserving}
                isCompleting={isCompleting}
                setIsCompleting={setIsCompleting}
                roomId={roomId}
                onReload={loadKhatam}
                onToggle={() => toggleExpanded(khatam.id)}
                markSectionRef={expandedKhatamId === khatam.id ? markSectionRef : null}
                onJumpToMark={scrollToMarkSection}
              />
            ))}
          </div>
        ) : null}

        {canCreateNext ? (
          <Card className="glass-card rounded-[2rem] border-emerald-100">
            <CardContent className="p-6 text-center">
              <Plus className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-3 text-2xl font-black text-emerald-950">എല്ലാ ജുസുകളും ഏറ്റെടുത്തു</h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                ഇപ്പോൾ അടുത്ത ختم القرآن തുടങ്ങാം. മുമ്പത്തെ ختم القرآن ഇവിടെ തന്നെ കാണും, അതിലെ ആളുകൾക്ക് അവരുടെ ജുസ് പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്താൻ കഴിയും.
              </p>
              <CreateNextButton isCreating={isCreatingNext} onClick={handleCreateNextKhatam} />
            </CardContent>
          </Card>
        ) : null}

        <div className="flex justify-end">
          <Button type="button" variant="ghost" className="rounded-full" onClick={loadKhatam}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </main>
  );
}

type KhatamPanelProps = {
  khatam: KhatamState;
  expanded: boolean;
  title: string;
  description: string;
  selectedJuz: number[];
  setSelectedJuz: (value: number[] | ((current: number[]) => number[])) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  isReserving: boolean;
  setIsReserving: (value: boolean) => void;
  isCompleting: boolean;
  setIsCompleting: (value: boolean) => void;
  roomId: string;
  onReload: () => Promise<void>;
  onToggle: () => void;
  markSectionRef: RefObject<HTMLDivElement | null> | null;
  onJumpToMark: () => void;
  allowReserve?: boolean;
};

function KhatamPanel({
  khatam,
  expanded,
  title,
  description,
  selectedJuz,
  setSelectedJuz,
  displayName,
  setDisplayName,
  isReserving,
  setIsReserving,
  isCompleting,
  setIsCompleting,
  roomId,
  onReload,
  onToggle,
  markSectionRef,
  onJumpToMark,
  allowReserve = false,
}: KhatamPanelProps) {
  const reservedJuzNumbers = useMemo(() => new Set(khatam.contributions.map((item) => item.juz_number)), [khatam]);
  const availableJuzNumbers = useMemo(() => Array.from({ length: 30 }, (_, index) => index + 1).filter((juz) => !reservedJuzNumbers.has(juz)), [reservedJuzNumbers]);
  const completedCount = khatam.contributions.filter((item) => item.status === "completed").length;
  const reservedCount = khatam.contributions.length;
  const completed = isKhatamCompleted(khatam);
  const canReserve = allowReserve && !completed && availableJuzNumbers.length > 0;
  const name = normalizeName(displayName);
  const myPendingJuz = khatam.contributions.filter((item) => item.status === "selected" && name.length >= 2 && normalizeName(item.contributor_name) === name).sort((a, b) => a.juz_number - b.juz_number);
  const myCompletedJuz = khatam.contributions.filter((item) => item.status === "completed" && name.length >= 2 && normalizeName(item.contributor_name) === name).sort((a, b) => a.juz_number - b.juz_number);
  const [selectedPendingJuz, setSelectedPendingJuz] = useState<number[]>([]);
  const validSelectedPendingJuz = selectedPendingJuz.filter((juzNumber) =>
    myPendingJuz.some((item) => item.juz_number === juzNumber)
  );

  function toggleJuz(juzNumber: number) {
    if (!canReserve || reservedJuzNumbers.has(juzNumber) || isReserving) return;
    setSelectedJuz((current) => current.includes(juzNumber) ? current.filter((item) => item !== juzNumber) : [...current, juzNumber].sort((a, b) => a - b));
  }

  async function reserveSelectedJuz() {
    if (displayName.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    if (selectedJuz.length === 0) {
      toast.error("Please select at least one Juz.");
      return;
    }
    try {
      setIsReserving(true);
      await selectJuzContribution({ roomId, khatamId: khatam.id, juzNumbers: selectedJuz, displayName });
      toast.success("ജുസ് ഏറ്റെടുത്തു. പാരായണം പൂർത്തിയായ ശേഷം പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്തുക.");
      setSelectedJuz([]);
      await onReload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reserve this Juz.");
      await onReload();
    } finally {
      setIsReserving(false);
    }
  }

  async function completeMyPendingJuz() {
    if (displayName.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    const pendingNumbers = validSelectedPendingJuz;
    if (pendingNumbers.length === 0) {
      toast.error("Please select the Juz you completed.");
      return;
    }
    try {
      setIsCompleting(true);
      const result = await completeJuzContribution({ roomId, khatamId: khatam.id, juzNumbers: pendingNumbers, displayName });
      toast.success(result?.khatam_completed ? "അൽഹംദുലില്ലാഹ്. ختم القرآن പൂര്‍ത്തിയാക്കി." : "നിങ്ങളുടെ ജുസ് പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്തി.");
      setSelectedPendingJuz([]);
      await onReload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not mark as completed.");
      await onReload();
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <Card className="glass-card rounded-[2rem] border-emerald-100">
      <button
        type="button"
        className="group flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:p-6"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-700">{title}</p>
          <h2 className="mt-1 text-2xl font-black text-emerald-950">ختم القرآن {khatam.khatam_number}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <p className="mt-2 text-sm font-semibold text-emerald-900">ഏറ്റെടുത്തത് {reservedCount}/30 · പൂര്‍ത്തിയാക്കി {completedCount}/30</p>
        </div>
        <span className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-white px-2.5 py-2 text-xs font-black text-emerald-800 shadow-sm transition group-hover:border-emerald-400 group-hover:bg-emerald-100 sm:px-3">
          <span className="hidden sm:inline">{expanded ? "അടയ്ക്കുക" : "വിവരം തുറക്കുക"}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white shadow-md shadow-emerald-900/15 transition group-hover:bg-emerald-800">
            {expanded ? <ChevronUp className="h-7 w-7" /> : <ChevronDown className="h-7 w-7" />}
          </span>
        </span>
      </button>

      {expanded ? (
        <CardContent className="space-y-6 border-t border-emerald-100 p-5 sm:p-6">
          <KhatamProgress khatam={khatam} />
          <div className="grid gap-4 md:grid-cols-3">
            <MiniStatusCard label="ലഭ്യമായ ജുസ്" value={availableJuzNumbers.length} tone="white" />
            <MiniStatusCard label="ഏറ്റെടുത്തത് / ബാക്കി" value={reservedCount - completedCount} tone="amber" />
            <MiniStatusCard label="പൂര്‍ത്തിയാക്കി" value={completedCount} tone="emerald" />
          </div>
          {!completed ? (
            <Button type="button" variant="outline" className="h-auto min-h-12 w-full rounded-2xl border-amber-200 bg-amber-50 px-4 py-3 whitespace-normal text-amber-900 hover:bg-amber-100" onClick={onJumpToMark}>
              <ArrowDownCircle className="mr-2 h-5 w-5" />
              ജുസ് പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്താൻ താഴേക്ക് പോകുക
            </Button>
          ) : null}
          {canReserve ? (
            <Card className="rounded-[2rem] border-emerald-100">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <h3 className="text-2xl font-black text-emerald-950">ജുസ് ഏറ്റെടുക്കുക</h3>
                  <p className="mt-1 text-sm text-muted-foreground">നിങ്ങളുടെ പേര് നൽകി പാരായണം ചെയ്യാൻ കഴിയുന്ന ജുസ് തിരഞ്ഞെടുക്കുക.</p>
                </div>
                <PrivacyMessage />
                <NameField displayName={displayName} setDisplayName={setDisplayName} allowNew />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="h-12 rounded-full" onClick={() => setSelectedJuz(availableJuzNumbers)} disabled={availableJuzNumbers.length === 0}>ലഭ്യമായവ എല്ലാം തിരഞ്ഞെടുക്കുക</Button>
                  <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={() => setSelectedJuz([])} disabled={selectedJuz.length === 0}>Clear</Button>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <UsersRound className="h-5 w-5" />
                      <p className="wrap-break-word font-semibold">{selectedJuz.length > 0 ? "തിരഞ്ഞെടുത്തത്: " + selectedJuz.join(", ") : "ഏറ്റെടുക്കാൻ ജുസ് തിരഞ്ഞെടുക്കുക"}</p>
                    </div>
                    <Button type="button" disabled={isReserving || selectedJuz.length === 0} className="h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700" onClick={reserveSelectedJuz}>
                      {isReserving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock3 className="mr-2 h-4 w-4" />}
                      ജുസ് ഏറ്റെടുക്കുക
                    </Button>
                  </div>
                </div>
                <JuzGrid contributions={khatam.contributions} selectedJuz={selectedJuz} disabled={isReserving} onToggleJuz={toggleJuz} />
              </CardContent>
            </Card>
          ) : (
            <JuzGrid contributions={khatam.contributions} selectedJuz={[]} disabled onToggleJuz={() => undefined} />
          )}
          {!completed ? (
            <Card ref={markSectionRef} className="rounded-[2rem] border-amber-100">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <h3 className="text-2xl font-black text-emerald-950">എന്റെ ജുസ് പൂര്‍ത്തിയാക്കി എന്ന് രേഖപ്പെടുത്തുക</h3>
                  <p className="mt-1 text-sm text-muted-foreground">ജുസ് ഏറ്റെടുത്തപ്പോൾ നൽകിയ അതേ പേര് തിരഞ്ഞെടുത്തുക.</p>
                </div>
                <PrivacyMessage />
                <NameField displayName={displayName} setDisplayName={setDisplayName} allowNew={false} />
                <div className="grid gap-4 md:grid-cols-2">
                  <PendingJuzSelector
                    title="പൂര്‍ത്തിയാക്കാനുള്ള ജുസ്"
                    emptyText={displayName.trim().length < 2 ? "പേര് തിരഞ്ഞെടുത്താൽ ജുസ് കാണാം." : "ഈ പേരിൽ പൂര്‍ത്തിയാക്കാനുള്ള ജുസ് ഇല്ല."}
                    items={myPendingJuz.map((item) => item.juz_number)}
                    selectedItems={validSelectedPendingJuz}
                    onToggle={(juzNumber) => {
                      setSelectedPendingJuz((current) =>
                        current.includes(juzNumber)
                          ? current.filter((item) => item !== juzNumber)
                          : [...current, juzNumber].sort((a, b) => a - b)
                      );
                    }}
                  />
                  <JuzSummary title="പൂര്‍ത്തിയാക്കിയ ജുസ്" emptyText={displayName.trim().length < 2 ? "പേര് തിരഞ്ഞെടുത്താൽ പൂര്‍ത്തിയാക്കിയ ജുസ് കാണാം." : "ഈ പേരിൽ പൂര്‍ത്തിയാക്കിയ ജുസ് ഇല്ല."} items={myCompletedJuz.map((item) => item.juz_number)} tone="emerald" />
                </div>
                <Button type="button" disabled={isCompleting || validSelectedPendingJuz.length === 0} className="h-auto min-h-12 w-full rounded-full bg-emerald-600 px-7 py-3 whitespace-normal text-white hover:bg-emerald-700" onClick={completeMyPendingJuz}>
                  {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {validSelectedPendingJuz.length > 0
                    ? `തിരഞ്ഞെടുത്ത ${validSelectedPendingJuz.length} ജുസ് പൂര്‍ത്തിയാക്കി`
                    : "പൂര്‍ത്തിയാക്കിയ ജുസ് തിരഞ്ഞെടുക്കുക"}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

function PrivacyMessage() {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
      <ShieldCheck className="mb-2 h-5 w-5 text-emerald-700" />
      നിങ്ങൾ എത്ര ഓതിയെന്നോ എത്ര ചൊല്ലിയെന്നോ മറ്റാർക്കും അറിയാൻ കഴിയില്ല. അതിനാൽ നിങ്ങളുടെ സവാബ് നഷ്ടപ്പെടുമോ എന്ന് ഭയപ്പെടേണ്ടതില്ല. പേര് നൽകുന്നത്, നിങ്ങൾ ഏറ്റെടുത്ത ജുസ് പൂർത്തിയാക്കിയ ശേഷം അത് പൂർത്തിയായി എന്ന് അടയാളപ്പെടുത്തുന്നതിനുവേണ്ടിയാണ്.
    </div>
  );
}

function NameField({ displayName, setDisplayName, allowNew = true }: { displayName: string; setDisplayName: (value: string) => void; allowNew?: boolean }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-emerald-950">നിങ്ങളുടെ പേര്</label>
      <NameAutocomplete value={displayName} onChange={setDisplayName} placeholder="Example: Shuhaib" allowNew={allowNew} />
    </div>
  );
}

function PendingJuzSelector({
  title,
  emptyText,
  items,
  selectedItems,
  onToggle,
}: {
  title: string;
  emptyText: string;
  items: number[];
  selectedItems: number[];
  onToggle: (juzNumber: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-amber-900">
      <p className="font-bold">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm opacity-85">{emptyText}</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((juzNumber) => {
            const selected = selectedItems.includes(juzNumber);

            return (
              <button
                key={juzNumber}
                type="button"
                onClick={() => onToggle(juzNumber)}
                className={`min-h-11 rounded-2xl border px-3 py-2 text-sm font-bold transition ${
                  selected
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-amber-200 bg-white/80 text-amber-900 hover:bg-amber-100"
                }`}
              >
                Juz {juzNumber}
              </button>
            );
          })}
        </div>
      )}
      {selectedItems.length > 0 ? (
        <p className="mt-3 text-xs font-semibold">
          തിരഞ്ഞെടുത്തത്: {selectedItems.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function JuzSummary({ title, emptyText, items, tone }: { title: string; emptyText: string; items: number[]; tone: "amber" | "emerald" }) {
  const className = tone === "amber" ? "border-amber-100 bg-amber-50 text-amber-900" : "border-emerald-100 bg-emerald-50 text-emerald-900";
  return (
    <div className={"rounded-3xl border p-4 " + className}>
      <p className="font-bold">{title}</p>
      {items.length === 0 ? <p className="mt-3 text-sm opacity-85">{emptyText}</p> : <p className="mt-3 text-sm font-semibold">Juz {items.join(", ")}</p>}
    </div>
  );
}

function CreateNextButton({ isCreating, onClick }: { isCreating: boolean; onClick: () => void }) {
  return (
    <Button type="button" disabled={isCreating} className="mt-6 h-auto min-h-12 rounded-full bg-emerald-600 px-7 py-3 whitespace-normal text-white hover:bg-emerald-700" onClick={onClick}>
      {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
      പുതിയ ختم القرآن തുടങ്ങുക
    </Button>
  );
}

function MiniStatusCard({ label, value, tone }: { label: string; value: number; tone: "white" | "amber" | "emerald" }) {
  const toneClass = tone === "amber" ? "border-amber-100 bg-amber-50 text-amber-900" : tone === "emerald" ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-emerald-100 bg-white/70 text-emerald-950";
  return (
    <Card className={"rounded-[2rem] " + toneClass}>
      <CardContent className="p-5">
        <p className="text-sm opacity-80">{label}</p>
        <p className="mt-1 text-3xl font-black">{value.toLocaleString("en-IN")}</p>
      </CardContent>
    </Card>
  );
}
