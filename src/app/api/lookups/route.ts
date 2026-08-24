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
        .select("id, ps_number, title, description, category")
        .eq("is_active", true)
        .order("id"),
      supabase.from("profiles").select("college").neq("college", "N/A"),
    ]);

    const colleges = [...new Set((collegeRows || []).map((r: any) => r.college))].filter(Boolean).sort();

    const resolvedSkills = (skills && skills.length > 0)
      ? skills
      : SIH_DEFAULT_SKILLS.map((name, i) => ({ id: i + 1, name }));

    const resolvedRoles = (roles && roles.length > 0)
      ? roles
      : SIH_DEFAULT_ROLES.map((name, i) => ({ id: i + 1, name }));

    // Seamlessly provide all 226 authoritative SIH problem statements with PS Numbers and Organizations
    const resolvedProblemStatements = (problemStatements && problemStatements.length >= 226)
      ? problemStatements.map((dbPs: any, i: number) => {
          const fallback = SIH_PROBLEM_STATEMENTS[i] || {};
          return {
            id: dbPs.id || fallback.id || i + 1,
            psNumber: dbPs.ps_number || fallback.psNumber || `SIH26${String(dbPs.id || i + 1).padStart(3, "0")}`,
            organization: fallback.organization || "Govt. of India",
            theme: dbPs.category || fallback.theme || "Smart Automation",
            category: dbPs.category || fallback.category || "Smart Automation",
            title: dbPs.title || fallback.title,
            description: dbPs.description || fallback.description,
          };
        })
      : SIH_PROBLEM_STATEMENTS.map((ps, i) => ({
          id: ps.id || i + 1,
          psNumber: ps.psNumber || `SIH26${String(i + 1).padStart(3, "0")}`,
          organization: ps.organization,
          theme: ps.theme || ps.category,
          category: ps.category || ps.theme,
          title: ps.title,
          description: ps.description,
        }));

    return NextResponse.json({
      skills: resolvedSkills,
      roles: resolvedRoles,
      problemStatements: resolvedProblemStatements,
      colleges,
    });
  } catch {
    // Graceful fallback with full 226 catalog
    return NextResponse.json({
      skills: SIH_DEFAULT_SKILLS.map((name, i) => ({ id: i + 1, name })),
      roles: SIH_DEFAULT_ROLES.map((name, i) => ({ id: i + 1, name })),
      problemStatements: SIH_PROBLEM_STATEMENTS.map((ps, i) => ({
        id: ps.id || i + 1,
        psNumber: ps.psNumber || `SIH26${String(i + 1).padStart(3, "0")}`,
        organization: ps.organization,
        theme: ps.theme || ps.category,
        category: ps.category || ps.theme,
        title: ps.title,
        description: ps.description,
      })),
      colleges: [],
    });
  }
}
