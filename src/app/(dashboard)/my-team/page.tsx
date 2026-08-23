"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Avatar from "@/components/profile/Avatar";
import TeamChat from "@/components/team/TeamChat";
import TeamProblemStatementSelector from "@/components/team/TeamProblemStatementSelector";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

export default function MyTeamPage() {
  const { user } = useSession();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [lookups, setLookups] = useState<any>(null);
  const [form, setForm] = useState({ name: "", problemStatementId: "" });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/teams");
      if (res.team) {
        const detail = await apiFetch(`/api/teams/${res.team.id}`);
        setTeam(detail);
      } else {
        setTeam(null);
      }
    } catch {
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    apiFetch("/api/lookups").then(setLookups).catch(() => {});
  }, []);

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Team name is required");
    if (!form.problemStatementId) return setError("Please select a target SIH problem statement");
    setCreating(true);
    setError("");
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

  if (loading) return <p className="text-slate-400 py-12 text-center">Loading your team…</p>;

  if (!team) {
    return (
      <div className="mx-auto max-w-xl pb-16 pt-4">
        <h1 className="text-2xl font-bold text-white">Create Your Team</h1>
        <p className="mt-1 text-sm text-slate-400">
          You don&apos;t have a team yet. Create one as the team leader, or accept a team request to join someone else&apos;s squad.
        </p>
        <Card className="mt-6 p-6">
          <form onSubmit={createTeam} className="flex flex-col gap-5">
            <Input
              label="Team Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. CodeForge SIH Warriors"
            />

            <TeamProblemStatementSelector
              problemStatements={lookups?.problemStatements || []}
              selectedId={form.problemStatementId}
              onChange={(id) => setForm({ ...form, problemStatementId: id })}
            />

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}
            <Button type="submit" loading={creating} className="w-full">
              Create Team & Open Recruitment
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-sm text-slate-400">{team.problem_statement_name}</p>
        </div>
        <Badge color="indigo">
          {team.members.length} / 6 members
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          {/* Members List */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Squad Members ({team.members.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {team.members.map((m: any) => (
                <Card key={m.profile_id} className="flex flex-col justify-between p-4 gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar url={m.avatar_url} name={m.name} size={40} />
                      <div>
                        <Link
                          href={`/profile/${m.profile_id}`}
                          className="font-semibold text-white hover:text-indigo-300 transition-colors line-clamp-1"
                        >
                          {m.name}
                        </Link>
                        {m.college && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{m.college}</p>
                        )}
                      </div>
                    </div>
                    {m.is_leader && (
                      <Badge color="amber">Leader</Badge>
                    )}
                  </div>

                  {/* Teammate Contact / Mobile */}
                  {m.phone_number ? (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                      <a
                        href={`tel:${m.phone_number}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-emerald-300 hover:bg-emerald-500/20 transition-colors font-mono font-medium"
                        title="Call teammate"
                      >
                        <span>📞</span>
                        <span>{m.phone_number}</span>
                      </a>
                      <a
                        href={`https://wa.me/${m.phone_number.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 border border-green-500/20 px-2 py-1 text-green-300 hover:bg-green-500/20 transition-colors font-medium"
                        title="Message on WhatsApp"
                      >
                        <span>💬 WhatsApp</span>
                      </a>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No mobile number added</span>
                  )}

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1">
                    {m.roles.map((r: string) => (
                      <Badge key={r} color="slate">
                        {r}
                      </Badge>
                    ))}
                  </div>

                  {team.leader_profile_id === user?.id && !m.is_leader && (
                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      <Button
                        variant="ghost"
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 py-1 h-auto"
                        onClick={() => removeMember(m.profile_id)}
                      >
                        Remove Member
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Composition Gaps */}
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-5">
            <h3 className="font-semibold text-amber-300">Team composition gaps</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {team.missing_roles_skills.roles.length === 0 &&
              team.missing_roles_skills.skills.length === 0 ? (
                <p className="text-sm text-amber-200">
                  🎉 Your team has all essential roles and core skills covered!
                </p>
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
        </div>

        {/* Live Team Chat */}
        <div>
          <TeamChat teamId={team.team_id} currentUserId={user?.id} />
        </div>
      </div>
    </div>
  );
}
