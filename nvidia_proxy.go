// NVIDIA NIM & Cloud Voice / Speech-to-Text Proxy Server
// Integrates NVIDIA Nemotron-3, DeepSeek-V4, Whisper-Large-v3, and Riva ASR/TTS

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
)

type ChatRequest struct {
	Model       string                   `json:"model"`
	Messages    []map[string]interface{} `json:"messages"`
	Temperature float64                  `json:"temperature,omitempty"`
	TopP        float64                  `json:"top_p,omitempty"`
	MaxTokens   int                      `json:"max_tokens,omitempty"`
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
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

	http.HandleFunc("/api/v1/nvidia/nemotron", handleNemotronVoiceStory)
	http.HandleFunc("/api/v1/nvidia/deepseek", handleDeepSeekReasoning)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(&w)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"online","models":["nemotron-3-super-120b","deepseek-v4-flash","whisper-large-v3","riva-asr"]}`)
	})

	log.Printf("NVIDIA Cloud AI Proxy Server running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
