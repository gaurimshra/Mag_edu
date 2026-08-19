"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Target, TrendingUp, BookOpen, GraduationCap, ArrowRight, Brain } from "lucide-react";
import { Spinner } from "@/components/ui";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "student") router.push("/student/dashboard");
      else if (user.role === "teacher") router.push("/teacher/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Spinner size="lg" className="text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans selection:bg-[var(--secondary)] selection:text-[var(--foreground)] overflow-x-hidden">
      
      {/* ── Hero Section (Reference Aesthetic) ── */}
      <section className="relative min-h-[90vh] bg-[var(--primary)] flex flex-col md:flex-row overflow-hidden">
        
        {/* Navigation - Absolute over the Hero */}
        <nav className="absolute top-0 left-0 w-full z-50">
          <div className="px-6 md:px-12 py-8 flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] shadow-sm">
                <GraduationCap size={18} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[var(--primary-foreground)] text-lg tracking-[0.2em] uppercase">MagEdu</span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/login" className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--primary-foreground)] hover:text-[var(--accent)] transition-colors hidden md:block">
                Sign in
              </Link>
              <Link href="/signup" className="group flex items-center gap-3 border-2 border-[var(--accent)] rounded-full pl-5 pr-2 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all">
                Get started
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] group-hover:bg-[var(--primary-foreground)] group-hover:text-[var(--primary)] transition-colors">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              </Link>
            </div>
          </div>
        </nav>

        {/* Left Side: Content */}
        <div className="w-full md:w-[45%] pt-40 md:pt-0 flex flex-col justify-center px-6 md:px-12 xl:px-24 relative z-20">
          <p className="text-[var(--accent)] font-bold text-xs tracking-[0.3em] uppercase mb-4 animate-slide-in" style={{ animationDelay: '100ms' }}>
            Adaptive Learning
          </p>
          <h1 className="text-[var(--primary-foreground)] text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[1.05] animate-slide-in" style={{ animationDelay: '200ms' }}>
            Learn <br />
            Smarter.
          </h1>
          <p className="text-[var(--primary-foreground)] opacity-80 mt-8 max-w-sm text-base md:text-lg font-medium leading-relaxed animate-slide-in" style={{ animationDelay: '300ms' }}>
            The fascinating and amazing world of adaptive education, requiring very little maintenance. Every session moves you forward.
          </p>

          {/* Reference Button Style */}
          <div className="mt-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Link href="/signup" className="inline-flex items-center gap-4 border-2 border-[var(--accent)] rounded-full pl-8 pr-3 py-2 hover:bg-[var(--accent)] group transition-all duration-300">
              <span className="text-[var(--primary-foreground)] text-sm font-bold uppercase tracking-[0.15em] group-hover:text-[var(--accent-foreground)] transition-colors">
                Start Now
              </span>
              <div className="w-12 h-12 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--secondary-foreground)] shadow-lg group-hover:scale-105 transition-transform">
                <Brain size={20} strokeWidth={2.5} />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Side: Graphic/Shapes */}
        <div className="w-full md:w-[55%] h-[50vh] md:h-auto relative mt-16 md:mt-0 flex items-end md:items-center justify-center">
          {/* Large Vertical Text inspired by reference */}
          <div className="hidden xl:block absolute left-[-40px] top-1/2 -translate-y-1/2 -rotate-90 origin-center z-10 mix-blend-overlay">
            <span className="text-[12rem] font-bold text-white opacity-20 tracking-tighter uppercase leading-none">
              MAGEDU
            </span>
          </div>

          {/* Curved Secondary Shape */}
          <div className="absolute bottom-0 right-0 w-[90%] md:w-[85%] h-[80%] md:h-[90%] bg-[var(--secondary)] rounded-tl-[100px] md:rounded-tl-[200px] z-10 flex items-center justify-center p-8 overflow-hidden">
             
             {/* Decorative circles */}
             <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-[var(--primary)] opacity-20 rounded-full" />
             <div className="absolute top-[20%] left-[20%] w-48 h-48 border border-[var(--primary)] opacity-10 rounded-full" />
             
             <div className="relative z-20 text-center max-w-md animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="w-24 h-24 mx-auto bg-white rounded-[32px] rotate-12 flex items-center justify-center shadow-2xl mb-8">
                  <Target size={48} className="text-[var(--primary)] -rotate-12" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--foreground)] uppercase tracking-wide">AI-Powered Focus</h3>
                <p className="mt-4 text-[var(--foreground)] opacity-70 font-medium">
                  We analyze every answer to build a personalized map of your knowledge, adapting the curriculum in real-time.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-32 relative z-20 bg-[var(--background)]">
        <div className="text-center mb-20">
          <p className="text-[var(--primary)] font-bold text-xs tracking-[0.2em] uppercase mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight uppercase">
            A Natural Learning Loop
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Feature 1 */}
          <div className="group bg-[var(--surface)] border border-[var(--border)] rounded-[40px] p-10 hover:border-[var(--primary)] hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 rounded-[24px] bg-[var(--secondary)] flex items-center justify-center text-[var(--secondary-foreground)] mb-8 group-hover:scale-110 transition-transform duration-300">
              <Target size={28} strokeWidth={2} />
            </div>
            <h3 className="font-bold text-[var(--foreground)] text-xl uppercase tracking-wide">Find Your Level</h3>
            <p className="text-[var(--foreground)] opacity-60 mt-4 leading-relaxed font-medium">
              A diagnostic assessment maps your current knowledge and identifies exactly where to start your journey.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-[var(--surface)] border border-[var(--border)] rounded-[40px] p-10 hover:border-[var(--primary)] hover:shadow-2xl transition-all duration-300 translate-y-0 md:translate-y-8">
            <div className="w-16 h-16 rounded-[24px] bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] mb-8 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={28} strokeWidth={2} />
            </div>
            <h3 className="font-bold text-[var(--foreground)] text-xl uppercase tracking-wide">Grow Organically</h3>
            <p className="text-[var(--foreground)] opacity-60 mt-4 leading-relaxed font-medium">
              Every answer you give refines your path. The more you practice, the smarter the platform gets.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-[var(--surface)] border border-[var(--border)] rounded-[40px] p-10 hover:border-[var(--primary)] hover:shadow-2xl transition-all duration-300 translate-y-0 md:translate-y-16">
            <div className="w-16 h-16 rounded-[24px] bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] mb-8 group-hover:scale-110 transition-transform duration-300">
              <BookOpen size={28} strokeWidth={2} />
            </div>
            <h3 className="font-bold text-[var(--foreground)] text-xl uppercase tracking-wide">Master Concepts</h3>
            <p className="text-[var(--foreground)] opacity-60 mt-4 leading-relaxed font-medium">
              Mistakes are tracked and turned into focused practice — so you improve exactly where you need to.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA / Footer ── */}
      <section className="bg-[var(--primary)] relative overflow-hidden rounded-t-[60px] md:rounded-t-[120px] mt-20">
        
        {/* Decorative shape */}
        <div className="absolute top-0 right-0 w-[50%] h-[200%] bg-[var(--accent)] rounded-l-full translate-x-1/2 opacity-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 py-32 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--primary-foreground)] uppercase">
            Ready to grow?
          </h2>
          <p className="text-[var(--primary-foreground)] opacity-80 mt-6 font-medium text-lg max-w-xl mx-auto">
            Join thousands of students and teachers already using MagEdu to make learning a natural process.
          </p>
          
          <div className="mt-12">
            <Link href="/signup" className="inline-flex items-center gap-4 border-2 border-[var(--accent)] rounded-full pl-8 pr-3 py-2 hover:bg-[var(--accent)] group transition-all duration-300">
              <span className="text-[var(--primary-foreground)] text-sm font-bold uppercase tracking-[0.15em] group-hover:text-[var(--accent-foreground)] transition-colors">
                Start for free
              </span>
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] shadow-lg group-hover:scale-105 transition-transform">
                <ArrowRight size={20} strokeWidth={2.5} />
              </div>
            </Link>
          </div>
        </div>

        <footer className="border-t border-[var(--primary-foreground)]/10 py-10 px-6 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)]">
              <GraduationCap size={12} strokeWidth={3} />
            </div>
            <span className="font-bold text-[var(--primary-foreground)] text-sm tracking-[0.2em] uppercase">MagEdu</span>
          </div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--primary-foreground)] opacity-40">
            © 2026 Adaptive Learning
          </p>
        </footer>
      </section>

    </div>
  );
}
