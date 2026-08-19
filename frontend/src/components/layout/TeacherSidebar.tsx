"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  UserSearch,
  ClipboardList,
  BarChart3,
  AlertCircle,
  BookOpen,
  Settings,
  LogOut,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem { href: string; label: string; icon: React.ReactNode; }
interface NavSection { title?: string; items: NavItem[]; }

const teacherNav: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/teacher/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { href: "/teacher/classroom", label: "Classrooms", icon: <Users size={18} /> },
    ],
  },
  {
    title: "STUDENTS",
    items: [
      { href: "/teacher/students", label: "All Students", icon: <UserSearch size={18} /> },
      { href: "/teacher/alerts", label: "At-Risk Students", icon: <AlertCircle size={18} /> },
    ],
  },
  {
    title: "TEACHING",
    items: [
      { href: "/teacher/assignments", label: "Assignments", icon: <ClipboardList size={18} /> },
      { href: "/teacher/content", label: "Content", icon: <BookOpen size={18} /> },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { href: "/teacher/copilot", label: "AI Simulator", icon: <BrainCircuit size={18} /> },
      { href: "/teacher/reports", label: "Reports", icon: <BarChart3 size={18} /> },
    ],
  },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col h-screen w-56 bg-[--color-forest] text-[--color-ivory] border-r border-[#111A16] fixed left-0 top-0 z-20">
      <div className="px-5 py-6 border-b border-[--color-forest-green]">
        <Link href="/teacher/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 font-black uppercase text-[--color-forest] bg-[--color-amber] border border-[--color-charcoal] flex justify-center items-center rounded-sm shadow-[2px_2px_0_0_var(--color-charcoal)] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0_0_var(--color-charcoal)] transition-all">
            M
          </div>
          <span className="font-bold text-lg tracking-tight">MagEdu</span>
        </Link>
        <p className="text-xs text-[--color-sage] mt-2 tracking-widest font-bold uppercase">Intelligence Sys</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {teacherNav.map((section, i) => (
          <div key={i}>
            {section.title && (
              <p className="px-3 py-1 mb-1 text-[10px] font-black text-[--color-sage-gray] tracking-widest uppercase">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 font-medium",
                      active
                        ? "bg-[--color-amber] text-[--color-charcoal] border border-[--color-charcoal] shadow-[2px_2px_0_0_var(--color-charcoal)] font-bold"
                        : "text-[--color-ivory] hover:bg-[--color-forest-green] border border-transparent hover:border-transparent"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-[--color-forest-green] space-y-2 pb-6">
        <Link
          href="/teacher/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[--color-ivory] hover:bg-[--color-forest-green] transition-colors"
        >
          <Settings size={18} />
          System Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111A16] border border-[--color-forest-green]">
          <div className="w-8 h-8 bg-[--color-sage] border border-[--color-charcoal] flex items-center justify-center text-[--color-forest] text-xs font-bold rounded shadow-[2px_2px_0_0_var(--color-charcoal)]">
            {user?.name?.charAt(0) || "T"}
          </div>
          <span className="text-sm font-bold flex-1 truncate">{user?.name || "Teacher"}</span>
          <button onClick={logout} className="text-[--color-sage-gray] hover:text-[#C96B5B] transition-colors" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
