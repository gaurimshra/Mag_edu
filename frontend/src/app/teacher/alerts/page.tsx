"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { AlertTriangle, Clock, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<{id: number, student_name: string, classroom_name: string, risk_level: string, issue: string, last_active: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<{id: number, student_name: string, classroom_name: string, risk_level: string, issue: string, last_active: string}[]>("/api/teacher/alerts");
        setAlerts(res);
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
        <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase">Intervention Engine</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[--color-charcoal] lowercase">
          active<br />
          <span className="text-[--color-forest]">alerts.</span>
        </h1>
        <p className="text-xl text-[--color-forest-green] max-w-2xl text-balance">
          Students who need immediate attention across all your classrooms based on predictive risk modeling.
        </p>
      </div>
      
      {loading ? (
        <p className="text-[--color-sage-gray]">Analyzing telemetry...</p>
      ) : (
        <div className="grid gap-6">
          {alerts.map((a, i) => (
            <div key={i} className="card-brutal p-6 bg-[--color-ivory] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-8" style={{ borderLeftColor: a.risk_level === 'high' ? '#C96B5B' : 'var(--color-amber)' }}>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-[--color-charcoal] flex items-center gap-3">
                  {a.student_name}
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${a.risk_level === 'high' ? 'bg-[#C96B5B] text-white' : 'bg-[--color-amber] text-[#422006]'}`}>
                    {a.risk_level} Risk
                  </span>
                </h3>
                <div className="flex gap-4 text-sm font-bold text-[--color-forest]">
                  <span className="flex items-center gap-1 bg-[--color-sage] px-2 py-1 rounded">
                    <BookOpen size={14} /> {a.classroom_name}
                  </span>
                  <span className="flex items-center gap-1 bg-[#111A16] text-[--color-ivory] px-2 py-1 rounded">
                    <Clock size={14} /> Active {a.last_active}
                  </span>
                </div>
                <p className="text-[#C96B5B] font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> Blocked by: {a.issue}
                </p>
              </div>
              <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
                <Link href="/teacher/copilot" className="block text-center px-6 py-3 bg-[--color-forest] text-[--color-ivory] font-bold rounded-lg hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--color-charcoal)] transition-all">
                  Simulate Solution →
                </Link>
                <button className="px-6 py-3 border-2 border-[--color-forest-green] text-[--color-forest] font-bold rounded-lg hover:bg-[--color-sage] transition-colors">
                  Message Student
                </button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-[--color-sage] rounded-3xl bg-white shadow-sm">
              <div className="w-16 h-16 bg-[--color-sage] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-[--color-forest]" />
              </div>
              <h3 className="text-xl font-bold text-[--color-forest] mb-2">Systems Nominal</h3>
              <p className="text-[--color-sage-gray]">No active risk alerts right now. Your students are on track!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
