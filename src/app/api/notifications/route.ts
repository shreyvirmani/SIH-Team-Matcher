import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireSession, AuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { searchParams } = new URL(req.url);
  const isRead = searchParams.get("is_read");
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));

  const db = getDb();
  let rows: any[];
  if (isRead === "true") {
    rows = db
      .prepare(`SELECT * FROM notifications WHERE receiver_profile_id = ? AND read_at IS NOT NULL ORDER BY created_at DESC LIMIT ?`)
      .all(session.id, limit);
  } else if (isRead === "false") {
    rows = db
      .prepare(`SELECT * FROM notifications WHERE receiver_profile_id = ? AND read_at IS NULL ORDER BY created_at DESC LIMIT ?`)
      .all(session.id, limit);
  } else {
    rows = db
      .prepare(`SELECT * FROM notifications WHERE receiver_profile_id = ? ORDER BY created_at DESC LIMIT ?`)
      .all(session.id, limit);
  }

  const notifications = rows.map((r: any) => ({
    notification_id: r.id,
    message: r.message,
    type: r.type,
    is_read: !!r.read_at,
    created_at: r.created_at,
  }));

  return NextResponse.json({ notifications, total: notifications.length });
}

const patchSchema = z.object({
  notification_id: z.string().optional(),
  mark_all_read: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  let session;
  try {
    session = requireSession();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const db = getDb();
  if (parsed.data.mark_all_read) {
    db.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE receiver_profile_id = ? AND read_at IS NULL`).run(
      session.id
    );
  } else if (parsed.data.notification_id) {
    db.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND receiver_profile_id = ?`).run(
      parsed.data.notification_id,
      session.id
    );
  }

  return NextResponse.json({ ok: true });
}
