import { supabase } from "@/lib/supabase/client";

export type DhikrContribution = {
  id: string;
  room_id: string;
  contributor_id: string;
  contributor_name: string;
  dhikr_type: string;
  count: number;
  created_at: string;
};

export type DhikrContributorStat = {
  contributor_id: string;
  contributor_name: string;
  total_count: number;
  contribution_count: number;
};

export type DhikrTypeStat = {
  dhikr_type: string;
  total_count: number;
  contribution_count: number;
};

export type DhikrState = {
  totalCount: number;
  totalContributions: number;
  recentContributions: DhikrContribution[];
  contributorStats: DhikrContributorStat[];
  dhikrTypeStats: DhikrTypeStat[];
};

export async function getDhikrState(roomId: string): Promise<DhikrState> {
  const { data: contributions, error: contributionsError } = await supabase
    .from("dhikr_contributions")
    .select("id, room_id, contributor_id, dhikr_type, count, created_at")
    .eq("room_id", roomId)
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

  const mappedContributions: DhikrContribution[] = rows.map((item) => ({
    ...item,
    contributor_name: contributorNameMap.get(item.contributor_id) || "Unknown",
  }));

  const totalCount = mappedContributions.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const contributorStatsMap = new Map<string, DhikrContributorStat>();

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

  const dhikrTypeStatsMap = new Map<string, DhikrTypeStat>();

  mappedContributions.forEach((item) => {
    const existing = dhikrTypeStatsMap.get(item.dhikr_type);

    if (existing) {
      existing.total_count += item.count;
      existing.contribution_count += 1;
    } else {
      dhikrTypeStatsMap.set(item.dhikr_type, {
        dhikr_type: item.dhikr_type,
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
    dhikrTypeStats: Array.from(dhikrTypeStatsMap.values()).sort(
      (a, b) => b.total_count - a.total_count
    ),
  };
}

export async function addDhikrContribution(params: {
  roomId: string;
  displayName: string;
  dhikrType: string;
  count: number;
}) {
  const { data, error } = await supabase.rpc("add_dhikr_contribution", {
    p_room_id: params.roomId,
    p_display_name: params.displayName,
    p_dhikr_type: params.dhikrType,
    p_count: params.count,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}