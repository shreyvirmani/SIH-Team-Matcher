"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import SIHLogo from "@/components/common/SIHLogo";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { useSession } from "@/lib/use-session";
import { apiFetch } from "@/lib/api-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: sessionLoading, refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!sessionLoading && user) {
      router.replace(profile ? "/discover" : "/onboarding");
    }
  }, [user, profile, sessionLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      router.replace(res.user.hasProfile ? "/discover" : "/onboarding");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <div className="flex justify-center mb-6">
        <Link href="/">
          <SIHLogo size="md" showText={true} />
        </Link>
      </div>

      <Card className="p-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Log in to keep building your dream SIH team.</p>

        {/* Google One-Click Sign In */}
        <div className="mt-6">
          <GoogleAuthButton mode="signin" onError={setError} />
        </div>

        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="bg-slate-900 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Log in
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
