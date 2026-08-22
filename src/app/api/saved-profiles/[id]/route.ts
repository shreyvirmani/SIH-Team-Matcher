import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return withApiError(async () => {
    const session = await requireUser();
    const supabase = createServerSupabase();
    await supabase.from("saved_profiles").delete().eq("owner_profile_id", session.id).eq("saved_profile_id", params.id);
    return NextResponse.json({ ok: true });
  });
}
