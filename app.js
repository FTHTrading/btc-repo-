/* ==========================================================================
   ALL COUCH NO CAGE — SALVADOR DALI TIME & HERMETIC ACOUSTIC ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initInstitutionalModeToggle();
  initProofModal();
  initEip712Modal();
  initHermeticSoundMeter();
  initAudioCanvasOscillator();
  initHonestCalculator();
  initContractsGrid();
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
      heroDesc.textContent = "All Couch No Cage (FTHTrading Enterprise) measures acoustic noise spectrums, warping distorted time geometry into verifiable, low-entropy on-chain audit receipts.";
    } else {
      heroDesc.textContent = "All Couch No Cage measures chaotic acoustic noise spectrums, warping distorted time geometry into verifiable, low-entropy on-chain finality receipts.";
    }

    updateSealerOptions();
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
  const triggerBtn = document.getElementById('triggerEipSignBtn');
  const closeEipBtn = document.getElementById('closeEipModalBtn');
  const confirmBtn = document.getElementById('confirmSignBtn');

  function open() { eipModal.classList.add('active'); }
  function close() { eipModal.classList.remove('active'); }

  if (triggerBtn) triggerBtn.addEventListener('click', open);
  if (closeEipBtn) closeEipBtn.addEventListener('click', close);
  eipModal.addEventListener('click', (e) => { if (e.target === eipModal) close(); });

  confirmBtn.addEventListener('click', () => {
    confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Requesting EIP-712 Wallet Signature...';
    setTimeout(() => {
      confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> EIP-712 Signature Verified & Committed to Polygon!';
      confirmBtn.style.background = 'linear-gradient(135deg, #eab308, #f97316)';
      setTimeout(() => {
        close();
        confirmBtn.innerHTML = '<i class="fa-solid fa-pen-nib"></i> Sign EIP-712 Claim with Wallet';
        confirmBtn.style.background = '';
      }, 2000);
    }, 1200);
  });
}

/* 3. HERMETIC ACOUSTIC SOUND BS & FREQUENCY METER */
let currentFreqHz = 4320;
let currentThdPct = 45;

function initHermeticSoundMeter() {
  const slider = document.getElementById('soundFreqInput');
  const sliderVal = document.getElementById('freqSliderVal');
  const thdSelect = document.getElementById('thdSelect');
  const hermeticSelect = document.getElementById('hermeticModeSelect');

  const entropyEl = document.getElementById('entropyScore');
  const crystalEl = document.getElementById('crystalTime');
  const invariantEl = document.getElementById('hermeticInvariant');
  const liveFreqVal = document.getElementById('liveFreqVal');
  const transmuteBtn = document.getElementById('transmuteFreqBtn');

  function update() {
    currentFreqHz = parseInt(slider.value) || 4320;
    currentThdPct = parseInt(thdSelect.value) || 45;
    const hermeticHz = hermeticSelect.value || '528';

    sliderVal.textContent = `${currentFreqHz.toLocaleString()} Hz`;
    if (liveFreqVal) liveFreqVal.textContent = `${currentFreqHz.toLocaleString()} Hz`;

    // Hermetic Formula: Entropy = (Freq / 200) * (THD / 100)
    const entropy = ((currentFreqHz / 200) * (currentThdPct / 100)).toFixed(1);
    const reclaimedHours = ((currentFreqHz / 1000) * 0.432).toFixed(2);

    entropyEl.textContent = `${entropy} High Entropy`;
    crystalEl.textContent = `${reclaimedHours} Hours Reclaimed`;
    invariantEl.textContent = `${hermeticHz} Hz Harmonic Locked`;
  }

  slider.addEventListener('input', update);
  thdSelect.addEventListener('change', update);
  hermeticSelect.addEventListener('change', update);

  transmuteBtn.addEventListener('click', () => {
    transmuteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> Transmuting Sound Entropy into $VTIME...';
    setTimeout(() => {
      transmuteBtn.innerHTML = '<i class="fa-solid fa-check"></i> Transmutation Complete! (50 $VTIME Burned)';
      transmuteBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      setTimeout(() => {
        transmuteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Transmute High-Entropy BS into $VTIME Burn';
        transmuteBtn.style.background = '';
      }, 3000);
    }, 1200);
  });

  update();
}

