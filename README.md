# MagEdu

MagEdu is a hackathon-ready adaptive AI learning platform for K-12 students.
It personalizes lessons, quizzes, and practice by continuously tracking what
each student understands and where they are stuck.

## Problem

Most classrooms give every student the same content at the same pace. In
reality, students have different prerequisite gaps, confidence levels, and
learning speeds. A student struggling with linear equations may not need more
linear-equation practice first; they may need to repair a fractions gap.

## Solution

MagEdu builds a live skill map for each student. The platform:

- Runs a short diagnostic quiz to estimate starting mastery.
- Tracks topic mastery using Bayesian Knowledge Tracing style updates.
- Uses a prerequisite skill graph to find root-cause gaps.
- Retrieves syllabus-grounded learning content through a local RAG-style engine.
- Adapts the next action: teach, explain simpler, quiz, or give exercises.
- Gives teachers a heatmap, weak-topic summary, and at-risk alerts.

## Why It Is Adaptive

The learning path is not fixed during onboarding. Every session recomputes the
next best step from the current student state:

```text
student answers -> mastery updates -> pace updates -> next skill selected -> content retrieved -> lesson mode chosen
```

This keeps the student in the right zone: not bored by content they already
know, and not lost in content that depends on missing prerequisites.

## AI Components

- **Skill gap detector**: classifies each skill as critical, weak, or strong.
- **Prerequisite graph**: routes students backward when a root skill is missing.
- **RAG retrieval**: finds the best matching content for the current skill,
  grade, and difficulty.
- **Adaptive generator**: turns retrieved content into a lesson, simpler
  explanation, quiz, or exercise.
- **Risk engine**: combines mastery drops, inactivity, pace, and wrong-answer
  streaks into teacher-facing alerts.

The current version runs locally without paid API keys by using deterministic
generation over seeded content. It is structured so a real LLM and vector
database can be added later.

## Demo Flow

1. Open the student dashboard.
2. Pick a demo student such as Priya.
3. See the recommended skill and adaptive lesson.
4. Answer the checkpoint quiz.
5. Watch mastery and pace update.
6. Open the teacher dashboard.
7. See the class heatmap and alert state change.

## Tech Stack

- **Backend**: FastAPI
- **Frontend**: HTML, CSS, JavaScript
- **Adaptive engine**: Python
- **RAG prototype**: local content retrieval and re-ranking
- **Data**: in-memory demo store with seeded students, skills, questions, and content

## Project Structure

```text
app/
  main.py              FastAPI app entrypoint
  routes/api.py        API endpoints
  services/
    engine.py          mastery, pace, next-skill, and risk logic
    rag.py             local RAG-style retrieval and generation
    seed.py            demo curriculum, students, content, and questions
    store.py           application state and API orchestration
static/
  index.html           frontend shell
  styles.css           responsive UI
  app.js               student and teacher interactions
```

## Run Locally

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000
```

## API Endpoints

- `GET /api/bootstrap`
- `GET /api/student/{student_id}`
- `GET /api/teacher`
- `POST /api/diagnostic/start/{student_id}`
- `POST /api/answer`
- `POST /api/recommend`
- `POST /api/ingest`

## Hackathon Pitch

MagEdu is an adaptive AI tutor that does not just generate generic answers. It
tracks student mastery skill by skill, finds prerequisite gaps, adapts
difficulty in real time, and gives teachers a clear view of who needs help and
why.

The core innovation is combining a student knowledge model, prerequisite graph,
RAG-style grounded content retrieval, and teacher risk analytics into one
complete learning loop.

