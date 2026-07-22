# AISO integrations — call the engine from Gemini, Antigravity, or any MCP client

> **`build: demonstration`** — These adapters default to Demo-Beta on
> `http://127.0.0.1:8899` (`/v1/*`). That stand-in is **not** the production engine.
> **NEVER treat `:8899` as prod.**

AISO returns a **verdict, not an answer** (PROCEED / CAUTION / ABSTAIN / CHALLENGE).
These two adapters let an AI use it as a "should I trust this?" tool.

## Modes

| Mode | How to enable | Target | Path |
|---|---|---|---|
| **Demonstration** (default) | unset `AISO_PRODUCTION` / `AISO_MODE` | Demo-Beta `:8899` | `/v1/reason`, `/v1/remember` |
| **Production** | `AISO_PRODUCTION=1` **or** `AISO_MODE=production` | real engine via `AISO_URL` | `/api/query` + `Authorization: Bearer $AISO_TOKEN` |

Production mode **refuses** URLs ending in `:8899` and any Demo-Beta target. It requires
`AISO_URL` (engine base) and `AISO_TOKEN` (bearer).

Start the demo engine first (demonstration mode only):

```bash
node ../aiso-demo-server.mjs        # AISO on http://127.0.0.1:8899  (PORT/HOST override)
```

Production example (Compose A — real engine, not Demo-Beta):

```bash
export AISO_PRODUCTION=1            # or: export AISO_MODE=production
export AISO_URL=https://your-engine.example   # must NOT end in :8899
export AISO_TOKEN=...               # bearer from gateway auth
# → POST $AISO_URL/api/query
```

## 1. MCP server (`aiso-mcp.mjs`) — for Antigravity / Claude / Cursor / any MCP client

Zero-dependency stdio MCP server (Node 18+). Exposes two tools — `aiso_reason` and
`aiso_remember` — that proxy to the AISO API (demo `/v1`, or production `/api/query`).
Register it in your client's MCP config:

```jsonc
{
  "mcpServers": {
    "aiso": {
      "command": "node",
      "args": ["/absolute/path/to/demo/integrations/aiso-mcp.mjs"],
      // Demonstration (default) — labelled, NOT production:
      "env": { "AISO_URL": "http://127.0.0.1:8899" }
      // Production:
      // "env": {
      //   "AISO_PRODUCTION": "1",
      //   "AISO_URL": "https://your-engine.example",
      //   "AISO_TOKEN": "..."
      // }
    }
  }
}
```

The client then auto-discovers `aiso_reason(query)` and `aiso_remember(content)`. Verify
by hand:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"aiso_reason","arguments":{"query":"the vibes are off today"}}}' \
  | node aiso-mcp.mjs
# → initialize result (serverInfo.build: "demonstration"), the two tools, then verdict ABSTAIN
```

## 2. Gemini function calling (`gemini_agent.py`)

```bash
pip install google-genai requests
export GEMINI_API_KEY=...
python gemini_agent.py "is 'the vibes are off today' a basis for a decision?"
```

Uses the `google-genai` SDK's **automatic function calling**: the Python `aiso_reason`
callable is passed straight to `tools=[…]`; the SDK builds the declaration from its
signature + docstring, invokes it when Gemini asks, and feeds the JSON verdict back —
no manual tool loop.

For production, set `AISO_PRODUCTION=1` (or `AISO_MODE=production`), `AISO_URL` to the
real engine base, and `AISO_TOKEN` — the agent calls `POST /api/query` with bearer and
refuses Demo-Beta / `:8899`.

## The contract these wrap

| Mode | Method | Path | Body → result |
|---|---|---|---|
| Demo | `POST` | `/v1/reason` | `{query}` → `{verdict, well, stability, …}` |
| Demo | `POST` | `/v1/remember` | `{content}` → `{pointer, roots}` |
| Demo | `GET` | `/v1/schema` | function-calling / MCP tool descriptor |
| Production | `POST` | `/api/query` | `{query}` → verdict (+ routing); requires Bearer |

_Demonstration build — behaviour-faithful stand-ins, no proprietary algorithm. © 2026 Bradley Wallace / TensorRent._
