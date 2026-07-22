#!/usr/bin/env node
// aiso-mcp.mjs
// =================================================================
// Zero-dependency MCP (Model Context Protocol) stdio server for AISO.
// =================================================================
// build: demonstration — default target is the Demo-Beta stand-in on :8899.
// NEVER treat :8899 as production. Production agents must set
// AISO_PRODUCTION=1 (or AISO_MODE=production) and point AISO_URL at the real
// engine base (POST /api/query with Bearer AISO_TOKEN).
//
// Exposes the AISO transparent-trust-engine HTTP contract as MCP tools, so any
// MCP client — Antigravity, Gemini, Claude, Cursor — can auto-discover and call
// it. It is a thin proxy: demo mode forwards to /v1; production mode to /api/query.
//
// Protocol: JSON-RPC 2.0, newline-delimited, over stdin/stdout (the MCP stdio
// transport). No SDK, no npm install — Node 18+ (global fetch) is all it needs.

const PROTOCOL_VERSION = "2024-11-05";

function isProductionMode() {
  const prod = (process.env.AISO_PRODUCTION || "").trim();
  const mode = (process.env.AISO_MODE || "").trim().toLowerCase();
  return prod === "1" || prod.toLowerCase() === "true" || mode === "production";
}

/**
 * Refuse Demo-Beta / :8899 as a production target.
 * Production requires AISO_URL base that does not end in :8899 and will call /api/query.
 */
function resolveAisoTarget() {
  const production = isProductionMode();
  const raw = (process.env.AISO_URL || (production ? "" : "http://127.0.0.1:8899")).replace(/\/$/, "");
  const lower = raw.toLowerCase();

  if (production) {
    if (!raw) {
      throw new Error(
        "AISO_PRODUCTION/AISO_MODE=production requires AISO_URL pointing at the real engine " +
          "(base URL for POST /api/query with Bearer AISO_TOKEN). :8899 is NEVER production."
      );
    }
    if (/:8899(?:\/|$)/.test(raw) || lower.includes("demo-beta") || lower.includes("aiso-demo")) {
      throw new Error(
        "Refusing Demo-Beta / :8899 as a production target. Set AISO_URL to the real engine " +
          "base (path /api/query, Bearer AISO_TOKEN). NEVER treat :8899 as prod."
      );
    }
    if (!process.env.AISO_TOKEN) {
      throw new Error(
        "AISO_PRODUCTION/AISO_MODE=production requires AISO_TOKEN (Bearer) for POST /api/query."
      );
    }
    return { url: raw, production: true, label: "production" };
  }

  // Demonstration default — labelled, never silent production.
  if (!process.env.AISO_URL) {
    console.error(
      "[aiso-mcp] build: demonstration — defaulting AISO_URL to http://127.0.0.1:8899 " +
        "(Demo-Beta). This is NOT production. For the real engine set AISO_PRODUCTION=1 " +
        "(or AISO_MODE=production), AISO_URL=<engine base>, AISO_TOKEN=<bearer> → /api/query."
    );
  } else if (/:8899(?:\/|$)/.test(raw) || lower.includes("demo-beta")) {
    console.error(
      "[aiso-mcp] build: demonstration — targeting Demo-Beta / :8899. NOT production."
    );
  } else {
    console.error(
      "[aiso-mcp] build: demonstration mode (AISO_PRODUCTION unset). Using AISO_URL=" +
        raw +
        " via /v1. For production /api/query set AISO_PRODUCTION=1 + AISO_TOKEN."
    );
  }
  return { url: raw, production: false, label: "demonstration" };
}

const AISO = resolveAisoTarget();
const AISO_URL = AISO.url;

const TOOLS = [
  {
    name: "aiso_reason",
    description:
      "Reduce a query through the AISO transparent trust engine and return a Council " +
      "verdict (PROCEED / CAUTION / ABSTAIN / CHALLENGE) with its well, stability, and " +
      "constraint structure. It ABSTAINS rather than bluff when signal is thin, and " +
      "CHALLENGEs contradictions. Call this before trusting a claim or acting on thin evidence. " +
      `[target=${AISO.label}]`,
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "the question or claim to reason about" } },
      required: ["query"],
    },
  },
  {
    name: "aiso_remember",
    description:
      "File a note into AISO's symbolic store and get back a content-addressed pointer. " +
      "Deduplicates by MEANING (case/whitespace-insensitive): the same note filed twice " +
      "returns the same pointer. (Demo /v1 only — not available on production /api/query.)",
    inputSchema: {
      type: "object",
      properties: { content: { type: "string", description: "the note to remember" } },
      required: ["content"],
    },
  },
];

async function callAiso(path, body) {
  const res = await fetch(`${AISO_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // If the AISO instance requires auth, set AISO_TOKEN and it is forwarded.
      ...(process.env.AISO_TOKEN ? { authorization: `Bearer ${process.env.AISO_TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AISO ${path} → HTTP ${res.status}`);
  return res.json();
}

async function handleToolCall(name, args) {
  if (name === "aiso_reason") {
    if (typeof args?.query !== "string") throw new Error("argument 'query' (string) is required");
    if (AISO.production) {
      // Production contract: POST /api/query with bearer (Compose A).
      const d = await callAiso("/api/query", { query: args.query });
      return {
        verdict: d.verdict,
        well: (d.routing || {}).winner ?? d.well,
        stability: d.stability,
        target: "production",
        path: "/api/query",
        raw: d,
      };
    }
    return callAiso("/v1/reason", { query: args.query });
  }
  if (name === "aiso_remember") {
    if (AISO.production) {
      throw new Error(
        "aiso_remember is demo-only (/v1/remember). Production mode uses /api/query only."
      );
    }
    if (typeof args?.content !== "string") throw new Error("argument 'content' (string) is required");
    return callAiso("/v1/remember", { content: args.content });
  }
  throw new Error(`unknown tool: ${name}`);
}

// ── JSON-RPC dispatch ────────────────────────────────────────────
async function dispatch(msg) {
  const { id, method, params } = msg;
  // Notifications (no id) get no response.
  const isNotification = id === undefined || id === null;

  try {
    let result;
    switch (method) {
      case "initialize":
        result = {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: {
            name: "aiso",
            version: "1.0.0",
            build: AISO.label, // "demonstration" | "production"
          },
        };
        break;
      case "tools/list":
        result = { tools: TOOLS };
        break;
      case "tools/call": {
        const data = await handleToolCall(params?.name, params?.arguments ?? {});
        result = { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        break;
      }
      case "ping":
        result = {};
        break;
      default:
        if (isNotification) return null; // ignore unknown notifications (e.g. notifications/initialized)
        return { jsonrpc: "2.0", id, error: { code: -32601, message: `method not found: ${method}` } };
    }
    if (isNotification) return null;
    return { jsonrpc: "2.0", id, result };
  } catch (err) {
    if (isNotification) return null;
    return { jsonrpc: "2.0", id, error: { code: -32000, message: String(err?.message || err) } };
  }
}

// ── newline-delimited stdio transport ────────────────────────────
// Messages are serialised through a promise chain so responses are emitted in
// request order, and — critically — so a stdin close waits for in-flight tool
// calls (async fetches) to finish before exit, rather than truncating them.
let buffer = "";
let chain = Promise.resolve();
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // skip malformed lines
    }
    chain = chain.then(async () => {
      const reply = await dispatch(msg);
      if (reply) process.stdout.write(JSON.stringify(reply) + "\n");
    });
  }
});
process.stdin.on("end", () => {
  chain.then(() => process.exit(0));
});
