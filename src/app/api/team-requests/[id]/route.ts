import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { createNotification } from "@/lib/profiles";

const schema = z.object({ status: z.enum(["accepted", "rejected"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "status must be accepted or rejected" }, { status: 400 });

    const { data: request } = await supabase.from("team_requests").select("*").eq("id", params.id).maybeSingle();
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.receiver_profile_id !== session.id) {
      return NextResponse.json({ error: "Only the recipient can respond to this request" }, { status: 403 });
    }
    if (request.status !== "pending") {
      return NextResponse.json({ error: "This request has already been responded to" }, { status: 409 });
    }

    const { error: updateError } = await supabase
      .from("team_requests")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", params.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    if (parsed.data.status === "accepted") {
      // Forming/joining a team on someone else's behalf needs elevated
      // privilege: the receiver is authorizing team membership that spans
      // both users, which per-row RLS deliberately doesn't grant to either
      // party alone. The authorization check above (only the invited
      // recipient can accept) is what makes this safe to do with the admin
      // client — RLS still fully protects every other write path.
      const admin = createAdminSupabase();
      let teamId: string | null = request.team_id;

      if (teamId) {
        await admin.from("team_members").upsert({ team_id: teamId, profile_id: session.id }, { onConflict: "team_id,profile_id" });
      } else {
        const { data: senderTeam } = await admin
          .from("teams")
          .select("id")
          .eq("leader_profile_id", request.sender_profile_id)
          .maybeSingle();

        if (senderTeam) {
          teamId = senderTeam.id;
        } else {
          const { data: senderProfile } = await admin
            .from("profiles")
            .select("full_name")
            .eq("id", request.sender_profile_id)
            .single();
          const { data: senderPS } = await admin
            .from("profile_problem_statements")
            .select("problem_statement_id")
            .eq("profile_id", request.sender_profile_id)
            .limit(1)
            .maybeSingle();

          const { data: newTeam } = await admin
            .from("teams")
            .insert({
              name: `${senderProfile?.full_name || "New"}'s Team`,
              leader_profile_id: request.sender_profile_id,
              problem_statement_id: senderPS?.problem_statement_id ?? null,
            })
            .select()
            .single();
          teamId = newTeam!.id;
          await admin.from("team_members").insert({ team_id: teamId, profile_id: request.sender_profile_id });
        }
        await admin.from("team_members").upsert({ team_id: teamId, profile_id: session.id }, { onConflict: "team_id,profile_id" });
      }
    }

    const { data: receiverProfile } = await supabase.from("profiles").select("full_name").eq("id", session.id).single();
    await createNotification(
      supabase,
      request.sender_profile_id,
      parsed.data.status === "accepted" ? "team_accepted" : "team_rejected",
      `${receiverProfile?.full_name || "A student"} ${parsed.data.status} your team request.`
    );

    const { data: updated } = await supabase.from("team_requests").select("*").eq("id", params.id).single();
    return NextResponse.json(updated);
  });
}
