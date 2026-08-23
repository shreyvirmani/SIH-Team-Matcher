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
  { href: "/discover", label: "Discover", icon: "🔍" },
  { href: "/my-team", label: "My Team", icon: "👥" },
  { href: "/my-requests", label: "My Requests", icon: "📩" },
  { href: "/saved", label: "Saved", icon: "🔖" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Header() {
  const { user, profile, loading, refresh } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useRealtimeNotifications(user?.id, loadUnread);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await apiFetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            {!loading && user && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white md:hidden transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
                {unread > 0 && !mobileMenuOpen && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.9)]" />
                )}
              </button>
            )}

            <Link
              href={user ? "/discover" : "/"}
              className="flex items-center gap-2 group transition-transform"
            >
              <SIHLogo size="sm" showText={true} />
            </Link>
          </div>

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
                <Button variant="outline" onClick={handleLogout} className="hidden sm:inline-flex text-xs">
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

      {/* Mobile Slide-Out Sidebar Drawer */}
      {!loading && user && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
              mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Drawer Sidebar */}
          <div
            className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] border-r border-white/10 bg-slate-950/95 p-5 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-out md:hidden flex flex-col justify-between ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <SIHLogo size="sm" showText={true} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* User Profile Card */}
              <Link
                href="/my-profile"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors"
              >
                <Avatar url={profile?.avatarUrl} name={profile?.fullName || user.email} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-white truncate">
                    {profile?.fullName || user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-indigo-400 truncate">View & edit profile →</p>
                </div>
              </Link>

              {/* Navigation Items */}
              <nav className="mt-5 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.href === "/notifications" && unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia-500 px-1.5 text-[11px] font-bold text-white shadow-[0_0_10px_rgba(217,70,239,0.8)]">
                          {unread}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {profile?.isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      pathname === "/admin/dashboard"
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-base">🛡️</span>
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Logout Action */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
              >
                <span>🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
