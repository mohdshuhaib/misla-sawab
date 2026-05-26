import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { roomId?: string };
    const roomId = body.roomId?.trim();

    if (!roomId) {
      return NextResponse.json(
        { message: "Missing Majlis room id" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: existing, error: rpcError } = await supabase.rpc(
      "create_next_khatam",
      {
        p_room_id: roomId,
      }
    );

    if (!rpcError) {
      return NextResponse.json(existing);
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          message:
            "The database function must be updated before creating the next Khatam from a fully reserved Khatam.",
        },
        { status: 500 }
      );
    }

    const { data: khatams, error: khatamError } = await supabase
      .from("khatams")
      .select("id, khatam_number, status")
      .eq("room_id", roomId)
      .order("khatam_number", { ascending: true });

    if (khatamError) {
      throw new Error(khatamError.message);
    }

    const latest = khatams?.at(-1);

    if (!latest) {
      throw new Error(rpcError.message);
    }

    const { count, error: countError } = await supabase
      .from("juz_contributions")
      .select("id", { count: "exact", head: true })
      .eq("room_id", roomId)
      .eq("khatam_id", latest.id);

    if (countError) {
      throw new Error(countError.message);
    }

    if ((count || 0) < 30) {
      return NextResponse.json(
        { message: "All 30 Juz must be reserved before creating the next Khatam" },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("khatams")
      .insert({
        room_id: roomId,
        khatam_number: latest.khatam_number + 1,
        status: "active",
      })
      .select("id, room_id, khatam_number, status, created_at, completed_at")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json(inserted);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not create a new Khatam",
      },
      { status: 500 }
    );
  }
}
