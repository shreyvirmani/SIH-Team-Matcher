"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Avatar from "@/components/profile/Avatar";
import BackButton from "@/components/common/BackButton";
import { apiFetch } from "@/lib/api-client";

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  useEffect(() => {
    apiFetch(`/api/profiles/${id}`)
      .then(setProfile)
      .catch((e) => setError(e.message));

    apiFetch("/api/saved-profiles")
      .then((res) => setSaved((res.profiles || []).some((p: any) => p.id === id)))
      .catch(() => {});

    apiFetch("/api/team-requests?direction=sent")
      .then((res) => {
        const hasPending = (res.requests || []).some(
          (r: any) => r.receiver_profile_id === id && (r.status === "pending" || r.status === "accepted")
        );
        setIsRequestSent(hasPending);
      })
      .catch(() => {});
  }, [id]);

  const sendRequest = async () => {
    setSending(true);
    setFeedback(null);
    try {
      await apiFetch("/api/team-requests", {
        method: "POST",
        body: JSON.stringify({ receiver_profile_id: id }),
      });
      setIsRequestSent(true);
      setFeedback({
        type: "success",
        text: `Team request sent to ${profile?.name || "student"}! They have been notified.`,
      });
    } catch (err: any) {
      if (err.message?.includes("already have a pending request")) {
        setIsRequestSent(true);
      }
      setFeedback({
        type: "error",
        text: err.message || "Failed to send team request.",
      });
    } finally {
      setSending(false);
    }
  };

  const toggleSave = async () => {
    const nextState = !saved;
    setSaved(nextState);
    try {
      if (!nextState) await apiFetch(`/api/saved-profiles/${id}`, { method: "DELETE" });
      else await apiFetch("/api/saved-profiles", { method: "POST", body: JSON.stringify({ profile_id: id }) });
    } catch {
      setSaved(!nextState);
    }
  };

  if (error) return <p className="text-red-400 py-12 text-center">{error}</p>;
  if (!profile) return <p className="text-slate-400 py-12 text-center">Loading profile…</p>;

  return (
    <div className="mx-auto max-w-2xl pb-16 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <BackButton href="/discover" label="Back to Discover" />
      </div>

      {feedback && (
        <div
          className={`mb-5 rounded-xl border p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar url={profile.avatar_url} name={profile.name} size={64} />
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-sm text-slate-400">
                {profile.college} • {profile.branch} (Year {profile.year})
              </p>
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-indigo-300 transition-colors mt-0.5 inline-block"
                >
                  ⌥ github.com/{profile.github_username}
                  {typeof profile.github_public_repos === "number" &&
                    ` · ${profile.github_public_repos} repos`}
                </a>
              )}
            </div>
          </div>
          {typeof profile.compatibility_score === "number" && (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold text-white shadow-[0_0_16px_-2px_rgba(99,102,241,0.8)]">
                {profile.compatibility_score}%
              </div>
              <span className="mt-1 text-[10px] uppercase font-semibold text-slate-400">Match</span>
            </div>
          )}
        </div>

        {/* Teammate Contact Info (Only shown to confirmed teammates) */}
        {profile.phone_number && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-300">👥 Teammate Contact:</span>
              <a
                href={`tel:${profile.phone_number}`}
                className="font-mono font-bold text-white hover:underline text-sm"
              >
                📞 {profile.phone_number}
              </a>
            </div>
            <a
              href={`https://wa.me/${profile.phone_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/20 px-3 py-1.5 font-semibold text-green-300 hover:bg-green-500/30 transition-colors"
            >
              💬 WhatsApp Chat
            </a>
          </div>
        )}

        {profile.compatibility_rationale && (
          <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-sm text-indigo-200">
            <strong className="text-indigo-100">Why recommended:</strong>{" "}
            {profile.compatibility_rationale}
          </div>
        )}

        {profile.bio && (
          <div className="mt-5 text-sm text-slate-300 leading-relaxed">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Bio</h3>
            <p>{profile.bio}</p>
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {(profile.skills || []).map((s: string) => (
                <Badge key={s} color="indigo">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Roles</h3>
            <div className="flex flex-wrap gap-1.5">
              {(profile.roles || []).map((r: string) => (
                <Badge key={r} color="slate">
                  {r}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              SIH Problem Statements
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(profile.problem_statement_names || []).map((p: string) => (
                <Badge key={p} color="amber">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-6 text-sm text-slate-400 border-t border-white/10 pt-4">
          <span>
            <strong className="text-slate-300">Experience:</strong> {profile.experience}
          </span>
          <span>
            <strong className="text-slate-300">Availability:</strong> {profile.availability}
          </span>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={toggleSave} className="flex-1">
            {saved ? "★ Saved to Bookmarks" : "☆ Save to Bookmarks"}
          </Button>
          {isRequestSent ? (
            <Button
              variant="secondary"
              disabled={true}
              className="flex-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default"
            >
              ✓ Request Sent
            </Button>
          ) : (
            <Button className="flex-1" loading={sending} onClick={sendRequest}>
              Send Team Request
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
