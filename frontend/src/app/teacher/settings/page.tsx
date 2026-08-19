"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState("weekly");
  const [theme, setTheme] = useState("system");

  return (
    <div style={{ padding: "2rem", color: "var(--text)", maxWidth: "800px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Settings</h1>
      
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem"
      }}>
        
        {/* Notifications Section */}
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
            Notifications
          </h2>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>Student Alerts</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Receive immediate notifications for high-risk students.</div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "3.5rem", height: "1.75rem" }}>
              <input 
                type="checkbox" 
                checked={notifyAlerts} 
                onChange={(e) => setNotifyAlerts(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: notifyAlerts ? "var(--primary)" : "#ccc",
                transition: "0.4s", borderRadius: "34px"
              }}>
                <span style={{
                  position: "absolute", content: "''", height: "1.25rem", width: "1.25rem",
                  left: notifyAlerts ? "1.875rem" : "0.25rem", bottom: "0.25rem",
                  backgroundColor: "white", transition: "0.4s", borderRadius: "50%"
                }} />
              </span>
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>Email Digest</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>How often you want a summary of your classes.</div>
            </div>
            <select 
              value={emailDigest}
              onChange={(e) => setEmailDigest(e.target.value)}
              style={{
                padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)",
                background: "var(--background)", color: "var(--text)", fontSize: "0.875rem"
              }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
            Preferences
          </h2>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>Theme</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Choose your preferred color theme.</div>
            </div>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)",
                background: "var(--background)", color: "var(--text)", fontSize: "0.875rem"
              }}
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </section>
        
        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button style={{
            background: "var(--primary)",
            color: "white",
            border: "none",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: "500"
          }}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
