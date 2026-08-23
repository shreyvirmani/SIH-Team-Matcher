"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import MultiSelect from "@/components/ui/multiselect";
import Card from "@/components/ui/card";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ProblemStatementSelector from "@/components/profile/ProblemStatementSelector";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";
import { DEFAULT_SKILLS, DEFAULT_ROLES, SIH_PROBLEM_STATEMENTS } from "@/lib/sih-data";

export default function MyProfilePage() {
  const { user, profile, loading: sessionLoading, refresh, setProfileState } = useSession();
  const [lookups, setLookups] = useState<any>({
    skills: DEFAULT_SKILLS.map((name, id) => ({ id: id + 1, name })),
    roles: DEFAULT_ROLES.map((name, id) => ({ id: id + 1, name })),
    problemStatements: SIH_PROBLEM_STATEMENTS.map((ps) => ({
      id: ps.id || 0,
      title: ps.title,
      description: ps.description,
      category: ps.category,
    })),
  });

  const [form, setForm] = useState<any>({
    fullName: "",
    college: "",
    branch: "",
    year: 2,
    experience: "Intermediate",
    availability: "Flexible",
    bio: "",
    githubUsername: "",
    phoneNumber: "",
    isLookingForTeam: true,
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [problemStatementIds, setProblemStatementIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    apiFetch("/api/lookups")
      .then((data) => {
        if (data && data.skills && data.roles && data.problemStatements) {
          setLookups(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        college: profile.college || "",
        branch: profile.branch || "",
        year: profile.year || 1,
        experience: profile.experience || "Intermediate",
        availability: profile.availability || "Flexible",
        bio: profile.bio || "",
        githubUsername: profile.githubUsername || "",
        phoneNumber: profile.phoneNumber || "",
        isLookingForTeam: profile.isLookingForTeam ?? true,
      });
      setAvatarUrl(profile.avatarUrl || "");
      setSkills(profile.skills || []);
      setRoles(profile.roles || []);
      setProblemStatementIds((profile.problemStatements || []).map((p: any) => p.id));
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setStatusMessage(null);

    if (!form.fullName.trim()) {
      setStatusMessage({ type: "error", text: "Full name is required." });
      return;
    }
    if (skills.length === 0) {
      setStatusMessage({ type: "error", text: "Please select or add at least one skill." });
      return;
    }
    if (roles.length === 0) {
      setStatusMessage({ type: "error", text: "Please select at least one preferred role." });
      return;
    }

    setSaving(true);
    try {
      const updated = await apiFetch(`/api/profiles/${profile.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          avatarUrl: avatarUrl || undefined,
          githubUsername: form.githubUsername || null,
          phoneNumber: form.phoneNumber || null,
          skills,
          roles,
          problemStatementIds,
        }),
      });
      setProfileState(updated);
      await refresh();
      setStatusMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <p className="text-slate-400">Loading your profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <Card className="p-8">
          <h2 className="text-xl font-bold text-white">No Profile Found</h2>
          <p className="mt-2 text-sm text-slate-400">
            You have not set up your SIH hacker profile yet. Complete onboarding to start discovering teammates.
          </p>
          <Link href="/onboarding" className="mt-6 inline-block">
            <Button>Complete Profile Setup</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 pt-4">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Keep your skills, availability, and selected SIH 2026 problem statements up to date.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/profile/${profile.id}`}>
            <Button variant="outline" className="text-xs">
              View Public Profile
            </Button>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <AvatarUpload
              userId={user?.id || ""}
              currentUrl={avatarUrl}
              onUploaded={setAvatarUrl}
            />
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-white">Profile Photo</h3>
              <p className="text-xs text-slate-400">
                Upload a clear avatar image to stand out to team leaders and recruiters.
              </p>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
              Basic Details
            </h3>

            <Input
              label="Full Name"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. Alex Morgan"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="College / University"
                required
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="e.g. IIT Bombay / BITS Pilani"
              />
              <Input
                label="Branch / Major"
                required
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Year of Study"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </Select>
              <Select
                label="Experience Level"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value as any })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </Select>
              <Select
                label="Availability"
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value as any })}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Flexible</option>
              </Select>
            </div>

            {/* Mobile / Phone Number with Privacy Note */}
            <div className="space-y-1.5">
              <Input
                label="Mobile / WhatsApp Number"
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="e.g. +91 98765 43210"
              />
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 border border-white/5 rounded-lg px-3 py-1.5">
                <span>🔒</span>
                <span>
                  <strong>Private:</strong> Your mobile number is hidden from the public and shared only with confirmed teammates when requests are accepted.
                </span>
              </div>
            </div>

            <Textarea
              label="Bio & Hackathon Strengths"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell teammates what you bring to an SIH squad, your past projects, or your coding superpowers…"
            />

            <Input
              label="GitHub Username"
              value={form.githubUsername}
              onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
              placeholder="e.g. octocat"
            />
          </div>

          <hr className="border-white/10" />

          {/* Skills and Roles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
              Skills & Desired Roles
            </h3>

            <MultiSelect
              label="Your Skills (Select existing or type custom skill and press Enter)"
              options={lookups.skills.map((s: any) => s.name)}
              selected={skills}
              onChange={setSkills}
              allowCustom={true}
              placeholder="Search or add custom skills (e.g. Next.js, FastAPI, OpenCV)…"
            />

            <MultiSelect
              label="Preferred Team Roles"
              options={lookups.roles.map((r: any) => r.name)}
              selected={roles}
              onChange={setRoles}
              allowCustom={true}
              placeholder="Search or add roles (e.g. Full Stack Developer, ML Engineer)…"
            />
          </div>

          <hr className="border-white/10" />

          {/* Problem Statement Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
              Target SIH 2026 Problem Statements
            </h3>
            <p className="text-xs text-slate-400">
              Select one or more problem statements you are aiming to solve in SIH 2026. This is used by our matching engine to score candidate compatibility.
            </p>

            <ProblemStatementSelector
              problemStatements={lookups.problemStatements}
              selectedIds={problemStatementIds}
              onChange={setProblemStatementIds}
            />
          </div>

          <hr className="border-white/10" />

          {/* Looking for team toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div>
              <p className="font-semibold text-white">Actively Looking for a Team</p>
              <p className="text-xs text-slate-400">
                When enabled, your card appears in public Discover results for other hackers to invite you.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={form.isLookingForTeam}
                onChange={(e) => setForm({ ...form, isLookingForTeam: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-indigo-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" loading={saving} className="px-8">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
