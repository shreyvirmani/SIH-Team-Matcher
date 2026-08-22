"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-client";

export interface SessionData {
  user: { id: string; email: string; isAdmin: boolean } | null;
  profile: any | null;
}

export function useSession() {
  const [data, setData] = useState<SessionData>({ user: null, profile: null });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/me");
      setData(res);
    } catch {
      setData({ user: null, profile: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { ...data, loading, refresh };
}
