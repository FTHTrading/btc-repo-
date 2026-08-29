/* ==========================================================================
   ALL COUCH NO CAGE — MULTI-PAGE APPLICATION CONTROLLER (V4.0)
   Truth-Aligned Focus Engine & Verified Lifecycle Ledger
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (window.ACNC && window.ACNC.FocusTimer) {
    window.ACNC.FocusTimer.init();
  }

  initGlobalNavigation();

  // Page-Specific Dispatchers
  const pageId = document.body.dataset.page;
  switch (pageId) {
    case 'focus':
      initFocusPage();
      break;
    case 'rewards':
      initRewardsPage();
      break;
    case 'impact':
      initImpactPage();
      break;
    case 'vault':
      initVaultPage();
      break;
    case 'relics':
      initRelicsPage();
      break;
    case 'protocol':
      initProtocolPage();
      break;
  }
});

/* ==========================================================================
   1. GLOBAL NAVIGATION & WALLET STATE
   ========================================================================== */
function initGlobalNavigation() {
  const connectBtn = document.getElementById('globalConnectWalletBtn');
  if (!connectBtn || !window.ACNC) return;

  function updateNavWallet() {
    const wallet = window.ACNC.Web3Vault.getWalletState();
    if (wallet.isConnected && wallet.address) {
      const shortAddr = wallet.address.substring(0, 6) + '...' + wallet.address.substring(wallet.address.length - 4);
      connectBtn.innerHTML = `<i class="fa-solid fa-wallet text-cyan"></i> ${shortAddr}`;
      connectBtn.classList.remove('btn-gold');
      connectBtn.classList.add('btn-glass');
    } else {
      connectBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Connect Wallet`;
      connectBtn.classList.remove('btn-glass');
      connectBtn.classList.add('btn-gold');
    }
  }

  connectBtn.addEventListener('click', async () => {
    const wallet = window.ACNC.Web3Vault.getWalletState();
    if (!wallet.isConnected) {
      await window.ACNC.Web3Vault.connectWallet();
      updateNavWallet();
      if (document.body.dataset.page === 'vault') {
        initVaultPage();
      }
    } else {
      if (document.body.dataset.page !== 'vault') {
        window.location.href = 'vault.html';
      }
    }
  });

  updateNavWallet();
}

/* ==========================================================================
   2. FOCUS PAGE CONTROLLER (/ or index.html)
   ========================================================================== */
function initFocusPage() {
  if (!window.ACNC) return;

  const presetChips = document.querySelectorAll('.preset-chip');
  const customDurationInput = document.getElementById('customDurationInput');
  const intentionInput = document.getElementById('sessionIntention');
  const rewardEstimatePill = document.getElementById('rewardEstimateText');

  const startBtn = document.getElementById('heroStartSessionBtn');
  const pauseBtn = document.getElementById('heroPauseSessionBtn');
  const resumeBtn = document.getElementById('heroResumeSessionBtn');
  const completeBtn = document.getElementById('heroCompleteSessionBtn');
  const resetBtn = document.getElementById('heroResetSessionBtn');
  const timerDigits = document.getElementById('heroTimerCountdown');
  const timerBanner = document.getElementById('heroActiveTimerBanner');

  const completedModal = document.getElementById('sessionCompletedModal');
  const completedPointsEl = document.getElementById('completedPointsEarned');
  const completedVTimeEl = document.getElementById('completedVTimeEarned');
  const completedDurationEl = document.getElementById('completedDurationText');
  const completedReceiptEl = document.getElementById('completedReceiptIdText');
  const downloadReceiptBtn = document.getElementById('downloadCompletedReceiptBtn');

  let selectedMins = 50;

  function updateRewardEstimate(mins) {
    if (!rewardEstimatePill || !window.SelfHealing) return;
    const est = window.SelfHealing.estimateReward(mins);
    rewardEstimatePill.textContent = `Earn ~${est.points} Focus Points & ${est.vtime} VTIME upon verified completion`;
  }

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.dataset.minutes;
      if (val === 'custom') {
        if (customDurationInput) {
          customDurationInput.style.display = 'inline-block';
          selectedMins = Number(customDurationInput.value) || 50;
        }
      } else {
        if (customDurationInput) customDurationInput.style.display = 'none';
        selectedMins = Number(val) || 50;
      }
      updateRewardEstimate(selectedMins);
      if (startBtn) startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start ${selectedMins}m Focus Block`;
    });
  });

  if (customDurationInput) {
    customDurationInput.addEventListener('input', () => {
      selectedMins = Number(customDurationInput.value) || 50;
      updateRewardEstimate(selectedMins);
      if (startBtn) startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start ${selectedMins}m Focus Block`;
    });
  }

  function updateTimerUI() {
    const timer = window.ACNC.FocusTimer;
    const status = timer.state.status;
    const remainingSecs = timer.getRemainingSeconds();

    const hrs = Math.floor(remainingSecs / 3600);
    const mins = Math.floor((remainingSecs % 3600) / 60);
    const secs = remainingSecs % 60;
    if (timerDigits) {
      timerDigits.textContent = hrs > 0
        ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (status === 'RUNNING') {
      if (timerBanner) timerBanner.style.display = 'flex';
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';
      if (resumeBtn) resumeBtn.style.display = 'none';
      if (completeBtn) completeBtn.style.display = 'inline-flex';
      if (resetBtn) resetBtn.style.display = 'inline-flex';
    } else if (status === 'PAUSED') {
      if (timerBanner) timerBanner.style.display = 'flex';
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (resumeBtn) resumeBtn.style.display = 'inline-flex';
      if (completeBtn) completeBtn.style.display = 'inline-flex';
      if (resetBtn) resetBtn.style.display = 'inline-flex';
    } else {
      if (timerBanner) timerBanner.style.display = 'none';
      if (startBtn) startBtn.style.display = 'inline-flex';
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (resumeBtn) resumeBtn.style.display = 'none';
      if (completeBtn) completeBtn.style.display = 'none';
      if (resetBtn) resetBtn.style.display = 'none';
    }
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const intention = intentionInput ? intentionInput.value : '';
      window.ACNC.FocusTimer.start(selectedMins, intention, 'private');
      updateTimerUI();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      window.ACNC.FocusTimer.pause();
      updateTimerUI();
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      window.ACNC.FocusTimer.resume();
      updateTimerUI();
    });
  }

  let latestCompletedRecord = null;

  if (completeBtn) {
    completeBtn.addEventListener('click', async () => {
      const record = await window.ACNC.FocusTimer.complete();
      latestCompletedRecord = record;
      updateTimerUI();

      if (completedModal) {
        if (completedPointsEl) completedPointsEl.textContent = `+${record.points_earned} Points`;
        if (completedVTimeEl) completedVTimeEl.textContent = `+${record.vtime_base} VTIME`;
        if (completedDurationEl) completedDurationEl.textContent = `${record.duration_minutes}m`;
        if (completedReceiptEl) completedReceiptEl.textContent = record.receipt_id;
        completedModal.classList.add('active');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.ACNC.FocusTimer.reset();
      updateTimerUI();
    });
  }

  if (downloadReceiptBtn) {
    downloadReceiptBtn.addEventListener('click', () => {
      if (!latestCompletedRecord) return;
      const jsonStr = JSON.stringify(latestCompletedRecord, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${latestCompletedRecord.receipt_id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  setInterval(updateTimerUI, 1000);
  updateTimerUI();
}

/* ==========================================================================
   3. REWARDS PAGE CONTROLLER (/rewards.html)
   ========================================================================== */
function initRewardsPage() {
  if (!window.ACNC) return;

  const summary = window.ACNC.Ledger.getLedgerSummary();
  const focusSessions = window.ACNC.Ledger.getFocusSessions();

  const todayPtsEl = document.getElementById('rewardsTodayPoints');
  const totalPtsEl = document.getElementById('rewardsTotalPoints');
  const vtimeEl = document.getElementById('rewardsVTimeBalance');
  const streakEl = document.getElementById('rewardsStreakDays');
  const sessionLedgerBody = document.getElementById('sessionLedgerBody');
  const emptyNotice = document.getElementById('sessionLedgerEmptyNotice');

  if (todayPtsEl) todayPtsEl.textContent = summary.todayPoints;
  if (totalPtsEl) totalPtsEl.textContent = summary.totalPoints;
  if (vtimeEl) vtimeEl.textContent = `${summary.eligibleVTime.toFixed(2)} VTIME`;
  if (streakEl) streakEl.textContent = summary.focusStreak;

  if (sessionLedgerBody) {
    if (focusSessions.length === 0) {
      sessionLedgerBody.innerHTML = '';
      if (emptyNotice) emptyNotice.style.display = 'block';
    } else {
      if (emptyNotice) emptyNotice.style.display = 'none';
      sessionLedgerBody.innerHTML = focusSessions.map(f => {
        return `
          <tr>
            <td><strong class="text-gold">${f.receipt_id}</strong></td>
            <td>${f.duration_minutes}m</td>
            <td style="color: var(--text-muted);">${f.intention || 'Focus session'}</td>
            <td><strong class="text-lime">+${f.points_earned} Pts</strong></td>
            <td><strong class="text-cyan">+${f.vtime_base} VTIME</strong></td>
            <td><span class="status-badge status-receipt-backed">${f.data_status}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-glass btn-sm" onclick="window.deleteFocusReceipt('${f.receipt_id}')">
                <i class="fa-solid fa-trash-can text-flame"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  window.deleteFocusReceipt = (id) => {
    window.ACNC.Ledger.deleteRecord('focus', id);
    initRewardsPage();
  };
}

/* ==========================================================================
   4. IMPACT PAGE CONTROLLER (/impact.html)
   ========================================================================== */
function initImpactPage() {
  if (!window.ACNC) return;

  const domainSelect = document.getElementById('impactDomainSelect');
  const qtyInput = document.getElementById('impactQuantityInput');
  const proofSelect = document.getElementById('impactProofLevelSelect');
  const calculatedCo2El = document.getElementById('impactCalculatedCo2');
  const addRecordBtn = document.getElementById('impactAddRecordBtn');

  const reductionTypeSelect = document.getElementById('reductionTypeSelect');
  const reductionQtyInput = document.getElementById('reductionQtyInput');
  const logReductionBtn = document.getElementById('impactLogReductionBtn');
  const reductionAvoidedCo2El = document.getElementById('reductionAvoidedCo2');
  const reductionEarnedPtsEl = document.getElementById('reductionEarnedPts');

  const offsetRegistrySelect = document.getElementById('offsetRegistrySelect');
  const offsetSerialInput = document.getElementById('offsetSerialInput');
  const retireOffsetBtn = document.getElementById('impactRetireOffsetBtn');

  const tableBody = document.getElementById('impactLedgerTableBody');
  const emptyNotice = document.getElementById('impactLedgerEmptyNotice');
  const exportBtn = document.getElementById('exportImpactLedgerBtn');

  function updateCo2Calc() {
    if (!domainSelect || !qtyInput || !calculatedCo2El) return;
    const domain = domainSelect.value;
    const qty = Number(qtyInput.value) || 0;
    const factorObj = window.ACNC.FACTORS[domain];
    if (factorObj) {
      const co2 = qty * factorObj.factor;
      calculatedCo2El.textContent = `${co2.toFixed(2)} kg`;
    }
  }

  if (domainSelect) domainSelect.addEventListener('change', updateCo2Calc);
  if (qtyInput) qtyInput.addEventListener('input', updateCo2Calc);
  updateCo2Calc();

  function updateReductionCalc() {
    if (!reductionTypeSelect || !reductionQtyInput || !reductionAvoidedCo2El) return;
    const type = reductionTypeSelect.value;
    const qty = Number(reductionQtyInput.value) || 0;
    let avoided = 0;
    if (type === 'electricity_saving') avoided = qty * 0.385;
    else if (type === 'transit_substitution') avoided = qty * 0.404;
    else if (type === 'hardware_repair') avoided = qty * 4.50;

    const pts = Math.round(avoided * 2.5);
    reductionAvoidedCo2El.textContent = `${avoided.toFixed(2)} kg CO2e`;
    if (reductionEarnedPtsEl) reductionEarnedPtsEl.textContent = `+${pts} Impact Pts`;
  }

  if (reductionTypeSelect) reductionTypeSelect.addEventListener('change', updateReductionCalc);
  if (reductionQtyInput) reductionQtyInput.addEventListener('input', updateReductionCalc);
  updateReductionCalc();

  if (addRecordBtn) {
    addRecordBtn.addEventListener('click', async () => {
      const domain = domainSelect.value;
      const qty = Number(qtyInput.value) || 0;
      const status = proofSelect.value;
      const factorObj = window.ACNC.FACTORS[domain];
      const co2 = factorObj ? qty * factorObj.factor : 0;

      await window.ACNC.Ledger.addActivity({
        category: domain.startsWith('transit_') ? 'transportation' : 'home_energy',
        sub_category: domain,
        quantity: qty,
        unit: factorObj ? factorObj.unit : '',
        data_status: status,
        co2e_kg_estimate: parseFloat(co2.toFixed(2))
      });

      renderImpactLedger();
      alert('Activity recorded to local ledger.');
    });
  }

  if (logReductionBtn) {
    logReductionBtn.addEventListener('click', async () => {
      const type = reductionTypeSelect.value;
      const qty = Number(reductionQtyInput.value) || 0;
      let avoided = 0;
      if (type === 'electricity_saving') avoided = qty * 0.385;
      else if (type === 'transit_substitution') avoided = qty * 0.404;
      else if (type === 'hardware_repair') avoided = qty * 4.50;

      await window.ACNC.Ledger.addReduction({
        title: type.replace(/_/g, ' ').toUpperCase(),
        quantity: qty,
        co2e_reduced_kg: parseFloat(avoided.toFixed(2)),
        data_status: 'RECEIPT_BACKED'
      });

      renderImpactLedger();
      alert('Verified reduction recorded.');
    });
  }

  if (retireOffsetBtn) {
    retireOffsetBtn.addEventListener('click', async () => {
      const registry = offsetRegistrySelect.value;
      const serial = offsetSerialInput ? offsetSerialInput.value : '';
      if (!serial) {
        alert('Please enter a valid retirement serial number.');
        return;
      }

      await window.ACNC.Ledger.addRetirement({
        registry,
        serial_number: serial,
        tonnes_co2e_retired: 1.0
      });

      renderImpactLedger();
      if (offsetSerialInput) offsetSerialInput.value = '';
      alert('Offset certificate verified and anchored.');
    });
  }

  function renderImpactLedger() {
    if (!tableBody) return;
    const activities = window.ACNC.Ledger.getActivities();
    const reductions = window.ACNC.Ledger.getReductions();
    const retirements = window.ACNC.Ledger.getRetirements();
    const all = [...activities, ...reductions, ...retirements];

    if (all.length === 0) {
      tableBody.innerHTML = '';
      if (emptyNotice) emptyNotice.style.display = 'block';
    } else {
      if (emptyNotice) emptyNotice.style.display = 'none';
      tableBody.innerHTML = all.map(item => {
        const title = item.title || item.sub_category || (item.registry + ' Offset');
        const cat = item.category || 'Activity';
        const qty = item.quantity ? `${item.quantity} ${item.unit || ''}` : `${item.tonnes_co2e_retired || 1} t`;
        const co2 = item.co2e_kg_estimate ? `${item.co2e_kg_estimate} kg` : item.co2e_reduced_kg ? `-${item.co2e_reduced_kg} kg (Avoided)` : `${item.tonnes_co2e_retired || 1} t Retired`;
        const status = item.data_status || 'RECEIPT_BACKED';
        const statusInfo = window.ACNC.DATA_STATUS[status] || window.ACNC.DATA_STATUS.RECEIPT_BACKED;
        const hashShort = item.evidence_hash ? item.evidence_hash.substring(0, 16) + '...' : 'none';

        return `
          <tr>
            <td><strong>${title.replace(/_/g, ' ').toUpperCase()}</strong></td>
            <td><span class="truth-badge badge-local">${cat}</span></td>
            <td>${qty}</td>
            <td class="text-lime"><strong>${co2}</strong></td>
            <td><span class="status-badge ${statusInfo.badgeClass}">${status}</span></td>
            <td><span class="evidence-hash-pill"><i class="fa-solid fa-fingerprint"></i> ${hashShort}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-glass btn-sm" onclick="window.deleteImpactItem('${item.category}', '${item.record_id}')">
                <i class="fa-solid fa-trash-can text-flame"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  window.deleteImpactItem = (cat, id) => {
    let type = 'activity';
    if (cat === 'reduction') type = 'reduction';
    else if (cat === 'offset') type = 'retirement';
    window.ACNC.Ledger.deleteRecord(type, id);
    renderImpactLedger();
  };

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const jsonStr = window.ACNC.Ledger.exportJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acnc_impact_ledger_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  renderImpactLedger();
}

/* ==========================================================================
   5. VAULT PAGE CONTROLLER (/vault.html)
   ========================================================================== */
function initVaultPage() {
  if (!window.ACNC) return;

  const wallet = window.ACNC.Web3Vault.getWalletState();
  const summary = window.ACNC.Ledger.getLedgerSummary();

  const walletAddressEl = document.getElementById('vaultWalletAddress');
  const connStatusEl = document.getElementById('vaultConnectionStatus');
  const claimableEl = document.getElementById('vaultClaimableAmount');
  const connectBtn = document.getElementById('vaultConnectBtn');
  const disconnectBtn = document.getElementById('vaultDisconnectBtn');
  const downloadJsonBtn = document.getElementById('downloadLedgerJsonBtn');
  const receiptsListEl = document.getElementById('vaultReceiptsList');

  if (wallet.isConnected && wallet.address) {
    if (walletAddressEl) walletAddressEl.textContent = wallet.address;
    if (connStatusEl) connStatusEl.innerHTML = `<span class="truth-badge badge-live">CONNECTED (${wallet.network})</span>`;
    if (connectBtn) connectBtn.style.display = 'none';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
  } else {
    if (walletAddressEl) walletAddressEl.textContent = 'Not Connected';
    if (connStatusEl) connStatusEl.innerHTML = `<span class="truth-badge badge-pending">NO WALLET CONNECTED</span>`;
    if (connectBtn) connectBtn.style.display = 'inline-flex';
    if (disconnectBtn) disconnectBtn.style.display = 'none';
  }

  if (claimableEl) claimableEl.textContent = `${summary.eligibleVTime.toFixed(2)} VTIME`;

  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      await window.ACNC.Web3Vault.connectWallet();
      initVaultPage();
      initGlobalNavigation();
    });
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      window.ACNC.Web3Vault.disconnectWallet();
      initVaultPage();
      initGlobalNavigation();
    });
  }

  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener('click', () => {
      const jsonStr = window.ACNC.Ledger.exportJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acnc_verified_ledger_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (receiptsListEl) {
    const focusSessions = window.ACNC.Ledger.getFocusSessions();
    const retirements = window.ACNC.Ledger.getRetirements();
    const all = [...focusSessions, ...retirements];

    if (all.length === 0) {
      receiptsListEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-dim); font-family: var(--font-mono); font-size: 0.85rem;">
          NO ACTIVITY RECORDED YET<br />
          <span style="font-size: 0.75rem;">Complete a focus sprint or log an offset retirement to generate verifiable cryptographic receipts.</span>
        </div>
      `;
    } else {
      receiptsListEl.innerHTML = all.map(r => {
        const id = r.receipt_id || 'RCPT-PROV';
        const type = r.type === 'registry_retirement' ? 'Offset Retirement Certificate' : 'Focus Session Receipt';
        return `
          <div class="glass-panel" style="padding: 1rem 1.25rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="font-weight: 800; font-family: var(--font-mono); color: var(--accent-gold);">${id}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${type} • ${r.timestamp}</div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="evidence-hash-pill"><i class="fa-solid fa-fingerprint"></i> ${r.evidence_hash.substring(0, 16)}...</span>
              <span class="truth-badge badge-live">SEALED</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

/* ==========================================================================
   6. RELICS PAGE CONTROLLER (/relics.html)
   ========================================================================== */
function initRelicsPage() {
  if (!window.ACNC) return;
  const summary = window.ACNC.Ledger.getLedgerSummary();
  const relicsEmptyNotice = document.getElementById('relicsEmptyNotice');
  const relicsGrid = document.getElementById('relicsGrid');

  if (!summary.hasData) {
    if (relicsEmptyNotice) relicsEmptyNotice.style.display = 'block';
    if (relicsGrid) relicsGrid.style.display = 'none';
  } else {
    if (relicsEmptyNotice) relicsEmptyNotice.style.display = 'none';
    if (relicsGrid) relicsGrid.style.display = 'grid';
  }
}

/* ==========================================================================
   7. PROTOCOL PAGE CONTROLLER (/protocol.html)
   ========================================================================== */
function initProtocolPage() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}
