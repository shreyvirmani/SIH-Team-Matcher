import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { getUserTeam, buildTeamDetail } from "@/lib/teams";

const schema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(120),
  problem_statement_id: z.union([z.number(), z.string().transform(Number)]).optional(),
  problemStatementId: z.union([z.number(), z.string().transform(Number)]).optional(),
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

    const problemStatementId = parsed.data.problem_statement_id ?? parsed.data.problemStatementId;
    if (!problemStatementId) {
      return NextResponse.json({ error: "Please select a target SIH problem statement" }, { status: 400 });
    }

    const { name, initial_member_profile_ids } = parsed.data;

    // Check if user already leads or belongs to a team
    const existing = await getUserTeam(supabase, session.id);
    if (existing) {
      return NextResponse.json(
        { error: "You already belong to a team. Leave or manage it from My Team." },
        { status: 409 }
      );
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name,
        leader_profile_id: session.id,
        problem_statement_id: Number(problemStatementId),
      })
      .select()
      .single();

    if (error || !team) {
      return NextResponse.json({ error: error?.message || "Failed to create team" }, { status: 400 });
    }

    // Insert leader and initial members into team_members using admin client if needed to bypass RLS conflicts
    const admin = createAdminSupabase();
    const memberIds = [session.id, ...initial_member_profile_ids.filter((id) => id !== session.id)];
    await admin.from("team_members").upsert(
      memberIds.map((profile_id) => ({ team_id: team.id, profile_id })),
      { onConflict: "team_id,profile_id" }
    );

    const detail = await buildTeamDetail(supabase, team.id, session.id);
    return NextResponse.json({ team: detail }, { status: 201 });
  });
}

export async function GET() {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const team = await getUserTeam(supabase, session.id);
    return NextResponse.json({ team });
  });
}
