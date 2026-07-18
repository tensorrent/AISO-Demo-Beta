# AISO — Demo (Beta)

A single-page, self-contained demonstration of the **AISO transparent trust engine** — a
deterministic, **no-LLM** reasoning router. Type a question and watch it return a *verdict*
(PROCEED / CAUTION / ABSTAIN / CHALLENGE) with a fully inspectable "glass box": integer token
charges, the specialist-well it routed to, a deterministic pipeline trace, the live constraint
structure, a symbolic store filed by meaning, and an append-only scroll with a rolling root.

Two surfaces:

- a **human dashboard** — the visual verdict + glass box; and
- an **AI-facing agent view** — the exact machine-readable request/response, a copyable
  function-calling / MCP tool schema, and a self-running agent console.

> **⚠️ Demonstration build — a simulation, not the engine.** This build **approximates** the
> shape of the engine's output (four-verdict Council, integer token charges, symbolic pointers,
> constraint dispositions, the rolling scroll root). The **proprietary algorithms are not
> present** — SPE interning, BRA charge algebra, CDCL reduction and manifold placement are
> replaced by deterministic stand-ins, the well set is 8 broad buckets rather than the real
> lexicon's 65 narrow concepts, and the source is additionally obfuscated. Safe to share: no real
> IP is in this build. Deterministic by design — the same query always yields the same verdict,
> charge, and pointer.
>
> **Where it differs from the real engine.** Verdicts here will not always match production.
> Most notably this build treats a *contradiction* cue (`not`, `never`, `versus`…) as CHALLENGE;
> **the real engine has no contradiction detector.** There, CHALLENGE means "signal present but
> under-corroborated — ask again, more specifically." The query `quantum energy fields but not
> really a wave` CHALLENGEs here but returns CAUTION → `schrodinger` in production. Treat this
> page as an interaction demo, not a behavioural specification.

## Human UI — just open it

```
open index.html          # no install, no server; works offline; follows OS light/dark
```

Or publish it: this single file is GitHub-Pages-ready as-is.

## AI-facing machine endpoint

For a headless agent (or an LLM with function-calling / MCP), run the zero-dependency server:

```
node aiso-demo-server.mjs        # → http://127.0.0.1:8899   (PORT / HOST env override)
```

It serves the human UI at `/` **and** the machine contract:

| Method | Path | Body / result |
|---|---|---|
| `POST` | `/v1/reason` | `{ "query": "..." }` → Council verdict + full constraint structure |
| `POST` | `/v1/remember` | `{ "content": "..." }` → symbolic pointer (dedup by meaning) + roots |
| `GET` | `/v1/schema` | function-calling / MCP tool schema |
| `GET` | `/v1/scroll` | current append-only scroll + frontier root |
| `GET` | `/health` | liveness |

```bash
curl -s localhost:8899/v1/reason -H 'content-type: application/json' \
  -d '{"query":"compare cell membrane and lipid designs"}' | jq '{verdict, well}'
# -> { "verdict": "PROCEED", "well": "biology" }

curl -s localhost:8899/v1/reason -H 'content-type: application/json' \
  -d '{"query":"the vibes are off today"}' | jq '.verdict'
# -> "ABSTAIN"        # it refuses to bluff on thin signal
```

In the browser, the same two tools are exposed on `window.aiso` — `window.aiso.reason(query)`
and `window.aiso.remember(content)` — so an embedded agent can drive the engine directly.

## What to try

- **A clear question** → `Compare the trade-offs of different cell-membrane designs` → **PROCEED**.
- **A vague one** → `the vibes are off today` → **ABSTAIN** (the honest behaviour, not a failure).
- **An under-specified question** → `Explain entropy` → **CHALLENGE** (ask again, more
  specifically — this is what CHALLENGE means in the real engine too).
- **Remember the same note twice** (any capitalisation) → the second write **DEDUPs** to the
  same pointer (filed by meaning, not spelling).
- Toggle **Agent / AI** and press **Run agent** to watch a scripted agent drive the contract.

---

_© 2026 Bradley Wallace / TensorRent — SIP License v1.1 (see [`LICENSE`](LICENSE))._
