"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "./api-client";

export interface SessionUser {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface SessionData {
  user: SessionUser | null;
  profile: any | null;
}

interface SessionContextType {
  user: SessionUser | null;
  profile: any | null;
  loading: boolean;
  refresh: () => Promise<SessionData>;
  setProfileState: (profile: any) => void;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  profile: null,
  loading: true,
  refresh: async () => ({ user: null, profile: null }),
  setProfileState: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SessionData>({ user: null, profile: null });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/me");
      setData({
        user: res.user || null,
        profile: res.profile || null,
      });
      return res;
    } catch {
      setData({ user: null, profile: null });
      return { user: null, profile: null };
    } finally {
      setLoading(false);
    }
  }, []);

  const setProfileState = useCallback((profile: any) => {
    setData((prev) => ({ ...prev, profile }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider
      value={{
        user: data.user,
        profile: data.profile,
        loading,
        refresh,
        setProfileState,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
