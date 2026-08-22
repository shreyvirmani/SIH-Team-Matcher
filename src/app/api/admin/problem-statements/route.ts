import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError } from "@/lib/auth";

function requireAdmin() {
  const session = requireSession();
  if (!session.isAdmin) throw new AuthError("Admin access required", 403);
  return session;
}

export async function GET() {
  try {
    requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const db = getDb();
  const items = db.prepare("SELECT * FROM problem_statements ORDER BY id").all();
  return NextResponse.json({ problemStatements: items });
}

const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional().default(""),
  category: z.string().max(120).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const db = getDb();
  const result = db
    .prepare(`INSERT INTO problem_statements (title, description, category, is_active) VALUES (?, ?, ?, 1)`)
    .run(parsed.data.title, parsed.data.description, parsed.data.category);

  const created = db.prepare("SELECT * FROM problem_statements WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(created, { status: 201 });
}

const patchSchema = z.object({
  id: z.number(),
  is_active: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  try {
    requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const db = getDb();
  db.prepare("UPDATE problem_statements SET is_active = ? WHERE id = ?").run(
    parsed.data.is_active ? 1 : 0,
    parsed.data.id
  );
  const updated = db.prepare("SELECT * FROM problem_statements WHERE id = ?").get(parsed.data.id);
  return NextResponse.json(updated);
}
