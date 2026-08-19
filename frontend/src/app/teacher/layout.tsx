"use client";

import { useAuth } from "@/lib/auth-context";
import TeacherSidebar from "@/components/layout/TeacherSidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "teacher")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <Spinner size="lg" className="text-[#2F9E44]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <TeacherSidebar />
      <main className="flex-1 md:ml-56 bg-[#F8F7F4] min-h-screen">
        {children}
      </main>
    </div>
  );
}
