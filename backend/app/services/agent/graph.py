from langgraph.graph import StateGraph, START, END
from app.services.agent.state import StudentState
from app.services.agent.nodes import (
    assess_node,
    route_node,
    generate_lesson_node,
    generate_simpler_node,
    generate_quiz_node,
    generate_chapter_quiz_node,
    analyze_quiz_results_node,
)


def route_logic(state: StudentState) -> str:
    """Conditional edge logic to route to the correct generation node."""
    mode = state.get("mode", "teach")
    if mode == "quiz":
        return "generate_quiz"
    elif mode == "simpler":
        return "generate_simpler"
    elif mode == "chapter_quiz":
        return "generate_chapter_quiz"
    elif mode == "analyze_quiz":
        return "analyze_quiz_results"
    else:
        # Default to teach/lesson
        return "generate_lesson"


# 1. Initialize StateGraph
builder = StateGraph(StudentState)

# 2. Add nodes
builder.add_node("assess", assess_node)
builder.add_node("route", route_node)
builder.add_node("generate_lesson", generate_lesson_node)
builder.add_node("generate_simpler", generate_simpler_node)
builder.add_node("generate_quiz", generate_quiz_node)
builder.add_node("generate_chapter_quiz", generate_chapter_quiz_node)
builder.add_node("analyze_quiz_results", analyze_quiz_results_node)

# 3. Add edges
builder.add_edge(START, "assess")
builder.add_edge("assess", "route")

# Conditional routing
builder.add_conditional_edges(
    "route",
    route_logic,
    {
        "generate_lesson": "generate_lesson",
        "generate_simpler": "generate_simpler",
        "generate_quiz": "generate_quiz",
        "generate_chapter_quiz": "generate_chapter_quiz",
        "analyze_quiz_results": "analyze_quiz_results",
    }
)

# All generation nodes go to END
builder.add_edge("generate_lesson", END)
builder.add_edge("generate_simpler", END)
builder.add_edge("generate_quiz", END)
builder.add_edge("generate_chapter_quiz", END)
builder.add_edge("analyze_quiz_results", END)

# 4. Compile graph
agent_graph = builder.compile()


async def run_agent(state_input: dict) -> dict:
    """
    Utility function to run the compiled LangGraph agent.
    """
    final_state = await agent_graph.ainvoke(state_input)
    return final_state
