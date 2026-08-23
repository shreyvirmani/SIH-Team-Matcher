import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminSupabase } from "./supabase/admin";

export interface FullProfile {
  id: string;
  fullName: string;
  college: string;
  branch: string;
  year: number;
  experience: "Beginner" | "Intermediate" | "Advanced";
  availability: "Full-time" | "Part-time" | "Flexible";
  bio: string;
  avatarUrl?: string;
  githubUsername?: string;
  githubPublicRepos?: number;
  phoneNumber?: string;
  isLookingForTeam: boolean;
  isAdmin?: boolean;
  skills: string[];
  roles: string[];
  problemStatements: { id: number; title: string; category?: string }[];
}

export async function getFullProfile(supabase: SupabaseClient, profileId: string): Promise<FullProfile | null> {
  const { data: row } = await supabase.from("profiles").select("*").eq("id", profileId).maybeSingle();
  if (!row) return null;

  const [{ data: userSkills }, { data: userRoles }, { data: userProblemStatements }, { data: adminRow }] =
    await Promise.all([
      supabase.from("user_skills").select("skills(name)").eq("profile_id", profileId),
      supabase.from("user_roles").select("roles(name)").eq("profile_id", profileId),
      supabase.from("profile_problem_statements").select("problem_statements(id, title, category)").eq("profile_id", profileId),
      supabase.from("admins").select("user_id").eq("user_id", profileId).maybeSingle(),
    ]);

  const skills = (userSkills || []).map((s: any) => s.skills?.name).filter(Boolean);
  const roles = (userRoles || []).map((r: any) => r.roles?.name).filter(Boolean);
  const problemStatements = (userProblemStatements || [])
    .map((p: any) => p.problem_statements)
    .filter(Boolean);

  return {
    id: row.id,
    fullName: row.full_name,
    college: row.college,
    branch: row.branch,
    year: row.year,
    experience: row.experience,
    availability: row.availability,
    bio: row.bio,
    avatarUrl: row.avatar_url || undefined,
    githubUsername: row.github_username || undefined,
    githubPublicRepos: row.github_public_repos ?? undefined,
    phoneNumber: row.phone_number || undefined,
    isLookingForTeam: row.is_looking_for_team,
    isAdmin: !!adminRow,
    skills,
    roles,
    problemStatements,
  };
}

export async function toMatchProfile(supabase: SupabaseClient, profileId: string) {
  const { data: row } = await supabase.from("profiles").select("*").eq("id", profileId).single();
  const [{ data: userSkills }, { data: userRoles }, { data: userPS }] = await Promise.all([
    supabase.from("user_skills").select("skills(name)").eq("profile_id", profileId),
    supabase.from("user_roles").select("roles(name)").eq("profile_id", profileId),
    supabase.from("profile_problem_statements").select("problem_statements(id)").eq("profile_id", profileId),
  ]);

  const skills = (userSkills || []).map((s: any) => s.skills?.name).filter(Boolean);
  const roles = (userRoles || []).map((r: any) => r.roles?.name).filter(Boolean);
  const problemStatements = (userPS || []).map((p: any) => p.problem_statements).filter(Boolean);

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
 * a row for user B). Uses service role admin client when available, with
 * client fallback and error logging.
 */
export async function createNotification(
  supabase: SupabaseClient,
  receiverProfileId: string,
  type: string,
  message: string
) {
  try {
    const admin = createAdminSupabase();
    const { error } = await admin.from("notifications").insert({
      receiver_profile_id: receiverProfileId,
      type,
      message,
    });
    if (error) {
      console.warn("createNotification admin insert failed, trying client:", error.message);
      await supabase.from("notifications").insert({
        receiver_profile_id: receiverProfileId,
        type,
        message,
      });
    }
  } catch (err: any) {
    console.warn("createNotification fallback to standard client:", err.message);
    await supabase.from("notifications").insert({
      receiver_profile_id: receiverProfileId,
      type,
      message,
    });
  }
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
