import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// -----------------------------------------------------------------------
// Rate limiting
// -----------------------------------------------------------------------
// In-memory sliding-window limiter. This is fine for a single Vercel
// serverless instance under light load, but each cold instance has its own
// counters — it will NOT correctly rate-limit across many concurrent
// instances or after redeploys. For real production traffic, replace this
// with Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`), which is a
// drop-in swap: keep the same `checkRateLimit` call signature and API
// routes stay untouched.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const buckets = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= MAX_REQUESTS_PER_WINDOW;
}

// Periodically drop stale buckets so this doesn't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.windowStart > WINDOW_MS * 5) buckets.delete(key);
    }
  }, WINDOW_MS * 5).unref?.();
}

export async function middleware(request: NextRequest) {
  // --- Rate limit API routes only ---
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const key = `${ip}:${request.nextUrl.pathname}`;
    if (!checkRateLimit(key)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        { status: 429 }
      );
    }
  }

  // --- Refresh the Supabase session cookie on every request ---
  // (required by @supabase/ssr so server components/API routes always see
  // a fresh, valid session instead of an expired access token)
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
