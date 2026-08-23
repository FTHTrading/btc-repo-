/* ==========================================================================
   ALL COUCH NO CAGE — JAVASCRIPT APP ENGINE & READ-ALONG NARRATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFirstPersonCalculator();
  initWatermarkedGallery();
  initAssetLightbox();
  initReadAlongSystem();
});

/* 1. FIRST-PERSON FOCUS & INTEGRITY CALCULATOR */
function initFirstPersonCalculator() {
  const hoursInput = document.getElementById('calcHours');
  const severitySelect = document.getElementById('calcSeverity');
  const tierSelect = document.getElementById('calcEvidenceTier');
  const voluntaryStakeInput = document.getElementById('voluntaryStakeInput');

  const scoreEl = document.getElementById('impactScoreBps');
  const centsEl = document.getElementById('impactCentsVal');
  const confidenceEl = document.getElementById('confidenceDisplay');

  function calculate() {
    if (!hoursInput) return;

    const hours = parseFloat(hoursInput.value) || 0;
    const severityBps = parseInt(severitySelect.value) || 10000;
    const evidenceBps = parseInt(tierSelect.value) || 8000;

    // First-person formula: C = min(hours * 10 * (severity / 10000) * (evidence / 10000), 100, remaining_daily)
    const baseUnits = hours * 15.0; // 15 units per hour baseline
    const adjusted = baseUnits * (severityBps / 10000) * (evidenceBps / 10000);
    const finalCredits = Math.min(adjusted, 100.0).toFixed(2);

    const remainingDaily = (300.0 - parseFloat(finalCredits)).toFixed(2);

    if (scoreEl) scoreEl.textContent = `${finalCredits} Units`;
    if (centsEl) centsEl.textContent = `${finalCredits} VTIME`;
    if (confidenceEl) confidenceEl.textContent = `${remainingDaily} / 300 VTIME`;
  }

  if (hoursInput) hoursInput.addEventListener('input', calculate);
  if (severitySelect) severitySelect.addEventListener('change', calculate);
  if (tierSelect) tierSelect.addEventListener('change', calculate);
  if (voluntaryStakeInput) voluntaryStakeInput.addEventListener('input', calculate);

  calculate();
}

/* 2. WATERMARKED GALLERY GENERATOR */
function initWatermarkedGallery() {
  const grid = document.getElementById('watermarkedGalleryGrid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= 15; i++) {
    const card = document.createElement('div');
    card.className = 'shared-asset-card';
    card.dataset.id = i;
    card.dataset.src = `images/kb_${i}.jpg`;
    card.dataset.title = `Protocol Visual Artifact #${i < 10 ? '0' + i : i}`;
    card.dataset.hash = `0x8ace${(i * 1042).toString(16)}b7392a1042`;

    card.innerHTML = `
      <img src="images/kb_${i}.jpg" alt="Artifact ${i}" class="shared-asset-img" />
      <div class="liquid-watermark">
        <span class="watermark-brand">UNYKORN PROTOCOL</span>
        <span>EVIDENCE SEAL #${i < 10 ? '0' + i : i}</span>
      </div>
    `;

    card.addEventListener('click', () => openLightbox(card.dataset));
    grid.appendChild(card);
  }
}

/* 3. ASSET LIGHTBOX INSPECTOR */
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
      modal.classList.remove('active');
      const calcSection = document.getElementById('calculator');
      if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth' });
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
    downloadLink.download = `UNYKORN_PROTOCOL_ASSET_${data.id}.jpg`;
  }

  if (modal) modal.classList.add('active');
}

/* 4. INTERACTIVE READ-ALONG SYSTEM (Web Speech API + UI Highlighting) */
function initReadAlongSystem() {
  const playBtn = document.getElementById('playReadAlongBtn');
  const stopBtn = document.getElementById('stopReadAlongBtn');
  const statusText = document.getElementById('narrationStatusText');
  const playIcon = document.getElementById('playIcon');
  const playBtnText = document.getElementById('playBtnText');

  if (!('speechSynthesis' in window)) {
    if (statusText) statusText.textContent = 'Web Speech API not supported in this browser.';
    return;
  }

  const sectionsToRead = [
    { id: 'readSection1', text: 'Product Truth. All Couch No Cage is a self-sovereign personal experience protocol. A participant alone creates, controls, and may cryptographically seal their own records.' },
    { id: 'readSection2', text: 'Own your focus, seal your experience. A self-sovereign, first-person protocol for documenting cognitive recovery and focus commitments under a transparent ruleset.' },
    { id: 'readSection3', text: 'Core Protocol Principles. First-Person Agency. Participants alone start, commit, and finalize focus sessions. No peer rankings or surveillance are ever ingested.' },
    { id: 'readSection4', text: 'Personal Focus and Integrity Ledger. Compute self-consented focus units and non-monetary closed-loop VTIME utility credits.' },
    { id: 'readSection5', text: 'Protocol Visual Asset Inspector. Inspect SHA-256 evidence seals and pre-deployment cataloged visual artifacts.' },
    { id: 'readSection6', text: 'Smart Contract Architecture. Five verified smart contracts and deterministic Rust modules engineered for sovereign self-management.' }
  ];

  let currentIdx = 0;
  let isPlaying = false;

  function speakNextSection() {
    if (!isPlaying || currentIdx >= sectionsToRead.length) {
      stopNarration();
      return;
    }

    // Clear previous highlight
    document.querySelectorAll('.read-highlight').forEach(el => el.classList.remove('read-highlight'));

    const item = sectionsToRead[currentIdx];
    const el = document.getElementById(item.id);
    if (el) {
      el.classList.add('read-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (statusText) {
      statusText.innerHTML = `<i class="fa-solid fa-volume-high text-gold"></i> Narrating: Section ${currentIdx + 1} of ${sectionsToRead.length}`;
    }

    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      currentIdx++;
      if (isPlaying) {
        setTimeout(speakNextSection, 400);
      }
    };

    utterance.onerror = () => {
      stopNarration();
    };

    window.speechSynthesis.speak(utterance);
  }

  function startNarration() {
    window.speechSynthesis.cancel();
    isPlaying = true;
    currentIdx = 0;
    if (playBtnText) playBtnText.textContent = 'Narrating...';
    if (stopBtn) stopBtn.style.display = 'inline-flex';
    speakNextSection();
  }

  function stopNarration() {
    isPlaying = false;
    window.speechSynthesis.cancel();
    document.querySelectorAll('.read-highlight').forEach(el => el.classList.remove('read-highlight'));
    if (playBtnText) playBtnText.textContent = 'Read-Along Voice';
    if (stopBtn) stopBtn.style.display = 'none';
    if (statusText) statusText.innerHTML = '<i class="fa-solid fa-waveform text-gold"></i> Read-Along Complete / Idle.';
  }

  if (playBtn) playBtn.addEventListener('click', () => {
    if (isPlaying) stopNarration(); else startNarration();
  });

  if (stopBtn) stopBtn.addEventListener('click', stopNarration);
}
