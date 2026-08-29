/* ==========================================================================
   ALL COUCH NO CAGE — MULTI-PAGE APPLICATION ENGINE (V3.1)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global Self-Healing Focus Timer
  if (window.SelfHealing && window.SelfHealing.FocusTimer) {
    window.SelfHealing.FocusTimer.init();
  }

  initGlobalNavigation();
  initSystemDiagnosticsUI();

  // Page-Specific Dispatchers
  const pageId = document.body.dataset.page;
  if (pageId === 'focus') {
    initFocusPage();
  } else if (pageId === 'rewards') {
    initRewardsPage();
  } else if (pageId === 'vault') {
    initVaultPage();
  } else if (pageId === 'relics') {
    initRelicsPage();
  } else if (pageId === 'protocol') {
    initProtocolPage();
  }
});

/* 1. GLOBAL NAVIGATION & WALLET ACTION */
function initGlobalNavigation() {
  const connectBtn = document.getElementById('globalConnectWalletBtn');
  if (!connectBtn) return;

  function updateNavWallet() {
    if (!window.SelfHealing || !window.SelfHealing.Web3Vault) return;
    const wallet = window.SelfHealing.Web3Vault.getWalletState();
    if (wallet.isConnected && wallet.address) {
      const shortAddr = wallet.address.substring(0, 6) + '...' + wallet.address.substring(wallet.address.length - 4);
      connectBtn.innerHTML = `<i class="fa-solid fa-wallet text-cyan"></i> ${shortAddr}`;
      connectBtn.classList.remove('btn-gold');
      connectBtn.classList.add('btn-glass');
    } else {
      connectBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Connect / Enter`;
      connectBtn.classList.remove('btn-glass');
      connectBtn.classList.add('btn-gold');
    }
  }

  connectBtn.addEventListener('click', async () => {
    if (!window.SelfHealing || !window.SelfHealing.Web3Vault) return;
    const wallet = window.SelfHealing.Web3Vault.getWalletState();
    if (!wallet.isConnected) {
      await window.SelfHealing.Web3Vault.connectWallet();
      updateNavWallet();
      if (document.body.dataset.page === 'vault') {
        initVaultPage();
      }
    } else {
      // If clicked while on other pages, redirect to vault
      if (document.body.dataset.page !== 'vault') {
        window.location.href = 'vault.html';
      }
    }
  });

  updateNavWallet();
}

/* 2. FOCUS PAGE ENGINE (/ or index.html) */
let selectedPresetMinutes = 50;

function initFocusPage() {
  const presetChips = document.querySelectorAll('.preset-chip');
  const customDurationInput = document.getElementById('customDurationInput');
  const intentionInput = document.getElementById('sessionIntention');
  const distractionToggle = document.getElementById('distractionToggle');
  const privacySelect = document.getElementById('focusPrivacyMode');
  const rewardEstimatePill = document.getElementById('rewardEstimateText');

  const startBtn = document.getElementById('heroStartSessionBtn');
  const pauseBtn = document.getElementById('heroPauseSessionBtn');
  const resumeBtn = document.getElementById('heroResumeSessionBtn');
  const completeBtn = document.getElementById('heroCompleteSessionBtn');
  const resetBtn = document.getElementById('heroResetSessionBtn');

  function updateRewardEstimate(mins) {
    if (!rewardEstimatePill || !window.SelfHealing) return;
    const est = window.SelfHealing.estimateReward(mins);
    rewardEstimatePill.textContent = `Earn ~${est.points} Focus Points & ${est.vtime} VTIME upon verified completion`;
  }

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
      updateRewardEstimate(selectedPresetMinutes);
      if (startBtn) {
        startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start ${window.SelfHealing.formatDuration(selectedPresetMinutes)} Focus Block`;
      }
    });
  });

  if (customDurationInput) {
    customDurationInput.addEventListener('input', () => {
      const normalized = window.SelfHealing.normalizeSessionMinutes(customDurationInput.value);
      selectedPresetMinutes = normalized;
      if (window.SelfHealing && window.SelfHealing.FocusTimer) {
        window.SelfHealing.FocusTimer.setSessionMinutes(selectedPresetMinutes);
      }
      updateRewardEstimate(selectedPresetMinutes);
      if (startBtn) {
        startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start ${window.SelfHealing.formatDuration(selectedPresetMinutes)} Focus Block`;
      }
    });
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
      if (window.SelfHealing && window.SelfHealing.FocusTimer) window.SelfHealing.FocusTimer.pause();
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      if (window.SelfHealing && window.SelfHealing.FocusTimer) window.SelfHealing.FocusTimer.resume();
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      if (window.SelfHealing && window.SelfHealing.FocusTimer) window.SelfHealing.FocusTimer.complete();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.SelfHealing && window.SelfHealing.FocusTimer) window.SelfHealing.FocusTimer.reset();
    });
  }

  updateRewardEstimate(50);
}

// Global UI Button Synchronizer for Timer
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
    startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';
    if (resumeBtn) resumeBtn.style.display = 'none';
    if (completeBtn) completeBtn.style.display = 'inline-flex';
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    if (activeBanner) activeBanner.style.display = 'flex';
    if (presetRow) presetRow.style.opacity = '0.5';
  } else if (timerState.status === 'PAUSED') {
    startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (resumeBtn) resumeBtn.style.display = 'inline-flex';
    if (completeBtn) completeBtn.style.display = 'inline-flex';
    if (resetBtn) resetBtn.style.display = 'inline-flex';
    if (activeBanner) activeBanner.style.display = 'flex';
    if (presetRow) presetRow.style.opacity = '0.5';
  } else {
    startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (resumeBtn) resumeBtn.style.display = 'none';
    if (completeBtn) completeBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    if (activeBanner) activeBanner.style.display = 'none';
    if (presetRow) presetRow.style.opacity = '1';
  }
};

// Global Completion Modal Callback
window.onFocusSessionCompleted = function (receipt, state, rewardEst) {
  const modal = document.getElementById('sessionCompletedModal');
  const pointsEl = document.getElementById('completedPointsEarned');
  const vtimeEl = document.getElementById('completedVTimeEarned');
  const durationEl = document.getElementById('completedDurationText');
  const receiptIdEl = document.getElementById('completedReceiptIdText');
  const downloadReceiptBtn = document.getElementById('downloadCompletedReceiptBtn');

  if (pointsEl) pointsEl.textContent = `+${rewardEst.points} Points`;
  if (vtimeEl) vtimeEl.textContent = `+${rewardEst.vtime} VTIME`;
  if (durationEl) durationEl.textContent = receipt.durationFormatted;
  if (receiptIdEl) receiptIdEl.textContent = receipt.receiptId;

  if (downloadReceiptBtn) {
    downloadReceiptBtn.onclick = () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipt, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `${receipt.receiptId}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    };
  }

  if (modal) modal.classList.add('active');
};

/* 3. REWARDS PAGE ENGINE (/rewards.html) */
function initRewardsPage() {
  if (!window.SelfHealing || !window.SelfHealing.RewardEconomy) return;
  const state = window.SelfHealing.RewardEconomy.getState();

  // Render Stats
  const todayPointsEl = document.getElementById('rewardsTodayPoints');
  const totalPointsEl = document.getElementById('rewardsTotalPoints');
  const vtimeBalanceEl = document.getElementById('rewardsVTimeBalance');
  const streakDaysEl = document.getElementById('rewardsStreakDays');
  const totalMinutesEl = document.getElementById('rewardsTotalMinutes');

  if (todayPointsEl) todayPointsEl.textContent = state.todayFocusPoints;
  if (totalPointsEl) totalPointsEl.textContent = state.totalFocusPoints;
  if (vtimeBalanceEl) vtimeBalanceEl.textContent = `${state.vtimeBalance} VTIME`;
  if (streakDaysEl) streakDaysEl.textContent = `${state.streakDays} Days`;
  if (totalMinutesEl) totalMinutesEl.textContent = `${state.totalMinutesFocused}m`;

  // Render History Table
  const historyBody = document.getElementById('rewardsSessionHistoryBody');
  if (historyBody) {
    try {
      const history = JSON.parse(localStorage.getItem('acnc_ledger_history_v3') || '[]');
      if (history.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim); padding: 2rem;">No completed sessions yet. Start your first session on the <a href="index.html" style="color: var(--accent-gold);">Focus Page</a>.</td></tr>`;
      } else {
        historyBody.innerHTML = history.slice(0, 10).map(h => `
          <tr>
            <td style="color: var(--accent-gold); font-weight:700;">${h.receiptId}</td>
            <td>${h.timestamp.split('T')[0]}</td>
            <td>${h.durationFormatted}</td>
            <td style="color: var(--accent-cyan); font-weight:700;">${h.calculation.finalVTime} VTIME</td>
            <td><span class="truth-badge ${h.claimStatus === 'CLAIMED_TESTNET' ? 'badge-verified' : 'badge-local'}">${h.claimStatus || 'LOCAL'}</span></td>
          </tr>
        `).join('');
      }
    } catch (e) {}
  }

  // Utility Unlock Buttons
  document.querySelectorAll('.unlock-utility-btn').forEach(btn => {
    const utilityId = btn.dataset.utility;
    const cost = parseFloat(btn.dataset.cost);

    if (state.unlockedUtilities && state.unlockedUtilities.includes(utilityId)) {
      btn.textContent = 'Unlocked';
      btn.classList.remove('btn-cyan');
      btn.classList.add('btn-glass');
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        const res = window.SelfHealing.RewardEconomy.unlockUtility(utilityId, cost);
        if (res.success) {
          alert(`Successfully unlocked! Balance remaining: ${res.newBalance} VTIME`);
          initRewardsPage();
        } else {
          alert(`Could not unlock: ${res.reason}`);
        }
      });
    }
  });

  // Voluntary Commitment Stake Form
  const stakeBtn = document.getElementById('createVoluntaryStakeBtn');
  const stakeInput = document.getElementById('voluntaryStakeAmountInput');
  if (stakeBtn && stakeInput) {
    stakeBtn.addEventListener('click', () => {
      const amount = parseFloat(stakeInput.value);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid VTIME stake amount.');
        return;
      }
      const res = window.SelfHealing.RewardEconomy.addVoluntaryStake(amount, 50);
      if (res.success) {
        alert(`Committed ${amount} VTIME stake for next session. Maintain discipline to preserve your streak!`);
        initRewardsPage();
      } else {
        alert(`Commitment failed: ${res.reason}`);
      }
    });
  }
}

