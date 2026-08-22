import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getFullProfile } from "@/lib/profiles";

export async function GET() {
  const session = getSessionFromRequest();
  if (!session) return NextResponse.json({ user: null, profile: null });

  const profile = getFullProfile(session.id);
  return NextResponse.json({ user: session, profile });
}
