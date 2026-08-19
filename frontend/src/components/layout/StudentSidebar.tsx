"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Target,
  Trophy,
  Users,
  Bot,
  Map,
  Settings,
  LogOut,
  Activity,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const studentNav: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [{ href: "/student/dashboard", label: "Home", icon: <LayoutDashboard size={18} /> }],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { href: "/student/diagnosis", label: "Learning DNA", icon: <Network size={18} /> },
      { href: "/student/practice", label: "Diagnostic", icon: <Target size={18} /> },
      { href: "/student/ai-tutor", label: "Tutor Copilot", icon: <Bot size={18} /> },
    ],
  },
  {
    title: "KNOWLEDGE",
    items: [
      { href: "/student/roadmap", label: "Topology", icon: <Map size={18} /> },
      { href: "/student/achievements", label: "Milestones", icon: <Trophy size={18} /> },
    ],
  },
  {
    title: "NETWORK",
    items: [
      { href: "/student/classroom", label: "Cohort", icon: <Users size={18} /> },
    ],
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="hidden md:flex flex-col h-screen w-56 border-r border-[#111A16] bg-[--color-forest] text-[--color-ivory] fixed left-0 top-0 z-20"
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[--color-forest-green]">
        <Link href="/student/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 font-black uppercase text-[--color-forest] bg-[--color-amber] border border-[--color-charcoal] flex justify-center items-center rounded-sm shadow-[2px_2px_0_0_var(--color-charcoal)] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0_0_var(--color-charcoal)] transition-all">
            M
          </div>
          <span className="font-bold text-lg tracking-tight">MagEdu</span>
        </Link>
        <p className="text-xs text-[--color-sage] mt-2 tracking-widest font-bold uppercase">Learning Sys</p>
      </div>

      {/* Streak pill */}
      {user && (
        <div className="px-5 py-4 border-b border-[--color-forest-green]">
          <div className="flex items-center gap-2 bg-[#F1B24A]/20 border border-[--color-amber] rounded px-3 py-2 w-fit">
            <Activity size={14} className="text-[--color-amber]" />
            <span className="text-xs font-bold text-[--color-amber] uppercase tracking-wider">12 Day Streak</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {studentNav.map((section, i) => (
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

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[--color-forest-green] space-y-2 pb-6">
        <Link
          href="/student/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[--color-ivory] hover:bg-[--color-forest-green] transition-colors"
        >
          <Settings size={18} />
          Account Parameters
        </Link>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111A16] border border-[--color-forest-green]">
          <div className="w-8 h-8 bg-[--color-sage] border border-[--color-charcoal] flex items-center justify-center text-[--color-forest] text-xs font-bold rounded shadow-[2px_2px_0_0_var(--color-charcoal)]">
            {user?.name?.charAt(0) || "S"}
          </div>
          <span className="text-sm text-[--color-ivory] font-bold flex-1 truncate">{user?.name || "Student"}</span>
          <button
            onClick={logout}
            className="text-[--color-sage-gray] hover:text-[#C96B5B] transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
