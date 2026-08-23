/* ==========================================================================
   ALL COUCH NO CAGE — JAVASCRIPT APP ENGINE & SOOTHING STORY NARRATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFirstPersonCalculator();
  initWatermarkedGallery();
  initAssetLightbox();
  initSoothingStoryNarration();
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

/* 4. SOOTHING STORYTELLING NARRATION SYSTEM (Harmonic Tone + Ambient Story Pace) */
function initSoothingStoryNarration() {
  const playBtn = document.getElementById('playReadAlongBtn');
  const stopBtn = document.getElementById('stopReadAlongBtn');
  const statusText = document.getElementById('narrationStatusText');
  const playIcon = document.getElementById('playIcon');
  const playBtnText = document.getElementById('playBtnText');

  if (!('speechSynthesis' in window)) {
    if (statusText) statusText.textContent = 'Web Speech API not supported in this browser.';
    return;
  }

  // Soothing storytelling chapters
  const storyChapters = [
    {
      id: 'readSection1',
      title: 'Chapter 1: The Sovereign Flame',
      text: 'Welcome traveler. You have stepped into All Couch No Cage. Here, time is not a commodity sold to the noise of the world. It is your sacred energy. A space where you alone command your focus, transform wasted moments, and seal your personal growth.'
    },
    {
      id: 'readSection2',
      title: 'Chapter 2: The Four Pillars of Reality',
      text: 'Observe the four tiers of our architecture. First, your raw human energy and breath. Second, our deterministic Rust engine that models physical truths with mathematical elegance. Third, the internal fractional currency, V-TIME, that honors your deep work. And fourth, our AI cognitive guides, harmonizing team strength and protecting your momentum.'
    },
    {
      id: 'readSection3',
      title: 'Chapter 3: The Science of Living Light',
      text: 'Look into the biophysics of human life. The steady rhythm of your heart, the subtle voltage of your mind across alpha and theta waves, and the warmth of cellular energy. These are the physical truths that ground our digital universe.'
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

  // Gentle ambient harmonic chime (528 Hz transformation frequency)
  function playGentleChime(freq = 528) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.8);
    } catch (e) {
      // AudioContext fallback
    }
  }

  // Select the most soothing, natural voice available
  function getSoothingVoice() {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google') || v.name.includes('Daniel'))) 
      || voices.find(v => v.lang.includes('en')) 
      || voices[0];
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
      statusText.innerHTML = `<i class="fa-solid fa-sparkles text-gold"></i> Story Mode: <strong style="color: var(--accent-gold);">${chapter.title}</strong> (${currentIdx + 1} of ${storyChapters.length})`;
    }

    playGentleChime(currentIdx % 2 === 0 ? 528 : 432);

    const utterance = new SpeechSynthesisUtterance(chapter.text);
    const chosenVoice = getSoothingVoice();
    if (chosenVoice) utterance.voice = chosenVoice;

    // Soothing, calm, storybook pacing
    utterance.rate = 0.88; // Gentle, unhurried pace
    utterance.pitch = 0.95; // Warm, grounded tone

    utterance.onend = () => {
      currentIdx++;
      if (isPlaying) {
        setTimeout(narrateChapter, 700); // Soothing pause between chapters
      }
    };

    utterance.onerror = () => {
      stopStory();
    };

    window.speechSynthesis.speak(utterance);
  }

  function startStory() {
    window.speechSynthesis.cancel();
    isPlaying = true;
    currentIdx = 0;
    if (playBtnText) playBtnText.textContent = 'Listening to Story...';
    if (stopBtn) stopBtn.style.display = 'inline-flex';
    narrateChapter();
  }

  function stopStory() {
    isPlaying = false;
    window.speechSynthesis.cancel();
    document.querySelectorAll('.read-highlight').forEach(el => el.classList.remove('read-highlight'));
    if (playBtnText) playBtnText.textContent = 'Soothing Story Mode';
    if (stopBtn) stopBtn.style.display = 'none';
    if (statusText) statusText.innerHTML = '<i class="fa-solid fa-moon text-gold"></i> Story paused. Ready when you are.';
  }

  if (playBtn) playBtn.addEventListener('click', () => {
    if (isPlaying) stopStory(); else startStory();
  });

  if (stopBtn) stopBtn.addEventListener('click', stopStory);

  // Pre-load voices
  window.speechSynthesis.onvoiceschanged = () => {
    getSoothingVoice();
  };
}
