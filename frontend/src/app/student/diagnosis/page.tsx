"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { apiRequest } from "@/lib/api/client";

interface DnaDatum {
  subject: string;
  A: number;
}

interface Misconception {
  skill_id: string;
  misconception_id: string;
  confidence: number;
}

interface LearningDnaResponse {
  dna_data: DnaDatum[];
  misconceptions: Misconception[];
}

export default function DiagnosisPage() {
  const [data, setData] = useState<LearningDnaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<LearningDnaResponse>("/api/student/learning-dna");
        setData(res);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      
      {/* Header section - Editorial Typography */}
      <div className="space-y-4">
        <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase">My Learning Diagnosis</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[--color-charcoal] lowercase">
          understanding<br />
          <span className="text-[--color-forest]">the gaps.</span>
        </h1>
        <p className="text-xl text-[--color-forest-green] max-w-2xl text-balance">
          Your knowledge isn&apos;t a score. It&apos;s a system. Here is a breakdown of your learning DNA and current cognitive blockers.
        </p>
      </div>

      {loading ? (
        <p className="text-[--color-sage-gray]">Analyzing cognitive footprint...</p>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Radar Chart / DNA */}
          <div className="card-brutal p-8 lg:col-span-1 bg-[--color-ivory]">
            <h2 className="text-2xl font-bold mb-6 text-[--color-forest]">Learning DNA</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.dna_data}>
                  <PolarGrid stroke="var(--color-sage-gray)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-charcoal)', fontSize: 12 }} />
                  <Radar name="Student" dataKey="A" stroke="var(--color-forest)" fill="var(--color-sage)" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-[--color-border] pb-2">
                <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-[--color-forest]" /> Retention</span>
                <span className="font-bold text-[--color-amber]">{(data.dna_data.find((d) => d.subject === "Retention")?.A ?? 0) > 50 ? "Strong" : "Decaying"}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[--color-border] pb-2">
                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-[--color-forest]" /> Confidence Calibration</span>
                <span className="font-bold text-[--color-needs-attention]">{(data.dna_data.find((d) => d.subject === "Confidence")?.A ?? 0) > 60 ? "Calibrated" : "Underconfident"}</span>
              </div>
            </div>
          </div>

          {/* Misconception Graph */}
          <div className="card-brutal p-8 lg:col-span-2 bg-[--color-forest] text-[--color-ivory]">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Concept Topology & Blockers</h2>
                <span className="bg-[--color-amber] text-[#422006] text-xs font-bold px-3 py-1 rounded-full">
                  {data.misconceptions.length > 0 && data.misconceptions[0].confidence > 0 ? "Active Blocker Detected" : "Clear Path"}
                </span>
             </div>
             
             {/* Visual conceptual tree */}
             <div className="relative p-6 border border-[--color-forest-green] rounded-xl bg-[#111A16] overflow-hidden">
               
               <div className="flex flex-col items-center gap-8 relative z-10 w-full overflow-x-auto">
                 {data.misconceptions.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-8">
                      {i > 0 && <div className="w-px h-8 bg-[--color-sage-gray]"></div>}
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 * i }}
                        className="px-6 py-4 bg-[--color-amber] text-[#422006] font-bold rounded-lg shadow-[4px_4px_0_0_var(--color-ivory)] border border-[#422006] relative text-center"
                      >
                        {m.confidence > 0 && (
                          <div className="absolute -right-3 -top-3 w-6 h-6 bg-[--color-ivory] rounded-full flex items-center justify-center animate-pulse-node">
                            <AlertTriangle className="w-4 h-4 text-[#C96B5B]" />
                          </div>
                        )}
                        {m.skill_id.split('.').pop()?.replace(/_/g, ' ').toUpperCase()}
                      </motion.div>

                      {m.confidence > 0 && (
                        <>
                          <div className="w-px h-8 bg-[--color-sage-gray]"></div>
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (0.2 * i) + 0.2 }}
                            className="px-6 py-4 bg-[#C96B5B] text-white font-bold rounded-lg shadow-[4px_4px_0_0_var(--color-ivory)] border border-[--color-ivory] max-w-sm text-center"
                          >
                            <p className="text-xs uppercase tracking-wider mb-1 opacity-80">Identified Misconception</p>
                            <p className="text-lg">&quot;{m.misconception_id}&quot;</p>
                            <p className="text-xs mt-2 opacity-80 font-mono">Confidence: {Math.round(m.confidence * 100)}%</p>
                          </motion.div>
                        </>
                      )}
                    </div>
                 ))}
               </div>
               
             </div>

             <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
               <div>
                 <h3 className="font-bold text-xl mb-1">Recommended Action</h3>
                 <p className="text-[--color-sage-gray] text-sm">A 12-minute AI-generated remediation track focuses strictly on the identified block.</p>
               </div>
               <Link href="/student/practice" className="px-6 py-3 bg-[--color-amber] text-[#422006] font-bold rounded-lg hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--color-ivory)] transition-all shrink-0">
                 Start Remediation →
               </Link>
             </div>
          </div>

        </div>
      ) : (
        <p>No telemetry available.</p>
      )}

    </div>
  );
}
