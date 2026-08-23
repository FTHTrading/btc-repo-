//! Closed-Loop Infrastructure Reserve & Contribution Attestation Engine
//! Implements deterministic, reproducible integer basis point (BPS) math for:
//! 1. Maximum Reserve Capacity: M_max = sum(Q_i * P_i * H_i) - L
//! 2. Objective Contribution Allocation: R = min(B, q * r * a)

use serde::{Deserialize, Serialize};

/// Represents a verifiable physical infrastructure asset (e.g., compute, storage, energy)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct InfrastructureResource {
    pub resource_id: String,
    pub quantity_units: u64,       // Q_i: e.g. verified compute-hours or kWh
    pub conversion_rate_bps: u64,  // P_i: base conversion weight in basis points (10,000 = 1.0)
    pub haircut_bps: u64,          // H_i: availability & outage risk haircut (e.g., 8,500 = 0.85)
}

/// System liabilities and reserve parameters
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ReserveParameters {
    pub resources: Vec<InfrastructureResource>,
    pub outstanding_liabilities: u64, // L: open settlement obligations
}

/// Calculates the maximum allowed utility credit issuance backed by verified capacity:
/// M_max = sum(Q_i * P_i * H_i) - L
pub fn calculate_max_issuance(params: &ReserveParameters) -> u64 {
    let mut total_gross_capacity: u64 = 0;

    for res in &params.resources {
        // Step 1: Base value = Q_i * P_i / 10,000
        let base_val = res
            .quantity_units
            .saturating_mul(res.conversion_rate_bps)
            / 10_000;

        // Step 2: Apply conservative haircut factor = base_val * H_i / 10,000
        let risk_adjusted_val = base_val
            .saturating_mul(res.haircut_bps)
            / 10_000;

        total_gross_capacity = total_gross_capacity.saturating_add(risk_adjusted_val);
    }

    // Step 3: Deduct outstanding liabilities
    total_gross_capacity.saturating_sub(params.outstanding_liabilities)
}

/// Opt-in verified contribution milestone
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContributionClaim {
    pub budget_cap: u64,              // B: remaining fixed program pool budget
    pub quantity_delivered: u64,      // q: verified work units (e.g. commits, test suites passed)
    pub reward_rate_bps: u64,         // r: published reward rate in basis points
    pub quality_adjustment_bps: u64,  // a: objective quality/uptime adjustment factor
}

/// Calculates reward allocation under fixed budget:
/// R = min(B, q * r * a)
pub fn calculate_contribution_reward(claim: &ContributionClaim) -> u64 {
    let base_reward = claim
        .quantity_delivered
        .saturating_mul(claim.reward_rate_bps)
        / 10_000;

    let adjusted_reward = base_reward
        .saturating_mul(claim.quality_adjustment_bps)
        / 10_000;

    std::cmp::min(claim.budget_cap, adjusted_reward)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reserve_capacity_calculation() {
        let params = ReserveParameters {
            resources: vec![
                InfrastructureResource {
                    resource_id: "compute-gpu-cluster-1".to_string(),
                    quantity_units: 1_000,      // 1,000 GPU-hours
                    conversion_rate_bps: 10_000, // 1.0 rate
                    haircut_bps: 9_000,         // 0.90 haircut (10% safety buffer)
                },
                InfrastructureResource {
                    resource_id: "verified-clean-energy-kwh".to_string(),
                    quantity_units: 5_000,      // 5,000 kWh
                    conversion_rate_bps: 2_000,  // 0.20 weight
                    haircut_bps: 8_500,         // 0.85 haircut (15% safety buffer)
                },
            ],
            outstanding_liabilities: 250,
        };

        // Compute 1: (1,000 * 10,000 / 10,000) * 9,000 / 10,000 = 900
        // Energy 2: (5,000 * 2,000 / 10,000) * 8,500 / 10,000 = 1,000 * 0.85 = 850
        // Gross = 900 + 850 = 1,750
        // Net = 1,750 - 250 = 1,500
        let max_issuance = calculate_max_issuance(&params);
        assert_eq!(max_issuance, 1_500);
    }

    #[test]
    fn test_contribution_reward_calculation() {
        let claim = ContributionClaim {
            budget_cap: 500,
            quantity_delivered: 200,          // 200 units delivered
            reward_rate_bps: 20_000,          // 2.0 rate (20,000 bps)
            quality_adjustment_bps: 9_500,    // 0.95 quality score
        };

        // base = 200 * 20,000 / 10,000 = 400
        // adjusted = 400 * 9,500 / 10,000 = 380
        // min(500, 380) = 380
        let reward = calculate_contribution_reward(&claim);
        assert_eq!(reward, 380);
    }
}
