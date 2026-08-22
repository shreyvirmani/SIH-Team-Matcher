import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { getFullProfile } from "@/lib/profiles";
import type { SupabaseClient } from "@supabase/supabase-js";

// A small "ideal team" role checklist used to compute what's missing.
// This keeps the feature honest and explainable rather than pretending to
// be a deep AI judgment call.
const IDEAL_ROLES = ["Frontend Developer", "Backend Developer", "UI/UX Designer", "ML Engineer"];
const COMMONLY_NEEDED_SKILLS = ["React", "Node.js", "Python", "UI/UX Design", "Machine Learning", "SQL"];

async function buildTeamDetail(supabase: SupabaseClient, teamId: string) {
  const { data: team } = await supabase.from("teams").select("*").eq("id", teamId).maybeSingle();
  if (!team) return null;

  const { data: ps } = await supabase
    .from("problem_statements")
    .select("title")
    .eq("id", team.problem_statement_id)
    .maybeSingle();

  const { data: memberRows } = await supabase.from("team_members").select("profile_id").eq("team_id", teamId);

  const members = await Promise.all(
    (memberRows || []).map(async (m: any) => {
      const full = await getFullProfile(supabase, m.profile_id);
      if (!full) return null;
      return {
        profile_id: full.id,
        name: full.fullName,
        avatar_url: full.avatarUrl,
        roles: full.roles,
        skills: full.skills,
        is_leader: full.id === team.leader_profile_id,
      };
    })
  );
  const validMembers = members.filter(Boolean) as NonNullable<(typeof members)[number]>[];

  const coveredRoles = new Set(validMembers.flatMap((m) => m.roles));
  const missingRoles = IDEAL_ROLES.filter((r) => !coveredRoles.has(r));

  const coveredSkills = new Set(validMembers.flatMap((m) => m.skills));
  const missingSkills = COMMONLY_NEEDED_SKILLS.filter((s) => !coveredSkills.has(s));

  return {
    team_id: team.id,
    name: team.name,
    leader_profile_id: team.leader_profile_id,
    problem_statement_id: team.problem_statement_id,
    problem_statement_name: ps?.title || null,
    members: validMembers,
    missing_roles_skills: { roles: missingRoles, skills: missingSkills },
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    await requireUser();
    const supabase = createServerSupabase();
    const detail = await buildTeamDetail(supabase, params.id);
    if (!detail) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json(detail);
  });
}

const patchSchema = z.object({
  action: z.enum(["remove_member", "rename"]),
  profile_id: z.string().optional(),
  name: z.string().min(2).max(120).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const { data: team } = await supabase.from("teams").select("*").eq("id", params.id).maybeSingle();
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if (team.leader_profile_id !== session.id) {
      return NextResponse.json({ error: "Only the team leader can manage the team" }, { status: 403 });
    }

    const json = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    if (parsed.data.action === "remove_member" && parsed.data.profile_id) {
      if (parsed.data.profile_id === team.leader_profile_id) {
        return NextResponse.json({ error: "Team leader cannot remove themselves" }, { status: 400 });
      }
      await supabase.from("team_members").delete().eq("team_id", params.id).eq("profile_id", parsed.data.profile_id);
    } else if (parsed.data.action === "rename" && parsed.data.name) {
      await supabase
        .from("teams")
        .update({ name: parsed.data.name, updated_at: new Date().toISOString() })
        .eq("id", params.id);
    }

    return NextResponse.json(await buildTeamDetail(supabase, params.id));
  });
}
