import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError, getSessionFromRequest } from "@/lib/auth";
import { getFullProfile, toMatchProfile } from "@/lib/profiles";
import { scoreCompatibility } from "@/lib/matching";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const full = getFullProfile(params.id);
  if (!full) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  let compatibility: { score: number; rationale: string } | null = null;
  const currentExists = getFullProfile(session.id);
  if (currentExists && session.id !== params.id) {
    const result = scoreCompatibility(toMatchProfile(session.id), toMatchProfile(params.id));
    compatibility = { score: result.score, rationale: result.rationale };
  }

  return NextResponse.json({
    profile_id: full.id,
    user_id: full.id,
    name: full.fullName,
    email: full.email,
    college: full.college,
    branch: full.branch,
    year: full.year,
    experience: full.experience,
    availability: full.availability,
    bio: full.bio,
    skills: full.skills,
    roles: full.roles,
    problem_statement_names: full.problemStatements.map((p: any) => p.title),
    compatibility_score: compatibility?.score,
    compatibility_rationale: compatibility?.rationale,
  });
}

const updateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  college: z.string().min(2).max(160).optional(),
  branch: z.string().min(2).max(120).optional(),
  year: z.number().int().min(1).max(6).optional(),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  availability: z.enum(["Full-time", "Part-time", "Flexible"]).optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  problemStatementIds: z.array(z.number()).optional(),
  isLookingForTeam: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  if (session.id !== params.id) {
    return NextResponse.json({ error: "Forbidden: you can only update your own profile" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const db = getDb();

  const existing = db.prepare("SELECT id FROM profiles WHERE id = ?").get(params.id);
  if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const fields: string[] = [];
  const values: any[] = [];
  const map: Record<string, string> = {
    fullName: "full_name",
    college: "college",
    branch: "branch",
    year: "year",
    experience: "experience",
    availability: "availability",
    bio: "bio",
  };
  for (const [key, col] of Object.entries(map)) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push((data as any)[key]);
    }
  }
  if (data.isLookingForTeam !== undefined) {
    fields.push("is_looking_for_team = ?");
    values.push(data.isLookingForTeam ? 1 : 0);
  }
  fields.push("updated_at = datetime('now')");

  const tx = db.transaction(() => {
    if (fields.length > 0) {
      db.prepare(`UPDATE profiles SET ${fields.join(", ")} WHERE id = ?`).run(...values, params.id);
    }

    if (data.skills) {
      db.prepare("DELETE FROM user_skills WHERE profile_id = ?").run(params.id);
      const ins = db.prepare("INSERT OR IGNORE INTO skills (name) VALUES (?)");
      const sel = db.prepare("SELECT id FROM skills WHERE name = ?");
      const insLink = db.prepare("INSERT OR IGNORE INTO user_skills (profile_id, skill_id) VALUES (?, ?)");
      for (const name of data.skills) {
        ins.run(name);
        const id = (sel.get(name) as any).id;
        insLink.run(params.id, id);
      }
    }

    if (data.roles) {
      db.prepare("DELETE FROM user_roles WHERE profile_id = ?").run(params.id);
      const ins = db.prepare("INSERT OR IGNORE INTO roles (name) VALUES (?)");
      const sel = db.prepare("SELECT id FROM roles WHERE name = ?");
      const insLink = db.prepare("INSERT OR IGNORE INTO user_roles (profile_id, role_id) VALUES (?, ?)");
      for (const name of data.roles) {
        ins.run(name);
        const id = (sel.get(name) as any).id;
        insLink.run(params.id, id);
      }
    }

    if (data.problemStatementIds) {
      db.prepare("DELETE FROM profile_problem_statements WHERE profile_id = ?").run(params.id);
      const insLink = db.prepare(
        "INSERT OR IGNORE INTO profile_problem_statements (profile_id, problem_statement_id) VALUES (?, ?)"
      );
      for (const id of data.problemStatementIds) insLink.run(params.id, id);
    }
  });
  tx();

  return NextResponse.json(getFullProfile(params.id));
}
