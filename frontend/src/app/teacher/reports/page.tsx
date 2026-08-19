"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { BarChart3, Target, BookOpen, Activity } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<{classroom_name: string, average_score: number, active_students: number, total_students: number, topics_mastered: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<{classroom_name: string, average_score: number, active_students: number, total_students: number, topics_mastered: number}[]>("/api/teacher/reports");
        setReports(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header section */}
      <div className="space-y-4">
        <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase">Analytics</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[--color-charcoal] lowercase">
          class<br />
          <span className="text-[--color-forest]">reports.</span>
        </h1>
        <p className="text-xl text-[--color-forest-green] max-w-2xl text-balance">
          Overview of performance across all your classrooms, measured by real-time mastery scores.
        </p>
      </div>

      {loading ? (
        <p className="text-[--color-sage-gray]">Aggregating telemetry...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reports.map((r, i) => (
            <div key={i} className="card-brutal p-8 bg-[--color-ivory] flex flex-col justify-between border-2 border-[--color-charcoal]">
              <div className="border-b-2 border-[--color-forest] pb-4 mb-6">
                 <h2 className="text-3xl font-bold text-[--color-charcoal] flex items-center gap-3">
                   <BookOpen className="w-8 h-8 text-[--color-forest]" />
                   {r.classroom_name}
                 </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-[--color-sage-gray] mb-1">Avg Score</span>
                  <div className="text-4xl font-black text-[--color-forest] flex items-end gap-2">
                    {r.average_score}%
                    <BarChart3 className="w-6 h-6 mb-1 text-[--color-amber]" />
                  </div>
                </div>
                
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-[--color-sage-gray] mb-1">Engagement</span>
                  <div className="text-4xl font-black text-[--color-charcoal] flex items-end gap-2">
                    {r.active_students}<span className="text-xl text-[--color-sage-gray]">/{r.total_students}</span>
                    <Activity className="w-6 h-6 mb-1 text-[#C96B5B]" />
                  </div>
                </div>
                
                <div className="col-span-2 p-4 bg-[--color-sage] rounded-xl border border-[--color-forest] flex justify-between items-center shadow-sm">
                  <span className="font-bold text-[--color-forest] flex items-center gap-2">
                    <Target size={20} /> Topics Mastered
                  </span>
                  <span className="text-2xl font-black text-[#422006]">{r.topics_mastered}</span>
                </div>
              </div>

              <button className="w-full py-4 text-center border-2 border-[--color-forest] text-[--color-forest] font-bold rounded-lg hover:bg-[--color-forest] hover:text-[--color-ivory] transition-colors shadow-[4px_4px_0_0_var(--color-charcoal)] hover:translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[2px_2px_0_0_var(--color-charcoal)] uppercase tracking-wider text-sm">
                View Drilldown
              </button>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-[--color-sage-gray]">No reports available yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
