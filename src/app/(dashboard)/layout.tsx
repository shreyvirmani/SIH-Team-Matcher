"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">Loading…</div>;
  }
  if (!user) return null;

  return <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>;
}
