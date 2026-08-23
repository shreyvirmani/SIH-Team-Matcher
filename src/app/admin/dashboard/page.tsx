"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import BackButton from "@/components/common/BackButton";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

export default function AdminDashboardPage() {
  const { profile, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [problemStatements, setProblemStatements] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!sessionLoading && (!profile || !profile.isAdmin)) {
      router.replace("/discover");
    }
  }, [profile, sessionLoading, router]);

  const loadData = async () => {
    try {
      const [s, ps] = await Promise.all([
        apiFetch("/api/admin/stats"),
        apiFetch("/api/admin/problem-statements"),
      ]);
      setStats(s.stats);
      setProblemStatements(ps.problemStatements);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (profile?.isAdmin) {
      loadData();
    }
  }, [profile]);

  const createPs = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiFetch("/api/admin/problem-statements", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ title: "", description: "", category: "" });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (sessionLoading || !stats) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-slate-400">Loading admin dashboard…</div>;
  }

  const statCards = [
    { label: "Total students", value: stats.totalProfiles },
    { label: "Total teams", value: stats.totalTeams },
    { label: "Team requests", value: stats.totalRequests },
    { label: "Pending requests", value: stats.pendingRequests },
    { label: "Accepted requests", value: stats.acceptedRequests },
    { label: "Active problem statements", value: stats.activeProblemStatements },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton href="/discover" label="Back to Discover" />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Live platform analytics and SIH problem statement manager.</p>
          </div>
        </div>
        <Badge color="amber">Super Admin</Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-300">{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Problem statements</h2>
          <div className="mt-3 flex flex-col gap-2">
            {problemStatements.map((ps) => (
              <Card key={ps.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold text-white">{ps.title}</p>
                  <p className="text-xs text-slate-400">
                    Category: {ps.category || "General"} • {ps._count?.profiles || 0} students
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Add problem statement</h2>
          <Card className="mt-3 p-5">
            <form onSubmit={createPs} className="flex flex-col gap-3">
              <Input
                label="Title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                label="Category"
                placeholder="e.g. Smart Automation, Healthcare"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <Button type="submit" loading={creating}>
                Save
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
