import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { getFullProfile, toMatchProfile, upsertLookupIds } from "@/lib/profiles";
import { rankCompatibility } from "@/lib/matching";
import { lookupGithubUser } from "@/lib/github";

function cleanGithubUsername(val?: string | null): string | null {
  if (!val) return null;
  const s = val.trim();
  if (!s) return null;
  const match = s.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return s.replace(/^@/, "");
}

function cleanAvatarUrl(val?: string | null): string | null {
  if (!val) return null;
  const s = val.trim();
  if (!s) return null;
  try {
    new URL(s);
    return s;
  } catch {
    return null;
  }
}

function parseYear(val: any): number {
  if (!val) return 3;
  const n = parseInt(String(val), 10);
  if (isNaN(n)) return 3;
  if (n >= 1 && n <= 6) return n;
  if (n >= 2020 && n <= 2035) {
    const currentYear = new Date().getFullYear();
    const diff = n - currentYear;
    const computed = 4 - diff;
    return Math.min(6, Math.max(1, computed));
  }
  return 3;
}

function parseAvailability(val: any): "Full-time" | "Part-time" | "Flexible" {
  if (!val) return "Full-time";
  const s = String(val).toLowerCase();
  if (s.includes("part")) return "Part-time";
  if (s.includes("flex") || s.includes("explor")) return "Flexible";
  return "Full-time";
}

function parseExperience(val: any): "Beginner" | "Intermediate" | "Advanced" {
  if (!val) return "Intermediate";
  const s = String(val).toLowerCase();
  if (s.includes("beg")) return "Beginner";
  if (s.includes("adv")) return "Advanced";
  return "Intermediate";
}

export async function POST(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => ({}));
    const fullName = String(json.fullName || json.full_name || json.name || "").trim();
    const college = String(json.college || "").trim();
    const branch = String(json.branch || "").trim();
    const mobileNumber = String(json.mobileNumber || json.phoneNumber || json.phone_number || "").trim();
    const bio = String(json.bio || "").trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: "Please enter your full name (minimum 2 characters)." }, { status: 400 });
    }
    if (!college || college.length < 2) {
      return NextResponse.json({ error: "Please enter your college / university name." }, { status: 400 });
    }
    if (!mobileNumber || mobileNumber.length < 6) {
      return NextResponse.json({ error: "Please enter a valid mobile / WhatsApp number." }, { status: 400 });
    }

    const rawSkills = Array.isArray(json.skills) ? json.skills : [];
    const skills = rawSkills.map((s: any) => String(s).trim()).filter(Boolean);
    if (skills.length === 0) {
      return NextResponse.json({ error: "Please select or add at least one skill." }, { status: 400 });
    }

    const rawRoles = Array.isArray(json.roles) ? json.roles : Array.isArray(json.preferredRoles) ? json.preferredRoles : [];
    const roles = rawRoles.map((r: any) => String(r).trim()).filter(Boolean);
    if (roles.length === 0) {
      return NextResponse.json({ error: "Please select or add at least one preferred role." }, { status: 400 });
    }

    const rawPS = Array.isArray(json.problemStatementIds)
      ? json.problemStatementIds
      : Array.isArray(json.problem_statement_ids)
      ? json.problem_statement_ids
      : [];
    const problemStatementIds = rawPS.map((id: any) => Number(id)).filter((id: number) => !isNaN(id) && id > 0);

    const year = parseYear(json.year || json.graduationYear || json.graduation_year);
    const experience = parseExperience(json.experience || json.experienceLevel || json.experience_level);
    const availability = parseAvailability(json.availability);
    const avatarUrl = cleanAvatarUrl(json.avatarUrl || json.avatar_url);
    const githubUsername = cleanGithubUsername(json.githubUsername || json.github_username || json.githubUrl || json.github_url);

    let githubPublicRepos: number | null = null;
    if (githubUsername) {
      const gh = await lookupGithubUser(githubUsername);
      githubPublicRepos = gh.publicRepos;
    }

    const { data: existing } = await supabase.from("profiles").select("id").eq("id", session.id).maybeSingle();

    const profileData = {
      id: session.id,
      full_name: fullName,
      college,
      branch: branch || "Engineering",
      year,
      experience,
      availability,
      bio,
      avatar_url: avatarUrl,
      github_username: githubUsername,
      github_public_repos: githubPublicRepos,
      phone_number: mobileNumber,
      is_looking_for_team: json.isLookingForTeam !== false,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: updateErr } = await supabase.from("profiles").update(profileData).eq("id", session.id);
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 });
    } else {
      const { error: insertErr } = await supabase.from("profiles").insert(profileData);
      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    // Upsert Skills
    await supabase.from("user_skills").delete().eq("profile_id", session.id);
    const skillIds = await upsertLookupIds(supabase, "skills", skills);
    if (skillIds.length > 0) {
      await supabase.from("user_skills").insert(skillIds.map((skill_id) => ({ profile_id: session.id, skill_id })));
    }

    // Upsert Roles
    await supabase.from("user_roles").delete().eq("profile_id", session.id);
    const roleIds = await upsertLookupIds(supabase, "roles", roles);
    if (roleIds.length > 0) {
      await supabase.from("user_roles").insert(roleIds.map((role_id) => ({ profile_id: session.id, role_id })));
    }

    // Problem Statements
    await supabase.from("profile_problem_statements").delete().eq("profile_id", session.id);
    if (problemStatementIds.length > 0) {
      await supabase
        .from("profile_problem_statements")
        .insert(problemStatementIds.map((problem_statement_id: number) => ({ profile_id: session.id, problem_statement_id })));
    }

    const profile = await getFullProfile(supabase, session.id);
    return NextResponse.json(profile, { status: existing ? 200 : 201 });
  });
}

