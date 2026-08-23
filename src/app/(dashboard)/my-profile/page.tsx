"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import MultiSelect from "@/components/ui/multiselect";
import BackButton from "@/components/common/BackButton";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ProblemStatementSelector from "@/components/profile/ProblemStatementSelector";
import { useSession } from "@/lib/use-session";
import { apiFetch } from "@/lib/api-client";
import { DEFAULT_SKILLS, DEFAULT_ROLES, SIH_PROBLEM_STATEMENTS } from "@/lib/sih-data";

export default function MyProfilePage() {
  const { user, profile, loading: sessionLoading, refresh } = useSession();
  const [form, setForm] = useState({
    fullName: "",
    college: "",
    bio: "",
    branch: "",
    graduationYear: "",
    githubUrl: "",
    linkedinUrl: "",
    mobileNumber: "",
    availability: "Full-time",
    experienceLevel: "Intermediate",
    preferredRoles: [] as string[],
    skills: [] as string[],
    problemStatementIds: [] as number[],
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lookups, setLookups] = useState<{
    skills: { id: number; name: string }[];
    roles: { id: number; name: string }[];
    problemStatements: { id: number; title: string; description?: string; category?: string }[];
  }>({
    skills: DEFAULT_SKILLS.map((s, idx) => ({ id: idx + 1, name: s })),
    roles: DEFAULT_ROLES.map((r, idx) => ({ id: idx + 1, name: r })),
    problemStatements: SIH_PROBLEM_STATEMENTS.map((ps, idx) => ({ id: idx + 1, title: ps.title, description: ps.description, category: ps.category })),
  });
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    apiFetch("/api/lookups")
      .then((data) => {
        setLookups({
          skills: data.skills?.length ? data.skills : DEFAULT_SKILLS.map((s, idx) => ({ id: idx + 1, name: s })),
          roles: data.roles?.length ? data.roles : DEFAULT_ROLES.map((r, idx) => ({ id: idx + 1, name: r })),
          problemStatements: data.problemStatements?.length ? data.problemStatements : SIH_PROBLEM_STATEMENTS.map((ps, idx) => ({ id: idx + 1, title: ps.title, description: ps.description, category: ps.category })),
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        college: profile.college || "",
        bio: profile.bio || "",
        branch: profile.branch || "",
        graduationYear: profile.graduationYear ? String(profile.graduationYear) : "",
        githubUrl: profile.githubUsername ? `https://github.com/${profile.githubUsername}` : profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        mobileNumber: profile.phoneNumber || profile.mobileNumber || "",
        availability: profile.availability || "Full-time",
        experienceLevel: profile.experience || profile.experienceLevel || "Intermediate",
        preferredRoles: profile.roles || [],
        skills: profile.skills || [],
        problemStatementIds: profile.problemStatements?.map((ps: any) => ps.id) || [],
      });
      setAvatarUrl(profile.avatarUrl || null);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    if (!form.fullName.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your Full Name." });
      setSaving(false);
      return;
    }
    if (!form.college.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your College / University." });
      setSaving(false);
      return;
    }
    if (!form.mobileNumber.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your Mobile / WhatsApp Number." });
      setSaving(false);
      return;
    }
    if (form.skills.length === 0) {
      setStatusMessage({ type: "error", text: "Please select or add at least one Skill / Technology." });
      setSaving(false);
      return;
    }
    if (form.preferredRoles.length === 0) {
      setStatusMessage({ type: "error", text: "Please select or add at least one Preferred Role." });
      setSaving(false);
      return;
    }

    try {
      await apiFetch("/api/profiles", {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          college: form.college.trim(),
          bio: form.bio.trim(),
          branch: form.branch.trim() || "Engineering",
          graduationYear: form.graduationYear ? parseInt(form.graduationYear, 10) : null,
          githubUrl: form.githubUrl.trim(),
          linkedinUrl: form.linkedinUrl.trim(),
          mobileNumber: form.mobileNumber.trim(),
          availability: form.availability,
          experienceLevel: form.experienceLevel,
          avatarUrl,
          skills: form.skills,
          roles: form.preferredRoles,
          problemStatementIds: form.problemStatementIds,
        }),
      });

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
      <div className="mx-auto max-w-2xl py-12 text-center text-slate-400">
        Loading your profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <Card className="p-8">
          <h2 className="text-xl font-bold text-white">No Profile Found</h2>
          <p className="mt-2 text-sm text-slate-400">
            You have not completed onboarding yet. Please set up your profile to start finding teammates.
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
        <div className="flex items-start sm:items-center gap-3">
          <BackButton href="/discover" label="Back to Discover" />
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="mt-1 text-sm text-slate-400">
              Fields marked with (<span className="text-amber-400 font-bold">*</span>) are mandatory. Keep your skills and SIH 2026 problem statements up to date.
            </p>
          </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info & Avatar */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white">Profile Photo & Identity</h2>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
            <AvatarUpload
              userId={user?.id || ""}
              currentUrl={avatarUrl}
              onUploaded={setAvatarUrl}
            />
            <div className="flex-1 space-y-4">
              <Input
                label="Full Name *"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="e.g. Alex Morgan"
              />
              <Input
                label="College / University *"
                required
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="e.g. IIT Bombay, DTU, VIT"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Branch / Major (Optional)"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              placeholder="e.g. Computer Science, AI, ECE"
            />
            <Input
              label="Graduation Year (Optional)"
              type="number"
              value={form.graduationYear}
              onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
              placeholder="e.g. 2026, 2027"
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Bio & Introduction (Optional)"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Share what hackathons you have won, what you enjoy building, and what kind of team you are looking for..."
            />
          </div>
        </Card>

        {/* Contact & Social Links */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white">Contact & Socials</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Mobile / WhatsApp Number *"
              type="tel"
              required
              value={form.mobileNumber}
              onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              placeholder="e.g. +91 9876543210"
              helperText="🔒 Kept strictly private. Only revealed to confirmed teammates once a squad request is accepted."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="GitHub Profile URL / Username (Optional)"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://github.com/username or username"
                helperText="Optional: Displays verified public repositories count badge"
              />
              <Input
                label="LinkedIn Profile URL (Optional)"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                helperText="Optional: Lets teammates connect with you on LinkedIn"
              />
            </div>
          </div>
        </Card>

        {/* Availability & Skills */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white">Skills & Roles</h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Experience Level *"
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                options={[
                  { value: "Beginner", label: "Beginner (First Hackathon)" },
                  { value: "Intermediate", label: "Intermediate (Built Projects)" },
                  { value: "Advanced", label: "Advanced (Hackathon Winner/Pro)" },
                ]}
              />
              <Select
                label="Availability *"
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                options={[
                  { value: "Full-time", label: "Full-time (Ready to team up actively)" },
                  { value: "Part-time", label: "Part-time (Evenings / Weekends)" },
                  { value: "Flexible", label: "Flexible (Exploring & Open)" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Skills & Tech Stack *
              </label>
              <MultiSelect
                options={lookups.skills.map((s) => s.name)}
                selected={form.skills}
                onChange={(skills) => setForm({ ...form, skills })}
                allowCustom={true}
                placeholder="Search or add skills (e.g. Next.js, FastAPI, OpenCV)..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Preferred Team Roles *
              </label>
              <MultiSelect
                options={lookups.roles.map((r) => r.name)}
                selected={form.preferredRoles}
                onChange={(roles) => setForm({ ...form, preferredRoles: roles })}
                allowCustom={true}
                placeholder="Search or add roles (e.g. Fullstack Developer, ML Engineer)..."
              />
            </div>
          </div>
        </Card>

        {/* SIH 2026 Problem Statements */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white">SIH 2026 Problem Statement Preferences (Optional)</h2>
          <p className="mt-1 text-xs text-slate-400">
            Select any of the 226 official SIH problem statements you are targeting. Match scores prioritize teammates who share your focus.
          </p>
          <div className="mt-4">
            <ProblemStatementSelector
              problemStatements={lookups.problemStatements}
              selectedIds={form.problemStatementIds}
              onChange={(ids) => setForm({ ...form, problemStatementIds: ids })}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/discover">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={saving} className="px-8">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
