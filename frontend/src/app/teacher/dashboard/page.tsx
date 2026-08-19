"use client";

import { useQuery } from "@tanstack/react-query";
import { getClassrooms, getTeacherDashboard } from "@/lib/api/teacher";
import { useState } from "react";
import { Users, TrendingUp, AlertTriangle, BrainCircuit, ChevronRight } from "lucide-react";
import { SkeletonCard, EmptyState } from "@/components/ui";
import Link from "next/link";
import { skillIdToTitle } from "@/lib/utils";

export default function TeacherDashboardPage() {
  const { data: classrooms, isLoading: loadingClassrooms } = useQuery({
    queryKey: ["classrooms"],
    queryFn: getClassrooms,
  });

  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);

  // Auto-select first classroom when loaded
  if (classrooms && classrooms.length > 0 && selectedClassroomId === null) {
    setSelectedClassroomId(classrooms[0].id);
  }

  const { data: dashboard, isLoading: loadingDashboard, isError } = useQuery({
    queryKey: ["teacher-dashboard", selectedClassroomId],
    queryFn: () => getTeacherDashboard(selectedClassroomId!),
    enabled: !!selectedClassroomId,
  });

  const isLoading = loadingClassrooms || (!!selectedClassroomId && loadingDashboard);

  if (isLoading) {
    return (
      <div className="px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
        <SkeletonCard className="h-24 bg-[--color-surface]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonCard className="h-28 bg-[--color-surface]" />
          <SkeletonCard className="h-28 bg-[--color-surface]" />
          <SkeletonCard className="h-28 bg-[--color-surface]" />
          <SkeletonCard className="h-28 bg-[--color-surface]" />
        </div>
        <SkeletonCard className="h-96 bg-[--color-surface]" />
      </div>
    );
  }

  if (classrooms && classrooms.length === 0) {
    return (
      <div className="px-6 md:px-8 py-16 max-w-6xl mx-auto">
        <EmptyState
          icon={<BrainCircuit size={24} className="text-[--color-forest]" />}
          title="No Cohorts Found"
          description="Create your first tracking classroom to initiate telemetry."
          action={
            <Link href="/teacher/onboarding" className="mt-2 inline-block">
              <button className="bg-[--color-forest] text-[--color-ivory] px-5 py-2.5 rounded shadow-[2px_2px_0_0_var(--color-charcoal)] font-bold">
                Initialize Cohort
              </button>
            </Link>
          }
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-8 py-8">
        <p className="text-[#C96B5B] font-bold">Telemetry Sync Failure. Please reattempt.</p>
      </div>
    );
  }

  const { overview, heatmap, alerts } = dashboard || {
    overview: null, heatmap: [], alerts: [], weak_spots: []
  };

  // Pivot heatmap data for the table
  const studentsMap = new Map<number, { name: string; scores: Record<string, number> }>();
  const allSkills = new Set<string>();

  heatmap.forEach((cell) => {
    allSkills.add(cell.skill_id);
    if (!studentsMap.has(cell.student_id)) {
      studentsMap.set(cell.student_id, { name: cell.student_name, scores: {} });
    }
    studentsMap.get(cell.student_id)!.scores[cell.skill_id] = cell.mastery;
  });

  const skillList = Array.from(allSkills).sort();

  function getCellClasses(score: number | undefined) {
    if (score === undefined) return "bg-[#F8F7F4] text-transparent border border-transparent"; // no data
    if (score >= 0.8) return "bg-[--color-sage] text-[--color-forest] border border-[--color-forest]";
    if (score >= 0.6) return "bg-[--color-sage-gray] text-[--color-charcoal] border border-transparent";
    if (score >= 0.4) return "bg-[--color-amber] text-[#422006] border border-[#422006]";
    return "bg-[#C96B5B] text-white border border-[#422006]";
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-7xl mx-auto pb-12 bg-white min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
           <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase mb-1">Global Telemetry</p>
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[--color-charcoal] lowercase">
             intelligence<br />
             <span className="text-[--color-forest]">overview.</span>
           </h1>
        </div>
        
        {classrooms && classrooms.length > 1 && (
          <select 
            value={selectedClassroomId || ""}
            onChange={(e) => setSelectedClassroomId(Number(e.target.value))}
            className="bg-[--color-ivory] border-2 border-[--color-charcoal] rounded font-bold px-4 py-2 text-sm text-[--color-charcoal] focus:outline-none focus:border-[--color-forest] shadow-[2px_2px_0_0_var(--color-charcoal)]"
          >
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-brutal p-5 bg-[--color-ivory]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-[--color-forest] uppercase tracking-widest">Active Cohort</span>
            <Users size={16} className="text-[--color-forest]" />
          </div>
          <div className="text-3xl font-black text-[--color-charcoal]">{overview?.student_count || 0}</div>
          <p className="text-xs font-bold text-[--color-sage-gray] mt-1 uppercase">Tracked Students</p>
        </div>

        <div className="card-brutal p-5 bg-[--color-ivory]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-[--color-forest] uppercase tracking-widest">Velocity</span>
            <TrendingUp size={16} className="text-[--color-forest]" />
          </div>
          <div className="text-3xl font-black text-[--color-charcoal]">{overview?.active_today || 0} <span className="text-sm font-bold opacity-50">/ {overview?.student_count || 0}</span></div>
          <p className="text-xs font-bold text-[--color-sage-gray] mt-1 uppercase">Engaged Today</p>
        </div>

        <div className="card-brutal p-5 bg-[--color-sage]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-[--color-forest] uppercase tracking-widest">State Space</span>
            <BrainCircuit size={16} className="text-[--color-forest]" />
          </div>
          <div className="text-3xl font-black text-[--color-forest]">{Math.round((overview?.class_avg_mastery || 0) * 100)}%</div>
          <p className="text-xs font-bold text-[--color-forest-green] mt-1 uppercase">Mean Mastery Infered</p>
        </div>

        <div className="card-brutal p-5 bg-[--color-amber]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-[#422006] uppercase tracking-widest">Risk Level</span>
            <AlertTriangle size={16} className="text-[#C96B5B]" />
          </div>
          <div className="text-3xl font-black text-[#C96B5B]">{overview?.at_risk_count || 0}</div>
          <p className="text-xs font-bold text-[#422006] mt-1 uppercase">Critical Interventions</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Heatmap -> Cognitive State Matrix */}
        <div className="lg:col-span-2 card-brutal flex flex-col bg-[--color-ivory] p-0 overflow-hidden">
          <div className="p-6 border-b-2 border-[--color-charcoal]">
            <h2 className="text-lg font-bold text-[--color-charcoal]">Cognitive State Matrix</h2>
            <p className="text-xs font-bold text-[--color-forest-green] mt-1 uppercase tracking-wider">Topological map of student mastery</p>
          </div>

          {studentsMap.size === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
               <p className="text-sm font-bold text-[--color-sage-gray]">Telemetry collecting...</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full min-w-max border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-black text-[--color-forest] uppercase tracking-wider pb-3 pr-4 sticky left-0 bg-[--color-ivory]">Student Node</th>
                    {skillList.map(skill => (
                      <th key={skill} className="text-center text-[10px] font-bold text-[--color-charcoal] uppercase pb-3 px-1" title={skillIdToTitle(skill)}>
                        {skillIdToTitle(skill).substring(0, 10)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-dashed divide-[--color-sage-gray]">
                  {Array.from(studentsMap.entries()).map(([id, data]) => (
                    <tr key={id} className="group hover:bg-white transition-colors">
                      <td className="py-3 pr-4 sticky left-0 bg-[--color-ivory] group-hover:bg-white transition-colors text-sm font-bold text-[--color-charcoal] max-w-[120px] truncate">
                        {data.name}
                      </td>
                      {skillList.map(skill => {
                        const score = data.scores[skill];
                        return (
                          <td key={skill} className="py-3 px-1">
                            <div className={`w-8 h-8 flex items-center justify-center rounded text-[10px] font-black mx-auto shadow-[1px_1px_0_0_var(--color-charcoal)] ${getCellClasses(score)}`}>
                              {score !== undefined ? Math.round(score * 100) : ''}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* At-risk -> Predictive Risk */}
        <div className="card-brutal p-6 bg-[#164A41] text-[--color-ivory] flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-[--color-forest-green] pb-4">
            <h2 className="text-lg font-bold">Predictive Risk</h2>
            {alerts.length > 0 && (
              <span className="bg-[--color-amber] text-[#422006] text-xs font-bold px-3 py-1 rounded shadow-[2px_2px_0_0_var(--color-charcoal)]">
                {alerts.length} ALERTS
              </span>
            )}
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[440px] pr-2 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="bg-[--color-sage] text-[--color-forest] rounded border border-[--color-charcoal] p-4 text-center font-bold shadow-[2px_2px_0_0_var(--color-charcoal)]">
                <p>Telemetry nominal.</p>
                <p className="text-xs uppercase mt-1 opacity-70">No Interventions Required</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.student_id} className="bg-[--color-ivory] text-[--color-charcoal] rounded-lg p-4 border border-[--color-charcoal] shadow-[2px_2px_0_0_var(--color-charcoal)]">
                  <h3 className="font-bold text-lg">{alert.name}</h3>
                  <p className="text-xs font-bold text-[--color-forest] uppercase tracking-wider mt-1">{alert.risk_reason}</p>
                  
                  <div className="bg-[#C96B5B] text-white p-2 mt-3 text-xs font-bold rounded flex items-center gap-2">
                     <AlertTriangle size={14} /> {alert.risk_action}
                  </div>
                  
                  {alert.weak_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 border-t border-[--color-sage-gray] pt-3">
                      <span className="text-[10px] font-bold text-[--color-sage-gray] uppercase w-full">Vulnerable Nodes:</span>
                      {alert.weak_skills.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="bg-[#111A16] text-[--color-sage] border border-[--color-forest] text-[10px] px-2 py-1 rounded font-bold">
                          {skillIdToTitle(skill)}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Link href={`/teacher/students/${alert.student_id}`} className="mt-4 flex items-center justify-between px-3 py-2 bg-[--color-forest] text-white text-xs font-bold rounded hover:bg-[#0f342d] transition-colors">
                    <span>LAUNCH SIMULATION</span> <ChevronRight size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