export async function PUT(req: NextRequest) {
  // Support PUT /api/profiles directly
  return POST(req);
}

export async function GET(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const search = searchParams.get("search")?.trim();
    const skillsFilter = searchParams.getAll("skills");
    const rolesFilter = searchParams.getAll("roles");
    const college = searchParams.get("college")?.trim();
    const availability = searchParams.get("availability")?.trim();
    const problemStatementId = searchParams.get("problem_statement_id");

    let query = supabase
      .from("profiles")
      .select("id")
      .neq("id", session.id)
      .eq("is_looking_for_team", true);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,college.ilike.%${search}%,bio.ilike.%${search}%`);
    }
    if (college) query = query.ilike("college", college);
    if (availability) query = query.eq("availability", availability);

    const { data: baseRows } = await query;
    let candidateIds = (baseRows || []).map((r: any) => r.id as string);

    if (skillsFilter.length > 0 && candidateIds.length > 0) {
      const { data: matches } = await supabase
        .from("user_skills")
        .select("profile_id, skills!inner(name)")
        .in("skills.name", skillsFilter);
      const matchIds = new Set((matches || []).map((r: any) => r.profile_id));
      candidateIds = candidateIds.filter((id) => matchIds.has(id));
    }

    if (rolesFilter.length > 0 && candidateIds.length > 0) {
      const { data: matches } = await supabase
        .from("user_roles")
        .select("profile_id, roles!inner(name)")
        .in("roles.name", rolesFilter);
      const matchIds = new Set((matches || []).map((r: any) => r.profile_id));
      candidateIds = candidateIds.filter((id) => matchIds.has(id));
    }

    if (problemStatementId && candidateIds.length > 0) {
      const { data: matches } = await supabase
        .from("profile_problem_statements")
        .select("profile_id")
        .eq("problem_statement_id", Number(problemStatementId));
      const matchIds = new Set((matches || []).map((r: any) => r.profile_id));
      candidateIds = candidateIds.filter((id) => matchIds.has(id));
    }

    const { data: currentProfileExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.id)
      .maybeSingle();

    let scored: { id: string; score?: number; rationale?: string }[];

    if (currentProfileExists && candidateIds.length > 0) {
      const currentMatch = await toMatchProfile(supabase, session.id);
      const targets = await Promise.all(candidateIds.map((id) => toMatchProfile(supabase, id)));
      const ranked = rankCompatibility(currentMatch, targets);
      scored = ranked.map((r) => ({ id: r.profileId, score: r.score, rationale: r.rationale }));
    } else {
      scored = candidateIds.map((id) => ({ id }));
    }

    const total = scored.length;
    const startIdx = (page - 1) * limit;
    const pageIds = scored.slice(startIdx, startIdx + limit);

    const profiles = await Promise.all(
      pageIds.map(async (entry) => {
        const full = await getFullProfile(supabase, entry.id);
        if (!full) return null;
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
          avatar_url: full.avatarUrl,
          github_username: full.githubUsername,
          github_public_repos: full.githubPublicRepos,
          skills: full.skills,
          roles: full.roles,
          problem_statement_names: full.problemStatements.map((p) => p.title),
          compatibility_score: entry.score,
          compatibility_rationale: entry.rationale,
        };
      })
    );

    return NextResponse.json({ profiles: profiles.filter(Boolean), total, page, limit });
  });
}
