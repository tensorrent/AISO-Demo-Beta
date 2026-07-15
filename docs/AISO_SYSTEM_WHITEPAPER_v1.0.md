# AISO — System Whitepaper

### A Universal Trust Engine with Transparent, Auditable Constraints
**TensorRent · v1.0 · June 2026**

> **Status & provenance.** This is the full-length technical description of AISO as it currently stands. Component counts, test numbers, and performance figures are read from a committed, file-cited system index (`aiso/docs/SYSTEM_INDEX_2026-06-21.md`, SHA `030d0954e1aa3a5c6eda105e7110e73a38c7bdd99f4b73b2aec9d975dbe9665c`), with every suite run at index time — not reconstructed from memory. Every figure is labeled by *what it measures*. Where a measured figure was smaller than an inherited one, the measured figure is the one recorded. Mechanisms that are specified but not yet built, hashes that are development stand-ins, and a mathematical correspondence whose tier is still being confirmed against source are all marked as such. Nothing here is stated more strongly than the evidence supports.

---

## Abstract

AISO is a universal trust engine with transparent, auditable constraints: engineering substrate that keeps a reasoning process deterministic, reproducible, and auditable even when AI components are in the loop. Its determination mechanism is a **reductive constraint model** — a query reduces to typed constraints that propagate to dispositions, and the answer is whatever survives the reduction, with every rejected possibility kept as a struck record rather than silently dropped. Its correctness floor is a machine-checked, confluent term-rewriting system: *same logical content → same canonical form → same hash* is a theorem, not a hope. Above that floor sits an integer compute kernel (no floating-point on any identity-bearing path), a CPU-first device-adaptive runtime, a hash-chained Merkle-rooted provenance scroll, a trust-graph dynamics layer, an edge-sync protocol, and a browser-sovereign platform shell — each a part of the same trust engine wired at a different scale. This paper describes the problem AISO solves, the full architecture layer by layer, the proven core, the mathematical substrate it descends from, the current capabilities and honestly-labeled benchmarks, and the methodology that keeps the claims disciplined. The single sentence that survives compression: **AISO computes trust as what survives a transparent, auditable constraint reduction.**

---

# Part I — Problem & Thesis

## 1. The problem: the Markov chain of logic

A *Markov chain of logic* is a chain of states joined by deterministic, inspectable transitions: every step auditable, every step reproducible, the chain composing forward without drift. Commodity AI breaks this in three ways. It introduces **variables** — the same prompt produces different outputs across days, model versions, sampling temperature, and hidden context, so the experiment cannot be repeated. Its outputs are **sampled, not computed** — two "identical" runs draw two different reasoning paths from a probability distribution rather than executing a procedure. And it offers **no audit trail** — a post-hoc explanation is a rationalization, not the computation that produced the answer. Together these break compositionality: by step five of a reasoning chain there is no way to know whether the chain still tracks the original problem or has drifted into the model's priors.

AISO is engineering substrate for restoring the Markov chain of logic when AI components are part of the system. It does not replace the model; it surrounds the parts that must be deterministic with parts that *are*.

## 2. What AISO is: trust as output, response-only as method

AISO computes **trust** — not answers, not recommendations, not rankings. Trust is the output, and it is computed not by accumulating positive signal (clicks, likes, votes) but by showing which constraints are **active, stricken, superseded, or contested**. Trust is what survives the constraint structure. The operation is *transparent* — the constraint structure is visible while it is applied, not explained after the fact — and *auditable* — the chain can be replayed, verified, and contested.

The structural source of the system's determinism is a **response-only** discipline: each layer responds to its purpose rather than generating novel output, and only the originating intent creates. Standard models *create* — they sample, and each output is novel and unrepeatable, which is precisely the property that breaks the chain. AISO's layers do not create; they respond. A unit's function comes from its *position* in the structure, not from any intrinsic property — the same primitive is one kind of cell in one column and another kind in another. Determinism follows from response-only behaviour; response-only behaviour follows from each layer being bound to its purpose.

