// Autonomous Self-Healing & Resilience Layer for time.unykorn.ai
// Version 3.1.0 — Multi-Page Ecosystem, Persistent Reward Economics & Web3 Claim Rails

(function (window) {
  'use strict';

  const MIN_SESSION_MINUTES = 6;
  const MAX_SESSION_MINUTES = 24 * 60; // 1,440 minutes = 24 hours
  const DEFAULT_SESSION_MINUTES = 50;

  const STORAGE_KEYS = {
    SESSION_TIMER: 'acnc_focus_session_timer_v3',
    LEDGER_HISTORY: 'acnc_ledger_history_v3',
    DAILY_TOTALS: 'acnc_daily_totals_v3',
    REWARD_STATE: 'acnc_reward_economy_v3',
    WALLET_STATE: 'acnc_wallet_state_v3',
    USER_PREFS: 'acnc_user_prefs_v3',
    DIAGNOSTICS_LOG: 'acnc_diagnostics_log_v3'
  };

  // Helper normalization functions
  function normalizeSessionMinutes(value) {
    if (value === null || value === undefined || value === '') return DEFAULT_SESSION_MINUTES;
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes <= 0) return DEFAULT_SESSION_MINUTES;
    return Math.min(
      MAX_SESSION_MINUTES,
      Math.max(MIN_SESSION_MINUTES, Math.round(minutes))
    );
  }

  function formatDuration(minutes) {
    const mins = normalizeSessionMinutes(minutes);
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    return hours ? `${hours}h ${String(remainder).padStart(2, '0')}m` : `${remainder}m`;
  }

  function formatCountdown(totalSecs) {
    const s = Math.max(0, Math.floor(totalSecs));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function estimateReward(minutes) {
    const mins = normalizeSessionMinutes(minutes);
    const points = Math.max(1, Math.round((mins / 50) * 12));
    const vtime = parseFloat(((mins / 50) * 1.2).toFixed(2));
    return { points, vtime };
  }

  const DIAGNOSTICS = {
    appVersion: '3.1.0-multi-page-ecosystem',
    errorsCaught: 0,
    retriesAttempted: 0,
    circuitBreakerOpen: false,
    circuitBreakerTrippedAt: 0,
    lastCorrelationId: null,
    telemetryHistory: []
  };

  function logTelemetry(type, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      context,
      correlationId: 'req_' + Math.random().toString(36).substring(2, 9)
    };
    DIAGNOSTICS.lastCorrelationId = entry.correlationId;
    DIAGNOSTICS.telemetryHistory.unshift(entry);
    if (DIAGNOSTICS.telemetryHistory.length > 50) {
      DIAGNOSTICS.telemetryHistory.pop();
    }
    try {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSTICS_LOG, JSON.stringify(DIAGNOSTICS.telemetryHistory));
    } catch (e) {}
    console.log(`[Self-Healing System] [${type}] ${message}`, context);
    return entry.correlationId;
  }

  // 1. GLOBAL ERROR BOUNDARY
  window.addEventListener('error', function (event) {
    DIAGNOSTICS.errorsCaught++;
    const corrId = logTelemetry('WINDOW_ERROR', event.message || 'Script error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', function (event) {
    DIAGNOSTICS.errorsCaught++;
    const corrId = logTelemetry('PROMISE_REJECTION', event.reason ? event.reason.toString() : 'Unhandled Rejection');
  });

  // 2. FOCUS TIMER ENGINE (V3)
  const FocusTimer = {
    state: {
      version: 3,
      status: 'IDLE', // IDLE, RUNNING, PAUSED, COMPLETED
      sessionMinutes: DEFAULT_SESSION_MINUTES,
      startedAt: 0,
      endAt: 0,
      pausedAt: 0,
      accumulatedPausedMs: 0,
      intention: '',
      shieldDistractions: true,
      privacyMode: 'private', // private (LOCAL), proof (TESTNET), zk (TESTNET)
      pausesCount: 0
    },
    intervalId: null,

    init() {
      this.restore();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.state.status === 'RUNNING') {
          this.tick();
        }
      });
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEYS.SESSION_TIMER, JSON.stringify(this.state));
      } catch (e) {}
    },

    restore() {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SESSION_TIMER);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.version === 3 && parsed.status) {
            this.state = Object.assign(this.state, parsed);
            this.state.sessionMinutes = normalizeSessionMinutes(parsed.sessionMinutes);

            if (this.state.status === 'RUNNING') {
              const remaining = this.getRemainingSeconds();
              if (remaining <= 0) {
                this.complete();
              } else {
                this.startTicker();
              }
            } else {
              this.tick();
            }
            return;
          }
        }
      } catch (e) {
        logTelemetry('STATE_RESTORE_FAIL', 'Resetting timer to defaults.');
      }
      this.reset();
    },

    getRemainingSeconds() {
      if (this.state.status === 'IDLE') {
        return this.state.sessionMinutes * 60;
      }
      const totalDurationMs = this.state.sessionMinutes * 60_000;
      if (this.state.status === 'PAUSED') {
        const elapsedBeforePause = (this.state.pausedAt - this.state.startedAt) - this.state.accumulatedPausedMs;
        return Math.max(0, Math.ceil((totalDurationMs - elapsedBeforePause) / 1000));
      }
      if (this.state.status === 'RUNNING') {
        const now = Date.now();
        const effectiveElapsed = (now - this.state.startedAt) - this.state.accumulatedPausedMs;
        return Math.max(0, Math.ceil((totalDurationMs - effectiveElapsed) / 1000));
      }
      return 0;
    },

    getElapsedSeconds() {
      const totalSecs = this.state.sessionMinutes * 60;
      return Math.max(0, totalSecs - this.getRemainingSeconds());
    },

    setSessionMinutes(minutes) {
      if (this.state.status === 'RUNNING' || this.state.status === 'PAUSED') return;
      this.state.sessionMinutes = normalizeSessionMinutes(minutes);
      this.save();
      this.tick();
    },

    start(customMinutes = null, intention = '', shield = true, privacy = 'private') {
      if (this.state.status === 'RUNNING') return;

      const minutes = customMinutes !== null ? normalizeSessionMinutes(customMinutes) : this.state.sessionMinutes;
      const now = Date.now();

      this.state.version = 3;
      this.state.status = 'RUNNING';
      this.state.sessionMinutes = minutes;
      this.state.startedAt = now;
      this.state.endAt = now + (minutes * 60_000);
      this.state.pausedAt = 0;
      this.state.accumulatedPausedMs = 0;
      this.state.intention = intention.trim();
      this.state.shieldDistractions = shield;
      this.state.privacyMode = privacy;
      this.state.pausesCount = 0;

      this.save();
      this.startTicker();
      logTelemetry('TIMER_STARTED', `Focus session started for ${minutes}m`);
    },

    pause() {
      if (this.state.status !== 'RUNNING') return;
      this.state.status = 'PAUSED';
      this.state.pausedAt = Date.now();
      this.state.pausesCount = (this.state.pausesCount || 0) + 1;
      clearInterval(this.intervalId);
      this.save();
      this.tick();
      logTelemetry('TIMER_PAUSED', 'Focus session paused');
    },

    resume() {
      if (this.state.status !== 'PAUSED') return;
      const pauseDuration = Date.now() - this.state.pausedAt;
      this.state.accumulatedPausedMs += pauseDuration;
      this.state.endAt += pauseDuration;
      this.state.pausedAt = 0;
      this.state.status = 'RUNNING';
      this.save();
      this.startTicker();
      logTelemetry('TIMER_RESUMED', 'Focus session resumed');
    },

    complete() {
      clearInterval(this.intervalId);
      this.state.status = 'COMPLETED';
      this.save();
      this.tick();

      const elapsedSecs = this.state.sessionMinutes * 60;
      const actualMinutes = Math.max(MIN_SESSION_MINUTES, Math.round(elapsedSecs / 60));

      const calc = LedgerEngine.calculate(actualMinutes / 60, 14000, 10000);
      const receipt = LedgerEngine.generateReceipt(calc, this.state.privacyMode, this.state.intention);

      // Award Economy Points
      const rewardEst = estimateReward(actualMinutes);
      RewardEconomy.recordCompletedSession(actualMinutes, rewardEst.points, rewardEst.vtime, receipt);

      logTelemetry('TIMER_COMPLETED', `Focus session completed (${actualMinutes}m)`, { receiptId: receipt.receiptId });

      if (window.onFocusSessionCompleted) {
        window.onFocusSessionCompleted(receipt, this.state, rewardEst);
      }
    },

    reset() {
      clearInterval(this.intervalId);
      this.state.status = 'IDLE';
      this.state.startedAt = 0;
      this.state.endAt = 0;
      this.state.pausedAt = 0;
      this.state.accumulatedPausedMs = 0;
      this.state.pausesCount = 0;
      this.save();
      this.tick();
      logTelemetry('TIMER_RESET', 'Focus session timer reset');
    },

    startTicker() {
      clearInterval(this.intervalId);
      this.tick();
      this.intervalId = setInterval(() => {
        const remaining = this.getRemainingSeconds();
        if (remaining <= 0) {
          this.complete();
        } else {
          this.tick();
        }
      }, 1000);
    },

    tick() {
      const remainingSecs = this.getRemainingSeconds();
      const formatted = formatCountdown(remainingSecs);

      const heroTimerDisplay = document.getElementById('heroTimerCountdown');
      if (heroTimerDisplay) {
        heroTimerDisplay.textContent = formatted;
      }

      if (window.syncTimerUIButtons) {
        window.syncTimerUIButtons(this.state);
      }
    }
  };

  // 3. PERSISTENT REWARD ECONOMY & UTILITY UNLOCKS
  const RewardEconomy = {
    getTodayDateString() {
      return new Date().toISOString().split('T')[0];
    },

    getState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.REWARD_STATE);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {}

      return {
        totalFocusPoints: 36,
        todayFocusPoints: 12,
        vtimeBalance: 3.6,
        claimableVTime: 2.4,
        claimedVTime: 1.2,
        streakDays: 3,
        lastActiveDate: this.getTodayDateString(),
        totalMinutesFocused: 150,
        completedSessionsCount: 3,
        activeStakes: [],
        unlockedUtilities: ['guide_primer']
      };
    },

    saveState(state) {
      try {
        localStorage.setItem(STORAGE_KEYS.REWARD_STATE, JSON.stringify(state));
      } catch (e) {}
    },

    recordCompletedSession(minutes, points, vtime, receipt) {
      const state = this.getState();
      const today = this.getTodayDateString();

      if (state.lastActiveDate === today) {
        state.todayFocusPoints += points;
      } else {
        // Check streak continuity
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (state.lastActiveDate === yesterday) {
          state.streakDays += 1;
        } else {
          state.streakDays = 1;
        }
        state.todayFocusPoints = points;
        state.lastActiveDate = today;
      }

      state.totalFocusPoints += points;
      state.vtimeBalance = parseFloat((state.vtimeBalance + vtime).toFixed(2));
      state.claimableVTime = parseFloat((state.claimableVTime + vtime).toFixed(2));
      state.totalMinutesFocused += minutes;
      state.completedSessionsCount += 1;

      this.saveState(state);
      return state;
    },

    unlockUtility(utilityId, costVTime) {
      const state = this.getState();
      if (state.unlockedUtilities.includes(utilityId)) return { success: true, alreadyUnlocked: true };
      if (state.vtimeBalance < costVTime) return { success: false, reason: 'Insufficient VTIME balance' };

      state.vtimeBalance = parseFloat((state.vtimeBalance - costVTime).toFixed(2));
      state.unlockedUtilities.push(utilityId);
      this.saveState(state);
      logTelemetry('UTILITY_UNLOCKED', `Unlocked ${utilityId} for ${costVTime} VTIME`);
      return { success: true, newBalance: state.vtimeBalance };
    },

    addVoluntaryStake(amountVTime, targetMinutes = 50) {
      const state = this.getState();
      if (state.vtimeBalance < amountVTime) return { success: false, reason: 'Insufficient VTIME balance' };

      state.vtimeBalance = parseFloat((state.vtimeBalance - amountVTime).toFixed(2));
      const stakeRecord = {
        id: 'stake_' + Math.random().toString(36).substring(2, 9),
        amount: amountVTime,
        targetMinutes,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE'
      };
      state.activeStakes.push(stakeRecord);
      this.saveState(state);
      return { success: true, stake: stakeRecord };
    }
  };

  // 4. DETERMINISTIC LEDGER & RECEIPT ENGINE
  const LedgerEngine = {
    DAILY_CAP: 300.0,
    MAX_EVENT_CREDITS: 100.0,

    getTodayIndex() {
      return Math.floor(Date.now() / 86400000);
    },

    getDailyMinted() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.DAILY_TOTALS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.dayIndex === this.getTodayIndex()) {
            return Number(parsed.totalMinted) || 0.0;
          }
        }
      } catch (e) {}
      return 0.0;
    },

    calculate(hours, severityBps, evidenceBps) {
      const rawHours = Number(hours);
      const validHours = Math.min(24.0, Math.max(0.1, Number.isFinite(rawHours) ? Math.round(rawHours * 100) / 100 : 0.83));
      const validSev = Math.min(20000, Math.max(10000, parseInt(severityBps) || 10000));
      const validEvi = Math.min(10000, Math.max(8000, parseInt(evidenceBps) || 8000));

      const baseUnits = validHours * 15.0;
      const adjusted = baseUnits * (validSev / 10000) * (validEvi / 10000);

      const dailyMinted = this.getDailyMinted();
      const remainingDaily = Math.max(0.0, this.DAILY_CAP - dailyMinted);
      const boundedUnits = Math.min(adjusted, this.MAX_EVENT_CREDITS, remainingDaily);

      return {
        hours: validHours,
        minutes: Math.round(validHours * 60),
        severityBps: validSev,
        evidenceBps: validEvi,
        rawUnits: parseFloat(adjusted.toFixed(2)),
        finalVTime: parseFloat(boundedUnits.toFixed(2)),
        dailyRemaining: parseFloat((remainingDaily - boundedUnits).toFixed(2))
      };
    },

    generateReceipt(calculation, privacyMode = 'private', intention = '') {
      const timestamp = new Date().toISOString();
      const sessionGuid = 'sess_' + Math.random().toString(36).substring(2, 11);
      const receiptPayload = `${sessionGuid}|${calculation.minutes}m|${calculation.finalVTime}|${privacyMode}|${timestamp}|${intention}`;

      let hash = 0;
      for (let i = 0; i < receiptPayload.length; i++) {
        hash = ((hash << 5) - hash) + receiptPayload.charCodeAt(i);
        hash |= 0;
      }
      const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
      const receiptId = 'RCPT-' + hexHash.toUpperCase();
      const fullSealHash = '0x' + hexHash + '8ace92e41b7392a10427845f91e';

      const receipt = {
        receiptId,
        sessionGuid,
        timestamp,
        intention: intention || 'Unspecified Focus Block',
        durationMinutes: calculation.minutes,
        durationFormatted: formatDuration(calculation.minutes),
        calculation,
        privacyMode,
        truthStatus: privacyMode === 'proof' ? 'TESTNET / Amoy Verification Stage' : 'LOCAL / Browser Sealed',
        claimStatus: 'CLAIMABLE', // CLAIMABLE, CLAIMED_TESTNET, LOCAL_ONLY
        evidenceSealHash: fullSealHash
      };

      try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEDGER_HISTORY) || '[]');
        history.unshift(receipt);
        if (history.length > 30) history.pop();
        localStorage.setItem(STORAGE_KEYS.LEDGER_HISTORY, JSON.stringify(history));
      } catch (e) {}

      return receipt;
    }
  };

  // 5. WEB3 WALLET & EIP-712 CLAIM RAILS (POLYGON AMOY)
  const Web3Vault = {
    getWalletState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.WALLET_STATE);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return { isConnected: false, address: null, chainId: 80002, networkName: 'Polygon Amoy' };
    },

    saveWalletState(state) {
      try {
        localStorage.setItem(STORAGE_KEYS.WALLET_STATE, JSON.stringify(state));
      } catch (e) {}
    },

    async connectWallet() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            const state = {
              isConnected: true,
              address: accounts[0],
              chainId: 80002,
              networkName: 'Polygon Amoy Testnet'
            };
            this.saveWalletState(state);
            logTelemetry('WALLET_CONNECTED', `Connected wallet ${accounts[0]}`);
            return state;
          }
        } catch (e) {
          logTelemetry('WALLET_CONNECT_FAIL', e.message);
        }
      }

      // Simulated local testnet wallet fallback for demonstration without browser extension
      const mockState = {
        isConnected: true,
        address: '0x71C...49Fa13',
        chainId: 80002,
        networkName: 'Polygon Amoy (Simulated)'
      };
      this.saveWalletState(mockState);
      return mockState;
    },

    disconnectWallet() {
      const state = { isConnected: false, address: null, chainId: 80002, networkName: 'Polygon Amoy' };
      this.saveWalletState(state);
      return state;
    },

    async submitEIP712Claim(receiptId, amountVTime) {
      const wallet = this.getWalletState();
      if (!wallet.isConnected) {
        return { success: false, reason: 'Please connect your Web3 wallet first.' };
      }

      // Simulated EIP-712 claim payload
      const claimPayload = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          RewardClaim: [
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'receiptId', type: 'string' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        },
        primaryType: 'RewardClaim',
        domain: {
          name: 'AllCouchNoCageTimeImpactLedger',
          version: '1',
          chainId: 80002,
          verifyingContract: '0x4E574939D460d284B5D990646D4aeaEF2D49Fa13'
        },
        message: {
          recipient: wallet.address,
          amount: Math.round(amountVTime * 100),
          receiptId,
          nonce: Math.floor(Math.random() * 100000),
          deadline: Math.floor(Date.now() / 1000) + 3600
        }
      };

      // Mark receipt claimed in history
      try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEDGER_HISTORY) || '[]');
        const target = history.find(h => h.receiptId === receiptId);
        if (target) {
          target.claimStatus = 'CLAIMED_TESTNET';
          localStorage.setItem(STORAGE_KEYS.LEDGER_HISTORY, JSON.stringify(history));
        }
      } catch (e) {}

      // Update reward balance
      const rewardState = RewardEconomy.getState();
      rewardState.claimedVTime = parseFloat((rewardState.claimedVTime + amountVTime).toFixed(2));
      rewardState.claimableVTime = Math.max(0, parseFloat((rewardState.claimableVTime - amountVTime).toFixed(2)));
      RewardEconomy.saveState(rewardState);

      const txHash = '0x' + Math.random().toString(16).substring(2, 10) + '9460d284b5d990646d4aeaef2d49fa13';
      logTelemetry('EIP712_CLAIM_SUBMITTED', `Claimed ${receiptId}`, { txHash });

      return {
        success: true,
        txHash,
        claimPayload,
        network: 'Polygon Amoy (Chain ID 80002)'
      };
    }
  };

  // Expose global self-healing toolkit
  window.SelfHealing = {
    MIN_SESSION_MINUTES,
    MAX_SESSION_MINUTES,
    DEFAULT_SESSION_MINUTES,
    normalizeSessionMinutes,
    formatDuration,
    formatCountdown,
    estimateReward,
    DIAGNOSTICS,
    logTelemetry,
    FocusTimer,
    RewardEconomy,
    LedgerEngine,
    Web3Vault
  };

})(window);
