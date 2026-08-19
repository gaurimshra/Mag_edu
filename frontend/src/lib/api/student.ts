import { apiRequest } from "./client";

export interface MasteryScore {
  skill_id: string;
  score: number;
  attempts: number;
  correct: number;
  gap_type: string;
}

export interface StudentDashboard {
  student_id: number;
  name: string;
  grade: number;
  xp: number;
  streak: number;
  pace: string;
  pace_score: number;
  mastery: MasteryScore[];
  badges_earned: number;
  risk_level: string;
  risk_reason: string;
  next_skill_id: string;
  next_skill_name: string;
}

export interface LessonContent {
  skill_id: string;
  skill_name: string;
  mode: string;
  difficulty: string;
  mastery: number;
  content: Record<string, unknown>;
  sources: string[];
  session_id: number;
}

export interface AnswerPayload {
  session_id: number;
  question_id: string;
  skill_id: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  response_ms: number;
  hesitation_count: number;
}

export interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  mastery_before: number;
  mastery_after: number;
  xp_gained: number;
  badges_unlocked: string[];
  feedback: string;
}

export interface StudentProgress {
  total_sessions: number;
  total_questions: number;
  accuracy: number;
  avg_response_ms: number;
  streak: number;
  xp: number;
  mastery_by_skill: MasteryScore[];
  recent_activity: RecentSession[];
  mistake_categories: Record<string, number>;
}

export interface RecentSession {
  skill_id: string;
  skill_name: string;
  date: string;
  questions: number;
  accuracy: number;
  mode: string;
}

export interface DiagnosticQuestion {
  id: string;
  skill_id: string;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correct_index: number;
  difficulty: string;
}

export interface DiagnosticSubmitPayload {
  answers: Record<string, number>; // question_id -> selected_index
}

export interface DiagnosticResult {
  mastery_by_skill: Record<string, number>;
  strong_areas: string[];
  weak_areas: string[];
  recommended_start: string;
}

export async function getStudentDashboard(): Promise<StudentDashboard> {
  return apiRequest<StudentDashboard>("/api/student/dashboard");
}

export async function startLesson(skill_id: string, mode = "learn"): Promise<LessonContent> {
  return apiRequest<LessonContent>("/api/student/learn", {
    method: "POST",
    body: JSON.stringify({ skill_id, mode }),
  });
}

export async function submitAnswer(payload: AnswerPayload): Promise<AnswerResult> {
  return apiRequest<AnswerResult>("/api/student/answer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProgress(): Promise<StudentProgress> {
  return apiRequest<StudentProgress>("/api/student/progress");
}

export async function getDiagnosticQuestions(): Promise<DiagnosticQuestion[]> {
  return apiRequest<DiagnosticQuestion[]>("/api/student/diagnostic/questions");
}

export async function submitDiagnostic(payload: DiagnosticSubmitPayload): Promise<DiagnosticResult> {
  return apiRequest<DiagnosticResult>("/api/student/diagnostic/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export interface ChapterQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct_option: string;
}

export interface ChapterQuizResponse {
  questions: ChapterQuizQuestion[];
}

export interface QuizExplanation {
  question_id: string;
  correct_answer: string;
  student_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface QuizAnalysisResponse {
  weak_topics: string[];
  strong_topics: string[];
  overall_feedback: string;
  explanations: QuizExplanation[];
}

export async function generateChapterQuiz(skill_id: string): Promise<ChapterQuizResponse> {
  return apiRequest<ChapterQuizResponse>("/api/student/chapter_quiz/generate", {
    method: "POST",
    body: JSON.stringify({ skill_id }),
  });
}

export async function submitChapterQuiz(
  skill_id: string,
  answers: Record<string, string>,
  questions: ChapterQuizQuestion[]
): Promise<QuizAnalysisResponse> {
  return apiRequest<QuizAnalysisResponse>("/api/student/chapter_quiz/submit", {
    method: "POST",
    body: JSON.stringify({ skill_id, answers, questions }),
  });
}
