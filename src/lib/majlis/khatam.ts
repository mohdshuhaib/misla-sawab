import { supabase } from "@/lib/supabase/client";

export type JuzContribution = {
  id: string;
  room_id: string;
  khatam_id: string;
  juz_number: number;
  contributor_id: string;
  contributor_name: string;
  created_at: string;
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
    .select("id, room_id, khatam_id, juz_number, contributor_id, created_at")
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

export async function createNextKhatam(roomId: string) {
  const { data, error } = await supabase.rpc("create_next_khatam", {
    p_room_id: roomId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}