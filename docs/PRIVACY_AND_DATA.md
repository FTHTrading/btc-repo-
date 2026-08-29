# Privacy, Telemetry & Health Data Policy
**ALL COUCH NO CAGE — Self-Mastery & Focus Architecture**  
**Effective Date**: 2026-08-29

---

## 1. Core Privacy Principles

ALL COUCH NO CAGE is designed with **Privacy by Default**:
- The core focus timer operates 100% locally in your browser.
- No personal identifiable information (PII) is sold, traded, or shared.
- No biological data is captured or transmitted.

---

## 2. Data Handling Model

| Data Type | Storage Location | Transmission Policy | Purpose |
| :--- | :--- | :--- | :--- |
| **Focus Session Duration** | Local Storage (`acnc_focus_session_timer_v3`) | None (Local only) | Countdown tracking and timer state recovery across refreshes. |
| **Session Intention** | Local Storage | None (Local only) | Displayed on your local dashboard to keep you focused on your core goal. |
| **Completed Session History** | Local Storage (`acnc_ledger_history_v3`) | None (Local only) | Generates your personal focus consistency ledger and JSON receipts. |
| **Client Diagnostics** | Local Storage (`acnc_diagnostics_log_v3`) | None (Local only) | Self-healing circuit breaker and local error inspection via the Diagnostics modal. |
| **Biometric Telemetry** | **None** | **None** | Not collected. Cardiac (HRV) and EEG band models serve as reference specifications only. |
| **Wallet Address** | In-Memory (Optional) | Optional on-chain transaction | Only used if you explicitly sign a testnet receipt on Polygon Amoy. |

---

## 3. Non-Medical Disclaimer

> [!IMPORTANT]
> **ALL COUCH NO CAGE is non-medical self-mastery and focus accountability software.**
> - It does not diagnose, treat, prevent, or monitor any medical or mental health condition.
> - Reference constants (e.g., HRV slew rates, EEG frequency bands, basal metabolic power) are mathematical specifications for future software modeling and do not constitute clinical telemetry or medical advice.
> - Always consult a qualified medical professional for health concerns.

---

## 4. Local State Reset

You can purge all stored sessions, intention notes, and diagnostic logs at any time:
1. Click **Diagnostics** in the footer.
2. Click **Reset Local State**.
3. All `localStorage` keys will be immediately destroyed.
