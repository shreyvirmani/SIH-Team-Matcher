import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, AuthError } from "@/lib/auth";
import { toMatchProfile } from "@/lib/profiles";
import { rankCompatibility } from "@/lib/matching";

const schema = z.object({
  target_profile_ids: z.array(z.string()).min(1).max(200),
});

// Internal API used by GET /api/profiles to enrich discovery results, and
// exposed directly per the API contract for any client that wants raw scores.
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
    return NextResponse.json({ error: "target_profile_ids is required" }, { status: 400 });
  }

  const current = toMatchProfile(session.id);
  const targets = parsed.data.target_profile_ids.map((id) => toMatchProfile(id));
  const ranked = rankCompatibility(current, targets);

  return NextResponse.json({
    scores: ranked.map((r) => ({ profile_id: r.profileId, score: r.score, rationale: r.rationale })),
  });
}
