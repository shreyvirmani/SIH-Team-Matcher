"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";
import { apiFetch } from "@/lib/api-client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/api/notifications");
    setNotifications(res.notifications);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) });
    await load();
  };

  const markRead = async (id: string) => {
    await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ notification_id: id }) });
    await load();
  };

  if (loading) return <p className="text-slate-400">Loading notifications…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16 pt-2">
      <div className="flex items-center justify-between">
        <BackButton href="/discover" label="Back to Discover" />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="outline" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">No notifications yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-center justify-between p-4 ${
                n.is_read ? "opacity-60" : "border-indigo-500/40"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm text-white">{n.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              {!n.is_read && (
                <Button variant="ghost" onClick={() => markRead(n.id)}>
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
