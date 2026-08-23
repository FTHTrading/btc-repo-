//! Time Impact Scoring Engine
//! Deterministic, reproducible, integer BPS calculations for interruption accounting.
//! "We don't price a human. We calculate and record the cost of an interruption under a published ruleset."

pub mod infra_reserve;
pub mod biosignal_zk;
pub mod biophysical_metrics;
pub mod biophysical_typed;
#[cfg(test)]
pub mod biophysical_tests;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TimeImpactInput {
    pub minutes_lost: u32,
    pub hourly_rate_cents: u64,
    pub severity_bps: u32,           // e.g., 10,000 = 1.0x, 14,000 = 1.4x
    pub context_switch_bps: u32,     // e.g., 10,000 = 1.0x, 12,000 = 1.2x
    pub evidence_confidence_bps: u32, // e.g., 2,500 = 0.25, 6,000 = 0.60, 10,000 = 1.00
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeImpactReceipt {
    pub claim_id: u64,
    pub ruleset_version: String,
    pub evidence_root: String,
    pub score_input_hash: String,
    pub impact_score_bps: u32,
    pub impact_estimate_cents: u64,
    pub attester_set_root: String,
    pub created_at: u64,
}

/// Calculate the exact evidence-weighted impact value in cents using integer basis points.
/// Math: I = H * R * S * F * E
/// Uses saturating_mul and integer division to ensure zero floating-point drift across platforms.
pub fn impact_value_cents(input: &TimeImpactInput) -> u64 {
    let base = input
        .hourly_rate_cents
        .saturating_mul(input.minutes_lost as u64)
        / 60;
    
    let adjusted_severity = base
        .saturating_mul(input.severity_bps as u64)
        / 10_000;
    
    let adjusted_context = adjusted_severity
        .saturating_mul(input.context_switch_bps as u64)
        / 10_000;
    
    adjusted_context
        .saturating_mul(input.evidence_confidence_bps as u64)
        / 10_000
}

/// Compile a canonical signed evidence receipt hash
pub fn generate_receipt_hash(receipt: &TimeImpactReceipt) -> String {
    let raw = format!(
        "{}|{}|{}|{}|{}|{}|{}|{}",
        receipt.claim_id,
        receipt.ruleset_version,
        receipt.evidence_root,
        receipt.score_input_hash,
        receipt.impact_score_bps,
        receipt.impact_estimate_cents,
        receipt.attester_set_root,
        receipt.created_at
    );
    let mut hasher = Sha256::new();
    hasher.update(raw.as_bytes());
    hex::encode(hasher.finalize())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exact_example_calculation() {
        // Example from spec: 1.5 hrs (90 min), $150/hr ($15,000 cents), 1.4 severity (14,000 bps),
        // 1.2 context switch (12,000 bps), 0.60 evidence confidence (6,000 bps)
        // Expected: 226.80 USD = 22,680 cents
        let input = TimeImpactInput {
            minutes_lost: 90,
            hourly_rate_cents: 15_000,
            severity_bps: 14_000,
            context_switch_bps: 12_000,
            evidence_confidence_bps: 6_000,
        };

        let result = impact_value_cents(&input);
        assert_eq!(result, 22_680); // 226.80 USD exactly!
    }

    #[test]
    fn test_receipt_hashing() {
        let receipt = TimeImpactReceipt {
            claim_id: 1042,
            ruleset_version: "v1.0.0".to_string(),
            evidence_root: "0x8a92e41b".to_string(),
            score_input_hash: "0x4f7d".to_string(),
            impact_score_bps: 22680,
            impact_estimate_cents: 22680,
            attester_set_root: "0x1234".to_string(),
            created_at: 1787455000,
        };

        let hash = generate_receipt_hash(&receipt);
        assert_eq!(hash.len(), 64);
    }
}
