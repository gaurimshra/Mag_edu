"use client";

import { useQuery } from "@tanstack/react-query";
import { getProgress } from "@/lib/api/student";
import { TrendingUp, BookOpen, Target, Flame } from "lucide-react";
import { SkeletonCard } from "@/components/ui";
import { skillIdToTitle } from "@/lib/utils";

export default function StudentProgressPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-progress"],
    queryFn: getProgress,
  });

  if (isLoading) {
    return (
      <div className="px-6 md:px-8 py-8 max-w-5xl mx-auto space-y-6">
        <SkeletonCard className="h-24" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonCard className="h-28" />
          <SkeletonCard className="h-28" />
          <SkeletonCard className="h-28" />
          <SkeletonCard className="h-28" />
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-8 py-8 text-[#C92A2A]">
        Could not load progress data.
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1C18]">My Progress</h1>
        <p className="text-sm text-[#6B6E66] mt-1">Track your learning journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-white border border-[#E4E3DE] rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={14} className="text-[#9A9D94]" />
            <span className="text-[10px] font-bold text-[#6B6E66] uppercase tracking-wider">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-[#1A1C18]">{Math.round((data?.accuracy || 0) * 100)}%</div>
          <p className="text-xs text-[#9A9D94] mt-0.5">Correct answers</p>
        </div>

        <div className="bg-white border border-[#E4E3DE] rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={14} className="text-[#9A9D94]" />
            <span className="text-[10px] font-bold text-[#6B6E66] uppercase tracking-wider">Practice</span>
          </div>
          <div className="text-2xl font-bold text-[#1A1C18]">{data?.total_questions || 0}</div>
          <p className="text-xs text-[#9A9D94] mt-0.5">Questions answered</p>
        </div>

        <div className="bg-white border border-[#E4E3DE] rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame size={14} className="text-[#E67700]" />
            <span className="text-[10px] font-bold text-[#E67700] uppercase tracking-wider">Streak</span>
          </div>
          <div className="text-2xl font-bold text-[#1A1C18]">{data?.streak || 0}</div>
          <p className="text-xs text-[#9A9D94] mt-0.5">Current day streak</p>
        </div>

        <div className="bg-white border border-[#E4E3DE] rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} className="text-[#3B5BDB]" />
            <span className="text-[10px] font-bold text-[#3B5BDB] uppercase tracking-wider">Experience</span>
          </div>
          <div className="text-2xl font-bold text-[#1A1C18]">{data?.xp || 0}</div>
          <p className="text-xs text-[#9A9D94] mt-0.5">Total XP earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Mastery */}
        <div>
          <h2 className="text-base font-semibold text-[#1A1C18] mb-4">Science mastery</h2>
          {data?.mastery_by_skill && data.mastery_by_skill.length > 0 ? (
            <div className="space-y-3">
              {data.mastery_by_skill.sort((a,b) => b.score - a.score).map((m, i) => (
                <div key={i} className="bg-white border border-[#E4E3DE] rounded-[12px] p-4 shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-[#1A1C18]">{skillIdToTitle(m.skill_id)}</span>
                    <span className="text-xs font-semibold text-[#6B6E66]">{Math.round(m.score * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#F2F1EE] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2F9E44]" 
                      style={{ width: `${Math.round(m.score * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#F8F7F4] border border-[#E4E3DE] rounded-[14px] p-8 text-center">
              <p className="text-sm font-medium text-[#1A1C18]">No mastery data yet.</p>
              <p className="text-xs text-[#6B6E66] mt-1">Complete lessons to see your progress here.</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-base font-semibold text-[#1A1C18] mb-4">Recent sessions</h2>
          {data?.recent_activity && data.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {data.recent_activity.map((session, i) => {
                const acc = session.accuracy;
                const color = acc >= 0.7 ? "text-[#2F9E44]" : acc >= 0.4 ? "text-[#E67700]" : "text-[#C92A2A]";
                
                return (
                  <div key={i} className="bg-white border border-[#E4E3DE] rounded-[12px] p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1A1C18]">{skillIdToTitle(session.skill_id)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-[#9A9D94]">
                          {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-[#E4E3DE]"></span>
                        <p className="text-xs text-[#9A9D94] capitalize">{session.mode}</p>
                        <span className="w-1 h-1 rounded-full bg-[#E4E3DE]"></span>
                        <p className="text-xs text-[#9A9D94]">{session.questions} Qs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${color}`}>{Math.round(acc * 100)}%</span>
                      <p className="text-[10px] font-semibold text-[#6B6E66] uppercase tracking-wider mt-0.5">Accuracy</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-[#F8F7F4] border border-[#E4E3DE] rounded-[14px] p-8 text-center">
              <p className="text-sm font-medium text-[#1A1C18]">No activity yet.</p>
              <p className="text-xs text-[#6B6E66] mt-1">Your practice sessions will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
