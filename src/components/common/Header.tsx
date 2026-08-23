"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { useRealtimeNotifications } from "@/lib/use-realtime-notifications";
import { apiFetch } from "@/lib/api-client";
import Button from "@/components/ui/button";
import Avatar from "@/components/profile/Avatar";
import SIHLogo from "@/components/common/SIHLogo";

const NAV_ITEMS = [
  { href: "/discover", label: "Discover" },
  { href: "/my-team", label: "My Team" },
  { href: "/my-requests", label: "My Requests" },
  { href: "/saved", label: "Saved" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const { user, profile, loading, refresh } = useSession();
  const pathname = usePathname();
  const router = useRouter();
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

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        <Link
          href={user ? "/discover" : "/"}
          className="flex items-center gap-2 group transition-transform"
        >
          <SIHLogo size="sm" showText={true} />
        </Link>

        {!loading && user && (
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href ? "bg-indigo-500/15 text-indigo-300" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
                {item.href === "/notifications" && unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white shadow-[0_0_8px_-1px_rgba(217,70,239,0.9)]">
                    {unread}
                  </span>
                )}
              </Link>
            ))}
            {profile?.isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/admin/dashboard" ? "bg-indigo-500/15 text-indigo-300" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <Link href="/my-profile" className="hidden items-center gap-2 sm:flex p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <Avatar url={profile?.avatarUrl} name={profile?.fullName || user.email} size={28} />
                <span className="text-sm text-slate-300 hover:text-white font-medium truncate max-w-[130px]">
                  {profile?.fullName || user.email.split("@")[0]}
                </span>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="text-xs">
                Log out
              </Button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">Sign up</Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
