import { supabase } from "@/lib/supabase/client";

type RawKhatam = {
  id: string;
  room_id: string;
  khatam_number: number;
  status: "active" | "completed";
  created_at: string;
  completed_at: string | null;
};

type RawJuzContribution = {
  id: string;
  room_id: string;
  khatam_id: string;
  juz_number: number;
  contributor_id: string;
  created_at: string;
};

type RawSimpleRecitation = {
  id: string;
  room_id: string;
  activity_type: "fathiha" | "yaseen";
  contributor_id: string;
  count: number;
  created_at: string;
};

type RawDhikrContribution = {
  id: string;
  room_id: string;
  contributor_id: string;
  dhikr_type: string;
  count: number;
  created_at: string;
};

export type RecentActivityItem = {
  id: string;
  type: "juz" | "dhikr" | "fathiha" | "yaseen";
  label: string;
  contributor_name: string;
  count: number;
  created_at: string;
};

export type TopContributorStat = {
  contributor_id: string;
  contributor_name: string;
  juz_count: number;
  dhikr_count: number;
  fathiha_count: number;
  yaseen_count: number;
  total_activity_score: number;
};

export type CompletedKhatamHistoryItem = {
  id: string;
  khatam_number: number;
  completed_at: string | null;
  selected_juz_count: number;
};

export type CurrentKhatamProgress = {
  id: string;
  khatam_number: number;
  status: "active" | "completed";
  selected_juz_count: number;
  percentage: number;
};

export type MajlisStatsState = {
  totalContributors: number;
  totalCompletedKhatams: number;
  totalJuzSelected: number;
  totalFathihaCount: number;
  totalYaseenCount: number;
  totalDhikrCount: number;
  currentKhatamProgress: CurrentKhatamProgress | null;
  topContributors: TopContributorStat[];
  recentActivity: RecentActivityItem[];
  completedKhatamHistory: CompletedKhatamHistoryItem[];
};

