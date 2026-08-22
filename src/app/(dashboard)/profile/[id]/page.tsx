"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    apiFetch(`/api/profiles/${id}`)
      .then(setProfile)
      .catch((e) => setError(e.message));
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

  if (error) return <p className="text-red-500">{error}</p>;
  if (!profile) return <p className="text-slate-500">Loading profile…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-sm text-slate-600">
              {profile.college} • {profile.branch} • Year {profile.year}
            </p>
          </div>
          {typeof profile.compatibility_score === "number" && (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                {profile.compatibility_score}
              </div>
              <span className="mt-1 text-xs text-slate-500">match score</span>
            </div>
          )}
        </div>

        {profile.compatibility_rationale && (
          <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
            <strong>Why recommended:</strong> {profile.compatibility_rationale}
          </div>
        )}

        {profile.bio && <p className="mt-4 text-sm text-slate-700">{profile.bio}</p>}

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-slate-800">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.skills.map((s: string) => (
              <Badge key={s} color="indigo">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-800">Roles</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.roles.map((r: string) => (
              <Badge key={r}>{r}</Badge>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-800">SIH Problem Statements</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.problem_statement_names.map((p: string) => (
              <Badge key={p} color="amber">
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-6 text-sm text-slate-600">
          <span>
            <strong>Experience:</strong> {profile.experience}
          </span>
          <span>
            <strong>Availability:</strong> {profile.availability}
          </span>
        </div>

        {feedback && <p className="mt-4 text-sm text-indigo-600">{feedback}</p>}

        <Button className="mt-6 w-full" loading={sending} onClick={sendRequest}>
          Send team request
        </Button>
      </Card>
    </div>
  );
}
