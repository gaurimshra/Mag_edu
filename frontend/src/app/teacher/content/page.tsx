"use client";

import React from "react";

export default function ContentPage() {
  return (
    <div style={{ padding: "2rem", color: "var(--text)" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Content Library</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Manage your teaching materials, videos, and worksheets.
      </p>
      
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "3rem",
        textAlign: "center"
      }}>
        <div style={{
          width: "4rem",
          height: "4rem",
          borderRadius: "50%",
          background: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem",
          border: "1px dashed var(--border)"
        }}>
          +
        </div>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No content yet</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Start building your curriculum by uploading files or creating new modules.
        </p>
        <button style={{
          background: "var(--primary)",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          fontWeight: "500"
        }}>
          Upload Content
        </button>
      </div>
    </div>
  );
}
