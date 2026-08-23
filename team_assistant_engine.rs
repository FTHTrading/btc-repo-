//! Team Workflow & Assistant Optimization Engine
//! Models complementary human team strengths (e.g. Deep Focus vs. Rapid Context Switching)
//! and calculates optimal task allocation and cognitive load balancing.

use serde::{Deserialize, Serialize};

/// Human cognitive strength profile for team workflows
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CognitiveArchetype {
    DeepArchitect,       // High sustained focus, high context-switching recovery cost
    RapidResponder,      // Low context-switching friction, high triage speed
    SystemsAuditor,      // High precision, strict verification and edge-case detection
    CreativeSynthesizer, // High conceptual generation, cross-domain connection
}

/// Profile representing a team member or assistant agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamMemberProfile {
    pub member_id: String,
    pub archetype: CognitiveArchetype,
    pub baseline_focus_capacity_minutes: u32,
    pub recovery_cost_multiplier_bps: u32, // e.g. 14,000 = 1.4x recovery penalty
    pub verification_speed_bps: u32,       // 10,000 = standard speed
}

/// Task requirement for workload distribution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkloadTask {
    pub task_id: String,
    pub estimated_duration_minutes: u32,
    pub required_focus_tier: u8, // 1 (triage) to 5 (deep architecture / ZK circuit)
    pub interruptibility_score: u8, // 1 (do not interrupt) to 5 (asynchronous / interruptible)
}

/// Matches tasks to team members based on minimizing collective context-switching friction
pub fn match_task_to_optimal_member<'a>(
    task: &WorkloadTask,
    team: &'a [TeamMemberProfile],
) -> Option<&'a TeamMemberProfile> {
    if team.is_empty() {
        return None;
    }

    // High focus / low interruptibility -> match DeepArchitect or SystemsAuditor
    // High interruptibility / fast response -> match RapidResponder
    if task.required_focus_tier >= 4 {
        team.iter().find(|m| m.archetype == CognitiveArchetype::DeepArchitect)
            .or_else(|| team.iter().find(|m| m.archetype == CognitiveArchetype::SystemsAuditor))
            .or_else(|| team.first())
    } else if task.interruptibility_score >= 4 {
        team.iter().find(|m| m.archetype == CognitiveArchetype::RapidResponder)
            .or_else(|| team.first())
    } else {
        team.first()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_matching_logic() {
        let team = vec![
            TeamMemberProfile {
                member_id: "alice-architect".to_string(),
                archetype: CognitiveArchetype::DeepArchitect,
                baseline_focus_capacity_minutes: 120,
                recovery_cost_multiplier_bps: 18_000, // 1.8x
                verification_speed_bps: 9_000,
            },
            TeamMemberProfile {
                member_id: "bob-triage".to_string(),
                archetype: CognitiveArchetype::RapidResponder,
                baseline_focus_capacity_minutes: 45,
                recovery_cost_multiplier_bps: 10_000, // 1.0x
                verification_speed_bps: 12_000,
            },
        ];

        let deep_task = WorkloadTask {
            task_id: "zk-circuit-optimization".to_string(),
            estimated_duration_minutes: 90,
            required_focus_tier: 5,
            interruptibility_score: 1,
        };

        let matched = match_task_to_optimal_member(&deep_task, &team).unwrap();
        assert_eq!(matched.member_id, "alice-architect");
    }
}
