"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Avatar from "@/components/profile/Avatar";
import { apiFetch } from "@/lib/api-client";

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch(`/api/profiles/${id}`)
      .then(setProfile)
      .catch((e) => setError(e.message));
    apiFetch("/api/saved-profiles")
      .then((res) => setSaved(res.profiles.some((p: any) => p.id === id)))
      .catch(() => {});
  }, [id]);

  const sendRequest = async () => {
    setSending(true);
    setFeedback("");
    try {
      await apiFetch("/api/team-requests", {
        method: "POST",
        body: JSON.stringify({ receiver_profile_id: id }),
      });
      setFeedback("Team request sent!");
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setSending(false);
    }
  };

  const toggleSave = async () => {
    setSaved((s) => !s);
    try {
      if (saved) await apiFetch(`/api/saved-profiles/${id}`, { method: "DELETE" });
      else await apiFetch("/api/saved-profiles", { method: "POST", body: JSON.stringify({ profile_id: id }) });
    } catch {
      setSaved((s) => !s);
    }
  };

  if (error) return <p className="text-red-400">{error}</p>;
  if (!profile) return <p className="text-slate-400">Loading profile…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar url={profile.avatar_url} name={profile.name} size={64} />
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-sm text-slate-400">
                {profile.college} • {profile.branch} • Year {profile.year}
              </p>
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-indigo-300"
                >
                  github.com/{profile.github_username}
                  {typeof profile.github_public_repos === "number" && ` · ${profile.github_public_repos} public repos`}
                </a>
              )}
            </div>
          </div>
          {typeof profile.compatibility_score === "number" && (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold text-white shadow-[0_0_16px_-2px_rgba(99,102,241,0.8)]">
                {profile.compatibility_score}
              </div>
              <span className="mt-1 text-xs text-slate-500">match score</span>
            </div>
          )}
        </div>

        {profile.compatibility_rationale && (
          <div className="mt-4 rounded-lg border border-indigo-400/20 bg-indigo-500/10 p-3 text-sm text-indigo-200">
            <strong>Why recommended:</strong> {profile.compatibility_rationale}
          </div>
        )}

        {profile.bio && <p className="mt-4 text-sm text-slate-300">{profile.bio}</p>}

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-slate-200">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.skills.map((s: string) => (
              <Badge key={s} color="indigo">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-200">Roles</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.roles.map((r: string) => (
              <Badge key={r}>{r}</Badge>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-200">SIH Problem Statements</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.problem_statement_names.map((p: string) => (
              <Badge key={p} color="amber">
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-6 text-sm text-slate-400">
          <span>
            <strong className="text-slate-300">Experience:</strong> {profile.experience}
          </span>
          <span>
            <strong className="text-slate-300">Availability:</strong> {profile.availability}
          </span>
        </div>

        {feedback && <p className="mt-4 text-sm text-indigo-300">{feedback}</p>}

        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={toggleSave} className="flex-1">
            {saved ? "★ Saved" : "☆ Save for later"}
          </Button>
          <Button className="flex-1" loading={sending} onClick={sendRequest}>
            Send team request
          </Button>
        </div>
      </Card>
    </div>
  );
}
