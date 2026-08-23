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
import { TrashIcon, PhoneIcon } from "@/components/common/Icons";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

export default function MyTeamPage() {
  const { user } = useSession();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lookups, setLookups] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    problemStatementId: undefined as number | undefined,
  });
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, lRes] = await Promise.all([
        apiFetch("/api/teams"),
        apiFetch("/api/lookups"),
      ]);
      setTeam(tRes.team || null);
      setLookups(lRes);
    } catch {
      setTeam(null);
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
    setActionSuccess(null);
    if (!form.name.trim()) {
      setError("Please provide a name for your team.");
      return;
    }
    if (!form.problemStatementId) {
      setError("Please select a target SIH problem statement.");
      return;
    }

    setCreating(true);
    try {
      const res = await apiFetch("/api/teams", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          problem_statement_id: form.problemStatementId,
          problemStatementId: form.problemStatementId,
        }),
      });
      setTeam(res.team);
      setActionSuccess("Team created successfully! You can now recruit squad members.");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to create team.");
    } finally {
      setCreating(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!team?.id) return;
    setMemberActionLoading(memberId);
    setError("");
    try {
      await apiFetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "remove_member", memberId }),
      });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to remove member.");
    } finally {
      setMemberActionLoading(null);
    }
  };

  const leaveTeam = async () => {
    if (!team?.id) return;
    if (!confirm("Are you sure you want to leave this team?")) return;
    setError("");
    try {
      await apiFetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "leave" }),
      });
      setTeam(null);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to leave team.");
    }
  };

  const deleteOrDisbandTeam = async () => {
    if (!team?.id) return;
    const confirmMessage =
      "Are you sure you want to delete and disband this team? You will be able to create a new squad or join another team immediately.";
    if (!confirm(confirmMessage)) return;

    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "disband" }),
      });
      setTeam(null);
      setForm({ name: "", problemStatementId: undefined });
      setActionSuccess("Team disbanded successfully. You can now create a new squad!");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to delete team.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-slate-400 py-12 text-center">Loading your team…</p>;

  if (!team) {
    return (
      <div className="mx-auto max-w-xl pb-16 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <BackButton href="/discover" label="Back to Discover" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Create Your SIH Squad</h1>
          <p className="mt-1 text-sm text-slate-400">
            You are not in a squad yet. Create one as the team leader, or accept an invitation in <Link href="/my-requests" className="text-indigo-400 underline font-medium">My Requests</Link> to join another team.
          </p>
        </div>

        {actionSuccess && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            {actionSuccess}
          </div>
        )}

        <Card className="mt-6 p-6">
          <form onSubmit={createTeam} className="flex flex-col gap-5">
            <Input
              label="Team Name *"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. CodeForge SIH Warriors"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target SIH 2026 Problem Statement *
              </label>
              <TeamProblemStatementSelector
                problemStatements={lookups?.problemStatements || []}
                selectedId={form.problemStatementId}
                onChange={(id) => setForm({ ...form, problemStatementId: Number(id) })}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}
            <Button type="submit" loading={creating} className="w-full">
              Create Squad & Start Recruiting
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const members = team.members || [];
  const isLeader = team.isLeader || (team.leader_profile_id && user?.id ? team.leader_profile_id === user.id : false);
  const isOnlyMember = members.length <= 1;

  return (
    <div className="space-y-6 pb-16 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton href="/discover" label="Back to Discover" />
          <div>
            <h1 className="text-2xl font-bold text-white">{team.name}</h1>
            <p className="text-sm text-slate-400">{team.problem_statement_name || "SIH 2026 Project"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={members.length === 6 ? "green" : "indigo"}>
            {members.length} / 6 members
          </Badge>
          {(isLeader || isOnlyMember) && (
            <Button
              variant="danger"
              className="text-xs px-3 py-1.5 flex items-center gap-1.5"
              loading={deleting}
              onClick={deleteOrDisbandTeam}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              <span>Disband Team</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          {actionSuccess}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Squad Members ({members.length} / 6)
              </h2>
              {isOnlyMember && (
                <span className="text-xs text-slate-400 font-medium">
                  Solo Member (Recruit or Disband to start new)
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {members.map((m: any) => {
                const memberIsLeader = m.role === "leader" || m.user_id === team.leader_profile_id || m.isLeader;
                const isMe = m.user_id === user?.id || m.id === user?.id;

                return (
                  <Card key={m.id || m.user_id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar url={m.avatarUrl} name={m.fullName || m.name} size={40} />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${m.user_id || m.id}`}
                            className="font-semibold text-white hover:text-indigo-300 transition-colors"
                          >
                            {m.fullName || m.name}
                          </Link>
                          {memberIsLeader && <Badge color="amber">Leader</Badge>}
                          {isMe && <Badge color="slate">You</Badge>}
                        </div>
                        <p className="text-xs text-slate-400">{m.college}</p>
                        {/* Member contact phone (unlocked for teammates) */}
                        {m.mobileNumber && (
                          <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1.5">
                            <PhoneIcon className="h-3 w-3" />
                            <span className="font-mono">{m.mobileNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {isLeader && !isMe && (
                      <Button
                        variant="ghost"
                        className="text-xs text-red-400 hover:text-red-300"
                        loading={memberActionLoading === (m.user_id || m.id)}
                        onClick={() => removeMember(m.user_id || m.id)}
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
              {isLeader
                ? "As team leader, you can recruit participants from Discover, manage squad members, or delete/disband this squad to start a new one."
                : "You are a team member. You can view contacts, collaborate on SIH solutions, or leave the squad."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/discover">
                <Button variant="outline" className="text-xs">
                  Discover More Teammates
                </Button>
              </Link>
              {!isLeader && (
                <Button
                  variant="danger"
                  className="text-xs"
                  onClick={leaveTeam}
                >
                  Leave Team
                </Button>
              )}
              {(isLeader || isOnlyMember) && (
                <Button
                  variant="danger"
                  className="text-xs flex items-center gap-1.5"
                  loading={deleting}
                  onClick={deleteOrDisbandTeam}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span>Delete Team & Start Fresh</span>
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Team Discussion Chat */}
        <div>
          {team.id && <TeamChat teamId={team.id} currentUserId={user?.id} />}
        </div>
      </div>
    </div>
  );
}
