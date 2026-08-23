/* ==========================================================================
   TIME.UNYKORN.AI — SOVEREIGN PORTAL INTERACTIVE ENGINE
   Modules: Live Ticker, FocusPool APY Calculator, VTIME Sealing Chamber,
            ODNC Settlement Simulator, W3C DID Resolver
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLiveTicker();
  initFocusPoolCalculator();
  initVtimeSealer();
  initOdncSimulator();
  initDidResolver();
  initWalletConnect();
});

/* 1. Live Ticker Animation Engine */
function initLiveTicker() {
  const stakedEl = document.getElementById('stakedTimeVal');
  const vtimeEl = document.getElementById('vtimeBurnVal');

  let staked = 428500000;
  let burned = 14892100;

  setInterval(() => {
    staked += Math.floor(Math.random() * 50) + 10;
    burned += Math.floor(Math.random() * 10) + 2;

    stakedEl.textContent = `${(staked / 1000000).toFixed(2)}M`;
    vtimeEl.textContent = burned.toLocaleString();
  }, 3000);
}

/* 2. FocusPool APY & Yield Calculator */
function initFocusPoolCalculator() {
  const amountInput = document.getElementById('stakeAmount');
  const tierSelect = document.getElementById('stakeTierSelect');
  const annualYieldEl = document.getElementById('annualYield');
  const dailyYieldEl = document.getElementById('dailyYield');
  const lockPeriodEl = document.getElementById('lockPeriod');
  const stakeBtn = document.getElementById('stakeBtn');

  const apyMap = { '1': 0.085, '2': 0.17, '3': 0.255 };
  const lockMap = {
    '1': 'Flex Lock (0% Early Exit Fee)',
    '2': '14 Days Lock (10% Early Exit Fee)',
    '3': '30 Days Lock (20% Early Exit Fee)'
  };

  function update() {
    const amt = parseFloat(amountInput.value) || 0;
    const tier = tierSelect.value;
    const rate = apyMap[tier];

    const annual = Math.round(amt * rate);
    const daily = (annual / 365).toFixed(2);

    annualYieldEl.textContent = `${annual.toLocaleString()} $TIME`;
    dailyYieldEl.textContent = `${daily} $TIME / day`;
    lockPeriodEl.textContent = lockMap[tier];
  }

  amountInput.addEventListener('input', update);
  tierSelect.addEventListener('change', update);

  stakeBtn.addEventListener('click', () => {
    stakeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming FocusPool Deposit...';
    setTimeout(() => {
      stakeBtn.innerHTML = '<i class="fa-solid fa-check"></i> $TIME Successfully Staked!';
      stakeBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      setTimeout(() => {
        stakeBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Lock $TIME in FocusPool';
        stakeBtn.style.background = '';
      }, 3000);
    }, 1200);
  });

  update();
}

/* 3. VTIME Vault Sealer Chamber */
function initVtimeSealer() {
  const titleInput = document.getElementById('vtimeTitle');
  const instrumentSelect = document.getElementById('vtimeInstrument');
  const totalFeeEl = document.getElementById('vtimeTotalFee');
  const burnEl = document.getElementById('vtimeBurn');
  const treasuryEl = document.getElementById('vtimeTreasury');
  const prevTitle = document.getElementById('prevTitle');
  const prevQuote = document.getElementById('prevQuote');
  const sealBtn = document.getElementById('vtimeSealBtn');

  const quoteMap = {
    'Fuck The Noise': '"Your noise does not get to live in my head."',
    'Fuck Your Opinion': '"Opinions without effort have zero weight here."',
    'Fuck Off I\'m Building': '"I don\'t owe you my momentum."'
  };

  function update() {
    const title = titleInput.value || 'Unsolicited Noise Event';
    const instrument = instrumentSelect.value;

    totalFeeEl.textContent = '50 $VTIME';
    burnEl.textContent = '25 $VTIME';
    treasuryEl.textContent = '25 $VTIME';

    prevTitle.textContent = title;
    prevQuote.textContent = quoteMap[instrument] || quoteMap['Fuck The Noise'];
  }

  titleInput.addEventListener('input', update);
  instrumentSelect.addEventListener('change', update);

  sealBtn.addEventListener('click', () => {
    sealBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Burning $VTIME on Polygon...';
    setTimeout(() => {
      sealBtn.innerHTML = '<i class="fa-solid fa-check"></i> Permanently Sealed! (Tx: 0x9b12...f420)';
      sealBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      setTimeout(() => {
        sealBtn.innerHTML = '<i class="fa-solid fa-fire-flame-simple"></i> Execute Cryptographic Experience Seal';
        sealBtn.style.background = '';
      }, 3000);
    }, 1200);
  });

  update();
}

/* 4. ODNC Settlement Simulator */
function initOdncSimulator() {
  const input = document.getElementById('odncAmt');
  const netEl = document.getElementById('odncNet');
  const burnEl = document.getElementById('odncBurn');
  const treasuryEl = document.getElementById('odncTreasury');

  function update() {
    const val = parseInt(input.value) || 0;
    const burn = Math.round(val * 0.005);
    const treasury = Math.round(val * 0.005);
    const net = val - burn - treasury;

    netEl.textContent = `${net.toLocaleString()} units ($${(net / 1000000).toFixed(6)})`;
    burnEl.textContent = `${burn.toLocaleString()} units`;
    treasuryEl.textContent = `${treasury.toLocaleString()} units`;
  }

  input.addEventListener('input', update);
  update();
}

/* 5. W3C DID Resolver */
function initDidResolver() {
  const input = document.getElementById('didInput');
  const btn = document.getElementById('resolveBtn');
  const resultEl = document.getElementById('didResult');

  btn.addEventListener('click', () => {
    const addr = input.value.trim() || '0x4E574939D460d284B5D990646D4aeaEF2D49Fa13';
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resolving...';

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Resolve DID';
      const doc = {
        "@context": "https://www.w3.org/ns/did/v1",
        "id": `did:unykorn:8810:${addr}`,
        "verificationMethod": [{
          "id": `did:unykorn:8810:${addr}#key-1`,
          "type": "EcdsaSecp256k1RecoveryMethod2020",
          "controller": `did:unykorn:8810:${addr}`
        }],
        "service": [{
          "id": `did:unykorn:8810:${addr}#time-service`,
          "type": "SovereignTimeAttestation",
          "serviceEndpoint": "https://time.unykorn.ai/api/v1/attest"
        }],
        "proof": {
          "type": "EcdsaSecp256k1Signature2019",
          "created": new Date().toISOString(),
          "proofPurpose": "assertionMethod",
          "verificationMethod": `did:unykorn:8810:${addr}#key-1`
        }
      };
      resultEl.innerHTML = `<pre>${JSON.stringify(doc, null, 2)}</pre>`;
    }, 600);
  });
}

/* 6. Wallet Connect Handler */
function initWalletConnect() {
  const btn = document.getElementById('connectBtn');
  let connected = false;

  btn.addEventListener('click', () => {
    if (!connected) {
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting...';
      setTimeout(() => {
        connected = true;
        btn.innerHTML = '<i class="fa-solid fa-wallet"></i> 0xFTH...137 (Polygon)';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      }, 800);
    } else {
      connected = false;
      btn.innerHTML = '<i class="fa-solid fa-wallet"></i> Connect Wallet';
      btn.style.background = '';
    }
  });
}
