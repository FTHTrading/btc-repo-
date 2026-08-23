//! Comprehensive Test Suite for Biophysical Signal Validation and Quadratic ZK Predicates
//! Verifies constraint boundaries, slew-rate artifact detection, extreme clipping, and ZK witness generation.

#[cfg(test)]
mod tests {
    use crate::biophysical_typed::*;

    #[test]
    fn test_ectopic_beat_spike_rejection() {
        // Ectopic Beat Spike: RR = [800, 810, 1250, 805]
        // Step from 810 to 1250 is delta = 440 ms > 300 ms allowed slew-rate
        let mut series = vec![
            MilliSeconds(800),
            MilliSeconds(810),
            MilliSeconds(1250),
            MilliSeconds(805),
        ];
        // Pad to meet minimum sampling density requirement (N >= 10)
        while series.len() < 10 {
            series.push(MilliSeconds(800));
        }

        let result = validate_rr_timeseries(&series, 8000, 9000);
        match result {
            Err(BioValidationError::NonPhysiologicalDerivative { delta, max_slew_allowed, .. }) => {
                assert_eq!(delta, 440);
                assert_eq!(max_slew_allowed, 300);
            }
            _ => panic!("Expected NonPhysiologicalDerivative error on ectopic beat spike"),
        }
    }

    #[test]
    fn test_extreme_tachycardia_clipping_low() {
        // RR = 250 ms (~240 bpm) -> Below 300 ms lower physiological limit
        let mut series = vec![MilliSeconds(250)];
        while series.len() < 10 {
            series.push(MilliSeconds(250));
        }

        let result = validate_rr_timeseries(&series, 8000, 9000);
        match result {
            Err(BioValidationError::SignalClippedLow { value, min_allowed, .. }) => {
                assert_eq!(value, 250);
                assert_eq!(min_allowed, 300);
            }
            _ => panic!("Expected SignalClippedLow error for extreme tachycardia"),
        }
    }

    #[test]
    fn test_extreme_bradycardia_clipping_high() {
        // RR = 2200 ms (~27 bpm) -> Above 2000 ms upper physiological limit
        let mut series = vec![MilliSeconds(2200)];
        while series.len() < 10 {
            series.push(MilliSeconds(2200));
        }

        let result = validate_rr_timeseries(&series, 8000, 9000);
        match result {
            Err(BioValidationError::SignalClippedHigh { value, max_allowed, .. }) => {
                assert_eq!(value, 2200);
                assert_eq!(max_allowed, 2000);
            }
            _ => panic!("Expected SignalClippedHigh error for extreme bradycardia"),
        }
    }

    #[test]
    fn test_valid_high_hrv_session_witness_allocation() {
        // N = 120 beats, delta_RR alternating between +45 ms and -45 ms, Threshold = 30 ms
        let mut series = Vec::with_capacity(120);
        let mut current_rr = 800;

        for i in 0..120 {
            if i % 2 == 0 {
                current_rr += 45;
            } else {
                current_rr -= 45;
            }
            series.push(MilliSeconds(current_rr));
        }

        // 1. Validation pass (physiological bounds and slew rates satisfied)
        let validation_res = validate_rr_timeseries(&series, 8000, 9500);
        assert!(validation_res.is_ok(), "High-HRV series should pass validation");

        // 2. Quadratic ZK predicate evaluation (Threshold = 30 ms)
        let predicate_passed = evaluate_quadratic_rmssd_predicate(&series, 30).unwrap();
        assert!(predicate_passed, "Quadratic RMSSD should satisfy threshold of 30 ms");
    }
}
