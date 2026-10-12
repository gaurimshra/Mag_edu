# 🧠 MagEdu — The Intelligence System for Predictive Learning

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-336791.svg?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic%20AI-orange.svg)](https://langchain-ai.github.io/langgraph/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini%20(Fallback)-412991.svg?logo=openai&logoColor=white)](https://openai.com/)

> **MagEdu** is a production-grade, agentic AI predictive learning platform for Class 10 Science & Mathematics (NCERT/CBSE). Instead of acting as a reactive scorekeeper, MagEdu replaces traditional letter grades with a dynamic **Cognitive Architecture**: utilizing **Bayesian Knowledge Tracing (BKT)**, **LangGraph multi-node state machines**, **vector-embedded RAG over NCERT textbooks**, and a **Counterfactual Teacher Copilot** capable of simulating classroom interventions in real time.

---

## 📑 Table of Contents
1. [The Problem Statement](#-the-problem-statement)
2. [The MagEdu Solution](#-the-mag-edu-solution)
3. [Key Features](#-key-features)
   - [Student Experience (The Practice & DNA Hub)](#1-student-experience)
   - [Teacher Command Center (Telemetry & Copilot)](#2-teacher-command-center)
4. [Agentic AI Architecture](#-agentic-ai-architecture)
   - [LangGraph State Machine](#langgraph-state-machine)
   - [Dynamic Assessment & Misconception Diagnostics](#dynamic-assessment--misconception-diagnostics)
   - [Closed-Loop Cognitive Memory](#closed-loop-cognitive-memory)
   - [Teacher Counterfactual Simulator](#teacher-counterfactual-simulator)
5. [System Design & Architecture](#-system-design--architecture)
   - [High-Level Topology](#high-level-topology)
   - [Database Schema (Relational + Vector)](#database-schema)
6. [Technology Stack & AI Models](#-technology-stack--ai-models)
7. [Engineering Insights & Learnings](#-engineering-insights--learnings)
8. [Step-by-Step Setup & How to Run](#-step-by-step-setup--how-to-run)
   - [Prerequisites](#prerequisites)
   - [Environment Configuration](#environment-configuration)
   - [Backend Setup](#1-backend-setup)
   - [Database Migration & Seeding](#2-database-migration--seeding)
   - [NCERT Textbook Vector Ingestion](#3-ncert-textbook-vector-ingestion)
   - [Frontend Setup](#4-frontend-setup)
   - [Docker Compose (All-in-One)](#5-docker-compose-all-in-one)
9. [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
10. [Application Health & Verification Status](#-application-health--verification-status)

---

## 🎯 The Problem Statement

Traditional EdTech platforms treat education as a blunt binary: **Pass or Fail**.
- A student answers incorrectly, the software records a red "X", and an analytics dashboard reports: *"Student is scoring 42% in Science."*
- **The Core Flaw:** This scorekeeper approach provides zero diagnostic insight into **why** the student struggled. 
  - Was it a **foundational prerequisite gap** (e.g., missing prior understanding of ionic charges)?
  - Was it an **uncalibrated guess** (answered in 2 seconds with low confidence)?
  - Was it a **deep-seated conceptual misconception** (believing mass disappears in open chemical reactions)?
  - Was it a simple **arithmetic or calculation slip**?
- **The Educator Gap:** Overworked teachers managing 40+ students per batch lack the time and granular telemetry to isolate individual cognitive blockers. They cannot predict what will happen before assigning homework, leading to reactive firefighting rather than proactive intervention.

---

## 💡 The MagEdu Solution

MagEdu abandons static letter grades and replaces them with an **Organic Cognitive Learning Architecture**:

```
[Student Interaction] ──► [Telemetry & Confidence Capture]
                                   │
                                   ▼
             [Bayesian Knowledge Tracing (BKT) Engine]
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
[Student Learning DNA]                             [Teacher Risk Matrix]
 • 5-Axis Cognitive Radar                            • Predictive Early Warning
 • Misconception Dependency Graph                    • Counterfactual Simulation Copilot
 • Socratic RAG-Tutor Guidance                       • Targeted Granular Interventions
```

1. **Granular Telemetry & Confidence Calibration:** Every quiz attempt tracks response time (ms), hesitation count, and subjective confidence (25% / 75% / 100%). High confidence coupled with an incorrect answer immediately flags a **High-Risk Conceptual Misconception** rather than a casual mistake.
2. **Deterministic Bayesian Mastery (BKT):** Real-time skill mastery probability ($0.01 \le P(L) \le 0.99$) computed via Bayes' theorem without relying on non-deterministic LLMs for score calculations.
3. **Curriculum-Grounded RAG (NCERT Class 10):** Prevents AI hallucinations by grounding all tutor explanations and generated quizzes in chunked, vector-indexed NCERT Class 10 textbooks.
4. **Counterfactual Teacher Copilot:** Natural language assistant allowing teachers to simulate hypothetical scenarios (e.g., *"What happens to Class 10A if I assign a 15-minute diagnostic on Chemical Reactions to the bottom quartile?"*) before assigning coursework.

---

## ✨ Key Features

### 1. Student Experience
- **Organic Academic Design System:** Built with an organic, neo-brutalist aesthetic using warm ivory tones (`#F8F7F4`), deep forest greens (`#111A16`), and botanical accents.
- **Visual Learning DNA (Radar & Topology):** Visualizes the student's cognitive state across 5 core dimensions: *Knowledge Mastery, Confidence Calibration, Pace & Speed, Accuracy,* and *Retention*.
- **Interactive Practice Hub & 15-Question Chapter Diagnostics:** Dynamic chapter quizzes generated on the fly. Distractors (wrong options) are intentionally tailored to challenge the student's recorded historical mistakes.
- **Socratic AI Tutor:** An empathetic AI tutor that guides students using the Socratic method rather than providing direct answers, strictly grounded in textbook excerpts.
- **Adaptive Gamification:** Daily streak counters, dynamic XP gain, mastery badges (*First Shot, On Fire, Topic Master, Chapter Champion*), and class leaderboards.

### 2. Teacher Command Center
- **Classroom Mastery Heatmap:** Bird's-eye matrix tracking every student across every curriculum topic, color-coded by mastery gap (*Critical, Weak, Developing, Strong*).
- **Predictive Risk Alerts:** Real-time early warning system flagging students at risk (*Red / Amber / Clear*) based on pace decay, inactivity, consecutive wrong answers, and mastery drop.
- **Counterfactual Intervention Simulator:** Natural-language copilot allowing educators to query classroom outcomes and receive structured predictive shift estimates.
- **Coursework & Assignment Manager:** Create targeted assignments linked to granular skills, track completion rates, and assign remedial pathways with single-click actions.

---

## 🤖 Agentic AI Architecture

MagEdu implements a stateful, cyclic AI workflow using **LangGraph**, **Pydantic structured output models**, and a **closed-loop memory store**.

```
                           ┌────────────────────────┐
                           │      START (State)     │
                           └───────────┬────────────┘
                                       │
                                       ▼
                           ┌────────────────────────┐
                           │      assess_node       │
                           │  Map BKT to Difficulty │
                           └───────────┬────────────┘
                                       │
                                       ▼
                           ┌────────────────────────┐
                           │       route_node       │
                           │    (Conditional Edge)  │
                           └───────────┬────────────┘
         ┌──────────────┬──────────────┼──────────────┬──────────────┐
         ▼              ▼              ▼              ▼              ▼
 ┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
 │generate_     ││generate_     ││generate_     ││generate_     ││analyze_quiz_ │
 │lesson_node   ││simpler_node  ││quiz_node     ││chapter_quiz_ ││results_node  │
 │(RAG + Memory)││(Remedial)    ││(1 Question)  ││node (15 Qs)  ││(Diagnostic)  │
 └───────┬──────┘└──────┬───────┘└──────┬───────┘└──────┬───────┘└──────┬───────┘
         └──────────────┴──────────────┼──────────────┴──────────────┘
                                       ▼
                           ┌────────────────────────┐
                           │       END (State)      │
                           └────────────────────────┘
```

### LangGraph State Machine
The core workflow is governed by `StudentState`:
```python
class StudentState(TypedDict):
    student_id: int
    skill_id: str
    skill_name: str
    mode: str                  # "teach" | "quiz" | "simpler" | "chapter_quiz" | "analyze_quiz"
    grade: int
    mastery_score: float       # BKT probability (0.01 - 0.99)
    difficulty_level: str      # "easy" | "medium" | "hard"
    mistake_patterns: list     # Historical error memory
    recent_sessions: list
    rag_context: list          # Top-k retrieved NCERT chunks
    generated_content: Any
    steps: list[str]
```

### Dynamic Assessment & Misconception Diagnostics
1. **`generate_chapter_quiz_node`:**
   - Ingests top-k NCERT chunks for the selected chapter.
   - Cross-references the student's historical mistake patterns.
   - Generates 15 balanced multiple-choice questions with targeted distractors designed to expose specific misconceptions.
2. **`analyze_quiz_results_node`:**
   - Evaluates the student's answer set alongside question metadata and reported confidence.
   - Isolates confident incorrect responses to extract confirmed misconceptions.
   - Emits structured output: `weak_topics`, `strong_topics`, `overall_feedback`, `explanations`, `identified_misconceptions`, and `recommended_interventions`.

### Closed-Loop Cognitive Memory
- Every mistake is categorized into one of three behavioral types:
  - **Conceptual:** Fundamental lack of understanding of underlying principles.
  - **Calculation:** Correct methodology with arithmetic/procedural failure.
  - **Careless:** Rapid response time with high hesitation or misreading.
- Stored in the `mistake_patterns` database table and automatically reinjected into future prompt contexts (e.g., *"Student has historically made 3 conceptual mistakes regarding exothermic vs. endothermic reactions. Address this specific distinction gently."*).

### Teacher Counterfactual Simulator
- Accessible via `/api/teacher/copilot-simulate`.
- Ingests active student telemetry, current class risk alerts, and teacher intervention prompts.
- Emits a structured prediction detailing `primary_issue`, `at_risk_count`, `intervention_required`, `current_state`, and `predicted_state`.

---

## 🏗️ System Design & Architecture

### High-Level Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / BROWSER                              │
│                                                                         │
│   ┌──────────────────────────────┐     ┌────────────────────────────┐   │
│   │   Student Portal (/student)  │     │  Teacher Portal (/teacher) │   │
│   │   • Learning DNA & Radar     │     │  • Class Mastery Heatmap   │   │
│   │   • 15-Q Diagnostic Quiz     │     │  • Predictive Risk Alerts  │   │
│   │   • Socratic AI Chat Tutor   │     │  • Counterfactual Copilot  │   │
│   └──────────────┬───────────────┘     └─────────────┬──────────────┘   │
└──────────────────┼───────────────────────────────────┼──────────────────┘
                   │  Next.js 16 (React 19 / TypeScript)
                   │  REST JSON Client (`apiRequest`)
                   ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND SERVICE (Python 3.11+)               │
│                                                                         │
│   ┌────────────────────┐ ┌────────────────────┐ ┌───────────────────┐   │
│   │    Auth Router     │ │   Student Router   │ │  Teacher Router   │   │
│   │  JWT + Role Guards │ │ /learn /quiz /dna  │ │ /heatmap /copilot │   │
│   └────────────────────┘ └─────────┬──────────┘ └─────────┬─────────┘   │
│                                    │                      │             │
│   ┌────────────────────────────────▼──────────────────────▼─────────┐   │
│   │                    CORE BUSINESS LOGIC SERVICES                 │   │
│   │  • bkt.py (Bayesian Tracing)   • gamification.py (XP, Streaks)  │   │
│   │  • risk.py (Multi-factor Risk) • memory.py (Misconception Store)│   │
│   └────────────────────────────────┬────────────────────────────────┘   │
│                                    │                                    │
│   ┌────────────────────────────────▼────────────────────────────────┐   │
│   │                      AI ORCHESTRATION LAYER                     │   │
│   │  • LangGraph State Machine (nodes.py, graph.py)                 │   │
│   │  • Resilient Dual-LLM Gateway (Gemini 1.5 Flash ↔ GPT-4o-mini)  │   │
│   │  • RAG Embedding & Retrieval (HuggingFace API + pgvector)       │   │
│   └────────────────────────────────┬────────────────────────────────┘   │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │ Async SQLAlchemy + asyncpg
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  PERSISTENCE: POSTGRESQL 16 + PGVECTOR                  │
│                                                                         │
│   ┌───────────────────────┐ ┌───────────────────────┐ ┌─────────────┐   │
│   │ Users & Classrooms    │ │ Student Profiles & XP │ │ Content     │   │
│   │ • users               │ │ • student_profiles    │ │ Chunks      │   │
│   │ • classrooms          │ │ • mastery_scores      │ │ (Vector 384)│   │
│   │ • classroom_members   │ │ • quiz_attempts       │ │             │   │
│   │ • assignments         │ │ • misconceptions      │ │             │   │
│   └───────────────────────┘ └───────────────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Schema

| Table Name | Primary Purpose | Key Fields |
|---|---|---|
| `users` | Role-based authentication (`student`, `teacher`, `admin`) | `id`, `name`, `email`, `password_hash`, `role`, `created_at` |
| `classrooms` | Teacher-managed cohorts and batches | `id`, `name`, `grade`, `subject`, `batch_code`, `teacher_id` |
| `classroom_members` | Join table mapping students to classrooms | `id`, `classroom_id`, `student_id`, `joined_at` |
| `student_profiles` | Student learning state, pacing, and gamification | `user_id`, `grade`, `xp`, `streak`, `pace` (`slow`/`normal`/`fast`), `pace_score`, `last_active` |
| `mastery_scores` | Bayesian mastery state per skill | `id`, `student_id`, `skill_id`, `score` ($0.01-0.99$), `attempts`, `correct` |
| `quiz_attempts` | Telemetry logs for every question answered | `id`, `student_id`, `skill_id`, `response_ms`, `hesitation_count`, `confidence_level`, `is_correct`, `mastery_before`, `mastery_after` |
| `student_misconceptions` | Detected cognitive blockers | `id`, `student_id`, `skill_id`, `misconception_id`, `confidence`, `incidences` |
| `assignments` | Coursework issued by teachers | `id`, `classroom_id`, `teacher_id`, `title`, `skill_id`, `due_date` |
| `content_chunks` | Ingested NCERT curriculum with vector embeddings | `id`, `source_file`, `chapter_num`, `chapter_title`, `topic`, `difficulty`, `body`, `embedding` (vector 384) |
| `badges` / `student_badges` | Gamification rewards and unlocked achievements | `id`, `student_id`, `badge_id`, `earned_at` |

---

## 🛠️ Technology Stack & AI Models

### 1. Frontend Technologies
- **Next.js 16.3.1 (App Router & Turbopack):** Modern server and client components with fast build times.
- **React 19.2.8 & TypeScript 5:** Strict type safety across UI components and API contracts.
- **Tailwind CSS v4:** Custom Neo-Brutalist & Botanical theme featuring ivory backgrounds, forest greens, and solid brutalist borders.
- **Recharts 3.10.1:** Renders dynamic 5-axis cognitive radar charts and classroom performance graphs.
- **Framer Motion 13.1.0:** Micro-animations for quiz transitions, badge celebrations, and mastery rings.
- **TanStack React Query 5.101.4:** Client-side cache synchronization and optimistic updates.
- **Lucide React:** Iconography system.

### 2. Backend Technologies
- **FastAPI 0.111.0 & Uvicorn 0.30.1:** Asynchronous Python web framework with ASGI server.
- **SQLAlchemy 2.0.30 (asyncio + asyncpg):** Asynchronous ORM with non-blocking database queries.
- **Alembic 1.13.1:** Database migration tracking.
- **Pydantic v2 & Pydantic-Settings:** Data parsing, environment validation, and strict JSON schema generation.
- **PyJWT & Passlib (Bcrypt):** Secure stateless authentication and password hashing.
- **PyMuPDF (`fitz` 1.24.4):** High-speed PDF parser for extracting NCERT curriculum text.

### 3. Artificial Intelligence & Cognitive Models
| Model / Engine | Purpose | Implementation Details |
|---|---|---|
| **Google Gemini 1.5 Flash** | Primary Generative LLM | Utilized for lesson generation, quiz creation, diagnostic evaluation, and copilot simulation with native `response_schema` JSON outputs. |
| **OpenAI GPT-4o-mini** | Resilient Fallback LLM | Automatic failover triggered if Gemini encounters rate limits or service unavailability. |
| **HuggingFace Inference API** (`sentence-transformers/all-MiniLM-L6-v2`) | Textbook Dense Embeddings | Produces 384-dimensional dense float vectors. Free cloud inference with zero local GPU overhead. |
| **PostgreSQL `pgvector`** | Vector Storage & Similarity Search | Cosine distance search (`ORDER BY embedding <=> CAST(:query AS vector)`) with relational SQL pre-filters. |
| **Bayesian Knowledge Tracing (BKT)** | Cognitive Mastery Modeling | Deterministic mathematical engine updating skill probabilities based on $P(L_0)=0.5$, $P(T)=0.30$, $P(S)=0.10$, and $P(G)=0.20$. |

---

## 🧠 Engineering Insights & Learnings

1. **Deterministic BKT vs. LLM Estimation:**
   - *Problem:* Using LLMs to directly judge whether a student has "mastered" a subject is non-deterministic, slow, and expensive.
   - *Solution:* Decoupled mastery calculations from the LLM. Bayesian Knowledge Tracing handles mathematical probabilities deterministically in sub-millisecond execution times, while the LLM is reserved for contextual explanation, question authoring, and Socratic tutoring.
2. **Confidence Calibration as a Diagnostic Lever:**
   - *Problem:* Traditional quizzes treat wrong answers equally, ignoring lucky guesses and confident blunders.
   - *Solution:* By capturing student confidence levels (25% / 75% / 100%), MagEdu differentiates between **knowledge voids** (low confidence + incorrect) and **firm misconceptions** (high confidence + incorrect). The latter receives urgent remediation priority.
3. **Multi-Model Fallback Architecture:**
   - *Problem:* Free-tier LLM endpoints can occasionally hit rate-limit spikes or network timeouts during live demonstrations.
   - *Solution:* Built a dual-provider gateway in `llm.py`. The system attempts Gemini 1.5 Flash first and seamlessly switches to OpenAI `gpt-4o-mini` if any exception occurs.
4. **Zero-GPU Cloud Cost Optimization:**
   - Instead of hosting heavy embedding and inference models on expensive GPU instances, MagEdu combines the free HuggingFace Inference API with PostgreSQL `pgvector`, enabling a production-grade RAG pipeline at zero infrastructure cost.

---

## 🚀 Step-by-Step Setup & How to Run

### Prerequisites
- **Node.js:** v18.18+ or v20+
- **Python:** v3.11+
- **PostgreSQL:** v15+ with `pgvector` extension enabled (or a free [Supabase](https://supabase.com) account)
- **Git**

---

### Environment Configuration

Create a `.env` file inside `backend/` (or copy from `.env.example`):

```env
# Database (PostgreSQL with pgvector or Supabase connection string)
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/magedu

# Supabase (Optional if running local Postgres)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Gateway Keys
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key       # Optional fallback
HF_API_KEY=your-huggingface-api-key     # Optional (improves HF inference rate limits)

# Security
JWT_SECRET=super-secret-magedu-token-key-change-me
```

In `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 1. Backend Setup

```bash
# Navigate to backend
cd d:/magedu/backend

# Create virtual environment (if not already present)
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 2. Zero-Config Database & Auto-Seeding

MagEdu features a **multi-dialect database architecture** supporting **SQLite (local zero-config)**, **MySQL**, and **PostgreSQL with pgvector**.

By default, the application runs on a local SQLite database (`magedu.db`) requiring **zero external database installations**:
- Tables, skills, badges, classrooms, and demo personas are **automatically initialized and seeded** on backend startup!
- The system includes a custom `VectorType` abstraction:
  - On PostgreSQL: Leverages native `pgvector` indexing and SQL operators (`<=>`).
  - On SQLite & MySQL: Serializes embeddings into fast JSON structures with vectorized Python cosine similarity retrieval.

If you wish to re-seed or populate all 10 student personas, teacher classroom cohorts, and mastery scores manually:
```bash
python seed_script.py
```

To switch to MySQL or PostgreSQL, simply update `DATABASE_URL` in `backend/.env`:
```env
# SQLite (Default - Zero Config)
DATABASE_URL=sqlite+aiosqlite:///./magedu.db

# MySQL
DATABASE_URL=mysql+aiomysql://root:password@localhost:3306/magedu

# PostgreSQL (with pgvector)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/magedu
```

---

### 3. NCERT Textbook Vector Ingestion (Optional)

MagEdu includes 10 chapters of NCERT Class 10 Science in the `science_10th_book/` directory. Chunks can be embedded directly into your active database:

```bash
python scripts/ingest_ncert.py
```
*This extracts text using PyMuPDF, chunks the syllabus into 500-token sections, generates embeddings via HuggingFace, and populates the `content_chunks` table.*

---

### 4. Running the Application

#### Start the Backend (Port 8000)
```bash
# Inside backend directory with venv activated:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation (Swagger UI): **http://localhost:8000/docs**
- Health Check: **http://localhost:8000/health**

#### Start the Frontend (Port 3000)
```bash
# Inside frontend directory:
npm run dev
```
- Web Application: **http://localhost:3000**

---

## ⚡ 1-Click Instant Demo Mode (No Passwords Required!)

For presentations and rapid evaluation, **no credentials or manual typing are required**. Both the **Landing Page** and the **Login Page** feature instant one-click launch buttons:

<div align="center">

| Button | Persona | Role | Pre-Loaded Context |
|---|---|---|---|
| 🎓 **Demo as Student** | **Aarav Sharma** | Student (Class 10A) | 1250 XP, 7-day streak, Chapter 1 mastery, personalized learning plan |
| 👩‍🏫 **Demo as Teacher** | **Mrs. Sharma** | Teacher (Science Dept) | Class 10th A & 10th B cohorts, 10 tracked students, cognitive state matrix, 2 at-risk student intervention alerts |

</div>

Simply visit **http://localhost:3000/login** and click **"Student Demo"** or **"Teacher Demo"** to immediately access the respective live dashboard.

*(Manual logins are also supported for `teacher@school.edu` and `student1@school.edu` through `student10@school.edu` with password `password123`.)*

---

## 🔍 Application Health & Verification Status

| Component | Status | Verification Details |
|---|---|---|
| **Frontend UI (Next.js 16)** | ✅ **Healthy** | TypeScript compiles cleanly (`tsc --noEmit`). Turbopack dev server tested with full end-to-end browser subagent automation. |
| **Backend Core (FastAPI)** | ✅ **Healthy** | ASGI server running on port 8000. `/health` responds with HTTP 200 `{"status": "ok", "version": "2.0.0"}`. |
| **Instant Demo Mode** | ✅ **Operational** | `/api/auth/demo-login` verified via live automated browser session. Instant JWT issuance and redirect to both Student and Teacher dashboards tested. |
| **Database & Seeding** | ✅ **Active & Verified** | Multi-dialect engine configured with SQLite/MySQL/PostgreSQL support. Auto-seeding verified with 11 users, 2 classrooms, 5 skills, 4 badges, and 10 student personas. |
| **LangGraph Agent** | ✅ **Healthy** | Multi-node state machine (`assess`, `route`, `generate_lesson`, `generate_simpler`, `generate_quiz`, `generate_chapter_quiz`, `analyze_quiz_results`) compiled with conditional routing. |

---

<div align="center">
  <sub>Built with ❤️ for AI-native education. Designed for Class 10 Science & Mathematics.</sub>
</div>
