//! Personal Bio-Signal & Frequency Attestation Engine
//! Implements privacy-preserving device attestation, commitment hashing,
//! and deterministic feature computation (e.g. RMSSD, HRV quality thresholds).
//!
//! "A privacy-preserving proof of a defined, consented, device-attested measurement."

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// Hardware & firmware provenance attestation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DeviceProvenance {
    pub device_public_key_hash: String,
    pub firmware_build_hash: String,
    pub device_model_id: String,
    pub secure_element_attested: bool,
}

/// Raw sensor measurement session (stored ONLY in local encrypted client storage)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BioSignalSession {
    pub session_id: String,
    pub protocol_id: String,            // e.g. "RESTING_ECG_V1"
    pub measured_at_unix_ms: i64,
    pub sample_rate_hz: u32,
    pub rr_intervals_ms: Vec<u32>,      // R-R inter-beat intervals in milliseconds
    pub raw_quality_score_bps: u32,     // Q in basis points: 10,000 = 1.00 (100% signal quality)
    pub provenance: DeviceProvenance,
    pub secret_nonce: String,           // salt r for cryptographic commitment
}

/// Public verification proof package (safe for on-chain or verifier presentation)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct BioSignalProofPackage {
    pub proof_version: String,
    pub protocol_id: String,
    pub session_commitment: String,     // Public hash commitment C
    pub issued_at_bucket: String,
    pub quality_threshold_bps: u32,
    pub predicate_statement: String,    // e.g., "rmssd_gte_threshold"
    pub predicate_satisfied: bool,
    pub verified_device_model: String,
    pub simulation_or_research_only: bool,
}

/// Computes the public cryptographic commitment:
/// C = H(protocol || device_hash || firmware_hash || raw_samples || nonce)
pub fn compute_session_commitment(session: &BioSignalSession) -> String {
    let mut hasher = Sha256::new();
    hasher.update(session.protocol_id.as_bytes());
    hasher.update(session.provenance.device_public_key_hash.as_bytes());
    hasher.update(session.provenance.firmware_build_hash.as_bytes());

    for rr in &session.rr_intervals_ms {
        hasher.update(&rr.to_le_bytes());
    }

    hasher.update(session.secret_nonce.as_bytes());
    hex::encode(hasher.finalize())
}

/// Deterministic integer RMSSD calculation (Root Mean Square of Successive Differences)
/// Math: sqrt( (1 / (N-1)) * sum( (RR_{i+1} - RR_i)^2 ) )
pub fn calculate_rmssd_ms(rr_intervals: &[u32]) -> Option<u32> {
    if rr_intervals.len() < 2 {
        return None;
    }

    let n_minus_1 = (rr_intervals.len() - 1) as u64;
    let mut sum_squared_diffs: u64 = 0;

    for i in 0..(rr_intervals.len() - 1) {
        let diff = (rr_intervals[i + 1] as i64) - (rr_intervals[i] as i64);
        let squared = (diff * diff) as u64;
        sum_squared_diffs = sum_squared_diffs.saturating_add(squared);
    }

    let mean_squared = sum_squared_diffs / n_minus_1;
    let rmssd = (mean_squared as f64).sqrt() as u32;
    Some(rmssd)
}

/// Evaluates the private ZK-style predicate:
/// 1. Validates signal quality (Q >= Q_min)
/// 2. Validates device provenance (secure element verified)
/// 3. Computes RMSSD and checks if RMSSD >= threshold_ms
pub fn generate_predicate_proof(
    session: &BioSignalSession,
    min_quality_bps: u32,
    threshold_rmssd_ms: u32,
) -> Result<BioSignalProofPackage, &'static str> {
    if session.raw_quality_score_bps < min_quality_bps {
        return Err("Signal quality below minimum threshold");
    }

    if !session.provenance.secure_element_attested {
        return Err("Device provenance not verified by secure element");
    }

    let rmssd = calculate_rmssd_ms(&session.rr_intervals_ms)
        .ok_or("Insufficient R-R intervals for calculation")?;

    let satisfied = rmssd >= threshold_rmssd_ms;
    let commitment = compute_session_commitment(session);

    Ok(BioSignalProofPackage {
        proof_version: "biosignal-zk-v1".to_string(),
        protocol_id: session.protocol_id.clone(),
        session_commitment: format!("0x{}", commitment),
        issued_at_bucket: "2026-08-23T08:00:00Z".to_string(),
        quality_threshold_bps: min_quality_bps,
        predicate_statement: format!("rmssd_gte_{}ms", threshold_rmssd_ms),
        predicate_satisfied: satisfied,
        verified_device_model: session.provenance.device_model_id.clone(),
        simulation_or_research_only: true,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rmssd_calculation() {
        // Known R-R sequence: 800, 840, 810, 850
        // Diffs: +40 (sq: 1600), -30 (sq: 900), +40 (sq: 1600)
        // Sum = 4100, N-1 = 3, Mean = 1366.66, sqrt(1366) = 36 ms
        let rr = vec![800, 840, 810, 850];
        let rmssd = calculate_rmssd_ms(&rr).unwrap();
        assert_eq!(rmssd, 36);
    }

    #[test]
    fn test_predicate_proof_success() {
        let session = BioSignalSession {
            session_id: "test-session-001".to_string(),
            protocol_id: "RESTING_ECG_V1".to_string(),
            measured_at_unix_ms: 1787460000000,
            sample_rate_hz: 250,
            rr_intervals_ms: vec![800, 840, 810, 850],
            raw_quality_score_bps: 9_200, // 92% quality
            provenance: DeviceProvenance {
                device_public_key_hash: "0xabc123".to_string(),
                firmware_build_hash: "0xdef456".to_string(),
                device_model_id: "CardioWatch-SE-v2".to_string(),
                secure_element_attested: true,
            },
            secret_nonce: "secret-salt-777".to_string(),
        };

        // Threshold = 30 ms (actual RMSSD is 36 ms) -> Satisfied
        let proof = generate_predicate_proof(&session, 8_500, 30).unwrap();
        assert!(proof.predicate_satisfied);
        assert_eq!(proof.predicate_statement, "rmssd_gte_30ms");
        assert!(proof.session_commitment.starts_with("0x"));
    }
}
