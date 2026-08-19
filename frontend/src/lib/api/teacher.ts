import { apiRequest } from "./client";

export interface ClassroomOverview {
  classroom_id: number;
  classroom_name: string;
  grade: number;
  subject: string;
  student_count: number;
  active_today: number;
  class_avg_mastery: number;
  at_risk_count: number;
  topics_mastered_total: number;
}

export interface HeatmapCell {
  student_id: number;
  student_name: string;
  skill_id: string;
  skill_name: string;
  mastery: number;
  gap_type: string;
}

export interface StudentRisk {
  student_id: number;
  name: string;
  pace: string;
  risk_level: string;
  risk_score: number;
  risk_reason: string;
  risk_action: string;
  lowest_mastery: number;
  weak_skills: string[];
  last_active: string;
}

export interface ClassWeakSpot {
  skill_id: string;
  skill_name: string;
  class_average: number;
  gap_type: string;
  student_count_weak: number;
}

export interface TeacherDashboard {
  overview: ClassroomOverview | null;
  heatmap: HeatmapCell[];
  alerts: StudentRisk[];
  weak_spots: ClassWeakSpot[];
}

export interface ClassroomInfo {
  id: number;
  name: string;
  grade: number;
  batch_code: string;
}

export interface CreateClassroomPayload {
  name: string;
  grade: number;
  subject: string;
}

export interface StudentListItem {
  id: number;
  name: string;
  email: string;
  mastery_avg: number;
  pace: string;
  last_active: string;
  risk_level: string;
  streak: number;
}

export async function getTeacherDashboard(classroom_id: number): Promise<TeacherDashboard> {
  return apiRequest<TeacherDashboard>(`/api/teacher/dashboard/${classroom_id}`);
}

export async function getClassrooms(): Promise<ClassroomInfo[]> {
  return apiRequest<ClassroomInfo[]>("/api/teacher/classrooms");
}

export async function createClassroom(payload: CreateClassroomPayload): Promise<{ message: string; batch_code: string }> {
  return apiRequest("/api/teacher/classroom", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getStudentList(classroom_id: number): Promise<StudentListItem[]> {
  return apiRequest<StudentListItem[]>(`/api/teacher/students/${classroom_id}`);
}
