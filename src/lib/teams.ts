import { SupabaseClient } from "@supabase/supabase-js";
import { getFullProfile } from "./profiles";

const IDEAL_ROLES = ["Frontend Developer", "Backend Developer", "UI/UX Designer", "ML Engineer"];
const COMMONLY_NEEDED_SKILLS = ["React", "Node.js", "Python", "UI/UX Design", "Machine Learning", "SQL"];

export async function buildTeamDetail(supabase: SupabaseClient, teamId: string, currentUserId?: string) {
  const { data: team } = await supabase.from("teams").select("*").eq("id", teamId).maybeSingle();
  if (!team) return null;

  let psTitle: string | null = null;
  if (team.problem_statement_id) {
    const { data: ps } = await supabase
      .from("problem_statements")
      .select("title")
      .eq("id", team.problem_statement_id)
      .maybeSingle();
    psTitle = ps?.title || null;
  }

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("profile_id")
    .eq("team_id", teamId);

  const memberProfileIds = new Set<string>();
  if (team.leader_profile_id) {
    memberProfileIds.add(team.leader_profile_id);
  }
  (memberRows || []).forEach((m: any) => {
    if (m.profile_id) memberProfileIds.add(m.profile_id);
  });

  const members = await Promise.all(
    Array.from(memberProfileIds).map(async (profileId) => {
      const full = await getFullProfile(supabase, profileId);
      if (!full) return null;
      const isLeader = full.id === team.leader_profile_id;
      return {
        id: full.id,
        user_id: full.id,
        profile_id: full.id,
        fullName: full.fullName,
        name: full.fullName,
        avatarUrl: full.avatarUrl,
        avatar_url: full.avatarUrl,
        mobileNumber: full.phoneNumber,
        phone_number: full.phoneNumber,
        college: full.college,
        branch: full.branch,
        roles: full.roles,
        skills: full.skills,
        role: isLeader ? "leader" : "member",
        is_leader: isLeader,
        isLeader: isLeader,
      };
    })
  );

  const validMembers = members.filter(Boolean) as NonNullable<(typeof members)[number]>[];

  const coveredRoles = new Set(validMembers.flatMap((m) => m.roles));
  const missingRoles = IDEAL_ROLES.filter((r) => !coveredRoles.has(r));

  const coveredSkills = new Set(validMembers.flatMap((m) => m.skills));
  const missingSkills = COMMONLY_NEEDED_SKILLS.filter((s) => !coveredSkills.has(s));

  return {
    id: team.id,
    team_id: team.id,
    name: team.name,
    leader_profile_id: team.leader_profile_id,
    isLeader: currentUserId ? team.leader_profile_id === currentUserId : false,
    problem_statement_id: team.problem_statement_id,
    problem_statement_name: psTitle,
    members: validMembers,
    missing_roles_skills: { roles: missingRoles, skills: missingSkills },
  };
}

export async function getUserTeam(supabase: SupabaseClient, userId: string) {
  const { data: leadingTeam } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_profile_id", userId)
    .maybeSingle();

  if (leadingTeam?.id) {
    return await buildTeamDetail(supabase, leadingTeam.id, userId);
  }

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (membership?.team_id) {
    return await buildTeamDetail(supabase, membership.team_id, userId);
  }

  return null;
}

