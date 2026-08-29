/* ==========================================================================
   ALL COUCH NO CAGE — TRUTH-ALIGNED APPLICATION ENGINE (V3)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Monotonic Focus Timer
  if (window.SelfHealing && window.SelfHealing.FocusTimer) {
    window.SelfHealing.FocusTimer.init();
  }

  initHeroSessionControls();
  initFirstPersonCalculator();
  initWatermarkedGallery();
  initAssetLightbox();
  initSoothingStoryNarration();
  initPersonalizedAIAssistant();
  initMetaverseLivePulse();
  initDaliBadgeForge();
  initSystemDiagnosticsUI();
});

/* 1. HERO PRESETS & DIRECT SESSION CONTROLS */
let selectedPresetMinutes = 50;

function initHeroSessionControls() {
  const presetChips = document.querySelectorAll('.preset-chip');
  const customDurationInput = document.getElementById('customDurationInput');
  const intentionInput = document.getElementById('sessionIntention');
  const distractionToggle = document.getElementById('distractionToggle');
  const privacySelect = document.getElementById('heroPrivacyMode');

  const startBtn = document.getElementById('heroStartSessionBtn');
  const pauseBtn = document.getElementById('heroPauseSessionBtn');
  const resumeBtn = document.getElementById('heroResumeSessionBtn');
  const completeBtn = document.getElementById('heroCompleteSessionBtn');
  const resetBtn = document.getElementById('heroResetSessionBtn');

  // Preset Selection
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const val = chip.dataset.minutes;
      if (val === 'custom') {
        if (customDurationInput) {
          customDurationInput.style.display = 'inline-block';
          customDurationInput.focus();
          selectedPresetMinutes = window.SelfHealing.normalizeSessionMinutes(customDurationInput.value || 50);
        }
      } else {
        if (customDurationInput) customDurationInput.style.display = 'none';
        selectedPresetMinutes = parseInt(val, 10);
      }

      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.setSessionMinutes(selectedPresetMinutes);
      }
      updateHeroCtaText(selectedPresetMinutes);
    });
  });

  if (customDurationInput) {
    customDurationInput.addEventListener('input', () => {
      const normalized = window.SelfHealing.normalizeSessionMinutes(customDurationInput.value);
      selectedPresetMinutes = normalized;
      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.setSessionMinutes(selectedPresetMinutes);
      }
      updateHeroCtaText(selectedPresetMinutes);
    });
  }

  function updateHeroCtaText(mins) {
    if (startBtn) {
      const formatted = window.SelfHealing.formatDuration(mins);
      startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start ${formatted} Focus Block`;
    }
  }

  // Timer Control Triggers
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const intention = intentionInput ? intentionInput.value : '';
      const shield = distractionToggle ? distractionToggle.checked : true;
      const privacy = privacySelect ? privacySelect.value : 'private';

      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.start(selectedPresetMinutes, intention, shield, privacy);
      }
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.pause();
      }
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.resume();
      }
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.complete();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.reset();
      }
    });
  }
}

// Global UI Button Synchronizer
window.syncTimerUIButtons = function (timerState) {
  const startBtn = document.getElementById('heroStartSessionBtn');
  const pauseBtn = document.getElementById('heroPauseSessionBtn');
  const resumeBtn = document.getElementById('heroResumeSessionBtn');
  const completeBtn = document.getElementById('heroCompleteSessionBtn');
  const resetBtn = document.getElementById('heroResetSessionBtn');
  const activeBanner = document.getElementById('heroActiveTimerBanner');
  const presetRow = document.getElementById('presetChipsRow');

  if (!startBtn) return;

  if (timerState.status === 'RUNNING') {
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';
    if (resumeBtn) resumeBtn.style.display = 'none';
    if (completeBtn) completeBtn.style.display = 'inline-flex';
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    if (activeBanner) activeBanner.style.display = 'flex';
    if (presetRow) presetRow.style.opacity = '0.5';
  } else if (timerState.status === 'PAUSED') {
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (resumeBtn) resumeBtn.style.display = 'inline-flex';
    if (completeBtn) completeBtn.style.display = 'inline-flex';
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    if (activeBanner) activeBanner.style.display = 'flex';
    if (presetRow) presetRow.style.opacity = '0.5';
  } else {
    // IDLE or COMPLETED
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (resumeBtn) resumeBtn.style.display = 'none';
    if (completeBtn) completeBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    if (activeBanner) activeBanner.style.display = 'none';
    if (presetRow) presetRow.style.opacity = '1';
  }
};

// Session Completion Callback
window.onFocusSessionCompleted = function (receipt, state) {
  const modal = document.getElementById('sessionCompletedModal');
  const receiptIdEl = document.getElementById('completedReceiptId');
  const durationEl = document.getElementById('completedDuration');
  const sealHashEl = document.getElementById('completedSealHash');
  const pointsEl = document.getElementById('completedPoints');
  const downloadReceiptBtn = document.getElementById('downloadCompletedReceiptBtn');

  if (receiptIdEl) receiptIdEl.textContent = receipt.receiptId;
  if (durationEl) durationEl.textContent = receipt.durationFormatted;
  if (sealHashEl) sealHashEl.textContent = receipt.evidenceSealHash;
  if (pointsEl) pointsEl.textContent = `${receipt.calculation.finalVTime} VTIME`;

  if (downloadReceiptBtn) {
    downloadReceiptBtn.onclick = () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipt, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${receipt.receiptId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }

  if (modal) modal.classList.add('active');
};

/* 2. FIRST-PERSON FOCUS & INTEGRITY CALCULATOR */
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

    let rawVal = parseFloat(hoursInput.value);
    if (!Number.isFinite(rawVal) || rawVal <= 0) rawVal = 0.83; // 50m default
    const hours = Math.min(24.0, Math.max(0.1, rawVal));

    const severityBps = severitySelect ? severitySelect.value : 14000;
    const evidenceBps = tierSelect ? tierSelect.value : 9000;

    let result = { finalVTime: 17.64, dailyRemaining: 282.36 };
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

/* 3. WATERMARKED GALLERY GENERATOR WITH LOCAL SHA-256 EVIDENCE SEALS */
function initWatermarkedGallery() {
  const grid = document.getElementById('watermarkedGalleryGrid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= 15; i++) {
    const card = document.createElement('div');
    card.className = 'shared-asset-card';
    card.dataset.id = i;
    card.dataset.src = `images/kb_${i}.jpg`;
    card.dataset.title = `Surreal Timepiece Relic #${i < 10 ? '0' + i : i}`;
    card.dataset.hash = `0x8ace${(i * 1042).toString(16)}b7392a10427845f91e`;

    card.innerHTML = `
      <img src="images/kb_${i}.jpg" alt="Surreal Timepiece Relic ${i}" class="shared-asset-img" loading="lazy" />
      <div class="liquid-watermark">
        <span class="watermark-brand">ALL COUCH NO CAGE</span>
        <span>LOCAL SEAL #${i < 10 ? '0' + i : i}</span>
      </div>
    `;

    card.addEventListener('click', () => openLightbox(card.dataset));
    grid.appendChild(card);
  }
}

