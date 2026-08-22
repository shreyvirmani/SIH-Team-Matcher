"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.email_confirmation_required) {
        setConfirmationRequired(true);
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (confirmationRequired) {
    return (
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Check your inbox</h1>
          <p className="mt-3 text-sm text-slate-400">
            We sent a confirmation link to <strong className="text-slate-200">{email}</strong>. Click it, then come
            back and log in to finish building your profile.
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button variant="outline">Go to login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">Join hundreds of students finding their SIH team.</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <Input
            label="Confirm password"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-300 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
