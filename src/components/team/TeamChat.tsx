"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/use-session";
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

export default function TeamChat({
  teamId,
  currentUserId,
}: {
  teamId: string;
  currentUserId?: string;
}) {
  const { user } = useSession();
  const activeUserId = currentUserId || user?.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await apiFetch(`/api/teams/${teamId}/messages`);
      setMessages(res.messages || []);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    const supabase = createClient();
    const channelId = `team-chat:${teamId}:${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelId)
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
      await apiFetch(`/api/teams/${teamId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      await load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[540px] flex-col rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
      <div className="border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span>💬</span>
          <span>Squad Chat</span>
        </h3>
        <p className="text-xs text-slate-400">Real-time collaboration with your team members.</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-500">
            No messages yet. Say hello to your squad!
          </p>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_profile_id === activeUserId;
            return (
              <div key={m.id} className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <Avatar url={m.sender_avatar_url} name={m.sender_name || "Teammate"} size={28} />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white/10 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {!isMe && (
                    <p className="font-bold text-indigo-300 mb-0.5 text-[11px]">{m.sender_name || "Teammate"}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <span className="mt-1 block text-[9px] opacity-60 text-right">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3 bg-white/[0.02] flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message to your team…"
          className="flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <Button onClick={send} loading={sending} disabled={!draft.trim()} className="text-xs px-4">
          Send
        </Button>
      </div>
    </div>
  );
}
