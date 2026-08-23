import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { getFullProfile, toMatchProfile, upsertLookupIds } from "@/lib/profiles";
import { rankCompatibility } from "@/lib/matching";
import { lookupGithubUser } from "@/lib/github";

const profileSchema = z.object({
  fullName: z.string().min(2).max(120),
  college: z.string().min(2).max(160),
  branch: z.string().min(2).max(120),
  year: z.number().int().min(1).max(6),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
  availability: z.enum(["Full-time", "Part-time", "Flexible"]),
  bio: z.string().max(1000).optional().default(""),
  avatarUrl: z.string().url().optional(),
  githubUsername: z.string().max(60).optional(),
  phoneNumber: z.string().max(30).optional().nullable(),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  problemStatementIds: z.array(z.number()).default([]),
  isLookingForTeam: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => null);
    const parsed = profileSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const data = parsed.data;

    const { data: existing } = await supabase.from("profiles").select("id").eq("id", session.id).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Profile already exists. Use PUT to update." }, { status: 409 });
    }

    let githubPublicRepos: number | null = null;
    if (data.githubUsername) {
      const gh = await lookupGithubUser(data.githubUsername);
      githubPublicRepos = gh.publicRepos;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: session.id,
      full_name: data.fullName,
      college: data.college,
      branch: data.branch,
      year: data.year,
      experience: data.experience,
      availability: data.availability,
      bio: data.bio,
      avatar_url: data.avatarUrl,
      github_username: data.githubUsername || null,
      github_public_repos: githubPublicRepos,
      phone_number: data.phoneNumber || null,
      is_looking_for_team: data.isLookingForTeam,
    });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

    const skillIds = await upsertLookupIds(supabase, "skills", data.skills);
    if (skillIds.length > 0) {
      await supabase.from("user_skills").insert(skillIds.map((skill_id) => ({ profile_id: session.id, skill_id })));
    }

    const roleIds = await upsertLookupIds(supabase, "roles", data.roles);
    if (roleIds.length > 0) {
      await supabase.from("user_roles").insert(roleIds.map((role_id) => ({ profile_id: session.id, role_id })));
    }

    if (data.problemStatementIds.length > 0) {
      await supabase
        .from("profile_problem_statements")
        .insert(data.problemStatementIds.map((problem_statement_id) => ({ profile_id: session.id, problem_statement_id })));
    }

    const profile = await getFullProfile(supabase, session.id);
    return NextResponse.json(profile, { status: 201 });
  });
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

    // AI-powered compatibility scoring against the current user's profile.
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
          // Notice: phone_number is deliberately NOT included here (privacy protection)
        };
      })
    );

    return NextResponse.json({ profiles: profiles.filter(Boolean), total, page, limit });
  });
}
