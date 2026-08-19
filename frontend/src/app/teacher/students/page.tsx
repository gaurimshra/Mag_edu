"use client";

import { useQuery } from "@tanstack/react-query";
import { getClassrooms, getStudentList } from "@/lib/api/teacher";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { SkeletonCard, EmptyState } from "@/components/ui";

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  
  const { data: classrooms, isLoading: loadingClassrooms } = useQuery({
    queryKey: ["classrooms"],
    queryFn: getClassrooms,
  });

  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);

  if (classrooms && classrooms.length > 0 && selectedClassroomId === null) {
    setSelectedClassroomId(classrooms[0].id);
  }

  const { data: students, isLoading: loadingStudents, isError } = useQuery({
    queryKey: ["students", selectedClassroomId],
    queryFn: () => getStudentList(selectedClassroomId!),
    enabled: !!selectedClassroomId,
  });

  const isLoading = loadingClassrooms || (!!selectedClassroomId && loadingStudents);

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
        <SkeletonCard className="h-16" />
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (isError) {
    return <div className="px-8 py-8 text-[#C92A2A]">Could not load students.</div>;
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#1A1C18]">Students</h1>
        
        {classrooms && classrooms.length > 1 && (
          <select 
            value={selectedClassroomId || ""}
            onChange={(e) => setSelectedClassroomId(Number(e.target.value))}
            className="bg-white border border-[#E4E3DE] rounded-[8px] px-3 py-2 text-sm font-medium text-[#1A1C18] focus:outline-none focus:border-[#3B5BDB]"
          >
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Search */}
      <div className="bg-white border border-[#E4E3DE] rounded-[8px] px-4 py-2.5 flex items-center gap-2 max-w-sm mt-6 shadow-sm focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB] transition-all">
        <Search size={16} className="text-[#9A9D94]" />
        <input 
          type="text" 
          placeholder="Search students..." 
          className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[#1A1C18] placeholder:text-[#9A9D94]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E3DE] rounded-[14px] overflow-hidden mt-6 shadow-sm">
        {filteredStudents.length === 0 ? (
          <div className="py-12">
            <EmptyState 
              icon={<Search size={24} className="text-[#1A1C18]" />}
              title={search ? "No students found" : "No students yet"}
              description={search ? "Try adjusting your search terms." : "Share your classroom code to invite students."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#F8F7F4] border-b border-[#E4E3DE]">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold text-[#6B6E66] uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[#6B6E66] uppercase tracking-wider">Mastery</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[#6B6E66] uppercase tracking-wider">Pace</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[#6B6E66] uppercase tracking-wider">Last Active</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[#6B6E66] uppercase tracking-wider">Risk</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F1EE]">
                {filteredStudents.map(student => {
                  const mastery = student.mastery_avg;
                  const barColor = mastery >= 75 ? "bg-[#2F9E44]" : mastery >= 50 ? "bg-[#3B5BDB]" : mastery >= 25 ? "bg-[#F08C00]" : "bg-[#C92A2A]";
                  
                  return (
                    <tr key={student.id} className="hover:bg-[#F8F7F4] transition-colors cursor-pointer group" onClick={() => {}}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center text-sm font-semibold shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1A1C18] truncate max-w-[150px]">{student.name}</p>
                            <p className="text-xs text-[#9A9D94] truncate max-w-[150px]">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-[#1A1C18] w-8 text-right">{mastery}%</span>
                          <div className="w-16 h-1.5 bg-[#F2F1EE] rounded-full overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${mastery}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {student.pace === "fast" ? (
                            <><TrendingUp size={14} className="text-[#2F9E44]" /><span className="text-xs text-[#1A1C18]">Fast</span></>
                          ) : student.pace === "slow" ? (
                            <><TrendingDown size={14} className="text-[#C92A2A]" /><span className="text-xs text-[#1A1C18]">Slow</span></>
                          ) : (
                            <><Minus size={14} className="text-[#6B6E66]" /><span className="text-xs text-[#1A1C18]">Moderate</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#6B6E66]">
                          {student.last_active !== "Never" ? new Date(student.last_active).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Never"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {student.risk_level === "high" ? (
                          <span className="bg-[#FFF5F5] text-[#C92A2A] rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">High</span>
                        ) : student.risk_level === "medium" ? (
                          <span className="bg-[#FFF3BF] text-[#E67700] rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Medium</span>
                        ) : (
                          <span className="bg-[#EBFBEE] text-[#2F9E44] rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Clear</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ChevronRight size={16} className="text-[#9A9D94] group-hover:text-[#1A1C18] inline-block transition-colors" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
