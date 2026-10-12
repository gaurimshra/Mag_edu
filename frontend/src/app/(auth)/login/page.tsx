"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, demoLogin, getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, ArrowRight, Sparkles, UserCheck, School } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"student" | "teacher" | null>(null);
  const [error, setError] = useState("");

  async function handleDemoLogin(role: "student" | "teacher") {
    setError("");
    setDemoLoading(role);

    try {
      const tokenResponse = await demoLogin(role);
      localStorage.setItem("magedu_token", tokenResponse.access_token);
      localStorage.setItem("magedu_diagnostic_done", "true");
      localStorage.setItem("magedu_onboarding_done", "true");
      const user = await getMe();
      setAuth(tokenResponse.access_token, user);

      if (role === "student") {
        router.push("/student/dashboard");
      } else {
        router.push("/teacher/dashboard");
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || `Failed to log in as demo ${role}.`);
    } finally {
      setDemoLoading(null);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokenResponse = await login({ email, password });
      localStorage.setItem("magedu_token", tokenResponse.access_token);
      // Context will update localStorage and state simultaneously
      const user = await getMe();
      setAuth(tokenResponse.access_token, user);

      if (user.role === "student") {
        const diagnosticDone = localStorage.getItem("magedu_diagnostic_done");
        if (!diagnosticDone) {
          router.push("/student/onboarding/diagnostic");
        } else {
          router.push("/student/dashboard");
        }
      } else if (user.role === "teacher") {
        const onboardingDone = localStorage.getItem("magedu_onboarding_done");
        if (!onboardingDone) {
          router.push("/teacher/onboarding");
        } else {
          router.push("/teacher/dashboard");
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* ── Left Panel: Hero Graphic ── */}
      <div className="hidden md:flex w-1/2 bg-[var(--primary)] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[var(--secondary)] rounded-tl-[120px] translate-x-32 translate-y-32 opacity-20" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] shadow-lg">
              <GraduationCap size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[var(--primary-foreground)] font-bold text-xl tracking-wider uppercase">MagEdu</span>
          </div>
        </div>

        <div className="relative z-10 pb-20">
          <h1 className="text-[var(--primary-foreground)] text-6xl font-bold leading-tight tracking-tight animate-fade-in uppercase">
            Learn <br />
            <span className="text-[var(--accent)]">Naturally.</span>
          </h1>
          <p className="mt-6 text-[var(--primary-foreground)] opacity-90 text-lg max-w-sm font-medium leading-relaxed">
            The fascinating and amazing world of adaptive education, requiring very little maintenance.
          </p>
        </div>

        <p className="text-[var(--primary-foreground)] opacity-60 text-xs font-semibold tracking-widest uppercase relative z-10">
          MagEdu © 2026
        </p>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-md animate-slide-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 md:hidden">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] shadow-lg">
              <GraduationCap size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[var(--foreground)] font-bold text-xl tracking-wider uppercase">MagEdu</span>
          </div>

          <div className="bg-[var(--surface)] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--border)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--accent)]" />
            
            <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Welcome back</h2>
            <p className="text-sm text-[var(--foreground)] opacity-70 mt-2 font-medium">Continue your learning journey.</p>

            {/* ── 1-Click Instant Demo Launchers ── */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-[var(--surface-variant,#f8fafc)] to-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-80 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Instant 1-Click Demo
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  Ready to Test
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="btn-demo-student"
                  disabled={demoLoading !== null || loading}
                  onClick={() => handleDemoLogin("student")}
                  className="group flex flex-col items-start p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md transition-all text-left disabled:opacity-60"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <UserCheck size={14} />
                    </div>
                    <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                      Student Demo
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--foreground)] opacity-60">
                    {demoLoading === "student" ? "Launching..." : "Aarav Sharma · 10A"}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-demo-teacher"
                  disabled={demoLoading !== null || loading}
                  onClick={() => handleDemoLogin("teacher")}
                  className="group flex flex-col items-start p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--secondary)] hover:shadow-md transition-all text-left disabled:opacity-60"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <School size={14} />
                    </div>
                    <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--secondary)]">
                      Teacher Demo
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--foreground)] opacity-60">
                    {demoLoading === "teacher" ? "Launching..." : "Mrs. Sharma · Science"}
                  </span>
                </button>
              </div>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-[var(--surface)] px-3 text-[var(--foreground)] opacity-50 font-semibold">
                  Or login with credentials
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 px-5 py-4 rounded-[16px] bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-20 text-sm text-[var(--error)] font-medium flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)] mt-1.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs font-bold tracking-wider uppercase text-[var(--foreground)] opacity-70 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className="w-full px-5 py-4 text-sm rounded-full border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-opacity-50 focus:outline-none focus:border-[var(--accent)] transition-colors font-medium"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold tracking-wider uppercase text-[var(--foreground)] opacity-70 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 text-sm rounded-full border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-opacity-50 focus:outline-none focus:border-[var(--accent)] transition-colors font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full py-4 text-sm font-bold uppercase tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-[var(--primary)]/20"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Login <ArrowRight size={18} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button type="button" className="text-sm font-medium text-[var(--foreground)] opacity-60 hover:opacity-100 hover:text-[var(--accent)] transition-colors">
                Forgot your password?
              </button>
            </div>
          </div>

          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            <span className="text-sm text-[var(--foreground)] opacity-70">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-sm font-bold text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
