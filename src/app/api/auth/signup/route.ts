import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const supabase = createServerSupabase();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    // Supabase returns a generic message for existing accounts to avoid
    // leaking which emails are registered; surface it as-is.
    return NextResponse.json({ error: error.message }, { status: error.status || 400 });
  }
  if (!data.user) {
    return NextResponse.json({ error: "Signup failed — please try again" }, { status: 500 });
  }

  return NextResponse.json(
    {
      user_id: data.user.id,
      email: data.user.email,
      // If email confirmation is enabled on the Supabase project, there is
      // no active session yet — the frontend should tell the user to check
      // their inbox rather than redirect straight to onboarding.
      email_confirmation_required: !data.session,
    },
    { status: 201 }
  );
}