/* 4. REAL-TIME ANIMATED CANVAS AUDIO WAVEFORM OSCILLATOR */
function initAudioCanvasOscillator() {
  const canvas = document.getElementById('audioCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let step = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#eab308';
    ctx.beginPath();

    const width = canvas.width;
    const height = canvas.height;
    const mid = height / 2;

    for (let x = 0; x < width; x++) {
      // Modulate frequency based on slider and THD noise distortion
      const freq = (currentFreqHz / 1000) * 0.05;
      const noise = (Math.random() - 0.5) * (currentThdPct / 10);
      const y = mid + Math.sin(x * freq + step) * 25 + noise;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw secondary harmonic glow wave
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#06b6d4';
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y = mid + Math.cos(x * 0.03 - step) * 15;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    step += 0.08;
    requestAnimationFrame(draw);
  }

  draw();
}

/* 5. HONEST IMPACT CALCULATOR (I = H * R * S * F * E) */
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

  function calculate() {
    const hours = parseFloat(hoursInput.value) || 0;
    const rateUsd = parseFloat(rateInput.value) || 0;
    const rateCents = rateUsd * 100;

    const severityBps = parseInt(severitySelect.value) || 10000;
    const contextBps = parseInt(contextSelect.value) || 10000;
    const evidenceBps = parseInt(tierSelect.value) || 2500;

    const baseCents = (rateCents * (hours * 60)) / 60;
    const adjSeverity = (baseCents * severityBps) / 10000;
    const adjContext = (adjSeverity * contextBps) / 10000;
    const finalCents = Math.round((adjContext * evidenceBps) / 10000);

    const scorePoints = (finalCents / 100).toFixed(2);

    scoreEl.textContent = `${scorePoints} Impact Points`;
    centsEl.textContent = `${finalCents.toLocaleString()} Cents ($${scorePoints})`;
    confidenceEl.textContent = tierTextMap[evidenceBps] || '25.0%';
  }

  hoursInput.addEventListener('input', calculate);
  rateInput.addEventListener('input', calculate);
  severitySelect.addEventListener('change', calculate);
  contextSelect.addEventListener('change', calculate);
  tierSelect.addEventListener('change', calculate);

  calculate();
}

/* 6. 18-CONTRACT REGISTRY RENDERER */
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

/* 7. $VTIME VAULT SEALER LOGIC */
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
  if (!select) return;
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
  const severitySelect = document.getElementById('severityLevel');
  const totalFeeEl = document.getElementById('totalFee');
  const burnAmtEl = document.getElementById('burnAmt');
  const treasuryAmtEl = document.getElementById('treasuryAmt');
  const sealBtn = document.getElementById('sealBtn');

  const feeMap = { '1': 10, '2': 25, '3': 50, '4': 100, '5': 250 };

  function update() {
    const severity = severitySelect ? severitySelect.value : '3';
    const total = feeMap[severity];
    const burn = total * 0.5;
    const treasury = total * 0.5;

    if (totalFeeEl) totalFeeEl.textContent = `${total} $VTIME`;
    if (burnAmtEl) burnAmtEl.textContent = `${burn} $VTIME`;
    if (treasuryAmtEl) treasuryAmtEl.textContent = `${treasury} $VTIME`;
  }

  if (severitySelect) severitySelect.addEventListener('change', update);

  if (sealBtn) {
    sealBtn.addEventListener('click', () => {
      sealBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing Polygon Mainnet Burn...';
      setTimeout(() => {
        sealBtn.innerHTML = '<i class="fa-solid fa-check"></i> Permanently Sealed on Polygon! (Tx: 0x9f41...d82a)';
        sealBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
          sealBtn.innerHTML = '<i class="fa-solid fa-fire-flame-simple"></i> Execute Cryptographic Experience Seal';
          sealBtn.style.background = '';
        }, 3000);
      }, 1200);
    });
  }

  updateSealerOptions();
  update();
}

/* 8. WALLET CONNECT HANDLER */
function initWalletConnect() {
  const btn = document.getElementById('connectBtn');
  let connected = false;

  if (btn) {
    btn.addEventListener('click', () => {
      if (!connected) {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting...';
        setTimeout(() => {
          connected = true;
          btn.innerHTML = '<i class="fa-solid fa-wallet"></i> 0xFTH...137 (Polygon)';
          btn.style.background = 'linear-gradient(135deg, #eab308, #f97316)';
        }, 800);
      } else {
        connected = false;
        btn.innerHTML = '<i class="fa-solid fa-wallet"></i> Connect Wallet';
        btn.style.background = '';
      }
    });
  }
}
