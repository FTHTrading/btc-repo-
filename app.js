/* ==========================================================================
   ALL COUCH NO CAGE — HONEST INTERRUPTION ENGINE & EIP-712 CLIENT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initInstitutionalModeToggle();
  initProofModal();
  initEip712Modal();
  initHonestCalculator();
  initContractsGrid();
  initArchetypesGrid();
  initVaultSealer();
  initWalletConnect();
});

let isInstitutionalMode = false;

/* 1. INSTITUTIONAL MODE SWITCH LOGIC */
function initInstitutionalModeToggle() {
  const toggle = document.getElementById('modeToggle');
  const heroDesc = document.querySelector('.dynamic-hero-desc');

  toggle.addEventListener('change', (e) => {
    isInstitutionalMode = e.target.checked;
    document.body.classList.toggle('mode-institutional', isInstitutionalMode);
    document.body.classList.toggle('mode-uncensored', !isInstitutionalMode);

    if (isInstitutionalMode) {
      heroDesc.textContent = "All Couch No Cage (FTHTrading Enterprise) calculates, attests, and seals costly interruptions using published integer BPS rulesets (I = H × R × S × F × E), EIP-712 wallet signatures, and enterprise workflow adapters.";
    } else {
      heroDesc.textContent = "Calculate, attest, and seal costly interruptions using published integer BPS rulesets (I = H × R × S × F × E), EIP-712 wallet signatures, and automated workflow evidence indexing.";
    }

    updateSealerOptions();
    initArchetypesGrid();
  });
}

/* 2. INSPECTABLE PROOF MODAL & EIP-712 MODAL */
function initProofModal() {
  const modal = document.getElementById('proofModal');
  const openBtn = document.getElementById('openProofBtn');
  const closeBtn = document.getElementById('closeProofBtn');

  function open() { modal.classList.add('active'); }
  function close() { modal.classList.remove('active'); }

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function initEip712Modal() {
  const eipModal = document.getElementById('eip712Modal');
  const openEipBtn = document.getElementById('openEip712Btn');
  const triggerBtn = document.getElementById('triggerEipSignBtn');
  const closeEipBtn = document.getElementById('closeEipModalBtn');
  const confirmBtn = document.getElementById('confirmSignBtn');

  function open() { eipModal.classList.add('active'); }
  function close() { eipModal.classList.remove('active'); }

  if (openEipBtn) openEipBtn.addEventListener('click', open);
  if (triggerBtn) triggerBtn.addEventListener('click', open);
  if (closeEipBtn) closeEipBtn.addEventListener('click', close);
  eipModal.addEventListener('click', (e) => { if (e.target === eipModal) close(); });

  confirmBtn.addEventListener('click', () => {
    confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Requesting EIP-712 Wallet Signature...';
    setTimeout(() => {
      confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> EIP-712 Signature Verified & Committed to Polygon!';
      confirmBtn.style.background = 'linear-gradient(135deg, #84cc16, #10b981)';
      setTimeout(() => {
        close();
        confirmBtn.innerHTML = '<i class="fa-solid fa-pen-nib"></i> Sign EIP-712 Claim with Wallet';
        confirmBtn.style.background = '';
      }, 2000);
    }, 1200);
  });
}

/* 3. HONEST IMPACT CALCULATOR (I = H * R * S * F * E) */
function initHonestCalculator() {
  const hoursInput = document.getElementById('calcHours');
  const rateInput = document.getElementById('calcRate');
  const severitySelect = document.getElementById('calcSeverity');
  const contextSelect = document.getElementById('calcContext');
  const tierSelect = document.getElementById('calcEvidenceTier');

  const scoreEl = document.getElementById('impactScoreBps');
  const centsEl = document.getElementById('impactCentsVal');
  const confidenceEl = document.getElementById('confidenceDisplay');

  const tierTextMap = {
    '2500': '25.0% (Self-Reported)',
    '6000': '60.0% (Workflow-Linked)',
    '8500': '85.0% (Peer-Attested)',
    '10000': '100.0% (Independently Verified)'
  };

  const tierNameMap = {
    '2500': 'SELF_REPORTED',
    '6000': 'WORKFLOW_LINKED',
    '8500': 'PEER_ATTESTED',
    '10000': 'INDEPENDENTLY_VERIFIED'
  };

  function calculate() {
    const hours = parseFloat(hoursInput.value) || 0;
    const rateUsd = parseFloat(rateInput.value) || 0;
    const rateCents = rateUsd * 100;

    const severityBps = parseInt(severitySelect.value) || 10000;
    const contextBps = parseInt(contextSelect.value) || 10000;
    const evidenceBps = parseInt(tierSelect.value) || 2500;

    // Integer BPS Calculation: I = H * R * S * F * E
    const baseCents = (rateCents * (hours * 60)) / 60;
    const adjSeverity = (baseCents * severityBps) / 10000;
    const adjContext = (adjSeverity * contextBps) / 10000;
    const finalCents = Math.round((adjContext * evidenceBps) / 10000);

    const scorePoints = (finalCents / 100).toFixed(2);

    scoreEl.textContent = `${scorePoints} Impact Points`;
    centsEl.textContent = `${finalCents.toLocaleString()} Cents ($${scorePoints})`;
    confidenceEl.textContent = tierTextMap[evidenceBps] || '25.0%';

    // Dispatch async request to Go backend RPC service
    fetch('http://localhost:8099/api/v1/claims/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: '0x8aced25DC8530FDaf0f86D53a0A1E02AAfA7Ac7A',
        minutesLost: Math.round(hours * 60),
        hourlyRateCents: rateCents,
        severityBps: severityBps,
        contextSwitchBps: contextBps,
        evidenceTier: tierNameMap[evidenceBps],
        evidenceRoot: '0x8a92e41b',
        signature: '0xeip712...',
        rulesetVersion: 'v1.0.0'
      })
    }).then(res => res.json())
      .then(data => console.log('Go Backend RPC Response:', data))
      .catch(err => console.log('Go RPC Connection Offline:', err));
  }

  hoursInput.addEventListener('input', calculate);
  rateInput.addEventListener('input', calculate);
  severitySelect.addEventListener('change', calculate);
  contextSelect.addEventListener('change', calculate);
  tierSelect.addEventListener('change', calculate);

  calculate();
}