---

# Part II — Architecture

## 3. The system, end to end

AISO is a stack of components, each a part of the same trust engine wired at a different scale. Reading from the mathematical floor upward:

- **The substrate model** (§4) — the discipline that makes audit possible at all: exact integer identity, lossy float projection, never confused.
- **The canonicalizer** (§5) — the machine-checked rewrite system that guarantees logically identical traces normalize to identical hashes. The proven core.
- **The determination core** (§§6–9) — the reductive transparent-constraint engine (CDCL), the L0–L4 routing pipeline that feeds it, the RYS fixed-point layer that supplies its stability discriminator, and the hash-chained scroll that records every decision.
- **The compute floor** (§§10–12) — the BRA/Trinity integer kernel, the CUDNT prime-aligned compute simulator (with its honest performance reality), and SparsePlug device adaptation so the system runs on edge hardware.
- **Integration & platform** (§§13–17) — the capsule cell (manifold addressing, zero-knowledge identity, Merkle-SAT), the CDTGS trust-graph dynamics, SEGGCI motif memory, the PAV-MCP edge-sync protocol, and the browser-sovereign SvelteKit + WASM shell.
- **The mathematical substrate** (§§18–19) — the information-asymmetry (ΔI) theory the constraint dynamics descend from, and the witness battery that validates the numerical substrate to bit-level across implementations.
- **Evidence & discipline** (§§20–22) — the honest benchmarks, the four-tier verification scale, the asymmetric loop build process, and the honest scope boundaries.

The structure is *self-similar*: the same three-part pattern — a position, a field of constraints at that position, and a resulting deflection — recurs at every scale, and the methodology that builds the system (a council of specialized agents arbitrated by one human, §21) is the same pattern one level up.

## 4. The substrate model: Truth / Equivalence / Projection

Before any constraint is reduced or any record is written, the substrate must guarantee that *logically identical computations produce identically equal representations*. The rule that secures it: separate exact **Truth** from lossy **Projection**, and never let a value a hash depends on be produced by non-deterministic float arithmetic.

The justification is concrete. Floating-point addition is not associative — `(a + b) + c` can differ from `a + (b + c)` in the low bits — so a value on an identity-bearing path produced by float arithmetic whose order could vary can hash two ways for one logical input, and the audit trail silently lies. AISO therefore keeps identity-bearing paths **integer**: the token fingerprint that drives routing and addressing is a pure-integer triple (§10), equivalence is decided structurally, and where a continuous quantity must drive a reproducible decision it is **quantized** before it decides — the system replaces float cosine similarity with integer L1 distance over 16-bit-quantized vectors. Floats are not banned; they live at *projection* — wave-packet rendering, proximity visualization, the council's scalar scores — where the result is shown or analyzed but never re-enters an identity computation. The blunt form, for a contributor: if a hash can see it, prefer an integer; if it must be continuous, quantize it before it decides anything.

## 5. The proven core: the canonicalizer

Underneath the constraint engine sits the part held to proof-assistant standard. The canonicalizer is a term-rewriting system over operation traces — a trace is a list of operations, each carrying a level, a sort key, and a projection flag — that reduces any trace to a unique normal form by sorting adjacent out-of-order operations and stripping projection flags. Its three properties are carried to a machine-checked **Coq** proof:

- **Termination** — a disorder measure strictly decreases on every rewrite, so no reduction runs forever.
- **Confluence (Church–Rosser)** — if a trace reduces two ways, both reach a common form; reduction order does not change the result.
- **Unique normal form** — every trace reduces to exactly one irreducible form.

The proof is **axiom-free**, verified by inspecting the assumptions of the confluence theorem in the proof assistant. This is the load-bearing guarantee of the whole system: it makes *"same logical content → same canonical form → same hash"* a theorem, and therefore makes the audit trail trustworthy at all — if confluence were only usually true, the hash chain would only usually mean what it claims. This is the system's one **Tier-2 (proved)** result; everything built on it inherits a floor it could not otherwise have. (A focused treatment is the companion rewrite-system whitepaper.)

