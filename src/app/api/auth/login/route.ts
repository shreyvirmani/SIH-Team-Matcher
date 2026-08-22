import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const supabase = createServerSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();

  return NextResponse.json({
    access_token: data.session.access_token,
    user: { id: data.user.id, email: data.user.email, hasProfile: !!profile },
  });
}
