import { apiRequest } from "./client";

export interface LoginPayload { email: string; password: string; }
export interface SignupTeacherPayload { name: string; email: string; password: string; }
export interface SignupStudentPayload { name: string; email: string; password: string; batch_code: string; }

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatar_url?: string;
  classroom_id?: number;
}

export interface TokenResponse {
  access_token: string;
  user_id: number;
  name: string;
  email: string;
  role: string;
  classroom_id?: number;
}

export interface ClassroomPreview {
  name: string;
  grade: string;
  teacher_name: string;
  subject: string;
  batch_code: string;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function demoLogin(role: "student" | "teacher"): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/auth/demo-login", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function signupTeacher(payload: SignupTeacherPayload): Promise<{ message: string }> {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ ...payload, role: "teacher" }),
  });
}

export async function signupStudent(payload: SignupStudentPayload): Promise<{ message: string }> {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ ...payload, role: "student" }),
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/auth/me");
}

export async function previewClassroom(batch_code: string): Promise<ClassroomPreview> {
  return apiRequest<ClassroomPreview>(`/api/auth/classroom-preview?code=${batch_code}`);
}
