import { createClient } from "@supabase/supabase-js";

// Service-role client. NEVER import this into any file that could run in the
// browser — it bypasses Row Level Security entirely. Used only for:
//  - the seed script (src/db/seed.ts)
//  - admin API routes that need to manage lookup tables (skills/roles/
//    problem_statements) which have restrictive write policies for normal
//    authenticated users.
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are not set. " +
        "Admin operations require the service role key from Supabase Project Settings → API."
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
