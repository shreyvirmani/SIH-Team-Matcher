"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Avatar from "@/components/profile/Avatar";
import BackButton from "@/components/common/BackButton";
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
  const [form, setForm] = useState({
    name: "",
    problemStatementId: undefined as number | undefined,
  });
  const [error, setError] = useState("");
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, lRes] = await Promise.all([
        apiFetch("/api/teams"),
        apiFetch("/api/lookups"),
      ]);
      setTeam(tRes.team);
      setLookups(lRes);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await apiFetch("/api/teams", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          problemStatementId: form.problemStatementId,
        }),
      });
      setTeam(res.team);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!team) return;
    setMemberActionLoading(memberId);
    try {
      await apiFetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "remove_member", memberId }),
      });
      await load();
    } finally {
      setMemberActionLoading(null);
    }
  };

  const leaveTeam = async () => {
    if (!team) return;
    await apiFetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "leave" }),
    });
    await load();
  };

  if (loading) return <p className="text-slate-400 py-12 text-center">Loading your team…</p>;

  if (!team) {
    return (
      <div className="mx-auto max-w-xl pb-16 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <BackButton href="/discover" label="Back to Discover" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Create Your Team</h1>
          <p className="mt-1 text-sm text-slate-400">
            You don&apos;t have a team yet. Create one as the team leader, or accept a team request to join someone else&apos;s squad.
          </p>
        </div>

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
              onChange={(id) => setForm({ ...form, problemStatementId: Number(id) })}
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
        <div className="flex items-center gap-3">
          <BackButton href="/discover" label="Back to Discover" />
          <div>
            <h1 className="text-2xl font-bold text-white">{team.name}</h1>
            <p className="text-sm text-slate-400">{team.problem_statement_name}</p>
          </div>
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
            <div className="flex flex-col gap-3">
              {team.members.map((m: any) => {
                const isLeader = m.role === "leader" || m.user_id === team.leader_profile_id;
                const isMe = m.user_id === user?.id;

                return (
                  <Card key={m.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar url={m.avatarUrl} name={m.fullName} size={40} />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${m.user_id}`}
                            className="font-semibold text-white hover:text-indigo-300 transition-colors"
                          >
                            {m.fullName}
                          </Link>
                          {isLeader && <Badge color="amber">Leader</Badge>}
                          {isMe && <Badge color="slate">You</Badge>}
                        </div>
                        <p className="text-xs text-slate-400">{m.college}</p>
                        {/* Member contact phone (unlocked for teammates) */}
                        {m.mobileNumber && (
                          <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                            <span>📞</span>
                            <span className="font-mono">{m.mobileNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {team.isLeader && !isMe && (
                      <Button
                        variant="ghost"
                        className="text-xs text-red-400 hover:text-red-300"
                        loading={memberActionLoading === m.user_id}
                        onClick={() => removeMember(m.user_id)}
                      >
                        Remove
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Team Actions */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white">Team Management</h3>
            <p className="mt-1 text-xs text-slate-400">
              {team.isLeader
                ? "As team leader, you can recruit participants from Discover, manage squad members, and organize problem statements."
                : "You are a team member. You can view contacts, collaborate on SIH solutions, or leave the squad."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/discover">
                <Button variant="outline" className="text-xs">
                  Discover More Teammates
                </Button>
              </Link>
              {!team.isLeader && (
                <Button
                  variant="danger"
                  className="text-xs"
                  onClick={leaveTeam}
                >
                  Leave Team
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Team Discussion Chat */}
        <div>
          <TeamChat teamId={team.id} />
        </div>
      </div>
    </div>
  );
}
