import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser, getSessionUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { getFullProfile, toMatchProfile, upsertLookupIds } from "@/lib/profiles";
import { scoreCompatibility } from "@/lib/matching";
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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const supabase = createServerSupabase();
    const full = await getFullProfile(supabase, params.id);
    if (!full) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    let compatibility: { score: number; rationale: string } | null = null;
    const currentExists = await getFullProfile(supabase, session.id);
    if (currentExists && session.id !== params.id) {
      const result = scoreCompatibility(
        await toMatchProfile(supabase, session.id),
        await toMatchProfile(supabase, params.id)
      );
      compatibility = { score: result.score, rationale: result.rationale };
    }

    // Check if the requester is the profile owner or a confirmed teammate
    let areTeammates = false;
    if (session.id === params.id) {
      areTeammates = true;
    } else {
      const { data: myTeams } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("profile_id", session.id);
      const teamIds = (myTeams || []).map((t: any) => t.team_id);
      if (teamIds.length > 0) {
        const { data: sharedMember } = await supabase
          .from("team_members")
          .select("profile_id")
          .eq("profile_id", params.id)
          .in("team_id", teamIds)
          .limit(1)
          .maybeSingle();
        if (sharedMember) areTeammates = true;
      }
    }

    return NextResponse.json({
      profile_id: full.id,
      user_id: full.id,
      name: full.fullName,
      fullName: full.fullName,
      college: full.college,
      branch: full.branch,
      year: full.year,
      experience: full.experience,
      availability: full.availability,
      bio: full.bio,
      avatar_url: full.avatarUrl,
      avatarUrl: full.avatarUrl,
      github_username: full.githubUsername,
      githubUsername: full.githubUsername,
      github_public_repos: full.githubPublicRepos,
      phone_number: areTeammates ? full.phoneNumber : undefined,
      mobileNumber: areTeammates ? full.phoneNumber : undefined,
      is_teammate: areTeammates,
      skills: full.skills,
      roles: full.roles,
      problem_statement_names: full.problemStatements.map((p) => p.title),
      problemStatements: full.problemStatements,
      compatibility_score: compatibility?.score,
      compatibility_rationale: compatibility?.rationale,
    });
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    if (session.id !== params.id) {
      return NextResponse.json({ error: "Forbidden: you can only update your own profile" }, { status: 403 });
    }

    const json = await req.json().catch(() => ({}));
    const supabase = createServerSupabase();

    const { data: existing } = await supabase.from("profiles").select("id").eq("id", params.id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const update: Record<string, any> = {};

    if (json.fullName !== undefined || json.full_name !== undefined || json.name !== undefined) {
      const name = String(json.fullName || json.full_name || json.name || "").trim();
      if (name.length >= 2) update.full_name = name;
    }
    if (json.college !== undefined) {
      const col = String(json.college || "").trim();
      if (col.length >= 2) update.college = col;
    }
    if (json.branch !== undefined) {
      update.branch = String(json.branch || "").trim();
    }
    if (json.year !== undefined || json.graduationYear !== undefined || json.graduation_year !== undefined) {
      update.year = parseYear(json.year || json.graduationYear || json.graduation_year);
    }
    if (json.experience !== undefined || json.experienceLevel !== undefined || json.experience_level !== undefined) {
      update.experience = parseExperience(json.experience || json.experienceLevel || json.experience_level);
    }
    if (json.availability !== undefined) {
      update.availability = parseAvailability(json.availability);
    }
    if (json.bio !== undefined) {
      update.bio = String(json.bio || "").trim();
    }
    if (json.avatarUrl !== undefined || json.avatar_url !== undefined) {
      update.avatar_url = cleanAvatarUrl(json.avatarUrl || json.avatar_url);
    }
    if (json.mobileNumber !== undefined || json.phoneNumber !== undefined || json.phone_number !== undefined) {
      update.phone_number = String(json.mobileNumber || json.phoneNumber || json.phone_number || "").trim() || null;
    }
    if (json.isLookingForTeam !== undefined || json.is_looking_for_team !== undefined) {
      update.is_looking_for_team = json.isLookingForTeam !== false && json.is_looking_for_team !== false;
    }

    if (
      json.githubUsername !== undefined ||
      json.github_username !== undefined ||
      json.githubUrl !== undefined ||
      json.github_url !== undefined
    ) {
      const gh = cleanGithubUsername(json.githubUsername || json.github_username || json.githubUrl || json.github_url);
      update.github_username = gh;
      update.github_public_repos = gh ? (await lookupGithubUser(gh)).publicRepos : null;
    }

    update.updated_at = new Date().toISOString();

    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("profiles").update(update).eq("id", params.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Skills
    if (json.skills && Array.isArray(json.skills)) {
      const skills = json.skills.map((s: any) => String(s).trim()).filter(Boolean);
      await supabase.from("user_skills").delete().eq("profile_id", params.id);
      const skillIds = await upsertLookupIds(supabase, "skills", skills);
      if (skillIds.length > 0) {
        await supabase.from("user_skills").insert(skillIds.map((skill_id) => ({ profile_id: params.id, skill_id })));
      }
    }

    // Roles
    const rawRoles = json.roles || json.preferredRoles;
    if (rawRoles && Array.isArray(rawRoles)) {
      const roles = rawRoles.map((r: any) => String(r).trim()).filter(Boolean);
      await supabase.from("user_roles").delete().eq("profile_id", params.id);
      const roleIds = await upsertLookupIds(supabase, "roles", roles);
      if (roleIds.length > 0) {
        await supabase.from("user_roles").insert(roleIds.map((role_id) => ({ profile_id: params.id, role_id })));
      }
    }

    // Problem Statements
    const rawPS = json.problemStatementIds || json.problem_statement_ids;
    if (rawPS && Array.isArray(rawPS)) {
      const psIds = rawPS.map((id: any) => Number(id)).filter((id: number) => !isNaN(id) && id > 0);
      await supabase.from("profile_problem_statements").delete().eq("profile_id", params.id);
      if (psIds.length > 0) {
        await supabase
          .from("profile_problem_statements")
          .insert(psIds.map((problem_statement_id: number) => ({ profile_id: params.id, problem_statement_id })));
      }
    }

    return NextResponse.json(await getFullProfile(supabase, params.id));
  });
}
