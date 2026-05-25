import { supabase } from "@/lib/supabase/client";

export type SurahActivityType = "fathiha" | "yaseen";

export type SurahContribution = {
  id: string;
  room_id: string;
  activity_type: SurahActivityType;
  contributor_id: string;
  contributor_name: string;
  count: number;
  created_at: string;
};

export type SurahContributorStat = {
  contributor_id: string;
  contributor_name: string;
  total_count: number;
  contribution_count: number;
};

export type SurahState = {
  totalCount: number;
  totalContributions: number;
  recentContributions: SurahContribution[];
  contributorStats: SurahContributorStat[];
};

export async function getSurahState(params: {
  roomId: string;
  activityType: SurahActivityType;
}): Promise<SurahState> {
  const { data: contributions, error: contributionsError } = await supabase
    .from("simple_recitations")
    .select("id, room_id, activity_type, contributor_id, count, created_at")
    .eq("room_id", params.roomId)
    .eq("activity_type", params.activityType)
    .order("created_at", { ascending: false });

  if (contributionsError) {
    throw new Error(contributionsError.message);
  }

  const rows = contributions || [];

  const contributorIds = Array.from(
    new Set(rows.map((item) => item.contributor_id))
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

  const mappedContributions: SurahContribution[] = rows.map((item) => ({
    ...item,
    activity_type: item.activity_type as SurahActivityType,
    contributor_name: contributorNameMap.get(item.contributor_id) || "Unknown",
  }));

  const totalCount = mappedContributions.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const contributorStatsMap = new Map<string, SurahContributorStat>();

  mappedContributions.forEach((item) => {
    const existing = contributorStatsMap.get(item.contributor_id);

    if (existing) {
      existing.total_count += item.count;
      existing.contribution_count += 1;
    } else {
      contributorStatsMap.set(item.contributor_id, {
        contributor_id: item.contributor_id,
        contributor_name: item.contributor_name,
        total_count: item.count,
        contribution_count: 1,
      });
    }
  });

  return {
    totalCount,
    totalContributions: mappedContributions.length,
    recentContributions: mappedContributions.slice(0, 12),
    contributorStats: Array.from(contributorStatsMap.values()).sort(
      (a, b) => b.total_count - a.total_count
    ),
  };
}

export async function addSurahRecitation(params: {
  roomId: string;
  activityType: SurahActivityType;
  displayName: string;
  count: number;
}) {
  const { data, error } = await supabase.rpc("add_simple_recitation", {
    p_room_id: params.roomId,
    p_activity_type: params.activityType,
    p_display_name: params.displayName,
    p_count: params.count,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}