"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import { apiFetch } from "@/lib/api-client";
import { useRealtimeNotifications } from "@/lib/use-realtime-notifications";

export default function MobileBottomNav() {
  const { user } = useSession();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  const loadUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiFetch("/api/notifications?is_read=false");
      setUnread(res.notifications.length);
    } catch {
      // non-fatal
    }
  }, [user]);

  useEffect(() => {
    loadUnread();
  }, [loadUnread]);

  useRealtimeNotifications(user?.id, loadUnread);

  if (!user || pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const TABS = [
    { href: "/discover", label: "Discover", icon: "🔍" },
    { href: "/my-team", label: "My Team", icon: "👥" },
    { href: "/my-requests", label: "Requests", icon: "📩" },
    { href: "/notifications", label: "Alerts", icon: "🔔", badge: unread },
    { href: "/my-profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl md:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-indigo-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <span className="text-lg relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[9px] font-bold text-white shadow-[0_0_6px_rgba(217,70,239,0.9)]">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
