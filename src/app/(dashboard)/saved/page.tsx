"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Avatar from "@/components/profile/Avatar";
import { apiFetch } from "@/lib/api-client";

export default function SavedProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/api/saved-profiles");
    setProfiles(res.profiles);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    await apiFetch(`/api/saved-profiles/${id}`, { method: "DELETE" });
    await load();
  };

  if (loading) return <p className="text-slate-400">Loading saved profiles…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Saved profiles</h1>
      <p className="mt-1 text-sm text-slate-400">Teammates you bookmarked for later follow-up.</p>

      {profiles.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          You haven&apos;t saved anyone yet — hit ☆ Save on a profile in Discover.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <Avatar url={p.avatarUrl} name={p.fullName} size={40} />
                <div>
                  <Link href={`/profile/${p.id}`} className="font-semibold text-white hover:text-indigo-300">
                    {p.fullName}
                  </Link>
                  <p className="text-xs text-slate-500">{p.college}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.skills.slice(0, 4).map((s: string) => (
                  <Badge key={s} color="indigo">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="mt-1 flex gap-2">
                <Link href={`/profile/${p.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => remove(p.id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
