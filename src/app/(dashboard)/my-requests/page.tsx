"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

const STATUS_COLOR: Record<string, "amber" | "green" | "red"> = {
  pending: "amber",
  accepted: "green",
  rejected: "red",
};

export default function MyRequestsPage() {
  const { user } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/api/team-requests?direction=all");
    setRequests(res.requests);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id: string, status: "accepted" | "rejected") => {
    setActingId(id);
    try {
      await apiFetch(`/api/team-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <p className="text-slate-400">Loading requests…</p>;

  const received = requests.filter((r) => r.receiver_profile_id === user?.id);
  const sent = requests.filter((r) => r.sender_profile_id === user?.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">My requests</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Received</h2>
        {received.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No requests received yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {received.map((r) => (
              <Card key={r.request_id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">{r.sender_name}</p>
                  {r.message && <p className="text-sm text-slate-400">&ldquo;{r.message}&rdquo;</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>
                  {r.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        loading={actingId === r.request_id}
                        onClick={() => respond(r.request_id, "rejected")}
                      >
                        Decline
                      </Button>
                      <Button loading={actingId === r.request_id} onClick={() => respond(r.request_id, "accepted")}>
                        Accept
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sent</h2>
        {sent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">You haven&apos;t sent any requests yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {sent.map((r) => (
              <Card key={r.request_id} className="flex items-center justify-between p-4">
                <p className="font-medium text-white">{r.receiver_name}</p>
                <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
