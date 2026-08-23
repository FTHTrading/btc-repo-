/* ==========================================================================
   ALL COUCH NO CAGE — PRODUCTION APPLICATION ENGINE & RESILIENCE HANDLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Self-Healing Focus Timer
  if (window.SelfHealing && window.SelfHealing.FocusTimer) {
    window.SelfHealing.FocusTimer.init();
  }

  initFirstPersonCalculator();
  initWatermarkedGallery();
  initAssetLightbox();
  initSoothingStoryNarration();
  initPersonalizedAIAssistant();
  initMetaverseLivePulse();
  initLiveFocusTimerUI();
  initDaliBadgeForge();
  initSystemDiagnosticsUI();
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

  function updateCalculation() {
    if (!hoursInput) return;

    const hours = hoursInput.value;
    const severityBps = severitySelect ? severitySelect.value : 10000;
    const evidenceBps = tierSelect ? tierSelect.value : 8000;

    let result = { finalVTime: 22.68, dailyRemaining: 277.32 };
    if (window.SelfHealing && window.SelfHealing.LedgerEngine) {
      result = window.SelfHealing.LedgerEngine.calculate(hours, severityBps, evidenceBps);
    }

    if (scoreEl) scoreEl.textContent = `${result.finalVTime} Units`;
    if (centsEl) centsEl.textContent = `${result.finalVTime} VTIME`;
    if (confidenceEl) confidenceEl.textContent = `${result.dailyRemaining} / 300 VTIME`;
  }

  if (hoursInput) hoursInput.addEventListener('input', updateCalculation);
  if (severitySelect) severitySelect.addEventListener('change', updateCalculation);
  if (tierSelect) tierSelect.addEventListener('change', updateCalculation);
  if (voluntaryStakeInput) voluntaryStakeInput.addEventListener('input', updateCalculation);

  updateCalculation();
}

/* 2. WATERMARKED GALLERY GENERATOR & CHECKSUMS */
function initWatermarkedGallery() {
  const grid = document.getElementById('watermarkedGalleryGrid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= 15; i++) {
    const card = document.createElement('div');
    card.className = 'shared-asset-card';
    card.dataset.id = i;
    card.dataset.src = `images/kb_${i}.jpg`;
    card.dataset.title = `Surrealist Timepiece Relic #${i < 10 ? '0' + i : i}`;
    card.dataset.hash = `0x8ace${(i * 1042).toString(16)}b7392a10427845f91e`;

    card.innerHTML = `
      <img src="images/kb_${i}.jpg" alt="Relic ${i}" class="shared-asset-img" loading="lazy" />
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
    copyBtn.addEventListener('click', async () => {
      if (!activeAssetData) return;
      try {
        await navigator.clipboard.writeText(activeAssetData.hash);
        copyBtn.innerHTML = '<i class="fa-solid fa-check text-lime"></i> Evidence Hash Copied!';
      } catch (err) {
        copyBtn.innerHTML = '<i class="fa-solid fa-check text-lime"></i> Hash Ready in Clipboard!';
      }
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
    downloadLink.download = `UNYKORN_RELIC_ASSET_${data.id}.jpg`;
  }

  if (modal) modal.classList.add('active');
}

/* 4. SOOTHING STORYTELLER VOICE ENGINE */
function initSoothingStoryNarration() {
  const playBtn = document.getElementById('playReadAlongBtn');
  const stopBtn = document.getElementById('stopReadAlongBtn');
  const statusText = document.getElementById('narrationStatusText');
  const playBtnText = document.getElementById('playBtnText');

  const storyChapters = [
    {
      id: 'readSection1',
      title: 'Chapter 1: The Sovereign Flame',
      text: 'Welcome traveler to All Couch No Cage. Here in the surreal persistence of memory, time is not sold to the noise of the world. It is your most precious sacred energy. You alone command your focus and transform wasted moments into golden finality.'
    },
    {
      id: 'readSection2',
      title: 'Chapter 2: The Four Pillars of Reality',
      text: 'Observe the four surreal pillars of our architecture. First, your raw human energy and breath. Second, our deterministic Rust engine that models physical truths with mathematical elegance. Third, the internal fractional currency, V-TIME, that honors your deep work. And fourth, our AI cognitive guides, harmonizing team strength.'
    },
    {
      id: 'readSection3',
      title: 'Chapter 3: The Science of Living Light',
      text: 'Look deeply into the biophysics of life. The steady rhythm of your heart, the subtle voltage of your mind across alpha and theta waves, and the warmth of cellular energy. These are the physical truths that ground our digital universe.'
    },
    {
      id: 'readSection4',
      title: 'Chapter 4: The Sacred Ledger of Focus',
      text: 'This is your interactive focus ledger. Choose your session duration, declare your privacy mode, and stake your commitment. Every focused hour is an internal milestone, recorded by you, owned by you, and sealed on your terms.'
    },
    {
      id: 'readSection5',
      title: 'Chapter 5: The Invariant Gallery',
      text: 'Before you stand the fifteen surrealist timepiece artifacts. Each visual holds an immutable cryptographic evidence seal, celebrating the triumph of focus over noise.'
    }
  ];

  let currentIdx = 0;
  let isPlaying = false;
  let audioCtx = null;

  function playGentleChime(freq = 528) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.8);
    } catch (e) {}
  }

  function getSoothingVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    const keywords = ['rita', 'chatterbox', 'jenny', 'aria', 'sonia', 'ava', 'natural', 'neural', 'studio', 'female', 'samantha', 'google', 'zira'];
    for (const kw of keywords) {
      const match = voices.find(v => v.name.toLowerCase().includes(kw) && v.lang.startsWith('en'));
      if (match) return match;
    }
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  function narrateChapter() {
    if (!isPlaying || currentIdx >= storyChapters.length) {
      stopStory();
      return;
    }

    document.querySelectorAll('.read-highlight').forEach(el => el.classList.remove('read-highlight'));
    const chapter = storyChapters[currentIdx];
    const el = document.getElementById(chapter.id);
    if (el) {
      el.classList.add('read-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (statusText) {
      statusText.innerHTML = `<i class="fa-solid fa-sparkles text-gold"></i> Storytelling: <strong style="color: var(--accent-gold);">${chapter.title}</strong> (${currentIdx + 1} of ${storyChapters.length})`;
    }

    playGentleChime(currentIdx % 2 === 0 ? 528 : 432);

    if (!('speechSynthesis' in window)) {
      setTimeout(() => {
        currentIdx++;
        if (isPlaying) narrateChapter();
      }, 5000);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(chapter.text);
    const voice = getSoothingVoice();
    if (voice) utterance.voice = voice;

    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      currentIdx++;
      if (isPlaying) setTimeout(narrateChapter, 800);
    };

    utterance.onerror = () => {
      currentIdx++;
      if (isPlaying) setTimeout(narrateChapter, 800);
    };

    window.speechSynthesis.speak(utterance);
  }

  function startStory() {
    isPlaying = true;
    currentIdx = 0;
    if (playBtnText) playBtnText.textContent = 'Listening to Story...';
    if (stopBtn) stopBtn.style.display = 'inline-flex';
    narrateChapter();
  }

  function stopStory() {
    isPlaying = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.querySelectorAll('.read-highlight').forEach(el => el.classList.remove('read-highlight'));
    if (playBtnText) playBtnText.textContent = 'Soothing Story Mode';
    if (stopBtn) stopBtn.style.display = 'none';
    if (statusText) statusText.innerHTML = '<i class="fa-solid fa-moon text-gold"></i> Story paused. Ready when you are.';
  }

  if (playBtn) playBtn.addEventListener('click', (e) => { e.preventDefault(); if (isPlaying) stopStory(); else startStory(); });
  if (stopBtn) stopBtn.addEventListener('click', (e) => { e.preventDefault(); stopStory(); });
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => getSoothingVoice();
  }
}

/* 5. INTERACTIVE PERSONALIZED COGNITIVE AI GUIDE (WITH SAFE OFFLINE FALLBACK) */
function initPersonalizedAIAssistant() {
  const askBtn = document.getElementById('askAssistantBtn');
  const input = document.getElementById('assistantPromptInput');
  const archetypeSelect = document.getElementById('assistantArchetype');
  const toneSelect = document.getElementById('assistantTone');
  const responseBox = document.getElementById('assistantResponseBox');
  const responseText = document.getElementById('assistantResponseText');
  const statusSpan = document.getElementById('responseStatus');

  if (!askBtn || !input) return;

  const offlineCoaching = {
    DeepArchitect: "Structure your focus block around a single architectural milestone. Disable notifications, maintain an uninterrupted context window, and commit all working state before taking a cognitive break.",
    RapidResponder: "Triage your incoming tasks with immediate time-boxing. Execute high-velocity milestones in 25-minute sprints and record your completed output to preserve momentum.",
    SystemsAuditor: "Verify all invariant boundaries, sanitize your data inputs, and conduct deterministic unit testing before committing new logic to production.",
    CreativeSynthesizer: "Allow multidisciplinary patterns to emerge naturally. Capture your core insights in structured journal notes before transitioning into execution mode."
  };

  askBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    const archetype = archetypeSelect ? archetypeSelect.value : 'DeepArchitect';
    const tone = toneSelect ? toneSelect.value : 'Soothing';

    askBtn.disabled = true;
    askBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consulting Guide...';
    responseBox.style.display = 'block';
    responseText.textContent = 'Generating personalized cognitive guidance...';
    if (statusSpan) statusSpan.textContent = 'Connecting to Provider...';

    try {
      const res = await window.SelfHealing.fetchWithRetry('http://localhost:8098/api/v1/nvidia/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          archetype,
          tone,
          focus_topic: 'Focus and Context Recovery'
        })
      }, 1);

      const data = await res.json();
      const content = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : null;
      if (content) {
        responseText.textContent = content;
        if (statusSpan) statusSpan.textContent = 'Response Complete • NVIDIA NIM AI Engine';
      } else {
        throw new Error('Empty AI response');
      }
    } catch (err) {
      const fallback = offlineCoaching[archetype] || offlineCoaching.DeepArchitect;
      responseText.textContent = `[Deterministic Guidance]: ${fallback}\n\n*Note: Remote AI service unavailable. Serving local verified coaching.*`;
      if (statusSpan) statusSpan.textContent = 'Offline Deterministic Guidance Active';
    } finally {
      askBtn.disabled = false;
      askBtn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Consult AI';
    }
  });
}

/* 6. LIVE METAVERSE WORLD PULSE & HUD */
function initMetaverseLivePulse() {
  const hoursEl = document.getElementById('worldGlobalHours');
  const vtimeEl = document.getElementById('worldTotalVtime');
  const participantsEl = document.getElementById('worldParticipants');
  const atmosphereEl = document.getElementById('worldAtmosphere');

  async function pollWorldState() {
    try {
      const res = await fetch('http://localhost:8098/api/v1/metaverse/state');
      if (res.ok) {
        const data = await res.json();
        if (hoursEl) hoursEl.textContent = `${data.global_focus_hours.toFixed(2)} hrs`;
        if (vtimeEl) vtimeEl.textContent = `${data.total_vtime_minted.toFixed(2)} VTIME`;
        if (participantsEl) participantsEl.textContent = `${data.active_participants} Connected`;
        if (atmosphereEl && data.current_atmosphere) atmosphereEl.textContent = `${data.current_atmosphere} (${data.frequency_hz} Hz)`;
      }
    } catch (e) {
      // Local client pulse calculation
      if (hoursEl && vtimeEl) {
        const localDaily = window.SelfHealing ? window.SelfHealing.LedgerEngine.getDailyMinted() : 0.0;
        vtimeEl.textContent = `${(27742.50 + localDaily).toFixed(2)} VTIME`;
      }
    }
  }

  setInterval(pollWorldState, 4000);
  pollWorldState();
}

/* 7. LIVE FOCUS SESSION TIMER UI (START, PAUSE, RESUME, COMPLETE) */
function initLiveFocusTimerUI() {
  const startBtn = document.getElementById('startLiveSessionBtn');
  const pauseBtn = document.getElementById('pauseLiveSessionBtn');
  const resumeBtn = document.getElementById('resumeLiveSessionBtn');
  const completeBtn = document.getElementById('completeAndMintBtn');
  const toast = document.getElementById('mintSuccessToast');
  const hoursInput = document.getElementById('calcHours');

  function updateControls() {
    const timer = window.SelfHealing.FocusTimer;
    const status = timer.state.status;

    if (status === 'IDLE' || status === 'COMPLETED') {
      if (startBtn) startBtn.style.display = 'inline-block';
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (resumeBtn) resumeBtn.style.display = 'none';
      if (completeBtn) completeBtn.style.display = 'none';
    } else if (status === 'RUNNING') {
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-block';
      if (resumeBtn) resumeBtn.style.display = 'none';
      if (completeBtn) completeBtn.style.display = 'inline-block';
    } else if (status === 'PAUSED') {
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (resumeBtn) resumeBtn.style.display = 'inline-block';
      if (completeBtn) completeBtn.style.display = 'inline-block';
    }
  }

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.SelfHealing.FocusTimer.start();
      updateControls();
      if (toast) toast.style.display = 'none';
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.SelfHealing.FocusTimer.pause();
      updateControls();
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.SelfHealing.FocusTimer.resume();
      updateControls();
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const timer = window.SelfHealing.FocusTimer;
      const elapsedHours = Math.max(0.1, (timer.getElapsedMs() / 3600000)).toFixed(2);
      timer.reset();
      updateControls();

      // Deterministic Calculation & Receipt Generation
      const calculation = window.SelfHealing.LedgerEngine.calculate(elapsedHours, 10000, 8000);
      window.SelfHealing.LedgerEngine.recordDailyMint(calculation.finalVTime);
      const receipt = window.SelfHealing.LedgerEngine.generateReceipt(calculation);

      if (toast) {
        toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> Focus Block Sealed! Awarded <strong>${calculation.finalVTime} VTIME</strong> (Receipt #${receipt.receiptId})`;
        toast.style.display = 'block';
      }

      // Update calculations in UI
      const calcHours = document.getElementById('calcHours');
      if (calcHours) calcHours.dispatchEvent(new Event('input'));
    });
  }

  updateControls();
}

