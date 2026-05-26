import { supabase } from "@/lib/supabase/client";

export type JuzContributionStatus = "selected" | "completed";

export type JuzContribution = {
  id: string;
  room_id: string;
  khatam_id: string;
  juz_number: number;
  contributor_id: string;
  contributor_name: string;
  status: JuzContributionStatus;
  created_at: string;
  completed_at: string | null;
};

export type KhatamState = {
  id: string;
  room_id: string;
  khatam_number: number;
  status: "active" | "completed";
  created_at: string;
  completed_at: string | null;
  contributions: JuzContribution[];
};

export type KhatamOverview = {
  currentKhatam: KhatamState | null;
  reservedPendingKhatams: KhatamState[];
  latestKhatam: KhatamState | null;
};

async function attachContributions(
  roomId: string,
  khatams: Omit<KhatamState, "contributions">[]
): Promise<KhatamState[]> {
  if (khatams.length === 0) {
    return [];
  }

  const khatamIds = khatams.map((khatam) => khatam.id);

  const { data: contributions, error: contributionsError } = await supabase
    .from("juz_contributions")
    .select(
      "id, room_id, khatam_id, juz_number, contributor_id, status, created_at, completed_at"
    )
    .eq("room_id", roomId)
    .in("khatam_id", khatamIds)
    .order("juz_number", { ascending: true });

  if (contributionsError) {
    throw new Error(contributionsError.message);
  }

  const contributorIds = Array.from(
    new Set((contributions || []).map((item) => item.contributor_id))
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

  const contributionMap = new Map<string, JuzContribution[]>();

  (contributions || []).forEach((item) => {
    const mappedItem = {
      ...item,
      status: item.status as JuzContributionStatus,
      contributor_name: contributorNameMap.get(item.contributor_id) || "Unknown",
    };

    const items = contributionMap.get(item.khatam_id) || [];
    items.push(mappedItem);
    contributionMap.set(item.khatam_id, items);
  });

  return khatams.map((khatam) => ({
    ...khatam,
    contributions: contributionMap.get(khatam.id) || [],
  }));
}

export async function getKhatamOverview(
  roomId: string
): Promise<KhatamOverview> {
  const { data: khatams, error: khatamError } = await supabase
    .from("khatams")
    .select("id, room_id, khatam_number, status, created_at, completed_at")
    .eq("room_id", roomId)
    .order("khatam_number", { ascending: true });

  if (khatamError) {
    throw new Error(khatamError.message);
  }

  const states = await attachContributions(
    roomId,
    ((khatams || []) as Omit<KhatamState, "contributions">[]).map(
      (khatam) => ({
        ...khatam,
        status: khatam.status as KhatamState["status"],
      })
    )
  );

  const latestKhatam = states.at(-1) || null;
  const currentKhatam =
    states.find(
      (khatam) =>
        khatam.status !== "completed" && khatam.contributions.length < 30
    ) || null;
  const reservedPendingKhatams = states.filter(
    (khatam) =>
      khatam.status !== "completed" &&
      khatam.contributions.length >= 30 &&
      khatam.contributions.some((item) => item.status !== "completed")
  );

  return {
    currentKhatam,
    reservedPendingKhatams,
    latestKhatam,
  };
}

export async function getLatestKhatamState(
  roomId: string
): Promise<KhatamState | null> {
  const { data: khatam, error: khatamError } = await supabase
    .from("khatams")
    .select("id, room_id, khatam_number, status, created_at, completed_at")
    .eq("room_id", roomId)
    .order("khatam_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (khatamError) {
    throw new Error(khatamError.message);
  }

  if (!khatam) {
    return null;
  }

  const { data: contributions, error: contributionsError } = await supabase
    .from("juz_contributions")
    .select(
      "id, room_id, khatam_id, juz_number, contributor_id, status, created_at, completed_at"
    )
    .eq("room_id", roomId)
    .eq("khatam_id", khatam.id)
    .order("juz_number", { ascending: true });

  if (contributionsError) {
    throw new Error(contributionsError.message);
  }

  const contributorIds = Array.from(
    new Set((contributions || []).map((item) => item.contributor_id))
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

  return {
    ...khatam,
    contributions: (contributions || []).map((item) => ({
      ...item,
      status: item.status as JuzContributionStatus,
      contributor_name:
        contributorNameMap.get(item.contributor_id) || "Unknown",
    })),
  } as KhatamState;
}

export async function selectJuzContribution(params: {
  roomId: string;
  khatamId: string;
  juzNumbers: number[];
  displayName: string;
}) {
  const { data, error } = await supabase.rpc("select_juz", {
    p_room_id: params.roomId,
    p_khatam_id: params.khatamId,
    p_juz_numbers: params.juzNumbers,
    p_display_name: params.displayName,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function completeJuzContribution(params: {
  roomId: string;
  khatamId: string;
  juzNumbers: number[];
  displayName: string;
}) {
  const { data, error } = await supabase.rpc("complete_juz", {
    p_room_id: params.roomId,
    p_khatam_id: params.khatamId,
    p_juz_numbers: params.juzNumbers,
    p_display_name: params.displayName,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createNextKhatam(roomId: string) {
  const response = await fetch("/api/khatam/create-next", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(error?.message || "Could not create a new Khatam");
  }

  return response.json();
}
