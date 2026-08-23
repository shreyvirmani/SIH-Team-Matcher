"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface Lookups {
  skills: { id: number; name: string }[];
  roles: { id: number; name: string }[];
  problemStatements: { id: number; title: string; description?: string; category?: string }[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading: sessionLoading, refresh, setProfileState } = useSession();
  const [lookups, setLookups] = useState<Lookups>({
    skills: DEFAULT_SKILLS.map((name, id) => ({ id: id + 1, name })),
    roles: DEFAULT_ROLES.map((name, id) => ({ id: id + 1, name })),
    problemStatements: SIH_PROBLEM_STATEMENTS.map((ps) => ({
      id: ps.id || 0,
      title: ps.title,
      description: ps.description,
      category: ps.category,
    })),
  });

  const [form, setForm] = useState({
    fullName: "",
    college: "",
    branch: "",
    year: 2,
    experience: "Intermediate" as "Beginner" | "Intermediate" | "Advanced",
    availability: "Flexible" as "Full-time" | "Part-time" | "Flexible",
    bio: "",
    githubUsername: "",
    phoneNumber: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [problemStatementIds, setProblemStatementIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!sessionLoading && profile) {
      router.replace("/discover");
    }
  }, [profile, sessionLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) return setError("Full name is required");
    if (!form.college.trim()) return setError("College is required");
    if (!form.branch.trim()) return setError("Branch is required");
    if (skills.length === 0) return setError("Select or add at least one skill");
    if (roles.length === 0) return setError("Select at least one role");

    setLoading(true);
    try {
      const created = await apiFetch("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          avatarUrl: avatarUrl || undefined,
          githubUsername: form.githubUsername || undefined,
          phoneNumber: form.phoneNumber || undefined,
          skills,
          roles,
          problemStatementIds,
        }),
      });
      setProfileState(created);
      await refresh();
      router.replace("/discover");
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="text-slate-400">Loading your profile setup…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-16 pt-4">
      <h1 className="text-2xl font-bold text-white">Build your SIH Profile</h1>
      <p className="mt-1 text-sm text-slate-400">
        This is what teammates will see when they discover you. Add your skills, contact info, and preferred SIH 2026 problem statements to get high-accuracy compatibility scores.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AvatarUpload userId={user?.id || ""} currentUrl={avatarUrl} onUploaded={setAvatarUrl} />

          <Input
            label="Full name"
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

          {/* Contact / Phone with Privacy Notice */}
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
                <strong>Private:</strong> Your number is never shown publicly. It is shared only with confirmed teammates when a team request is accepted.
              </span>
            </div>
          </div>

          <Textarea
            label="Short bio & hackathon goals"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="What are you excited to build for SIH 2026? Mention any previous hackathon experience, strengths, or tech stack…"
          />
          <Input
            label="GitHub username (optional)"
            value={form.githubUsername}
            onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
            placeholder="e.g. octocat"
          />

          <MultiSelect
            label="Skills (Select or type custom skills and press Enter)"
            options={lookups.skills.map((s) => s.name)}
            selected={skills}
            onChange={setSkills}
            allowCustom={true}
            placeholder="Search skills or type custom skill and press Enter…"
          />

          <MultiSelect
            label="Preferred Team Roles"
            options={lookups.roles.map((r) => r.name)}
            selected={roles}
            onChange={setRoles}
            allowCustom={true}
            placeholder="Search or add roles…"
          />

          <ProblemStatementSelector
            problemStatements={lookups.problemStatements}
            selectedIds={problemStatementIds}
            onChange={setProblemStatementIds}
          />

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full">
            Save profile & start discovering
          </Button>
        </form>
      </Card>
    </div>
  );
}