export async function getMajlisStats(roomId: string): Promise<MajlisStatsState> {
  const [
    khatamsResult,
    juzResult,
    simpleResult,
    dhikrResult,
  ] = await Promise.all([
    supabase
      .from("khatams")
      .select("id, room_id, khatam_number, status, created_at, completed_at")
      .eq("room_id", roomId)
      .order("khatam_number", { ascending: true }),

    supabase
      .from("juz_contributions")
      .select("id, room_id, khatam_id, juz_number, contributor_id, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false }),

    supabase
      .from("simple_recitations")
      .select("id, room_id, activity_type, contributor_id, count, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false }),

    supabase
      .from("dhikr_contributions")
      .select("id, room_id, contributor_id, dhikr_type, count, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false }),
  ]);

  if (khatamsResult.error) {
    throw new Error(khatamsResult.error.message);
  }

  if (juzResult.error) {
    throw new Error(juzResult.error.message);
  }

  if (simpleResult.error) {
    throw new Error(simpleResult.error.message);
  }

  if (dhikrResult.error) {
    throw new Error(dhikrResult.error.message);
  }

  const khatams = (khatamsResult.data || []) as RawKhatam[];
  const juzContributions = (juzResult.data || []) as RawJuzContribution[];
  const simpleRecitations = (simpleResult.data || []) as RawSimpleRecitation[];
  const dhikrContributions = (dhikrResult.data || []) as RawDhikrContribution[];

  const contributorIds = Array.from(
    new Set([
      ...juzContributions.map((item) => item.contributor_id),
      ...simpleRecitations.map((item) => item.contributor_id),
      ...dhikrContributions.map((item) => item.contributor_id),
    ])
  );

  let contributorNameMap = new Map<string, string>();

  if (contributorIds.length > 0) {
    const { data: contributors, error: contributorsError } = await supabase
      .from("contributors")
      .select("id, display_name")
      .in("id", contributorIds);

    if (contributorsError) {
      throw new Error(contributorsError.message);
    }

    contributorNameMap = new Map(
      (contributors || []).map((contributor) => [
        contributor.id,
        contributor.display_name,
      ])
    );
  }

  const latestKhatam = khatams.at(-1) || null;

  const currentKhatamJuzCount = latestKhatam
    ? juzContributions.filter((item) => item.khatam_id === latestKhatam.id)
        .length
    : 0;

  const currentKhatamProgress: CurrentKhatamProgress | null = latestKhatam
    ? {
        id: latestKhatam.id,
        khatam_number: latestKhatam.khatam_number,
        status: latestKhatam.status,
        selected_juz_count: currentKhatamJuzCount,
        percentage: Math.round((currentKhatamJuzCount / 30) * 100),
      }
    : null;

  const totalFathihaCount = simpleRecitations
    .filter((item) => item.activity_type === "fathiha")
    .reduce((sum, item) => sum + item.count, 0);

  const totalYaseenCount = simpleRecitations
    .filter((item) => item.activity_type === "yaseen")
    .reduce((sum, item) => sum + item.count, 0);

  const totalDhikrCount = dhikrContributions.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const topContributorMap = new Map<string, TopContributorStat>();

  function ensureContributor(contributorId: string) {
    const existing = topContributorMap.get(contributorId);

    if (existing) {
      return existing;
    }

    const created: TopContributorStat = {
      contributor_id: contributorId,
      contributor_name: contributorNameMap.get(contributorId) || "Unknown",
      juz_count: 0,
      dhikr_count: 0,
      fathiha_count: 0,
      yaseen_count: 0,
      total_activity_score: 0,
    };

    topContributorMap.set(contributorId, created);

    return created;
  }

  juzContributions.forEach((item) => {
    const contributor = ensureContributor(item.contributor_id);
    contributor.juz_count += 1;
    contributor.total_activity_score += 1;
  });

  dhikrContributions.forEach((item) => {
    const contributor = ensureContributor(item.contributor_id);
    contributor.dhikr_count += item.count;
    contributor.total_activity_score += item.count;
  });

  simpleRecitations.forEach((item) => {
    const contributor = ensureContributor(item.contributor_id);

    if (item.activity_type === "fathiha") {
      contributor.fathiha_count += item.count;
    }

    if (item.activity_type === "yaseen") {
      contributor.yaseen_count += item.count;
    }

    contributor.total_activity_score += item.count;
  });

  const topContributors = Array.from(topContributorMap.values())
    .sort((a, b) => b.total_activity_score - a.total_activity_score)
    .slice(0, 10);

  const khatamNumberMap = new Map(
    khatams.map((khatam) => [khatam.id, khatam.khatam_number])
  );

  const recentJuzActivity: RecentActivityItem[] = juzContributions.map(
    (item) => ({
      id: item.id,
      type: "juz",
      label: `Khatam ${khatamNumberMap.get(item.khatam_id) || ""} - Juz ${
        item.juz_number
      }`,
      contributor_name:
        contributorNameMap.get(item.contributor_id) || "Unknown",
      count: 1,
      created_at: item.created_at,
    })
  );

  const recentSimpleActivity: RecentActivityItem[] = simpleRecitations.map(
    (item) => ({
      id: item.id,
      type: item.activity_type,
      label:
        item.activity_type === "fathiha"
          ? "സൂറത്തുൽ ഫാത്തിഹ"
          : "സൂറത്ത് യാസീൻ",
      contributor_name:
        contributorNameMap.get(item.contributor_id) || "Unknown",
      count: item.count,
      created_at: item.created_at,
    })
  );

  const recentDhikrActivity: RecentActivityItem[] = dhikrContributions.map(
    (item) => ({
      id: item.id,
      type: "dhikr",
      label: item.dhikr_type,
      contributor_name:
        contributorNameMap.get(item.contributor_id) || "Unknown",
      count: item.count,
      created_at: item.created_at,
    })
  );

  const recentActivity = [
    ...recentJuzActivity,
    ...recentSimpleActivity,
    ...recentDhikrActivity,
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 15);

  const completedKhatamHistory = khatams
    .filter((khatam) => khatam.status === "completed")
    .map((khatam) => ({
      id: khatam.id,
      khatam_number: khatam.khatam_number,
      completed_at: khatam.completed_at,
      selected_juz_count: juzContributions.filter(
        (item) => item.khatam_id === khatam.id
      ).length,
    }))
    .sort((a, b) => b.khatam_number - a.khatam_number);

  return {
    totalContributors: contributorIds.length,
    totalCompletedKhatams: completedKhatamHistory.length,
    totalJuzSelected: juzContributions.length,
    totalFathihaCount,
    totalYaseenCount,
    totalDhikrCount,
    currentKhatamProgress,
    topContributors,
    recentActivity,
    completedKhatamHistory,
  };
}