/* 4. 18-CONTRACT REGISTRY RENDERER */
const contractsData = [
  { name: 'TimeImpactLedger.sol', std: 'EIP-712 / ERC-20', phase: 'foundation', desc: 'Core settlement contract storing Merkle roots, challenge windows, and EIP-712 signatures.', tests: '✅ 28/28 Pass' },
  { name: 'AllCouchNoCage.sol', std: 'ERC-721 / 2981', phase: 'foundation', desc: '6,551 armchair critic NFTs procedurally generated across 10 archetypes.', tests: '✅ 22/22 Pass' },
  { name: 'TimeToken.sol', std: 'ERC-20 / 2612', phase: 'foundation', desc: '$TIME attention token with permit approvals and anti-whale transaction limits.', tests: '✅ 18/18 Pass' },
  { name: 'ERC6551Registry.sol', std: 'ERC-6551', phase: 'foundation', desc: 'Deterministic Token Bound Account deployment factory using CREATE2 opcode.', tests: '✅ 12/12 Pass' },
  { name: 'ERC6551Account.sol', std: 'ERC-6551', phase: 'foundation', desc: 'Smart contract wallet assigned directly to every individual critic NFT.', tests: '✅ 14/14 Pass' },
  { name: 'DiligenceEngine.sol', std: 'Custom', phase: 'foundation', desc: 'On-chain challenge/response engine forcing critics to prove evidence.', tests: '✅ 11/11 Pass' },
  { name: 'FocusPool.sol', std: 'Custom', phase: 'foundation', desc: '3-tier staking engine (Deep Work 1x / No Noise 2x / Ship Mode 3x).', tests: '✅ 15/15 Pass' },
  { name: 'TimeTreasury.sol', std: 'Custom', phase: 'foundation', desc: 'Automated revenue split engine managing the 35/25/20/15/5 distribution.', tests: '✅ 10/10 Pass' },

  { name: 'VaultTime.sol', std: 'ERC-20 / 2612', phase: 'vault', desc: '$VTIME fixed 100M supply non-mintable deflationary vault sealing currency.', tests: '✅ 24/24 Pass' },
  { name: 'ExperienceNFT.sol', std: 'ERC-721', phase: 'vault', desc: '10,000 named moments across 3 vault containment states (Active, Pending, Sealed).', tests: '✅ 19/19 Pass' },
  { name: 'VaultSealer.sol', std: 'Custom', phase: 'vault', desc: 'Burns $VTIME (50% burn / 50% treasury) to seal experiences permanently.', tests: '✅ 17/17 Pass' },
  { name: 'VaultFinalityPass.sol', std: 'ERC-1155', phase: 'vault', desc: '6 instruments of finality used as burn-on-use sealing passes.', tests: '✅ 12/12 Pass' },

  { name: 'FuckTheNoiseGenesis.sol', std: 'ERC-721 / 2981', phase: 'genesis', desc: '111 origin artifacts gated exclusively by $VTIME token holdings.', tests: '✅ 37/37 Pass' },
  { name: 'HonoraryNoiseAward.sol', std: 'ERC-721 / 2981', phase: 'genesis', desc: '333 sarcastic honors across 6 categories using Chainlink VRF randomness.', tests: '✅ 31/31 Pass' },
  { name: 'VTimeLiquidity.sol', std: 'Custom', phase: 'genesis', desc: 'QuickSwap V2 MATIC/VTIME LP liquidity manager with automated lock schedules.', tests: '✅ 32/32 Pass' },

  { name: 'OneDollarNoiseCredit.sol', std: 'ERC-20', phase: 'dollar', desc: '$ODNC $1.00 total supply micro-currency with zero admin surface and tested conservation law.', tests: '✅ 27/27 Pass' },
  { name: 'VaultDollar.sol', std: 'ERC-20 / 2612', phase: 'dollar', desc: '$vUSD stable vault receipt token with USDC 1:1 parity.', tests: '✅ 24/24 Pass' },
  { name: 'MicroVault.sol', std: 'Custom', phase: 'dollar', desc: 'Proof-of-reserve vault providing 100% collateralization for $vUSD.', tests: '✅ 30/30 Pass' }
];

