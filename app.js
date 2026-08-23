/* ==========================================================================
   ALL COUCH NO CAGE — SALVADOR DALI LIQUID GLASS ENGINE & LIGHTBOX
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHermeticSoundMeter();
  initAudioCanvasOscillator();
  initHonestCalculator();
  initWatermarkedGallery();
  initAssetLightbox();
});

/* 1. HERMETIC ACOUSTIC SOUND METER */
let currentFreqHz = 4320;
let currentThdPct = 45;

function initHermeticSoundMeter() {
  const slider = document.getElementById('soundFreqInput');
  const sliderVal = document.getElementById('freqSliderVal');
  const thdSelect = document.getElementById('thdSelect');
  const transmuteBtn = document.getElementById('transmuteFreqBtn');

  function update() {
    if (!slider) return;
    currentFreqHz = parseInt(slider.value) || 4320;
    currentThdPct = parseInt(thdSelect ? thdSelect.value : 45) || 45;

    if (sliderVal) sliderVal.textContent = `${currentFreqHz.toLocaleString()} Hz`;
  }

  if (slider) slider.addEventListener('input', update);
  if (thdSelect) thdSelect.addEventListener('change', update);

  if (transmuteBtn) {
    transmuteBtn.addEventListener('click', () => {
      transmuteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> Transmuting Sound Entropy...';
      setTimeout(() => {
        transmuteBtn.innerHTML = '<i class="fa-solid fa-check"></i> Transmutation Complete! (50 $VTIME Burned)';
        transmuteBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
          transmuteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Transmute Sound Entropy into $VTIME Burn';
          transmuteBtn.style.background = '';
        }, 3000);
      }, 1200);
    });
  }

  update();
}

/* 2. REAL-TIME CANVAS AUDIO OSCILLATOR */
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
      const freq = (currentFreqHz / 1000) * 0.05;
      const noise = (Math.random() - 0.5) * (currentThdPct / 10);
      const y = mid + Math.sin(x * freq + step) * 20 + noise;

      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#06b6d4';
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y = mid + Math.cos(x * 0.03 - step) * 12;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    step += 0.08;
    requestAnimationFrame(draw);
  }

  draw();
}

/* 3. WASTED TIME IMPACT CALCULATOR */
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

/* 4. WATERMARKED SHARED ASSETS GALLERY GENERATOR */
function initWatermarkedGallery() {
  const grid = document.getElementById('watermarkedGalleryGrid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= 15; i++) {
    const card = document.createElement('div');
    card.className = 'shared-asset-card';
    card.dataset.id = i;
    card.dataset.src = `images/kb_${i}.jpg`;
    card.dataset.title = `Protocol Evidence Artifact #${i < 10 ? '0' + i : i}`;
    card.dataset.hash = `0x8ace${(i * 1042).toString(16)}b7392a1042`;

    card.innerHTML = `
      <img src="images/kb_${i}.jpg" alt="Artifact ${i}" class="shared-asset-img" />
      <div class="liquid-watermark">
        <span class="watermark-brand">UNYKORN PROTOCOL</span>
        <span>DALÍ INVARIANT #0${i}</span>
      </div>
    `;

    card.addEventListener('click', () => openLightbox(card.dataset));
    grid.appendChild(card);
  }
}

/* 5. ASSET LIGHTBOX INSPECTOR & ACTIONS */
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
      copyBtn.innerHTML = '<i class="fa-solid fa-check text-lime"></i> Evidence Hash Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-copy text-cyan"></i> Copy Evidence Seal Hash';
      }, 2000);
    });
  }

  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      if (!activeAssetData) return;
      const tierSelect = document.getElementById('calcEvidenceTier');
      if (tierSelect) tierSelect.value = '6000';
      modal.classList.remove('active');

      const calcSection = document.getElementById('calculator');
      if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth' });

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
