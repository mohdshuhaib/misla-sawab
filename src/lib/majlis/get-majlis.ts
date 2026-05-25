import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActivityType = "fathiha" | "yaseen" | "khatmul_quran" | "dhikr";

export type PublicMajlis = {
  id: string;
  slug: string;
  title: string;
  purpose: string;
  for_whom: string;
  description: string | null;
  default_language: "ml" | "en";
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  room_activities: {
    id: string;
    activity_type: ActivityType;
    enabled: boolean;
  }[];
};

export async function getPublicMajlisBySlug(
  slug: string
): Promise<PublicMajlis | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("majlis_rooms")
    .select(
      `
      id,
      slug,
      title,
      purpose,
      for_whom,
      description,
      default_language,
      status,
      created_at,
      updated_at,
      room_activities (
        id,
        activity_type,
        enabled
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublicMajlis;
}

export function getEnabledActivities(majlis: PublicMajlis) {
  return majlis.room_activities
    .filter((activity) => activity.enabled)
    .map((activity) => activity.activity_type);
}

export function isActivityEnabled(
  majlis: PublicMajlis,
  activityType: ActivityType
) {
  return majlis.room_activities.some(
    (activity) => activity.activity_type === activityType && activity.enabled
  );
}