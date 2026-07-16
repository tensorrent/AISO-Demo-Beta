#!/usr/bin/env python3
"""
gemini_agent.py — drive the AISO trust engine as a Gemini tool.

AISO returns a *verdict*, not an answer: PROCEED / CAUTION / ABSTAIN / CHALLENGE.
Gemini calls it as a function, then reasons over the verdict — so the model has a
deterministic, no-LLM "should I trust this?" gate it can consult before committing.

Setup:
    pip install google-genai requests
    export GEMINI_API_KEY=...            # your Google AI Studio key
    node ../aiso-demo-server.mjs         # start AISO on :8899 (or set AISO_URL)
    python gemini_agent.py "is 'the vibes are off today' a basis for a decision?"

For a production AISO instance with auth, set AISO_URL to its /api gateway and
AISO_TOKEN to a key from POST /api/auth/register, then swap the endpoint/body in
aiso_reason() to /api/query (see the commented variant).
"""
import os
import sys
import requests
from google import genai
from google.genai import types

AISO_URL = os.environ.get("AISO_URL", "http://127.0.0.1:8899").rstrip("/")
AISO_TOKEN = os.environ.get("AISO_TOKEN")  # optional bearer token
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")


def aiso_reason(query: str) -> dict:
    """Consult the AISO transparent trust engine about a query.

    Returns a Council verdict — PROCEED, CAUTION, ABSTAIN, or CHALLENGE — plus the
    specialist 'well' it routed to and a 0..1 stability score. AISO ABSTAINS rather
    than bluff when the signal is too thin, and CHALLENGEs contradictions. Call this
    before trusting a claim or acting on weak evidence.

    Args:
        query: the question or claim to evaluate.
    """
    headers = {"content-type": "application/json"}
    if AISO_TOKEN:
        headers["authorization"] = f"Bearer {AISO_TOKEN}"
    r = requests.post(f"{AISO_URL}/v1/reason", json={"query": query}, headers=headers, timeout=10)
    r.raise_for_status()
    return r.json()

    # ── Production variant (auth-gated /api/query) ──
    # r = requests.post(f"{AISO_URL}/api/query", json={"query": query}, headers=headers, timeout=10)
    # r.raise_for_status()
    # d = r.json()
    # return {"verdict": d["verdict"], "well": (d.get("routing") or {}).get("winner")}


def main() -> None:
    prompt = " ".join(sys.argv[1:]) or "Is 'the vibes are off today' a trustworthy basis for a decision?"
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    # Automatic function calling: pass the Python callable directly. The SDK builds
    # the declaration from the signature + docstring, invokes it when Gemini asks,
    # and feeds the JSON result back — no manual tool loop required.
    resp = client.models.generate_content(
        model=MODEL,
        contents=(
            "You have an AISO trust-engine tool. For the user's statement, call "
            "aiso_reason, then explain what the verdict means and whether to act on it.\n\n"
            f"User: {prompt}"
        ),
        config=types.GenerateContentConfig(
            tools=[aiso_reason],
            temperature=0,
        ),
    )
    print(resp.text)


if __name__ == "__main__":
    main()
