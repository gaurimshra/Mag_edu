"""
Bayesian Knowledge Tracing (BKT) engine.

BKT models the probability that a student has mastered a skill,
updating after each correct or incorrect answer using Bayes' theorem.

Parameters (from config):
  L  = P(learned) — current mastery estimate
  G  = P(guess)   — P(correct | not learned)
  S  = P(slip)    — P(incorrect | learned)
  T  = P(transit) — P(learn this trial | not previously learned)
"""

from app.core.config import get_settings

settings = get_settings()

# BKT parameters (configurable via .env)
_LEARN = settings.bkt_learn_rate   # 0.30
_SLIP = settings.bkt_slip_rate     # 0.10
_GUESS = settings.bkt_guess_rate   # 0.20


def bkt_update(mastery: float, correct: bool) -> float:
    """
    Update mastery probability after one answer.

    Returns the new mastery float (0.01 – 0.99).
    """
    mastery = max(0.01, min(0.99, mastery))

    if correct:
        # P(correct AND learned) / P(correct)
        evidence = mastery * (1 - _SLIP)
        total = evidence + (1 - mastery) * _GUESS
        posterior = evidence / total if total > 0 else mastery
    else:
        # P(incorrect AND learned) / P(incorrect)
        evidence = mastery * _SLIP
        total = evidence + (1 - mastery) * (1 - _GUESS)
        posterior = evidence / total if total > 0 else mastery

    # Apply learning transition
    updated = posterior + (1 - posterior) * _LEARN
    return round(max(0.01, min(0.99, updated)), 4)


def gap_type(score: float) -> str:
    """Classify mastery score into gap category."""
    if score < 0.40:
        return "critical"
    if score < settings.weak_threshold:
        return "weak"
    if score < settings.mastery_threshold:
        return "developing"
    return "strong"


def difficulty_for(mastery: float) -> str:
    """Map mastery score to appropriate content difficulty."""
    if mastery < 0.35:
        return "easy"
    if mastery < 0.65:
        return "medium"
    return "hard"


def choose_next_skill(
    mastery_map: dict[str, float],
    skill_catalog: list[dict],
) -> str:
    """
    Choose the next skill to study.

    Priority:
    1. Skills with unmet prerequisites (fix foundation first)
    2. Skills with lowest mastery (biggest gap = highest urgency)
    3. Fall back to first skill if all are mastered
    """
    skill_map = {s["id"]: s for s in skill_catalog}

    # Build set of mastered skills
    mastered = {sid for sid, score in mastery_map.items() if score >= settings.mastery_threshold}

    # Filter: skills where all prerequisites are met
    eligible = []
    for skill in skill_catalog:
        prereqs = [p.strip() for p in skill.get("prerequisites", "").split(",") if p.strip()]
        if all(p in mastered for p in prereqs):
            eligible.append(skill["id"])

    if not eligible:
        eligible = [s["id"] for s in skill_catalog]

    # Among eligible, return the one with lowest mastery
    ranked = sorted(
        eligible,
        key=lambda sid: mastery_map.get(sid, 0.0),
    )

    # Skip already mastered
    for sid in ranked:
        if mastery_map.get(sid, 0.0) < settings.mastery_threshold:
            return sid

    return ranked[0]  # all mastered — loop back to first


def update_pace(
    pace_score: float,
    correct: bool,
    response_ms: int,
    hesitation_count: int,
    correct_streak: int,
) -> tuple[float, str]:
    """
    Update the pace score composite signal and derive pace label.

    Returns: (new_pace_score, pace_label)
    """
    # Time signal: faster = higher score
    if response_ms < 5_000:
        time_signal = 85
    elif response_ms < 18_000:
        time_signal = 55
    else:
        time_signal = 20

    # Streak signal
    if correct and correct_streak >= 2:
        streak_signal = 85
    elif correct:
        streak_signal = 60
    else:
        streak_signal = 25

    # Hesitation signal
    hesitation_signal = max(10, 80 - hesitation_count * 15)

    # Weighted composite
    new_signal = (
        time_signal * 0.45
        + streak_signal * 0.35
        + hesitation_signal * 0.20
    )

    # Exponential moving average (smoothed)
    new_score = round(0.60 * pace_score + 0.40 * new_signal, 2)

    if new_score <= 32:
        label = "slow"
    elif new_score >= 68 and correct_streak >= 2:
        label = "fast"
    else:
        label = "normal"

    return new_score, label


def risk_score(
    mastery_map: dict[str, float],
    last_active_hours: float,
    pace: str,
    wrong_streak: int,
) -> dict:
    """
    Compute a composite risk score to flag students who need help.

    Returns a dict with score, level, reason, action, and signal breakdown.
    """
    if not mastery_map:
        return {"score": 0, "level": "clear", "reason": "No data yet", "action": "Complete a session"}

    values = list(mastery_map.values())
    lowest = min(values)
    critical_count = sum(1 for s in values if s < 0.40)
    weak_count = sum(1 for s in values if s < settings.weak_threshold)

    mastery_drop = 100 if lowest < 0.35 else max(0, int((0.60 - lowest) * 160))
    multi_gap = min(100, critical_count * 35 + max(0, weak_count - critical_count) * 10)
    inactivity = 100 if last_active_hours >= 120 else 55 if last_active_hours >= 48 else 0
    trajectory = 70 if pace == "slow" and wrong_streak >= 2 else 20 if pace == "slow" else 0
    wrong_sig = min(100, wrong_streak * 35)

    score = (
        mastery_drop * 0.35
        + multi_gap * 0.25
        + inactivity * 0.20
        + trajectory * 0.12
        + wrong_sig * 0.08
    )

    level = "red" if score >= 70 else "amber" if score >= 40 else "clear"

    reason = "No intervention needed"
    action = "Continue the current path"
    if level != "clear":
        if lowest < 0.35:
            reason = "Core skill mastery dropped below 35%"
            action = "Assign an easier prerequisite explanation"
        elif critical_count >= 3:
            reason = "Multiple foundational gaps present"
            action = "Run a catch-up session on prerequisites"
        elif last_active_hours >= 48:
            reason = "Student has not been active recently"
            action = "Send a nudge and restart with a warm-up"
        else:
            reason = "Pace and wrong-answer streak suggest struggle"
            action = "Review the most recent weak topic"

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
            "wrong_streak": wrong_sig,
        },
    }
