import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const session = requireSession();
    if (!session.isAdmin) throw new AuthError("Admin access required", 403);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const db = getDb();
  const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
  const totalProfiles = (db.prepare("SELECT COUNT(*) as c FROM profiles").get() as any).c;
  const totalTeams = (db.prepare("SELECT COUNT(*) as c FROM teams").get() as any).c;
  const totalRequests = (db.prepare("SELECT COUNT(*) as c FROM team_requests").get() as any).c;
  const pendingRequests = (db.prepare("SELECT COUNT(*) as c FROM team_requests WHERE status = 'pending'").get() as any).c;
  const acceptedRequests = (db.prepare("SELECT COUNT(*) as c FROM team_requests WHERE status = 'accepted'").get() as any).c;
  const activeProblemStatements = (
    db.prepare("SELECT COUNT(*) as c FROM problem_statements WHERE is_active = 1").get() as any
  ).c;

  const recentUsers = db
    .prepare(
      `SELECT p.id, p.full_name as fullName, p.college, u.email, p.created_at as createdAt
       FROM profiles p JOIN users u ON u.id = p.id ORDER BY p.created_at DESC LIMIT 10`
    )
    .all();

  return NextResponse.json({
    totalUsers,
    totalProfiles,
    totalTeams,
    totalRequests,
    pendingRequests,
    acceptedRequests,
    activeProblemStatements,
    recentUsers,
  });
}
