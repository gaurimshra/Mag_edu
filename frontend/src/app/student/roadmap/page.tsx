import { SCIENCE_CURRICULUM } from "@/lib/curriculum";
import Link from "next/link";
import { BookOpen, CheckCircle } from "lucide-react";

export default function RoadmapPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>Learning Roadmap</h1>
        <p className="text-lg opacity-80" style={{ color: "var(--foreground)" }}>
          Your journey through the Class 10 Science curriculum.
        </p>
      </header>

      <div className="relative border-l-4 ml-6 space-y-12" style={{ borderColor: "var(--border)" }}>
        {SCIENCE_CURRICULUM.map((chapter) => (
          <div key={chapter.skill_id} className="relative pl-8">
            <div 
              className="absolute -left-[14px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 z-10"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--primary)" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
            </div>
            
            <div 
              className="p-6 rounded-2xl border transition-all hover:shadow-lg shadow-sm"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--primary)" }}>
                    Chapter {chapter.chapter}
                  </span>
                  <h2 className="text-2xl font-bold">{chapter.title}</h2>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold capitalize border"
                  style={{ 
                    backgroundColor: chapter.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.1)' : chapter.difficulty === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: chapter.difficulty === 'easy' ? '#166534' : chapter.difficulty === 'medium' ? '#854d0e' : '#991b1b',
                    borderColor: chapter.difficulty === 'easy' ? '#86efac' : chapter.difficulty === 'medium' ? '#fde047' : '#fca5a5'
                  }}
                >
                  {chapter.difficulty}
                </span>
              </div>
              
              <ul className="grid grid-cols-2 gap-2 mb-6">
                {chapter.topics.map((topic, i) => (
                  <li key={i} className="flex items-center text-sm opacity-80">
                    <CheckCircle className="w-4 h-4 mr-2" style={{ color: "var(--primary)" }} />
                    {topic}
                  </li>
                ))}
              </ul>
              
              <Link 
                href={`/student/practice/${chapter.skill_id}/quiz`}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-transform hover:scale-105 active:scale-95 text-white shadow-md hover:shadow-lg"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Start Chapter
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
