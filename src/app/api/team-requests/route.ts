import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { createNotification } from "@/lib/profiles";

const schema = z.object({
  receiver_profile_id: z.string(),
  team_id: z.string().optional(),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const { receiver_profile_id, team_id, message } = parsed.data;

    if (receiver_profile_id === session.id) {
      return NextResponse.json({ error: "You cannot send a request to yourself" }, { status: 400 });
    }

    const { data: receiver } = await supabase.from("profiles").select("id").eq("id", receiver_profile_id).maybeSingle();
    if (!receiver) return NextResponse.json({ error: "Recipient profile not found" }, { status: 404 });

    const { data: existing } = await supabase
      .from("team_requests")
      .select("id")
      .eq("sender_profile_id", session.id)
      .eq("receiver_profile_id", receiver_profile_id)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "You already have a pending request to this student" }, { status: 409 });
    }

    const { data: request, error } = await supabase
      .from("team_requests")
      .insert({
        sender_profile_id: session.id,
        receiver_profile_id,
        team_id: team_id || null,
        status: "pending",
        message: message || null,
      })
      .select()
      .single();
    if (error || !request) return NextResponse.json({ error: error?.message || "Failed to send request" }, { status: 400 });

    const { data: senderProfile } = await supabase.from("profiles").select("full_name").eq("id", session.id).single();
    await createNotification(
      supabase,
      receiver_profile_id,
      "team_request",
      `${senderProfile?.full_name || "A student"} sent you a team request.`
    );

    return NextResponse.json(request, { status: 201 });
  });
}

export async function GET(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const { searchParams } = new URL(req.url);
    const direction = searchParams.get("direction") || "all";

    let query = supabase.from("team_requests").select("*").order("created_at", { ascending: false });
    if (direction === "sent") query = query.eq("sender_profile_id", session.id);
    else if (direction === "received") query = query.eq("receiver_profile_id", session.id);
    else query = query.or(`sender_profile_id.eq.${session.id},receiver_profile_id.eq.${session.id}`);

    const { data: rows } = await query;

    const enriched = await Promise.all(
      (rows || []).map(async (r: any) => {
        const [{ data: sender }, { data: receiver }] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", r.sender_profile_id).maybeSingle(),
          supabase.from("profiles").select("full_name").eq("id", r.receiver_profile_id).maybeSingle(),
        ]);
        return {
          request_id: r.id,
          sender_profile_id: r.sender_profile_id,
          sender_name: sender?.full_name,
          receiver_profile_id: r.receiver_profile_id,
          receiver_name: receiver?.full_name,
          team_id: r.team_id,
          status: r.status,
          message: r.message,
          created_at: r.created_at,
        };
      })
    );

    return NextResponse.json({ requests: enriched, total: enriched.length });
  });
}