---

# Part III — The Determination Core

## 6. The reductive transparent-constraint model

This is the heart of the system. A query does not get *scored for similarity and matched to a winner*; it gets *reduced through constraints*. In the routing engine a query produces a set of typed `RoutingConstraint`s — seven shapes covering valid matches, the several kinds of rejection, resolved and oscillating fixed points, and procedural chain-steps — each carrying an information-asymmetry measure **ΔI** computed at construction. The constraints propagate by confidence and resolve into a `ClauseDisposition`, of which there are four:

- **Active** — the constraint is in force; the query routes.
- **StrickenBy** — the constraint is rejected, but *visibly*: the rule, the epoch, the reason, and the ΔI are all preserved on the record.
- **Superseded** — replaced by a newer clause; the original stays.
- **Contested** — multiple clauses disagree; all positions are kept.

The reduction is **deterministic** — same input, same disposition, bit-for-bit — and **nothing is deleted**: a rejected query becomes a `StrickenBy` record with full provenance, not a silent drop, so the scroll grows richer rather than leaner. Propagation is incremental: each constraint registers on a *watch list* keyed to its target well, so re-evaluation touches only the clauses that could have changed, giving `O(1)` propagation per step; a disagreement above a confidence margin on the same well is recorded as a learned conflict, and an oscillating fixed point triggers a backjump. This is what makes "the answer is what survives the reduction" a literal, auditable statement rather than a slogan: the contract-redline model — strike with provenance, never erase — runs all the way down.

**Current state, stated honestly.** The reduction today constructs two of its four dispositions — `Active` and `StrickenBy`. `Contested` and `Superseded` are defined but not yet produced by the routing layer, and the reduction leans on two corpus-fitted thresholds: a stability/confidence cutoff of `0.3` that is overloaded across three jobs (gating propagation, splitting dispositions, and setting conflict sensitivity), and a `0.65` stability boundary separating route from reject at dispatch. The active line of work is to make genuine ambiguity — a query matching several wells inside one ΔI band, or a fixed point that is lexically stable but semantically unresolved — reduce to `Contested` rather than passing through a thresholded `Active`. That simultaneously completes the disposition set and retires the magic thresholds: a contested thing is *shown* contested, not rounded to a pass. A working template already exists one layer over (§14), where all four dispositions are defined and counted.

## 7. The routing pipeline (L0–L4)

The pipeline is what produces the constraints the engine reduces. It takes raw query text and decides, deterministically, which of **65 domain wells** it belongs to, or that it belongs to none. Tokens are reduced to integer charges (§10) and matched against each well's keyword charges by integer resonance; a well's score is the fraction of query tokens that hit it (density) and the number of *distinct* keywords matched (bands). The gates fire in order — a register gate upstream rejects rhetorical or hyperbolic input first (so most noise dies as a register rejection, not a near-miss), then a density floor, then a band gate that rejects single-keyword matches unless density is high. When the runner-up is within 90% of the leader, mean GloVe embeddings break the tie with a margin so near-ties don't flap; the embeddings are a tie-breaker only, never the primary router. The sort is total — density, then bands, then index — so the result is bit-for-bit reproducible, and every rejection records the gate that produced it, which becomes the struck clause's reason.

The pipeline is the most mature part of the engine, and its honest ceiling has been measured: **76.8% held-out routing-classification accuracy** (149/194 queries) — the figure that reflects generalization, not the in-sample number on tuned vocabulary — with **0% false-positive routes** on pure-noise sets. The engine maps a query to the correct specialist well; it does not solve the problems the corpus is derived from. (See §20 on why 76.8%, not the earlier 100%, is the number stated.)

## 8. RYS: fixed-point convergence

