import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError } from "@/lib/auth";
import { getFullProfile } from "@/lib/profiles";

// A small "ideal team" role checklist used to compute what's missing.
// This keeps the feature honest and explainable rather than pretending to
// be a deep AI judgment call.
const IDEAL_ROLES = ["Frontend Developer", "Backend Developer", "UI/UX Designer", "ML Engineer"];

function buildTeamDetail(db: ReturnType<typeof getDb>, teamId: string) {
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId) as any;
  if (!team) return null;

  const ps = db.prepare("SELECT title FROM problem_statements WHERE id = ?").get(team.problem_statement_id) as
    | { title: string }
    | undefined;

  const memberRows = db
    .prepare(`SELECT profile_id as profileId FROM team_members WHERE team_id = ?`)
    .all(teamId) as { profileId: string }[];

  const members = memberRows.map((m) => {
    const full = getFullProfile(m.profileId);
    return {
      profile_id: full.id,
      name: full.fullName,
      roles: full.roles,
      skills: full.skills,
      is_leader: full.id === team.leader_profile_id,
    };
  });

  const coveredRoles = new Set(members.flatMap((m) => m.roles));
  const missingRoles = IDEAL_ROLES.filter((r) => !coveredRoles.has(r));

  const coveredSkills = new Set(members.flatMap((m) => m.skills));
  const commonlyNeededSkills = ["React", "Node.js", "Python", "UI/UX Design", "Machine Learning", "SQL"];
  const missingSkills = commonlyNeededSkills.filter((s) => !coveredSkills.has(s));

  return {
    team_id: team.id,
    name: team.name,
    leader_profile_id: team.leader_profile_id,
    problem_statement_id: team.problem_statement_id,
    problem_statement_name: ps?.title || null,
    members,
    missing_roles_skills: { roles: missingRoles, skills: missingSkills },
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const db = getDb();
  const detail = buildTeamDetail(db, params.id);
  if (!detail) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  return NextResponse.json(detail);
}

const patchSchema = z.object({
  action: z.enum(["remove_member", "rename"]),
  profile_id: z.string().optional(),
  name: z.string().min(2).max(120).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const db = getDb();
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(params.id) as any;
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
    db.prepare("DELETE FROM team_members WHERE team_id = ? AND profile_id = ?").run(
      params.id,
      parsed.data.profile_id
    );
  } else if (parsed.data.action === "rename" && parsed.data.name) {
    db.prepare("UPDATE teams SET name = ?, updated_at = datetime('now') WHERE id = ?").run(
      parsed.data.name,
      params.id
    );
  }

  return NextResponse.json(buildTeamDetail(db, params.id));
}
