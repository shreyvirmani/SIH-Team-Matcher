import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";

// RLS on team_messages already restricts reads/writes to current team
// members (see schema.postgres.sql), so this route mostly just validates
// input and lets Postgres enforce the actual access control.

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    await requireUser();
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("team_messages")
      .select("id, body, created_at, sender_profile_id, profiles(full_name, avatar_url)")
      .eq("team_id", params.id)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 403 });

    const messages = (data || []).map((m: any) => ({
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      sender_profile_id: m.sender_profile_id,
      sender_name: m.profiles?.full_name,
      sender_avatar_url: m.profiles?.avatar_url,
    }));

    return NextResponse.json({ messages });
  });
}

const schema = z.object({ body: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Message body is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("team_messages")
      .insert({ team_id: params.id, sender_profile_id: session.id, body: parsed.data.body })
      .select()
      .single();

    if (error) {
      // RLS will reject this with a permission-denied-shaped error if the
      // caller isn't actually a member of this team.
      return NextResponse.json({ error: "You must be a member of this team to post" }, { status: 403 });
    }

    return NextResponse.json(data, { status: 201 });
  });
}
