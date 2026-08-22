import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyPassword, issueToken, setSessionCookie } from "@/lib/auth";

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
  const db = getDb();

  const user = db.prepare("SELECT id, email, password_hash as passwordHash FROM users WHERE email = ?").get(email) as
    | { id: string; email: string; passwordHash: string }
    | undefined;

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = issueToken(user.id, user.email);
  setSessionCookie(token);

  const profile = db.prepare("SELECT id FROM profiles WHERE id = ?").get(user.id);

  return NextResponse.json({
    access_token: token,
    user: { id: user.id, email: user.email, hasProfile: !!profile },
  });
}
