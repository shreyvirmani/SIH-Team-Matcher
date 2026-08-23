import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { createNotification } from "@/lib/profiles";

const schema = z.object({
  status: z.enum(["accepted", "rejected", "declined"]).optional(),
  action: z.enum(["accept", "decline", "reject", "cancel"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action. Must be accept or decline." }, { status: 400 });
    }

    let resolvedStatus: "accepted" | "rejected" | null = null;
    const rawAction = (parsed.data.action || parsed.data.status || "").toLowerCase();

    if (rawAction === "accept" || rawAction === "accepted") {
      resolvedStatus = "accepted";
    } else if (rawAction === "decline" || rawAction === "declined" || rawAction === "reject" || rawAction === "rejected" || rawAction === "cancel") {
      resolvedStatus = "rejected";
    }

    if (!resolvedStatus) {
      return NextResponse.json({ error: "Please specify accept or decline." }, { status: 400 });
    }

    const { data: request } = await supabase.from("team_requests").select("*").eq("id", params.id).maybeSingle();
    if (!request) return NextResponse.json({ error: "Request not found." }, { status: 404 });

    // Receiver can accept/decline; Sender can cancel pending request
    const isReceiver = request.receiver_profile_id === session.id;
    const isSender = request.sender_profile_id === session.id;

    if (!isReceiver && !isSender) {
      return NextResponse.json({ error: "Unauthorized to respond to this request." }, { status: 403 });
    }

    if (isSender && resolvedStatus === "accepted") {
      return NextResponse.json({ error: "Only the recipient can accept a squad invitation." }, { status: 403 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ error: `This request has already been ${request.status}.` }, { status: 409 });
    }

    const admin = createAdminSupabase();

    const { error: updateError } = await admin
      .from("team_requests")
      .update({ status: resolvedStatus, updated_at: new Date().toISOString() })
      .eq("id", params.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    if (resolvedStatus === "accepted") {
      let teamId: string | null = request.team_id;

      if (teamId) {
        // Add receiver to team and ensure sender is also listed
        await admin.from("team_members").upsert(
          [
            { team_id: teamId, profile_id: request.sender_profile_id },
            { team_id: teamId, profile_id: request.receiver_profile_id },
          ],
          { onConflict: "team_id,profile_id" }
        );
      } else {
        // Check if sender leads a team
        const { data: senderTeam } = await admin
          .from("teams")
          .select("id")
          .eq("leader_profile_id", request.sender_profile_id)
          .maybeSingle();

        if (senderTeam) {
          teamId = senderTeam.id;
        } else {
          // Check if receiver leads a team
          const { data: receiverTeam } = await admin
            .from("teams")
            .select("id")
            .eq("leader_profile_id", request.receiver_profile_id)
            .maybeSingle();

          if (receiverTeam) {
            teamId = receiverTeam.id;
          } else {
            // Create a squad for the sender
            const { data: senderProfile } = await admin
              .from("profiles")
              .select("full_name")
              .eq("id", request.sender_profile_id)
              .maybeSingle();

            const { data: senderPS } = await admin
              .from("profile_problem_statements")
              .select("problem_statement_id")
              .eq("profile_id", request.sender_profile_id)
              .limit(1)
              .maybeSingle();

            const { data: newTeam } = await admin
              .from("teams")
              .insert({
                name: `${senderProfile?.full_name || "New"}'s Squad`,
                leader_profile_id: request.sender_profile_id,
                problem_statement_id: senderPS?.problem_statement_id ?? 1,
              })
              .select()
              .single();

            teamId = newTeam?.id || null;
          }
        }

        if (teamId) {
          await admin.from("team_members").upsert(
            [
              { team_id: teamId, profile_id: request.sender_profile_id },
              { team_id: teamId, profile_id: request.receiver_profile_id },
            ],
            { onConflict: "team_id,profile_id" }
          );
          // Link request to the team
          await admin.from("team_requests").update({ team_id: teamId }).eq("id", params.id);
        }
      }
    }

    const recipientToNotify = isReceiver ? request.sender_profile_id : request.receiver_profile_id;
    const { data: currentActor } = await supabase.from("profiles").select("full_name").eq("id", session.id).maybeSingle();

    await createNotification(
      supabase,
      recipientToNotify,
      resolvedStatus === "accepted" ? "team_accepted" : "team_rejected",
      `${currentActor?.full_name || "A hacker"} ${resolvedStatus} the team request.`
    );

    const { data: updated } = await supabase.from("team_requests").select("*").eq("id", params.id).single();
    return NextResponse.json(updated);
  });
}
