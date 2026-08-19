"""
LangGraph nodes for the adaptive learning agent.
Each function represents a step in the AI pipeline.
"""

from typing import cast
from pydantic import BaseModel

from app.services.agent.state import StudentState
from app.services.agent.llm import generate_json


# ── Response Schemas ──────────────────────────────────────────────────────────

class GenerateLessonResponse(BaseModel):
    content: str


class GenerateQuizResponse(BaseModel):
    question: str
    options: list[str]
    correct_option: str


# ── Nodes ─────────────────────────────────────────────────────────────────────

async def assess_node(state: StudentState) -> dict:
    """
    Dummy assess node — in reality, we load the mastery score before entering the graph.
    Just maps mastery score to difficulty level.
    """
    mastery = state["mastery_score"]
    diff = "easy" if mastery < 0.35 else "medium" if mastery < 0.65 else "hard"
    return {"difficulty_level": diff, "steps": ["assess_node"]}


async def route_node(state: StudentState) -> dict:
    """
    Decides what kind of content to generate based on the mode.
    (Handled by edges in graph.py, but could hold logic).
    """
    return {"steps": ["route_node"]}


async def generate_lesson_node(state: StudentState) -> dict:
    """Generates an explanatory lesson using RAG context and student memory."""
    context_text = "\n\n".join(
        [f"Title: {c['title']}\n{c['body']}" for c in state["rag_context"]]
    )

    mistake_context = ""
    if state["mistake_patterns"]:
        mistakes_str = ", ".join([f"{m['count']} {m['mistake_type']} mistakes" for m in state["mistake_patterns"]])
        mistake_context = f"The student has historically made these mistakes on this topic: {mistakes_str}. Address these misconceptions gently but clearly."

    prompt = f"""
    You are an expert, empathetic AI tutor for a Class {state['grade']} student.
    Topic: {state['skill_name']}
    Difficulty target: {state['difficulty_level']}

    Here is the textbook material to draw from:
    {context_text}

    {mistake_context}

    Write a personalized, engaging explanation of the topic.
    Keep it concise, use bullet points, and include a real-world analogy.
    """

    response = await generate_json(
        system_prompt="You are an expert tutor. Output JSON.",
        user_prompt=prompt,
        response_model=GenerateLessonResponse,
        temperature=0.7,
    )

    return {"generated_content": response.content, "steps": ["generate_lesson_node"]}


async def generate_simpler_node(state: StudentState) -> dict:
    """Generates a simplified, remedial explanation."""
    context_text = "\n\n".join(
        [f"Title: {c['title']}\n{c['body']}" for c in state["rag_context"]]
    )

    prompt = f"""
    You are a patient AI tutor for a Class {state['grade']} student who is struggling with: {state['skill_name']}.
    They need this explained in the simplest possible terms.

    Textbook material:
    {context_text}

    Break down the core concept. Strip away complex jargon. Use an extremely simple, relatable everyday analogy.
    Make them feel encouraged.
    """

    response = await generate_json(
        system_prompt="You are a patient, encouraging tutor. Output JSON.",
        user_prompt=prompt,
        response_model=GenerateLessonResponse,
        temperature=0.7,
    )

    return {"generated_content": response.content, "steps": ["generate_simpler_node"]}


async def generate_quiz_node(state: StudentState) -> dict:
    """Generates a multiple-choice question."""
    context_text = "\n\n".join(
        [f"Title: {c['title']}\n{c['body']}" for c in state["rag_context"]]
    )

    mistake_context = ""
    if state["mistake_patterns"]:
        mistake_context = "Design one of the incorrect options (distractors) to catch the specific misconception the student usually makes, if possible."

    prompt = f"""
    You are an expert assessor for Class {state['grade']}.
    Topic: {state['skill_name']}
    Difficulty: {state['difficulty_level']}

    Textbook material:
    {context_text}

    {mistake_context}

    Generate ONE multiple-choice question testing this concept.
    Provide exactly 4 options. Only one option should be correct.
    """

    response = await generate_json(
        system_prompt="You are an expert quiz generator. Output JSON.",
        user_prompt=prompt,
        response_model=GenerateQuizResponse,
        temperature=0.7,
    )

    # Note: we need to ensure the correct option is among the options.
    return {
        "generated_content": response.question,
        "generated_quiz_options": response.options,
        "steps": ["generate_quiz_node"]
    }

