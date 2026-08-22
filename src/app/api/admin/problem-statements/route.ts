import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";

// Writes here use the service-role client: problem_statements has no
// authenticated-write RLS policy (see schema.postgres.sql), by design —
// only trusted admin routes (gated by requireAdmin()) may manage it.

export async function GET() {
  return withApiError(async () => {
    await requireAdmin();
    const admin = createAdminSupabase();
    const { data } = await admin.from("problem_statements").select("*").order("id");
    return NextResponse.json({ problemStatements: data || [] });
  });
}

const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional().default(""),
  category: z.string().max(120).optional().default(""),
});

export async function POST(req: NextRequest) {
  return withApiError(async () => {
    await requireAdmin();
    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const admin = createAdminSupabase();
    const { data, error } = await admin.from("problem_statements").insert(parsed.data).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  });
}

const patchSchema = z.object({ id: z.number(), is_active: z.boolean() });

export async function PATCH(req: NextRequest) {
  return withApiError(async () => {
    await requireAdmin();
    const json = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const admin = createAdminSupabase();
    const { data, error } = await admin
      .from("problem_statements")
      .update({ is_active: parsed.data.is_active })
      .eq("id", parsed.data.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  });
}
