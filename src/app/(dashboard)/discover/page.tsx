"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import TiltCard from "@/components/ui/tilt-card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Avatar from "@/components/profile/Avatar";
import { apiFetch } from "@/lib/api-client";

interface ProfileCard {
  profile_id: string;
  name: string;
  college: string;
  branch: string;
  year: number;
  experience: string;
  availability: string;
  bio: string;
  avatar_url?: string;
  github_username?: string;
  github_public_repos?: number;
  skills: string[];
  roles: string[];
  problem_statement_names: string[];
  compatibility_score?: number;
  compatibility_rationale?: string;
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [lookups, setLookups] = useState<{ colleges: string[] } | null>(null);
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const limit = 9;

  const loadSavedAndSent = useCallback(async () => {
    try {
      const [savedRes, sentRes] = await Promise.all([
        apiFetch("/api/saved-profiles").catch(() => ({ profiles: [] })),
        apiFetch("/api/team-requests?direction=sent").catch(() => ({ requests: [] })),
      ]);
      setSavedIds(new Set((savedRes.profiles || []).map((p: any) => p.id)));
      setSentRequestIds(
        new Set(
          (sentRes.requests || [])
            .filter((r: any) => r.status === "pending" || r.status === "accepted")
            .map((r: any) => r.receiver_profile_id)
        )
      );
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    apiFetch("/api/lookups").then(setLookups).catch(() => {});
    loadSavedAndSent();
  }, [loadSavedAndSent]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (college) params.set("college", college);
    if (availability) params.set("availability", availability);
    try {
      const res = await apiFetch(`/api/profiles?${params.toString()}`);
      setProfiles(res.profiles || []);
      setTotal(res.total || 0);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, college, availability]);

  useEffect(() => {
    load();
  }, [load]);

  const sendRequest = async (profileId: string, profileName: string) => {
    setRequestingId(profileId);
    setFeedback(null);
    try {
      await apiFetch("/api/team-requests", {
        method: "POST",
        body: JSON.stringify({ receiver_profile_id: profileId }),
      });
      setSentRequestIds((prev) => new Set([...Array.from(prev), profileId]));
      setFeedback({
        type: "success",
        text: `Team request sent to ${profileName}! They have been notified.`,
      });
    } catch (err: any) {
      if (err.message?.includes("already have a pending request")) {
        setSentRequestIds((prev) => new Set([...Array.from(prev), profileId]));
      }
      setFeedback({
        type: "error",
        text: err.message || "Failed to send team request.",
      });
    } finally {
      setRequestingId(null);
    }
  };

  const toggleSave = async (profileId: string) => {
    const isSaved = savedIds.has(profileId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
    try {
      if (isSaved) await apiFetch(`/api/saved-profiles/${profileId}`, { method: "DELETE" });
      else await apiFetch("/api/saved-profiles", { method: "POST", body: JSON.stringify({ profile_id: profileId }) });
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(profileId);
        else next.delete(profileId);
        return next;
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Discover Teammates</h1>
        <p className="text-sm text-slate-400">
          Ranked by AI compatibility score against your SIH 2026 profile.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by name, college, skills, bio…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          value={college}
          onChange={(e) => {
            setPage(1);
            setCollege(e.target.value);
          }}
        >
          <option value="">All colleges</option>
          {lookups?.colleges.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={availability}
          onChange={(e) => {
            setPage(1);
            setAvailability(e.target.value);
          }}
        >
          <option value="">All availability</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Flexible">Flexible</option>
        </Select>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <p>Finding matching teammates for SIH 2026…</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-lg font-semibold text-white">No teammates found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try loosening your filters or searching for different skills.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => {
            const hasSentRequest = sentRequestIds.has(p.profile_id);
            return (
              <TiltCard key={p.profile_id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar url={p.avatar_url} name={p.name} size={48} />
                    <div>
                      <Link
                        href={`/profile/${p.profile_id}`}
                        className="font-semibold text-white hover:text-indigo-300 transition-colors line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {p.college} • {p.branch}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave(p.profile_id)}
                    title={savedIds.has(p.profile_id) ? "Remove bookmark" : "Bookmark student"}
                    className={`rounded-lg p-1.5 transition-colors ${
                      savedIds.has(p.profile_id)
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    ★
                  </button>
                </div>

                {/* Compatibility Score */}
                {typeof p.compatibility_score === "number" && (
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                        AI Compatibility
                      </span>
                      <span className="font-bold text-white text-sm">
                        {p.compatibility_score}%
                      </span>
                    </div>
                    {p.compatibility_rationale && (
                      <p className="mt-1 text-xs text-indigo-200/80 leading-relaxed">
                        {p.compatibility_rationale}
                      </p>
                    )}
                  </div>
                )}

                {/* Bio */}
                {p.bio && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {p.bio}
                  </p>
                )}

                {/* GitHub */}
                {p.github_username && (
                  <a
                    href={`https://github.com/${p.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit text-xs text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    ⌥ github.com/{p.github_username}
                    {typeof p.github_public_repos === "number" &&
                      ` · ${p.github_public_repos} repos`}
                  </a>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 4).map((s) => (
                    <Badge key={s} color="indigo">
                      {s}
                    </Badge>
                  ))}
                  {p.skills.length > 4 && <Badge>+{p.skills.length - 4}</Badge>}
                </div>

                {/* Roles */}
                <div className="flex flex-wrap gap-1.5">
                  {p.roles.map((r) => (
                    <Badge key={r} color="slate">
                      {r}
                    </Badge>
                  ))}
                </div>

                {/* Availability & Experience */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>🕒 {p.availability}</span>
                  <span>⭐ {p.experience}</span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2 pt-2 border-t border-white/5">
                  <Link href={`/profile/${p.profile_id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-xs">
                      View Profile
                    </Button>
                  </Link>
                  {hasSentRequest ? (
                    <Button
                      variant="secondary"
                      disabled={true}
                      className="flex-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default"
                    >
                      ✓ Request Sent
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 text-xs"
                      loading={requestingId === p.profile_id}
                      onClick={() => sendRequest(p.profile_id, p.name)}
                    >
                      Send Request
                    </Button>
                  )}
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
