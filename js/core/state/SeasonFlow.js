/**
 * @file js/core/state/SeasonFlow.js - GameState から機能別に分割したメソッド群（21個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { SCENARIOS, SEASON, SEASONS_PER_YEAR, formatYearWithEra, gameRandom, getClanAbility } from '../GameStateShared.js?v=20261128_v74';

export const SeasonFlowMethods = {



  // ============================================================================

  // 天下観戦モード (成り行きを見守るモード)

  // ============================================================================



  startSpectatorMode() {

    this.music.init();

    const modal = document.getElementById('startModal');

    if (modal) modal.classList.add('hidden');

    const introModal = document.getElementById('scenarioIntroModal');

    if (introModal) introModal.classList.add('hidden');



    this.isSpectatorMode = true;
    // 観戦中は右側の情報表示用の選択を保持しても、地図上の選択演出は出さない。
    this.hideSelectionOutline = true;

    this.executeStartGameFlow();



    // 観戦バナーの一行表示は行わず、ヘッダーボタンで切り替え

    const banner = document.getElementById('spectatorBanner');

    if (banner) banner.style.display = 'none';



    this.log('👀【天下観戦モード開始】大名を操作せず、全群雄の動乱と覇権争いを静観します。いつでもヘッダーの「途中参加」ボタンから任意の大名を選んで覇道に乗り出すことができます。', 'important');

    this.updateUI();



    // 観戦モード開始とともにオート進行を自動スタート

    setTimeout(() => {

      this.startAutoPlay();

    }, 400);

  },



  openSpectatorDaimyoModal() {

    // オートプレイ中なら一時停止

    if (this.isAutoPlay) {

      this.stopAutoPlay('大名選択のため');

    }

    const modal = document.getElementById('spectatorDaimyoModal');

    const grid = document.getElementById('spectatorDaimyoGrid');

    if (!modal || !grid) return;



    grid.innerHTML = '';



    // 現在領国を1国以上保有している各大名を抽出

    const clanProvsMap = new Map();

    (this.provinces || []).forEach(p => {

      if (p.ownerId && p.ownerId !== 'independent' && p.ownerId !== 'court') {

        if (!clanProvsMap.has(p.ownerId)) clanProvsMap.set(p.ownerId, []);

        clanProvsMap.get(p.ownerId).push(p);

      }

    });



    const activeClans = Array.from(clanProvsMap.entries()).sort((a, b) => b[1].length - a[1].length);



    activeClans.forEach(([clanId, provs]) => {

      const card = document.createElement('div');

      card.className = 'daimyo-card';

      card.style.cssText = 'cursor:pointer; border:1px solid #775533; border-radius:6px; padding:10px; background:rgba(0,0,0,0.6); transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.5);';

      card.onmouseenter = () => { card.style.borderColor = 'var(--gold)'; card.style.background = 'rgba(60,40,20,0.85)'; card.style.transform = 'translateY(-2px)'; };

      card.onmouseleave = () => { card.style.borderColor = '#775533'; card.style.background = 'rgba(0,0,0,0.6)'; card.style.transform = 'none'; };



      const kamonId = this.getClanKamonId(clanId);

      const clanName = this.getClanFamilyName(clanId);

      const lordName = this.getClanDisplayName(clanId);

      const ability = getClanAbility(clanId) || { military:60, politics:60, stratagem:55 };



      const totalTroops = provs.reduce((s, p) => s + (Number(p.troops) || 0), 0);

      const totalRice = provs.reduce((s, p) => s + (Number(p.rice) || 0), 0);



      card.innerHTML = `

        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">

          <div style="display:flex; align-items:center; gap:6px;">

            <svg style="width:24px; height:24px; vertical-align:middle; flex-shrink:0;">

              <use href="#${kamonId}"></use>

            </svg>

            <strong style="color:var(--gold-bright); font-size:12pt;">${clanName}</strong>

          </div>

          <span style="font-size:10.5pt; color:#ffd700; background:rgba(212,175,55,0.2); border:1px solid var(--gold); border-radius:3px; padding:1px 6px;">${provs.length}州</span>

        </div>

        <div style="font-size:11pt; color:#fff; margin-bottom:4px;">当主: <strong>${lordName}</strong></div>

        <div style="font-size:10pt; color:#aaa; margin-bottom:6px;">兵力: ${totalTroops.toLocaleString()}人 ｜ 石高: ${(totalRice / 10).toFixed(1)}万石</div>

        <div style="display:flex; justify-content:space-between; font-size:10.5pt; background:rgba(255,255,255,0.06); padding:3px 6px; border-radius:3px;">

          <span style="color:#ffaaaa;">武<strong>${ability.military}</strong></span>

          <span style="color:#aaffaa;">内<strong>${ability.politics}</strong></span>

          <span style="color:#aaaaff;">知<strong>${ability.stratagem}</strong></span>

        </div>

      `;



      card.addEventListener('click', () => {

        Swal.fire({

          title: `⚔️ 【${clanName}】として参戦しますか？`,

          html: `<p style="font-size:11.5pt; color:#e0d0b8;">当主・<strong>${lordName}</strong> 率いる ${clanName}（支配${provs.length}州）の覇業を継承し、自ら天下統一を目指します。</p>`,

          icon: 'question',

          showCancelButton: true,

          confirmButtonText: '参戦する！',

          cancelButtonText: '考え直す',

          confirmButtonColor: '#d35400',

          cancelButtonColor: '#34495e',

          background: '#1a100a',

          color: '#f5eedc'

        }).then((result) => {

          if (result.isConfirmed) {

            modal.classList.add('hidden');

            this.joinAsDaimyo(clanId);

          }

        });

      });



      grid.appendChild(card);

    });



    modal.classList.remove('hidden');

  },



  findDaimyoProfile(clanId) {

    const scen = this.currentScenario || (typeof SCENARIOS !== 'undefined' ? SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId)) : null);

    if (scen && scen.playables) {

      const p = scen.playables.find(x => x.id === clanId);

      if (p) return JSON.parse(JSON.stringify(p));

    }

    const lord = (this.activeOfficers || []).find(o => o && o.clanId === clanId && o.isDaimyo && !o.isDead);

    const clanName = this.getClanFamilyName(clanId);

    return {

      id: clanId,

      name: lord ? lord.name : clanName,

      clan: clanName,

      tactic: lord?.tactic || '全軍突撃',

      tacticDesc: '全軍の力を結集して戦う！'

    };

  },



  joinAsDaimyo(clanId) {

    this.isSpectatorMode = false;

    this.playerClanId = clanId;

    this.playerDaimyo = this.findDaimyoProfile(clanId);



    // 観戦バナーを非表示

    const banner = document.getElementById('spectatorBanner');

    if (banner) banner.style.display = 'none';



    // プレイヤーの金・米・軍令権を初期化/同期

    const myProvs = (this.provinces || []).filter(p => p.ownerId === clanId);

    this.gold = Math.max(300, myProvs.reduce((s, p) => s + (Number(p.gold) || 0), 0) || 500);

    this.rice = Math.max(400, myProvs.reduce((s, p) => s + (Number(p.rice) || 0), 0) || 800);

    this.refreshMaxAp();
    this.ap = this.maxAp || 3;



    if (myProvs.length > 0) {

      this.selectProvince(myProvs[0].id);

    }



    try { this.audio.playGrandFanfare ? this.audio.playGrandFanfare() : this.audio.playFanfare?.(); } catch(e) {}



    this.log(`🎌【覇業継承・参戦】${this.playerDaimyo.clan}（当主: ${this.playerDaimyo.name}）として乱世に参戦しました！自ら采配を振るい、天下統一を目指してください！`, 'important');

    this.showOrderResult('⚔️ 参戦完了', `【${this.playerDaimyo.clan}】当主・${this.playerDaimyo.name} として参戦しました！`, '#2ecc71');



    this.updateUI();

  },



  toggleSpectatorMode() {

    if (this.isSpectatorMode) {

      this.openSpectatorDaimyoModal();

    } else {

      Swal.fire({

        title: '👀 成り行きを見守る（観戦モードへ切替）',

        html: '<p style="font-size:11.5pt; color:#e0d0b8;">自軍の操作を休止し、全大名がAIで争う戦国の動乱を観戦しますか？<br><span style="font-size:10.5pt; color:#aaa;">※ 観戦中もいつでも任意の大名を選んで復帰できます。</span></p>',

        icon: 'info',

        showCancelButton: true,

        confirmButtonText: '観戦モードにする',

        cancelButtonText: 'プレイを続ける',

        confirmButtonColor: '#2980b9',

        cancelButtonColor: '#34495e',

        background: '#1a100a',

        color: '#f5eedc'

      }).then(res => {

        if (res.isConfirmed) {

          this.isSpectatorMode = true;
          // 直前に国をクリックしていた場合でも、観戦へ切り替えた時点で地図の選択演出を解除する。
          this.hideSelectionOutline = true;

          // 直近で世継ぎ選択画面等が表示されていた場合は閉じ、大名不在なら自動で代替わりを解決

          if (window.Swal && typeof Swal.isVisible === 'function' && Swal.isVisible()) {

            const popup = Swal.getPopup();

            if (popup && popup.querySelector('.heir-selection-select, #heir-preview-container')) {

              try { Swal.close(); } catch (e) {}

            }

          }

          this.checkDaimyoLifespan?.();



          const banner = document.getElementById('spectatorBanner');

          if (banner) banner.style.display = 'none';

          this.log('👀【観戦モード切替】プレイヤー操作を休止し、天下の成り行きを見守ります。', 'important');

          this.updateUI();

          this.startAutoPlay();

        }

      });

    }

  },



  // ============================================================================

  // オートプレーモード (自動季節進行)

  // ============================================================================,



  startAutoPlay() {

    if (this.inBattle) {

      this.showOrderResult('⚠ オート不可', '合戦中はオート進行を開始できません。', '#e74c3c');

      return;

    }

    if (!this.playerDaimyo && !this.isSpectatorMode) {

      return;

    }



    if (this.autoPlayTimer) {

      clearTimeout(this.autoPlayTimer);

      this.autoPlayTimer = null;

    }



    this.isAutoPlay = true; this.audio?.setAutoQuiet?.(true);

    this.autoPlayPausedForEvent = false;

    this.updateAutoPlayUI(true);

    this.log(`⏩【季節オート進行】オートプレーを開始しました（速度: ${this.autoPlaySpeed.toFixed(1)}秒/期）。仕官の申し出は自動承諾し、歴史イベントは選択のため一時停止します。`);



    // 次の進行をスケジュール

    this.scheduleNextAutoSeason();

  },



  stopAutoPlay(reason = '') {

    if (!this.isAutoPlay && !this.autoPlayTimer && !this.autoPlayPausedForEvent) return;

    this.isAutoPlay = false; this.audio?.setAutoQuiet?.(false);

    this.autoPlayPausedForEvent = false;

    if (this.autoPlayTimer) {

      clearTimeout(this.autoPlayTimer);

      this.autoPlayTimer = null;

    }

    this.setEventPauseNote(false);

    this.updateAutoPlayUI(false);

    if (reason && reason !== '手動停止') {

      this.log(`⏹【季節オート進行】${reason}によりオート進行を停止しました。`);

    } else if (reason === '手動停止') {

      this.log('⏹【季節オート進行】オートプレーを停止しました。');

    }

    // 停止時に最新状態を確実に保存

    this.autoSave(true);

  },



  // 画面（一覧・詳細・設定など）を開いたらオート進行を止める（手動停止と同じ）。

  // 季節処理の途中なら、その季は最後まで処理され、次の季は予約されない。

  pauseAutoPlayForScreen(label = '画面の表示') {

    if (!this.isAutoPlay && !this.autoPlayPausedForEvent && !this.autoPlayTimer) return;

    this.stopAutoPlay(label);

  },



  updateAutoPlaySpeed(val) {

    const num = Math.max(0.1, Math.min(3.0, parseFloat(val) || 0.5));

    this.autoPlaySpeed = Math.round(num * 10) / 10;

    

    const valEl = document.getElementById('autoPlaySpeedVal');

    if (valEl) {

      valEl.textContent = `${this.autoPlaySpeed.toFixed(1)}秒`;

    }



    // 稼働中なら即座に新しい速度で再スケジュール

    if (this.isAutoPlay) {

      this.scheduleNextAutoSeason();

    }

  },



  updateAutoPlayUI(isRunning) {

    const paused = !!(isRunning && this.autoPlayPausedForEvent);

    const btn = document.getElementById('autoPlayToggleBtn');

    const icon = document.getElementById('autoPlayBtnIcon');

    const text = document.getElementById('autoPlayBtnText');

    const indicator = document.getElementById('autoPlayIndicator');

    const label = document.getElementById('autoPlayLabel');



    if (btn) {

      btn.classList.toggle('running', isRunning && !paused);

      btn.classList.toggle('paused', paused);

    }

    if (icon) {

      icon.textContent = isRunning ? '⏸' : '▶';

    }

    if (text) {

      text.textContent = isRunning ? '停止' : '開始';

    }

    if (label) {

      label.textContent = paused ? '⏸ イベント選択待ち' : '⏩ 季節オート進行';

    }

    if (indicator) {

      indicator.classList.toggle('active', isRunning && !paused);

      indicator.classList.toggle('paused', paused);

    }

    const specPauseBtn = document.getElementById('spectatorAutoPlayPauseBtn');

    if (specPauseBtn) {

      const pauseIcon = document.getElementById('spectatorPauseIcon');

      const textFull = document.getElementById('spectatorPauseTextFull');

      const textShort = document.getElementById('spectatorPauseTextShort');

      if (pauseIcon) pauseIcon.textContent = isRunning ? '⏸' : '▶';

      if (textFull) textFull.textContent = isRunning ? '停止' : '再開';

      if (textShort) textShort.textContent = isRunning ? '停止' : '再開';

      specPauseBtn.style.borderColor = isRunning ? '#e74c3c' : '#2ecc71';

      specPauseBtn.style.color = isRunning ? '#ff7675' : '#2ecc71';

      specPauseBtn.title = isRunning ? '観戦オート進行を一時停止します' : '観戦オート進行を再開します';

    }

  },



  setEventPauseNote(visible) {

    document.querySelectorAll('.event-auto-pause-note').forEach(el => {

      el.classList.toggle('hidden', !visible);

    });

  },



  isEventChoiceOpen() {

    const eventModal = document.getElementById('historicalEventModal');

    if (eventModal && !eventModal.classList.contains('hidden')) return true;



    const histModal = document.getElementById('historyEventModal');

    if (histModal && !histModal.classList.contains('hidden')) return true;



    const shogunModal = document.getElementById('shogunModal');

    if (shogunModal && !shogunModal.classList.contains('hidden')) return true;



    const victoryModal = document.getElementById('victoryModal');

    if (victoryModal && !victoryModal.classList.contains('hidden')) return true;



    const defeatModal = document.getElementById('defeatModal');

    if (defeatModal && !defeatModal.classList.contains('hidden')) return true;



    const honnouji = document.getElementById('honnoujiSuccessorModal');

    if (honnouji && honnouji.style.display !== 'none' && getComputedStyle(honnouji).display !== 'none') return true;



    return false;

  },



  pauseAutoPlayForEvent() {

    if (this.autoPlayTimer) {

      clearTimeout(this.autoPlayTimer);

      this.autoPlayTimer = null;

    }

    if (!this.isAutoPlay) return;

    const already = this.autoPlayPausedForEvent;

    this.autoPlayPausedForEvent = true; this.audio?.setAutoQuiet?.(false);

    this.setEventPauseNote(true);

    this.updateAutoPlayUI(true);

    if (!already) {

      this.log('⏸【季節オート進行】イベント発生のため一時停止しました。選択後に再開します。');

    }

  },



  resumeAutoPlayAfterEvent() {

    if (this.autoPlayTimer) {

      clearTimeout(this.autoPlayTimer);

      this.autoPlayTimer = null;

    }

    if (!this.autoPlayPausedForEvent) return;

    this.autoPlayPausedForEvent = false;

    this.setEventPauseNote(false);

    if (!this.isAutoPlay) return; this.audio?.setAutoQuiet?.(true);

    if (this.inBattle) {

      this.stopAutoPlay('合戦発生のため');

      return;

    }

    const defeatModal = document.getElementById('defeatModal');

    if (!this.isSpectatorMode && defeatModal && !defeatModal.classList.contains('hidden')) {

      this.stopAutoPlay('御家滅亡のため');

      return;

    }

    this.updateAutoPlayUI(true);

    this.log('⏩【季節オート進行】選択を確認し、オートプレーを再開しました。');

    this.scheduleNextAutoSeason();

  },



  scheduleNextAutoSeason() {

    if (this.autoPlayTimer) {

      clearTimeout(this.autoPlayTimer);

      this.autoPlayTimer = null;

    }

    if (!this.isAutoPlay || this.autoPlayPausedForEvent) return;

    const delayMs = Math.max(100, Math.round(this.autoPlaySpeed * 1000));

    this.autoPlayTimer = setTimeout(() => {

      this.autoPlayTimer = null;

      if (typeof this.runAutoStep === 'function') {

        this.runAutoStep();

      }

    }, delayMs);

  },



  tryAutoAcknowledgeDialogs() {

    if (this.isEventChoiceOpen()) return false;

    if (!(window.Swal && typeof Swal.isVisible === 'function' && Swal.isVisible())) return false;

    // 世継ぎ指名など、入力が必要な画面はプレイヤーの選択を待つ

    if (document.querySelector('.swal2-popup .swal2-select, .swal2-popup .swal2-input, .swal2-popup .swal2-textarea')) {

      return false;

    }



    try { Swal.clickConfirm(); } catch (e) {}

    if (typeof Swal.isVisible === 'function' && Swal.isVisible()) {

      try { Swal.close(); } catch (e) {}

    }

    return typeof Swal.isVisible === 'function' && Swal.isVisible();

  },



  /**

   * 演算（Tick）と描画（Render）を分離した季節進行処理

   */

  async nextSeason() {

    if (this.inBattle) return;

    // 季節処理中の再入（ボタン連打・オート進行との競合）を防ぐ

    if (this._seasonProcessing) return;

    if (this.hasPendingRoninRequests && this.hasPendingRoninRequests()) {

      this.log('📜【待機】仕官の願い出・お知らせに返答するまで季節は進みません。');

      return;

    }

    if (this.isHistoricalEventBusy()) {

      this.log('📜【待機】歴史イベントの選択が終わるまで季節は進みません。');

      return;

    }



    const nextBtn = document.getElementById('nextTurnBtn');

    if (nextBtn) nextBtn.disabled = true;

    this._seasonProcessing = true;



    try {

      // 1. 演算（Tick）フェーズ: 各種収支・人事・AI思考（非同期ループ）

      const tickResult = await this.processSeasonTick();

      if (tickResult === 'defeat') return;

      // 演算後にも石高の上限を確かめる（本拠など、どの処理が上げても表示は上限以下。2026-10-11 bk）

      this.clampAllProvinceRice?.();



      // 2. 描画（Render）フェーズ: UI・マップ・バナー・エフェクト更新

      this.renderSeason();

    } finally {

      this._seasonProcessing = false;

      if (nextBtn) nextBtn.disabled = false;

    }

  },



  /**

   * 季節進行の演算（Tick）処理

   * @returns {Promise<string|void>}

   */

  /** 反覇道包囲網の基準（開始時の国数・経過季）。家が替わったら取り直す（2026-10-11 ck） */

  initCoalitionWatch(force = false) {

    const me = this.playerClanId;

    if (!me) return;

    if (!force && this.coalitionWatch && this.coalitionWatch.clan === me) return;

    const n = (this.provinces || []).filter(p => p.ownerId === me).length;

    this.coalitionWatch = { clan: me, startProvs: n, seasons: 0 };

  },



  /** 反覇道包囲網を結成してよいか：「包囲網」ボタンがオンで15国以上。開始時から15国以上なら猶予の季を過ぎ、開始時より広げた時だけ（2026-10-11 ck） */

  coalitionShouldForm(provCount) {

    if (!this.coalitionEnabled) return false;

    const B = this.aiBalance ? this.aiBalance() : {};

    const th = Number(B.coalitionThresholdProvs) || 15;

    if (provCount < th) return false;

    if (!(Number(B.coalitionGraceSeasons) > 0) && !(Number(B.coalitionGrowthProvs) > 0)) return true; // 猶予なし＝従来どおり（2026-10-11 cm）

    const w = this.coalitionWatch;

    if (!w || w.clan !== this.playerClanId || w.startProvs < th) return true;

    if (w.seasons < (Number(B.coalitionGraceSeasons) || 0)) return false;

    return provCount >= w.startProvs + (Number(B.coalitionGrowthProvs) || 0);

  },



  async processSeasonTick() {

    this.initCoalitionWatch(); // 2026-10-11 ck

    if (this.coalitionWatch) this.coalitionWatch.seasons = (Number(this.coalitionWatch.seasons) || 0) + 1;

    // イベント等で石高が上限を超えていたら上限まで（2026-10-11 bh）

    this.clampAllProvinceRice?.();

    this.seasonIdx = (this.seasonIdx + 1) % SEASONS_PER_YEAR;

    if (this.seasonIdx === 0) {

      this.year += 1;

      this.snapshotLivingDaimyoNames();

      this.updateToyotomiSurname(true);

      this.updateActiveOfficers();

      if (this.currentScenario) {

        this.resolveOfficerAffiliations(this.currentScenario);

      }

      this.updateCastlesForYear();

      // 大名の寿命判定と世継ぎ家督相続

      await this.checkDaimyoLifespan();

    }

    this.maintainAlliances();

    this.refreshMaxAp();
    this.ap = this.maxAp;



    const weathers = ['晴天', '晴天', '曇天', '恵みの雨', '豪雨', '晴天'];

    if (this.seasonIdx === SEASON.WINTER) weathers.push('大雪', '吹雪');

    if (this.seasonIdx === SEASON.EARLY_SUMMER) weathers.push('恵みの雨', '恵みの雨'); // 初夏は梅雨

    if (this.seasonIdx === SEASON.MIDSUMMER) weathers.push('晴天', '豪雨'); // 盛夏は炎天と夕立

    this.currentWeather = weathers[Math.floor(gameRandom() * weathers.length)];



    // 委任統治の実行

    this.executeGovernanceTurn();



    // 収支計算（直轄地は大名能力半減ペナルティにより収穫・商業が50%）

    const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    let totalRiceHarvest = 0;

    let totalCommerceIncome = 0;

    let directRuleCount = 0;



    let ikkiCount = 0;

    let specialtyRiceBonus = 0;

    let portGunNotes = 0;

    myProvs.forEach(p => {

      const effStats = this.getEffectiveStats(p.id);

      const mult = effStats.isDirectRule ? 0.5 : 1.0;

      if (effStats.isDirectRule) directRuleCount++;



      const order = Number(p.order);

      const ikkiThreshold = window.IKKI_ORDER_THRESHOLD || 50;

      const inIkki = Number.isFinite(order) && order <= ikkiThreshold;

      if (inIkki) {

        ikkiCount++;

        const desert = Math.min(p.troops || 0, Math.round((p.troops || 0) * 0.04) + 20);

        p.troops = Math.max(200, (p.troops || 0) - desert);

        p.order = Math.min(100, (p.order || 0) + 5);

        this.log(`🔥【一揆】${p.name}で領民・土豪が蜂起！今季の収入が途絶（兵力-${desert}, 治安+5）`, 'important');

        return;

      }



      if (this.seasonIdx === SEASON.AUTUMN) {

        const riceMult = this.getAutumnRiceMultiplier(p);

        const diffRiceMult = (this.currentDifficulty === 'relaxed' && !this.isSpectatorMode) ? 2 : 1;

        const gained = Math.round(p.rice * 1.2 * mult * riceMult * diffRiceMult);

        totalRiceHarvest += gained;

        if (riceMult > 1) specialtyRiceBonus += Math.round(gained * (riceMult - 1) / riceMult);

        const port = (window.SPECIALTY_SYNERGY || []).find(r => r.id === 'port');

        if (port && this.provinceMatchesSpecialty(p, port)) {

          p.defense = Math.min(this.getProvinceMaxDefense(p), (p.defense || 50) + (port.effects.autumnDefenseBonus || 2));

          p.troops = (p.troops || 0) + (port.effects.autumnTroopBonus || 80);

          this.playerGunSupply = true;

          portGunNotes++;

        }

      }

      if (this.seasonIdx === SEASON.MIDSUMMER || this.seasonIdx === SEASON.WINTER) {

        totalCommerceIncome += Math.round(this.provinceCommerceIncome(p) * mult); // 開発分の上乗せ（2026-10-11 ce）

      }

    });



    // 城壁の季節持ち越し：削られた城壁はすぐには100に戻らず、自然修復は毎季+3にとどまる（連続攻略が容易）

    this.provinces.forEach(p => {

      const baseDef = (window.INITIAL_PROVINCES || window.PROVINCES_DATA || []).find(x => x.id === p.id)?.defense || 60;

      if (p.defense < baseDef) {

        p.defense = Math.min(baseDef, p.defense + 3);

      }

    });



    this.rice = Math.max(0, this.rice + totalRiceHarvest);

    this.gold += totalCommerceIncome;



    // 金山・銀山ボーナス：佐渡・石見・但馬・甲斐などを支配すると、毎季の金収入に固定ボーナス（+100貫/国）が入る

    const mineInfo = this.getMineBonusInfo(this.playerClanId);

    if (mineInfo.hasBonus) {

      this.gold += mineInfo.bonusGold;

      this.log(`⛏️【金山・銀山産出】${mineInfo.names.join('・')}（${mineInfo.count}州）より毎季固定ボーナス金 +${mineInfo.bonusGold}貫を収納！`);

    }



    // 鉄砲鍛冶・港町ボーナス：種子島・和泉（堺）・近江（国友）・肥前（長崎）を支配すると商業収入アップ

    const gunPortInfo = this.getGunsmithPortBonusInfo(this.playerClanId);

    if (gunPortInfo.hasBonus) {

      this.gold += gunPortInfo.extraCommerceGold;

      this.log(`⚓【鉄砲鍛冶・南蛮港町】${gunPortInfo.names.join('・')}の貿易・鍛冶運上金 +${gunPortInfo.extraCommerceGold}貫を獲得！`);

    }



    // 兵の維持費（毎季。払えない分は払わない。2026-10-11 ci）

    {

      const rate = this.troopUpkeepRate ? this.troopUpkeepRate() : 0;

      const myTroops = myProvs.reduce((s, p) => s + (Number(p.troops) || 0), 0);

      const due = Math.round(myTroops * rate);

      const paid = Math.max(0, Math.min(Math.max(0, this.gold), due));

      if (paid > 0) {

        this.gold -= paid;

        this.log(`🪖【兵の維持費】兵 ${myTroops.toLocaleString()} 人の扶持として金 ${paid.toLocaleString()} 貫${paid < due ? `（不足 ${(due - paid).toLocaleString()} 貫は未払い）` : ''}`, 'quiet');

      }

      this.lastTroopUpkeep = { due, paid };

    }



    if (this.seasonIdx === SEASON.AUTUMN && totalRiceHarvest > 0) {

      const extras = [];

      if (directRuleCount > 0) extras.push(`直轄領${directRuleCount}州は能力半減`);

      if (specialtyRiceBonus > 0) extras.push(`穀倉シナジー+${specialtyRiceBonus.toLocaleString()}石`);

      if (portGunNotes > 0) extras.push(`南蛮貿易港${portGunNotes}州から鉄砲・砲術資材を補給`);

      const extraNote = extras.length ? `（※${extras.join('／')}）` : '。全城主の善政により満額の収穫を達成！';

      this.log(`🌾【秋の収穫】領国より兵糧 ${totalRiceHarvest.toLocaleString()} 石を収納${extras.length ? '。' + extraNote : extraNote}`);

    }

    if ((this.seasonIdx === SEASON.MIDSUMMER || this.seasonIdx === SEASON.WINTER) && totalCommerceIncome > 0) {

      const directNote = directRuleCount > 0 ? `（※直轄領${directRuleCount}州は能力半減で金収入50%）` : '（全城配備により満額収納）';

      this.log(`💰【商港・城下町運上】領国より金 ${totalCommerceIncome.toLocaleString()} 貫を徴収。${directNote}`);

    }

    if (ikkiCount > 0) {

      this.log(`⚠【一揆報告】今季 ${ikkiCount}州で一揆が発生し、当該領の収入が途絶しました。`, 'important');

    }



    // 浪人の他家・自軍仕官判定

    this.processRoninEmployment();



    // 空白地での過去大名武将の旗揚げ・御家再興

    this.processBlankProvinceUprisings();



    // 途中雇用・待機武将の本拠城主任命（全勢力）

    this.appointHistoricalHomeGovernors();



    // AI大名の行動（非同期実行でUIフリーズを防止）

    await this.executeAiTurn();

    this.maintainAlliances();



    // 攻略で空いた支城と、本拠に残った家臣を、ゆかりの地優先で城主にする

    this.autoAppointComputerCastellans({ fillVacancies: true });



    // 反覇道包囲網判定

    if (!this.coalitionFormed && this.coalitionShouldForm(myProvs.length)) { // 開始時から大きい家には猶予（2026-10-11 ck）

      this.coalitionFormed = true;

      document.getElementById('coalitionBanner').style.display = 'block'; { const hb = document.getElementById('coalitionHeaderBadge'); if (hb) hb.style.display = 'inline-flex'; }

      this.music.playTrack('crisis', false, { stinger: true, noFirstHit: true });

      this.log('⚠【反覇道包囲網 結成】貴家の急拡大を恐れた諸大名が同盟を結成しました！', 'important');

      this.formCoalitionAlliances();

      const coalOpts = {

        icon: 'warning',

        title: '⚠ 反覇道包囲網 結成！',

        text: '天下の諸大名が密かに結託し、貴家打倒の包囲網を結成しました！国境各城の防備を固めてください！',

        background: '#241710',

        color: '#ffaaaa'

      };

      if (this.isAutoPlay) {

        coalOpts.timer = Math.max(120, Math.round(this.autoPlaySpeed * 700));

        coalOpts.timerProgressBar = true;

      }

      Swal.fire(coalOpts);

    } else {

      // 季節替わりの曲の頭は打楽器なし（2026-10-11 bq）

      this.music.playTrack(this.getSeasonTrackKey(), false, { seasonRestart: true });

    }



    const now = Date.now();

    if (!this.isAutoPlay || this.autoPlaySpeed >= 0.3 || (now - (this._lastHyoshigiTime || 0)) > 350) {

      this.audio.playHyoshigi();

      this._lastHyoshigiTime = now;

    }

    this.log(`【季節進行】${formatYearWithEra(this.year)}年 ${this.seasonNames[this.seasonIdx]}へ。軍令権が回復しました。`);



    const updatedMyProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    if (!this.isSpectatorMode && updatedMyProvs.length === 0) {

      if (this.isAutoPlay) this.stopAutoPlay('御家滅亡のため');

      this.triggerDefeat();

      return 'defeat';

    }

  },



  /**

   * 季節進行の画面描画（Render）処理

   */

  renderSeason() {

    // [42位] 前線から後方へ移行した国の統治方針を自動切替

    this.checkAutoFrontierPolicySwitch();

    // [81位] 季節ごとの領土拡大履歴の記録

    this.recordTerritoryHistory();



    // 領国・勢力ステータスとマップ表示を必ず先行更新（委任進攻結果を確実に画面へ反映）

    this.updateUI();



    if (this.checkEndGameConditions()) {

      if (this.isAutoPlay) this.stopAutoPlay('天下統一達成のため');

      return;

    }



    // 季節ビジュアルとバナーの更新

    this.updateSeasonVisuals();

    this.showSeasonNoticeBanner(this.year, this.seasonNames[this.seasonIdx], this.currentWeather);



    // 歴史大イベントの判定と発火（仮想シナリオでは発生させない。予約中は次の季節へ進めない）

    if (!this.isVirtualScenario()) {

      this.scheduleHistoricalEventCheck(this.isAutoPlay ? 0 : 700);

    }



    // 攻略保護フラグの解除

    this.provinces.forEach(p => { delete p.justConquered; });



    // 自動セーブ実行

    this.autoSave();

  },
};
