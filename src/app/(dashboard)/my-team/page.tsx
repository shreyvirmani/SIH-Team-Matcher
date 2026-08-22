"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

export default function MyTeamPage() {
  const { user } = useSession();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lookups, setLookups] = useState<any>(null);
  const [form, setForm] = useState({ name: "", problemStatementId: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/api/teams");
    if (res.team) {
      const detail = await apiFetch(`/api/teams/${res.team.id}`);
      setTeam(detail);
    } else {
      setTeam(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    apiFetch("/api/lookups").then(setLookups).catch(() => {});
  }, []);

  useEffect(() => {
    if (team && team.missing_roles_skills?.skills?.length > 0) {
      const params = new URLSearchParams();
      for (const s of team.missing_roles_skills.skills.slice(0, 2)) params.append("skills", s);
      params.set("limit", "3");
      apiFetch(`/api/profiles?${params.toString()}`)
        .then((res) => setSuggestions(res.profiles))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [team]);

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await apiFetch("/api/teams", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          problem_statement_id: Number(form.problemStatementId),
          initial_member_profile_ids: [],
        }),
      });
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const removeMember = async (profileId: string) => {
    await apiFetch(`/api/teams/${team.team_id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "remove_member", profile_id: profileId }),
    });
    await load();
  };

  if (loading) return <p className="text-slate-500">Loading your team…</p>;

  if (!team) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-slate-900">Create your team</h1>
        <p className="mt-1 text-sm text-slate-600">
          You don&apos;t have a team yet. Create one, or accept a team request to join someone else&apos;s.
        </p>
        <Card className="mt-6 p-6">
          <form onSubmit={createTeam} className="flex flex-col gap-4">
            <Input label="Team name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select
              label="Problem statement"
              required
              value={form.problemStatementId}
              onChange={(e) => setForm({ ...form, problemStatementId: e.target.value })}
            >
              <option value="">Select a problem statement</option>
              {lookups?.problemStatements.map((ps: any) => (
                <option key={ps.id} value={ps.id}>
                  {ps.title}
                </option>
              ))}
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={creating}>
              Create team
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
          <p className="text-sm text-slate-600">{team.problem_statement_name}</p>
        </div>
        <Badge color="indigo">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {team.members.map((m: any) => (
          <Card key={m.profile_id} className="flex items-start justify-between p-4">
            <div>
              <Link href={`/profile/${m.profile_id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                {m.name} {m.is_leader && <Badge color="amber">Leader</Badge>}
              </Link>
              <div className="mt-1 flex flex-wrap gap-1">
                {m.roles.map((r: string) => (
                  <Badge key={r}>{r}</Badge>
                ))}
              </div>
            </div>
            {team.leader_profile_id === user?.id && !m.is_leader && (
              <Button variant="ghost" onClick={() => removeMember(m.profile_id)}>
                Remove
              </Button>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">Team composition gaps</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {team.missing_roles_skills.roles.length === 0 && team.missing_roles_skills.skills.length === 0 ? (
            <p className="text-sm text-amber-800">Your team looks well-rounded!</p>
          ) : (
            <>
              {team.missing_roles_skills.roles.map((r: string) => (
                <Badge key={r} color="amber">
                  Missing role: {r}
                </Badge>
              ))}
              {team.missing_roles_skills.skills.map((s: string) => (
                <Badge key={s} color="amber">
                  Missing skill: {s}
                </Badge>
              ))}
            </>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-900">Suggested teammates to fill the gap</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {suggestions.map((s: any) => (
              <Card key={s.profile_id} className="p-4">
                <Link href={`/profile/${s.profile_id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                  {s.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.skills.slice(0, 3).map((sk: string) => (
                    <Badge key={sk} color="indigo">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
