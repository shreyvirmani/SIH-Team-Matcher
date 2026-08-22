import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const { searchParams } = new URL(req.url);
    const isRead = searchParams.get("is_read");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("receiver_profile_id", session.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (isRead === "true") query = query.not("read_at", "is", null);
    else if (isRead === "false") query = query.is("read_at", null);

    const { data: rows } = await query;

    const notifications = (rows || []).map((r: any) => ({
      notification_id: r.id,
      message: r.message,
      type: r.type,
      is_read: !!r.read_at,
      created_at: r.created_at,
    }));

    return NextResponse.json({ notifications, total: notifications.length });
  });
}

const patchSchema = z.object({
  notification_id: z.string().optional(),
  mark_all_read: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const nowIso = new Date().toISOString();
    if (parsed.data.mark_all_read) {
      await supabase
        .from("notifications")
        .update({ read_at: nowIso })
        .eq("receiver_profile_id", session.id)
        .is("read_at", null);
    } else if (parsed.data.notification_id) {
      await supabase
        .from("notifications")
        .update({ read_at: nowIso })
        .eq("id", parsed.data.notification_id)
        .eq("receiver_profile_id", session.id);
    }

    return NextResponse.json({ ok: true });
  });
}
