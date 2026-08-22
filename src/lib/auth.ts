import { createServerSupabase } from "./supabase/server";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export interface SessionUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Resolves the current Supabase-authenticated user for a server-side call
 * (API route or server component), plus their `is_admin` flag from
 * `profiles`. Every API route should call this (or requireUser) instead of
 * touching supabase.auth directly, so the isAdmin lookup stays in one place.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    isAdmin: !!profile?.is_admin,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) throw new AuthError("Not authenticated", 401);
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (!session.isAdmin) throw new AuthError("Admin access required", 403);
  return session;
}
