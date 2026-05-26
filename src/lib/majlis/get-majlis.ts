import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActivityType = "fathiha" | "yaseen" | "khatmul_quran" | "dhikr";

export type PublicMajlis = {
  id: string;
  slug: string;
  title: string;
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

  const { data: majlis, error: majlisError } = await supabase
    .from("majlis_rooms")
    .select(
      `
      id,
      slug,
      title,
      for_whom,
      description,
      default_language,
      status,
      created_at,
      updated_at
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (majlisError) {
    console.error("Majlis fetch error:", majlisError.message);
    return null;
  }

  if (!majlis) {
    console.error("Majlis not found for slug:", slug);
    return null;
  }

  const { data: activities, error: activitiesError } = await supabase
    .from("room_activities")
    .select("id, activity_type, enabled")
    .eq("room_id", majlis.id)
    .eq("enabled", true);

  if (activitiesError) {
    console.error("Activities fetch error:", activitiesError.message);
    return null;
  }

  return {
    ...majlis,
    room_activities: activities || [],
  } as PublicMajlis;
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