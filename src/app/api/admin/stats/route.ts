import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { withApiError } from "@/lib/api-helpers";

export async function GET() {
  return withApiError(async () => {
    await requireAdmin();
    const admin = createAdminSupabase();

    const [
      { count: totalProfiles },
      { count: totalTeams },
      { count: totalRequests },
      { count: pendingRequests },
      { count: acceptedRequests },
      { count: activeProblemStatements },
      { data: recentUsers },
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("teams").select("*", { count: "exact", head: true }),
      admin.from("team_requests").select("*", { count: "exact", head: true }),
      admin.from("team_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("team_requests").select("*", { count: "exact", head: true }).eq("status", "accepted"),
      admin.from("problem_statements").select("*", { count: "exact", head: true }).eq("is_active", true),
      admin
        .from("profiles")
        .select("id, full_name, college, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return NextResponse.json({
      totalUsers: totalProfiles || 0,
      totalProfiles: totalProfiles || 0,
      totalTeams: totalTeams || 0,
      totalRequests: totalRequests || 0,
      pendingRequests: pendingRequests || 0,
      acceptedRequests: acceptedRequests || 0,
      activeProblemStatements: activeProblemStatements || 0,
      recentUsers: (recentUsers || []).map((u: any) => ({
        id: u.id,
        fullName: u.full_name,
        college: u.college,
        createdAt: u.created_at,
      })),
    });
  });
}
