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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/team-requests");
      setRequests(res.requests || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id: string, action: "accept" | "decline" | "cancel") => {
    setActingId(id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await apiFetch(`/api/team-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, status: action === "accept" ? "accepted" : "rejected" }),
      });
      setSuccessMsg(
        action === "accept"
          ? "Squad request accepted! You can now access your squad in My Team."
          : action === "cancel"
          ? "Request cancelled."
          : "Request declined."
      );
      await load();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process request response.");
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <p className="text-slate-400 py-12 text-center">Loading requests…</p>;

  const received = requests.filter((r) => r.receiver_profile_id === user?.id);
  const sent = requests.filter((r) => r.sender_profile_id === user?.id);

  return (
    <div className="space-y-6 pb-16 pt-2">
      <div className="flex items-center justify-between">
        <BackButton href="/discover" label="Back to Discover" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Squad Invitations & Requests</h1>
        <p className="mt-1 text-sm text-slate-400">Track and respond to invitations from other hackathon squads.</p>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          {successMsg}
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Received Invitations ({received.length})
        </h2>
        {received.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No invitations received yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {received.map((r) => (
              <Card key={r.request_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    From{" "}
                    <Link
                      href={`/profile/${r.sender_profile_id}`}
                      className="font-semibold text-indigo-300 hover:underline"
                    >
                      {r.sender_name || "A hacker"}
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
                      className="text-xs"
                      loading={actingId === r.request_id}
                      onClick={() => respond(r.request_id, "accept")}
                    >
                      Accept & Join Squad
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs text-slate-400 hover:text-red-300"
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Sent Requests ({sent.length})
        </h2>
        {sent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No requests sent yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {sent.map((r) => (
              <Card key={r.request_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    To{" "}
                    <Link
                      href={`/profile/${r.receiver_profile_id}`}
                      className="font-semibold text-indigo-300 hover:underline"
                    >
                      {r.receiver_name || "A hacker"}
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
                  <Button
                    variant="ghost"
                    className="text-xs text-slate-400 hover:text-red-300"
                    loading={actingId === r.request_id}
                    onClick={() => respond(r.request_id, "cancel")}
                  >
                    Cancel Request
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
