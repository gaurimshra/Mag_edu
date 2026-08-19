"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudentDashboard } from "@/lib/api/student";
import { SCIENCE_CURRICULUM } from "@/lib/curriculum";
import { ChevronRight, Flame, Clock, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SkeletonCard, Button } from "@/components/ui";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: getStudentDashboard,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Check if diagnostic was skipped
  const isDiagnosticSkipped = typeof window !== "undefined" && localStorage.getItem("magedu_diagnostic_done") === "skipped";

  if (isLoading) {
    return (
      <div className="px-6 md:px-8 py-8 max-w-5xl mx-auto space-y-6">
        <SkeletonCard className="h-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="h-64 lg:col-span-2" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  // Derive initial values from data or defaults
  const streak = data?.streak || 0;
  const xp = data?.xp || 0;
  
  // Find next skill or default to first chapter
  const nextSkillId = data?.next_skill_id || SCIENCE_CURRICULUM[0].skill_id;
  
  // Calculate average mastery from API data
  const apiMastery = data?.mastery || [];
  let avgMastery = 0;
  if (apiMastery.length > 0) {
    avgMastery = apiMastery.reduce((acc, m) => acc + m.score, 0) / apiMastery.length;
  } else if (typeof window !== "undefined") {
    // Try to get from local storage if API has no data
    const localStr = localStorage.getItem("magedu_initial_mastery");
    if (localStr) {
      try {
        const local = JSON.parse(localStr) as Record<string, number>;
        const vals = Object.values(local);
        if (vals.length > 0) avgMastery = vals.reduce((a, b) => a + b, 0) / vals.length;
      } catch {}
    }
  }

  // Find curriculum details for the next skill
  const nextChapterIndex = SCIENCE_CURRICULUM.findIndex(c => c.skill_id === nextSkillId);
  const nextChapter = SCIENCE_CURRICULUM[nextChapterIndex] || SCIENCE_CURRICULUM[0];
  const prevChapter = nextChapterIndex > 0 ? SCIENCE_CURRICULUM[nextChapterIndex - 1] : null;
  const upcomingChapter = nextChapterIndex < SCIENCE_CURRICULUM.length - 1 ? SCIENCE_CURRICULUM[nextChapterIndex + 1] : null;

  // Get mastery specific to the next skill
  const nextSkillMasteryObj = apiMastery.find(m => m.skill_id === nextSkillId);
  let nextSkillMastery = nextSkillMasteryObj ? nextSkillMasteryObj.score : 0;
  if (!nextSkillMasteryObj && typeof window !== "undefined") {
    const localStr = localStorage.getItem("magedu_initial_mastery");
    if (localStr) {
      try {
        const local = JSON.parse(localStr) as Record<string, number>;
        nextSkillMastery = local[nextSkillId] || 0;
      } catch {}
    }
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl mx-auto">
      {isDiagnosticSkipped && (
        <div className="bg-[#FFF3BF] border border-[#F08C00]/20 rounded-[10px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <p className="text-sm font-medium text-[#1A1C18]">
            Complete your learning assessment to unlock personalized recommendations.
          </p>
          <Link href="/student/onboarding/diagnostic" className="shrink-0">
            <Button variant="primary" size="sm">Take assessment →</Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C18]">
            {greeting}, {user?.name?.split(' ')[0] || 'Student'}.
          </h1>
          <p className="text-[#6B6E66] text-sm mt-1">Ready for today&apos;s learning?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#FFF3BF] rounded-full px-3 py-1.5">
            <Flame size={14} className="text-[#E67700]" />
            <span className="text-xs font-medium text-[#E67700]">{streak} day streak</span>
          </div>
          <span className="text-xs font-medium text-[#6B6E66]">{xp} XP</span>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-6 mt-6 shadow-sm">
        <p className="text-xs font-semibold text-[#6B6E66] uppercase tracking-wide">Continue learning</p>
        <div className="mt-3">
          <span className="bg-[#EBFBEE] text-[#2F9E44] text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2">
            Science
          </span>
          <h2 className="text-xl font-semibold text-[#1A1C18]">{nextChapter.title}</h2>
          <p className="text-sm text-[#6B6E66] mt-1">{nextChapter.topics[0] || 'Basics'}</p>
        </div>
        
        <div className="mt-5">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-xs text-[#6B6E66] font-medium">Your mastery</span>
            <span className="text-xs text-[#6B6E66] font-medium">{Math.round(nextSkillMastery * 100)}%</span>
          </div>
          <div className="h-2 bg-[#F2F1EE] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2F9E44] rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.round(nextSkillMastery * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-1.5 text-xs text-[#9A9D94] font-medium">
            <Clock size={14} />
            <span>Estimated 12 min</span>
          </div>
          <Link href={`/student/learn/${nextSkillId}`}>
            <Button variant="primary" className="flex items-center gap-1.5">
              Continue <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Today plan */}
        <div className="lg:col-span-2 bg-white border border-[#E4E3DE] rounded-[14px] p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#1A1C18] mb-4">Today&apos;s plan</h2>
          
          <div className="space-y-0">
            {/* Previous chapter if exists */}
            {prevChapter && (
              <div className="flex items-center gap-3 py-3 border-b border-[#F2F1EE]">
                <div className="w-5 h-5 rounded-full bg-[#EBFBEE] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={12} className="text-[#2F9E44]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#1A1C18] font-medium">{prevChapter.title}</p>
                  <p className="text-xs text-[#9A9D94]">Review completed</p>
                </div>
                <span className="text-xs font-medium text-[#2F9E44] bg-[#EBFBEE] px-2 py-0.5 rounded-full">Completed</span>
              </div>
            )}
            
            {/* Current chapter */}
            <div className="flex items-center gap-3 py-3 border-b border-[#F2F1EE]">
              <div className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3B5BDB]"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#1A1C18] font-medium">{nextChapter.title}</p>
                <p className="text-xs text-[#9A9D94]">12 min remaining</p>
              </div>
              <span className="text-xs font-medium text-[#3B5BDB] bg-[#EEF2FF] px-2 py-0.5 rounded-full">In progress</span>
            </div>
            
            {/* Upcoming chapter */}
            {upcomingChapter && (
              <div className="flex items-center gap-3 py-3">
                <div className="w-5 h-5 rounded-full border border-[#E4E3DE] bg-[#F8F7F4] flex items-center justify-center flex-shrink-0">
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#6B6E66] font-medium">{upcomingChapter.title}</p>
                  <p className="text-xs text-[#9A9D94]">Next topic</p>
                </div>
                <span className="text-xs font-medium text-[#9A9D94]">Upcoming</span>
              </div>
            )}
          </div>
        </div>

        {/* Subjects & Insights */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#1A1C18] mb-4">Subjects</h2>
            
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#2F9E44]"></div>
                <span className="text-sm font-medium text-[#1A1C18]">Science</span>
              </div>
              <div className="h-2 bg-[#F2F1EE] rounded-full overflow-hidden mb-1.5">
                <div 
                  className="h-full bg-[#2F9E44] rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.round(avgMastery * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6E66] font-medium">{Math.round(avgMastery * 100)}% overall mastery</span>
                <Link href="/student/learn" className="text-xs text-[#3B5BDB] font-medium hover:underline">
                  View chapters →
                </Link>
              </div>
            </div>
            
            <div className="bg-[#F8F7F4] border border-[#E4E3DE] rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-[#9A9D94]" />
                <span className="text-sm font-medium text-[#9A9D94]">Mathematics</span>
                <span className="ml-auto bg-[#F2F1EE] text-[#9A9D94] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Soon</span>
              </div>
              <p className="text-xs text-[#9A9D94] mt-1.5 leading-relaxed">
                Content for Mathematics will be available soon.
              </p>
            </div>
          </div>
          
          <div className="bg-[#F2F1EE] rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-[#1A1C18]">A small observation</h3>
            <p className="text-sm text-[#6B6E66] mt-1.5 leading-relaxed">
              {avgMastery < 0.4 
                ? "You are just getting started. Every question you answer helps us understand how you learn." 
                : avgMastery < 0.7 
                ? "You are making steady progress. Keep your daily practice going — consistency matters more than perfection." 
                : "You are excelling in Science. Your learning pace suggests you are ready for more challenging material."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
