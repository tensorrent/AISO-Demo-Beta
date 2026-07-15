# Documentation audit — quality, provenance, audience

_Audit date: 2026-07-12. Scope: every `.md` across `AISO-UI-for-Ai` (658 files) and
`HashCloud-SPE` (18 files)._

This audit rates every documentation file by **quality**, **provenance/currency**, and
**audience** (human / AI-LLM / both), and answers the driving question: *can a human — and
an LLM — understand how to use this system and each piece, and know **when** and **how** to
reach for each one?*

The companion artifact this audit produced is
**[`CAPABILITIES.md`](CAPABILITIES.md)** — the single, current, machine-consumable
"per piece → what it is → **when** to use → **how** to invoke → which doc" map that was
the corpus's #1 missing artifact.

---

## Headline

**This is not a shortage-of-docs problem; it is a signal-to-noise problem.**

`AISO-UI-for-Ai` carries **658 markdown files**, but only ~30–40 are current, curated,
reader/LLM-facing documentation. The rest is machine output and dated history:

| Bucket | Count | What it actually is | Keep as |
|---|---|---|---|
| `harness/gsm8k_aiso_results/` | **379** | Auto-generated benchmark sweeps (`<!-- aiso fidelity sweep -->`) | data artifact — **not docs**; should be `.gitignore`'d or moved out of the doc tree |
| `docs/governance/` | **102** | Lineage, sprint governance, `instance_h_artifacts/artifact_01–80` | provenance archive (front-matter'd, mostly `status:`-tagged) |
| `frontend/diagnosis-report-*` | ~25 | Per-date JSON diagnosis/benchmark snapshots | dated log; only the latest reflects reality |
| `frontend/data/` | 28 | Baselines / reference data (`CANONICAL_BASELINE`…) | reference data |
| `docs/validation/` + `build_sheet_v1_bundle/` | 22 | Point-in-time validation runs, raw transcript extracts | provenance |
| **Current canonical documentation** | **~30** | The docs a human/LLM should actually read | **canonical** |

By contrast, **`HashCloud-SPE` is exemplary**: 5 root policy docs + 13 `docs/` (guides +
ADRs), all current, purpose-built, cross-linked. It is the model the AISO doc tree should
converge toward.

---

## Ratings key

- **AUDIENCE** — human · AI/LLM · both
- **CURRENCY** — current · stale/superseded · historical (a point-in-time record, correct
  for its date, never meant to stay current)
- **QUALITY** — high · medium · low (thoroughness + clarity + accuracy)

The full per-file table is in the appendix at the bottom. The findings below are what
matters.

---

## Finding 1 — the canonical current set (read these)

High-quality, current, and safe to trust as of 2026-07-12:

**Cross-repo / orientation**
- [`docs/SYSTEM_MAP.md`](SYSTEM_MAP.md) — repo-level dependency graph (AISO ↔ HashCloud-SPE ↔ rawkit ↔ TangTalk). **both · current · high**
- [`MVP_BUILD.md`](../MVP_BUILD.md) — what this repo actually is now (the 2026-07-10 consolidation). **human · current · high**
- [`CAPABILITIES.md`](CAPABILITIES.md) — per-piece when/how map (new, this audit). **both · current · high**

**Policy / how-to**
- [`AGENTS.md`](../AGENTS.md) — implementation policy + invariants + layout for coding agents. **AI/LLM · current · high** (best AI-facing doc in the repo)
- [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`SECURITY.md`](../SECURITY.md), [`CHANGELOG.md`](../CHANGELOG.md) — **human · current · high**

**Conceptual / reference**
- [`docs/AISO_SYSTEM_WHITEPAPER_v1.0.md`](AISO_SYSTEM_WHITEPAPER_v1.0.md) — full model. **both · current · high**
- [`docs/AISO_ENGINEERING_MANUAL_v1.1.md`](AISO_ENGINEERING_MANUAL_v1.1.md) — per-part human reference (closest existing "how to use each piece"). **human · current · high**
- [`docs/metric_contract.md`](metric_contract.md) — canonical metric definitions (RATIFIED). **both · current · high**

**Status / validation (current source of truth for numbers)**
- [`docs/VALIDATION_2026-07-12.md`](VALIDATION_2026-07-12.md) — today's green board; **the current figure source**. **both · current · high**

**Domain deep-dives**
- [`docs/SWARM_SCROLL_INTEGRATION.md`](SWARM_SCROLL_INTEGRATION.md), [`docs/constraint-layer/WALKTHROUGH.md`](constraint-layer/WALKTHROUGH.md) + [`TECHNICAL_REFERENCE.md`](constraint-layer/TECHNICAL_REFERENCE.md), [`docs/compliance/*`](compliance/) (MVP_COMPLIANCE_CROSSWALK, soc2_readiness_package, isms_policy_set), [`docs/partner_handoff_package_v2.0.md`](partner_handoff_package_v2.0.md). **current · high**

**Doctrine an LLM should internalize** (front-matter'd, `status: active`)
- `frontend/AISO_SKILL_v3.md`, `frontend/AISO_MEMORY_ARCHITECTURE.md`, `frontend/AISO_TENSORRENT_INVARIABLE.md`, `frontend/AISO_VISIBILITY_INVARIABLE.md`, `frontend/AISO_VEXEL_VIXEL_VOXEL_UNIVERSAL.md`, `frontend/AISO_PRE_PASS_PROTOCOL_v1.2.md`.

---

## Finding 2 — stale docs that MISLEAD if read as current (fix or flag)

Ranked by risk. These present as authoritative but are superseded:

| Doc | Problem | Action |
|---|---|---|
| **`README.md`** header | First screen reads *"AISO Sprint 7 — Workspace · 182/182 tests · Wave 7.A pending."* Real state: consolidated MVP, 600+ tests. A forward-pointer block corrects it *below the fold*. | **FIXED this pass** — header rewritten to current state; Sprint-7 layout moved into a collapsed provenance note. |
| **`docs/SYSTEM_INDEX_2026-06-21.md`** | Labels itself *"authoritative ground-truth record,"* but is a June-21 snapshot predating auth/MFA/swarm-scroll; the two whitepapers pin to its SHA, so stale numbers propagate. | **FLAGGED this pass** — supersession banner added pointing to `VALIDATION_2026-07-12.md` (current numbers) and `CAPABILITIES.md`. |
| `BUILD_SHEET_v1.0–v1.4.md` (root + bundle v1.0) | Superseded by v1.5 = `BUILD_SHEET.md` (labeled CANONICAL). Preserved by design (strike-with-provenance) but sit un-annotated next to the canonical one. | Leave (provenance); `CAPABILITIES.md` names `BUILD_SHEET.md` as the only current one. |
| `docs/AISO_SYSTEM_WHITEPAPER_v0.2.md` | Draft superseded by v1.0. | Provenance; v1.0 is canonical. |
| `frontend/AISO_SKILL_v1.md` / `v2.md` | Superseded by v3 (v2 self-labels it). | Provenance. |
| `frontend/AISO_PRE_PASS_PROTOCOL.md` | Superseded by v1.2. | Provenance. |
| `docs/governance/instance_h_pre_registration.md` (v2) | Superseded by v3. | Provenance. |
| `PHASE_6_AUDIT_REPORT.md`, `SPRINT_8_RETROSPECTIVE.md`, `validation/validation_wave2_reconciliation.md`, `build_sheet_v1_bundle/BUILD_SHEET_v1.0.md`, `extract_07` | Carry the **41.7% → 36.11% routing correction banner**, but body text still says 41.7%. | Banner discipline works; keep. |
| `docs/FRESH_BUILD_PLAN_v1.0.md`, `docs/MVP_USER_MODEL_PLAN.md` | Forward plans whose work is now delivered; read as roadmap they misstate current state. | Add "delivered — see VALIDATION" note (optional follow-up). |

**Mitigation already in the corpus:** the project practices *strike-with-provenance* —
correction banners + `status:`/`supersedes:` YAML on the front-matter'd frontend/governance
docs. Where that discipline is applied, staleness is safely flagged. The gaps are the files
*without* front-matter (README, the root build sheets, the plans).

---

## Finding 3 — AI/LLM-facing docs: do they say WHEN and HOW?

The corpus tells an LLM *how the system thinks* and *what rules to obey* well; it is weak on
*when to reach for which piece*.

- **`AGENTS.md`** — best of the set. Strong on WHERE each crate is and WHAT invariants not to
  break. Lighter on WHEN to use a given piece.
- **`frontend/AISO_SKILL_v3.md`** — canonical context-priming ("load this to resume"). Its
  trigger-keyword list addresses *when to load the skill*, but it is project/cosmology
  priming, **not a per-piece when/how dispatch table**.
- **`frontend/AISO_PRE_PASS_PROTOCOL_v1.2.md`** — genuinely procedural (audit-first, WHEN to
  run a pre-pass, concrete HOW).
- **Contracts/catalogs** (`metric_contract.md`, `failure_signature_catalog.md`,
  `WELL_VIXEL_GROWTH_PROTOCOL.md`, `validator_binding_contract.md`) — normative rules an LLM
  must obey *when doing specific work*: good HOW, scoped WHEN.
- **`docs/constraint-layer/TECHNICAL_REFERENCE.md`** — HOW to implement gates/suppliers;
  WHEN is implicit.

**Verdict:** no single doc was a "capabilities → when to use / how to invoke each piece"
dispatch map. **[`CAPABILITIES.md`](CAPABILITIES.md) is that doc, created by this audit.**

---

## Finding 4 — indexes: four partial, none complete

There were four overlapping indexes, each scoped differently and none both current *and*
usage-oriented:

| Index | Covers | Gap |
|---|---|---|
| `docs/SYSTEM_MAP.md` | repo-level graph | not per-component / when-to-use |
| `docs/SYSTEM_INDEX_2026-06-21.md` | file/test/benchmark inventory | dated; status-oriented, not usage |
| `docs/governance/GOVERNANCE_INDEX.md` | governance docs only | scoped to governance |
| `README.md` | pointer hub | was stale-headed, shallow |
| `docs/AISO_ENGINEERING_MANUAL_v1.1.md` | per-part human reference | prose, not a machine dispatch table |

**[`CAPABILITIES.md`](CAPABILITIES.md)** closes this: one current, LLM-consumable
capability→when→how map, cross-linked from README, AGENTS, and SYSTEM_MAP.

---

## Finding 5 — remaining gaps (follow-ups)

1. **Benchmark output pollutes the doc tree.** The 379 `harness/gsm8k_aiso_results/*.md`
   dominate any repo-wide doc crawl. Recommend `.gitignore` or move to a `results/` path
   outside `docs`-adjacent trees so an LLM doesn't drown in them.
2. **No uniform machine-readable currency signal.** Front-matter'd frontend/governance docs
   have `status:`/`supersedes:`; root docs and plans don't. Adding YAML front-matter with
   `status:` to the root build sheets and the two delivered plans would let a tool
   (or LLM) filter stale docs mechanically.
3. **Named-but-absent artifacts** (Arcade21 "is not a directory or crate"; the NVIDIA
   keystone is gitignored) are honestly flagged in prose, but `CAPABILITIES.md` should — and
   now does — record which named capabilities are in-tree vs aspirational, so an LLM doesn't
   assume their existence.
4. **HashCloud-SPE needs no remediation** — it is the reference standard. AISO's target is
   to match that clarity for its ~30 canonical docs while keeping the 600+ provenance/history
   files clearly demarcated as archive.

---

## Appendix — full per-file ratings

The complete per-file table (every root doc, `docs/` and all subdirs, and `frontend/*.md`)
is preserved verbatim from the audit sweep. For brevity here, files are grouped; homogeneous
groups (`instance_h_artifacts/artifact_01–80`, the 25 `diagnosis-report-*`, the 9 bundle
extracts, the 379 gsm8k sweeps) are rated as a group.

### Repo root
| path | TYPE | AUD | CURRENCY | QUAL |
|---|---|---|---|---|
| `AGENTS.md` | policy / AI-instructions | AI/LLM | current | high |
| `README.md` | index/guide | human | current *(fixed 2026-07-12; was stale)* | high |
| `CONTRIBUTING.md` | guide | human | current | high |
| `SECURITY.md` | policy | human | current | high |
| `CHANGELOG.md` | build-log | human | current | high |
| `MVP_BUILD.md` | build-log/decision | human | current | high |
| `BUILD_SHEET.md` | build-log (canonical v1.5) | both | current | high |
| `BUILD_SHEET_v1.1–v1.4.md` (4) | build-log/sprint | both | stale/superseded | high |
| `RETROSPECTIVE.md` | build-log/sprint | human | historical | high |
| `SPRINT_8_v1.0-ratified.md`, `SPRINT_9_v1.0.md`, `SPRINT_10_v1.0.md` | build-log/sprint | both | historical | high |
| `claude_grounding_bundle.md` | index/manifest | AI/LLM | historical | low |
| `diagnosis-report-2026-06-14.md` | diagnosis-report | both | historical | medium |

### docs/ (root)
| path | TYPE | AUD | CURRENCY | QUAL |
|---|---|---|---|---|
| `SYSTEM_MAP.md` | index/architecture | both | current | high |
| `CAPABILITIES.md` | index (capabilities/when-how) | both | current *(new)* | high |
| `DOCS_AUDIT.md` | audit (this file) | both | current *(new)* | high |
| `SYSTEM_INDEX_2026-06-21.md` | index (file/test) | both | stale-dated *(banner added)* | high |
| `AISO_BUILD_STATUS_v1.0.md` | status | human | stale | high |
| `AISO_ENGINEERING_MANUAL_v1.1.md` | guide/reference | human | current | high |
| `AISO_SYSTEM_WHITEPAPER_v0.2.md` | whitepaper | both | stale/superseded | high |
| `AISO_SYSTEM_WHITEPAPER_v1.0.md` | whitepaper | both | current | high |
| `TENT_AISO_Whitepaper_v1.1_Reconciliation_Note.md` | reconciliation | both | current | high |
| `VALIDATION_2026-07-12.md` | validation/status | both | current | high |
| `metric_contract.md` | spec/policy | both | current (RATIFIED) | high |
| `partner_handoff_package_v2.0.md` | guide/handoff | human | current | high |
| `AUDIT_REMEDIATION_PLAN.md` | plan/decision | both | current | high |
| `SWARM_SCROLL_INTEGRATION.md` | guide/architecture | both | current | high |
| `ENGINEERING_PROVENANCE_PHASE1_20260630.md` | governance/lineage | AI/LLM | historical | high |
| `FRESH_BUILD_PLAN_v1.0.md` | plan | both | stale (delivered) | medium |
| `LOCAL_AGGREGATION_v1.0.md` | governance/audit | both | historical | high |
| `MAC_HANDOFF_executables_and_expansion.md` | guide/handoff | AI/LLM | historical | medium |
| `MAC_LANDING_LOG_20260630.md` | build-log | AI/LLM | historical | medium |
| `MVP_HARDENING_LOG.md` | build-log | human | historical | high |
| `MVP_USER_MODEL_PLAN.md` | plan | both | stale (delivered) | high |
| `PRODUCT_TEST_REPORT.md` | validation/report | both | historical | high |
| `TRANSFER_MANIFEST_20260701.md` | build-log/manifest | AI/LLM | historical | medium |
| `WO19_routing_reconciliation.md` | build-log (diagnostic) | both | historical | high |
| `SPEC_*.md` (5) | spec | AI/LLM+eng | mixed (mostly current) | high |
| `WO_*.md` (5) | work orders | AI/LLM | historical | high |

### docs/architecture/ (7)
All `both`, **historical** (v0.1 / Wave-8 / Sprint-8 baselines), quality high except
`EXECUTION_PRIMITIVES_v0.1` / `LEDGER_MEMORY_TOPOLOGY_v0.1` / `PHASE_11_LOG` (medium).

### docs/build_sheet_v1_bundle/ (10)
`BUILD_SHEET_v1.0.md` (stale/superseded, high) + `extract_01–09` (transcript-extract,
historical, medium).

### docs/compliance/ (3)
`MVP_COMPLIANCE_CROSSWALK`, `isms_policy_set`, `soc2_readiness_package` — all current, high.

### docs/constraint-layer/ (5)
`README`, `WALKTHROUGH`, `TECHNICAL_REFERENCE`, `WHITEPAPER` — current, high. `ARCADE21` —
current framing but names a product not in-repo (medium; flagged).

### docs/governance/ (102)
Registry `GOVERNANCE_INDEX` (current, high). Doctrine/spec set (`cross_ontology_invariance`,
`determination_accounting`, `failure_signature_catalog`, `multi_well_vixels`,
`validator_binding_contract`, `sovereign_frame_fidelity_spec`, `wave_10a_thesis`,
`metric`-adjacent) — mostly current/ratified, high. Lineage (`CITADEL_AISO_LINEAGE`,
`AVATAR_REBIND_v1`, `nvidia_keystone_rulings`) — current reference, medium. Instance-H set —
v3 certification current; v2 pre-registration/certification superseded. `SPRINT_6/7` framing
— historical. **`instance_h_artifacts/artifact_01–80` (80)** — historical banked artifacts,
YAML `status:` per file, medium.

### docs/validation/ (12) + docs/research/ (1)
Sprint-9 / T9-A records — historical, high (T9-A falsified). `fpvp_v1.0`,
`visualizer_validation_protocol_v1.0` — current protocols, high. Wave1/2 results —
historical; `validation_wave2_reconciliation` carries the 41.7%→36.11% banner.
`research/LIQUID_AI_DEATH_LOOPS_ANTIDOOM_FTPO.md` — current (2026-07-11), high.

### frontend/ (*.md, ~50)
Current: `AISO_SKILL_v3`, `AISO_MEMORY_ARCHITECTURE`, `AISO_TENSORRENT_INVARIABLE`,
`AISO_VISIBILITY_INVARIABLE`, `AISO_VEXEL_VIXEL_VOXEL_UNIVERSAL`,
`AISO_PRE_PASS_PROTOCOL_v1.2` — all high. Superseded: `AISO_SKILL_v1/v2`,
`AISO_PRE_PASS_PROTOCOL`. Historical: `ADR-003`, `BUG_3_DESIGN_NOTE`, `INSTALL`,
`MAC_HANDOFF_RUNBOOK`, `PASS_1F/SPRINT_9_SKILL_SYSTEM_SCOPING`, `PHASE_6_AUDIT_REPORT`,
`SPRINT_8_RETROSPECTIVE`, `STAGE_8_TEST_README`, and the **25 `diagnosis-report-*`**
(historical, medium; only the latest reflects current perf).

### Not documentation (excluded from doc quality scope)
- `harness/gsm8k_aiso_results/*.md` (379) — machine-generated benchmark sweeps.
- `frontend/data/*.md` (28) — reference data/baselines.

### HashCloud-SPE (18) — reference standard, all current/high
Root: `README`, `AGENTS`, `SECURITY`, `CONTRIBUTING`, `CHANGELOG`. `docs/`: `ARCHITECTURE`,
`SYMBOLIC_ADDRESSING`, `SYNC_PROTOCOL`, `DURABILITY`, `NOSTR_TRANSPORT`, `SCROLL_SERVER_API`,
`README` (index), `decisions/0001–0005` + `decisions/README`.
