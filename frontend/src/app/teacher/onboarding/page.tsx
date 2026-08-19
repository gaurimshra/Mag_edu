'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Copy, Check, BookOpen } from 'lucide-react';
import { createClassroom } from '@/lib/api/teacher';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClassroomCreatedData {
  name: string;
  grade: number;
  batchCode: string;
}

// ─── Step 1: Create Classroom Form ──────────────────────────────────────────

interface StepOneProps {
  onSuccess: (data: ClassroomCreatedData) => void;
}

function StepOne({ onSuccess }: StepOneProps) {
  const [classroomName, setClassroomName] = useState('');
  const [grade, setGrade] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedName = classroomName.trim();
    if (!trimmedName) {
      setError('Please enter a classroom name.');
      return;
    }

    setLoading(true);
    try {
      const response = await createClassroom({
        name: trimmedName,
        grade: parseInt(grade, 10),
        subject: 'Science',
      });
      onSuccess({
        name: trimmedName,
        grade: parseInt(grade, 10),
        batchCode: response.batch_code,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] px-4 py-12">
      <div className="bg-white rounded-[14px] border border-[#E4E3DE] p-8 w-full max-w-lg shadow-sm">
        {/* Logo + Header */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="flex items-center justify-center rounded-[8px] w-8 h-8"
            style={{ backgroundColor: '#3B5BDB' }}
          >
            <BookOpen size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-[#1A1C18] tracking-tight">MagEdu</span>
        </div>

        <h1 className="text-2xl font-bold text-[#1A1C18] leading-tight">Welcome to MagEdu</h1>
        <p className="text-sm text-[#6B6E66] mt-1">Let&apos;s set up your first classroom.</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
          {/* Classroom Name */}
          <div>
            <label
              htmlFor="classroomName"
              className="block text-sm font-medium text-[#1A1C18] mb-1.5"
            >
              Classroom name
            </label>
            <input
              id="classroomName"
              type="text"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
              placeholder="e.g. Class 10-B"
              maxLength={80}
              disabled={loading}
              required
              className="w-full rounded-[8px] border border-[#E4E3DE] bg-white px-3.5 py-2.5 text-sm text-[#1A1C18] placeholder-[#B0AFA9] outline-none transition-colors focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/10 disabled:opacity-60"
            />
          </div>

          {/* Grade */}
          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-[#1A1C18] mb-1.5"
            >
              Grade
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={loading}
              className="w-full rounded-[8px] border border-[#E4E3DE] bg-white px-3.5 py-2.5 text-sm text-[#1A1C18] outline-none transition-colors focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/10 disabled:opacity-60 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6E66' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="10">Class 10</option>
              <option value="9">Class 9</option>
              <option value="8">Class 8</option>
              <option value="7">Class 7</option>
            </select>
          </div>

          {/* Subjects */}
          <div>
            <p className="block text-sm font-medium text-[#1A1C18] mb-2">Subjects</p>
            <div className="grid grid-cols-2 gap-2">
              {/* Science – enabled, pre-checked */}
              <label className="flex items-center gap-2.5 rounded-[8px] border border-[#E4E3DE] px-3 py-2.5 bg-white cursor-default">
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-[3px] flex-shrink-0"
                  style={{ backgroundColor: '#2F9E44' }}
                  aria-hidden="true"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm font-medium text-[#1A1C18]">Science</span>
                <input
                  type="checkbox"
                  checked
                  readOnly
                  disabled
                  className="sr-only"
                  aria-label="Science (selected)"
                />
              </label>

              {/* Mathematics – coming soon */}
              <label className="flex items-center gap-2.5 rounded-[8px] border border-[#E4E3DE] px-3 py-2.5 bg-[#F8F7F4] cursor-not-allowed opacity-70">
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-[3px] border border-[#D0CFCA] bg-white flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-[#1A1C18]">Mathematics</span>
                <span className="ml-auto text-[10px] font-semibold text-[#6B6E66] bg-[#E4E3DE] rounded-[4px] px-1.5 py-0.5 leading-tight whitespace-nowrap">
                  Soon
                </span>
                <input
                  type="checkbox"
                  disabled
                  className="sr-only"
                  aria-label="Mathematics (coming soon)"
                />
              </label>
            </div>

            {/* Availability note */}
            <p className="text-xs text-[#6B6E66] bg-[#F2F1EE] rounded-[8px] px-3 py-2 mt-2">
              Science content is ready. Mathematics coming soon.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-[8px] bg-red-50 border border-red-200 px-3 py-2.5">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[8px] bg-[#1A1C18] text-white py-3 text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeOpacity="0.25"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Creating classroom…
              </span>
            ) : (
              'Create classroom'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Step 2: Classroom Created ───────────────────────────────────────────────

interface StepTwoProps {
  data: ClassroomCreatedData;
}

function StepTwo({ data }: StepTwoProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.batchCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement('textarea');
      el.value = data.batchCode;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleGoToDashboard() {
    localStorage.setItem('magedu_onboarding_done', '1');
    router.push('/teacher/dashboard');
  }

  const gradeLabel = `Class ${data.grade}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] px-4 py-12">
      <div className="bg-white rounded-[14px] border border-[#E4E3DE] p-8 w-full max-w-lg shadow-sm">
        {/* Success icon + heading */}
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 size={40} color="#2F9E44" strokeWidth={1.75} aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#1A1C18] mt-4">Your classroom is ready.</h1>
          <p className="text-sm text-[#6B6E66] mt-1">
            Share the join code with your students to get started.
          </p>
        </div>

        {/* Classroom summary */}
        <div className="bg-[#F2F1EE] rounded-[12px] p-4 mt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1A1C18] truncate">{data.name}</p>
              <p className="text-xs text-[#6B6E66] mt-0.5">{gradeLabel}</p>
            </div>
            <span className="inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-[6px] bg-[#DCFCE7] text-[#2F9E44] whitespace-nowrap flex-shrink-0">
              Science
            </span>
          </div>
        </div>

        {/* Batch code section */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-[#6B6E66] uppercase tracking-widest">
            Join code for students
          </p>

          <div
            className="mt-2 rounded-[12px] px-6 py-4 text-center"
            style={{ backgroundColor: '#1A1C18' }}
          >
            <span
              className="font-mono text-2xl font-bold text-white"
              style={{ letterSpacing: '0.18em' }}
            >
              {data.batchCode}
            </span>
          </div>

          <p className="text-xs text-[#6B6E66] mt-2 text-center">
            Students use this code to join your classroom.
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full rounded-[8px] border border-[#E4E3DE] bg-white text-[#1A1C18] py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:bg-[#F8F7F4] active:bg-[#F2F1EE]"
          >
            {copied ? (
              <>
                <Check size={15} strokeWidth={2.5} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={15} strokeWidth={2} />
                Copy code
              </>
            )}
          </button>

          {/* Go to dashboard */}
          <button
            type="button"
            onClick={handleGoToDashboard}
            className="w-full rounded-[8px] bg-[#1A1C18] text-white py-3 text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Orchestrator ───────────────────────────────────────────────────────

export default function TeacherOnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [classroomData, setClassroomData] = useState<ClassroomCreatedData | null>(null);

  function handleClassroomCreated(data: ClassroomCreatedData) {
    setClassroomData(data);
    setStep(2);
  }

  if (step === 2 && classroomData) {
    return <StepTwo data={classroomData} />;
  }

  return <StepOne onSuccess={handleClassroomCreated} />;
}
