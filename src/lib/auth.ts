import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getDb } from "./db";

// This module implements the same *contract* Supabase Auth would provide
// (signUp / signIn / verify session / issue JWT) so that swapping in real
// Supabase Auth later only requires changing this file, not call sites.

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production-please";
const COOKIE_NAME = "sih_session";
const SESSION_DAYS = 7;

export interface SessionUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function issueToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getSessionFromRequest(): SessionUser | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
    const db = getDb();
    const row = db
      .prepare("SELECT p.is_admin as isAdmin FROM profiles p WHERE p.id = ?")
      .get(payload.sub) as { isAdmin: number } | undefined;
    return {
      id: payload.sub,
      email: payload.email,
      isAdmin: !!row?.isAdmin,
    };
  } catch {
    return null;
  }
}

export function requireSession(): SessionUser {
  const session = getSessionFromRequest();
  if (!session) {
    throw new AuthError("Not authenticated", 401);
  }
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}
