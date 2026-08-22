import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { getFullProfile } from "@/lib/profiles";

export async function GET() {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const { data: rows } = await supabase
      .from("saved_profiles")
      .select("saved_profile_id, created_at")
      .eq("owner_profile_id", session.id)
      .order("created_at", { ascending: false });

    const profiles = await Promise.all(
      (rows || []).map(async (r: any) => {
        const full = await getFullProfile(supabase, r.saved_profile_id);
        return full ? { ...full, savedAt: r.created_at } : null;
      })
    );

    return NextResponse.json({ profiles: profiles.filter(Boolean) });
  });
}

const schema = z.object({ profile_id: z.string() });

export async function POST(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "profile_id is required" }, { status: 400 });

    const { error } = await supabase
      .from("saved_profiles")
      .upsert({ owner_profile_id: session.id, saved_profile_id: parsed.data.profile_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 201 });
  });
}
