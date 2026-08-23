/* ==========================================================================
   ALL COUCH NO CAGE — INSTITUTIONAL PROTOCOL ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initEip712Modal();
  initHonestCalculator();
  initTechnicalDrawer();
  initCultureDrawer();
  initWorkflowNav();
});

/* 1. EIP-712 SIGNING MODAL LOGIC */
function initEip712Modal() {
  const modal = document.getElementById('eipModal');
  const triggerBtn = document.getElementById('triggerEipSignBtn');
  const closeBtn = document.getElementById('closeEipModalBtn');
  const confirmBtn = document.getElementById('confirmSignBtn');

  function open() { if (modal) modal.classList.add('active'); }
  function close() { if (modal) modal.classList.remove('active'); }

  if (triggerBtn) triggerBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      confirmBtn.innerHTML = 'Requesting EIP-712 Wallet Signature...';
      setTimeout(() => {
        confirmBtn.innerHTML = 'EIP-712 Record Signed & Committed to Polygon!';
        confirmBtn.style.background = '#10b981';
        setTimeout(() => {
          close();
          confirmBtn.innerHTML = 'Sign EIP-712 Record with Wallet';
          confirmBtn.style.background = '';
        }, 2000);
      }, 1000);
    });
  }
}

/* 2. INTERRUPTION IMPACT RECORD CALCULATOR */
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
    if (!hoursInput || !rateInput) return;

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

    if (scoreEl) scoreEl.textContent = `${scorePoints} Points`;
    if (centsEl) centsEl.textContent = `$${scorePoints} USD`;
    if (confidenceEl) confidenceEl.textContent = tierTextMap[evidenceBps] || '25.0%';
  }

  if (hoursInput) hoursInput.addEventListener('input', calculate);
  if (rateInput) rateInput.addEventListener('input', calculate);
  if (severitySelect) severitySelect.addEventListener('change', calculate);
  if (contextSelect) contextSelect.addEventListener('change', calculate);
  if (tierSelect) tierSelect.addEventListener('change', calculate);

  calculate();
}

/* 3. COLLAPSIBLE TECHNICAL METHODOLOGY DRAWER */
function initTechnicalDrawer() {
  const btn = document.getElementById('techToggleBtn');
  const content = document.getElementById('techContent');

  if (btn && content) {
    btn.addEventListener('click', () => {
      const active = content.classList.toggle('active');
      btn.textContent = active ? '[-] Hide Technical Methodology' : '[+] View Technical Methodology & Execution Engines';
    });
  }
}

/* 4. OPTIONAL CULTURE / LAB MODE DRAWER */
function initCultureDrawer() {
  const btn = document.getElementById('toggleCultureBtn');
  const drawer = document.getElementById('cultureDrawer');

  if (btn && drawer) {
    btn.addEventListener('click', () => {
      const active = drawer.classList.toggle('active');
      btn.style.borderColor = active ? 'var(--signal-crimson)' : '';
      if (active) drawer.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* 5. 3-STAGE WORKFLOW STEP NAVIGATION */
function initWorkflowNav() {
  const steps = document.querySelectorAll('.workflow-step');
  steps.forEach(step => {
    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });
}
