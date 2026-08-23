"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/profile/Avatar";
import BackButton from "@/components/common/BackButton";
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
    } catch (err) {
      console.error("Logout error:", err);
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  const rawLastSignIn = (user as any).lastSignInAt || (user as any).last_sign_in_at;
  const lastSignIn = rawLastSignIn
    ? new Date(rawLastSignIn).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Active now";

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 pt-2">
      <div className="flex items-center justify-between">
        <BackButton href="/discover" label="Back to Discover" />
      </div>

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
                <p className="text-xs text-slate-500 mt-0.5">🏛️ {profile.college}</p>
              )}
            </div>
          </div>
          <Link href="/my-profile">
            <Button variant="outline" className="text-xs">
              Edit Profile Details
            </Button>
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs text-slate-400">
          <div>
            <span className="font-medium text-slate-300">User ID:</span>
            <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">
              <span className="truncate">{user.id}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-indigo-400 hover:text-indigo-300 shrink-0"
              >
                {copiedId ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div>
            <span className="font-medium text-slate-300">Last Active:</span>
            <p className="mt-1 text-slate-300">{lastSignIn}</p>
          </div>
        </div>
      </Card>

      {/* Security: Change Password */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-white">Security & Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Update your password to keep your account secure.
        </p>

        {passwordMsg && (
          <div
            className={`mt-4 rounded-xl border p-3 text-xs font-medium ${
              passwordMsg.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-4 max-w-md">
          <Input
            label="New Password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div>
            <Button type="submit" loading={passwordLoading} className="text-xs">
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Session Management */}
      <Card className="p-6 border-red-500/20">
        <h2 className="text-base font-semibold text-white">Session & Sign Out</h2>
        <p className="mt-1 text-xs text-slate-400">
          Signing out will end your active session on this device.
        </p>
        <div className="mt-4">
          <Button
            variant="danger"
            loading={loggingOut}
            onClick={handleLogout}
            className="text-xs"
          >
            Sign out of SIH Matcher
          </Button>
        </div>
      </Card>
    </div>
  );
}