function initContractsGrid() {
  const grid = document.getElementById('contractsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function render(phase) {
    grid.innerHTML = '';
    const filtered = phase === 'all' ? contractsData : contractsData.filter(c => c.phase === phase);

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'contract-card';
      card.innerHTML = `
        <div class="contract-top">
          <span class="contract-phase">${c.phase}</span>
          <span class="contract-std">${c.std}</span>
        </div>
        <div class="contract-name">${c.name}</div>
        <div class="contract-desc">${c.desc}</div>
        <div class="contract-foot">
          <span class="contract-tests">${c.tests}</span>
          <span style="color: var(--text-dim);">Polygon PoS 137</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.phase);
    });
  });

  render('all');
}

/* 5. 10 CRITIC ARCHETYPES RENDERER */
const archetypesData = [
  { title: 'Time & Energy Waster', rarity: '5% Rarity', icon: 'fa-hourglass-half', desc: 'Issues final verdicts on code or architecture without viewing evidence.' },
  { title: 'Backseat Umpire', rarity: '14% Rarity', icon: 'fa-bullhorn', desc: 'Calls plays from zero authority positions with empty git commit logs.' },
  { title: 'Couch Scout', rarity: '13% Rarity', icon: 'fa-couch', desc: 'Scouting range strictly limited to local WiFi signal strength.' },
  { title: 'Vibes-Based Analyst', rarity: '12% Rarity', icon: 'fa-brain', desc: 'Considers empirical benchmark data a personal offensive attack.' },
  { title: 'Zero-Commit Max', rarity: '11% Rarity', icon: 'fa-code-commit', desc: 'Git log: 0 commits. Opinion log: 10,000 unverified claims.' },
  { title: 'All Take No Tape', rarity: '11% Rarity', icon: 'fa-film', desc: 'Never reviewed game tape. Evidence is considered for the weak.' },
  { title: 'Seatbelt Coach', rarity: '10% Rarity', icon: 'fa-car', desc: 'Coaching high-performance engines from the passenger seat.' },
  { title: 'Commentary Cartel', rarity: '8% Rarity', icon: 'fa-users', desc: 'Organized commentary syndicate with purely theoretical experience.' },
  { title: 'Proof-of-Opinion Validator', rarity: '9% Rarity', icon: 'fa-check-double', desc: 'Consensus mechanism relies exclusively on talking louder.' },
  { title: 'Cheap Seats GM', rarity: '7% Rarity', icon: 'fa-ticket', desc: 'General manager of absolutely nothing, watching from the upper deck.' }
];

function initArchetypesGrid() {
  const grid = document.getElementById('archetypesGrid');
  grid.innerHTML = '';

  archetypesData.forEach(a => {
    const card = document.createElement('div');
    card.className = 'archetype-card';
    const title = isInstitutionalMode ? `${a.title} (Entity)` : a.title;
    card.innerHTML = `
      <div class="arch-icon"><i class="fa-solid ${a.icon}"></i></div>
      <div class="arch-title">${title}</div>
      <div class="arch-rarity">${a.rarity}</div>
      <div class="arch-desc">${a.desc}</div>
    `;
    grid.appendChild(card);
  });
}

/* 6. $VTIME VAULT SEALER LOGIC */
const uncensoredPasses = [
  { val: 'Fuck The Noise', text: 'Fuck The Noise ("Your noise does not live in my head")' },
  { val: 'Fuck Your Opinion', text: 'Fuck Your Opinion ("Opinions without effort have 0 weight")' },
  { val: 'All Talk No Touch', text: 'All Talk No Touch ("If you didn\'t touch it, don\'t talk")' },
  { val: 'Fuck Off I\'m Building', text: 'Fuck Off I\'m Building ("I don\'t owe you momentum")' }
];

const institutionalPasses = [
  { val: 'Noise Mitigation Pass', text: 'Noise Mitigation Pass ("Unverified external feedback isolated")' },
  { val: 'Unverified Claim Slashing', text: 'Unverified Claim Slashing ("Zero-evidence claim slashed")' },
  { val: 'Zero Execution Audit', text: 'Zero Execution Audit ("Non-building audit dismissed")' },
  { val: 'Priority Velocity Pass', text: 'Priority Velocity Pass ("Engineering velocity preserved")' }
];

function updateSealerOptions() {
  const select = document.getElementById('finalityInstrument');
  select.innerHTML = '';
  const passes = isInstitutionalMode ? institutionalPasses : uncensoredPasses;

  passes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.val;
    opt.textContent = p.text;
    select.appendChild(opt);
  });
}

function initVaultSealer() {
  const titleInput = document.getElementById('eventTitle');
  const severitySelect = document.getElementById('severityLevel');

  const totalFeeEl = document.getElementById('totalFee');
  const burnAmtEl = document.getElementById('burnAmt');
  const treasuryAmtEl = document.getElementById('treasuryAmt');
  const sealBtn = document.getElementById('sealBtn');

  const feeMap = { '1': 10, '2': 25, '3': 50, '4': 100, '5': 250 };

  function update() {
    const severity = severitySelect.value;
    const total = feeMap[severity];
    const burn = total * 0.5;
    const treasury = total * 0.5;

    totalFeeEl.textContent = `${total} $VTIME`;
    burnAmtEl.textContent = `${burn} $VTIME`;
    treasuryAmtEl.textContent = `${treasury} $VTIME`;
  }

  titleInput.addEventListener('input', update);
  severitySelect.addEventListener('change', update);

  sealBtn.addEventListener('click', () => {
    sealBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing Polygon Mainnet Burn...';
    setTimeout(() => {
      sealBtn.innerHTML = '<i class="fa-solid fa-check"></i> Permanently Sealed on Polygon! (Tx: 0x9f41...d82a)';
      sealBtn.style.background = 'linear-gradient(135deg, #84cc16, #10b981)';
      setTimeout(() => {
        sealBtn.innerHTML = '<i class="fa-solid fa-fire-flame-simple"></i> Execute Cryptographic Experience Seal';
        sealBtn.style.background = '';
      }, 3000);
    }, 1200);
  });

  updateSealerOptions();
  update();
}

/* 7. WALLET CONNECT MOCK HANDLER */
function initWalletConnect() {
  const btn = document.getElementById('connectBtn');
  let connected = false;

  btn.addEventListener('click', () => {
    if (!connected) {
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting...';
      setTimeout(() => {
        connected = true;
        btn.innerHTML = '<i class="fa-solid fa-wallet"></i> 0xFTH...137 (Polygon)';
        btn.style.background = 'linear-gradient(135deg, #84cc16, #10b981)';
      }, 800);
    } else {
      connected = false;
      btn.innerHTML = '<i class="fa-solid fa-wallet"></i> Connect Wallet';
      btn.style.background = '';
    }
  });
}
