import { supabase } from "@/lib/supabase/client";
import type { MajlisActivity } from "@/lib/majlis/create-majlis";

export type ManagerRoom = {
  id: string;
  slug: string;
  title: string;
  for_whom: string;
  description: string | null;
  default_language: "ml" | "en";
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export type ManagerActivity = {
  id: string;
  room_id: string;
  activity_type: MajlisActivity;
  enabled: boolean;
};

export type ManagerKhatam = {
  id: string;
  room_id: string;
  khatam_number: number;
  status: "active" | "completed";
  created_at: string;
  completed_at: string | null;
  selected_juz_count: number;
};

export type ManagerJuzContribution = {
  id: string;
  room_id: string;
  khatam_id: string;
  khatam_number: number;
  juz_number: number;
  contributor_id: string;
  contributor_name: string;
  created_at: string;
};

export type ManagerDhikrContribution = {
  id: string;
  room_id: string;
  contributor_id: string;
  contributor_name: string;
  dhikr_type: string;
  count: number;
  created_at: string;
};

export type ManagerSimpleRecitation = {
  id: string;
  room_id: string;
  activity_type: "fathiha" | "yaseen";
  contributor_id: string;
  contributor_name: string;
  count: number;
  created_at: string;
};

export type ManagerMajlisState = {
  room: ManagerRoom;
  activities: ManagerActivity[];
  khatams: ManagerKhatam[];
  juz_contributions: ManagerJuzContribution[];
  dhikr_contributions: ManagerDhikrContribution[];
  simple_recitations: ManagerSimpleRecitation[];
};

export async function getManagerMajlis(params: {
  slug: string;
  managerToken: string;
}): Promise<ManagerMajlisState> {
  const { data, error } = await supabase.rpc("manager_get_majlis", {
    p_slug: params.slug,
    p_manager_token: params.managerToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as ManagerMajlisState;
}

export async function updateManagerMajlis(params: {
  roomId: string;
  managerToken: string;
  title: string;
  forWhom: string;
  description: string;
  defaultLanguage: "ml" | "en";
  activities: MajlisActivity[];
}) {
  const { data, error } = await supabase.rpc("manager_update_majlis", {
    p_room_id: params.roomId,
    p_manager_token: params.managerToken,
    p_title: params.title,
    p_for_whom: params.forWhom,
    p_description: params.description,
    p_default_language: params.defaultLanguage,
    p_activities: params.activities,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function archiveManagerMajlis(params: {
  roomId: string;
  managerToken: string;
}) {
  const { data, error } = await supabase.rpc("manager_archive_majlis", {
    p_room_id: params.roomId,
    p_manager_token: params.managerToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteManagerJuzContribution(params: {
  contributionId: string;
  managerToken: string;
}) {
  const { data, error } = await supabase.rpc(
    "manager_delete_juz_contribution",
    {
      p_contribution_id: params.contributionId,
      p_manager_token: params.managerToken,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteManagerDhikrContribution(params: {
  contributionId: string;
  managerToken: string;
}) {
  const { data, error } = await supabase.rpc(
    "manager_delete_dhikr_contribution",
    {
      p_contribution_id: params.contributionId,
      p_manager_token: params.managerToken,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteManagerSimpleRecitation(params: {
  contributionId: string;
  managerToken: string;
}) {
  const { data, error } = await supabase.rpc(
    "manager_delete_simple_recitation",
    {
      p_contribution_id: params.contributionId,
      p_manager_token: params.managerToken,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}