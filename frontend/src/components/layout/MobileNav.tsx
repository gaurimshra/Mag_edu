"use client";

import Link from "next/link";
import { BookOpen, Target, TrendingUp, Bot, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/student/dashboard", label: "Home", icon: <Home size={20} /> },
  { href: "/student/learn", label: "Learn", icon: <BookOpen size={20} /> },
  { href: "/student/practice", label: "Practice", icon: <Target size={20} /> },
  { href: "/student/progress", label: "Progress", icon: <TrendingUp size={20} /> },
  { href: "/student/ai-tutor", label: "Tutor", icon: <Bot size={20} /> },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E3DE] z-30 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-3 rounded-lg transition-colors min-w-[56px]",
                active ? "text-[#1A1C18]" : "text-[#9A9D94] hover:text-[#6B6E66]"
              )}
            >
              {item.icon}
              <span className={cn("text-[10px] font-medium", active ? "text-[#1A1C18]" : "text-[#9A9D94]")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
