# AISO integrations — call the engine from Gemini, Antigravity, or any MCP client

AISO returns a **verdict, not an answer** (PROCEED / CAUTION / ABSTAIN / CHALLENGE).
These two adapters let an AI use it as a "should I trust this?" tool.

Start the engine first:

```bash
node ../aiso-demo-server.mjs        # AISO on http://127.0.0.1:8899  (PORT/HOST override)
```

## 1. MCP server (`aiso-mcp.mjs`) — for Antigravity / Claude / Cursor / any MCP client

Zero-dependency stdio MCP server (Node 18+). Exposes two tools — `aiso_reason` and
`aiso_remember` — that proxy to the AISO `/v1` API. Register it in your client's MCP
config:

```jsonc
{
  "mcpServers": {
    "aiso": {
      "command": "node",
      "args": ["/absolute/path/to/demo/integrations/aiso-mcp.mjs"],
      "env": { "AISO_URL": "http://127.0.0.1:8899" }   // AISO_TOKEN for an auth-gated instance
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
# → initialize result, the two tools, then verdict ABSTAIN
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
no manual tool loop. Swap `AISO_URL`/`AISO_TOKEN` and the commented endpoint to target
the auth-gated production `/api/query`.

## The contract these wrap

| Method | Path | Body → result |
|---|---|---|
| `POST` | `/v1/reason` | `{query}` → `{verdict, well, stability, council, constraints, frontier_root}` |
| `POST` | `/v1/remember` | `{content}` → `{pointer, roots}` (dedup by meaning) |
| `GET` | `/v1/schema` | the function-calling / MCP tool descriptor (let the model self-configure) |

_Demonstration build — behaviour-faithful stand-ins, no proprietary algorithm. © 2026 Bradley Wallace / TensorRent._
