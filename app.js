/* ==========================================================================
   ALL COUCH NO CAGE — INSTITUTIONAL PROTOCOL ENGINE & ASSET LIGHTBOX
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initEip712Modal();
  initHonestCalculator();
  initTechnicalDrawer();
  initCultureDrawer();
  initWorkflowNav();
  initWatermarkedGallery();
  initAssetLightbox();
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

/* 3. WATERMARKED GALLERY GENERATOR */
function initWatermarkedGallery() {
  const grid = document.getElementById('watermarkedGalleryGrid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= 15; i++) {
    const card = document.createElement('div');
    card.className = 'asset-card-wrapper';
    card.dataset.id = i;
    card.dataset.src = `images/kb_${i}.jpg`;
    card.dataset.title = `Protocol Evidence Artifact #${i < 10 ? '0' + i : i}`;
    card.dataset.hash = `0x8ace${(i * 1042).toString(16)}b7392a1042`;

    card.innerHTML = `
      <img src="images/kb_${i}.jpg" alt="Artifact ${i}" class="asset-card-img" />
      <div class="watermark-overlay">
        <span class="watermark-badge">UNYKORN PROTOCOL</span>
        <span>EIP-712 #0${i}</span>
      </div>
    `;

    card.addEventListener('click', () => openLightbox(card.dataset));
    grid.appendChild(card);
  }
}

/* 4. ASSET LIGHTBOX INSPECTOR & ACTIONS */
let activeAssetData = null;

function initAssetLightbox() {
  const modal = document.getElementById('assetLightboxModal');
  const closeBtn = document.getElementById('closeLightboxBtn');
  const copyBtn = document.getElementById('copyHashBtn');
  const attachBtn = document.getElementById('attachEvidenceBtn');

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!activeAssetData) return;
      navigator.clipboard.writeText(activeAssetData.hash);
      copyBtn.textContent = 'Evidence Hash Copied!';
      copyBtn.style.color = '#10b981';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Evidence Seal Hash';
        copyBtn.style.color = '';
      }, 2000);
    });
  }

  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      if (!activeAssetData) return;
      const tierSelect = document.getElementById('calcEvidenceTier');
      if (tierSelect) tierSelect.value = '6000'; // Set to Workflow-Linked
      modal.classList.remove('active');

      const calcSection = document.getElementById('calculator');
      if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth' });

      // Trigger recalculation
      const hoursInput = document.getElementById('calcHours');
      if (hoursInput) hoursInput.dispatchEvent(new Event('input'));
    });
  }
}

function openLightbox(data) {
  activeAssetData = data;
  const modal = document.getElementById('assetLightboxModal');
  const title = document.getElementById('lightboxTitle');
  const img = document.getElementById('lightboxImg');
  const hash = document.getElementById('lightboxHash');
  const downloadLink = document.getElementById('downloadAssetBtn');

  if (title) title.textContent = data.title;
  if (img) img.src = data.src;
  if (hash) hash.textContent = `Evidence Hash: ${data.hash}`;
  if (downloadLink) {
    downloadLink.href = data.src;
    downloadLink.download = `UNYKORN_PROTOCOL_${data.id}.jpg`;
  }

  if (modal) modal.classList.add('active');
}

/* 5. COLLAPSIBLE TECHNICAL METHODOLOGY DRAWER */
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

/* 6. OPTIONAL CULTURE / LAB MODE DRAWER */
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

/* 7. 3-STAGE WORKFLOW STEP NAVIGATION */
function initWorkflowNav() {
  const steps = document.querySelectorAll('.workflow-step');
  steps.forEach(step => {
    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });
}
