# AISO — Whole-System Technical Manual

_Version 1.0 · 2026-07-12 · verified against source in all repos._

This is the single technical manual for the **entire AISO system** — every repository, every
layer, how they connect, and how to build, run, test, and operate them. It is written to be
usable by both a human engineer and an LLM working in the codebase. Every route, table, env
var, and command below was read from source, not recalled.

**Companion docs:** [PLAIN_ENGLISH_GUIDE.md](PLAIN_ENGLISH_GUIDE.md) (what it does, in plain
English — start here if you're new) · [CAPABILITIES.md](CAPABILITIES.md) (per-piece when/how
dispatch) · **[per-component IP briefs](https://github.com/tensorrent/Aiso/blob/main/docs/ip/README.md)**
(one decomposed IP brief per component) · [SYSTEM_MAP.md](SYSTEM_MAP.md) (repo graph) · [DOCS_AUDIT.md](DOCS_AUDIT.md) (doc quality) ·
[AISO_SYSTEM_WHITEPAPER_v1.0.md](AISO_SYSTEM_WHITEPAPER_v1.0.md) (concept) ·
[VALIDATION_2026-07-12.md](VALIDATION_2026-07-12.md) (current green board).

---

## Table of contents

- [0. What this system is](#0-what-this-system-is)
- [1. The repo constellation & layer stack](#1-the-repo-constellation--layer-stack)
- [2. Part I — AISO MVP (`AISO-UI-for-Ai`)](#2-part-i--aiso-mvp-aiso-ui-for-ai)
- [3. Part II — HashCloud-SPE (storage substrate)](#3-part-ii--hashcloud-spe-storage-substrate)
- [4. Part III — `aiso` (research / witness / settlement)](#4-part-iii--aiso-research--witness--settlement)
- [5. Part IV — rawkit (L2 floor)](#5-part-iv--rawkit-l2-floor)
- [6. Part V — TangTalk (P2P connectors)](#6-part-v--tangtalk-p2p-connectors)
- [7. Cross-cutting: security, invariants, data flows](#7-cross-cutting-security-invariants-data-flows)
- [8. Operations: env vars, ports, runbook, status](#8-operations-env-vars-ports-runbook-status)
- [9. Glossary](#9-glossary)

---

## 0. What this system is

AISO is a **universal trust engine with transparent, auditable constraints**, wired to a
**symbolic, decentralized storage substrate**. Trust — not an answer — is the output, and the
engine's operation is *visible while it runs* and *replayable afterward* (glass box, not
post-hoc explanation). It computes trust by **showing which constraints are active, stricken,
superseded, or contested**: trust is what survives the constraint structure.

The end-to-end story in one line: a user, from any device, adds information → it is **rendered
into meaning** (a symbolic pointer) → made **durable** (erasure-coded, home-first) → it
**converges across a swarm** (CRDT over HTTP/Nostr) → and every reasoning verdict over it is
**auditable** (a transparent constraint structure and a hash-chained event log).

The whole is five cooperating codebases:

| Layer | Repo | Role |
|---|---|---|
| **Application / MVP** | `AISO-UI-for-Ai` | Auth gateway + Postgres + envelope-encrypted storage + Schnorr identity (Rust); the TENT reasoning server (TypeScript); the SvelteKit visualizer. The deployable product. |
| **Storage substrate** | `HashCloud-SPE` | Symbolic content-addressing (SPE) → append-only CRDT scroll → Reed-Solomon durability → HTTP + Nostr gossip. |
| **Research / witness** | `aiso` | Spectral witness core, CLVM settlement/referee, Halo2 step circuit, Trinity WASM kernel, reasoning/benchmark harness, akashic data; source of the shared `aiso-common/identity/storage` crates. |
| **L2 floor** | `rawkit` (`koba42-official/Rawkit_Ai`) | Decentralized vector-graph memory: graph + vector + crypto + real-time sync. Path-dep of HashCloud's `network` crate. |
| **P2P transport** | `TangTalk` | Chia wallet + Nostr/WebRTC P2P (Grove SFU audio, calls, Nostr-DID identity). Source of the Nostr connectors the MVP reuses. |

---

## 1. The repo constellation & layer stack

```
        ┌──────────────────────────────────────────────────────────────┐
 device │  AISO-UI-for-Ai  (the deployable MVP)                          │
  (any) │                                                                │
        │   aiso-gateway :8090  ── auth: Schnorr → bearer token → /v1/*  │
        │        │  per-user events / records / consent / DSAR / MFA     │
        │        ▼                                                        │
        │   aiso-db (Postgres 16)   aiso-storage (envelope KMS)          │
        │   aiso-identity(-wasm)     (Schnorr sr25519; browser WASM)     │
        │                                                                │
        │   frontend/  TENT reasoning server :8422 (TypeScript)          │
        │   visualizer/ SvelteKit dashboard  ── Swarm Scroll panel ──┐   │
        └────────────────────────────────────────────────────────────┼──┘
                        HTTP  │                        Nostr (DID-sig) │
                              ▼                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │  HashCloud-SPE  (storage substrate)                            │
        │   symbolic-pointer-engine → crates/scroll → scroll-server:8791 │
        │   content → symbolic pointer → append-only Scroll (CRDT)       │
        │   → Reed-Solomon durability (10+6=16, home-first)              │
        │   → gossip (HTTP /scroll/sync  +  Nostr kind 30078)            │
        │   crates/network ──path-dep──▶ rawkit                          │
        └───────────────────────────────────────┬──────────────────────┘
                                                 ▼
        ┌──────────────────────────────────────────────────────────────┐
        │  rawkit  — graph + vector + CRDT + crypto + real-time sync     │
        └──────────────────────────────────────────────────────────────┘

  aiso  (research/witness/settlement) — shares aiso-common/identity/storage crates with the
  MVP; owns aiso-witness, settlement-tests (clsp referee), svs_step_circuit, trinity-wasm,
  the reasoning harness, and akashic data.   TangTalk — origin of the Nostr-DID connectors.
```

**Which repo owns what (important — resolves a historical ambiguity):**
- `AISO-UI-for-Ai` is the **complete, canonical deployable MVP**. It alone has `aiso-gateway`
  and `aiso-db`. This is where auth, persistence, MFA, and the swarm-scroll integration live.
- `aiso` is the **research / witness / settlement + shared-crate source tree**. It has *no*
  gateway/db. It carries the math/witness core, the CLVM settlement layer, the ZK circuit, the
  Trinity kernel, the Python harness, and a **research-side copy** of the TENT `frontend/` +
  `visualizer/` (sibling copy of the same TypeScript pipeline — same module names). Treat
  `AISO-UI-for-Ai`'s copies as canonical for the product.
- The two share the foundation crates (`aiso-common`, `aiso-identity`, `aiso-storage`).

---

## 2. Part I — AISO MVP (`AISO-UI-for-Ai`)

Rust workspace (edition 2021, rust 1.78, `unsafe_code = "forbid"`, license SIP-1.1), 11 crate
members + two Node/TS subprojects.

**Crate map**

| Crate | Role |
|---|---|
| `aiso-gateway` | Authenticated per-user HTTP API (Axum 0.7) |
| `aiso-db` | Postgres 16 persistence (sqlx 0.8) |
| `aiso-storage` | Envelope encryption + `KmsProvider` + blind index |
| `aiso-identity` | Schnorr (schnorrkel/sr25519) registration identity |
| `aiso-identity-wasm` | Browser keygen/sign (wasm-bindgen) |
| `aiso-common` | Shared types (Sprint-0 skeleton) |
| `aiso-witness`, `settlement-tests`, `svs_step_circuit`, `trinity-wasm`, `symbolic-pointer-engine` | shared with / mirrored from `aiso` + HashCloud (see Parts II–III) |

### 2.1 Auth gateway (`crates/aiso-gateway`)

Axum router (`src/lib.rs::app_full`): an **authenticated** state group + a **public** group
wrapped in `rate_limit_mw`, under a permissive CORS layer. Binary `src/main.rs` binds
`HOST:PORT` (default `0.0.0.0:8090`), runs `db.migrate()` on boot, and does graceful shutdown
on Ctrl-C/SIGTERM.

**Route table**

| Method | Path | Auth | Rate-limited | Purpose |
|---|---|---|---|---|
| GET | `/health` | public | no | Liveness — `{"status":"ok"}` |
| POST | `/v1/register` | public | **yes** | Verify Schnorr proof-of-possession, create account, mint token (dup pubkey → 409) |
| POST | `/v1/login` | public | **yes** | Verify Schnorr proof, resolve by pubkey (must be Active), mint fresh token |
| GET | `/v1/events` | bearer | no | List caller's events (seq order) |
| POST | `/v1/events` | bearer | no | Append to caller's hash-chained log |
| GET | `/v1/records` | bearer | no | List caller's encrypted records |
| POST | `/v1/records` | bearer | no | Store encrypted record (`ciphertext`, `wrapped_dek`, optional `blind_index`) |
| GET | `/v1/consent` | bearer | no | List consent ledger |
| POST | `/v1/consent` | bearer | no | Append a signed consent record |
| POST | `/v1/dsar/erase` | bearer | no | GDPR Art. 17 erasure |
| GET | `/v1/mfa` | bearer | no | Enrollment state (`not_enrolled`/`pending`/`active`) |
| POST | `/v1/mfa/enrollment` | bearer | no | Begin TOTP enroll → `otpauth://` URI + recovery codes (returned once) |
| POST | `/v1/mfa/enrollment/finalize` | bearer | no | First valid TOTP code activates |
| POST | `/v1/mfa/verify` | bearer | no | Verify a TOTP or single-use recovery code |
| POST | `/v1/mfa/disable` | bearer | no | Remove enrollment (step-up required if active) |

**Auth flow.** Client generates a Schnorr keypair in the browser (WASM). Register/login POST
`{challenge, signature, pubkey}` (hex); the gateway verifies with `SchnorrkelVerifier`, then
mints a token = **32 random bytes, hex** (opaque bearer). Only its **SHA-256 hash** is stored
in `sessions` (TTL `TOKEN_TTL_HOURS = 24`). Per request, the `AuthUser` extractor hashes the
`Authorization: Bearer` token, calls `db.resolve_token` (rejects expired/revoked), and every
`/v1/*` handler is scoped to the returned `uid` — **no cross-user path exists** (per-user
isolation invariant). Errors map to generic 400/401/409/500; internal detail never leaks.

**Rate limiter** (`rate_limit.rs`): in-memory per-client fixed window. Key = first
`X-Forwarded-For` hop → peer IP → `"unknown"`. `AISO_RL_MAX` (default 30) per
`AISO_RL_WINDOW_SECS` (default 60); `0` disables; over budget → `429`. Only register/login.

**DSAR erase** (`dsar_erase`): (1) tombstone `end_users.erased_at`; (2) revoke sessions;
(3) physically delete records + consent. The append-only `aiso_events` chain (hashes/metadata)
is retained. Returns `{sessions_revoked, records_deleted, consent_deleted}`.

### 2.2 Database (`crates/aiso-db`)

sqlx 0.8 (`runtime-tokio`, `tls-rustls`, `postgres`), **PostgreSQL 16**. Connect via
`DATABASE_URL` (`PgPool`, max 10, 5s acquire). **Runtime-checked** queries (compiles without a
live DB). Migrations embedded (`sqlx::migrate!("./migrations")`), applied by `Db::migrate()`.

| Table | Key columns | Notes |
|---|---|---|
| `end_users` | `id UUID PK` (v7), `pubkey BYTEA` (unique), `status` enum(active/suspended/revoked), `registered_at`, `erased_at` | `erased_at` = crypto-erasure tombstone |
| `aiso_events` | PK `(user_id, seq, created_at)`, `event_type`, `payload JSONB`, `actor`, `causation_id`, `prev_hash BYTEA` | **Append-only** (BEFORE UPDATE/DELETE trigger raises); **partitioned BY RANGE(created_at)** (+ default catch-all partition) |
| `encrypted_records` | `id UUID PK`, `user_id`, `kind`, `ciphertext BYTEA` (nonce‖ct‖tag), `wrapped_dek BYTEA`, `blind_index BYTEA` | indexes on `user_id`, `blind_index` |
| `consent_records` | `id UUID PK`, `user_id`, `action`, `context`, `signature`, `public_key`, `timestamp_us` | Ed25519-shaped consent ledger |
| `sessions` | `token_hash BYTEA PK` (=sha256(token)), `user_id`, `expires_at`, `revoked_at` | `resolve_token` filters `revoked_at IS NULL AND expires_at > now()` |
| `mfa_credentials` | `user_id UUID PK`, `state CHECK('pending','active')`, `secret_ciphertext`, `secret_wrapped_dek`, `recovery_hashes BYTEA[]`, `activated_at`, `last_used_at` | One optional TOTP enrollment; secret envelope-encrypted; recovery codes = SHA-256 hashes, removed on consume |

The **hash chain** (`events.rs::append_event`): each event's `prev_hash` = the prior event's
UUID; `seq` is per-user monotonic; inserted atomically. Extension `pgcrypto`.

### 2.3 Storage & KMS (`crates/aiso-storage`)

**`KmsProvider` trait** (`Send + Sync`, `async_trait`, keyed by `EndUserId` — per-user by
construction, no key-handle params): `create_user_master_key` (idempotent), `wrap_new_dek` →
`DekPair`, `unwrap_dek`, `erase_user_master_key` (canonical erasure; idempotent, irreversible),
`verify_user_master_key_erased` → bool (positive-evidence; transport error ≠ false "erased").

| Impl | Backing | Status |
|---|---|---|
| `LocalKmsProvider` | filesystem keystore, real AES-256-GCM | **production self-hosted tier** — gateway default |
| `VaultProvider` | Vault Transit (`vaultrs`) | test/dev/CI + external-Vault |
| `InMemoryKmsProvider` | in-memory | tests only |
| `AwsKmsProvider` / `GcpKmsProvider` | — | **named but not implemented** |

**Envelope scheme.** Master key = 32-byte AES-256, one hardened file per user
(`{prefix}-{sha256(uuid)[..16]}.key`, `0600`; dir `0700` — keeps UUIDs off-disk, prevents
traversal). Wrap: fresh 32-byte DEK, AES-256-GCM under master → `nonce(12)‖ct‖tag`. Record
payload: fresh DEK per call, AES-256-GCM, on-disk `nonce(12)‖ct‖tag(16)`. **Crypto-erasure**:
`erase_user_master_key` deletes the key file (fsyncs dir) → every wrapped DEK immediately
unrecoverable (no AWS-style 7-day window). `Plaintext` zeroizes on drop; `WrappedDek` has a
redacted `Debug`.

**Blind index** (`blind_index.rs`): a *system-wide* key (you must find a user before you know
them). `HMAC(key, domain_tag ‖ 0x00 ‖ plaintext)`, versioned domain tags (e.g.
`oidc/subject/v1`). Only impl `VaultBlindIndexProvider` — **not for production**. Erasing a
user does not erase blind-index hashes.

### 2.4 Identity (`crates/aiso-identity` + `-wasm`)

**Native** — schnorrkel 0.11 (Ristretto255 / sr25519). Domain label
`b"aiso-end-user-registration-v1"`. Canonical message =
`SHA-256( u32be(len)‖LABEL ‖ u32be(len)‖challenge ‖ u32be(len)‖pubkey )` (length-prefixed to
kill field-boundary ambiguity). `SchnorrkelVerifier.verify_simple`. Ships `#[ignore]` fuzz
gates: 100k valid-verify + 100k forgery-reject.

**WASM** (`crate-type=["cdylib","rlib"]`, minimal deps) — inlines the identical canonical
message. Exports `generate_identity() → hex(secret‖public)` and
`sign_registration(keypair_hex, challenge_hex) → JSON {challenge,signature,pubkey}` for
`/v1/register`. A native drift-guard test verifies wasm-signed proofs against the native
verifier. **Build:** `wasm-pack build --target web` in `crates/aiso-identity-wasm` (visualizer
consumes it via `file:` dep).

### 2.5 MFA (`crates/aiso-gateway/src/mfa.rs`)

TOTP via totp-rs 5.6: `SHA1, 6 digits, skew 1, 30s step`, issuer `"AISO"`, account = user UUID
(RFC 6238). Opt-in; login unaffected.

1. **enroll** — must be `NotEnrolled` (else 409); generates a TOTP secret, **seals it under the
   user's KMS master key**, generates `RECOVERY_CODE_COUNT = 8` codes (40 bits each) returned
   **once**, persists only SHA-256 hashes; state → `pending`; returns `otpauth://` URI.
2. **finalize** — requires `pending`; first valid TOTP → `active`.
3. **verify** — requires `active`; tries TOTP (decrypts sealed secret), then single-use
   recovery code; returns `{verified, method}` or 401.
4. **disable** — **step-up**: if `active`, the body must carry a valid current TOTP **or** a
   recovery code — a stolen bearer token alone cannot strip MFA. Idempotent when not active.

### 2.6 TENT reasoning server (`frontend/`)

TypeScript "TALK" HTTP API (`aiso-frontend`, ESM, Node ≥20). Entry `frontend/server/server.ts`
(raw `node:http`), built with **esbuild** → `dist/server.js`. Depends on `aiso-trinity`
(`file:../trinity-wasm/pkg`, build first) + `pg`.

**Endpoints:** `GET /health`; `GET /api/wells`; `GET /api/scroll`; `POST /api/query`;
`POST /api/qualia`; `GET /api/dictionary`; `GET /api/dictionary/term`; `GET /api/dsar/export`;
`POST /api/dsar/erase`; `POST /api/dsar/rectify`; `GET /api/consent`; `POST /api/consent`.
Sets security headers (nosniff, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, CSP).

**Env:** `PORT`=8422, `HOST`=0.0.0.0, `CORS_ORIGIN`=`*`, `SHUTDOWN_GRACE_MS`=10000,
`AISO_AUTH_REQUIRED`=false (when `"true"`, every `/api/*` needs a valid gateway bearer token,
validated against the shared `sessions` table; `/health` stays open), `AISO_GATEWAY_URL`
(verdicts forwarded via `POST /v1/events` to the caller's chain), `DATABASE_URL`.

**Pipeline** (`ReasoningPipeline.ts` via `CognitiveOrchestrator`): membrane (VoxelMembrane) →
routers (`gravitational-router`, `tent-router` GloveIndex, `dendritic-router`) → boxel
dispatcher → council tuning (`sparseplug.councilTuning`) → scroll (`Cell`, append-only
reasoning ledger). `/api/query` runs the pipeline, appends the verdict to the scroll store, and
(auth mode) forwards it to the gateway. Substantial working engine (88 test files); some
sub-modules (e.g. `trinity-stub.ts`) are explicit stubs for the WASM Trinity module.

### 2.7 Visualizer (`visualizer/`)

SvelteKit (Svelte 5, Vite, `nostr-tools`, `aiso-identity-wasm` via `file:`). Entry
`src/routes/+page.svelte`.

**Panels:** auth gate (register/login, "Restore from backup", **"Back Up Key"** →
`aiso-identity-backup.key`, Sign Out; shown when `VITE_AISO_AUTH=true`) · Wells Registry with
**well search filter** · Constraints/Scroll audit with **disposition filter**
(All/Active/Stricken/Superseded/Contested) · **Swarm Scroll panel** (gated by
`VITE_SWARM_NOSTR`).

**Env:** `VITE_AISO_AUTH`, `VITE_GATEWAY_URL` (`http://localhost:8090`), `VITE_SCROLL_URL`
(`http://localhost:8791`), `VITE_SWARM_NOSTR`, `VITE_NOSTR_RELAYS` (also overridable via
`?relays=`).

### 2.8 Build / run / test / deploy

| Task | Command |
|---|---|
| Rust build / test | `cargo build --workspace` · `cargo test --workspace` (**175** tests, no-DB) |
| DB + gateway integration (live PG) | `DATABASE_URL=postgres://postgres@localhost:5439/aiso_dev cargo test -p aiso-db -p aiso-gateway` |
| Schnorr fuzz gates | `cargo test -- --ignored` (100k valid + 100k forgery) |
| Gateway run | `aiso-gateway` binary; needs `DATABASE_URL`; `0.0.0.0:8090`; auto-migrates |
| Identity WASM | `wasm-pack build --target web` in `crates/aiso-identity-wasm` |
| Trinity WASM | `wasm-pack build --target web --out-dir pkg` in `trinity-wasm` (prereq for frontend) |
| Frontend | `npm --prefix frontend ci && npm --prefix frontend run verify && npm --prefix frontend run build && npm --prefix frontend start` |
| Frontend gate | `npm --prefix frontend run typecheck && npm --prefix frontend test` (**657/657**, 88 files) |
| Visualizer | `npm --prefix visualizer install && npm --prefix visualizer run build` (dev: `run dev`) |
| Local Postgres | Homebrew `postgresql@16`, port **5439** |

**Docker.** `Dockerfile` (TENT server :8422, 4 stages: rust wasm-pack → node ci → esbuild
bundle → runtime), `Dockerfile.gateway` (Rust gateway binary), `docker-compose.yml` (3
services: **db** `postgres:16` `${DB_PORT:-5439}`→5432; **gateway** :8090; **server** :8422
with `AISO_AUTH_REQUIRED=true`, `AISO_GATEWAY_URL=http://gateway:8090`). `docker compose up
--build`.

**CI** (`.github/workflows/ci.yml`, 6 jobs): frontend (wasm→ci→typecheck→test→tree-clean),
rust (`cargo test --workspace`), db-gateway (PG16 service), pav-mcp (sync suite; `tsc`
intentionally omitted — 47 pre-existing errors), docker (build+smoke `/health`), gateway-docker
(build + `docker compose config -q`).

---

## 3. Part II — HashCloud-SPE (storage substrate)

Rust workspace, 11 members, **140** tests (`cargo test --workspace`). The engineering code is on
the `main`/`claude/swarm-scroll` branch (its `origin/main` is an unrelated pitch-deck history —
never fast-forward one onto the other).

**Crate map**

| Layer | Crate | Role |
|---|---|---|
| Symbolic addressing | `symbolic-pointer-engine` | content → symbolic pointer; append-only store; rolling Merkle root; tri-runtime |
| Append-only log | `crates/consensus` | `Scroll` CRDT (lamport, frontier-rooted, `merge_event`), EigenCharge, resonance |
| The seam | `crates/scroll` | `SwarmScroll::append/get/export/merge`, `SyncBundle`, durability module |
| HTTP node | `crates/scroll-server` | the storage server (below) |
| Durable placement | `crates/storage` | Reed-Solomon 10+6=16, Capsule/Shard, UBC-manifold placement |
| Mesh transport | `crates/network` | TCP `MeshNode`, gossip; path-deps **rawkit** |
| Economics / proofs | `crates/economics`, `crates/verification` | DAS scoring, epoch rewards, Merkle-SAT, storage proofs |
| Solver / runtime | `crates/solver`, `crates/runtime` | CDCL learning; provider state machine, epoch manager |
| Simulation | `sim` | Phase-0 deterministic placement/fault/eviction harness |

### 3.1 Symbolic Pointer Engine (`symbolic-pointer-engine/src/lib.rs`)

**Node model:** `Word(String)` (sense-taggable `"word\x1ftag"`) · `Edge([u8;32], relation,
[u8;32])` · `Motif(Vec<[u8;32]>)` (ordered n-gram of child pointers). A pointer =
`hash_node` = SHA-256 over a domain-separated (`RTOP-v1`), tagged, length-prefixed
serialization. Edge/Motif hash over **child pointers**, so addressing is recursive/structural,
not a raw-byte hash (the Git/IPFS distinction, but semantic).

**API** (`SymbolicPointerEngine`): `intern(Node) → [u8;32]` (inserts iff absent — dedup by
address — bumps refcount, appends to the append-only log, advances the rolling root) ·
`get_node(&ptr)` (resolve) · `replay_root()` vs field `root` (`root == replay_root()` is the
tamper check). Rolling root: `root_n = SHA256(PREAMBLE ‖ root_{n-1} ‖ pos ‖ kind ‖ key)`. No
floats (I5). **WASM** (`WasmSPE`): `encode_corpus`, `decode_walk`, `root_hex`;
`wasm-pack build --target web`.

> **Tri-runtime golden root** (byte-identical Rust / WASM / Python):
> `92184ab9cc46a4863260c97e135e6bff46a32afec8299f79ae86593047400488`

_(`src/walk.rs` is active WIP — read only.)_

### 3.2 swarm-scroll seam (`crates/scroll`)

`SwarmScroll::new(node_id)`: `append(&str)` tokenizes → `intern(Word)` each → `intern(Motif)` =
document pointer, records a `ScrollEvent`; duplicates return a receipt with `deduped:true`.
`get(&ptr)` resolves motif children (recursing nested motifs) → text. `export(&ptr) →
SyncBundle`, `merge(SyncBundle) → Ok(true|false)`. `AppendReceipt {pointer, lamport,
frontier_root, spe_root, deduped}`. `SyncBundle {event: ScrollEvent, nodes: Vec<Node>}` (word
nodes in intern order then the motif, so a receiver reproduces identical pointers; serde — rides
HTTP `/scroll/sync` or a Nostr event `content`).

**Durability module:** `encode_and_place(...) → DurablePlan { capsule, shards(16),
placement (placement[0] = home), payload_len }`; `manifest_id` = the content's SPE pointer (one
address in scroll *and* storage). Home holds a replica of every shard (offline rebuild); offsite
replicas go to nearest offsite nodes on the UBC manifold. `SHARD_COUNT=16`,
`SHARD_DATA_COUNT=10`. scroll-server appends with `offsite_replicas=2, PrivacyTier::Private`.

### 3.3 Consensus CRDT (`crates/consensus/src/scroll.rs`)

`ScrollEvent {lamport_clock, node_id, payload_hash, eigencharge_*, event_type,
row_integrity_hash}`; `EventType` includes `SymbolicWrite`, `Checkpoint`. `Scroll` optionally
SQLite-backed (`open(db_path)`). **`merge_event`:** known `payload_hash` → `Ok(false)` (dedup);
same `lamport_clock` → keep the lexicographically greater `payload_hash` (structural HAM
tiebreak, no wall-clock); else binary-search insert (lamport order). Rejects `lamport <=
local_max` (replay protection). **Frontier root** = Merkle over sorted active `payload_hash`es →
order/identity-independent convergence. `EigenCharge::of/of_v2/tiebreak_cmp`; integer resonance
variant (`resonance_int.rs`) on the audit path.

### 3.4 scroll-server (`crates/scroll-server/src/main.rs`)

Axum. `app_with_peers()` builds the router; `app()` is the no-peer test variant.

| Method | Path | Purpose / response |
|---|---|---|
| GET | `/health` | `{"status":"ok"}` |
| GET | `/scroll` | `{len, frontier_root, spe_root, node_id, integrity_ok}` |
| POST | `/scroll/append` | intern→append→erasure-place→gossip; `{pointer, lamport, frontier_root, spe_root, deduped}`; empty → 400 |
| GET | `/scroll/get/{pointer}` | `{pointer, content}`; 404 unknown; 400 bad hex |
| GET | `/scroll/export/{pointer}` | `SyncBundle` `{event, nodes}`; 404 unknown |
| GET | `/scroll/durable/{pointer}` | `{shards:16, data_shards:10, survives_shard_losses:6, home, home_holds_all_shards, offsite_nodes, ...}` |
| POST | `/scroll/sync` | merge a peer bundle (idempotent); `{applied}`; 400 on reject |

**Env:** `PORT`=8791, `HOST`=0.0.0.0, `AISO_NODE_ID` (64 hex, home identity),
`AISO_PEERS` (comma-separated peer base URLs; empty = solo). **Gossip:** on a non-deduped
append, fire-and-forget POST of the bundle to each peer's `/scroll/sync` (errors logged, never
fail the write); `sync` does not re-gossip (star topology avoids loops). CORS fully open
(tighten per deployment).

### 3.5 storage / durability (`crates/storage`)

`erasure.rs`: `SHARD_DATA_COUNT=10`, `SHARD_PARITY_COUNT=6`, `SHARD_TOTAL=16` (Reed-Solomon,
`reed-solomon-erasure`); `encode_capsule`/`decode_shards` (needs ≥10; survives 6 losses).
`capsule.rs`: `Capsule`, `compute_manifest_root` (Merkle over shard hashes). `shard.rs`:
`Shard.verify`, `derive_ubc_id`, `compute_replica_nodes`. **Integer-exact placement (I5):**
`helitorus_dist_sq_int → u128` is the audit path (lexicographic `NodeId` tiebreak);
`helitorus_dist → f64` exists only off the audit path. **DAS eviction:** three consecutive
failed data-availability proofs → evict + reallocate (the `sim` Phase-0 behavior; economics
applies a `max_miss_streak ≥ 3 → 0.5` DAS multiplier).

### 3.6 network → rawkit (`crates/network`)

`MeshNode {new, add_peer, start→JoinHandle, stop}` — TCP mesh gossiping `ConstraintRepair`
events (`gossip.rs`, `message_bus.rs`, `protocol.rs`, `two_tier_ham.rs`). **Path-deps**
`rawkit-{core,sync,crypto}` from `/Users/coo-koba42/dev/rawkit` as the mesh crypto/transport
floor (also depends on `consensus` + `storage`).

### 3.7 Nostr transport (`docs/NOSTR_TRANSPORT.md`; client in the MVP visualizer)

DID-signed `SyncBundle`s over commodity Nostr relays, **kind 30078** (NIP-78), tag `['t',
swarm]`. Premise "Nostr = rawkit = GUN": one substrate = relays + pubkey/wallet identity +
eventual-consistency CRDT sync. A Nostr event *is* a DID-signed bundle (pubkey = identity,
schnorr `sig` = authorship, relay = transport). Client (`visualizer/src/lib/nostr-scroll.ts`):
`loadOrCreateIdentity` (pubkey = DID; optional Chia binding), `signBundle`, `verifyBundle`,
`SwarmNostr {publish, subscribe}` (self-echo-suppressed). Relays are untrusted forwarders —
integrity = event sig + SPE root; a relay can drop/reorder, not forge under a DID.

### 3.8 Other crates

| Crate | Summary | Tests |
|---|---|---|
| `economics` | DAS score `compute_das` (`DAS_MAX=1000`, `DAS_EVICTION_THRESHOLD=600`, `CHALLENGE_WINDOW_BLOCKS=32`; integer final value); epoch rewards | 12 |
| `verification` | `MerkleSAT::build/root/generate_proof` over the active constraint frontier; storage proofs | 7 |
| `solver` | constraint graph + CDCL conflict-clause learning | 8 |
| `runtime` | provider state machine; `EpochManager` (phases, challenge window, seed) | 8 |
| `sim` | Phase-0 deterministic placement/fault/eviction harness (3-failed-proof eviction; Weil-formula node charge over 500 Riemann zeros) | 31 |

**Per-crate counts:** consensus 26 · sim 31 · scroll 17 · SPE 17 · economics 12 ·
scroll-server 11 · solver 8 · runtime 8 · verification 7 · storage 3 · network 0 = **140**.

**Build/run:** `cargo test --workspace` · `cargo run -p scroll-server` (:8791) · two-node swarm
`AISO_PEERS=http://localhost:8791 PORT=8792 cargo run -p scroll-server` ·
`cd symbolic-pointer-engine && wasm-pack build --target web`.

**Invariants:** I2 append-only · I5 no floats on the audit path · I6 determinism (`root ==
replay_root()` bit-for-bit) · golden root above.

---

## 4. Part III — `aiso` (research / witness / settlement)

Rust workspace (`unsafe_code = "forbid"`, SIP-1.1) + Python harness + a research-side TS
frontend/visualizer + vendored data. **Rust workspace test count: 124** (green) — this is a
*different* workspace from the MVP's 175. Members: `trinity-wasm`, `aiso-witness`,
`settlement-tests`, `svs_step_circuit`, `aiso-common`, `aiso-identity`, `aiso-storage`
(**no** gateway/db).

**Per-crate:** aiso-storage 57 · settlement-tests 44 · aiso-identity 18 · svs_step_circuit 3 ·
aiso-common 1 · trinity-wasm 1 · aiso-witness 0 (its tests live in `witness_tests/` + Python).
The research-side frontend suite is separately ~622.

### 4.1 aiso-witness (the witness core)

`crates/aiso-witness` computes a **spectral-convergence witness** deterministically across
implementations (Rust ↔ Python) for the TENT/RH convergence work. Explicit epistemic boundary:
it establishes empirical `1/N` convergence but **proves no theorem** (RH not claimed).
Determinism: sequential ascending float64 summation only; equivalence gate `1e-12`. Free
functions: `evaluate_cosines`, `f_obs_grid_naive`, `f_obs_grid_kahan`, `f_pred_simple`,
`convergence_slope`. CLI `aiso-witness-cli` (stdin `WitnessRequest` → `WitnessResponse`) is the
cross-impl equivalence harness.

### 4.2 settlement-tests + clsp referee

CLVM/chialisp settlement referee validated from Rust (`clvmr` + `chia-bls`), 44 tests. Fixtures:
`fixtures/clsp/referee/onchain/referee.hex` (on-chain puzzle), `virtual_referee.clsp` (readable
Tier-B validator source), `unroll_primitive.hex`. The **virtual_referee** validates a 2-party
payment-channel state transition: curries `V_ID, A_PK, C_PK, SEQ, A_BAL, C_BAL` and enforces —
V_ID immutable, pubkeys immutable, `NEW_SEQ > SEQ_PREV`, balance conservation, and BLS
co-signature checks; `STATE_HASH` = shatree `sha256` Merkle commitment over all six new-state
fields. A **Tier-B CI audit** statically requires `STATE_HASH` to commit both V_ID and SEQ.

> **Two-phase timeout (WO-FRONTRUN-01):** timeout settlement splits into a commit/
> challenge-window-opening phase then payout. A timeout spend whose MOVE isn't `TIMEOUT_PENDING`
> pays nobody and emits **no `AGG_SIG_UNSAFE`** — that absence is the front-running defense.

`multiplayer_demo.rs`: `evaluate_channel_transition → TransitionVerdict` (JSON, mirrors a TS
type for the CDCL bridge) with preemption/parity rules + a BLS aggregate-verify gate. _(The
`fixtures/scratch/multiplayer_repo` opcode-83 is deliberate harness material — left untouched.)_

### 4.3 svs_step_circuit

A **Halo2 zk-SNARK step circuit** over BN254 (`halo2_proofs`, `halo2curves::bn256::Fr`,
`MockProver`). Hardcodes the BN254 scalar modulus + a full **Poseidon** round-constant/MDS
table; implements a Poseidon-hash "SVS" step relation as an arithmetization (one recursion step
in a proof system). 3 MockProver tests. The ZK proving component — smaller/experimental.

### 4.4 trinity-wasm (BRA + Vexel + Ulam kernel; package `aiso-trinity`)

Browser port of native `trinity_core.rs` with a behavior-preservation contract (every BRA
charge must equal native `libtrinity.so`; determinism test). Time passed from JS (no
SystemTime). Exposes: **BRA** (integer eigenvalue algebra, no floats on the charge path; 12k
`f369` table) — `EigenCharge {hash:u64, trace:i64, det:i64}`, `bra_eigen_charge(word)`,
`bra_resonance_score(a,b)`, `bra_verify_f369_table`; **Ulam** `ulam_coord(n)`; **Vexel**
`VexelSession` (append-only scroll w/ Merkle `root()`, `record`, `mixdown`, `export`/`restore`).
**Build:** `cd trinity-wasm && wasm-pack build --target web --out-dir pkg` (build before
`npm ci`; `pkg/` is an uncommitted artifact the TS frontends depend on via `file:`).

### 4.5 harness/

A reasoning/benchmark harness driving a local LLM (Phi-4-mini via Ollama; embeddings/probes
offloaded to NVIDIA NIM) through AISO's deterministic validation stack, then measuring/mapping
reasoning quality.
- **Validation loop:** query → LLM → four deterministic auditors (**H2** metaphor dissolution,
  **H3** epistemic grounding, **LG** loop guard, **IEC** intent-execution coherence) → up to 2
  correction passes → **council verdict** PROCEED/CAUTION/ABSTAIN/CHALLENGE (thresholds
  0.45/0.35/0.20; `resonance=(stability+density)/2`, `severity=0.79·r`, `mercy=0.21·r`,
  `mildness=r/φ`, ported from `boxel.ts` SEGGCI).
- **GSM8K sweeps** (`bench_gsm8k_aiso.py`, `gsm8k_aiso_results/`): key finding — math mode must
  use `MATH_SYSTEM_PROMPT` + a `CALC()` calculator tool, never the epistemic prompt on numeric
  benchmarks.
- **Seek phases** (`seek.py`): probe queries fill empty logic-space paths — Phase 1 BOUNDARY
  (built) probes the CLEAR↔OPAQUE transition; INTERPOLATION + FRONTIER are later stubs.
- **Groundedness judge** (`tensor_field.py::groundedness`, opt-in `AISO_FIELD_JUDGE=1`): an
  independent 0–1 rater — the signal that actually separates fog from clarity (the council
  verdict rates gibberish as "clear").
- **Dead-end map** (`dead_end_map_guide.md` + append-only `dead_end_paths.jsonl`): a spelunking
  ledger of logic paths that fail under the harness — each entry = trap, fix, invariant,
  evidence. (~379 result files under `*_results/` — machine output, not documentation; see
  [DOCS_AUDIT.md](DOCS_AUDIT.md).)

### 4.6 akashic/

Vendored JSON linguistic ground-truth (word-sense disambiguation / heteronym corpora) the
frontend imports at compile time: `wordnet_sense_key_registry.json`,
`heteronym_sense_inventory.json`, `heteronym_cooccurrence_falsifier.json`, + others, plus
`wsd_solver.py`. The 11 referenced files are vendored byte-identical so the repo is
self-contained (formerly an out-of-repo symlink).

### 4.7 Build / run / test

`cargo test --workspace` (124, green) · `cd trinity-wasm && wasm-pack build --target web
--out-dir pkg` (first) · `cd frontend && npm ci && npm run verify && npm run build && npm start`
(:8422) · harness: `ollama serve && ollama pull phi4-mini`, then `python
harness/phi_logic_nav.py -q "..."`.

---

## 5. Part IV — rawkit (L2 floor)

`github.com/koba42-official/Rawkit_Ai` — "**Decentralized vector-graph memory for AI agents.**
Graph + Vector + Crypto + Real-time Sync. Written in Rust." A clean-room Gun.js successor.

| Crate | Role |
|---|---|
| `rawkit-core` | graph + CRDT node/edge data model |
| `rawkit-crypto` | wallet identity + signing (crypto floor) |
| `rawkit-sync` | real-time eventual-consistency sync |
| `rawkit-vectors` | vector memory / similarity |
| `rawkit-server` | node server |

HashCloud-SPE's `crates/network` path-deps `rawkit-{core,sync,crypto}` as its mesh/crypto floor.
Shared premise with Nostr/GUN: pubkey identity + relays/peers + eventual-consistency CRDT sync.

## 6. Part V — TangTalk (P2P connectors)

A Chia wallet + dApp shell with Nostr/WebRTC P2P (Grove SFU audio, calls, Nostr-DID identity).
The MVP's `visualizer/src/lib/nostr-scroll.ts` reuses TangTalk's `src/lib/{text,identity}`
(`nostr-tools`) DID-signing + relay pub/sub. (Distributed as the `tangtalk-desktop` archive.)

---

## 7. Cross-cutting: security, invariants, data flows

### 7.1 Security model
- **Auth:** browser Schnorr keypair → proof-of-possession → opaque bearer token (32 random
  bytes; only its SHA-256 hash stored in `sessions`; 24h TTL) → per-user scoping on every
  `/v1/*`.
- **Per-user isolation** (invariant): no user reads/mutates another's events/records/consent/
  erasure; there is no cross-user code path.
- **Encryption at rest:** per-user envelope encryption (AES-256-GCM DEK wrapped by a per-user
  master key) via `LocalKmsProvider`; **crypto-erasure** deletes the master key → all wrapped
  DEKs instantly unrecoverable.
- **MFA:** optional TOTP (RFC 6238), secret sealed under the user's KMS master key, 8 SHA-256-
  hashed recovery codes, **step-up** on disable (a stolen token alone cannot strip MFA).
- **Never leak internals:** handlers map errors to generic client messages.
- **Rate limiting** on public register/login (`AISO_RL_MAX`/`AISO_RL_WINDOW_SECS`).
- **Compliance:** GDPR DSAR erasure with physical purge (Art. 17); Ed25519-shaped consent ledger
  (`action ‖ 0x1f ‖ context ‖ 0x1f ‖ timestamp_us`).
- **Transport trust:** Nostr relays are untrusted forwarders; integrity rests on the DID
  signature + SPE root, not the relay.

### 7.2 Invariants (system-wide)
- **I2 — append-only:** scroll events and `aiso_events` are hash-chained, never rewritten
  (DB-enforced trigger; CRDT `merge_event` only tiebreaks, never deletes).
- **I5 — no floats on the audit path:** pointers/roots are hash/integer only; placement is
  integer-exact (`helitorus_dist_sq_int → u128`); BRA charges are integer triples.
- **I6 — determinism:** same input → same pointers/roots; `root == replay_root()` bit-for-bit;
  tri-runtime golden root `92184ab9…0488`.
- **MVP reasoning ladder:** every routing decision exits with one of four Council verdicts;
  every scroll event contributes to the Merkle root.

### 7.3 End-to-end data flows
1. **Write → store → converge.** device `POST {scroll-server}/scroll/append` → SPE intern →
   `SymbolicWrite` on the Scroll → erasure-code 16 shards (home holds all) → gossip the
   `SyncBundle` (HTTP `/scroll/sync` and/or DID-signed Nostr kind 30078) → peers `merge_event`
   → identical frontier root. (Proven: two independent browsers converge on one scroll.)
2. **Reason → verdict → record.** query → TENT `POST /api/query` → membrane → routers → boxel →
   Council (severity/mercy/mildness) → one of four verdicts (incl. ABSTAIN) → verdict appended
   to the reasoning scroll and (auth mode) forwarded to the gateway's per-user hash-chained
   `aiso_events`.
3. **Auth.** browser WASM keygen → `POST /v1/register`|`/v1/login` (Schnorr proof) → bearer
   token → authenticated `/v1/*`.

---

## 8. Operations: env vars, ports, runbook, status

### 8.1 Ports
| Service | Default port | Repo |
|---|---|---|
| aiso-gateway | **8090** | AISO-UI-for-Ai |
| TENT / TALK server | **8422** | AISO-UI-for-Ai (+ aiso research copy) |
| scroll-server | **8791** | HashCloud-SPE |
| Postgres (local) | **5439** → 5432 | AISO-UI-for-Ai |

### 8.2 Consolidated env-var reference
| Var | Service | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | gateway, db, TENT(auth) | — | Postgres DSN (required) |
| `HOST` / `PORT` | gateway | `0.0.0.0` / `8090` | bind |
| `AISO_RL_MAX` / `AISO_RL_WINDOW_SECS` | gateway | `30` / `60` | register/login rate limit (`0`=off) |
| `PORT`/`HOST`/`CORS_ORIGIN`/`SHUTDOWN_GRACE_MS` | TENT server | `8422`/`0.0.0.0`/`*`/`10000` | server config |
| `AISO_AUTH_REQUIRED` | TENT server | `false` | require gateway bearer on `/api/*` |
| `AISO_GATEWAY_URL` | TENT server | — | where to forward per-user verdicts |
| `VITE_AISO_AUTH` | visualizer | off | enable login gate |
| `VITE_GATEWAY_URL` | visualizer | `http://localhost:8090` | gateway |
| `VITE_SCROLL_URL` | visualizer | `http://localhost:8791` | scroll-server |
| `VITE_SWARM_NOSTR` / `VITE_NOSTR_RELAYS` | visualizer | off / — | Nostr swarm + relays |
| `PORT`/`HOST` | scroll-server | `8791`/`0.0.0.0` | bind |
| `AISO_NODE_ID` | scroll-server | `0x11…` | 64-hex home node identity |
| `AISO_PEERS` | scroll-server | — | comma-separated peer base URLs |

### 8.3 Full-stack local bring-up
```bash
# 1. storage node (HashCloud-SPE)
cd ~/dev/HashCloud-SPE && cargo run -p scroll-server              # :8791

# 2. database (AISO-UI-for-Ai) — or use docker compose
brew services start postgresql@16   # local PG on :5439
createdb -p 5439 aiso_dev

# 3. build the WASM the frontends need
cd ~/dev/AISO-UI-for-Ai/crates/aiso-identity-wasm && wasm-pack build --target web
cd ~/dev/AISO-UI-for-Ai/trinity-wasm && wasm-pack build --target web --out-dir pkg

# 4. gateway + TENT server + visualizer
cd ~/dev/AISO-UI-for-Ai
DATABASE_URL=postgres://postgres@localhost:5439/aiso_dev cargo run -p aiso-gateway   # :8090
npm --prefix frontend ci && npm --prefix frontend run build && npm --prefix frontend start  # :8422
VITE_AISO_AUTH=true VITE_SCROLL_URL=http://localhost:8791 npm --prefix visualizer run dev
#   add VITE_SWARM_NOSTR=true for the Nostr swarm

# …or the whole MVP backend in one command:
docker compose up --build      # db + gateway(:8090) + server(:8422)
```

### 8.4 Test status (source: [VALIDATION_2026-07-12.md](VALIDATION_2026-07-12.md))
| Layer | Result |
|---|---|
| HashCloud-SPE Rust workspace | **140** passed |
| AISO-UI-for-Ai Rust workspace (no-DB) | **175** passed |
| aiso Rust workspace (research/witness/settlement) | **124** passed |
| aiso-db integration (live PG) | 7/7 |
| aiso-gateway integration (live PG) | 10/10 + 4 lib |
| frontend gate (AISO-UI-for-Ai) | **657/657** (88 files) |
| frontend suite (aiso research copy) | ~622 |
| visualizer production build | clean |
| Nostr identity / transport / two-browser convergence | pass |

---

## 9. Glossary

- **SPE (Symbolic Pointer Engine)** — interns content into a *symbolic pointer* (a
  meaning/structure address, not a byte hash) via `Word`/`Edge`/`Motif` nodes.
- **Scroll / swarm scroll** — the append-only, lamport-ordered, frontier-rooted CRDT log the
  mesh syncs.
- **SyncBundle** — the gossip unit (a `ScrollEvent` + the `Node`s to reproduce its pointers).
- **Frontier / rolling Merkle root** — the deterministic hash summarizing scroll (or SPE) state;
  equality across peers = convergence; `root == replay_root()` = tamper check.
- **DID** — a Nostr-pubkey identity that signs a bundle (pubkey=identity, sig=authorship,
  relay=transport).
- **KMS master key / DEK / wrapped DEK** — per-user master key wraps a per-record data key;
  deleting the master key crypto-erases the user.
- **Council verdict** — the trust engine's exit: one of PROCEED / CAUTION / ABSTAIN / CHALLENGE
  (`severity=0.79·r`, `mercy=0.21·r`, `mildness=r/φ`).
- **Vexel / Vixel / Voxel / Boxel** — the trust engine's scale-invariant units (structure at
  each scale); **well** — a keyword-anchored attractor; **motif** — a document as an ordered set
  of word pointers.
- **TENT** — TensorRent Intent-Topology (the reasoning server + L1–L4 routing).
- **BRA / Trinity** — the WASM charge kernel (integer BRA charge algebra + Vexel scroll + Ulam
  spiral).
- **DAS** — data-availability sampling/score; three consecutive failed proofs → eviction.
- **Referee / virtual_referee** — the CLVM payment-channel settlement validator (2-phase
  timeout, WO-FRONTRUN-01).

---

## 10. License

The entire AISO system — every repository above — is governed by the **Sovereign Integrity
Protocol License (SIP License v1.1)**. Copyright © 2026 Brad Wallace / TensorRent
(<https://github.com/tensorrent>). Full text: [`LICENSE`](../LICENSE) (repo root) and
[`docs/LICENSE.md`](LICENSE.md).

In brief (the license text governs — this summary does not):
- **Free** for Personal, Family, Educational, and self-study use — use, study, modify, run, and
  distribute derivatives, provided the copyright notice and full license are retained.
- **Commercial / cloud / SaaS / any Financial Gain** requires a **prior written commercial
  license** (default 5% royalty of gross revenue, perpetual).
- **Unlicensed commercial use** triggers automatic, non-negotiable, perpetual penalties (an
  8.4% obligation that follows the product and survives sale/bankruptcy/transfer).
- Provided **"AS IS"**, no warranties. For commercial licensing contact Brad Wallace via
  <https://github.com/tensorrent>.

---

_This manual is verified against source as of 2026-07-12. When code changes a route, table, env
var, or command, update the matching row here in the same change — drift is a bug. See
[CAPABILITIES.md](CAPABILITIES.md) for the shorter per-piece when/how index and
[DOCS_AUDIT.md](DOCS_AUDIT.md) for the doc-quality map._