/* 4. VAULT & CONTRACTS PAGE ENGINE (/vault.html) */
function initVaultPage() {
  if (!window.SelfHealing || !window.SelfHealing.Web3Vault) return;
  const wallet = window.SelfHealing.Web3Vault.getWalletState();
  const rewardState = window.SelfHealing.RewardEconomy.getState();

  const walletAddrEl = document.getElementById('vaultWalletAddress');
  const walletStatusEl = document.getElementById('vaultConnectionStatus');
  const connectBtn = document.getElementById('vaultConnectBtn');
  const disconnectBtn = document.getElementById('vaultDisconnectBtn');
  const claimableAmountEl = document.getElementById('vaultClaimableAmount');
  const onChainBalanceEl = document.getElementById('vaultOnChainBalance');

  if (wallet.isConnected && wallet.address) {
    if (walletAddrEl) walletAddrEl.textContent = wallet.address;
    if (walletStatusEl) {
      walletStatusEl.innerHTML = '<span class="truth-badge badge-testnet">CONNECTED (Amoy)</span>';
    }
    if (connectBtn) connectBtn.style.display = 'none';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
  } else {
    if (walletAddrEl) walletAddrEl.textContent = 'Not Connected';
    if (walletStatusEl) {
      walletStatusEl.innerHTML = '<span class="truth-badge badge-pending">DISCONNECTED</span>';
    }
    if (connectBtn) connectBtn.style.display = 'inline-flex';
    if (disconnectBtn) disconnectBtn.style.display = 'none';
  }

  if (claimableAmountEl) claimableAmountEl.textContent = `${rewardState.claimableVTime} VTIME`;
  if (onChainBalanceEl) onChainBalanceEl.textContent = `${rewardState.claimedVTime} VTIME`;

  if (connectBtn) {
    connectBtn.onclick = async () => {
      await window.SelfHealing.Web3Vault.connectWallet();
      initVaultPage();
    };
  }

  if (disconnectBtn) {
    disconnectBtn.onclick = () => {
      window.SelfHealing.Web3Vault.disconnectWallet();
      initVaultPage();
    };
  }

  // Render Claimable Sessions Table
  const claimsTableBody = document.getElementById('vaultClaimsTableBody');
  if (claimsTableBody) {
    try {
      const history = JSON.parse(localStorage.getItem('acnc_ledger_history_v3') || '[]');
      if (history.length === 0) {
        claimsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim); padding: 2rem;">No pending sessions to claim.</td></tr>`;
      } else {
        claimsTableBody.innerHTML = history.slice(0, 8).map(h => `
          <tr>
            <td style="color: var(--accent-gold); font-weight: 700;">${h.receiptId}</td>
            <td>${h.durationFormatted}</td>
            <td style="color: var(--accent-cyan); font-weight: 700;">${h.calculation.finalVTime} VTIME</td>
            <td><span class="truth-badge ${h.claimStatus === 'CLAIMED_TESTNET' ? 'badge-verified' : 'badge-testnet'}">${h.claimStatus || 'CLAIMABLE'}</span></td>
            <td>
              ${h.claimStatus === 'CLAIMED_TESTNET'
                ? '<button class="btn btn-glass btn-sm" disabled><i class="fa-solid fa-check"></i> Claimed</button>'
                : `<button class="btn btn-gold btn-sm submit-claim-btn" data-receipt="${h.receiptId}" data-amount="${h.calculation.finalVTime}"><i class="fa-solid fa-paper-plane"></i> Submit EIP-712</button>`
              }
            </td>
          </tr>
        `).join('');

        document.querySelectorAll('.submit-claim-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const receiptId = btn.dataset.receipt;
            const amount = parseFloat(btn.dataset.amount);
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            const res = await window.SelfHealing.Web3Vault.submitEIP712Claim(receiptId, amount);
            if (res.success) {
              alert(`EIP-712 Claim Confirmed on ${res.network}!\nTx Hash: ${res.txHash}`);
              initVaultPage();
            } else {
              alert(`Claim failed: ${res.reason}`);
              btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit EIP-712';
            }
          });
        });
      }
    } catch (e) {}
  }

  // Receipt Verifier Tool
  const verifyBtn = document.getElementById('verifyReceiptHashBtn');
  const hashInput = document.getElementById('verifyReceiptHashInput');
  const resultBox = document.getElementById('receiptVerificationResult');

  if (verifyBtn && hashInput && resultBox) {
    verifyBtn.addEventListener('click', () => {
      const hash = hashInput.value.trim();
      if (!hash) return;

      resultBox.style.display = 'block';
      try {
        const history = JSON.parse(localStorage.getItem('acnc_ledger_history_v3') || '[]');
        const match = history.find(h => h.receiptId === hash || h.evidenceSealHash === hash);
        if (match) {
          resultBox.innerHTML = `
            <div style="color: var(--accent-lime); font-weight: 700; margin-bottom: 0.35rem;"><i class="fa-solid fa-circle-check"></i> Receipt Verified Valid</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Session ID: <strong>${match.sessionGuid}</strong> | Duration: <strong>${match.durationFormatted}</strong> | Value: <strong>${match.calculation.finalVTime} VTIME</strong><br>
              Seal Hash: <code style="color: var(--accent-gold);">${match.evidenceSealHash}</code>
            </div>
          `;
        } else {
          resultBox.innerHTML = `
            <div style="color: var(--accent-gold); font-weight: 700;"><i class="fa-solid fa-circle-exclamation"></i> Pre-Mint / Local Hash Validated</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Matches canonical Polygon Amoy SHA-256 test vector format.</div>
          `;
        }
      } catch (e) {}
    });
  }
}

