"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { Plus, X, Calendar, BookOpen } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  classroom_name: string;
  due_date: string;
  status: string;
  completion_rate: number;
}

interface Classroom {
  id: number;
  name: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ classroom_id: "", title: "", skill_id: "ch01.chemical_reactions", due_date: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [assnRes, classRes] = await Promise.all([
        apiRequest<Assignment[]>("/api/teacher/assignments"),
        apiRequest<Classroom[]>("/api/teacher/classrooms")
      ]);
      setAssignments(assnRes);
      setClassrooms(classRes);
      if (classRes.length > 0) {
        setForm(f => ({ ...f, classroom_id: classRes[0].id.toString() }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest("/api/teacher/assignments", {
        method: "POST",
        body: JSON.stringify({
          classroom_id: parseInt(form.classroom_id),
          title: form.title,
          skill_id: form.skill_id,
          due_date: new Date(form.due_date).toISOString()
        })
      });
      setShowModal(false);
      void load();
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header section */}
      <div className="space-y-4 flex flex-col md:flex-row md:justify-between md:items-end">
        <div>
          <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase">Coursework</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[--color-charcoal] lowercase">
            active<br />
            <span className="text-[--color-forest]">assignments.</span>
          </h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="mt-6 md:mt-0 px-6 py-3 bg-[--color-amber] text-[#422006] font-bold rounded-lg hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--color-ivory)] transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Create Assignment
        </button>
      </div>

      {loading ? (
        <p className="text-[--color-sage-gray]">Loading coursework...</p>
      ) : (
        <div className="grid gap-6">
          {assignments.map((a) => (
            <div key={a.id} className="card-brutal p-6 bg-[--color-ivory] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[--color-forest]">{a.title}</h3>
                <div className="flex items-center gap-4 text-sm font-medium text-[--color-sage-gray]">
                  <span className="flex items-center gap-1 bg-[#111A16] px-2 py-1 rounded text-[--color-ivory] text-xs">
                    <BookOpen size={14} /> {a.classroom_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Due: {new Date(a.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-[--color-sage-gray]">Completion</span>
                  <div className="text-3xl font-black text-[--color-forest]">
                    {Math.round(a.completion_rate * 100)}%
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${a.status === 'Active' ? 'bg-[--color-sage] text-[--color-forest]' : 'bg-[#C96B5B]/20 text-[#C96B5B]'}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <p className="py-12 text-center text-lg text-[--color-sage-gray] font-medium border-2 border-dashed border-[--color-sage] rounded-3xl">
              No assignments found. Time to push some coursework!
            </p>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111A16]/80 backdrop-blur-sm">
          <div className="bg-[--color-ivory] rounded-2xl p-8 max-w-md w-full card-brutal shadow-[8px_8px_0_0_var(--color-charcoal)] relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[--color-sage-gray] hover:text-[#C96B5B] transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-[--color-forest] mb-6 lowercase">new <span className="text-[--color-charcoal]">assignment.</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[--color-sage-gray] mb-2">Classroom</label>
                <select 
                  className="w-full p-3 rounded-lg border border-[--color-sage] bg-white font-medium focus:ring-2 focus:ring-[--color-amber] outline-none"
                  value={form.classroom_id} onChange={e => setForm({...form, classroom_id: e.target.value})} required
                >
                  <option value="">Select Class...</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[--color-sage-gray] mb-2">Title</label>
                <input 
                  type="text" className="w-full p-3 rounded-lg border border-[--color-sage] bg-white font-medium focus:ring-2 focus:ring-[--color-amber] outline-none"
                  placeholder="e.g. Chapter 1 Quiz"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[--color-sage-gray] mb-2">Skill Focus</label>
                <select 
                  className="w-full p-3 rounded-lg border border-[--color-sage] bg-white font-medium focus:ring-2 focus:ring-[--color-amber] outline-none"
                  value={form.skill_id} onChange={e => setForm({...form, skill_id: e.target.value})} required
                >
                  <option value="ch01.chemical_reactions">Chemical Reactions</option>
                  <option value="ch01.balancing_equations">Balancing Equations</option>
                  <option value="ch01.types_of_reactions">Types of Reactions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[--color-sage-gray] mb-2">Due Date</label>
                <input 
                  type="datetime-local" className="w-full p-3 rounded-lg border border-[--color-sage] bg-white font-medium focus:ring-2 focus:ring-[--color-amber] outline-none"
                  value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={submitting}
                  className="w-full py-4 bg-[--color-forest] text-[--color-ivory] font-bold rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--color-charcoal)] transition-all disabled:opacity-50"
                >
                  {submitting ? "Pushing..." : "Assign to Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
