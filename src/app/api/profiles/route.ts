import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError, getSessionFromRequest } from "@/lib/auth";
import { getFullProfile, toMatchProfile } from "@/lib/profiles";
import { rankCompatibility } from "@/lib/matching";

const profileSchema = z.object({
  fullName: z.string().min(2).max(120),
  college: z.string().min(2).max(160),
  branch: z.string().min(2).max(120),
  year: z.number().int().min(1).max(6),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
  availability: z.enum(["Full-time", "Part-time", "Flexible"]),
  bio: z.string().max(1000).optional().default(""),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  problemStatementIds: z.array(z.number()).default([]),
  isLookingForTeam: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const db = getDb();

  const existing = db.prepare("SELECT id FROM profiles WHERE id = ?").get(session.id);
  if (existing) {
    return NextResponse.json({ error: "Profile already exists. Use PUT to update." }, { status: 409 });
  }

  const upsertLookups = (table: "skills" | "roles", names: string[]) => {
    const ins = db.prepare(`INSERT OR IGNORE INTO ${table} (name) VALUES (?)`);
    const sel = db.prepare(`SELECT id FROM ${table} WHERE name = ?`);
    return names.map((n) => {
      ins.run(n);
      return (sel.get(n) as any).id as number;
    });
  };

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO profiles (id, full_name, college, branch, year, experience, availability, bio, is_looking_for_team)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      session!.id,
      data.fullName,
      data.college,
      data.branch,
      data.year,
      data.experience,
      data.availability,
      data.bio,
      data.isLookingForTeam ? 1 : 0
    );

    const skillIds = upsertLookups("skills", data.skills);
    const insSkill = db.prepare("INSERT OR IGNORE INTO user_skills (profile_id, skill_id) VALUES (?, ?)");
    for (const sid of skillIds) insSkill.run(session!.id, sid);

    const roleIds = upsertLookups("roles", data.roles);
    const insRole = db.prepare("INSERT OR IGNORE INTO user_roles (profile_id, role_id) VALUES (?, ?)");
    for (const rid of roleIds) insRole.run(session!.id, rid);

    const insPS = db.prepare(
      "INSERT OR IGNORE INTO profile_problem_statements (profile_id, problem_statement_id) VALUES (?, ?)"
    );
    for (const psid of data.problemStatementIds) insPS.run(session!.id, psid);
  });
  tx();

  const profile = getFullProfile(session.id);
  return NextResponse.json(profile, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
  const search = searchParams.get("search")?.trim();
  const skillsFilter = searchParams.getAll("skills");
  const rolesFilter = searchParams.getAll("roles");
  const college = searchParams.get("college")?.trim();
  const availability = searchParams.get("availability")?.trim();
  const problemStatementId = searchParams.get("problem_statement_id");

  const db = getDb();

  // Base candidate set: everyone except the current user who is looking for a team.
  let candidateIds = db
    .prepare(`SELECT id FROM profiles WHERE id != ? AND is_looking_for_team = 1`)
    .all(session.id)
    .map((r: any) => r.id as string);

  if (search) {
    const like = `%${search.toLowerCase()}%`;
    const matches = db
      .prepare(
        `SELECT id FROM profiles WHERE id != ? AND (lower(full_name) LIKE ? OR lower(college) LIKE ? OR lower(bio) LIKE ?)`
      )
      .all(session.id, like, like, like)
      .map((r: any) => r.id as string);
    candidateIds = candidateIds.filter((id) => matches.includes(id));
  }

  if (college) {
    const matches = db
      .prepare(`SELECT id FROM profiles WHERE lower(college) = lower(?)`)
      .all(college)
      .map((r: any) => r.id as string);
    candidateIds = candidateIds.filter((id) => matches.includes(id));
  }

  if (availability) {
    const matches = db
      .prepare(`SELECT id FROM profiles WHERE availability = ?`)
      .all(availability)
      .map((r: any) => r.id as string);
    candidateIds = candidateIds.filter((id) => matches.includes(id));
  }

  if (skillsFilter.length > 0) {
    const placeholders = skillsFilter.map(() => "?").join(",");
    const matches = db
      .prepare(
        `SELECT DISTINCT us.profile_id as id FROM user_skills us JOIN skills s ON s.id = us.skill_id WHERE s.name IN (${placeholders})`
      )
      .all(...skillsFilter)
      .map((r: any) => r.id as string);
    candidateIds = candidateIds.filter((id) => matches.includes(id));
  }

  if (rolesFilter.length > 0) {
    const placeholders = rolesFilter.map(() => "?").join(",");
    const matches = db
      .prepare(
        `SELECT DISTINCT ur.profile_id as id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE r.name IN (${placeholders})`
      )
      .all(...rolesFilter)
      .map((r: any) => r.id as string);
    candidateIds = candidateIds.filter((id) => matches.includes(id));
  }

  if (problemStatementId) {
    const matches = db
      .prepare(`SELECT profile_id as id FROM profile_problem_statements WHERE problem_statement_id = ?`)
      .all(Number(problemStatementId))
      .map((r: any) => r.id as string);
    candidateIds = candidateIds.filter((id) => matches.includes(id));
  }

  // AI-powered compatibility scoring against the current user's profile.
  // Graceful degradation: if the current user has no profile yet, skip scoring.
  const currentProfileExists = db.prepare("SELECT id FROM profiles WHERE id = ?").get(session.id);
  let scored: { id: string; score?: number; rationale?: string }[];

  if (currentProfileExists && candidateIds.length > 0) {
    const currentMatch = toMatchProfile(session.id);
    const targets = candidateIds.map((id) => toMatchProfile(id));
    const ranked = rankCompatibility(currentMatch, targets);
    scored = ranked.map((r) => ({ id: r.profileId, score: r.score, rationale: r.rationale }));
  } else {
    scored = candidateIds.map((id) => ({ id }));
  }

  const total = scored.length;
  const startIdx = (page - 1) * limit;
  const pageIds = scored.slice(startIdx, startIdx + limit);

  const profiles = pageIds.map((entry) => {
    const full = getFullProfile(entry.id);
    return {
      profile_id: full.id,
      user_id: full.id,
      name: full.fullName,
      college: full.college,
      branch: full.branch,
      year: full.year,
      experience: full.experience,
      availability: full.availability,
      bio: full.bio,
      skills: full.skills,
      roles: full.roles,
      problem_statement_names: full.problemStatements.map((p: any) => p.title),
      compatibility_score: entry.score,
      compatibility_rationale: entry.rationale,
    };
  });

  return NextResponse.json({ profiles, total, page, limit });
}
