import { createBrowserClient } from "@supabase/ssr";

// Used inside "use client" components. Reads the public URL/anon key that
// are safe to ship to the browser — RLS policies (schema.postgres.sql) are
// what actually keep data safe, not the secrecy of this key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
