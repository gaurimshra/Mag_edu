"use client";

import { useAuth } from "@/lib/auth-context";
import StudentSidebar from "@/components/layout/StudentSidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <Spinner size="lg" className="text-[#3B5BDB]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1 md:ml-56 bg-[#F8F7F4] min-h-screen pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
