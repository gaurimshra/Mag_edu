"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { DIAGNOSTIC_QUESTIONS } from "@/lib/curriculum";

type Phase = "intro" | "questions" | "results";

interface SkillResult {
  skill_id: string;
  topic: string;
  correct: number;
  total: number;
  mastery: number;
}

export default function DiagnosticPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<SkillResult[]>([]);

  const questions = DIAGNOSTIC_QUESTIONS;
  const total = questions.length;
  const current = questions[currentIndex];

  function handleAnswer(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = { ...answers, [current.id]: selected };
    setAnswers(newAnswers);

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    } else {
      // Calculate results
      const skillMap: Record<string, { correct: number; total: number; topic: string }> = {};
      questions.forEach((q) => {
        if (!skillMap[q.skill_id]) {
          skillMap[q.skill_id] = { correct: 0, total: 0, topic: q.topic };
        }
        skillMap[q.skill_id].total++;
        if (newAnswers[q.id] === q.correct_index) {
          skillMap[q.skill_id].correct++;
        }
      });

      const skillResults: SkillResult[] = Object.entries(skillMap).map(([skill_id, data]) => ({
        skill_id,
        topic: data.topic,
        correct: data.correct,
        total: data.total,
        mastery: data.correct / data.total,
      }));

      // Save mastery data locally
      const masteryMap: Record<string, number> = {};
      skillResults.forEach((s) => { masteryMap[s.skill_id] = s.mastery; });
      localStorage.setItem("magedu_initial_mastery", JSON.stringify(masteryMap));
      localStorage.setItem("magedu_diagnostic_done", "1");

      setResults(skillResults);
      setPhase("results");
    }
  }

  function handlePrev() {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setSelected(answers[questions[currentIndex - 1].id] ?? null);
  }

  const strong = results.filter((r) => r.mastery >= 0.7);
  const weak = results.filter((r) => r.mastery < 0.5);
  const medium = results.filter((r) => r.mastery >= 0.5 && r.mastery < 0.7);

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-[#1A1C18] flex items-center justify-center text-white text-xs font-bold">
              M
            </div>
            <span className="font-semibold text-[#1A1C18]">MagEdu</span>
          </div>

          <h1 className="text-3xl font-bold text-[#1A1C18] leading-snug">
            Let&apos;s understand<br />how you learn.
          </h1>
          <p className="text-[#6B6E66] mt-4 leading-relaxed">
            We&apos;ll start with a short Science check to understand what you already know.
            Your answers help us choose the right starting point — just for you.
          </p>

          <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-5 mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#F2F1EE] flex items-center justify-center text-xs text-[#6B6E66] font-medium flex-shrink-0 mt-0.5">✓</span>
              <p className="text-sm text-[#1A1C18]">15 Science questions covering major topics</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#F2F1EE] flex items-center justify-center text-xs text-[#6B6E66] font-medium flex-shrink-0 mt-0.5">✓</span>
              <p className="text-sm text-[#1A1C18]">About 10–15 minutes</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#F2F1EE] flex items-center justify-center text-xs text-[#6B6E66] font-medium flex-shrink-0 mt-0.5">✓</span>
              <p className="text-sm text-[#1A1C18]">There are no grades here — just your starting point</p>
            </div>
          </div>

          <button
            onClick={() => setPhase("questions")}
            className="mt-8 w-full bg-[#1A1C18] text-white rounded-[8px] py-3 font-medium text-sm hover:bg-[#2d312a] transition-colors flex items-center justify-center gap-2"
          >
            Start <ChevronRight size={16} />
          </button>

          <button
            onClick={() => { localStorage.setItem("magedu_diagnostic_done", "skipped"); router.push("/student/dashboard"); }}
            className="mt-3 w-full text-center text-sm text-[#9A9D94] hover:text-[#6B6E66] transition-colors py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTIONS ──
  if (phase === "questions") {
    const progress = ((currentIndex) / total) * 100;

    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#E4E3DE] px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B6E66] font-medium">Science Diagnostic</p>
              <p className="text-sm text-[#1A1C18] font-semibold mt-0.5">
                Question {currentIndex + 1} of {total}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#9A9D94]">{current.topic}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="max-w-2xl mx-auto mt-3">
            <div className="h-1.5 bg-[#F2F1EE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2F9E44] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-start justify-center px-4 pt-12 pb-8">
          <div className="max-w-2xl w-full">
            <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-8">
              <p className="text-xs font-semibold text-[#9A9D94] uppercase tracking-wide mb-4">
                {current.subject}
              </p>
              <h2 className="text-xl font-semibold text-[#1A1C18] leading-snug">
                {current.question}
              </h2>

              <div className="mt-8 space-y-3">
                {current.options.map((option, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      className={[
                        "w-full text-left px-5 py-4 rounded-[10px] border text-sm transition-all duration-150",
                        isSelected
                          ? "border-[#1A1C18] bg-[#1A1C18] text-white font-medium"
                          : selected !== null
                          ? "border-[#E4E3DE] bg-[#F8F7F4] text-[#9A9D94] cursor-not-allowed"
                          : "border-[#E4E3DE] bg-white text-[#1A1C18] hover:border-[#C8C7C0] hover:bg-[#F8F7F4] cursor-pointer",
                      ].join(" ")}
                    >
                      <span className="font-medium text-inherit opacity-60 mr-3">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 text-sm text-[#6B6E66] disabled:opacity-40 hover:text-[#1A1C18] transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                onClick={handleNext}
                disabled={selected === null}
                className="flex items-center gap-2 bg-[#1A1C18] text-white px-6 py-2.5 rounded-[8px] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2d312a] transition-colors"
              >
                {currentIndex === total - 1 ? "Finish" : "Next"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles size={20} className="text-[#2F9E44]" />
          <span className="text-sm font-medium text-[#2F9E44]">Assessment complete</span>
        </div>

        <h1 className="text-3xl font-bold text-[#1A1C18]">Your learning profile</h1>
        <p className="text-[#6B6E66] mt-2">We&apos;ve found your starting point.</p>

        <div className="mt-8 space-y-3">
          {strong.length > 0 && (
            <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-5">
              <p className="text-xs font-semibold text-[#2F9E44] uppercase tracking-wide mb-3">
                You&apos;re already strong in
              </p>
              <div className="space-y-2">
                {strong.map((r) => (
                  <div key={r.skill_id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2F9E44]" />
                    <span className="text-sm text-[#1A1C18] font-medium">{r.topic}</span>
                    <span className="ml-auto text-xs text-[#6B6E66]">{Math.round(r.mastery * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {medium.length > 0 && (
            <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-5">
              <p className="text-xs font-semibold text-[#E67700] uppercase tracking-wide mb-3">
                Worth revisiting
              </p>
              <div className="space-y-2">
                {medium.map((r) => (
                  <div key={r.skill_id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F08C00]" />
                    <span className="text-sm text-[#1A1C18] font-medium">{r.topic}</span>
                    <span className="ml-auto text-xs text-[#6B6E66]">{Math.round(r.mastery * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weak.length > 0 && (
            <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-5">
              <p className="text-xs font-semibold text-[#3B5BDB] uppercase tracking-wide mb-3">
                Your first focus
              </p>
              <div className="space-y-2">
                {weak.slice(0, 2).map((r) => (
                  <div key={r.skill_id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3B5BDB]" />
                    <span className="text-sm text-[#1A1C18] font-medium">{r.topic}</span>
                    <span className="ml-auto text-xs text-[#6B6E66]">{Math.round(r.mastery * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#F2F1EE] rounded-[14px] p-5 mt-4">
          <p className="text-sm text-[#1A1C18]">
            We&apos;ve created your first learning path based on your answers.
          </p>
          <p className="text-xs text-[#6B6E66] mt-1">
            Your recommendations will get better as you practice more.
          </p>
        </div>

        <button
          onClick={() => router.push("/student/dashboard")}
          className="mt-6 w-full bg-[#1A1C18] text-white rounded-[8px] py-3 font-medium text-sm hover:bg-[#2d312a] transition-colors flex items-center justify-center gap-2"
        >
          See my learning path <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