RYS turns a single routing pass into a fixed-point computation. It re-runs the query with the matched well's context folded in at a fixed weight, up to an iteration ceiling; if the well repeats, it converges and emits a resolved fixed point with a **stability** score in `[0,1]`; if it cycles, it emits an oscillating constraint, which the engine treats as a backjump. The full trajectory — every iteration's well, density, and bands — is kept, so convergence is replayable rather than asserted. On the corpora it was built against, clean signal converges immediately at high stability while adversarial leakers either oscillate or converge weakly. The stability score is the discriminator the determination layer needs to complete itself: a *weak* fixed point — lexically settled but low-stability — is exactly the `Contested` signal the engine does not yet act on (§6). RYS already computes the discriminator; the missing link is downstream.

## 9. The scroll & provenance

The engine *decides*; the scroll *records the decision permanently and provably*. It is an append-only, hash-chained, Merkle-rooted log of every routing event. Each record stores the hash of the previous record, so any tamper breaks the chain downstream of the edit; each record's self-hash is recomputed on verification, so any field change is caught; at each epoch boundary a single Merkle root is computed over the epoch's records as the integrity proof for the whole segment. A later decision never rewrites an earlier one — it appends a *compensating* event pointing at the superseded record, leaving the original in place. The event types span both the reasoning scroll (route assignments, struck constraints carrying the same provenance as the disposition, learned conflicts, supersessions, epoch summaries) and the storage/economic layer (provider proofs and rewards). The engine that ties this together is named `ConsensusEngine` but is explicitly *not* a consensus model — there is no voting; it is the transparent constraint engine, and its guiding line is to seek coherence under irreducible disagreement rather than agreement.

**Two honest seams.** The Phase-0 hash is a double-MD5 packed into 32 bytes, flagged in-source as a stand-in for SHA-256 — deterministic and tamper-detecting for development, but not yet cryptographically equivalent; swapping in real SHA-256 is the first thing to change before any security claim. And chain continuity across process restarts is a named TODO: a single run chains correctly, but on reopen the previous hash is not yet recovered from disk. The model is sound; two pieces of its production hardening are not done.

---

# Part IV — The Compute Floor

## 10. BRA / Trinity: the integer compute floor

BRA (Bind–Rotate–Align) turns a token into a deterministic integer spectral fingerprint — the `EigenCharge` the routing pipeline compares. Its defining discipline is the substrate rule made concrete in the hottest inner loop: **no float on the charge path.** The charge is a 24-byte triple — an FNV-1a hash, an integer trace summed over a 512-entry compile-time lattice (the "F369" table, self-checked against fixed anchors at startup), and an integer determinant with a cross-term — computed in one pass over the bytes, with each byte's lattice index rotated by its position. Comparison is three-tier: exact (all three components match), harmonic (trace and determinant within integer thresholds), or none. The single floating-point step in the crate is a Coulomb-style proximity used only for analysis; similarity that must *decide* a route goes through the integer quantize-then-compare path instead. A Gabor wave-packet renderer exists for visualization and is checked against its analytical form to better than `1e-14`, but its output is projection and never re-enters a charge. The kernel exposes a stable C-ABI — the boundary the native Trinity build calls — with a load-time self-check. It is the most production-shaped of the compute parts; its design *claims* (the lattice structure, the deliberate 16-bit quantization width) are asserted with startup anchors rather than proven — engineering assumptions backed by self-checks, not theorems.

## 11. CUDNT: the Wallace transform and the honest performance reality

