"use client";

import { useQuery } from "@tanstack/react-query";
import { startLesson } from "@/lib/api/student";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { SCIENCE_CURRICULUM } from "@/lib/curriculum";
import Link from "next/link";
import { Button, Spinner } from "@/components/ui";
import { useState } from "react";

type LessonObjectContent = {
  lesson?: string;
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = typeof params.skillId === "string" ? params.skillId : "";
  const [showHelp, setShowHelp] = useState(false);
  
  const chapter = SCIENCE_CURRICULUM.find(c => c.skill_id === skillId) || SCIENCE_CURRICULUM[0];

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ["lesson", skillId],
    queryFn: () => startLesson(skillId, "learn"),
    enabled: !!skillId,
    retry: 1, // Don't retry too much if API is slow/down
  });

  // Extract the text content from the lesson
  let lessonText = "";
  if (lesson && lesson.content) {
    if (typeof lesson.content === 'string') {
      lessonText = lesson.content;
    } else if (typeof lesson.content === 'object') {
      // If it's a dict with a 'lesson' key
      const content = lesson.content as LessonObjectContent;
      if (typeof content.lesson === 'string') {
        lessonText = content.lesson;
      } else {
        // Fallback: try to stringify
        try {
          lessonText = JSON.stringify(lesson.content, null, 2);
        } catch {}
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-20">
      <Link href="/student/learn" className="inline-flex items-center gap-1 text-sm text-[#6B6E66] hover:text-[#1A1C18] transition-colors mb-6 font-medium">
        <ChevronLeft size={16} /> Back to Subjects
      </Link>

      <div className="mb-8">
        <span className="bg-[#EBFBEE] text-[#2F9E44] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          Ch {chapter.chapter}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1C18] mt-3">{chapter.title}</h1>
        <p className="text-sm text-[#6B6E66] mt-1.5">Science · Class 10</p>
      </div>

      <div className="bg-white border border-[#E4E3DE] rounded-[14px] p-6 md:p-8 shadow-sm">
        
        {/* Lesson outline */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-[#6B6E66] uppercase tracking-wider mb-4">In this lesson</h3>
          <div className="space-y-3">
            {chapter.topics.map((topic, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-xs font-bold text-[#9A9D94] mt-0.5 w-4">{String(idx + 1).padStart(2, '0')}</span>
                <p className="text-sm text-[#1A1C18] leading-relaxed font-medium">{topic}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-[#F2F1EE] w-full mb-8"></div>

        {/* Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Spinner size="lg" className="text-[#3B5BDB]" />
            <p className="text-sm font-medium text-[#6B6E66] animate-pulse">Preparing your personalized lesson...</p>
          </div>
        ) : isError || !lessonText ? (
          <div className="space-y-4">
            <p className="text-sm text-[#1A1C18] leading-relaxed">
              We&apos;re having trouble loading the full lesson content right now. 
              Please review the topics listed above in your textbook, or try again later.
            </p>
            <div className="bg-[#F8F7F4] p-4 rounded-[8px] text-xs font-mono text-[#6B6E66]">
              Study Guide: Focus on understanding {chapter.topics.join(", and ")}.
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-[#1A1C18] leading-relaxed">
            {/* Split by double newline to create paragraphs */}
            {lessonText.split('\n\n').map((para, i) => {
              if (!para.trim()) return null;
              // Very basic markdown formatting for bold text
              const formattedPara = para.split('**').map((part, j) => 
                j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
              );
              return <p key={i} className="mb-4 text-[15px]">{formattedPara}</p>;
            })}
          </div>
        )}

        {/* Sources */}
        {!isLoading && lesson?.sources && lesson.sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[#F2F1EE]">
            <p className="text-xs font-semibold text-[#9A9D94] uppercase tracking-wider mb-2">Sources</p>
            <ul className="text-xs text-[#6B6E66] space-y-1">
              {lesson.sources.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Did this make sense? */}
      {!isLoading && (
        <div className="mt-8 px-2">
          <p className="text-sm text-[#1A1C18] font-semibold mb-3">Did this make sense?</p>
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              onClick={() => router.push(`/student/practice?skill=${skillId}`)}
            >
              Yes, let&apos;s practice
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowHelp(true)}
            >
              I need more help
            </Button>
          </div>

          {showHelp && (
            <div className="bg-[#FFF3BF] border border-[#F08C00]/20 rounded-[10px] p-5 mt-4 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-[#E67700]" />
                <p className="text-sm font-semibold text-[#E67700]">What would help clarify this?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Simpler explanation", "Show an example", "Give me a hint", "Explain the prerequisite"].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => router.push(`/student/ai-tutor?q=${encodeURIComponent(opt + ' for ' + chapter.title)}`)}
                    className="bg-white border border-[#E4E3DE] text-[#1A1C18] text-xs font-medium px-3 py-1.5 rounded-[8px] hover:border-[#F08C00] transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
