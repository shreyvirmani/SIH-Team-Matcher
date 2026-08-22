import { NextResponse } from "next/server";
import { AuthError } from "./auth";

/** Wraps an API route handler so AuthError (and unexpected errors) produce
 * consistent JSON responses instead of every route repeating a try/catch. */
export async function withApiError<T>(fn: () => Promise<T>): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
