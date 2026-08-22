"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { apiFetch } from "@/lib/api-client";
import Button from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/discover", label: "Discover" },
  { href: "/my-team", label: "My Team" },
  { href: "/my-requests", label: "My Requests" },
  { href: "/notifications", label: "Notifications" },
];

export default function Header() {
  const { user, profile, loading, refresh } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">S</span>
          SIH Team Matcher
        </Link>

        {!loading && user && (
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {profile?.isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/admin/dashboard" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <Link href="/my-profile" className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block">
                {profile?.fullName || user.email}
              </Link>
              <Button variant="outline" onClick={handleLogout}>
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
