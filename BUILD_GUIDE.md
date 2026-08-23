# 🛠️ Universal Build & Deployment Guide

**FTHTrading / kevanbtc & unykornai Ecosystem**  
**Supported Runtimes:** Python (CBDC / AI), Rust (Groth16 / ZK), C# (.NET XRPL Attestation), Go (Besu / CometBFT), Solidity (Foundry), TypeScript (Node.js / Electron / Desktop).  

---

## 1. Environment Setup

### System Requirements
- **OS:** Windows 10/11, macOS, Linux
- **Python**: 3.10+ (`python --version`)
- **Rust**: 1.75+ (`rustup update stable`)
- **.NET SDK**: 8.0+ for C# (`dotnet --version`)
- **Go**: 1.21+ (`go version`)
- **Node.js**: 18.x or 20.x with `pnpm` / `npm`

---

## 2. Component Build Instructions

### A. Sovereign CBDC Central Bank Engine (`unykornai/cbdc-2`)
```bash
git clone https://github.com/unykornai/cbdc-2.git
cd cbdc-2
pip install -r requirements.txt
python -m cbdc.main
```

### B. Institutional C# XRPL Attestation Engine (`unykornai/UnyXRPL.Attestation`)
```bash
git clone https://github.com/unykornai/UnyXRPL.Attestation.git
cd UnyXRPL.Attestation
dotnet build -c Release
dotnet test
```

### C. Local Desktop AI Agent Surface (`unykornai/AionUi`)
```bash
git clone https://github.com/unykornai/AionUi.git
cd AionUi
pnpm install
pnpm dev
```

### D. UNYKORN Zero-Knowledge Enterprise Rust L1 (`kevanbtc/uny-rust`)
```bash
git clone https://github.com/kevanbtc/uny-rust.git
cd uny-rust
cargo build --release && cargo test
```
