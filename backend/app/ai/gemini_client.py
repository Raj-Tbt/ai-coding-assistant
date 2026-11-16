import asyncio
from typing import AsyncGenerator
from google import genai
from google.genai import types
from app.core.config import settings
from app.ai.system_prompt import SYSTEM_PROMPT
from app.ai.context_manager import build_context

MODEL = "gemini-3.5-flash-lite"
MAX_RETRIES = 3


def _get_client() -> genai.Client:
    return genai.Client(api_key=settings.GEMINI_API_KEY)


async def generate_stream(messages: list[dict]) -> AsyncGenerator[str, None]:
    """Stream response chunks from Gemini given a list of {role, content} messages."""
    client = _get_client()
    context = build_context(messages)

    contents = []
    for msg in context:
        role = "user" if msg["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.7,
        max_output_tokens=8192,
    )

    for attempt in range(MAX_RETRIES):
        try:
            # SDK streaming is synchronous; collect in a thread so we don't
            # block FastAPI's event loop, then yield chunks back to the caller.
            def _collect() -> list[str]:
                result = []
                for chunk in client.models.generate_content_stream(
                    model=MODEL, contents=contents, config=config
                ):
                    if chunk.text:
                        result.append(chunk.text)
                return result

            chunks = await asyncio.to_thread(_collect)
            for text in chunks:
                yield text
            return
        except Exception as e:
            error_str = str(e)
            if ("429" in error_str or "500" in error_str or "503" in error_str) and attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2 ** attempt)
                continue
            raise


async def generate_title(message: str) -> str:
    """Generate a short conversation title from the first user message."""
    client = _get_client()
    prompt = (
        f"Generate a short title (3-6 words) for a coding conversation that starts with: "
        f"{message[:200]}\nRespond with only the title, no quotes or punctuation."
    )
    try:
        def _title() -> str:
            resp = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(max_output_tokens=20, temperature=0.3),
            )
            return resp.text.strip()[:100] if resp.text else "New Chat"

        return await asyncio.to_thread(_title)
    except Exception:
        return "New Chat"
