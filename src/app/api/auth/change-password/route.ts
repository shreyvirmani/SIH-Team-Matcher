import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { withApiError } from "@/lib/api-helpers";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export async function POST(req: NextRequest) {
  return withApiError(async () => {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid password" }, { status: 400 });
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, message: "Password updated successfully" });
  });
}
