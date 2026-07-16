#!/usr/bin/env node
// aiso-mcp.mjs
// =================================================================
// Zero-dependency MCP (Model Context Protocol) stdio server for AISO.
// =================================================================
// Exposes the AISO transparent-trust-engine HTTP contract as MCP tools, so any
// MCP client — Antigravity, Gemini, Claude, Cursor — can auto-discover and call
// it. It is a thin proxy: it forwards `reason`/`remember` to the AISO server's
// /v1 API and returns the verdict.
//
// Run the AISO demo server first (node aiso-demo-server.mjs, default :8899), then
// register THIS file as an MCP stdio server in your client. Point it at a
// different AISO instance with AISO_URL (e.g. your production /v1 gateway).
//
// Protocol: JSON-RPC 2.0, newline-delimited, over stdin/stdout (the MCP stdio
// transport). No SDK, no npm install — Node 18+ (global fetch) is all it needs.

const AISO_URL = (process.env.AISO_URL || "http://127.0.0.1:8899").replace(/\/$/, "");
const PROTOCOL_VERSION = "2024-11-05";

const TOOLS = [
  {
    name: "aiso_reason",
    description:
      "Reduce a query through the AISO transparent trust engine and return a Council " +
      "verdict (PROCEED / CAUTION / ABSTAIN / CHALLENGE) with its well, stability, and " +
      "constraint structure. It ABSTAINS rather than bluff when signal is thin, and " +
      "CHALLENGEs contradictions. Call this before trusting a claim or acting on thin evidence.",
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
      "returns the same pointer.",
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
    return callAiso("/v1/reason", { query: args.query });
  }
  if (name === "aiso_remember") {
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
          serverInfo: { name: "aiso", version: "1.0.0" },
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
