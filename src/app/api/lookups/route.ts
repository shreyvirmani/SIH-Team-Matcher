import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const skills = db.prepare("SELECT id, name FROM skills ORDER BY name").all();
  const roles = db.prepare("SELECT id, name FROM roles ORDER BY name").all();
  const problemStatements = db
    .prepare("SELECT id, title, description, category FROM problem_statements WHERE is_active = 1 ORDER BY title")
    .all();
  const colleges = db
    .prepare("SELECT DISTINCT college FROM profiles WHERE college != 'N/A' ORDER BY college")
    .all()
    .map((r: any) => r.college);

  return NextResponse.json({ skills, roles, problemStatements, colleges });
}
