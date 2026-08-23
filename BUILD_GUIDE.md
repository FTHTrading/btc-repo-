# 🛠️ Universal Build & Deployment Guide

**FTHTrading / kevanbtc Portfolio Ecosystem**  
**Supported Runtimes:** Rust, Solidity (Foundry / Hardhat), Go (CometBFT), Python (FastAPI), Node.js (TypeScript).  

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

### A. Rust Control Planes (`ox` & `FTHFinancial-`)
```bash
# Build OptimaGlobal DTCC Control Plane crates
cd crates/optima-core-types
cargo build --release

# Run unit tests
cargo test --workspace
```

### B. Solidity Smart Contracts (`AIF`, `bradleykizer`, `unykorn-pqc`)
```bash
# Compile smart contracts with Foundry
forge build

# Run comprehensive test suite
forge test -vv

# Run specific PQC test suite
forge test --match-path test/Jurisdiction_Thresholds.t.sol -vv
```

### C. Go ABCI & CometBFT DevNet (`BankChain`)
```powershell
# Windows PowerShell DevNet Launch
cd bankchain
./scripts/start-devnet.ps1

# Check transaction API health
curl http://localhost:8081/health

# Stop DevNet
./scripts/stop-devnet.ps1
```

### D. Sovereign Layer-1 Besu Nodes (`layer-1-unykorn` Chain ID 7777)
```powershell
# Initialize Besu Node Configuration
.\scripts\unykorn.ps1 besu-init

# Launch Node Cluster
.\scripts\unykorn.ps1 besu-up

# Test RPC Endpoint
.\scripts\unykorn.ps1 test-rpc
```

---

## 3. Production Deployment Commands

### Polygon Mainnet Deployment (`UNY-144a-bond-tokenization`)
```bash
npx hardhat run scripts/deploy-polygon.js --network polygon
```

### AWS Terraform Node Provisioning (`layer-1-unykorn`)
```bash
cd terraform
terraform init
terraform apply
```
