import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MajlisListItem = {
  id: string;
  slug: string;
  title: string;
  for_whom: string;
  created_at: string;
};

export async function getActiveMajlisList(): Promise<MajlisListItem[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("majlis_rooms")
    .select("id, slug, title, for_whom, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Active Majlis list fetch error:", error.message);
    return [];
  }

  return data || [];
}
