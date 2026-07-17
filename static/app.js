const state = {
  students: [],
  skills: [],
  currentStudent: "s1",
  currentQuestion: null,
  questionStartedAt: Date.now(),
  hesitationCount: 0,
};

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function pct(value) {
  return `${Math.round(value * 100)}%`;
}

function gapClass(type) {
  return type === "critical" ? "critical" : type === "weak" ? "weak" : "strong";
}

async function init() {
  const boot = await api("/bootstrap");
  state.students = boot.students;
  state.skills = boot.skills;
  $("studentSelect").innerHTML = boot.students
    .map((student) => `<option value="${student.id}">${student.name} · Grade ${student.grade}</option>`)
    .join("");

  $("studentSelect").addEventListener("change", (event) => {
    state.currentStudent = event.target.value;
    loadStudent();
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  document.querySelectorAll(".mode-row button").forEach((button) => {
    button.addEventListener("click", () => loadRecommendation(button.dataset.mode));
  });

  $("diagnosticBtn").addEventListener("click", startDiagnostic);
  $("refreshTeacher").addEventListener("click", loadTeacher);
  $("uploadBtn").addEventListener("click", uploadContent);

  await loadStudent();
  await loadTeacher();
}

function switchView(view) {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
  if (view === "teacher") loadTeacher();
}

async function loadStudent() {
  const data = await api(`/student/${state.currentStudent}`);
  renderStudent(data);
}

function renderStudent(data) {
  const student = data.student;
  $("studentTitle").textContent = `${student.name}'s learning path`;
  $("streak").textContent = `${student.streak} days`;
  $("mastered").textContent = `${student.mastered_count}/${student.paths.length}`;
  $("accuracy").textContent = `${student.accuracy}%`;
  $("pace").textContent = `${student.pace} · ${Math.round(student.pace_score)}`;
  renderRecommendation(data.recommendation);
  renderPaths(student.paths);
  renderQuestion(data.questions.find((question) => question.skill_id === student.next_skill) || data.questions[0]);
}

function renderRecommendation(rec) {
  $("recommendTitle").textContent = rec.skill.name;
  $("difficultyBadge").textContent = `${rec.mode} · ${rec.difficulty} · ${pct(rec.mastery)}`;
  $("lessonBody").textContent = rec.body;
  $("sources").innerHTML = rec.sources.map((source) => `<span class="source-pill">${source}</span>`).join("");
}

async function loadRecommendation(mode) {
  const data = await api(`/student/${state.currentStudent}`);
  const skill = data.student.next_skill;
  const rec = await api("/recommend", {
    method: "POST",
    body: JSON.stringify({ student_id: state.currentStudent, skill_id: skill, mode }),
  });
  renderRecommendation(rec);
}

function renderPaths(paths) {
  $("paths").innerHTML = paths
    .map((path) => `
      <article class="path-row ${gapClass(path.gap_type)}">
        <div class="path-top">
          <strong>${path.name}</strong>
          <span>${path.subject} · ${pct(path.mastery)} · ${path.gap_type}</span>
        </div>
        <div class="progress"><span style="width: ${pct(path.mastery)}"></span></div>
      </article>
    `)
    .join("");
}

function renderQuestion(question) {
  state.currentQuestion = question;
  state.questionStartedAt = Date.now();
  state.hesitationCount = 0;
  $("quizBox").innerHTML = `
    <div class="question">${question.prompt}</div>
    <div class="options">
      ${question.options.map((option) => `<button class="option" data-answer="${option}">${option}</button>`).join("")}
    </div>
    <div id="feedback" class="feedback">Choose an answer to update the mastery map.</div>
  `;
  document.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("mouseenter", () => state.hesitationCount += 1);
    button.addEventListener("click", () => submitAnswer(button.dataset.answer));
  });
}

async function submitAnswer(answer) {
  const seconds = Math.max(2, (Date.now() - state.questionStartedAt) / 1000);
  const result = await api("/answer", {
    method: "POST",
    body: JSON.stringify({
      student_id: state.currentStudent,
      question_id: state.currentQuestion.id,
      answer,
      response_seconds: seconds,
      hesitation_count: state.hesitationCount,
    }),
  });
  $("feedback").textContent = result.correct
    ? `Correct. Mastery moved from ${pct(result.old_mastery)} to ${pct(result.new_mastery)}.`
    : `Not yet. Correct answer: ${result.answer}. Mastery moved from ${pct(result.old_mastery)} to ${pct(result.new_mastery)}.`;
  await loadStudent();
  await loadTeacher();
}

async function startDiagnostic() {
  const data = await api(`/diagnostic/start/${state.currentStudent}`, { method: "POST" });
  renderQuestion(data.questions[0]);
}

async function loadTeacher() {
  const data = await api("/teacher");
  renderHeatmap(data);
  renderAlerts(data.alerts);
  renderWeakSpots(data.weak_spots);
}

function renderHeatmap(data) {
  const header = `
    <div class="heat-row">
      <div class="heat-cell heat-label"></div>
      ${data.skills.map((skill) => `<div class="heat-cell heat-label">${skill.name}</div>`).join("")}
    </div>
  `;
  const rows = data.students.map((student) => `
    <div class="heat-row">
      <div class="heat-cell heat-label"><strong>${student.name}</strong><br>${student.pace}</div>
      ${data.skills.map((skill) => {
        const path = student.paths.find((item) => item.skill_id === skill.id);
        return `<div class="heat-cell heat-${path.gap_type}">${pct(path.mastery)}</div>`;
      }).join("")}
    </div>
  `).join("");
  $("heatmap").innerHTML = `<div class="heat-table">${header}${rows}</div>`;
}

function renderAlerts(alerts) {
  $("alerts").innerHTML = alerts.length
    ? alerts.map((student) => `
      <article class="alert-card">
        <strong><span class="risk-dot risk-${student.risk.level}"></span>${student.name} · ${student.risk.score}</strong>
        <p>${student.risk.reason}</p>
        <p class="muted">${student.risk.action}</p>
      </article>
    `).join("")
    : `<p class="muted">No active alerts.</p>`;
}

function renderWeakSpots(spots) {
  $("weakSpots").innerHTML = spots.slice(0, 6).map((spot) => `
    <article class="weak-row">
      <strong>${spot.name}</strong>
      <span>${spot.subject} · class average ${pct(spot.average)} · ${spot.gap_type}</span>
    </article>
  `).join("");
}

async function uploadContent() {
  const file = $("contentFile").files[0];
  if (!file) {
    $("uploadResult").textContent = "Choose a .txt file first.";
    return;
  }
  const form = new FormData();
  form.append("file", file);
  const result = await api("/ingest", { method: "POST", body: form });
  $("uploadResult").textContent = JSON.stringify(result, null, 2);
}

init().catch((error) => {
  document.body.innerHTML = `<pre>${error.stack || error.message}</pre>`;
});

