"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupStudent, signupTeacher, login, getMe, previewClassroom } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, UserCog, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

type Role = "student" | "teacher" | null;
type ClassroomPreview = {
  name: string;
  grade: string;
  subject: string;
  teacher_name: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [batchCode, setBatchCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Classroom Preview State
  const [previewLoading, setPreviewLoading] = useState(false);
  const [classroomData, setClassroomData] = useState<ClassroomPreview | null>(null);

  async function handleVerifyCode() {
    if (batchCode.length < 5) return;
    setPreviewLoading(true);
    setClassroomData(null);
    setError("");
    try {
      const res = await previewClassroom(batchCode);
      setClassroomData(res);
    } catch {
      setClassroomData(null);
      setError("Invalid classroom code. Please check with your teacher.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "student") {
        await signupStudent({ name, email, password, batch_code: batchCode });
      } else {
        await signupTeacher({ name, email, password });
      }

      // Auto-login
      const tokenResponse = await login({ email, password });
      localStorage.setItem("magedu_token", tokenResponse.access_token);
      const user = await getMe();
      setAuth(tokenResponse.access_token, user);

      if (user.role === "student") {
        router.push("/student/onboarding/diagnostic");
      } else if (user.role === "teacher") {
        router.push("/teacher/onboarding");
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || "Something went wrong during sign up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] relative flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-[var(--secondary)] rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[var(--primary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg mb-6">
            <GraduationCap size={26} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight uppercase">
            Join MagEdu
          </h1>
          <p className="mt-3 text-[var(--foreground)] opacity-60 font-medium max-w-md mx-auto">
            {step === 1 ? "Choose how you want to use the platform to get started." : "Just a few details to set up your account."}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[var(--surface)] rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--border)] relative">
          
          {/* Step Indicator */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[var(--border)] rounded-t-[32px] overflow-hidden">
            <div 
              className="h-full bg-[var(--accent)] transition-all duration-500 ease-out" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-slide-in">
              <h2 className="text-lg font-semibold text-[var(--foreground)] text-center">I am a...</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setRole("student")}
                  className={`relative p-8 rounded-[24px] border-2 text-left transition-all duration-300 group overflow-hidden ${
                    role === "student" 
                      ? "border-[var(--accent)] bg-[var(--accent)]/5 ring-4 ring-[var(--accent)]/10" 
                      : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    role === "student" ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md" : "bg-[var(--surface-hover)] text-[var(--foreground)] opacity-70 group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]"
                  }`}>
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Student</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-60 mt-2 font-medium">I want to learn, practice, and master concepts.</p>
                </button>

                <button
                  onClick={() => setRole("teacher")}
                  className={`relative p-8 rounded-[24px] border-2 text-left transition-all duration-300 group overflow-hidden ${
                    role === "teacher" 
                      ? "border-[var(--accent)] bg-[var(--accent)]/5 ring-4 ring-[var(--accent)]/10" 
                      : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    role === "teacher" ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md" : "bg-[var(--surface-hover)] text-[var(--foreground)] opacity-70 group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]"
                  }`}>
                    <UserCog size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Teacher</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-60 mt-2 font-medium">I want to manage a classroom and track progress.</p>
                </button>
              </div>

              <div className="pt-4 text-center">
                <button
                  onClick={() => setStep(2)}
                  disabled={!role}
                  className="w-full md:w-auto md:min-w-[200px] inline-flex items-center justify-center gap-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg disabled:shadow-none"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-in">
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-50 hover:opacity-100 hover:text-[var(--accent)] transition-colors mb-8"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--secondary-foreground)] shadow-sm">
                  {role === "student" ? <GraduationCap size={16} /> : <UserCog size={16} />}
                </span>
                {role === "student" ? "Student Details" : "Teacher Details"}
              </h2>

              {error && (
                <div className="mb-6 px-5 py-4 rounded-[16px] bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-20 text-sm text-[var(--error)] font-medium flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)] mt-1.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-[var(--foreground)] opacity-70 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-5 py-4 text-sm rounded-full border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-opacity-50 focus:outline-none focus:border-[var(--accent)] transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-[var(--foreground)] opacity-70 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@school.edu"
                    className="w-full px-5 py-4 text-sm rounded-full border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-opacity-50 focus:outline-none focus:border-[var(--accent)] transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-[var(--foreground)] opacity-70 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 text-sm rounded-full border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-opacity-50 focus:outline-none focus:border-[var(--accent)] transition-colors font-medium"
                  />
                </div>

                {role === "student" && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold tracking-wider uppercase text-[var(--foreground)] opacity-70 mb-2">Classroom Code</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        required
                        value={batchCode}
                        onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                        placeholder="e.g. MATH10B-X7K4"
                        className="flex-1 px-5 py-4 text-sm rounded-full border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-opacity-50 focus:outline-none focus:border-[var(--accent)] transition-colors font-bold tracking-widest uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={batchCode.length < 5 || previewLoading}
                        className="px-6 rounded-full bg-[var(--surface-hover)] border-2 border-[var(--border)] text-[var(--foreground)] font-bold text-xs uppercase tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>

                    {/* Classroom Preview */}
                    {previewLoading && (
                      <p className="text-xs font-medium text-[var(--foreground)] opacity-60 mt-3 flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-[var(--foreground)] opacity-40 border-t-transparent rounded-full animate-spin" />
                        Finding classroom...
                      </p>
                    )}
                    {classroomData && !previewLoading && (
                      <div className="mt-4 p-4 rounded-[16px] bg-[var(--secondary)] bg-opacity-20 border border-[var(--secondary)] flex items-start gap-3 animate-fade-in">
                        <CheckCircle2 className="text-[var(--success)] shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="text-sm font-bold text-[var(--foreground)]">{classroomData.name}</p>
                          <p className="text-xs text-[var(--foreground)] opacity-70 mt-1 font-medium">
                            {classroomData.subject} • {classroomData.grade} • {classroomData.teacher_name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading || (role === "student" && !classroomData)}
                    className="w-full flex items-center justify-center gap-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full py-4 text-sm font-bold uppercase tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20 disabled:shadow-none"
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <span className="text-sm text-[var(--foreground)] opacity-60">Already have an account? </span>
          <Link href="/login" className="text-sm font-bold text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
