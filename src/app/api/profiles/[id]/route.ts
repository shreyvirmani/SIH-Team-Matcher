import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser, getSessionUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { getFullProfile, toMatchProfile, upsertLookupIds } from "@/lib/profiles";
import { scoreCompatibility } from "@/lib/matching";
import { lookupGithubUser } from "@/lib/github";

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
      college: full.college,
      branch: full.branch,
      year: full.year,
      experience: full.experience,
      availability: full.availability,
      bio: full.bio,
      avatar_url: full.avatarUrl,
      github_username: full.githubUsername,
      github_public_repos: full.githubPublicRepos,
      phone_number: areTeammates ? full.phoneNumber : undefined,
      is_teammate: areTeammates,
      skills: full.skills,
      roles: full.roles,
      problem_statement_names: full.problemStatements.map((p) => p.title),
      compatibility_score: compatibility?.score,
      compatibility_rationale: compatibility?.rationale,
    });
  });
}

const updateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  college: z.string().min(2).max(160).optional(),
  branch: z.string().min(2).max(120).optional(),
  year: z.number().int().min(1).max(6).optional(),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  availability: z.enum(["Full-time", "Part-time", "Flexible"]).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
  githubUsername: z.string().max(60).optional().nullable(),
  phoneNumber: z.string().max(30).optional().nullable(),
  skills: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  problemStatementIds: z.array(z.number()).optional(),
  isLookingForTeam: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    if (session.id !== params.id) {
      return NextResponse.json({ error: "Forbidden: you can only update your own profile" }, { status: 403 });
    }

    const json = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const data = parsed.data;
    const supabase = createServerSupabase();

    const { data: existing } = await supabase.from("profiles").select("id").eq("id", params.id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const update: Record<string, any> = {};
    if (data.fullName !== undefined) update.full_name = data.fullName;
    if (data.college !== undefined) update.college = data.college;
    if (data.branch !== undefined) update.branch = data.branch;
    if (data.year !== undefined) update.year = data.year;
    if (data.experience !== undefined) update.experience = data.experience;
    if (data.availability !== undefined) update.availability = data.availability;
    if (data.bio !== undefined) update.bio = data.bio;
    if (data.avatarUrl !== undefined) update.avatar_url = data.avatarUrl;
    if (data.isLookingForTeam !== undefined) update.is_looking_for_team = data.isLookingForTeam;
    if (data.phoneNumber !== undefined) update.phone_number = data.phoneNumber || null;
    if (data.githubUsername !== undefined) {
      update.github_username = data.githubUsername || null;
      update.github_public_repos = data.githubUsername
        ? (await lookupGithubUser(data.githubUsername)).publicRepos
        : null;
    }
    update.updated_at = new Date().toISOString();

    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("profiles").update(update).eq("id", params.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.skills) {
      await supabase.from("user_skills").delete().eq("profile_id", params.id);
      const skillIds = await upsertLookupIds(supabase, "skills", data.skills);
      if (skillIds.length > 0) {
        await supabase.from("user_skills").insert(skillIds.map((skill_id) => ({ profile_id: params.id, skill_id })));
      }
    }

    if (data.roles) {
      await supabase.from("user_roles").delete().eq("profile_id", params.id);
      const roleIds = await upsertLookupIds(supabase, "roles", data.roles);
      if (roleIds.length > 0) {
        await supabase.from("user_roles").insert(roleIds.map((role_id) => ({ profile_id: params.id, role_id })));
      }
    }

    if (data.problemStatementIds) {
      await supabase.from("profile_problem_statements").delete().eq("profile_id", params.id);
      if (data.problemStatementIds.length > 0) {
        await supabase
          .from("profile_problem_statements")
          .insert(data.problemStatementIds.map((problem_statement_id) => ({ profile_id: params.id, problem_statement_id })));
      }
    }

    return NextResponse.json(await getFullProfile(supabase, params.id));
  });
}
