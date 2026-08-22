"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import MultiSelect from "@/components/ui/multiselect";
import Card from "@/components/ui/card";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

export default function MyProfilePage() {
  const { user, profile, refresh } = useSession();
  const [lookups, setLookups] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/lookups").then(setLookups).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName,
        college: profile.college,
        branch: profile.branch,
        year: profile.year,
        experience: profile.experience,
        availability: profile.availability,
        bio: profile.bio,
        githubUsername: profile.githubUsername || "",
        isLookingForTeam: profile.isLookingForTeam,
      });
      setAvatarUrl(profile.avatarUrl || "");
      setSkills(profile.skills || []);
      setRoles(profile.roles || []);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage("");
    try {
      await apiFetch(`/api/profiles/${profile.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, avatarUrl: avatarUrl || undefined, skills, roles }),
      });
      await refresh();
      setMessage("Profile updated!");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !profile || !form || !lookups) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">My profile</h1>
      <Card className="mt-6 p-6">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <AvatarUpload userId={user.id} currentUrl={avatarUrl} onUploaded={setAvatarUrl} />

          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
            <Input label="Branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </Select>
            <Select
              label="Experience"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </Select>
            <Select
              label="Availability"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Flexible</option>
            </Select>
          </div>
          <Textarea label="Bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Input
            label="GitHub username (optional)"
            value={form.githubUsername}
            onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
            placeholder="e.g. octocat"
          />
          <MultiSelect label="Skills" options={lookups.skills.map((s: any) => s.name)} selected={skills} onChange={setSkills} />
          <MultiSelect label="Roles" options={lookups.roles.map((r: any) => r.name)} selected={roles} onChange={setRoles} />

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.isLookingForTeam}
              onChange={(e) => setForm({ ...form, isLookingForTeam: e.target.checked })}
            />
            I&apos;m actively looking for a team (visible in Discover)
          </label>

          {message && <p className="text-sm text-indigo-300">{message}</p>}
          <Button type="submit" loading={saving} className="w-full">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
