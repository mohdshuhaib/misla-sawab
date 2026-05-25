"use client";

import { useEffect, useMemo } from "react";

import { supabase } from "@/lib/supabase/client";

export type RealtimeTable =
  | "juz_contributions"
  | "khatams"
  | "dhikr_contributions"
  | "simple_recitations";

type UseMajlisRealtimeOptions = {
  roomId: string;
  onChange: () => void;
  tables?: RealtimeTable[];
};

const defaultTables: RealtimeTable[] = [
  "juz_contributions",
  "khatams",
  "dhikr_contributions",
  "simple_recitations",
];

export function useMajlisRealtime({
  roomId,
  onChange,
  tables = defaultTables,
}: UseMajlisRealtimeOptions) {
  const tableKey = useMemo(() => tables.join("|"), [tables]);

  useEffect(() => {
    if (!roomId) return;

    let channel = supabase.channel(`majlis-realtime-${roomId}-${tableKey}`);

    tables.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `room_id=eq.${roomId}`,
        },
        () => onChange()
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, onChange, tableKey, tables]);
}