# 🛠️ Universal Build & Deployment Guide

**FTHTrading / kevanbtc Portfolio Ecosystem**  
**Supported Runtimes:** Go (Besu / CometBFT), Rust, Solidity (Foundry / Hardhat), Python (FastAPI), Node.js (TypeScript).  

---

## 1. Environment Setup

### System Requirements
- **OS:** Windows 10/11, macOS, Linux
- **Go**: 1.21+ (`go version`)
- **Rust**: 1.75+ with `cargo` (`rustup update stable`)
- **Foundry**: `forge`, `cast`, `anvil` (`foundryup`)
- **Node.js**: 18.x or 20.x with `pnpm` / `npm`
- **Docker**: Docker Desktop with Compose

---

## 2. Component Build Instructions

### A. Global SWIFT Stablecoins Infrastructure (`Global-Swift-Stablecoins` Chain ID 7777)
```bash
# Clone & install dependencies
git clone https://github.com/kevanbtc/Global-Swift-Stablecoins.git
cd Global-Swift-Stablecoins
npm install

# Run unit tests
npm run test

# Deploy local testnet contracts
npm run deploy:local
```

### B. Rust Control Planes (`ox` & `FTHFinancial-`)
```bash
# Build OptimaGlobal DTCC Control Plane crates
cd crates/optima-core-types
cargo build --release
```

### C. Go ABCI & CometBFT DevNet (`BankChain`)
```powershell
# Windows PowerShell DevNet Launch
cd bankchain
./scripts/start-devnet.ps1
```

### D. Sovereign Layer-1 Besu Nodes (`layer-1-unykorn` Chain ID 7777)
```powershell
# Initialize Besu Node Configuration
.\scripts\unykorn.ps1 besu-init
.\scripts\unykorn.ps1 besu-up
```
