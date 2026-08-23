import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { buildTeamDetail } from "@/lib/teams";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();
    const detail = await buildTeamDetail(supabase, params.id, session.id);
    if (!detail) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json(detail);
  });
}

const patchSchema = z.object({
  action: z.enum(["remove_member", "rename", "leave"]),
  profile_id: z.string().optional(),
  memberId: z.string().optional(),
  name: z.string().min(2).max(120).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();
    const admin = createAdminSupabase();

    const { data: team } = await supabase.from("teams").select("*").eq("id", params.id).maybeSingle();
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const json = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const targetProfileId = parsed.data.memberId || parsed.data.profile_id;

    if (parsed.data.action === "leave") {
      if (team.leader_profile_id === session.id) {
        return NextResponse.json({ error: "Team leader cannot leave. Disband or transfer leadership." }, { status: 400 });
      }
      await admin.from("team_members").delete().eq("team_id", params.id).eq("profile_id", session.id);
    } else if (parsed.data.action === "remove_member") {
      if (team.leader_profile_id !== session.id) {
        return NextResponse.json({ error: "Only the team leader can remove members" }, { status: 403 });
      }
      if (!targetProfileId) {
        return NextResponse.json({ error: "Member ID required" }, { status: 400 });
      }
      if (targetProfileId === team.leader_profile_id) {
        return NextResponse.json({ error: "Team leader cannot remove themselves" }, { status: 400 });
      }
      await admin.from("team_members").delete().eq("team_id", params.id).eq("profile_id", targetProfileId);
    } else if (parsed.data.action === "rename" && parsed.data.name) {
      if (team.leader_profile_id !== session.id) {
        return NextResponse.json({ error: "Only the team leader can rename the team" }, { status: 403 });
      }
      await admin
        .from("teams")
        .update({ name: parsed.data.name, updated_at: new Date().toISOString() })
        .eq("id", params.id);
    }

    const updated = await buildTeamDetail(supabase, params.id, session.id);
    return NextResponse.json(updated);
  });
}
