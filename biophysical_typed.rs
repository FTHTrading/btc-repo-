//! Strongly-Typed Biophysical Baselines & Slew-Rate Validation Engine
//! Implements integer fixed-point math, unit safety (Newtype pattern),
//! temporal derivative / slew-rate constraints, and explicit error taxonomy.

use serde::{Deserialize, Serialize};

/// Type-safe unit wrappers (Newtype Pattern)
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct MicroVolts(pub u32); // EEG voltage: u32 µV

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct MilliSeconds(pub u32); // Time intervals: u32 ms

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct NanoSiemens(pub u32); // EDA Conductance: u32 nS (1 µS = 1,000 nS)

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct MilliGrams(pub u64); // Biological carbon/mass: u64 mg

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct MilliWatts(pub u32); // Metabolic power: u32 mW

/// Actionable diagnostic error taxonomy
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum BioValidationError {
    SignalClippedHigh { metric: String, value: u64, max_allowed: u64 },
    SignalClippedLow { metric: String, value: u64, min_allowed: u64 },
    NonPhysiologicalDerivative { metric: String, delta: u32, max_slew_allowed: u32 },
    ElectrodeImpedanceFault { metric: String },
    InsufficientSamplingDensity { samples: usize, required: usize },
    QualityScoreBelowThreshold { score_bps: u32, min_bps: u32 },
}

/// Physiological limits expressed purely in integer fixed-point units
pub struct IntegerBiophysicalBaselines;

impl IntegerBiophysicalBaselines {
    // --- EEG ---
    pub const EEG_VOLTAGE_MIN: MicroVolts = MicroVolts(10);
    pub const EEG_VOLTAGE_MAX: MicroVolts = MicroVolts(100);
    pub const EEG_MAX_SLEW_RATE_UV_PER_SAMPLE: u32 = 40; // max valid spike per sample

    // --- ECG & R-R Intervals ---
    pub const RR_INTERVAL_MIN: MilliSeconds = MilliSeconds(300);  // ~200 bpm max tachy limit
    pub const RR_INTERVAL_MAX: MilliSeconds = MilliSeconds(2000); // ~30 bpm min brady limit
    pub const MAX_DELTA_RR_SUCCESSIVE_MS: u32 = 300;             // Max physiological step between beats

    // --- EDA (Skin Conductance) ---
    pub const EDA_TONIC_MIN: NanoSiemens = NanoSiemens(1_000);   // 1 µS
    pub const EDA_TONIC_MAX: NanoSiemens = NanoSiemens(25_000);  // 25 µS
    pub const EDA_MAX_SLEW_NS_PER_100MS: u32 = 3_000;            // 3 µS max jump per 100ms

    // --- Metabolic ---
    pub const RESTING_THERMAL_POWER_MW_AVG: MilliWatts = MilliWatts(75_000); // 75 W average
}

/// Validates raw R-R interval time-series against integer bounds and physiological slew-rates
pub fn validate_rr_timeseries(
    rr_intervals: &[MilliSeconds],
    min_quality_bps: u32,
    actual_quality_bps: u32,
) -> Result<(), BioValidationError> {
    if actual_quality_bps < min_quality_bps {
        return Err(BioValidationError::QualityScoreBelowThreshold {
            score_bps: actual_quality_bps,
            min_bps: min_quality_bps,
        });
    }

    if rr_intervals.len() < 10 {
        return Err(BioValidationError::InsufficientSamplingDensity {
            samples: rr_intervals.len(),
            required: 10,
        });
    }

    for (i, rr) in rr_intervals.iter().enumerate() {
        if *rr < IntegerBiophysicalBaselines::RR_INTERVAL_MIN {
            return Err(BioValidationError::SignalClippedLow {
                metric: "RR_interval_ms".to_string(),
                value: rr.0 as u64,
                min_allowed: IntegerBiophysicalBaselines::RR_INTERVAL_MIN.0 as u64,
            });
        }

        if *rr > IntegerBiophysicalBaselines::RR_INTERVAL_MAX {
            return Err(BioValidationError::SignalClippedHigh {
                metric: "RR_interval_ms".to_string(),
                value: rr.0 as u64,
                max_allowed: IntegerBiophysicalBaselines::RR_INTERVAL_MAX.0 as u64,
            });
        }

        if i > 0 {
            let prev = rr_intervals[i - 1];
            let delta = if rr.0 >= prev.0 { rr.0 - prev.0 } else { prev.0 - rr.0 };
            if delta > IntegerBiophysicalBaselines::MAX_DELTA_RR_SUCCESSIVE_MS {
                return Err(BioValidationError::NonPhysiologicalDerivative {
                    metric: "RR_delta_ms".to_string(),
                    delta,
                    max_slew_allowed: IntegerBiophysicalBaselines::MAX_DELTA_RR_SUCCESSIVE_MS,
                });
            }
        }
    }

    Ok(())
}

/// Evaluates ZK quadratic integer RMSSD predicate:
/// sum_{i=1}^{N-1} (RR_{i+1} - RR_i)^2 >= (N - 1) * Threshold^2
pub fn evaluate_quadratic_rmssd_predicate(
    rr_intervals: &[MilliSeconds],
    threshold_ms: u32,
) -> Result<bool, BioValidationError> {
    if rr_intervals.len() < 2 {
        return Err(BioValidationError::InsufficientSamplingDensity {
            samples: rr_intervals.len(),
            required: 2,
        });
    }

    let n_minus_1 = (rr_intervals.len() - 1) as u64;
    let mut sum_squared_diffs: u64 = 0;

    for i in 0..(rr_intervals.len() - 1) {
        let current = rr_intervals[i].0 as i64;
        let next = rr_intervals[i + 1].0 as i64;
        let diff = next - current;
        let squared = (diff * diff) as u64;
        sum_squared_diffs = sum_squared_diffs.saturating_add(squared);
    }

    let target_threshold_sq = (threshold_ms as u64)
        .saturating_mul(threshold_ms as u64)
        .saturating_mul(n_minus_1);

    Ok(sum_squared_diffs >= target_threshold_sq)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_rr_series_and_quadratic_predicate() {
        let series = vec![
            MilliSeconds(800),
            MilliSeconds(840),
            MilliSeconds(810),
            MilliSeconds(850),
            MilliSeconds(820),
            MilliSeconds(860),
            MilliSeconds(830),
            MilliSeconds(870),
            MilliSeconds(840),
            MilliSeconds(880),
        ];

        // Validates under physiological bounds
        assert!(validate_rr_timeseries(&series, 8500, 9500).is_ok());

        // Quadratic integer predicate (threshold = 30 ms)
        let predicate_passed = evaluate_quadratic_rmssd_predicate(&series, 30).unwrap();
        assert!(predicate_passed);
    }

    #[test]
    fn test_slew_rate_rejection_on_sensor_drop() {
        let corrupted_series = vec![
            MilliSeconds(800),
            MilliSeconds(820),
            MilliSeconds(1500), // jump of 680 ms > 300 ms allowed slew-rate
            MilliSeconds(810),
            MilliSeconds(820),
            MilliSeconds(830),
            MilliSeconds(840),
            MilliSeconds(850),
            MilliSeconds(860),
            MilliSeconds(870),
        ];

        let result = validate_rr_timeseries(&corrupted_series, 8500, 9500);
        match result {
            Err(BioValidationError::NonPhysiologicalDerivative { delta, .. }) => {
                assert_eq!(delta, 680);
            }
            _ => panic!("Expected NonPhysiologicalDerivative error"),
        }
    }
}
