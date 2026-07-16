"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      login(data.data.token, data.data.user);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-2">
            Sign in to continue your CareerHub journey
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New here?{" "}
            <Link href="/auth/register" className="text-sky-400 hover:text-sky-300 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
