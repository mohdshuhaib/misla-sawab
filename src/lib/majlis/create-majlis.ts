import { supabase } from "@/lib/supabase/client";

export type MajlisActivity =
  | "fathiha"
  | "yaseen"
  | "khatmul_quran"
  | "dhikr";

export type CreateMajlisInput = {
  title?: string;
  purpose: string;
  forWhom: string;
  description?: string;
  defaultLanguage: "ml" | "en";
  activities: MajlisActivity[];
};

export type CreateMajlisResult = {
  majlisId: string;
  slug: string;
  managerToken: string;
};

export async function createMajlis(
  input: CreateMajlisInput
): Promise<CreateMajlisResult> {
  const { data, error } = await supabase.rpc("create_majlis", {
    p_title: input.title || "",
    p_purpose: input.purpose,
    p_for_whom: input.forWhom,
    p_description: input.description || "",
    p_default_language: input.defaultLanguage,
    p_activities: input.activities,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error("Majlis creation failed. Please try again.");
  }

  return {
    majlisId: result.majlis_id,
    slug: result.majlis_slug,
    managerToken: result.manager_token,
  };
}