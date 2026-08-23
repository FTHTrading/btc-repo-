//! Biophysical Baselines & Ecological Metrics Reference Module
//! Grounded in empirical physiological and environmental science.
//!
//! Provides verifiable boundary checks, baseline constants, and unit conversions
//! for bio-signal feature validation (EEG, ECG, EDA, BMR, Respiration, Carbon).

use serde::{Deserialize, Serialize};

/// Validated biophysical signal ranges based on established medical/biophysical data
pub struct BiophysicalBaselines;

impl BiophysicalBaselines {
    // --- EEG Voltage & Frequency Bands ---
    pub const EEG_VOLTAGE_MIN_UV: f64 = 10.0;
    pub const EEG_VOLTAGE_MAX_UV: f64 = 100.0;

    pub const DELTA_BAND_HZ: (f64, f64) = (0.5, 4.0);
    pub const THETA_BAND_HZ: (f64, f64) = (4.0, 8.0);
    pub const ALPHA_BAND_HZ: (f64, f64) = (8.0, 12.0);
    pub const BETA_BAND_HZ: (f64, f64) = (12.0, 30.0);
    pub const GAMMA_BAND_HZ: (f64, f64) = (30.0, 100.0);

    // --- ECG & HRV Parameters ---
    pub const RESTING_HEART_RATE_BPM_MIN: u32 = 40;
    pub const RESTING_HEART_RATE_BPM_MAX: u32 = 120;
    pub const HEALTHY_RMSSD_MS_MIN: u32 = 15;
    pub const HEALTHY_RMSSD_MS_MAX: u32 = 100;

    // --- Electrodermal Activity (EDA / GSR) ---
    pub const EDA_TONIC_MIN_USIEMENS: f64 = 1.0;
    pub const EDA_TONIC_MAX_USIEMENS: f64 = 25.0;

    // --- Metabolic & Energetic Output ---
    pub const BASAL_METABOLIC_RATE_KCAL_DAY_MIN: u32 = 1200;
    pub const BASAL_METABOLIC_RATE_KCAL_DAY_MAX: u32 = 2500;
    pub const RESTING_THERMAL_POWER_WATTS_AVG: f64 = 75.0; // ~60-80 W continuous output

    // --- Biological Carbon & Respiration Output ---
    pub const DAILY_CO2_EXHALED_KG_MIN: f64 = 0.7;
    pub const DAILY_CO2_EXHALED_KG_MAX: f64 = 1.2;
    pub const EXHALED_CO2_PPM_TYPICAL: u32 = 45_000; // ~4.5% CO2 (vs 420 ppm ambient)
}

/// Verification result for a biometric measurement batch
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SignalSanityCheck {
    pub metric_name: String,
    pub measured_value: f64,
    pub expected_range: (f64, f64),
    pub within_physiological_bounds: bool,
    pub device_quality_flag: bool,
}

/// Validates whether an incoming raw sensor measurement is within human physiological reality
pub fn validate_sensor_reading(
    metric: &str,
    value: f64,
    signal_quality_bps: u32,
) -> SignalSanityCheck {
    let (min, max) = match metric {
        "heart_rate_bpm" => (
            BiophysicalBaselines::RESTING_HEART_RATE_BPM_MIN as f64,
            BiophysicalBaselines::RESTING_HEART_RATE_BPM_MAX as f64,
        ),
        "rmssd_ms" => (
            BiophysicalBaselines::HEALTHY_RMSSD_MS_MIN as f64,
            BiophysicalBaselines::HEALTHY_RMSSD_MS_MAX as f64,
        ),
        "eda_microsiemens" => (
            BiophysicalBaselines::EDA_TONIC_MIN_USIEMENS,
            BiophysicalBaselines::EDA_TONIC_MAX_USIEMENS,
        ),
        "daily_co2_kg" => (
            BiophysicalBaselines::DAILY_CO2_EXHALED_KG_MIN,
            BiophysicalBaselines::DAILY_CO2_EXHALED_KG_MAX,
        ),
        _ => (0.0, 1_000_000.0),
    };

    let in_bounds = value >= min && value <= max;
    let quality_ok = signal_quality_bps >= 8_000; // at least 80% device quality score

    SignalSanityCheck {
        metric_name: metric.to_string(),
        measured_value: value,
        expected_range: (min, max),
        within_physiological_bounds: in_bounds,
        device_quality_flag: quality_ok,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_hrv_reading() {
        let check = validate_sensor_reading("rmssd_ms", 42.0, 9500);
        assert!(check.within_physiological_bounds);
        assert!(check.device_quality_flag);
    }

    #[test]
    fn test_out_of_bounds_sensor_artifact() {
        // 450 ms RMSSD is a sensor disconnect / artifact error in resting human data
        let check = validate_sensor_reading("rmssd_ms", 450.0, 4000);
        assert!(!check.within_physiological_bounds);
        assert!(!check.device_quality_flag);
    }
}
