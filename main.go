package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type EvidenceTier string

const (
	SelfReported        EvidenceTier = "SELF_REPORTED"
	WorkflowLinked      EvidenceTier = "WORKFLOW_LINKED"
	PeerAttested        EvidenceTier = "PEER_ATTESTED"
	IndependentlyVerified EvidenceTier = "INDEPENDENTLY_VERIFIED"
)

type ClaimRequest struct {
	Wallet             string       `json:"wallet"`
	MinutesLost        uint32       `json:"minutesLost"`
	HourlyRateCents    uint64       `json:"hourlyRateCents"`
	SeverityBps        uint32       `json:"severityBps"`
	ContextSwitchBps   uint32       `json:"contextSwitchBps"`
	EvidenceTier       EvidenceTier `json:"evidenceTier"`
	EvidenceRoot       string       `json:"evidenceRoot"`
	Signature          string       `json:"signature"`
	RulesetVersion     string       `json:"rulesetVersion"`
}

type ClaimResponse struct {
	ClaimID             uint64       `json:"claimId"`
	ImpactScoreBps      uint32       `json:"impactScoreBps"`
	ImpactEstimateCents uint64       `json:"impactEstimateCents"`
	EvidenceConfidenceBps uint32     `json:"evidenceConfidenceBps"`
	EvidenceTier        EvidenceTier `json:"evidenceTier"`
	Status              string       `json:"status"`
	ReceiptHash         string       `json:"receiptHash"`
	SubmittedAt         int64        `json:"submittedAt"`
}

// CalculateEvidenceConfidenceBps maps evidence tiers to explicit multiplier bounds
func CalculateEvidenceConfidenceBps(tier EvidenceTier) uint32 {
	switch tier {
	case SelfReported:
		return 2500 // 0.25
	case WorkflowLinked:
		return 6000 // 0.60
	case PeerAttested:
		return 8500 // 0.85
	case IndependentlyVerified:
		return 10000 // 1.00
	default:
		return 2500
	}
}

// ImpactValueCents executes the exact integer BPS formula: I = H * R * S * F * E
func ImpactValueCents(req *ClaimRequest) uint64 {
	base := (req.HourlyRateCents * uint64(req.MinutesLost)) / 60
	adjSeverity := (base * uint64(req.SeverityBps)) / 10000
	adjContext := (adjSeverity * uint64(req.ContextSwitchBps)) / 10000
	confidenceBps := uint64(CalculateEvidenceConfidenceBps(req.EvidenceTier))
	return (adjContext * confidenceBps) / 10000
}

func handleScoreClaim(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ClaimRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.MinutesLost == 0 || req.HourlyRateCents == 0 {
		http.Error(w, "invalid hours or reference rate", http.StatusBadRequest)
		return
	}

	cents := ImpactValueCents(&req)
	confidenceBps := CalculateEvidenceConfidenceBps(req.EvidenceTier)
	now := time.Now().Unix()

	resp := ClaimResponse{
		ClaimID:               1042,
		ImpactScoreBps:        uint32(cents),
		ImpactEstimateCents:   cents,
		EvidenceConfidenceBps: confidenceBps,
		EvidenceTier:          req.EvidenceTier,
		Status:                "FINALIZED_COMMITMENT",
		ReceiptHash:           fmt.Sprintf("0x%x", now),
		SubmittedAt:           now,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"active","service":"Go Protocol Backend","version":"v1.0.0"}`))
}

func main() {
	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/api/v1/claims/score", handleScoreClaim)

	port := ":8099"
	fmt.Println("🚀 Go Protocol Backend running on http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
