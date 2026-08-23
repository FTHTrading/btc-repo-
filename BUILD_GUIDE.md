# 🛠️ Universal Build & Deployment Guide

**FTHTrading / kevanbtc Portfolio Ecosystem**  
**Supported Runtimes:** Rust (Groth16 / BLS12-381), Go (Besu / CometBFT), Solidity (Foundry / Hardhat), Python (FastAPI), Node.js (TypeScript).  

---

## 1. Environment Setup

### System Requirements
- **OS:** Windows 10/11, macOS, Linux
- **Rust**: 1.75+ with `cargo` (`rustup update stable`)
- **Go**: 1.21+ (`go version`)
- **Foundry**: `forge`, `cast`, `anvil` (`foundryup`)
- **Node.js**: 18.x or 20.x with `pnpm` / `npm`
- **Docker**: Docker Desktop with Compose

---

## 2. Component Build Instructions

### A. UNYKORN Zero-Knowledge Enterprise Rust L1 (`uny-rust`)
```bash
# Clone & compile Rust L1 node
git clone https://github.com/kevanbtc/uny-rust.git
cd uny-rust
cargo build --release

# Run full test suite (ZK proofs + USS smart standards)
cargo test

# Launch single-node blockchain
cargo run -p node

# Launch 13-service Docker Stack (AI agents + IPFS + Postgres)
docker-compose up -d
```

### B. Global SWIFT Stablecoins Infrastructure (`Global-Swift-Stablecoins` Chain ID 7777)
```bash
git clone https://github.com/kevanbtc/Global-Swift-Stablecoins.git
cd Global-Swift-Stablecoins
npm install && npm run test
```

### C. Rust Control Planes (`ox` & `FTHFinancial-`)
```bash
cd crates/optima-core-types
cargo build --release
```