CUDNT is a CPU-first compute simulator exploring Prime-Aligned Computing — restructuring matrix and vector arithmetic around prime boundaries and golden-ratio scaling via a non-linear "Wallace transform," with a dual mode that either computes the exact result (while generating prime-alignment metrics as a side channel) or runs the domain-transformed path. Its honest reality is the point of including it: although the transformed path scales as a lower theoretical exponent, **running the high-precision simulation in Python on standard CPUs is slower in practice, not faster** — a standard matrix multiply that takes ~0.011s takes ~1.8s through the simulated transform. Measured as a speedup, that is **0.00×–0.01×**. CUDNT is therefore kept as an advisory research benchmark and is **not** integrated into the hot routing path. An earlier figure suggesting a large speedup was withdrawn the moment a live wall-clock test contradicted it — the methodology (§21) operating exactly as intended. (The exact mode does preserve bit-exact linear-algebra results; the honest negative is about the *transformed* path's wall-clock cost on CPU.)

## 12. SparsePlug: device profiling and sparsity adaptation

SparsePlug adapts the system's compute intensity to the host. It profiles CPU cores, RAM, and WebGPU availability at runtime and selects one of three deterministic profiles — *dense* (high-end accelerator: 65 active wells, GloVe enabled, more budget), *balanced* (mid-range), or *sparse* (CPU-only: 8 active wells, GloVe disabled to skip the cosine cost, minimal budget) — gating active well counts, fallback logic, and decode parameters accordingly. The same hardware snapshot yields the same profile and the same signed decision record, bit-for-bit; decode temperature is locked at zero so generation stays deterministic; and a WebGPU failure falls back silently to sparse rather than crashing. This is what lets one seed run from a workstation to a phone without a different codebase.

---

# Part V — Integration & Platform

## 13. The capsule layer: ingest, identity, and placement

The capsule is the integration cell. On ingest it runs a four-step orchestration over a query — route (the constraint and its disposition, §6), match the procedural chain-step, deliberate (the council's verdict and mildness, §below), and learn (the seed absorbs the active or struck signal) — and then places data shards. Addressing is geometric: shards, providers, and wells are mapped to coordinates on a 4-D "helitorus" manifold (a golden-angle angular coordinate, a √2 axial coordinate, a prime-wave spectral coordinate modulated by a fixed resonance, and a Liouville-parity coordinate), and a shard is placed on the nearest provider clearing a data-availability floor, by manifold distance. Provider identity is proved without disclosure by a Schnorr-style zero-knowledge sigma protocol under a Fiat-Shamir challenge, and constraint satisfaction is checked in log-space via a Merkle-SAT tree over the clauses. The cell also carries a ℤ/3ℤ grading drawn from the mathematical substrate. The same two honest seams recur here — the address hash is the MD5 stand-in pending SHA-256, and the Liouville parity is computed on an XOR-folded 32-bit reduction rather than the raw 64-bit value (a deliberate speed trade, since honest trial division to the 64-bit square root would hang) — both flagged in-source.

## 14. CDTGS: the trust-graph dynamics

CDTGS — the Constraint-Driven Trust Graph System — is the trust engine applied to a graph of actors: users, devices, agents, storage nodes, compute donors. Each node carries a state (a ghost/behavioral-continuity score, a current trust, a history score, an anomaly penalty, an append-only memory depth) and its trust evolves by a sigmoid of a weighted sum — ghost, peer-attested trust, history, minus anomaly — run synchronously off a snapshot so the result is independent of iteration order. Five security levels gate actions by trust threshold, peer-attestation count, and whether behavioral verification is required (from an open ephemeral level up to a sovereign level demanding the highest trust, several peers, and an active ghost). Routing prefers trusted, capable paths via a Dijkstra cost that falls as trust and edge capacity rise, and a swarm-gossip step diffuses trust across devices toward agreement — explicitly *not* identity, just a local emission filter on outgoing trust. Critically, **this layer defines all four constraint dispositions** — active, stricken, superseded, and contested — and counts contested constraints in its statistics. It is the most complete expression of the transparent-constraint model in the codebase, and the working reference for the `Contested`/`Superseded` work the routing layer (§6) still owes.

## 15. SEGGCI & motif memory

SEGGCI coordinates the high-level reasoning flow; its retention layer is a **motif memory** — an append-only, lossless event scroll compressed by recognizing repeating patterns. Each reasoning step is an event (like a note); a recurring sequence (a phrase) is stored once and referenced thereafter, so memory shrinks without anything being deleted. The structure preserves a **prime-signature homomorphism**: the encoding of a merge equals the composition of the encodings, so keyword-count composition is additive over appends and maps injectively into prime-signature space — which is why event-level deduplication, keyword capping, and aging are forbidden (they would break the homomorphism). The homomorphism was verified live on 990 pairs with zero collisions (canonical seed `20260423`), and the compression meets its target coverage and throughput. Append, motif detection, windowed rendering, and round-trip serialization are all covered by the frontend suite.

## 16. PAV-MCP: adaptive vocabulary sync

PAV-MCP is the synchronization layer between edge nodes and the home server. It diffs two directories in `O(log N)` by descending only into Merkle subtrees whose hashes differ, classifies each divergence (only-edge, only-home, identical, fast-forward, stale, disjoint, fork, or sanctioned override), and merges only what is safe: a fast-forward that extends history is appended after its chain signature is verified, while a fork or disjoint history is *flagged as a conflict rather than auto-merged*. History is strictly append-only — resolving a branch is recorded as a resolve event, keeping both sides — and every incoming change must pass both the Merkle comparison and an explicit chain-signature check, which is what catches a "Class-2 tamper" (content altered without updating its event hashes). Unmerged forks are logged as sync-conflict records; nothing diverges silently.

## 17. The platform shell: SvelteKit visualizer + Trinity WASM

The shell bridges the browser and the Rust core. The BRA integer algebra and the session engine are compiled to WebAssembly (Trinity WASM) and driven by a SvelteKit transparent-constraint visualizer that shows the live disposition structure — active, stricken, superseded, contested — and the current Merkle root as a query is processed. The WASM build holds the same discipline as the native one: the charge computation is pure integer and must equal the native library byte-for-byte (enforced by determinism tests), and the WASM core is **clock-passive** — it never reads system time, taking all timestamps as parameters from JavaScript, so the browser target stays deterministic. The one FFI sharp edge is documented: Rust 64-bit integers cross to JavaScript as `BigInt` (the bit pattern is preserved, but large hashes appear signed), and visualizer session state is in-memory only — refreshing clears it, as persistence in the shell is deferred. The frontend host, grammar pre-pass, and orchestrator are the most heavily tested layer of the platform.

---

# Part VI — The Mathematical Substrate

## 18. Information asymmetry (ΔI) and the ACS foundation

The constraint-and-reduction structure descends from a mathematical program developed in parallel: **Asymmetric Constraint Systems** (ACS), whose governing scalar is the **net transfer-entropy asymmetry**, ΔI(X→Y) = TE(X→Y) − TE(Y→X) — the direction and magnitude of information flow between two coupled processes. Its sign is a chirality: ΔI > 0 means structure drives behaviour, ΔI < 0 means behaviour overrides structure, and ΔI = 0 is the symmetric attractor toward which the dynamics flow. Expanded in coupling strength, ΔI has a first-order direct-coupling term and a second-order term carrying the **Lie bracket** [f,g] of the underlying vector fields — the first emergent level of asymmetry, present only when the fields do not commute. The connection to the engine is structural: RYS iteration depth corresponds to expansion order — depth 0 the direct term, depth 1 folding in the bracket — and a true fixed point is where ΔI stops changing, so the stability score is, in this reading, a proxy for the residual asymmetry at convergence.

**The tier boundary, stated carefully.** The ACS program's finite-dimensional algebraic results — over `sl(4,ℝ)` — are machine-verified in its own code, and that ledger is the authority for which results are proved, which are numerically checked, and which were falsified. The order-by-order **correspondence between transfer entropy and the Baker–Campbell–Hausdorff series** is the load-bearing link this section rests on, and its exact tier is being confirmed against that ledger: the bracket correspondence carries a documented **analogy-only** limitation (the Wronskian bracket fails the Leibniz rule by a −fgh′ term; a related universal-inversion result is representation-specific), so the correspondence is presented here as a *structural* one — symbolically verified to finite order — rather than a closed morphism, pending that confirmation. The extension to infinite-dimensional Palatini field spaces is explicitly **conjectured**, not proved. Results imported from this theory enter the engineering as candidates to be re-verified in the implementation, never as adopted facts; the theory's full claim ledger lives in its own documents.

## 19. The witness battery: empirical spectral validation

The witness battery is the substrate's numerical validation layer. It verifies that the computation of spectral witnesses over a large set of Riemann zeros is **bit-exact and reproducible across Python, native Rust, and WebAssembly**, and it monitors empirical convergence against a theoretical 1/N rate. Determinism is enforced by contract: all sums accumulate in strict ascending-index order, parallel reduction is forbidden (it would reassociate the floats), and a five-point constitution gate on the zeros dataset must pass before any test runs. Cross-implementation equivalence is checked to a `1e-15` bit-identity class, with a `1e-12` boundary for genuine cross-library transcendental differences, and a Kahan compensated-summation reference is carried alongside the naive sum (the two diverge slightly by design — Kahan is the higher-precision reference, not an error). The battery's ten checks (determinism within Python, Rust-vs-Python and WASM equivalence, N-scaling, convergence baseline, sensitivity, a Poisson contrast, functoriality, squared-residual consistency, and cross-block decorrelation) all pass at index time; the convergence slope sits at ≈ −0.99, confirming the 1/N decay, and the random-matrix and prime-orbit diagnostics reproduce as expected while one beyond-random-matrix effect is honestly reported as *not* established. The battery's standing rule is an epistemic boundary it never crosses: **it certifies empirical metrics; it does not assert mathematical theorems.** The "0 theorems yet" status is preserved deliberately.

---

# Part VII — Evidence & Discipline

## 20. Evidence & benchmarks (honestly stated)

Every figure carries what it measures, traced to the committed index with suites run at index time:

**Tests — 754 passing across four workspaces.** The AISO Rust workspace (`aiso/`) at **20/20** (10 substrate witness-battery, 10 Riemann-zeros suite); the OmniForge / TENT engine (`omniforge-phase0/`) at **213/213** (82 capsule, 25 cdcl, 33 cdtgs, 50 tent-routing with 2 ignored, 23 bra); the TypeScript platform (`aiso/frontend/`) at **433/433** across 47 files; the PAV-MCP server (`aiso/pav-mcp/`) at **88/88**.

**Routing-classification accuracy, held-out: 76.8%** (149/194). The engine maps a query to the correct specialist well; it **does not solve** the MATH/GPQA problems the corpus is derived from. This is the held-out figure — the one that reflects generalization. Earlier reports near 100% were in-sample on tuned vocabulary; the held-out number is the honest one. **Noise rejection: 0% false-positive routes** — full rejection on pure-noise sets. "Zero hallucinations," here, means zero spurious routes, not a statement about answer correctness.

**Throughput (single-threaded Rust):** base routing **12,548 q/s** (10k-query stress); RYS + CDCL pipeline **6,154 q/s**; SEGGCI full pipeline **10,914 q/s** (compounding seed growth). **Dispatch latency (TypeScript):** p50 70 µs, p95 80 µs, p99 80 µs under sustained 1k-event load.

**CUDNT: 0.00×–0.01× on CPU** — slower than standard operations through the simulated transform; advisory, not a performance claim (§11). It is reported because it is true, and because the larger earlier figure was withdrawn under live test.

These are read against a four-tier scale, and a lower tier never passes as a higher one:

| Tier | Standard | This system |
|---|---|---|
| **T1 — machine-verified** | a test passes, reproducibly | the 754-test suite; the witness battery's cross-implementation equivalence |
| **T2 — proved** | a formal proof checks | the canonicalizer's confluence & termination (Coq, axiom-free) |
| **T3 — numerically verified** | stable across runs, not theorem-level | 76.8% held-out routing; throughput & latency; the 1/N convergence slope |
| **T4 — falsified** | a computation shows it false, recorded | the CUDNT "speedup" — measured slower |

## 21. Engineering discipline

The work runs on **adversarial compression**: every claim goes conjecture → explicit test → either a theorem (with proof) or a sharpened negative (with the mechanism of failure). Negative results are first-class outputs, recorded with their killing computation, never suppressed. Two distinct labelling systems run alongside the verification tiers above: a *capability-confidence* label (`[verified]` for file-cited and machine-checked, `[attested]` for established-in-record and reproducible) and a *build-state provenance* label (`[FILE]` for file:line-citable, `[PASTCHAT]` for conversation-attested, `[XATT]` for the same fact in two sources) — with the hard rule that cross-attestation confirms a *number*, not its interpretation. A standing guardrail governs every headline figure: **state what it measures in one clause, and if the honest statement is less impressive than an inherited framing, the inherited framing is the bug.** It has fired repeatedly — the 76.8% relabel and the CUDNT withdrawal are the discipline working as designed. Corrections stay in the record by the same strike-with-provenance rule the engine itself uses; the correction history *is* the document. And the build itself runs as an **asymmetric loop** — a council of specialized agents (advisory, exploratory, mathematical, and idea-capture roles, plus an executor that runs builds and returns logs and an operator that authors specs and never claims execution it cannot show a log for) arbitrated by a single human who is the only integrating frame. The same trust engine the software implements is the process that builds it.

## 22. Honest scope & roadmap

- **Proven vs measured vs conjectured.** The canonicalizer's confluence and termination are *proved* (T2). The routing accuracy, throughput, and convergence rate are *measured* (T3). The ΔI/BCH correspondence's exact tier is being confirmed against source and is presented as a structural correspondence pending that check; the infinite-dimensional extension is *conjectured*.
- **Built vs designed.** Two of the four routing dispositions (`Contested`, `Superseded`) are defined but not yet constructed in the routing layer — though both are defined in the trust-graph layer, which is the working template. The route/reject boundary still hinges on the `0.65` threshold, and the `0.3` constant is overloaded across three jobs; both are corpus-fitted technical debt to be split and retired as ambiguity becomes a first-class `Contested` outcome.
- **Phase-0 hardening seams.** The provenance hashes are deterministic MD5 stand-ins pending SHA-256 — the first change before any cryptographic claim; scroll chain-continuity across process restarts is a named TODO; and two leftover debug prints in the per-query hot path (in the capsule ingest and the council deliberation) are flagged for removal.
- **Determination, not oracle.** The engine routes and classifies by constraint reduction; it does not solve the problems its corpora are derived from. Every figure in this paper is a routing, test-pass, throughput, or proof-status figure.
- **Provenance.** The inventory and benchmark sections are written from a live, committed index of the trees; figures trace to files read and suites run at index time.

---

## Conclusion

AISO is a universal trust engine with transparent, auditable constraints. What is real today, stated at its honest tier: a machine-checked confluent core that makes the audit trail mean what it claims; a deterministic, redline-transparent constraint reduction that routes at 76.8% held-out with zero false-positive routes and never deletes a rejected possibility; an integer compute floor that keeps identity reproducible to the bit; a hash-chained, Merkle-rooted scroll; a trust-graph layer that already speaks the full disposition vocabulary; and a browser-sovereign shell with native/WASM parity. What is honestly unfinished is named: two dispositions still to construct in the routing layer, two thresholds to retire, the production hash to swap in, a mathematical correspondence to pin to its exact tier. The discipline that holds it together is the same one the engine embodies — show the structure, keep what is struck, never claim more than the evidence supports. Trust is the output, and it is what survives the reduction.

---

*TensorRent · AISO System Whitepaper · v1.0 · the full-length technical description · component inventory and benchmarks written from the committed system index (`SYSTEM_INDEX_2026-06-21.md`, SHA `030d0954e1aa3a5c6eda105e7110e73a38c7bdd99f4b73b2aec9d975dbe9665c`); architecture from the 22-chapter engineering manual grounded in `omniforge-phase0` and Mac-side source · companion to the canonical-rewrite-system whitepaper and the engineering manual.*
