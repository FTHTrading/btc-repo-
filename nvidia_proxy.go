// NVIDIA NIM Multi-Modal AI Proxy Server
// Integrates FLUX.1 / Stable Diffusion 3.5, Text-to-Video, Nemotron-3, DeepSeek-V4, Llama-3.3-70B, and Riva

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

const (
	NvidiaBaseURL = "https://integrate.api.nvidia.com/v1"

	// User-provided active NVIDIA API Keys
	NvidiaAPIKeyNemotron = "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"
	NvidiaAPIKeyDeepseek = "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"
	NvidiaAPIKeyWhisper  = "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"
	NvidiaAPIKeyRiva     = "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"
	NvidiaAPIKeyUser65   = "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"
	NvidiaAPIKeyLlama70B = "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"
	NvidiaAPIKeyFlux49   = "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"
	NvidiaAPIKeyVideo35  = "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"
)

type ChatRequest struct {
	Model       string                   `json:"model"`
	Messages    []map[string]interface{} `json:"messages"`
	Temperature float64                  `json:"temperature,omitempty"`
	TopP        float64                  `json:"top_p,omitempty"`
	MaxTokens   int                      `json:"max_tokens,omitempty"`
}

type ImageGenRequest struct {
	Prompt string `json:"prompt"`
	Model  string `json:"model"`
	Width  int    `json:"width,omitempty"`
	Height int    `json:"height,omitempty"`
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

// 1. Hyper-Realistic Dalí Badge & Milestone Art Generator (FLUX.1-dev / SD 3.5 Large)
func handleGenerateDaliBadge(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var req struct {
		MilestoneTheme string `json:"theme"`
		FocusHours     string `json:"focus_hours"`
		Archetype      string `json:"archetype"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.MilestoneTheme == "" {
		req.MilestoneTheme = "Liquid Gold Melting Clock in Surreal Cosmic Desert"
		req.FocusHours = "2.0 Hours"
		req.Archetype = "DeepArchitect"
	}

	fullPrompt := fmt.Sprintf(
		"Salvador Dali surrealist masterpiece badge, %s, intricate golden clock melting over a cosmic sand dune, glowing 528Hz aura, hyper-realistic 8k render, octane render, unreal engine 5 volumetric lighting, sacred geometry time seal.",
		req.MilestoneTheme,
	)

	imageReq := ImageGenRequest{
		Prompt: fullPrompt,
		Model:  "black-forest-labs/flux_1-schnell",
		Width:  1024,
		Height: 1024,
	}

	reqBytes, _ := json.Marshal(imageReq)
	httpReq, _ := http.NewRequest("POST", NvidiaBaseURL+"/genai/black-forest-labs/flux_1-schnell", bytes.NewBuffer(reqBytes))
	httpReq.Header.Set("Authorization", "Bearer "+NvidiaAPIKeyFlux49)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("NVIDIA Image Gen error: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

// 2. HD Hyper-Realistic Text-to-Video & Living Relic Animator
func handleGenerateLivingVideo(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var req struct {
		Prompt string `json:"prompt"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Prompt == "" {
		req.Prompt = "Hyper-realistic slow motion cinematic video of a golden Salvador Dali liquid clock softly dripping under a surreal starlit twilight sky, volumetric glowing mist, 4k ultra-detailed."
	}

	videoReq := map[string]interface{}{
		"prompt":        req.Prompt,
		"model":         "stabilityai/stable-video-diffusion",
		"cfg_scale":     2.5,
		"motion_bucket": 127,
	}

	reqBytes, _ := json.Marshal(videoReq)
	httpReq, _ := http.NewRequest("POST", NvidiaBaseURL+"/video/generation", bytes.NewBuffer(reqBytes))
	httpReq.Header.Set("Authorization", "Bearer "+NvidiaAPIKeyVideo35)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("NVIDIA Video Gen error: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

// Autonomous Self-Healing Experience & Metaverse Architect Engine (Llama-3.3-70B-Instruct)
func handleAutonomousArchitect(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var reqBody struct {
		Action          string `json:"action"`
		UserEnergyLevel string `json:"user_energy_level"`
		CurrentContext  string `json:"current_context"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil || reqBody.Action == "" {
		reqBody.Action = "generate_experience"
		reqBody.UserEnergyLevel = "high_flow"
		reqBody.CurrentContext = "Self-Sovereign Focus and Energy Ledger"
	}

	systemPrompt := "You are the Autonomous Self-Healing Metaverse & Experience Engine for All Couch No Cage. " +
		"Return clear, structured JSON containing the experience theme, cognitive prompt, ambient tone, and real-time focus ritual."

	chatReq := ChatRequest{
		Model: "meta/llama-3.3-70b-instruct",
		Messages: []map[string]interface{}{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": fmt.Sprintf("Action: %s | User Energy: %s | Context: %s", reqBody.Action, reqBody.UserEnergyLevel, reqBody.CurrentContext)},
		},
		Temperature: 0.2,
		TopP:        0.7,
		MaxTokens:   1024,
	}

	reqBytes, _ := json.Marshal(chatReq)
	httpReq, _ := http.NewRequest("POST", NvidiaBaseURL+"/chat/completions", bytes.NewBuffer(reqBytes))
	httpReq.Header.Set("Authorization", "Bearer "+NvidiaAPIKeyLlama70B)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("NVIDIA Llama-3.3 Engine error: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

// Personalized AI Assistant
func handlePersonalizedAssistant(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var reqBody struct {
		UserMessage string `json:"message"`
		Archetype   string `json:"archetype"`
		Tone        string `json:"tone"`
		FocusTopic  string `json:"focus_topic"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil || reqBody.UserMessage == "" {
		reqBody.UserMessage = "How can I optimize my next deep focus block today?"
	}

	systemPrompt := fmt.Sprintf(
		"You are a personalized cognitive AI assistant in the All Couch No Cage self-mastery protocol. "+
			"The user's cognitive archetype is '%s', with a preferred '%s' tone. "+
			"Guide them with clarity, warmth, and actionable focus optimization strategies without surveillance or judgment. Focus context: %s.",
		reqBody.Archetype, reqBody.Tone, reqBody.FocusTopic,
	)

	chatReq := ChatRequest{
		Model: "nvidia/nemotron-3-super-120b-a12b",
		Messages: []map[string]interface{}{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": reqBody.UserMessage},
		},
		Temperature: 0.75,
		TopP:        0.95,
		MaxTokens:   1024,
	}

	reqBytes, _ := json.Marshal(chatReq)
	httpReq, _ := http.NewRequest("POST", NvidiaBaseURL+"/chat/completions", bytes.NewBuffer(reqBytes))
	httpReq.Header.Set("Authorization", "Bearer "+NvidiaAPIKeyUser65)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("NVIDIA Assistant error: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

func handleNemotronVoiceStory(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var reqBody struct {
		Prompt string `json:"prompt"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil || reqBody.Prompt == "" {
		reqBody.Prompt = "Generate a soothing, philosophical 2-sentence reflection on owning your focus and human energy."
	}

	chatReq := ChatRequest{
		Model: "nvidia/nemotron-3-super-120b-a12b",
		Messages: []map[string]interface{}{
			{"role": "system", "content": "You are a calming, philosophical guide for a self-sovereign focus protocol. Speak with warmth, clarity, and depth."},
			{"role": "user", "content": reqBody.Prompt},
		},
		Temperature: 0.8,
		TopP:        0.95,
		MaxTokens:   512,
	}

	reqBytes, _ := json.Marshal(chatReq)
	httpReq, _ := http.NewRequest("POST", NvidiaBaseURL+"/chat/completions", bytes.NewBuffer(reqBytes))
	httpReq.Header.Set("Authorization", "Bearer "+NvidiaAPIKeyNemotron)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("NVIDIA API error: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

func handleDeepSeekReasoning(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var reqBody struct {
		FocusTopic string `json:"focus_topic"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil || reqBody.FocusTopic == "" {
		reqBody.FocusTopic = "Evaluate optimal recovery times for a 90-minute deep programming session."
	}

	chatReq := ChatRequest{
		Model: "deepseek-ai/deepseek-v4-flash-0731",
		Messages: []map[string]interface{}{
			{"role": "system", "content": "You are an analytical assistant calculating cognitive load, context-switching friction, and focus optimization."},
			{"role": "user", "content": reqBody.FocusTopic},
		},
		Temperature: 0.7,
		TopP:        0.95,
		MaxTokens:   1024,
	}

	reqBytes, _ := json.Marshal(chatReq)
	httpReq, _ := http.NewRequest("POST", NvidiaBaseURL+"/chat/completions", bytes.NewBuffer(reqBytes))
	httpReq.Header.Set("Authorization", "Bearer "+NvidiaAPIKeyDeepseek)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("DeepSeek API error: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8098"
	}

	http.HandleFunc("/api/v1/metaverse/state", handleWorldState)
	http.HandleFunc("/api/v1/metaverse/focus-block", handleSimulateFocusBlock)
	http.HandleFunc("/api/v1/nvidia/dali-badge", handleGenerateDaliBadge)
	http.HandleFunc("/api/v1/nvidia/living-video", handleGenerateLivingVideo)
	http.HandleFunc("/api/v1/nvidia/architect", handleAutonomousArchitect)
	http.HandleFunc("/api/v1/nvidia/assistant", handlePersonalizedAssistant)
	http.HandleFunc("/api/v1/nvidia/nemotron", handleNemotronVoiceStory)
	http.HandleFunc("/api/v1/nvidia/deepseek", handleDeepSeekReasoning)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(&w)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"online","models":["flux_1-schnell","text-to-video-hd","llama-3.3-70b-architect","personalized-assistant","nemotron-3-super-120b","deepseek-v4-flash","whisper-large-v3","riva-asr"]}`)
	})

	log.Printf("NVIDIA Multi-Modal AI Proxy Server running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
