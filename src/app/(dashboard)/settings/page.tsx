"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/profile/Avatar";
import { useSession } from "@/lib/use-session";
import { apiFetch } from "@/lib/api-client";

export default function SettingsPage() {
  const { user, profile, refresh } = useSession();
  const router = useRouter();

  // Change Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logout state
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ password: newPassword }),
      });
      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      await refresh();
      router.push("/login");
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) {
    return <div className="text-center text-slate-400 py-12">Loading settings…</div>;
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";
  const lastSignIn = user.lastSignInAt
    ? new Date(user.lastSignInAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Active now";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-sm text-slate-400">
          Manage your account credentials, security settings, and platform preferences.
        </p>
      </div>

      {/* Account Profile Overview */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Avatar url={profile?.avatarUrl} name={profile?.fullName || user.email} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {profile?.fullName || user.email.split("@")[0]}
                </h2>
                <Badge color={user.isAdmin ? "indigo" : "green"}>
                  {user.isAdmin ? "Platform Admin" : "SIH Participant"}
                </Badge>
              </div>
              <p className="text-sm text-slate-400">{user.email}</p>
              {profile?.college && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {profile.college} • {profile.branch} (Year {profile.year})
                </p>
              )}
            </div>
          </div>
          <Link href="/my-profile">
            <Button variant="outline" className="text-xs">
              ✏ Edit Public Profile
            </Button>
          </Link>
        </div>

        {/* User Account Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 text-sm">
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">User Identifier (UUID)</span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs text-slate-300 font-mono truncate">{user.id}</code>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap font-medium"
              >
                {copiedId ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">Registered Email</span>
            <span className="text-slate-200 font-medium text-xs sm:text-sm">{user.email}</span>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">Member Since</span>
            <span className="text-slate-200 text-xs sm:text-sm">{memberSince}</span>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">Last Active Session</span>
            <span className="text-slate-200 text-xs sm:text-sm">{lastSignIn}</span>
          </div>
        </div>
      </Card>

      {/* Security & Password */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-white mb-1">Security & Password</h2>
        <p className="text-xs text-slate-400 mb-5">
          Update your login password. We recommend choosing a strong, unique password.
        </p>

        {passwordMsg && (
          <div
            className={`rounded-xl border p-3.5 mb-5 text-sm font-medium ${
              passwordMsg.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="New password"
            type="password"
            required
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" loading={passwordLoading} disabled={!newPassword}>
            Update Password
          </Button>
        </form>
      </Card>

      {/* Quick Navigation & Preferences */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Platform Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/my-profile"
            className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-indigo-500/40 hover:bg-white/5 transition-all"
          >
            <span className="text-sm font-semibold text-white">👤 My Profile</span>
            <span className="text-xs text-slate-400">Edit skills, bio, & problem statements</span>
          </Link>
          <Link
            href="/my-team"
            className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-indigo-500/40 hover:bg-white/5 transition-all"
          >
            <span className="text-sm font-semibold text-white">👥 My Team</span>
            <span className="text-xs text-slate-400">View team members & realtime chat</span>
          </Link>
          <Link
            href="/notifications"
            className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-indigo-500/40 hover:bg-white/5 transition-all"
          >
            <span className="text-sm font-semibold text-white">🔔 Notifications</span>
            <span className="text-xs text-slate-400">Manage invitations & team alerts</span>
          </Link>
        </div>
      </Card>

      {/* Session Management & Logout */}
      <Card className="p-6 border-red-500/20 bg-red-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Session Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Signing out will end your authenticated session on this browser.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} loading={loggingOut} className="border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-white">
            🚪 Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
