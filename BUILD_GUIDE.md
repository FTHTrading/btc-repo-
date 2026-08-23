# 🛠️ Universal Build & Deployment Guide

**FTHTrading / kevanbtc & unykornai Ecosystem**  
**Supported Runtimes:** Python (GMIIE / CBDC), TypeScript (HydraGrid / Next.js), Solidity (Foundry / Hardhat), Rust (Groth16 / ZK), C# (.NET XRPL Attestation).  

---

## 1. Environment Setup

### System Requirements
- **OS:** Windows 10/11, macOS, Linux
- **Python**: 3.10+ (`python --version`)
- **Node.js**: 18.x or 20.x with `pnpm` / `npm` / `yarn`
- **Foundry**: `forge` / `cast` / `anvil` (`foundryup`)
- **Hardhat**: `npx hardhat`
- **Docker**: Docker Desktop with Compose

---

## 2. Component Build Instructions

### A. Global Monetary Infrastructure Intelligence Engine (`unykornai/cbdc-2-76988`)
```bash
git clone https://github.com/unykornai/cbdc-2-76988.git
cd cbdc-2-76988
cp .env.example .env
docker compose up -d
# Dashboard: http://localhost:3000 | API: http://localhost:8000
```

### B. UnykornX HydraGrid Multi-Asset AI Platform (`kevanbtc/hydra`)
```bash
git clone https://github.com/kevanbtc/hydra.git
cd hydra
python -m venv .venv
source .venv/bin/activate # .venv\Scripts\activate on Windows
pip install -e .[all]
pytest tests -v
```

### C. All Couch No Cage Polygon Mainnet Protocol (`unykornai/Small-Dick`)
```bash
git clone https://github.com/unykornai/Small-Dick.git
cd Small-Dick
npm install
npx hardhat compile
npx hardhat test
```

### D. Athlete Sovereign Global Fund Infrastructure (`unykornai/AIF`)
```bash
git clone https://github.com/unykornai/AIF.git
cd AIF
forge build
forge test
```
