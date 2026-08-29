# Product Status & Capability Matrix
**Repository**: `FTHTrading/btc-repo-`  
**Deployment Surface**: `time.unykorn.ai` (GitHub Pages via Cloudflare CNAME)  
**Specification Version**: `v3.0.0-truth-aligned`  
**Last Updated**: 2026-08-29

---

## 1. Truth Label Definitions

Every feature across ALL COUCH NO CAGE is explicitly cataloged under one of the following states:

| Status Label | Definition | Verification Standard |
| :--- | :--- | :--- |
| **`LIVE`** | Fully functional in production browser environment right now. | Direct interaction, timer countdown, persistence, state recovery. |
| **`LOCAL`** | Executes purely in client-side runtime or `localStorage`. | Offline browser verification, no external server dependency. |
| **`TESTNET`** | Smart contract implemented on testnet (Polygon Amoy). | Inspectable contract code, testnet address, pre-mint batch status. |
| **`DEMO`** | Simulated output, visual concept, or client demonstration. | Labeled demo preview without claiming backend execution. |
| **`PENDING`** | Designed architecture awaiting full multi-chain rollout. | Explicitly declared as pending implementation/deployment. |
| **`VERIFIED`** | Cryptographically signed, on-chain confirmed transaction. | Transaction hash verifiable on block explorer. |

---

## 2. Capability Matrix

| Feature / Surface | Status | Implementation Details |
| :--- | :--- | :--- |
| **Focus Session Countdown** | `LIVE` | Integer minutes (6–1,440 min), 50m default, monotonic countdown timestamp math. |
| **Session Preset Chips** | `LIVE` | 25m, 50m, 90m, Custom duration selector. |
| **Intention & Distraction Shield** | `LIVE` | Client-side intention tracking and zero-interruption flow monitoring. |
| **Local SHA-256 Proof Receipts** | `LOCAL` | In-browser deterministic receipt generation and downloadable JSON metadata. |
| **Personal Integrity Ledger** | `LOCAL` | Bounded daily credit calculations (300 VTIME daily cap) in browser storage. |
| **Voice Walkthrough Engine** | `LOCAL DEMO` | Web Speech API text-to-speech walkthrough across product pillars. |
| **Adaptive Cognitive Guide** | `LOCAL DEMO` | Archetype-based focus suggestions (Deep Architect, Rapid Responder, Systems Auditor). |
| **Surreal Relic Art Inspector** | `LOCAL` / `TESTNET PRE-MINT` | 15 high-res visual assets with SHA-256 hashes and download receipts. |
| **Polygon Amoy Contracts** | `TESTNET PRE-MINT` | `PersonalIntegrityVault.sol`, `TimeImpactLedger.sol`, `DaliInvariantAssetNFT.sol`. |
| **Biophysical Signal Integrations** | `SPECIFICATION (LOCAL)` | Rust integer types and bounds for future optical/EEG telemetry hardware. Non-medical. |

---

## 3. Product Integrity Commitments

1. **No Phantom Telemetry**: We never claim live biological telemetry without an active hardware connection and user consent.
2. **Integer Math Only**: All countdowns, points, and durations are calculated using integer minutes and seconds to eliminate floating-point drift.
3. **Private by Default**: The core focus session timer requires no wallet, no sign-in, and no external network calls.
