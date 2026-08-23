import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// -----------------------------------------------------------------------
// Rate limiting
// -----------------------------------------------------------------------
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedPrefixes = [
    "/discover",
    "/my-team",
    "/my-requests",
    "/saved",
    "/notifications",
    "/settings",
    "/my-profile",
    "/onboarding",
    "/admin",
  ];

  // 1. If user is NOT authenticated and attempts to access protected routes -> redirect to /login
  if (!user && protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. If user IS authenticated
  if (user) {
    // Check if user has completed profile setup
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      // User is logged in but has NOT created a profile yet:
      // If navigating to /login, /signup, or protected pages other than /onboarding, redirect to /onboarding
      if (
        pathname === "/login" ||
        pathname === "/signup" ||
        (protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/")) && pathname !== "/onboarding")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    } else {
      // User is logged in and HAS a profile:
      // If navigating to /login, /signup, or /onboarding, redirect to /discover
      if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
        const url = request.nextUrl.clone();
        url.pathname = "/discover";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
