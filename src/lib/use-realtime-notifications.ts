"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to the `notifications` table via Supabase Realtime (see
 * `alter publication supabase_realtime add table notifications` in
 * schema.postgres.sql) and calls `onEvent` whenever a row is inserted or
 * updated for this user, so callers can re-fetch their own view of the
 * data instead of polling.
 */
export function useRealtimeNotifications(userId: string | undefined, onEvent: () => void) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channelId = `notifications:${userId}:${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `receiver_profile_id=eq.${userId}` },
        () => onEvent()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `receiver_profile_id=eq.${userId}` },
        () => onEvent()
      )
      .subscribe();

    // Slow fallback poll in case the websocket connection is ever dropped
    // by a restrictive network (some campus wifi blocks long-lived sockets).
    const fallback = setInterval(onEvent, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}
