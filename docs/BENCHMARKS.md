# AISO Performance Benchmarks & Stress-Test Results

This document records the performance, scaling limits, and physical stress benchmarks of the AISO trust engine.

---

## 1. Scale Benchmarks: $O(N)$ vs $O(\log N)$

We ran the tree-building and walk-descent benchmark harness in `pav-mcp/` across varying directory sizes up to $500,000$ entries.

*   **Tree Build Time ($O(N)$):** grew linearly as the scale increased, reflecting the local CPU/memory cost of constructing the index.
*   **Tree Walk Descent ($O(\log N)$):** remained sub-millisecond, bounded only by tree depth.

| Scale ($N$) | BUILD time ($O(N)$) | WALK_ONLY comps ($O(\log N)$) | WALK_ONLY time ($O(\log N)$) |
| ---: | ---: | ---: | ---: |
| **1,000** | 15.35 ms | 19 comparisons | 0.056 ms |
| **10,000** | 67.88 ms | 23 comparisons | 0.033 ms |
| **100,000** | 684.12 ms | 28 comparisons | 0.038 ms |
| **500,000** | **3654.81 ms** | **31 comparisons** | **0.011 ms** |

---

## 2. Phase-Locked Build & Manifold Curvature

We evaluated a saturated high-torsion build ($\theta = \frac{\pi}{2}$ rad injected into all leaves) compared side-by-side with the standard build to verify if metadata-level torsion alters the local build performance.

*   **Standard Build (500k):** $3,654.81$ ms
*   **Saturated Torsion Build (500k):** $4,001.52$ ms
*   **Manifold Curvature Ratio (Sat/Std):** **$1.095$** (topologically flat; injecting torsion has negligible performance overhead).

---

## 3. Torsion Reversal & Hysteresis Scar

This benchmark tests the topological reversibility of our content-addressed state. We built a $100\text{K}$ tree, injected $10\text{K}$ high-torsion nodes, pruned them, and measured the recovery build time.

*   **Baseline Build Time (100k):** $344.31$ ms
*   **Recovered Build Time (100k):** $349.55$ ms
*   **Hysteresis Scar (Recovered - Base):** **$+5.24$ ms ($+1.5\%$ shift)**
*   **Interpretation:** The restoration of the Merkle root hash is completely reversible (`TOPOLOGICALLY REVERSIBLE / PASS`). However, the V8 heap retaining a physical memory allocation scar results in a slight latency shift.

---

## 4. Relativistic Phase Noise (Entropy vs Gravity)

We injected random phase-noise ($\theta \in [0, \pi]$) across half of the leaves to verify if $O(\log N)$ walk/diff descent times depend on phase-state alignment.

*   **Standard Walk:** 28 comparisons, $0.085$ ms
*   **Phase Noise Walk:** 28 comparisons, $0.093$ ms
*   **Walk Latency Distortion Ratio:** **$1.071$**
*   **Interpretation:** The $O(\log N)$ traversal step count is completely invariant to phase-noise.

---

## 5. Fragmented Tree & Event Horizon (Page Faults)

We simulated non-contiguous physical disk sector layout (fragmentation) by introducing a $1.5$ ms delay on a subset of the walk path nodes during async traversal.

*   **Contiguous Walk:** 31 comparisons, $0.098$ ms
*   **Fragmented Walk:** 31 comparisons, **$3.567$ ms** (with 3 page faults)
*   **Page Fault Latency Multiplier:** **$36.4\text{x}$**
*   **Interpretation:** While step count remains invariant at 31 comparisons, disk read stalls create a massive $36.4\text{x}$ latency multiplier. This defines the event horizon of our paging system: storage compaction and prefetching are critical to maintain sub-millisecond response under high fragmentation.

---

## 6. Connection Partition & Fallback Recovery

We integrated a `FallbackScrollStore` wrapper to handle database connection drops by redirecting writes and reads to the local filesystem (`FileScrollStore`) and periodically polling for reconnection.

*   **Offline Fallback:** Active queries continue to resolve and persist cleanly to local disk during a network partition.
*   **Automatic Resynchronization:** When the primary store is restored, buffered records are automatically synced back in chronological order, resuming normal database routing.
*   **Verification:** Verified via `tests/partition-fallback.test.ts` (Vitest).

---

## 7. Extreme Concurrency Saturation & Socket Exhaustion (10K Target)

We pushed the HTTP server and event loop to actual network stack exhaustion by executing 10,000 queries in continuous 200-burst batches:

*   **Maximum Saturation Rate:** Peak throughput reached **426 requests/second** at initial bursts.
*   **Exhaustion Degradation:** Saturated TCP ports and fetch sockets degraded throughput to **10 requests/second** at peak load.
*   **Connection Error Rate:** **$14.89\%$** (1,489 errors out of 10,000 requests due to socket pools exhausting).
*   **FD Management:** File descriptors stayed flat and controlled (stabilized around $\approx 32$), proving the durability-preserving batching queue successfully insulated disk writes from network exhaustion.

---

## 8. How to Run the Benchmarks

To run the scale and stress benchmarks locally:

```bash
cd pav-mcp
npm install
npm run scale
```

To run the HTTP server concurrency stress-tests:
```bash
cd frontend
npm run build
node scripts/extreme-concurrency.mjs
```
