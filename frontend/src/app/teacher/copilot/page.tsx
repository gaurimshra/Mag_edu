"use client";

import { useState } from "react";
import { Send, Sparkles, BrainCircuit, Activity, HelpCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api/client";

interface CopilotResult {
  primary_issue: string;
  at_risk_count: number;
  intervention_required: string;
  current_state: string;
  predicted_state: string;
}

export default function TeacherCopilotPage() {
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CopilotResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await apiRequest<CopilotResult>("/api/teacher/copilot-simulate", {
        method: "POST",
        body: JSON.stringify({ query })
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("AI failed to process request");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="space-y-4">
         <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase">MagEdu Intelligence</p>
         <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[--color-charcoal] lowercase">
           copilot<br />
           <span className="text-[--color-forest]">simulator.</span>
         </h1>
         <p className="text-xl text-[--color-forest-green] max-w-2xl text-balance">
           Query your entire classroom&apos;s telemetry in natural language. Simulate learning outcomes before assigning interventions.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Query Interface */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[--color-sage] to-[--color-forest] rounded-[14px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative card-brutal flex items-center p-2 bg-white">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 'Why is Class 10A struggling with Science?'"
                className="w-full bg-transparent border-0 outline-none px-4 py-3 text-lg font-medium text-[--color-charcoal] placeholder:text-[--color-sage-gray]"
              />
              <button 
                type="submit"
                disabled={analyzing || !query}
                className="p-4 bg-[--color-forest] text-[--color-ivory] rounded-lg shadow-[2px_2px_0_0_var(--color-charcoal)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0_0_var(--color-charcoal)] disabled:opacity-50 transition-all"
              >
                {analyzing ? <Sparkles className="animate-spin w-5 h-5"/> : <Send className="w-5 h-5"/>}
              </button>
            </div>
          </form>

          {/* Quick Prompts */}
          {!result && !analyzing && (
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setQuery("Simulate impact of diagnostic practice for failing students in 10A")} className="px-4 py-2 border border-[--color-sage-gray] rounded-full text-sm font-bold text-[--color-forest] bg-white hover:bg-[--color-ivory] transition-colors">
                Simulate practice impact
              </button>
              <button onClick={() => setQuery("Identify the root prerequisite gap in balancing equations")} className="px-4 py-2 border border-[--color-sage-gray] rounded-full text-sm font-bold text-[--color-forest] bg-white hover:bg-[--color-ivory] transition-colors">
                Identify root prerequisite gap
              </button>
            </div>
          )}

          {/* Analysis Result */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-brutal p-8 bg-[--color-ivory] text-[--color-charcoal] space-y-8"
              >
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-[--color-forest] flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4"/> Copilot Analysis Complete
                  </h2>
                  <p className="text-2xl font-bold leading-snug">
                    I analyzed the recent interactions. The primary issue is <span className="text-[#C96B5B] bg-[#C96B5B]/10 px-2 rounded">{result.primary_issue.toLowerCase()}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 bg-white border border-[--color-sage-gray] rounded-xl flex items-start gap-4">
                     <AlertTriangle className="w-8 h-8 text-[--color-amber]" />
                     <div>
                       <span className="block font-bold text-lg">{result.at_risk_count} At-Risk</span>
                       <span className="text-sm font-medium text-[--color-forest-green]">Students predicted to fail upcoming milestone</span>
                     </div>
                   </div>
                   <div className="p-4 bg-[--color-sage] text-[--color-forest] border border-[--color-forest] rounded-xl flex items-start gap-4 shadow-[4px_4px_0_0_var(--color-charcoal)]">
                     <BrainCircuit className="w-8 h-8" />
                     <div>
                       <span className="block font-bold text-lg">AI Resolution</span>
                       <span className="text-sm font-bold">{result.intervention_required}</span>
                     </div>
                   </div>
                </div>

                {/* Counterfactual Learning Simulator */}
                <div className="p-6 border-2 border-[--color-charcoal] rounded-xl bg-white mt-8 space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 bg-[--color-charcoal]">
                     <Activity size={100} />
                   </div>
                   
                   <h3 className="text-xl font-bold relative z-10">Counterfactual Simulator</h3>
                   
                   <div className="grid grid-cols-3 items-center gap-4 relative z-10 text-center">
                     <div>
                       <span className="block text-[--color-sage-gray] text-xs font-bold uppercase tracking-wider mb-2">Current State (Risk)</span>
                       <span className="text-3xl font-black text-[#C96B5B]">{result.current_state}</span>
                     </div>
                     <div className="flex justify-center">
                       <div className="bg-[--color-ivory] p-3 border border-[--color-forest] rounded-lg">
                          <span className="block text-[10px] font-black uppercase text-[--color-forest]">Intervention</span>
                          <span className="font-bold text-sm">Targeted Concept Explain</span>
                       </div>
                     </div>
                     <div>
                       <span className="block text-[--color-sage-gray] text-xs font-bold uppercase tracking-wider mb-2">Predicted State</span>
                       <span className="text-3xl font-black text-[--color-sage]">{result.predicted_state}</span>
                     </div>
                   </div>

                   <button className="w-full py-4 bg-[--color-forest] text-[--color-ivory] font-bold text-lg rounded-xl shadow-[4px_4px_0_0_var(--color-charcoal)] hover:translate-y-[2px] transition-all hover:shadow-[2px_2px_0_0_var(--color-charcoal)]">
                     Deploy Remediation Activity to Cohort
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Status */}
        <div className="space-y-6">
          <div className="card-brutal p-6 bg-[#164A41] text-[--color-ivory]">
            <h3 className="font-bold border-b border-[--color-sage-gray]/30 pb-3 mb-4 uppercase tracking-widest text-xs flex justify-between">
              System Status <span className="text-[--color-sage] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[--color-sage] animate-pulse-node"></span> Online</span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex justify-between items-center">
                <span className="opacity-80">Knowledge Graph</span>
                <span className="font-bold">Synchronized</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="opacity-80">LLM Engine</span>
                <span className="font-bold text-[--color-sage]">Live Active</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="opacity-80">BKT Model</span>
                <span className="text-[--color-amber] font-bold text-xs uppercase bg-[#F1B24A]/20 px-2 py-1 rounded">Updating</span>
              </li>
            </ul>
          </div>
          
          <div className="card-brutal p-6 bg-[--color-ivory]">
             <h3 className="font-bold mb-4 flex items-center gap-2 text-[--color-charcoal]">
               <HelpCircle size={18} /> Diagnostics
             </h3>
             <p className="text-sm font-medium text-[--color-forest-green]">
               The AI calculates predicted outcomes using <strong>Information Gain Heuristics</strong> via OpenAI / Gemini Large Language Models and the global Misconception Dictionary.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