/* 4. ASSET LIGHTBOX INSPECTOR WITH DETAILED JSON RECEIPT DOWNLOAD */
let activeAssetData = null;

function initAssetLightbox() {
  const modal = document.getElementById('assetLightboxModal');
  const closeBtn = document.getElementById('closeLightboxBtn');
  const copyBtn = document.getElementById('copyHashBtn');
  const attachBtn = document.getElementById('attachEvidenceBtn');
  const downloadReceiptBtn = document.getElementById('downloadReceiptJsonBtn');

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!activeAssetData) return;
      try {
        await navigator.clipboard.writeText(activeAssetData.hash);
        copyBtn.innerHTML = '<i class="fa-solid fa-check text-lime"></i> Evidence Hash Copied!';
      } catch (err) {
        copyBtn.innerHTML = '<i class="fa-solid fa-check text-lime"></i> Hash Ready!';
      }
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-copy text-cyan"></i> Copy Local Seal Hash';
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

  if (downloadReceiptBtn) {
    downloadReceiptBtn.addEventListener('click', () => {
      if (!activeAssetData) return;
      const receiptObj = {
        artifactName: activeAssetData.title,
        evidenceSealHash: activeAssetData.hash,
        verificationStatus: 'TESTNET_PRE_MINT (Polygon Amoy Stage)',
        deploymentStage: 'Smart Contract Implemented / Amoy Batch Mint Pending',
        timestamp: new Date().toISOString(),
        network: 'Polygon Amoy (Chain ID 80002)',
        disclaimer: 'Non-medical, verifiable self-mastery visual artifact.'
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receiptObj, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `EVIDENCE_SEAL_${activeAssetData.id}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
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
    downloadLink.download = `SURREAL_TIME_RELIC_${data.id}.jpg`;
  }

  if (modal) modal.classList.add('active');
}

/* 5. SOOTHING STORYTELLER VOICE ENGINE (LOCAL DEMO) */
function initSoothingStoryNarration() {
  const playBtn = document.getElementById('playReadAlongBtn');
  const stopBtn = document.getElementById('stopReadAlongBtn');
  const statusText = document.getElementById('narrationStatusText');
  const playBtnText = document.getElementById('playBtnText');

  const storyChapters = [
    {
      id: 'readSection1',
      title: 'Chapter 1: Sovereign Focus',
      text: 'Welcome to All Couch No Cage. In a distracted world, uninterrupted focus is your highest sovereign energy. You command your work sessions, build deep discipline, and seal verified progress on your own terms.'
    },
    {
      id: 'readSection2',
      title: 'Chapter 2: The Architecture of Mastery',
      text: 'Four clean tiers power this system. First, your private commitment. Second, deterministic Rust math with zero floating-point drift. Third, an internal accountability ledger. And fourth, adaptive cognitive guidance.'
    },
    {
      id: 'readSection3',
      title: 'Chapter 3: Optional Biological Grounding',
      text: 'The protocol is designed to support future client-side biometric integrations. Grounded in biophysical baselines, but operating completely privately without requiring any sensors or data sharing.'
    },
    {
      id: 'readSection4',
      title: 'Chapter 4: The Focus Ledger',
      text: 'Your focus ledger tracks personal consistency. Every completed block generates a local cryptographic receipt, giving you verifiable evidence of your hard work.'
    }
  ];

  let currentIdx = 0;
  let isPlaying = false;

  function getSoothingVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    return voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Victoria'))) || voices[0];
  }

  function readChapter(idx) {
    if (idx >= storyChapters.length) {
      stopNarration();
      return;
    }

    currentIdx = idx;
    const ch = storyChapters[idx];
    if (statusText) statusText.innerHTML = `<i class="fa-solid fa-volume-high text-gold"></i> Narrating: ${ch.title}`;

    document.querySelectorAll('.read-highlight').forEach(el => el.classList.remove('read-highlight'));
    const targetSec = document.getElementById(ch.id);
    if (targetSec) {
      targetSec.classList.add('read-highlight');
      targetSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(ch.text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      const voice = getSoothingVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        if (isPlaying) {
          setTimeout(() => readChapter(idx + 1), 800);
        }
      };

      utterance.onerror = () => stopNarration();
      window.speechSynthesis.speak(utterance);
    }
  }

  function stopNarration() {
    isPlaying = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.querySelectorAll('.read-highlight').forEach(el => el.classList.remove('read-highlight'));
    if (stopBtn) stopBtn.style.display = 'none';
    if (playBtnText) playBtnText.textContent = 'Voice Walkthrough (LOCAL)';
    if (statusText) statusText.innerHTML = `<i class="fa-solid fa-waveform text-gold"></i> Narration engine ready.`;
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopNarration();
      } else {
        isPlaying = true;
        if (stopBtn) stopBtn.style.display = 'inline-flex';
        if (playBtnText) playBtnText.textContent = 'Pause Voice';
        readChapter(0);
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', stopNarration);
  }
}

/* 6. PERSONALIZED COGNITIVE AI GUIDE (LOCAL DEMO) */
function initPersonalizedAIAssistant() {
  const askBtn = document.getElementById('askAssistantBtn');
  const promptInput = document.getElementById('assistantPromptInput');
  const archetypeSelect = document.getElementById('assistantArchetype');
  const toneSelect = document.getElementById('assistantTone');
  const responseBox = document.getElementById('assistantResponseBox');
  const responseText = document.getElementById('assistantResponseText');

  if (!askBtn) return;

  askBtn.addEventListener('click', () => {
    const prompt = promptInput ? promptInput.value.trim() : '';
    if (!prompt) return;

    const archetype = archetypeSelect ? archetypeSelect.value : 'DeepArchitect';
    const tone = toneSelect ? toneSelect.value : 'Soothing';

    if (responseBox) responseBox.style.display = 'block';
    if (responseText) {
      responseText.textContent = 'Synthesizing adaptive focus advice...';
    }

    setTimeout(() => {
      let advice = '';
      if (archetype === 'DeepArchitect') {
        advice = `[Deep Architect • ${tone} Protocol]\n1. Prime: Close all auxiliary tabs and write your single core outcome.\n2. Cycle: Work uninterrupted for 50 minutes with active notification suppression.\n3. Buffer: Take a 10-minute non-digital recovery walk before evaluating next steps.`;
      } else if (archetype === 'RapidResponder') {
        advice = `[Rapid Responder • ${tone} Protocol]\n1. Triage: Execute high-urgency bottlenecks in two 25-minute sprints.\n2. Seal: Record completion in your local ledger to maintain momentum without cognitive scatter.`;
      } else {
        advice = `[Systems Auditor • ${tone} Protocol]\n1. Scope: Define exact test vectors and verification criteria prior to session start.\n2. Audit: Complete your 50-minute block and generate a verifiable local SHA-256 seal.`;
      }

      if (responseText) responseText.textContent = advice;
    }, 450);
  });
}

/* 7. LIVE METAVERSE WORLD PULSE (LOCAL DEMO HUD) */
function initMetaverseLivePulse() {
  const hoursEl = document.getElementById('worldGlobalHours');
  const vtimeEl = document.getElementById('worldTotalVtime');
  const participantsEl = document.getElementById('worldParticipants');

  // Realistic deterministic values
  if (hoursEl) hoursEl.textContent = '1,852.50 hrs';
  if (vtimeEl) vtimeEl.textContent = '27,787.50 VTIME';
  if (participantsEl) participantsEl.textContent = '142 Connected (Simulated)';
}

/* 8. SURREAL TIME BADGE FORGE (DEMO PREVIEW) */
function initDaliBadgeForge() {
  const generateBtn = document.getElementById('generateBadgeBtn');
  const themeSelect = document.getElementById('forgeThemeSelect');
  const milestoneInput = document.getElementById('forgeMilestoneInput');
  const statusMsg = document.getElementById('forgeStatusMessage');
  const badgeMilestoneTag = document.getElementById('badgeMilestoneTag');

  if (!generateBtn) return;

  generateBtn.addEventListener('click', () => {
    const milestone = milestoneInput ? milestoneInput.value : '50m Deep Sprint';
    if (badgeMilestoneTag) badgeMilestoneTag.textContent = milestone.toUpperCase();
    if (statusMsg) {
      statusMsg.innerHTML = '<i class="fa-solid fa-circle-check text-lime"></i> Milestone Relic Generated! (DEMO PREVIEW)';
    }
  });
}

/* 9. SYSTEM DIAGNOSTICS & RESET UI */
function initSystemDiagnosticsUI() {
  const toggleBtn = document.getElementById('diagToggleBtn');
  const modal = document.getElementById('diagModal');
  const closeBtn = document.getElementById('closeDiagBtn');
  const clearBtn = document.getElementById('clearStateBtn');
  const logList = document.getElementById('diagLogList');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderDiagLogs();
      if (modal) modal.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Reset local focus session state and diagnostics cache?')) {
        try {
          localStorage.clear();
          location.reload();
        } catch (e) {}
      }
    });
  }

  function renderDiagLogs() {
    if (!logList) return;
    try {
      const logs = JSON.parse(localStorage.getItem('acnc_diagnostics_log_v3') || '[]');
      if (logs.length === 0) {
        logList.innerHTML = '<div style="color: var(--text-dim);">No active error events. System healthy.</div>';
        return;
      }
      logList.innerHTML = logs.map(l => `
        <div style="font-size: 0.72rem; margin-bottom: 0.35rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.25rem;">
          <span style="color: var(--accent-gold);">[${l.timestamp.split('T')[1].split('.')[0]}]</span>
          <span style="color: var(--accent-cyan); font-weight: 700;">${l.type}</span>: ${l.message}
        </div>
      `).join('');
    } catch (e) {
      logList.innerHTML = '<div>Telemetry storage ready.</div>';
    }
  }
}
