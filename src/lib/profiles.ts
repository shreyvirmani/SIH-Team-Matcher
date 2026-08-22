import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileForMatch } from "./matching";
import { createAdminSupabase } from "./supabase/admin";

// All functions here take an already-authenticated Supabase client (server
// or admin) so every call is naturally scoped by RLS as the calling user —
// there's no separate "trusted" data layer to keep in sync with policies.

export async function getSkillsForProfile(supabase: SupabaseClient, profileId: string): Promise<string[]> {
  const { data } = await supabase
    .from("user_skills")
    .select("skills(name)")
    .eq("profile_id", profileId);
  return (data || []).map((r: any) => r.skills.name);
}

export async function getRolesForProfile(supabase: SupabaseClient, profileId: string): Promise<string[]> {
  const { data } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("profile_id", profileId);
  return (data || []).map((r: any) => r.roles.name);
}

export async function getProblemStatementsForProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<{ id: number; title: string }[]> {
  const { data } = await supabase
    .from("profile_problem_statements")
    .select("problem_statements(id, title)")
    .eq("profile_id", profileId);
  return (data || []).map((r: any) => ({ id: r.problem_statements.id, title: r.problem_statements.title }));
}

export async function getFullProfile(supabase: SupabaseClient, profileId: string) {
  const { data: row } = await supabase.from("profiles").select("*").eq("id", profileId).maybeSingle();
  if (!row) return null;

  const [skills, roles, problemStatements] = await Promise.all([
    getSkillsForProfile(supabase, profileId),
    getRolesForProfile(supabase, profileId),
    getProblemStatementsForProfile(supabase, profileId),
  ]);

  return {
    id: row.id,
    fullName: row.full_name,
    college: row.college,
    branch: row.branch,
    year: row.year,
    experience: row.experience,
    availability: row.availability,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    githubUsername: row.github_username,
    githubPublicRepos: row.github_public_repos,
    isLookingForTeam: row.is_looking_for_team,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    skills,
    roles,
    problemStatements,
  };
}

export async function toMatchProfile(supabase: SupabaseClient, profileId: string): Promise<ProfileForMatch> {
  const { data: row, error } = await supabase
    .from("profiles")
    .select("id, full_name, experience, availability")
    .eq("id", profileId)
    .single();
  if (error || !row) throw new Error(`Profile not found: ${profileId}`);

  const [skills, roles, problemStatements] = await Promise.all([
    getSkillsForProfile(supabase, profileId),
    getRolesForProfile(supabase, profileId),
    getProblemStatementsForProfile(supabase, profileId),
  ]);

  return {
    id: row.id,
    fullName: row.full_name,
    experience: row.experience,
    availability: row.availability,
    skills,
    roles,
    problemStatementIds: problemStatements.map((p) => p.id),
  };
}

/**
 * Notifications are a system-triggered side effect (user A's action creates
 * a row for user B), which is deliberately NOT something RLS grants to an
 * ordinary authenticated user (that would let anyone spam anyone). This one
 * write path uses the service-role client instead, after the calling route
 * has already done its own authorization check on the triggering action.
 */
export async function createNotification(
  _supabase: SupabaseClient,
  receiverProfileId: string,
  type: string,
  message: string
) {
  const admin = createAdminSupabase();
  await admin.from("notifications").insert({ receiver_profile_id: receiverProfileId, type, message });
}

/**
 * Upserts skill/role names into their lookup tables and returns the ids.
 * Used when a profile references a skill/role name that doesn't exist yet.
 */
export async function upsertLookupIds(
  supabase: SupabaseClient,
  table: "skills" | "roles",
  names: string[]
): Promise<number[]> {
  if (names.length === 0) return [];
  const { data: existing } = await supabase.from(table).select("id, name").in("name", names);
  const existingMap = new Map((existing || []).map((r: any) => [r.name, r.id]));
  const missing = names.filter((n) => !existingMap.has(n));

  if (missing.length > 0) {
    const { data: inserted } = await supabase
      .from(table)
      .insert(missing.map((name) => ({ name })))
      .select("id, name");
    for (const r of inserted || []) existingMap.set((r as any).name, (r as any).id);
  }

  return names.map((n) => existingMap.get(n)!);
}
