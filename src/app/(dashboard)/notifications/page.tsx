"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";
import { useRealtimeNotifications } from "@/lib/use-realtime-notifications";

const TYPE_LABEL: Record<string, string> = {
  team_request: "New request",
  team_accepted: "Accepted",
  team_rejected: "Declined",
};

export default function NotificationsPage() {
  const { user } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await apiFetch("/api/notifications");
    setNotifications(res.notifications);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Live push updates via Supabase Realtime instead of polling.
  useRealtimeNotifications(user?.id, load);

  const markAllRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ mark_all_read: true }) });
    await load();
  };

  const markRead = async (id: string) => {
    await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ notification_id: id }) });
    await load();
  };

  if (loading) return <p className="text-slate-400">Loading notifications…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="outline" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">You&apos;re all caught up.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {notifications.map((n) => (
            <Card
              key={n.notification_id}
              className={`flex items-start justify-between gap-3 p-4 ${n.is_read ? "opacity-60" : ""}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge color={n.is_read ? "slate" : "indigo"}>{TYPE_LABEL[n.type] || n.type}</Badge>
                  <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{n.message}</p>
              </div>
              {!n.is_read && (
                <Button variant="ghost" onClick={() => markRead(n.notification_id)}>
                  Mark read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
