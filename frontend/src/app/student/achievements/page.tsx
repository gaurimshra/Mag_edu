import { Trophy, Star, Medal, Zap, Award } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    { title: "Science Starter", desc: "Complete your first diagnostic test.", icon: Star, unlocked: true },
    { title: "Reaction Master", desc: "Score 100% on Chapter 1.", icon: Zap, unlocked: true },
    { title: "Acid Test Passed", desc: "Complete Chapter 2 practice.", icon: Trophy, unlocked: false },
    { title: "Biology Buff", desc: "Finish Life Processes.", icon: Medal, unlocked: false },
    { title: "Optics Expert", desc: "Master Light and Refraction.", icon: Award, unlocked: false },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>Achievements</h1>
          <p className="text-lg opacity-80">Track your learning milestones and badges.</p>
        </div>
        <div 
          className="p-4 rounded-2xl border text-center flex flex-col items-center justify-center shadow-sm"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <span className="text-sm font-bold uppercase tracking-wider opacity-70">Total XP</span>
          <span className="text-3xl font-extrabold" style={{ color: "var(--primary)" }}>1,250</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {achievements.map((achieve, i) => (
          <div 
            key={i} 
            className={`p-6 rounded-3xl border transition-all ${achieve.unlocked ? 'shadow-md hover:-translate-y-1 hover:shadow-lg' : 'opacity-60 grayscale'}`}
            style={{ 
              backgroundColor: "var(--surface)", 
              borderColor: achieve.unlocked ? "var(--primary)" : "var(--border)" 
            }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm"
              style={{ backgroundColor: achieve.unlocked ? "var(--primary)" : "var(--border)", color: achieve.unlocked ? "white" : "inherit" }}
            >
              <achieve.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">{achieve.title}</h3>
            <p className="text-sm opacity-70">{achieve.desc}</p>
            {achieve.unlocked && (
              <div className="mt-4 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                Unlocked
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
