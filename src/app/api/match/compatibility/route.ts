import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";
import { toMatchProfile } from "@/lib/profiles";
import { rankCompatibility } from "@/lib/matching";

const schema = z.object({
  target_profile_ids: z.array(z.string()).min(1).max(200),
});

export async function POST(req: NextRequest) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "target_profile_ids is required" }, { status: 400 });
    }

    const current = await toMatchProfile(supabase, session.id);
    const targets = await Promise.all(parsed.data.target_profile_ids.map((id) => toMatchProfile(supabase, id)));
    const ranked = rankCompatibility(current, targets);

    return NextResponse.json({
      scores: ranked.map((r) => ({ profile_id: r.profileId, score: r.score, rationale: r.rationale })),
    });
  });
}
