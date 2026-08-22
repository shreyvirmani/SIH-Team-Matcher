import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError } from "@/lib/auth";
import { createNotification } from "@/lib/profiles";

const schema = z.object({
  receiver_profile_id: z.string(),
  team_id: z.string().optional(),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { receiver_profile_id, team_id, message } = parsed.data;

  if (receiver_profile_id === session.id) {
    return NextResponse.json({ error: "You cannot send a request to yourself" }, { status: 400 });
  }

  const db = getDb();
  const receiver = db.prepare("SELECT id FROM profiles WHERE id = ?").get(receiver_profile_id);
  if (!receiver) return NextResponse.json({ error: "Recipient profile not found" }, { status: 404 });

  const existing = db
    .prepare(
      `SELECT id FROM team_requests WHERE sender_profile_id = ? AND receiver_profile_id = ? AND status = 'pending'`
    )
    .get(session.id, receiver_profile_id);
  if (existing) {
    return NextResponse.json({ error: "You already have a pending request to this student" }, { status: 409 });
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO team_requests (id, sender_profile_id, receiver_profile_id, team_id, status, message)
     VALUES (?, ?, ?, ?, 'pending', ?)`
  ).run(id, session.id, receiver_profile_id, team_id || null, message || null);

  const senderProfile = db.prepare("SELECT full_name FROM profiles WHERE id = ?").get(session.id) as any;
  createNotification(
    receiver_profile_id,
    "team_request",
    `${senderProfile?.full_name || "A student"} sent you a team request.`
  );

  const request = db.prepare("SELECT * FROM team_requests WHERE id = ?").get(id);
  return NextResponse.json(request, { status: 201 });
}

export async function GET(req: NextRequest) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { searchParams } = new URL(req.url);
  const direction = searchParams.get("direction") || "all"; // sent | received | all
  const db = getDb();

  let rows: any[] = [];
  if (direction === "sent") {
    rows = db.prepare(`SELECT * FROM team_requests WHERE sender_profile_id = ? ORDER BY created_at DESC`).all(session.id);
  } else if (direction === "received") {
    rows = db.prepare(`SELECT * FROM team_requests WHERE receiver_profile_id = ? ORDER BY created_at DESC`).all(session.id);
  } else {
    rows = db
      .prepare(
        `SELECT * FROM team_requests WHERE sender_profile_id = ? OR receiver_profile_id = ? ORDER BY created_at DESC`
      )
      .all(session.id, session.id);
  }

  const enriched = rows.map((r: any) => {
    const senderName = (db.prepare("SELECT full_name FROM profiles WHERE id = ?").get(r.sender_profile_id) as any)
      ?.full_name;
    const receiverName = (db.prepare("SELECT full_name FROM profiles WHERE id = ?").get(r.receiver_profile_id) as any)
      ?.full_name;
    return {
      request_id: r.id,
      sender_profile_id: r.sender_profile_id,
      sender_name: senderName,
      receiver_profile_id: r.receiver_profile_id,
      receiver_name: receiverName,
      team_id: r.team_id,
      status: r.status,
      message: r.message,
      created_at: r.created_at,
    };
  });

  return NextResponse.json({ requests: enriched, total: enriched.length });
}
