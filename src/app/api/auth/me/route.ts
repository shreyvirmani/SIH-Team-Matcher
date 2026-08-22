import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getFullProfile } from "@/lib/profiles";

export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ user: null, profile: null });

  const profile = await getFullProfile(supabase, user.id);
  return NextResponse.json({
    user: { id: user.id, email: user.email, isAdmin: !!profile?.isAdmin },
    profile,
  });
}
