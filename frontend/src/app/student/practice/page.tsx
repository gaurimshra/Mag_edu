"use client";

import { useEffect, useState } from "react";
import { SCIENCE_CURRICULUM } from "@/lib/curriculum";
import Link from "next/link";
import { ArrowRight, Database, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/api/client";

interface Assignment {
  id: number;
  title: string;
  classroom_name: string;
  due_date: string;
  skill_id: string;
}

export default function PracticeHubPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<Assignment[]>("/api/student/assignments");
        setAssignments(res);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header section - Editorial Typography */}
      <div className="space-y-4">
         <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase">Coursework</p>
         <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[--color-charcoal] lowercase">
           practice<br />
           <span className="text-[--color-forest]">hub.</span>
         </h1>
         <p className="text-xl text-[--color-forest-green] max-w-2xl text-balance">
           Complete your assignments and use active learning inference to master the science curriculum.
         </p>
      </div>

      {loading ? (
        <p className="text-[--color-sage-gray]">Loading coursework...</p>
      ) : assignments.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b-2 border-[--color-charcoal] pb-2 inline-block">Assigned Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {assignments.map(a => (
               <div key={a.id} className="card-brutal bg-[--color-amber] p-6 border-2 border-[--color-charcoal] shadow-[4px_4px_0_0_var(--color-charcoal)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-charcoal)] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[#422006]">{a.title}</h3>
                    <span className="text-xs font-bold uppercase tracking-wider bg-white px-2 py-1 rounded text-[--color-charcoal] shadow-sm">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Due {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#422006]/80 mb-6">Class: {a.classroom_name}</p>
                  
                  <Link
                    href={`/student/practice/${a.skill_id}/quiz`}
                    className="flex items-center justify-center w-full py-3 rounded-lg font-bold bg-[#422006] text-[--color-ivory] transition-all hover:bg-[--color-charcoal] shadow-[2px_2px_0_0_var(--color-charcoal)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0_0_var(--color-charcoal)]"
                  >
                    Start Assignment <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="space-y-6 pt-8">
        <h2 className="text-2xl font-bold border-b-2 border-[--color-forest-green] pb-2 inline-block text-[--color-forest]">Self-Guided Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SCIENCE_CURRICULUM.map((chapter) => (
            <div 
              key={chapter.skill_id}
              className="group flex flex-col h-full card-brutal overflow-hidden border-2 border-[--color-forest-green] bg-[--color-ivory]"
            >
              <div className="p-6 pb-0 flex-1">
                <span className="text-xs font-black uppercase tracking-widest text-[--color-sage-gray] mb-2 block">
                  Chapter {chapter.chapter}
                </span>
                <h2 className="text-2xl font-bold leading-tight mb-4 min-h-[3.5rem] tracking-tight">{chapter.title}</h2>
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="px-2 py-1 bg-[--color-ivory] border border-[--color-forest] text-[--color-forest] rounded text-[10px] font-bold uppercase tracking-wider">
                    {chapter.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-[--color-sage] text-[--color-forest] rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-3 h-3" /> Min-Question
                  </span>
                </div>
                <p className="text-sm text-[--color-forest-green]">
                  {chapter.topics.join(", ")}
                </p>
              </div>

              <div className="p-6 mt-auto">
                <Link
                  href={`/student/practice/${chapter.skill_id}/quiz`}
                  className="flex items-center justify-between w-full py-4 px-6 rounded-lg font-bold bg-[--color-forest] text-[--color-ivory] transition-all hover:bg-[#1A544A] border border-[--color-forest] shadow-[4px_4px_0_0_var(--color-charcoal)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_var(--color-charcoal)]"
                >
                  Start Diagnostic
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
