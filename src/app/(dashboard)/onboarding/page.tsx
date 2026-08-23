"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import MultiSelect from "@/components/ui/multiselect";
import Card from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
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
  const { user, profile, loading: sessionLoading, refresh } = useSession();
  const [lookups, setLookups] = useState<Lookups>({
    skills: DEFAULT_SKILLS.map((s, idx) => ({ id: idx + 1, name: s })),
    roles: DEFAULT_ROLES.map((r, idx) => ({ id: idx + 1, name: r })),
    problemStatements: SIH_PROBLEM_STATEMENTS.map((ps, idx) => ({ id: idx + 1, title: ps.title, description: ps.description, category: ps.category })),
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [problemStatementIds, setProblemStatementIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!sessionLoading && profile) {
      router.replace("/discover");
    }
  }, [sessionLoading, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter your Full Name.");
      return;
    }
    if (!form.college.trim()) {
      setError("Please enter your College / University.");
      return;
    }
    if (!form.mobileNumber.trim()) {
      setError("Please enter your Mobile / WhatsApp Number.");
      return;
    }
    if (skills.length === 0) {
      setError("Please select or add at least one Skill / Technology.");
      return;
    }
    if (roles.length === 0) {
      setError("Please select or add at least one Preferred Team Role.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/profiles", {
        method: "POST",
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
          skills,
          roles,
          problemStatementIds,
        }),
      });
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
    <div className="mx-auto max-w-2xl pb-16 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <BackButton href="/" label="Back to Home" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Build your SIH 2026 Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          This is what teammates will see when discovering you. Fields marked with an asterisk (<span className="text-amber-400 font-bold">*</span>) are mandatory.
        </p>
      </div>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex justify-center pb-2">
            <AvatarUpload userId={user?.id || ""} currentUrl={avatarUrl} onUploaded={setAvatarUrl} />
          </div>

          <Input
            label="Full Name *"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="e.g. Alex Morgan"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="College / University *"
              required
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              placeholder="e.g. IIT Delhi / DTU / VIT"
            />
            <Input
              label="Mobile / WhatsApp Number *"
              type="tel"
              required
              value={form.mobileNumber}
              onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              placeholder="e.g. +91 9876543210"
              helperText="🔒 Strictly private. Only shared with teammates after you accept their squad request."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Branch (Optional)"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="GitHub Profile / URL (Optional)"
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              placeholder="https://github.com/username or username"
              helperText="Optional: Unlocks automatic public repository count badge"
            />
            <Input
              label="LinkedIn URL (Optional)"
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              helperText="Optional: Let teammates connect professionally"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Experience Level *"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              options={[
                { value: "Beginner", label: "Beginner (First Hackathon)" },
                { value: "Intermediate", label: "Intermediate (Built Projects)" },
                { value: "Advanced", label: "Advanced (Hackathon Winner / Pro)" },
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

          <Textarea
            label="Bio / Introduction (Optional)"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell potential teammates what you're passionate about, your past hackathon experience, or what you love building..."
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Skills & Technologies *
            </label>
            <MultiSelect
              options={lookups.skills.map((s) => s.name)}
              selected={skills}
              onChange={setSkills}
              allowCustom={true}
              placeholder="Search or type custom skill and press Enter…"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Preferred Team Roles *
            </label>
            <MultiSelect
              options={lookups.roles.map((r) => r.name)}
              selected={roles}
              onChange={setRoles}
              allowCustom={true}
              placeholder="Select Frontend, Backend, AI/ML, UI/UX, etc.…"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target SIH 2026 Problem Statements (Optional)
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Select any of the 226 official SIH problem statements you are interested in solving.
            </p>
            <ProblemStatementSelector
              problemStatements={lookups.problemStatements}
              selectedIds={problemStatementIds}
              onChange={setProblemStatementIds}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Save Profile & Start Discovering
          </Button>
        </form>
      </Card>
    </div>
  );
}
