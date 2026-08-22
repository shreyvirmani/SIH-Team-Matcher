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
  const [feedback, setFeedback] = useState("");
  const limit = 9;

  useEffect(() => {
    apiFetch("/api/lookups").then(setLookups).catch(() => {});
    apiFetch("/api/saved-profiles")
      .then((res) => setSavedIds(new Set(res.profiles.map((p: any) => p.id))))
      .catch(() => {});
  }, []);

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
      setProfiles(res.profiles);
      setTotal(res.total);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, college, availability]);

  useEffect(() => {
    load();
  }, [load]);

  const sendRequest = async (profileId: string) => {
    setRequestingId(profileId);
    setFeedback("");
    try {
      await apiFetch("/api/team-requests", {
        method: "POST",
        body: JSON.stringify({ receiver_profile_id: profileId }),
      });
      setFeedback("Team request sent!");
    } catch (err: any) {
      setFeedback(err.message);
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
      // revert on failure
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
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Discover teammates</h1>
        <p className="text-sm text-slate-400">Ranked by AI compatibility score against your profile.</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by name, college, bio…"
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
          <option value="">Any availability</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Flexible</option>
        </Select>
      </div>

      {feedback && <p className="mt-3 text-sm text-indigo-300">{feedback}</p>}

      {loading ? (
        <p className="mt-8 text-slate-400">Finding your best matches…</p>
      ) : profiles.length === 0 ? (
        <p className="mt-8 text-slate-400">No students match these filters yet. Try widening your search.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <TiltCard key={p.profile_id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar url={p.avatar_url} name={p.name} size={44} />
                  <div>
                    <Link href={`/profile/${p.profile_id}`} className="font-semibold text-white hover:text-indigo-300">
                      {p.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {p.college} • {p.branch} • Yr {p.year}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {typeof p.compatibility_score === "number" && (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white shadow-[0_0_14px_-2px_rgba(99,102,241,0.8)]">
                      {p.compatibility_score}
                    </div>
                  )}
                  <button
                    onClick={() => toggleSave(p.profile_id)}
                    className={`text-xs ${savedIds.has(p.profile_id) ? "text-amber-300" : "text-slate-500 hover:text-slate-300"}`}
                    title={savedIds.has(p.profile_id) ? "Remove bookmark" : "Save for later"}
                  >
                    {savedIds.has(p.profile_id) ? "★ Saved" : "☆ Save"}
                  </button>
                </div>
              </div>

              {p.compatibility_rationale && (
                <p className="text-xs italic text-indigo-300">{p.compatibility_rationale}</p>
              )}

              {p.github_username && (
                <a
                  href={`https://github.com/${p.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit text-xs text-slate-400 hover:text-indigo-300"
                >
                  ⌥ github.com/{p.github_username}
                  {typeof p.github_public_repos === "number" && ` · ${p.github_public_repos} public repos`}
                </a>
              )}

              <div className="flex flex-wrap gap-1.5">
                {p.skills.slice(0, 4).map((s) => (
                  <Badge key={s} color="indigo">
                    {s}
                  </Badge>
                ))}
                {p.skills.length > 4 && <Badge>+{p.skills.length - 4}</Badge>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.roles.map((r) => (
                  <Badge key={r} color="slate">
                    {r}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{p.availability}</span>
                <span>{p.experience}</span>
              </div>

              <div className="mt-1 flex gap-2">
                <Link href={`/profile/${p.profile_id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View profile
                  </Button>
                </Link>
                <Button
                  className="flex-1"
                  loading={requestingId === p.profile_id}
                  onClick={() => sendRequest(p.profile_id)}
                >
                  Send request
                </Button>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

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
