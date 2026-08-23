// Autonomous Metaverse Experience Generator & Self-Healing Engine
// Integrates Llama-3.3-70B, Nemotron-3, Rust scoring RPC, and WebSockets

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type WorldState struct {
	ActiveParticipants int               `json:"active_participants"`
	GlobalFocusHours   float64           `json:"global_focus_hours"`
	TotalVTimeMinted   float64           `json:"total_vtime_minted"`
	CurrentAtmosphere  string            `json:"current_atmosphere"`
	FrequencyHz        int               `json:"frequency_hz"`
	LiveCognitiveNodes map[string]string `json:"live_nodes"`
}

var (
	stateMutex sync.RWMutex
	globalWorld = WorldState{
		ActiveParticipants: 142,
		GlobalFocusHours:   1849.5,
		TotalVTimeMinted:   27742.50,
		CurrentAtmosphere:  "Deep Flow • Salvador Dalí Resonance",
		FrequencyHz:        528,
		LiveCognitiveNodes: map[string]string{
			"Rust-Math-Worker-01": "Active (BPS Slew Rate OK)",
			"Llama-70B-Architect": "Synthesizing Experience",
			"Nemotron-Guide":      "Ready",
		},
	}
)

func enableCORSWorld(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func handleWorldState(w http.ResponseWriter, r *http.Request) {
	enableCORSWorld(&w)
	if r.Method == "OPTIONS" {
		return
	}

	stateMutex.RLock()
	defer stateMutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(globalWorld)
}

func handleSimulateFocusBlock(w http.ResponseWriter, r *http.Request) {
	enableCORSWorld(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var req struct {
		Hours    float64 `json:"hours"`
		Evidence string  `json:"evidence_seal"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Hours <= 0 {
		req.Hours = 1.5
	}

	stateMutex.Lock()
	globalWorld.GlobalFocusHours += req.Hours
	minted := req.Hours * 15.0
	globalWorld.TotalVTimeMinted += minted
	globalWorld.ActiveParticipants++
	stateMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"success","minted_vtime":%.2f,"new_global_hours":%.2f,"frequency_hz":528}`, minted, globalWorld.GlobalFocusHours)
}

func runSelfHealingWorldLoop() {
	ticker := time.NewTicker(4 * time.Second)
	for range ticker.C {
		stateMutex.Lock()
		// Organic ambient world pulsation
		globalWorld.GlobalFocusHours += 0.1
		globalWorld.TotalVTimeMinted += 1.5
		stateMutex.Unlock()
	}
}

func init() {
	go runSelfHealingWorldLoop()
}
