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
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

interface Lookups {
  skills: { id: number; name: string }[];
  roles: { id: number; name: string }[];
  problemStatements: { id: number; title: string; category: string }[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refresh } = useSession();
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    college: "",
    branch: "",
    year: 2,
    experience: "Intermediate" as "Beginner" | "Intermediate" | "Advanced",
    availability: "Flexible" as "Full-time" | "Part-time" | "Flexible",
    bio: "",
    githubUsername: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [problemStatementIds, setProblemStatementIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/lookups").then(setLookups).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      router.push("/discover");
    }
  }, [profile, router]);

  const togglePS = (id: number) => {
    setProblemStatementIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (skills.length === 0) return setError("Select at least one skill");
    if (roles.length === 0) return setError("Select at least one role");
    setLoading(true);
    try {
      await apiFetch("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          avatarUrl: avatarUrl || undefined,
          githubUsername: form.githubUsername || undefined,
          skills,
          roles,
          problemStatementIds,
        }),
      });
      await refresh();
      router.push("/discover");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!lookups || !user) return <p className="text-slate-400">Loading form…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Build your profile</h1>
      <p className="mt-1 text-sm text-slate-400">
        This is what teammates will see when they discover you. Be specific about your skills — it powers your
        compatibility score.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AvatarUpload userId={user.id} currentUrl={avatarUrl} onUploaded={setAvatarUrl} />

          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="College"
              required
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
            />
            <Input
              label="Branch"
              required
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Year"
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
              label="Experience"
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
          <Textarea
            label="Short bio"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="What are you looking to build? What's your hackathon experience?"
          />
          <Input
            label="GitHub username (optional)"
            value={form.githubUsername}
            onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
            placeholder="e.g. octocat"
          />
          <MultiSelect
            label="Skills"
            options={lookups.skills.map((s) => s.name)}
            selected={skills}
            onChange={setSkills}
          />
          <MultiSelect label="Roles" options={lookups.roles.map((r) => r.name)} selected={roles} onChange={setRoles} />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-300">SIH Problem Statement(s)</span>
            <div className="flex max-h-52 flex-col gap-2 overflow-y-auto rounded-lg border border-slate-600/60 bg-white/5 p-3">
              {lookups.problemStatements.map((ps) => (
                <label key={ps.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={problemStatementIds.includes(ps.id)}
                    onChange={() => togglePS(ps.id)}
                  />
                  <span>
                    <span className="font-medium text-slate-200">{ps.title}</span>{" "}
                    <span className="text-xs text-slate-500">({ps.category})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Save profile & start discovering
          </Button>
        </form>
      </Card>
    </div>
  );
}
