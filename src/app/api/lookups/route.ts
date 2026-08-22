import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerSupabase();

  const [{ data: skills }, { data: roles }, { data: problemStatements }, { data: collegeRows }] = await Promise.all([
    supabase.from("skills").select("id, name").order("name"),
    supabase.from("roles").select("id, name").order("name"),
    supabase
      .from("problem_statements")
      .select("id, title, description, category")
      .eq("is_active", true)
      .order("title"),
    supabase.from("profiles").select("college").neq("college", "N/A"),
  ]);

  const colleges = [...new Set((collegeRows || []).map((r: any) => r.college))].sort();

  return NextResponse.json({
    skills: skills || [],
    roles: roles || [],
    problemStatements: problemStatements || [],
    colleges,
  });
}