class ChapterQuizQuestion(BaseModel):
    id: str
    topic: str
    question: str
    options: list[str]
    correct_option: str

class GenerateChapterQuizResponse(BaseModel):
    questions: list[ChapterQuizQuestion]

async def generate_chapter_quiz_node(state: StudentState) -> dict:
    """Generates a 15-question diagnostic quiz for an entire chapter."""
    context_text = "\n\n".join(
        [f"Title: {c['title']}\n{c['body']}" for c in state["rag_context"]]
    )

    mistake_context = ""
    if state["mistake_patterns"]:
        mistakes_str = ", ".join([f"{m['count']} {m['mistake_type']} mistakes" for m in state["mistake_patterns"]])
        mistake_context = f"The student has historically made these mistakes on this topic: {mistakes_str}. Use these to create tricky distractors for some questions."

    prompt = f"""
    You are an expert curriculum assessor for Class {state['grade']}.
    Chapter/Topic: {state['skill_name']}
    Difficulty: {state['difficulty_level']}

    Here is the textbook material representing the topics in this chapter:
    {context_text}

    {mistake_context}

    Generate exactly 15 multiple-choice questions covering all the topics provided in the text.
    For each question, provide exactly 4 options. Only one option should be correct.
    Ensure a mix of conceptual, factual, and application-based questions.
    Give each question a unique 'id' (e.g. q1, q2, ... q15) and specify which 'topic' from the chapter it belongs to.
    """

    response = await generate_json(
        system_prompt="You are an expert quiz generator. Output JSON.",
        user_prompt=prompt,
        response_model=GenerateChapterQuizResponse,
        temperature=0.7,
    )

    return {
        "generated_content": response.model_dump(),
        "steps": ["generate_chapter_quiz_node"]
    }

class QuizExplanationResponse(BaseModel):
    question_id: str
    correct_answer: str
    student_answer: str
    is_correct: bool
    explanation: str

class MisconceptionDiagnostic(BaseModel):
    misconception_name: str
    description: str
    related_question_ids: list[str]

class AnalyzeQuizResponse(BaseModel):
    weak_topics: list[str]
    strong_topics: list[str]
    overall_feedback: str
    explanations: list[QuizExplanationResponse]
    identified_misconceptions: list[MisconceptionDiagnostic]
    recommended_interventions: list[str]

async def analyze_quiz_results_node(state: StudentState) -> dict:
    """Analyzes student answers from a chapter quiz."""
    # We will pass the questions and the student's answers in a special state key
    quiz_data = state.get("quiz_data", {})
    answers = quiz_data.get("answers", {}) # dict of question_id -> student selected answer
    questions = quiz_data.get("questions", []) # list of ChapterQuizQuestion dicts
    confidences = quiz_data.get("confidences", {})

    prompt = f"""
    You are an expert AI tutor. A Class {state['grade']} student has just completed a 15-question quiz on {state['skill_name']}.
    Analyze their performance based on the following questions, their answers, and their stated confidence levels (where 25=low, 75=med, 100=high).
    
    Questions:
    {questions}
    
    Student's Answers:
    {answers}
    
    Student's Confidence Levels:
    {confidences}
    
    Identify their weak topics and strong topics. 
    Provide an overall encouraging feedback message.
    For every question, state the correct answer, whether the student was correct, and provide a clear explanation of the logic behind the correct answer and how to build better understanding if they got it wrong.
    
    Crucially, analyze incorrect answers cross-referenced with confidence. If they were highly confident (e.g. 100) but wrong, flag this as a potential misconception. 
    Output any `identified_misconceptions`.
    Based on the gaps, output a list of `recommended_interventions` (e.g. "Micro-lesson on integer rules", "Targeted practice on photosynthesis").
    """

    response = await generate_json(
        system_prompt="You are an expert educational diagnostic AI. Output JSON.",
        user_prompt=prompt,
        response_model=AnalyzeQuizResponse,
        temperature=0.7,
    )

    return {
        "generated_content": response.model_dump(),
        "steps": ["analyze_quiz_results_node"]
    }
