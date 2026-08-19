"use client";

import { SCIENCE_CURRICULUM } from "@/lib/curriculum";
import { Lock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentLearnPage() {
  const [masteryData, setMasteryData] = useState<Record<string, number>>({});

  useEffect(() => {
    // We try to grab initial mastery if API data isn't ready
    try {
      const local = localStorage.getItem("magedu_initial_mastery");
      if (local) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMasteryData(JSON.parse(local));
      }
    } catch {}
  }, []);

  return (
    <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1C18]">Subjects</h1>
        <p className="text-sm text-[#6B6E66] mt-1">Choose a chapter to continue learning.</p>
      </div>

      {/* Science Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2F9E44]"></div>
            <h2 className="font-semibold text-[#1A1C18]">Science</h2>
          </div>
          <span className="bg-[#EBFBEE] text-[#2F9E44] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Class 10
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCIENCE_CURRICULUM.map((chapter) => {
            const mastery = masteryData[chapter.skill_id] || 0;
            return (
              <Link key={chapter.skill_id} href={`/student/learn/${chapter.skill_id}`} className="block group">
                <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-5 h-full transition-colors group-hover:border-[#C8C7C0] shadow-sm">
                  <p className="text-xs font-semibold text-[#9A9D94] uppercase tracking-wide">
                    Ch {chapter.chapter}
                  </p>
                  <h3 className="text-base font-semibold text-[#1A1C18] mt-1 leading-tight">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-[#6B6E66] mt-1.5 truncate">
                    {chapter.topics[0]}, {chapter.topics[1]}...
                  </p>
                  
                  <div className="mt-6">
                    <div className="h-1.5 bg-[#F2F1EE] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#2F9E44] transition-all duration-700" 
                        style={{ width: `${Math.round(mastery * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[10px] font-semibold text-[#9A9D94] uppercase tracking-wider">
                        {Math.round(mastery * 100)}% Mastered
                      </p>
                      <ChevronRight size={14} className="text-[#9A9D94] group-hover:text-[#1A1C18] transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mathematics Section (Locked) */}
      <div className="mt-12 opacity-75">
        <div className="bg-[#F8F7F4] border border-[#E4E3DE] rounded-[14px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={18} className="text-[#9A9D94]" />
            <h2 className="font-semibold text-[#9A9D94]">Mathematics</h2>
            <span className="bg-[#F2F1EE] text-[#9A9D94] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ml-auto">
              Coming soon
            </span>
          </div>
          <p className="text-sm text-[#9A9D94] mt-1 ml-7">
            Mathematics content for Class 10 will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