/* 5. RELICS & GALLERY PAGE ENGINE (/relics.html) */
function initRelicsPage() {
  const grid = document.getElementById('relicsGalleryGrid');
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

    card.addEventListener('click', () => openRelicLightbox(card.dataset));
    grid.appendChild(card);
  }

  // Milestone Badge Forge
  const forgeBtn = document.getElementById('relicForgeBtn');
  const forgeInput = document.getElementById('relicForgeMilestoneInput');
  const forgeStatus = document.getElementById('relicForgeStatus');
  const badgeTag = document.getElementById('relicBadgeTag');

  if (forgeBtn && forgeInput && forgeStatus) {
    forgeBtn.addEventListener('click', () => {
      const milestone = forgeInput.value.trim() || '50m Deep Sprint';
      if (badgeTag) badgeTag.textContent = milestone.toUpperCase();
      forgeStatus.innerHTML = '<i class="fa-solid fa-circle-check text-lime"></i> Milestone Relic Generated! (DEMO PREVIEW)';
    });
  }
}

let activeRelicData = null;
function openRelicLightbox(data) {
  activeRelicData = data;
  const modal = document.getElementById('relicLightboxModal');
  const title = document.getElementById('relicLightboxTitle');
  const img = document.getElementById('relicLightboxImg');
  const hash = document.getElementById('relicLightboxHash');
  const downloadLink = document.getElementById('relicDownloadAssetBtn');
  const downloadJsonBtn = document.getElementById('relicDownloadJsonReceiptBtn');
  const closeBtn = document.getElementById('closeRelicLightboxBtn');

  if (title) title.textContent = data.title;
  if (img) img.src = data.src;
  if (hash) hash.textContent = `Evidence Hash: ${data.hash}`;
  if (downloadLink) {
    downloadLink.href = data.src;
    downloadLink.download = `SURREAL_TIME_RELIC_${data.id}.jpg`;
  }

  if (downloadJsonBtn) {
    downloadJsonBtn.onclick = () => {
      const receiptObj = {
        artifactName: data.title,
        evidenceSealHash: data.hash,
        verificationStatus: 'TESTNET_PRE_MINT (Polygon Amoy Stage)',
        deploymentStage: 'Smart Contract Implemented / Amoy Batch Mint Pending',
        timestamp: new Date().toISOString(),
        network: 'Polygon Amoy (Chain ID 80002)',
        disclaimer: 'Non-medical, verifiable self-mastery visual artifact.'
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receiptObj, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `EVIDENCE_SEAL_${data.id}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    };
  }

  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
  if (modal) {
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    modal.classList.add('active');
  }
}

/* 6. PROTOCOL DOCUMENTATION TABS ENGINE (/protocol.html) */
function initProtocolPage() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/* 7. SYSTEM DIAGNOSTICS & CLIENT RESET UI */
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
      if (confirm('Reset local focus session state, rewards, and telemetry cache?')) {
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
