import { Users, GraduationCap, Calendar } from "lucide-react";

export default function ClassroomPage() {
  const classmates = [
    { name: "Aarav Sharma", status: "Online" },
    { name: "Diya Patel", status: "Offline" },
    { name: "Kabir Singh", status: "In a Quiz" },
    { name: "Ananya Gupta", status: "Online" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>My Classroom</h1>
          <p className="text-lg opacity-80 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Class 10th A
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-70">Teacher</p>
          <p className="font-semibold text-lg">Mrs. Verma</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="col-span-2 p-6 rounded-3xl border shadow-sm"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: "var(--primary)" }} />
            Upcoming Assignments
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border flex justify-between items-center hover:bg-black/5 transition-colors" style={{ borderColor: "var(--border)" }}>
                <div>
                  <h3 className="font-semibold">Science Mock Test {i + 1}</h3>
                  <p className="text-sm opacity-70">Due in {i + 2} days</p>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-6 rounded-3xl border shadow-sm"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: "var(--primary)" }} />
            Classmates
          </h2>
          <ul className="space-y-4">
            {classmates.map((student, i) => (
              <li key={i} className="flex justify-between items-center">
                <span className="font-medium">{student.name}</span>
                <span 
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ 
                    backgroundColor: student.status === 'Online' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.05)',
                    color: student.status === 'Online' ? '#166534' : 'inherit'
                  }}
                >
                  {student.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
