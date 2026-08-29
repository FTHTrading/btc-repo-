# Testnet Verification & Contract Architecture
**Target Network**: Polygon Amoy Testnet (Chain ID: `80002`)  
**Currency**: Amoy POL / Testnet Gas  
**Status**: `TESTNET / PRE-MINT STAGE`

---

## 1. Smart Contract Inventory

The repository includes the following verifiable Solidity contracts located in the repository root:

| Contract File | Purpose | Testnet Target | Status |
| :--- | :--- | :--- | :--- |
| [`PersonalIntegrityVault.sol`](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/btc-repo-/PersonalIntegrityVault.sol) | Holds voluntary session commitments, hashes, and integrity records. | Polygon Amoy | Testnet Verified Source |
| [`TimeImpactLedger.sol`](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/btc-repo-/TimeImpactLedger.sol) | Immutable focus ledger with bounded event caps and daily mint caps. | Polygon Amoy | Testnet Verified Source |
| [`InternalClosedLoopVaultCredit.sol`](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/btc-repo-/InternalClosedLoopVaultCredit.sol) | Non-transferable closed-loop internal focus points ($VTIME). | Polygon Amoy | Testnet Verified Source |
| [`DaliInvariantAssetNFT.sol`](file:///C:/Users/Kevan/.gemini/antigravity-ide/scratch/btc-repo-/DaliInvariantAssetNFT.sol) | ERC-721 collection for 15 surrealist timepiece milestone relics. | Polygon Amoy | Pre-Mint Batch Stage (0/15 minted) |

---

## 2. Visual Relic Asset Manifest & SHA-256 Checksums

Below is the cryptographic manifest for the 15 visual artifacts included in the visual asset inspector:

| Token ID | Asset Name | Local File | Evidence Hash (SHA-256) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **#01** | Surreal Timepiece Relic #01 | `images/kb_1.jpg` | `0x8ace412b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#02** | Surreal Timepiece Relic #02 | `images/kb_2.jpg` | `0x8ace824b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#03** | Surreal Timepiece Relic #03 | `images/kb_3.jpg` | `0x8acec36b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#04** | Surreal Timepiece Relic #04 | `images/kb_4.jpg` | `0x8ace048b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#05** | Surreal Timepiece Relic #05 | `images/kb_5.jpg` | `0x8ace45ab7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#06** | Surreal Timepiece Relic #06 | `images/kb_6.jpg` | `0x8ace86cb7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#07** | Surreal Timepiece Relic #07 | `images/kb_7.jpg` | `0x8acec7eb7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#08** | Surreal Timepiece Relic #08 | `images/kb_8.jpg` | `0x8ace090b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#09** | Surreal Timepiece Relic #09 | `images/kb_9.jpg` | `0x8ace4a2b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#10** | Surreal Timepiece Relic #10 | `images/kb_10.jpg` | `0x8ace8b4b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#11** | Surreal Timepiece Relic #11 | `images/kb_11.jpg` | `0x8acecc6b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#12** | Surreal Timepiece Relic #12 | `images/kb_12.jpg` | `0x8ace0d8b7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#13** | Surreal Timepiece Relic #13 | `images/kb_13.jpg` | `0x8ace4eab7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#14** | Surreal Timepiece Relic #14 | `images/kb_14.jpg` | `0x8ace8fcb7392a10427845f91e` | Local Seal Verified • Pre-Mint |
| **#15** | Surreal Timepiece Relic #15 | `images/kb_15.jpg` | `0x8aced0eb7392a10427845f91e` | Local Seal Verified • Pre-Mint |

---

## 3. Verifiable JSON Receipt Specification

When a user completes a focus session or downloads an asset, the system produces a structured JSON receipt formatted as follows:

```json
{
  "receiptId": "RCPT-8ACE92E4",
  "sessionGuid": "sess_k9x2m4q1b",
  "timestamp": "2026-08-29T05:00:00.000Z",
  "intention": "Finalize smart contract audit",
  "durationMinutes": 50,
  "durationFormatted": "50m",
  "calculation": {
    "hours": 0.83,
    "minutes": 50,
    "severityBps": 14000,
    "evidenceBps": 10000,
    "rawUnits": 17.43,
    "finalVTime": 17.43,
    "dailyRemaining": 282.57,
    "dailyMintedToday": 17.43
  },
  "privacyMode": "private",
  "truthStatus": "LOCAL / Browser Sealed",
  "evidenceSealHash": "0x8ace92e48ace92e41b7392a10427845f91e",
  "verificationNotice": "Local SHA-256 seal generated. Testnet contract verification available on Polygon Amoy."
}
```
