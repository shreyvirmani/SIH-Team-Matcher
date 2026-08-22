"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/profile/Avatar";
import Button from "@/components/ui/button";

interface Message {
  id: string;
  body: string;
  created_at: string;
  sender_profile_id: string;
  sender_name?: string;
  sender_avatar_url?: string;
}

export default function TeamChat({ teamId, currentUserId }: { teamId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await apiFetch(`/api/teams/${teamId}/messages`);
    setMessages(res.messages);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`team-chat:${teamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_messages", filter: `team_id=eq.${teamId}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setDraft("");
    try {
      await apiFetch(`/api/teams/${teamId}/messages`, { method: "POST", body: JSON.stringify({ body }) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-96 flex-col rounded-xl border border-white/10 bg-white/5">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet — say hi to your team.</p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_profile_id === currentUserId;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                <Avatar url={m.sender_avatar_url} name={m.sender_name || "?"} size={24} />
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    isMine ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-200"
                  }`}
                >
                  {!isMine && <p className="text-[10px] font-semibold text-indigo-300">{m.sender_name}</p>}
                  <p>{m.body}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message your team…"
          className="flex-1 rounded-lg border border-slate-600/60 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
        />
        <Button onClick={send} loading={sending} disabled={!draft.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
