import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(120),
  problem_statement_id: z.number(),
  initial_member_profile_ids: z.array(z.string()).default([]),
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
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { name, problem_statement_id, initial_member_profile_ids } = parsed.data;
  const db = getDb();

  const alreadyLeading = db
    .prepare("SELECT id FROM teams WHERE leader_profile_id = ?")
    .get(session.id);
  if (alreadyLeading) {
    return NextResponse.json({ error: "You already lead a team. Manage it from My Team." }, { status: 409 });
  }

  const id = randomUUID();
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO teams (id, name, leader_profile_id, problem_statement_id) VALUES (?, ?, ?, ?)`
    ).run(id, name, session!.id, problem_statement_id);

    db.prepare(`INSERT INTO team_members (team_id, profile_id) VALUES (?, ?)`).run(id, session!.id);

    for (const memberId of initial_member_profile_ids) {
      if (memberId !== session!.id) {
        db.prepare(`INSERT OR IGNORE INTO team_members (team_id, profile_id) VALUES (?, ?)`).run(id, memberId);
      }
    }
  });
  tx();

  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
  return NextResponse.json(team, { status: 201 });
}

export async function GET() {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const db = getDb();
  const team = db
    .prepare(
      `SELECT t.* FROM teams t JOIN team_members tm ON tm.team_id = t.id WHERE tm.profile_id = ?`
    )
    .get(session.id);
  return NextResponse.json({ team: team || null });
}
