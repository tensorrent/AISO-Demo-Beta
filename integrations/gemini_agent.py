#!/usr/bin/env python3
"""
gemini_agent.py — drive the AISO trust engine as a Gemini tool.

build: demonstration — default AISO_URL is Demo-Beta on :8899 (/v1/reason).
NEVER treat :8899 as production.

Production agents (Compose A):
    export AISO_PRODUCTION=1          # or AISO_MODE=production
    export AISO_URL=https://<engine>  # real engine base — must NOT end in :8899
    export AISO_TOKEN=<bearer>        # from gateway auth
    # → POST {AISO_URL}/api/query with Bearer token

AISO returns a *verdict*, not an answer: PROCEED / CAUTION / ABSTAIN / CHALLENGE.
Gemini calls it as a function, then reasons over the verdict — so the model has a
deterministic, no-LLM "should I trust this?" gate it can consult before committing.

Setup (demo):
    pip install google-genai requests
    export GEMINI_API_KEY=...
    node ../aiso-demo-server.mjs         # start Demo-Beta on :8899 (or set AISO_URL)
    python gemini_agent.py "is 'the vibes are off today' a basis for a decision?"
"""
from __future__ import annotations

import os
import sys
from urllib.parse import urlparse

import requests


def _is_production_mode() -> bool:
    prod = (os.environ.get("AISO_PRODUCTION") or "").strip()
    mode = (os.environ.get("AISO_MODE") or "").strip().lower()
    return prod == "1" or prod.lower() == "true" or mode == "production"


def _resolve_aiso_target() -> tuple[str, bool, str]:
    """Return (base_url, is_production, label). Refuse Demo-Beta as production."""
    production = _is_production_mode()
    raw = (os.environ.get("AISO_URL") or ("" if production else "http://127.0.0.1:8899")).rstrip("/")
    lower = raw.lower()

    if production:
        if not raw:
            raise SystemExit(
                "AISO_PRODUCTION/AISO_MODE=production requires AISO_URL pointing at the real "
                "engine (base URL for POST /api/query with Bearer AISO_TOKEN). "
                ":8899 is NEVER production."
            )
        parsed = urlparse(raw if "://" in raw else f"http://{raw}")
        if parsed.port == 8899 or raw.rstrip("/").endswith(":8899"):
            raise SystemExit(
                "Refusing :8899 as a production target. Set AISO_URL to the real engine base "
                "(POST /api/query, Bearer AISO_TOKEN). NEVER treat :8899 as prod."
            )
        if "demo-beta" in lower or "aiso-demo" in lower:
            raise SystemExit(
                "Refusing Demo-Beta as a production target. Point AISO_URL at the real engine "
                "(/api/query + bearer), not Demo-Beta."
            )
        if not os.environ.get("AISO_TOKEN"):
            raise SystemExit(
                "AISO_PRODUCTION/AISO_MODE=production requires AISO_TOKEN (Bearer) for "
                "POST /api/query."
            )
        return raw, True, "production"

    # Demonstration — labelled defaults
    if not os.environ.get("AISO_URL"):
        print(
            "[gemini_agent] build: demonstration — defaulting AISO_URL to "
            "http://127.0.0.1:8899 (Demo-Beta). NOT production. For the real engine set "
            "AISO_PRODUCTION=1 (or AISO_MODE=production), AISO_URL=<engine>, "
            "AISO_TOKEN=<bearer> → /api/query.",
            file=sys.stderr,
        )
    else:
        print(
            f"[gemini_agent] build: demonstration mode — AISO_URL={raw}. "
            "For production /api/query set AISO_PRODUCTION=1 + AISO_TOKEN.",
            file=sys.stderr,
        )
    return raw, False, "demonstration"


# Firewall runs before optional Gemini SDK import so production refusal is import-safe.
AISO_URL, AISO_PRODUCTION, AISO_LABEL = _resolve_aiso_target()
AISO_TOKEN = os.environ.get("AISO_TOKEN")  # optional in demo; required in production
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")


def aiso_reason(query: str) -> dict:
    """Consult the AISO transparent trust engine about a query.

    Returns a Council verdict — PROCEED, CAUTION, ABSTAIN, or CHALLENGE — plus the
    specialist 'well' it routed to and a 0..1 stability score. AISO ABSTAINS rather
    than bluff when the signal is too thin, and CHALLENGEs contradictions. Call this
    before trusting a claim or acting on weak evidence.

    Demo: POST /v1/reason. Production (AISO_PRODUCTION=1): POST /api/query with bearer.

    Args:
        query: the question or claim to evaluate.
    """
    headers = {"content-type": "application/json"}
    if AISO_TOKEN:
        headers["authorization"] = f"Bearer {AISO_TOKEN}"

    if AISO_PRODUCTION:
        r = requests.post(
            f"{AISO_URL}/api/query",
            json={"query": query},
            headers=headers,
            timeout=10,
        )
        r.raise_for_status()
        d = r.json()
        return {
            "verdict": d["verdict"],
            "well": (d.get("routing") or {}).get("winner") or d.get("well"),
            "stability": d.get("stability"),
            "target": "production",
            "path": "/api/query",
        }

    r = requests.post(
        f"{AISO_URL}/v1/reason",
        json={"query": query},
        headers=headers,
        timeout=10,
    )
    r.raise_for_status()
    out = r.json()
    out.setdefault("target", "demonstration")
    out.setdefault("path", "/v1/reason")
    return out


def main() -> None:
    from google import genai
    from google.genai import types

    prompt = " ".join(sys.argv[1:]) or "Is 'the vibes are off today' a trustworthy basis for a decision?"
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    # Automatic function calling: pass the Python callable directly. The SDK builds
    # the declaration from the signature + docstring, invokes it when Gemini asks,
    # and feeds the JSON result back — no manual tool loop required.
    resp = client.models.generate_content(
        model=MODEL,
        contents=(
            f"You have an AISO trust-engine tool (build: {AISO_LABEL}). For the user's "
            "statement, call aiso_reason, then explain what the verdict means and whether "
            "to act on it.\n\n"
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
