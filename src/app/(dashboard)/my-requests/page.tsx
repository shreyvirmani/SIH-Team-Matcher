"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

export default function MyRequestsPage() {
  const { user } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/api/team-requests");
    setRequests(res.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id: string, action: "accept" | "decline") => {
    setActingId(id);
    try {
      await apiFetch(`/api/team-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      await load();
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <p className="text-slate-400">Loading requests…</p>;

  const received = requests.filter((r) => r.receiver_profile_id === user?.id);
  const sent = requests.filter((r) => r.sender_profile_id === user?.id);

  return (
    <div className="space-y-6 pb-16 pt-2">
      <div className="flex items-center justify-between">
        <BackButton href="/discover" label="Back to Discover" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">My requests</h1>
        <p className="mt-1 text-sm text-slate-400">Track and respond to invitations from other hackathon squads.</p>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Received</h2>
        {received.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No requests received yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {received.map((r) => (
              <Card key={r.request_id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-white">
                    From{" "}
                    <Link
                      href={`/profile/${r.sender_profile_id}`}
                      className="font-medium text-indigo-300 hover:underline"
                    >
                      {r.sender_name || "a student"}
                    </Link>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <Badge color={r.status === "accepted" ? "green" : r.status === "pending" ? "amber" : "slate"}>
                      {r.status}
                    </Badge>
                  </div>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      loading={actingId === r.request_id}
                      onClick={() => respond(r.request_id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      loading={actingId === r.request_id}
                      onClick={() => respond(r.request_id, "decline")}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sent</h2>
        {sent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No requests sent yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {sent.map((r) => (
              <Card key={r.request_id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-white">
                    To{" "}
                    <Link
                      href={`/profile/${r.receiver_profile_id}`}
                      className="font-medium text-indigo-300 hover:underline"
                    >
                      {r.receiver_name || "a student"}
                    </Link>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <Badge color={r.status === "accepted" ? "green" : r.status === "pending" ? "amber" : "slate"}>
                      {r.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
