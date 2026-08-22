import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError } from "@/lib/auth";
import { createNotification } from "@/lib/profiles";

const schema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "status must be accepted or rejected" }, { status: 400 });

  const db = getDb();
  const request = db.prepare("SELECT * FROM team_requests WHERE id = ?").get(params.id) as any;
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.receiver_profile_id !== session.id) {
    return NextResponse.json({ error: "Only the recipient can respond to this request" }, { status: 403 });
  }
  if (request.status !== "pending") {
    return NextResponse.json({ error: "This request has already been responded to" }, { status: 409 });
  }

  const tx = db.transaction(() => {
    db.prepare(`UPDATE team_requests SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(
      parsed.data.status,
      params.id
    );

    if (parsed.data.status === "accepted") {
      let teamId = request.team_id as string | null;

      if (teamId) {
        db.prepare(`INSERT OR IGNORE INTO team_members (team_id, profile_id) VALUES (?, ?)`).run(
          teamId,
          session!.id
        );
      } else {
        // No existing team on the request: find or create one led by the sender.
        const senderTeam = db
          .prepare("SELECT id FROM teams WHERE leader_profile_id = ?")
          .get(request.sender_profile_id) as any;

        if (senderTeam) {
          teamId = senderTeam.id;
        } else {
          teamId = randomUUID();
          const senderProfile = db
            .prepare("SELECT full_name FROM profiles WHERE id = ?")
            .get(request.sender_profile_id) as any;
          db.prepare(
            `INSERT INTO teams (id, name, leader_profile_id, problem_statement_id)
             VALUES (?, ?, ?, (SELECT problem_statement_id FROM profile_problem_statements WHERE profile_id = ? LIMIT 1))`
          ).run(teamId, `${senderProfile?.full_name || "New"}'s Team`, request.sender_profile_id, request.sender_profile_id);
          db.prepare(`INSERT INTO team_members (team_id, profile_id) VALUES (?, ?)`).run(
            teamId,
            request.sender_profile_id
          );
        }
        db.prepare(`INSERT OR IGNORE INTO team_members (team_id, profile_id) VALUES (?, ?)`).run(
          teamId,
          session!.id
        );
      }
    }
  });
  tx();

  const receiverProfile = db.prepare("SELECT full_name FROM profiles WHERE id = ?").get(session.id) as any;
  createNotification(
    request.sender_profile_id,
    parsed.data.status === "accepted" ? "team_accepted" : "team_rejected",
    `${receiverProfile?.full_name || "A student"} ${parsed.data.status} your team request.`
  );

  const updated = db.prepare("SELECT * FROM team_requests WHERE id = ?").get(params.id);
  return NextResponse.json(updated);
}