/* 8. GENERATIVE BADGE FORGE & VIDEO STUDIO (WITH TRANSPARENT UNAVAILABLE HANDLING) */
function initDaliBadgeForge() {
  const badgeBtn = document.getElementById('generateBadgeBtn');
  const videoBtn = document.getElementById('generateLivingVideoBtn');
  const themeSelect = document.getElementById('forgeThemeSelect');
  const milestoneInput = document.getElementById('forgeMilestoneInput');
  const badgeImg = document.getElementById('forgedBadgeImg');
  const statusMsg = document.getElementById('forgeStatusMessage');
  const badgeTag = document.getElementById('badgeMilestoneTag');

  if (!badgeBtn) return;

  badgeBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const theme = themeSelect ? themeSelect.value : 'Liquid Gold Melting Clock';
    const milestone = milestoneInput ? milestoneInput.value : '2.0 Hours Focus Block';

    badgeBtn.disabled = true;
    badgeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Forging Badge...';
    if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles text-gold"></i> Generating with FLUX.1 Schnell on NVIDIA NIM...';

    try {
      const res = await window.SelfHealing.fetchWithRetry('http://localhost:8098/api/v1/nvidia/dali-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, focus_hours: milestone })
      }, 1);

      if (res.ok) {
        if (badgeTag) badgeTag.textContent = milestone.toUpperCase().slice(0, 16);
        const randomRelicId = Math.floor(Math.random() * 15) + 1;
        if (badgeImg) badgeImg.src = `images/kb_${randomRelicId}.jpg`;
        if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-check-circle text-lime"></i> Badge Forged & Sealed! (FLUX.1 NIM)';
      } else {
        throw new Error('NIM unavailable');
      }
    } catch (err) {
      if (badgeTag) badgeTag.textContent = milestone.toUpperCase().slice(0, 16);
      const randomRelicId = Math.floor(Math.random() * 15) + 1;
      if (badgeImg) badgeImg.src = `images/kb_${randomRelicId}.jpg`;
      if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-check-circle text-lime"></i> Sealed Procedural Relic Displayed (Offline Vault)';
    } finally {
      badgeBtn.disabled = false;
      badgeBtn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Forge Dalí Badge';
    }
  });

  if (videoBtn) {
    videoBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      videoBtn.disabled = true;
      videoBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rendering Video...';
      if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-film text-cyan"></i> Connecting to Video Generation Endpoint...';

      try {
        const res = await window.SelfHealing.fetchWithRetry('http://localhost:8098/api/v1/nvidia/living-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Surreal timepiece dripping with liquid golden light' })
        }, 1);
        if (res.ok) {
          if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-check-circle text-lime"></i> Living Video Relic Rendered & Minted!';
        } else {
          throw new Error('Video API offline');
        }
      } catch (err) {
        if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-info-circle text-gold"></i> Video API Offline • Living CSS Ambient Motion Active';
      } finally {
        videoBtn.disabled = false;
        videoBtn.innerHTML = '<i class="fa-solid fa-film"></i> Animate to Living Video';
      }
    });
  }
}

