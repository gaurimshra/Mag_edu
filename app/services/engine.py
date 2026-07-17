from app.services.models import Skill, Student


def bkt_update(mastery: float, correct: bool) -> float:
    learn = 0.30
    slip = 0.10
    guess = 0.20
    mastery = max(0.01, min(0.99, mastery))

    if correct:
        evidence = mastery * (1 - slip)
        total = evidence + (1 - mastery) * guess
        posterior = evidence / total
    else:
        evidence = mastery * slip
        total = evidence + (1 - mastery) * (1 - guess)
        posterior = evidence / total

    updated = posterior + (1 - posterior) * learn
    return round(max(0.01, min(0.99, updated)), 3)


def gap_type(score: float) -> str:
    if score < 0.40:
        return "critical"
    if score < 0.65:
        return "weak"
    return "strong"


def choose_next_skill(student: Student, skills: list[Skill]) -> str:
    skill_map = {skill.id: skill for skill in skills}
    ranked = sorted(student.mastery.items(), key=lambda item: item[1])
    for skill_id, score in ranked:
        prereqs = skill_map[skill_id].prerequisites
        weak_prereq = next((pid for pid in prereqs if student.mastery.get(pid, 0) < 0.65), None)
        if weak_prereq:
            return weak_prereq
        if score < 0.75:
            return skill_id
    return ranked[0][0]


def difficulty_for(mastery: float) -> str:
    if mastery < 0.40:
        return "easy"
    if mastery < 0.70:
        return "medium"
    return "hard"


def update_pace(student: Student, correct: bool, seconds: float, hesitation_count: int) -> None:
    time_signal = 85 if seconds <= 5 else 45 if seconds <= 18 else 20
    streak_signal = 80 if correct and student.correct_streak >= 1 else 25 if not correct else 55
    hesitation_signal = max(10, 80 - hesitation_count * 15)
    new_signal = time_signal * 0.45 + streak_signal * 0.35 + hesitation_signal * 0.20
    student.pace_score = round(0.6 * student.pace_score + 0.4 * new_signal, 1)
    if student.pace_score <= 32:
        student.pace = "slow"
    elif student.pace_score >= 68 and student.correct_streak >= 2:
        student.pace = "fast"
    else:
        student.pace = "normal"


def risk_score(student: Student) -> dict:
    lowest = min(student.mastery.values())
    critical_count = len([score for score in student.mastery.values() if score < 0.40])
    weak_count = len([score for score in student.mastery.values() if score < 0.65])

    mastery_drop = 100 if lowest < 0.35 else max(0, int((0.60 - lowest) * 160))
    multi_gap = min(100, critical_count * 35 + max(0, weak_count - critical_count) * 10)
    inactivity = 100 if student.last_session_hours >= 120 else 55 if student.last_session_hours >= 48 else 0
    trajectory = 70 if student.pace == "slow" and student.wrong_streak else 20 if student.pace == "slow" else 0
    wrong_streak = min(100, student.wrong_streak * 35)

    score = (
        mastery_drop * 0.35
        + multi_gap * 0.25
        + inactivity * 0.20
        + trajectory * 0.12
        + wrong_streak * 0.08
    )
    level = "red" if score >= 70 else "amber" if score >= 40 else "clear"
    reason = "No intervention needed"
    action = "Continue the current path"
    if level != "clear":
        if lowest < 0.35:
            reason = "Core skill mastery dropped below 35%"
            action = "Assign an easier prerequisite explanation"
        elif critical_count >= 3:
            reason = "Multiple foundational gaps appeared together"
            action = "Run a catch-up session on prerequisites"
        elif student.last_session_hours >= 48:
            reason = "Student has not completed a session recently"
            action = "Reach out and restart with a short warm-up"
        else:
            reason = "Pace and wrong-answer streak suggest struggle"
            action = "Review the latest weak topic"

    return {
        "score": round(score, 1),
        "level": level,
        "reason": reason,
        "action": action,
        "signals": {
            "mastery_drop": mastery_drop,
            "multi_gap": multi_gap,
            "inactivity": inactivity,
            "trajectory": trajectory,
            "wrong_streak": wrong_streak,
        },
    }

