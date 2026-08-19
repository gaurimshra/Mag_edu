import { User, Bell, Shield, Moon, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>Settings</h1>
        <p className="text-lg opacity-80">Manage your account preferences and profile.</p>
      </header>

      <div 
        className="rounded-3xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="p-6 border-b flex items-center gap-4 bg-black/5" style={{ borderColor: "var(--border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
          <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
            <User className="w-8 h-8 opacity-50" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Student Name</h2>
            <p className="opacity-70 text-sm">student@magedu.com</p>
          </div>
          <button className="ml-auto px-4 py-2 bg-white border rounded-xl text-sm font-medium hover:bg-black/5 shadow-sm transition-all" style={{ borderColor: "var(--border)" }}>
            Edit Profile
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4" style={{ color: "var(--primary)" }}>Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-black/5 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 opacity-70" />
                  <span className="font-medium">Email Notifications</span>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-black/5 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 opacity-70" />
                  <span className="font-medium">Dark Mode</span>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4" style={{ color: "var(--primary)" }}>Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-black/5 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 opacity-70" />
                  <span className="font-medium">Show Profile to Classmates</span>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" defaultChecked />
              </div>
            </div>
          </section>

          <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button 
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
