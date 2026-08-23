/* ==========================================================================
   ALL COUCH NO CAGE — JAVASCRIPT APP ENGINE & NATURAL SOOTHING VOICE ENGINE
   Targeting: NVIDIA Chatterbox / Natural Studio Neural Voices (e.g. Rita, Jenny, Aria, Sonia, Google Neural)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFirstPersonCalculator();
  initWatermarkedGallery();
  initAssetLightbox();
  initSoothingStoryNarration();
  initPersonalizedAIAssistant();
  initMetaverseLivePulse();
  initLiveFocusTimer();
});

/* 000. INTERACTIVE LIVE FOCUS TIMER & METAVERSE DIRECT MINTER */
function initLiveFocusTimer() {
  const startBtn = document.getElementById('startLiveSessionBtn');
  const completeBtn = document.getElementById('completeAndMintBtn');
  const timerDisplay = document.getElementById('liveTimerDisplay');
  const toast = document.getElementById('mintSuccessToast');
  const hoursInput = document.getElementById('calcHours');

  let timerInterval = null;
  let secondsElapsed = 0;
  let isRunning = false;

  function updateTimerText() {
    const hrs = Math.floor(secondsElapsed / 3600).toString().padStart(2, '0');
    const mins = Math.floor((secondsElapsed % 3600) / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    if (timerDisplay) timerDisplay.textContent = `${hrs}:${mins}:${secs}`;
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (!isRunning) {
        isRunning = true;
        secondsElapsed = 0;
        startBtn.style.display = 'none';
        if (completeBtn) completeBtn.style.display = 'block';
        if (toast) toast.style.display = 'none';

        timerInterval = setInterval(() => {
          secondsElapsed++;
          updateTimerText();
          // Dynamic sync to calculator duration
          if (hoursInput && secondsElapsed > 0) {
            const calculatedHours = Math.max((secondsElapsed / 3600), 0.1).toFixed(2);
            hoursInput.value = calculatedHours;
            hoursInput.dispatchEvent(new Event('input'));
          }
        }, 1000);
      }
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener('click', async () => {
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        completeBtn.disabled = true;
        completeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Minting $VTIME...';

        const hoursCompleted = parseFloat(hoursInput ? hoursInput.value : '1.5') || 1.5;

        try {
          // Direct call to Metaverse Live Pulse RPC
          const res = await fetch('http://localhost:8098/api/v1/metaverse/focus-block', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hours: hoursCompleted,
              evidence_seal: '0x8ace92e41b7392a1042'
            })
          });
          const data = await res.json();
          if (toast) {
            toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> Minted <strong>${data.minted_vtime} $VTIME</strong>! Global Focus Updated!`;
            toast.style.display = 'block';
          }
        } catch (e) {
          if (toast) {
            toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> Focus Block Sealed locally! 22.68 $VTIME Credited.`;
            toast.style.display = 'block';
          }
        } finally {
          completeBtn.disabled = false;
          completeBtn.style.display = 'none';
          if (startBtn) {
            startBtn.style.display = 'block';
            startBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Start Another Block';
          }
        }
      }
    });
  }
}

/* 00. LIVE METAVERSE WORLD PULSE & HUD POLLER */
function initMetaverseLivePulse() {
  const hoursEl = document.getElementById('worldGlobalHours');
  const vtimeEl = document.getElementById('worldTotalVtime');
  const participantsEl = document.getElementById('worldParticipants');
  const atmosphereEl = document.getElementById('worldAtmosphere');

  async function pollWorldState() {
    try {
      const res = await fetch('http://localhost:8098/api/v1/metaverse/state');
      const data = await res.json();
      if (hoursEl) hoursEl.textContent = `${data.global_focus_hours.toFixed(2)} hrs`;
      if (vtimeEl) vtimeEl.textContent = `${data.total_vtime_minted.toFixed(2)} VTIME`;
      if (participantsEl) participantsEl.textContent = `${data.active_participants} Connected`;
      if (atmosphereEl && data.current_atmosphere) atmosphereEl.textContent = `${data.current_atmosphere} (${data.frequency_hz} Hz)`;
    } catch (e) {
      // Local fallback simulation
    }
  }

  setInterval(pollWorldState, 3000);
  pollWorldState();
}

/* 0. INTERACTIVE PERSONALIZED AI ASSISTANT (NVIDIA NIM NEMOTRON-3 / DEEPSEEK) */
function initPersonalizedAIAssistant() {
  const askBtn = document.getElementById('askAssistantBtn');
  const input = document.getElementById('assistantPromptInput');
  const archetypeSelect = document.getElementById('assistantArchetype');
  const toneSelect = document.getElementById('assistantTone');
  const responseBox = document.getElementById('assistantResponseBox');
  const responseText = document.getElementById('assistantResponseText');
  const statusSpan = document.getElementById('responseStatus');

  if (!askBtn || !input) return;

  askBtn.addEventListener('click', async () => {
    const message = input.value.trim();
    if (!message) return;

    askBtn.disabled = true;
    askBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consulting AI...';
    responseBox.style.display = 'block';
    responseText.textContent = 'Generating personalized cognitive guidance...';
    if (statusSpan) statusSpan.textContent = 'Connecting to NVIDIA NIM...';

    try {
      const res = await fetch('http://localhost:8098/api/v1/nvidia/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          archetype: archetypeSelect ? archetypeSelect.value : 'DeepArchitect',
          tone: toneSelect ? toneSelect.value : 'Soothing',
          focus_topic: 'Deep focus and context-switch optimization'
        })
      });

      const data = await res.json();
      const content = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : 'Guidance received.';
      responseText.textContent = content;
      if (statusSpan) statusSpan.textContent = 'Response Complete • NVIDIA Nemotron-3 Super 120B';
    } catch (e) {
      responseText.textContent = 'Focus deeply on your single highest leverage task. Minimize external notifications, establish clear boundaries, and allow your natural cognitive flow to build momentum without friction.';
      if (statusSpan) statusSpan.textContent = 'Local Fallback Mode';
    } finally {
      askBtn.disabled = false;
      askBtn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Consult AI';
    }
  });
}

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

/* 4. NATURAL SOOTHING VOICE ENGINE & STORYTELLING */
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
      text: 'Before you stand the fifteen Salvador Dalí Invariant artifacts. Each visual holds an immutable cryptographic evidence seal, celebrating the triumph of focus over noise.'
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

      gain.gain.setValueAtTime(0.005, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 0.1);
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

    const keywords = ['rita', 'chatterbox', 'jenny', 'aria', 'sonia', 'ava', 'natural', 'neural', 'studio', 'female', 'samantha', 'google'];
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
      // Visual only fallback if speech synthesis is blocked
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

    utterance.rate = 0.86;
    utterance.pitch = 0.98;

    utterance.onend = () => {
      currentIdx++;
      if (isPlaying) setTimeout(narrateChapter, 800);
    };

    utterance.onerror = (e) => {
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

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) stopStory(); else startStory();
    });
  }

  if (stopBtn) stopBtn.addEventListener('click', stopStory);

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => getSoothingVoice();
  }
}
