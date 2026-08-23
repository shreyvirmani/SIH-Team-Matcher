import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { SIH_PROBLEM_STATEMENTS, SIH_DEFAULT_SKILLS, SIH_DEFAULT_ROLES } from "@/lib/sih-data";

export async function GET() {
  const supabase = createServerSupabase();

  try {
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

    // Fallbacks if tables are freshly created and haven't run npm run seed yet
    const resolvedSkills = (skills && skills.length > 0)
      ? skills
      : SIH_DEFAULT_SKILLS.map((name, i) => ({ id: i + 1, name }));

    const resolvedRoles = (roles && roles.length > 0)
      ? roles
      : SIH_DEFAULT_ROLES.map((name, i) => ({ id: i + 1, name }));

    const resolvedProblemStatements = (problemStatements && problemStatements.length > 0)
      ? problemStatements
      : SIH_PROBLEM_STATEMENTS.map((ps, i) => ({
          id: ps.id || i + 1,
          title: ps.title,
          description: ps.description,
          category: ps.category,
        }));

    return NextResponse.json({
      skills: resolvedSkills,
      roles: resolvedRoles,
      problemStatements: resolvedProblemStatements,
      colleges,
    });
  } catch {
    // Graceful fallback
    return NextResponse.json({
      skills: SIH_DEFAULT_SKILLS.map((name, i) => ({ id: i + 1, name })),
      roles: SIH_DEFAULT_ROLES.map((name, i) => ({ id: i + 1, name })),
      problemStatements: SIH_PROBLEM_STATEMENTS.map((ps, i) => ({
        id: ps.id || i + 1,
        title: ps.title,
        description: ps.description,
        category: ps.category,
      })),
      colleges: [],
    });
  }
}
