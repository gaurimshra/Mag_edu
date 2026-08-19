"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChapterQuizQuestion,
  QuizAnalysisResponse,
  generateChapterQuiz,
  submitChapterQuiz,
} from "@/lib/api/student";
import { Button, Spinner } from "@/components/ui";
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Brain } from "lucide-react";

export default function ChapterQuizPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState<ChapterQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confidences, setConfidences] = useState<Record<string, number>>({});
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analysis, setAnalysis] = useState<QuizAnalysisResponse | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await generateChapterQuiz(chapterId);
        if (res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        } else {
          setError("Failed to generate quiz. The AI might be busy.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [chapterId]);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Submit answers and confidences
    try {
      const res = await submitChapterQuiz(chapterId, answers, questions);
      setAnalysis(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-[--color-ivory]">
        <Spinner size="lg" className="text-[--color-forest] mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-[--color-charcoal] mb-2 tracking-tight">Active Learning Inference...</h2>
        <p className="text-[--color-forest-green] max-w-md mx-auto">
          MagEdu is sampling your knowledge space. Generating consecutive diagnostic questions.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center mt-12 bg-[--color-ivory] card-brutal">
        <div className="w-16 h-16 bg-[#C96B5B]/20 text-[#C96B5B] rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[--color-charcoal] mb-2">Diagnostic Error</h2>
        <p className="text-[--color-forest-green] mb-6">{error}</p>
        <button className="px-6 py-2 bg-[--color-forest] text-[--color-ivory] rounded-lg font-bold" onClick={() => window.location.reload()}>Re-initialize</button>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
        <div className="text-center">
          <div className="w-16 h-16 bg-[--color-sage] text-[--color-forest] border-2 border-[--color-forest] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0_0_var(--color-charcoal)]">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[--color-charcoal] tracking-tight">Diagnostic Complete</h1>
          <p className="text-[--color-forest-green] mt-4 max-w-2xl mx-auto text-lg">{analysis.overall_feedback}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-brutal p-6 bg-[--color-surface]">
            <h3 className="font-bold text-[--color-charcoal] text-lg mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-[--color-forest] bg-[--color-sage]"></span>
              Confirmed Mastery
            </h3>
            <ul className="space-y-3">
              {analysis.strong_topics?.length > 0 ? (
                analysis.strong_topics.map((t, i) => (
                  <li key={i} className="text-[--color-charcoal] font-medium flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-[--color-sage]" /> {t}
                  </li>
                ))
              ) : (
                <li className="text-[--color-forest-green]">No high mastery baseline detected.</li>
              )}
            </ul>
          </div>
          
          <div className="card-brutal p-6 bg-[--color-surface]">
            <h3 className="font-bold text-[--color-charcoal] text-lg mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-[--color-charcoal] bg-[#C96B5B]"></span>
              Detected Gaps
            </h3>
            <ul className="space-y-3">
              {analysis.weak_topics?.length > 0 ? (
                analysis.weak_topics.map((t, i) => (
                  <li key={i} className="text-[--color-charcoal] font-medium flex items-center gap-3">
                    <XCircle size={16} className="text-[#C96B5B]" /> {t}
                  </li>
                ))
              ) : (
                <li className="text-[--color-forest-green] text-sm">No significant weak spots detected.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[--color-charcoal] pt-8 border-t border-[--color-sage-gray]">Telemetry & Remediation</h2>
          {analysis.explanations.map((exp, i) => {
            const originalQ = questions.find(q => q.id === exp.question_id);
            return (
              <div key={i} className={`card-brutal p-6 border-l-8 ${exp.is_correct ? 'border-l-[--color-sage]' : 'border-l-[#C96B5B]'}`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-[--color-forest] text-[--color-ivory] rounded-md border border-[--color-charcoal]">
                    Step {i + 1}
                  </span>
                  {exp.is_correct ? (
                    <span className="text-sm font-bold text-[--color-forest-green] flex items-center gap-1"><CheckCircle2 size={16}/> Accurate</span>
                  ) : (
                    <span className="text-sm font-bold text-[#C96B5B] flex items-center gap-1"><XCircle size={16}/> Misconception</span>
                  )}
                </div>
                <p className="text-xl font-bold text-[--color-charcoal] my-4 leading-tight">{originalQ?.question}</p>
                
                <div className="bg-[--color-ivory] border border-[--color-sage-gray] p-5 rounded-lg space-y-4 text-sm mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-[--color-sage-gray] rounded-md">
                      <span className="font-bold text-xs uppercase tracking-wider text-[--color-forest-green] block mb-1">State Vector</span>
                      <span className="font-bold text-[--color-charcoal]">{exp.student_answer || "Abandoned"}</span>
                    </div>
                    {!exp.is_correct && (
                      <div className="p-3 bg-[--color-sage]/20 border border-[--color-sage] rounded-md">
                        <span className="font-bold text-xs uppercase tracking-wider text-[--color-forest] block mb-1">Ground Truth</span>
                        <span className="font-bold text-[--color-forest]">{exp.correct_answer}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-[--color-sage-gray]">
                    <p className="font-bold flex items-center gap-2 text-[--color-forest] mb-2 uppercase tracking-tight">
                      <Brain size={16} /> Diagnostic Inference
                    </p>
                    <p className="text-[--color-charcoal] font-medium leading-relaxed">{exp.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 flex justify-center">
          <Button onClick={() => router.push("/student/practice")} size="lg">
            Return to Practice Hub
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const currentAnswer = answers[question?.id];
  const currentConfidence = confidences[question?.id];

  return (
    <div className="max-w-3xl mx-auto pt-16 px-6 pb-24 min-h-screen flex flex-col bg-[--color-ivory]">
      <div className="mb-12 flex items-center justify-between border-b-2 border-[--color-charcoal] pb-6">
        <button onClick={() => router.push("/student/practice")} className="text-[--color-forest] hover:text-[--color-amber] flex items-center gap-2 font-bold uppercase tracking-wider text-sm transition-colors">
          <ArrowLeft size={18} /> Abort Inference
        </button>
        <span className="text-lg font-black text-[--color-charcoal] bg-[--color-amber] px-4 py-2 border border-[--color-charcoal] shadow-[2px_2px_0_0_var(--color-charcoal)]">
          Node {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      <div className="flex-1 flex flex-col mt-4">
        <div key={question?.id} className="animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="mb-4">
            <span className="text-xs font-black tracking-widest text-[--color-forest] px-3 py-1 border border-[--color-forest] rounded uppercase">
              {question?.topic}
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[--color-charcoal] tracking-tight mb-12 leading-tight">
            {question?.question}
          </h2>

          <div className="space-y-4">
            {question?.options.map((opt, i) => {
              const isSelected = currentAnswer === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(question.id, opt)}
                  className={`w-full text-left p-5 rounded-lg border-2 transition-all duration-150 ${
                    isSelected
                      ? "border-[--color-forest] bg-[--color-forest] text-[--color-ivory] shadow-[4px_4px_0_0_var(--color-charcoal)] -translate-y-1"
                      : "border-[--color-charcoal] bg-white text-[--color-charcoal] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--color-charcoal)]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      {opt}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* CONFIDENCE CALIBRATION (Shown only after an answer is selected) */}
          {currentAnswer && (
            <div className="mt-12 p-6 border-2 border-[--color-amber] bg-[#F1B24A]/10 rounded-xl animate-fade-in">
              <h3 className="font-bold text-center text-[--color-charcoal] mb-4 uppercase tracking-widest text-sm">Calibration Check: How confident are you?</h3>
              <div className="flex justify-center gap-4 flex-wrap">
                <button 
                  onClick={() => setConfidences(prev => ({...prev, [question.id]: 25}))}
                  className={`px-4 py-2 font-bold border-2 rounded ${currentConfidence === 25 ? 'bg-[--color-charcoal] text-white border-[--color-charcoal]' : 'border-[--color-charcoal] text-[--color-charcoal] hover:bg-[--color-sage-gray]/20'}`}
                >Low</button>
                <button 
                  onClick={() => setConfidences(prev => ({...prev, [question.id]: 75}))}
                  className={`px-4 py-2 font-bold border-2 rounded ${currentConfidence === 75 ? 'bg-[--color-charcoal] text-white border-[--color-charcoal]' : 'border-[--color-charcoal] text-[--color-charcoal] hover:bg-[--color-sage-gray]/20'}`}
                >Medium</button>
                <button 
                  onClick={() => setConfidences(prev => ({...prev, [question.id]: 100}))}
                  className={`px-4 py-2 font-bold border-2 rounded ${currentConfidence === 100 ? 'bg-[--color-charcoal] text-white border-[--color-charcoal]' : 'border-[--color-charcoal] text-[--color-charcoal] hover:bg-[--color-sage-gray]/20'}`}
                >High</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="py-12 border-t-2 border-[--color-charcoal] mt-12 flex items-center justify-between">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0 || submitting}
          className="px-6 py-3 font-bold border-2 border-[--color-charcoal] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[--color-sage-gray]/20 transition-all text-[--color-charcoal]"
        >
          Previous
        </button>

        {isLast ? (
          <button 
            onClick={handleSubmit} 
            disabled={!currentAnswer || !currentConfidence || submitting}
            className="px-8 py-3 bg-[--color-forest] text-[--color-ivory] font-bold border-2 border-[--color-charcoal] rounded-lg shadow-[4px_4px_0_0_var(--color-charcoal)] disabled:opacity-50 disabled:shadow-none disabled:translate-y-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--color-charcoal)] transition-all"
          >
            {submitting ? "Analyzing..." : "Complete Node Inference"}
          </button>
        ) : (
          <button 
            onClick={handleNext} 
            disabled={!currentAnswer || !currentConfidence || submitting}
            className="px-8 py-3 bg-[--color-amber] text-[--color-charcoal] font-bold border-2 border-[--color-charcoal] rounded-lg shadow-[4px_4px_0_0_var(--color-charcoal)] disabled:opacity-50 disabled:shadow-none disabled:translate-y-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--color-charcoal)] transition-all flex items-center gap-2"
          >
            Next Node <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
