# 🛠️ Universal Build & Deployment Guide

**FTHTrading / kevanbtc & unykornai Ecosystem**  
**Supported Runtimes:** Rust (FTH-OS Kernel / Groth16 ZK), Python (GMIIE / CBDC), TypeScript (HydraGrid / Next.js), Solidity (Foundry / Hardhat), C# (.NET XRPL Attestation).  

---

## 1. Environment Setup

### System Requirements
- **OS:** Windows 10/11, macOS, Linux
- **Rust**: 1.75+ (`rustup update stable`)
- **Python**: 3.10+ (`python --version`)
- **Node.js**: 18.x or 20.x with `pnpm` / `npm` / `yarn`
- **Docker**: Docker Desktop with Compose

---

## 2. Component Build Instructions

### A. FTH Financial OS Solvency Kernel (`kevanbtc/FTHFinancial-`)
```bash
git clone https://github.com/kevanbtc/FTHFinancial-.git
cd FTHFinancial-
cargo build --release
cargo run -p fth-node
```

### B. Global Monetary Infrastructure Intelligence Engine (`unykornai/cbdc-2-76988`)
```bash
git clone https://github.com/unykornai/cbdc-2-76988.git
cd cbdc-2-76988
cp .env.example .env
docker compose up -d
# Dashboard: http://localhost:3000 | API: http://localhost:8000
```

### C. UnykornX HydraGrid Multi-Asset AI Platform (`kevanbtc/hydra`)
```bash
git clone https://github.com/kevanbtc/hydra.git
cd hydra
python -m venv .venv
source .venv/bin/activate # .venv\Scripts\activate on Windows
pip install -e .[all]
pytest tests -v
```
