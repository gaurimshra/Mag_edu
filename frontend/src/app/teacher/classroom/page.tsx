"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

export default function ClassroomPage() {
  const [classrooms, setClassrooms] = useState<{id: number, name: string, grade: string, batch_code: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<{id: number, name: string, grade: string, batch_code: string}[]>("/api/teacher/classrooms");
        setClassrooms(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "2rem", color: "var(--text)" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Classrooms</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {classrooms.map((c) => (
            <div key={c.id} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{c.name}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Grade: {c.grade}</p>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Batch Code: <strong style={{ color: "var(--primary)" }}>{c.batch_code}</strong></p>
              <a href={`/teacher/dashboard?classroomId=${c.id}`} style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "var(--primary)",
                color: "white",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontSize: "0.875rem"
              }}>
                View Dashboard
              </a>
            </div>
          ))}
          {classrooms.length === 0 && <p>No classrooms found. Create one first!</p>}
        </div>
      )}
    </div>
  );
}
