from app.ai.system_prompt import SYSTEM_PROMPT

# Rough characters-per-token estimate for budget management
CHARS_PER_TOKEN = 3.5
MAX_CONTEXT_TOKENS = 100_000


def estimate_tokens(text: str) -> int:
    return int(len(text) / CHARS_PER_TOKEN)


def build_context(messages: list[dict]) -> list[dict]:
    """
    Build a message list that fits within the token budget.
    Always includes the system prompt; adds messages from most recent backwards.
    """
    budget = MAX_CONTEXT_TOKENS - estimate_tokens(SYSTEM_PROMPT)
    selected = []

    for msg in reversed(messages):
        cost = estimate_tokens(msg.get("content", ""))
        if budget - cost < 0:
            break
        selected.append(msg)
        budget -= cost

    selected.reverse()
    return selected
