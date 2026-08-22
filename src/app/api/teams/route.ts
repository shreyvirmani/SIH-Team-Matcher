import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().min(2).max(120),
  problem_statement_id: z.number(),
  initial_member_profile_ids: z.array(z.string()).default([]),
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
    const { name, problem_statement_id, initial_member_profile_ids } = parsed.data;

    const { data: alreadyLeading } = await supabase
      .from("teams")
      .select("id")
      .eq("leader_profile_id", session.id)
      .maybeSingle();
    if (alreadyLeading) {
      return NextResponse.json({ error: "You already lead a team. Manage it from My Team." }, { status: 409 });
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert({ name, leader_profile_id: session.id, problem_statement_id })
      .select()
      .single();
    if (error || !team) return NextResponse.json({ error: error?.message || "Failed to create team" }, { status: 400 });

    const memberIds = [session.id, ...initial_member_profile_ids.filter((id) => id !== session.id)];
    await supabase.from("team_members").insert(memberIds.map((profile_id) => ({ team_id: team.id, profile_id })));

    return NextResponse.json(team, { status: 201 });
  });
}

export async function GET() {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const { data: membership } = await supabase
      .from("team_members")
      .select("teams(*)")
      .eq("profile_id", session.id)
      .maybeSingle();

    return NextResponse.json({ team: (membership as any)?.teams || null });
  });
}
