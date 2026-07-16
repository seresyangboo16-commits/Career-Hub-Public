"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <p className="text-slate-400">Checking your login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-5xl">
        <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-10 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">
                Dashboard
              </p>
              <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
                Welcome back, {user.name || user.email}.
              </h1>
              <p className="mt-4 max-w-2xl text-slate-400 leading-relaxed">
                This is your CareerHub home. From here, you can explore open roles, review your applications, and manage your account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              className="inline-flex items-center justify-center rounded-3xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Sign out
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              href="/jobs"
              className="rounded-3xl border border-slate-700/60 bg-slate-950/60 p-8 transition hover:border-sky-500/60"
            >
              <h2 className="text-2xl font-semibold text-white">Browse jobs</h2>
              <p className="mt-3 text-slate-400">
                Find new opportunities and apply for roles that match your skills.
              </p>
            </Link>

            <Link
              href="/auth/register"
              className="rounded-3xl border border-slate-700/60 bg-slate-950/60 p-8 transition hover:border-sky-500/60"
            >
              <h2 className="text-2xl font-semibold text-white">Your profile</h2>
              <p className="mt-3 text-slate-400">
                Manage your account details and keep your profile up to date.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
