"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Postgres changes on `notifications` for the current user via
 * Supabase Realtime (WebSockets) — replaces the polling approach from the
 * demo build. Falls back gracefully: if Realtime isn't reachable (e.g. a
 * network that blocks WebSockets), the caller's own initial fetch on mount
 * still shows existing notifications; only live push updates are missed.
 */
export function useRealtimeNotifications(userId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_profile_id=eq.${userId}`,
        },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}