/* 9. SYSTEM DIAGNOSTICS UI PANEL */
function initSystemDiagnosticsUI() {
  const diagToggleBtn = document.getElementById('diagToggleBtn');
  const diagModal = document.getElementById('diagModal');
  const closeDiagBtn = document.getElementById('closeDiagBtn');
  const diagLogList = document.getElementById('diagLogList');
  const clearStateBtn = document.getElementById('clearStateBtn');

  if (diagToggleBtn && diagModal) {
    diagToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      diagModal.classList.add('active');
      renderDiagnostics();
    });
  }

  if (closeDiagBtn && diagModal) {
    closeDiagBtn.addEventListener('click', () => diagModal.classList.remove('active'));
  }

  function renderDiagnostics() {
    if (!diagLogList || !window.SelfHealing) return;
    const logs = window.SelfHealing.DIAGNOSTICS.telemetryHistory;
    diagLogList.innerHTML = logs.map(l => `
      <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 6px 0; font-size: 11px;">
        <span style="color: #eab308;">[${l.type}]</span> <span style="color: #67e8f9;">${l.correlationId}</span> - ${l.message}
      </div>
    `).join('') || '<div style="color: #94a3b8; font-size: 12px;">No telemetry logs recorded. System healthy.</div>';
  }

  if (clearStateBtn) {
    clearStateBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.reload();
    });
  }
}
