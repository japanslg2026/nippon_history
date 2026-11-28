/**
 * @file js/core/state/CoalitionAndSave.js - GameState から機能別に分割したメソッド群（9個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { DAIMYOS, HISTORICAL_ALLIANCE_BONDS, INITIAL_PROVINCES, SAVE_SLOTS, SCENARIOS, SEASONS_PER_YEAR, formatYearWithEra, legacySeasonCountToNew, legacySeasonIdxToNew, legacyTurnIndexToNew, safeStorageSet, validateSaveData } from '../GameStateShared.js?v=20261128_v74';

export const CoalitionAndSaveMethods = {



  // ============================================================================

  // AI大名の行動処理（攻撃・内政・成長）

  // ============================================================================,



  formCoalitionAlliances() {

    const neighbors = new Set();

    (this.provinces || []).filter(p => p.ownerId === this.playerClanId).forEach(p => {

      (p.neighbors || []).forEach(nId => {

        const n = this.provinces.find(x => x.id === nId);

        if (n && n.ownerId && n.ownerId !== this.playerClanId) neighbors.add(n.ownerId);

      });

    });

    HISTORICAL_ALLIANCE_BONDS.forEach(bond => {

      if (this.year < bond.from || this.year > bond.to) return;

      if (!neighbors.has(bond.a) || !neighbors.has(bond.b)) return;

      if (bond.a === this.playerClanId || bond.b === this.playerClanId) return;

      if (!this.isClanExtant(bond.a) || !this.isClanExtant(bond.b)) return;

      if (this.isAllied(bond.a, bond.b)) return;

      if (!bond.remote && !this.clansShareBorder(bond.a, bond.b)) return;

      this.alliances.push({

        members: [bond.a, bond.b],

        formedYear: this.year,

        formedSeason: this.seasonIdx,

        kind: 'coalition'

      });

      this.log(`🤝【包囲網同盟】${this.allianceClanLabel(bond.a)}と${this.allianceClanLabel(bond.b)}が${bond.label}を結び、貴家に対抗します。`);

    });

  },





  // AI大名の兵糧事情：現在の石高合計 / 基準石高合計（飢饉直後は 1 を大きく下回る）,



  clanHasLivingLord(clanId) {

    if (!clanId) return false;

    return (this.activeOfficers || []).some(o => o && o.clanId === clanId && o.isDaimyo && !o.isDead);

  },



  /** 現在の戦況から完全なセーブデータオブジェクトを生成 */

  createSaveData() {

    // 領国データの差分抽出（SVGパスや座標などの静的マスターは除外）

    const provincesDelta = (this.provinces || []).map(p => ({

      id: p.id,

      ownerId: p.ownerId,

      troops: p.troops,

      rice: p.rice,

      gold: p.gold,

      commerce: p.commerce,

      defense: p.defense,

      order: p.order,

      morale: p.morale,

      castle: p.castle,

      castleName: p.castleName,

      justConquered: !!p.justConquered,

      governance: p.governance,

      jodaiId: p.jodaiId || p.governorId || null,

      isCapital: !!p.isCapital

    }));



    // アクティブ武将の差分抽出（列伝・能力値・生没年などの静的マスターは除外）

    const officersDelta = (this.activeOfficers || []).map(o => ({

      id: o.id,

      clanId: o.clanId,

      assignedProvId: o.assignedProvId || o.provId || null,

      isDaimyo: !!o.isDaimyo,

      hasBeenDaimyo: !!o.hasBeenDaimyo,

      isCastellan: !!o.isCastellan,

      isDead: !!o.isDead,

      virtualLifespan: !!o._virtualLifespan,

      virtualBirthYear: o._virtualLifespan ? o.birthYear : null,

      virtualDeathYear: o._virtualLifespan ? o.deathYear : null,

      loyalty: o.loyalty,

      actionDone: !!o.actionDone,

      defaultProv: o.defaultProv || null,

      isStandby: !!o.isStandby && o.canBeGovernor !== false && o.id !== 'off_dm_amago_1560'

    }));



    return {

      version: 4, // 差分セーブフォーマット（v3: 士気・城名・直前攻略・浪人/待機武将の所在、v4: AI の金・兵糧・外交記憶）

      year: this.year,

      seasonIdx: this.seasonIdx,

      seasonScheme: SEASONS_PER_YEAR, // 5ターン制（春・初夏・盛夏・秋・冬）のセーブ

      ambitionState: this.ambitionState || null, // 大名の志向（地方統一の達成状況）

      playerClanId: this.playerClanId,

      gold: this.gold,

      rice: this.rice,

      ap: this.ap,

      coalitionEnabled: !!this.coalitionEnabled,

      coalitionFormed: this.coalitionFormed,

      coalitionWatch: this.coalitionWatch || null,

      shogunAppointed: !!this.shogunAppointed,

      shogunAtStart: !!this.shogunAtStart,

      breakawayTruces: this.breakawayTruces || [],

      alliances: this.alliances,

      allianceCooldown: this.allianceCooldown || {},

      aiEconomy: this.aiEconomy || {},

      aiDiploMemory: this.aiDiploMemory || {},

      currentScenarioId: this.currentScenarioId,

      currentDifficulty: this.currentDifficulty,

      virtualDeadOfficerIds: [...(this._virtualDeadOfficerIds || [])],

      provincesDelta: provincesDelta,

      officersDelta: officersDelta,

      foundingLeaderNames: this.foundingLeaderNames || {},

      lastDaimyoNames: this.lastDaimyoNames || {},

      clanLookOverrides: this.clanLookOverrides || {},

      kiyohiraFujiwaraAccepted: !!this.kiyohiraFujiwaraAccepted,

      kiyohiraSurnameDeclined: !!this.kiyohiraSurnameDeclined,

      tenmuEnthronementAccepted: !!this.tenmuEnthronementAccepted,

      tenmuEnthronementDeclined: !!this.tenmuEnthronementDeclined,

      jimmuEnthronementAccepted: !!this.jimmuEnthronementAccepted,

      jimmuEnthronementDeclined: !!this.jimmuEnthronementDeclined,

      // 歴史イベントの進行（再読込で同じイベントが二重に出ないように）

      historyStateVersion: 1,

      triggeredHistoricalEvents: [...(this.triggeredHistoricalEvents || [])],

      happenedEvents: [...(this.happenedEvents || [])],

      oncePerPlaythroughFired: [...(this.oncePerPlaythroughFired || [])],

      pendingHistoricalEvents: this.pendingHistoricalEventItems(),

      historyCheckPending: !!this._historyCheckPending,

      honnojiSplit: !!this.honnojiSplit,

      honnoujiAverted: !!this.honnoujiAverted,

      okehazamaOccurred: !!this.okehazamaOccurred,

      kanazawaOccurred: !!this.kanazawaOccurred,

      savedAt: new Date().toISOString()

    };

  },



  autoSave(force = false) {

    const now = Date.now();

    if (!force && this.isAutoPlay && (now - (this._lastAutoSaveTime || 0)) < 2000) {

      return;

    }

    this._lastAutoSaveTime = now;

    try {

      const saveData = this.createSaveData();

      const jsonStr = JSON.stringify(saveData);



      // 直前のセーブデータが存在し、かつ進行状況が異なる場合はバックアップに退避

      const existing = localStorage.getItem('sengoku_save_data');

      if (existing) {

        try {

          const prev = JSON.parse(existing);

          // 前回と異なるシナリオ、または前回のセーブから進行している場合は直前バックアップに保管

          if (prev && (String(prev.currentScenarioId) !== String(saveData.currentScenarioId) || prev.year !== saveData.year || prev.seasonIdx !== saveData.seasonIdx)) {

            safeStorageSet('sengoku_save_data_bak', existing);

          }

        } catch (err) {}

      }



      // 自動保存枠（最新）に保存

      safeStorageSet('sengoku_save_data', jsonStr);



      // シナリオ別自動保存枠にも保存（各シナリオの進行状況を保護）

      if (this.currentScenarioId) {

        safeStorageSet(`sengoku_save_scen_${this.currentScenarioId}`, jsonStr);

      }

    } catch (e) {

      console.warn('Auto-save failed:', e);

    }

  },



  /** 指定スロットに戦況を保存 */

  saveToSlot(slotId) {

    try {

      const targetSlot = (SAVE_SLOTS || []).find(s => s.id === slotId) || { key: `sengoku_save_${slotId}` };

      const saveData = this.createSaveData();

      safeStorageSet(targetSlot.key, JSON.stringify(saveData));

      return { success: true, slot: targetSlot, data: saveData };

    } catch (e) {

      console.error('Save to slot failed:', e);

      return { success: false, error: e };

    }

  },



  /** 指定スロットから戦況を読み込み */

  loadFromSlot(slotId) {

    try {

      const targetSlot = (SAVE_SLOTS || []).find(s => s.id === slotId) || { key: `sengoku_save_${slotId}` };

      const raw = localStorage.getItem(targetSlot.key);

      if (!raw) return { success: false, message: '記録データが存在しません。' };

      const data = JSON.parse(raw);

      const val = validateSaveData(data);

      if (!val.valid) return { success: false, message: val.message };

      this.loadGameData(data);

      return { success: true, slot: targetSlot, data };

    } catch (e) {

      console.error('Load from slot failed:', e);

      return { success: false, message: 'データの復元に失敗しました。', error: e };

    }

  },



  /** 指定スロットの記録を削除 */

  deleteSlot(slotId) {

    try {

      const targetSlot = (SAVE_SLOTS || []).find(s => s.id === slotId) || { key: `sengoku_save_${slotId}` };

      localStorage.removeItem(targetSlot.key);

      return { success: true, slot: targetSlot };

    } catch (e) {

      return { success: false, error: e };

    }

  },



  /** 旧4季制のセーブデータを5ターン制へ換算（季節・同盟期間・停戦期限など） */
  migrateLegacySeasonSave(data) {
    if (!data || typeof data !== 'object' || data.seasonScheme === SEASONS_PER_YEAR) return data;
    const d = { ...data, seasonScheme: SEASONS_PER_YEAR };
    d.seasonIdx = legacySeasonIdxToNew(data.seasonIdx);
    if (Array.isArray(data.alliances)) {
      d.alliances = data.alliances.map(g => {
        if (!g || Array.isArray(g) || typeof g !== 'object') return g;
        const n = { ...g };
        if (Number.isFinite(g.formedSeason)) n.formedSeason = legacySeasonIdxToNew(g.formedSeason);
        if (Number.isFinite(g.durationSeasons)) n.durationSeasons = legacySeasonCountToNew(g.durationSeasons);
        return n;
      });
    }
    if (data.allianceCooldown && typeof data.allianceCooldown === 'object') {
      d.allianceCooldown = {};
      Object.entries(data.allianceCooldown).forEach(([k, v]) => { d.allianceCooldown[k] = Number.isFinite(v) ? legacyTurnIndexToNew(v) : v; });
    }
    if (Array.isArray(data.breakawayTruces)) {
      d.breakawayTruces = data.breakawayTruces.map(t => (t && Number.isFinite(t.until)) ? { ...t, until: legacyTurnIndexToNew(t.until) } : t);
    }
    return d;
  },

  async loadGameData(data) {

    const targetScenId = data && data.currentScenarioId;

    if (targetScenId && !data._fullScenariosReady && typeof window !== 'undefined' && window.DataLoader?.ensureScenario) {

      const scens = (window.SCENARIOS_DATA && window.SCENARIOS_DATA.length > 0)

        ? window.SCENARIOS_DATA

        : (typeof SCENARIOS !== 'undefined' ? SCENARIOS : []);

      const targetScen = scens.find(s => String(s.id) === String(targetScenId));

      if (targetScen && targetScen._isStub) {

        await window.DataLoader.ensureScenario(targetScenId);

        return this.loadGameData({ ...data, _fullScenariosReady: true });

      }

    }

    this.resetHistoricalEventRuntime();

    data = this.migrateLegacySeasonSave(data);

    this.ambitionState = (data.ambitionState && typeof data.ambitionState === 'object') ? data.ambitionState : null;

    this.year = data.year;

    this.seasonIdx = data.seasonIdx;

    this.playerClanId = data.playerClanId;

    this.gold = data.gold;

    this.rice = data.rice;

    this.ap = data.ap;

    this.coalitionEnabled = !!data.coalitionEnabled;

    this.coalitionFormed = !!data.coalitionFormed;

    this.syncCoalitionUI(); // ロード時に包囲網バッジ／バナーを復元（2026-10-25 d54）

    this.coalitionWatch = data.coalitionWatch && typeof data.coalitionWatch === 'object' ? data.coalitionWatch : null; // 古いセーブは次の季の国数を基準に（2026-10-11 ck）

    this.shogunAppointed = !!data.shogunAppointed; // 古いセーブは下（盤面復元後）で判定（2026-10-11 cc）

    this.shogunAtStart = !!data.shogunAtStart;

    this.breakawayTruces = Array.isArray(data.breakawayTruces) ? data.breakawayTruces : []; // 2026-10-11 cf

    this._legacyShogunCheck = typeof data.shogunAppointed !== 'boolean';

    this.currentScenarioId = data.currentScenarioId || '1560';

    this._virtualDeadOfficerIds = new Set(Array.isArray(data.virtualDeadOfficerIds) ? data.virtualDeadOfficerIds : []);

    const savedDifficulty = data.currentDifficulty;

    this.currentDifficulty = ['relaxed', 'easy', 'normal'].includes(savedDifficulty)

      ? savedDifficulty

      : (['hard', 'hell', 'shura'].includes(savedDifficulty) ? 'normal' : 'relaxed');


    this.alliances = this.normalizeAlliances(

      data.alliances || this.currentScenario?.alliances || [],

      this.year,

      this.seasonIdx,

      undefined,

      !data.alliances && this.currentScenario?.seasonScheme !== SEASONS_PER_YEAR

    );

    this.allianceCooldown = data.allianceCooldown || {};

    // v4: AI 勢力の金・兵糧と外交記憶（古いセーブは空 → 初回使用時に領国から初期化）

    this.aiEconomy = (data.aiEconomy && typeof data.aiEconomy === 'object') ? data.aiEconomy : {};

    this.aiDiploMemory = (data.aiDiploMemory && typeof data.aiDiploMemory === 'object') ? data.aiDiploMemory : {};



    // 1. 領国データの復元 (差分マージ or 旧形式復元)

    if (Array.isArray(data.provincesDelta)) {

      const baseProvs = (window.PROVINCES_DATA && window.PROVINCES_DATA.length > 0)

        ? window.PROVINCES_DATA

        : (typeof INITIAL_PROVINCES !== 'undefined' ? INITIAL_PROVINCES : []);

      const deltaMap = new Map(data.provincesDelta.map(d => [d.id, d]));

      this.provinces = baseProvs.map(bp => {

        const p = JSON.parse(JSON.stringify(bp));

        const delta = deltaMap.get(p.id);

        if (delta) {

          if (delta.ownerId !== undefined) p.ownerId = delta.ownerId;

          if (delta.troops !== undefined) p.troops = delta.troops;

          if (delta.rice !== undefined) p.rice = delta.rice;

          if (delta.gold !== undefined) p.gold = delta.gold;

          if (delta.commerce !== undefined) p.commerce = delta.commerce;

          if (delta.defense !== undefined) p.defense = delta.defense;

          if (delta.order !== undefined) p.order = delta.order;

          if (delta.governance !== undefined) p.governance = delta.governance;

          if (delta.jodaiId !== undefined) {

            p.jodaiId = delta.jodaiId;

            p.governorId = delta.jodaiId;

          }

          if (delta.isCapital !== undefined) p.isCapital = delta.isCapital;

          if (delta.morale !== undefined && delta.morale !== null) p.morale = delta.morale;

          if (delta.castle) p.castle = delta.castle;

          if (delta.castleName) p.castleName = delta.castleName;

          if (delta.justConquered) p.justConquered = true;

        }

        return p;

      });

    } else if (Array.isArray(data.provinces)) {

      this.provinces = data.provinces;

    }

    // v3 未満の古いセーブ：城名が保存されていないため、シナリオの城名と年代による城名変更を再適用する

    if (!(Number(data.version) >= 3)) {

      const scenForCastles = (typeof SCENARIOS !== 'undefined' ? SCENARIOS : []).find(s => String(s.id) === String(this.currentScenarioId));

      (this.provinces || []).forEach(p => {

        if (scenForCastles && scenForCastles.provinceNames && scenForCastles.provinceNames[p.id]) {

          p.name = scenForCastles.provinceNames[p.id];

        }

        if (scenForCastles && scenForCastles.castles && scenForCastles.castles[p.id]) {

          p.castle = scenForCastles.castles[p.id];

          p.castleName = scenForCastles.castles[p.id];

        }

      });

      if (scenForCastles && this.year > Number(scenForCastles.year)) this.updateCastlesForYear();

    }

    // 古い壊れたセーブデータ (NaN・undefined) もここで修復する

    (this.provinces || []).forEach(p => this.normalizeProvince(p));
    // 軍令権上限を領国数から再計算（旧セーブの固定上限3も更新）
    try { this.refreshMaxAp(); } catch (e) {}



    // 2. 武将データの復元 (差分マージ or 旧形式復元)

    if (Array.isArray(data.officersDelta) && Array.isArray(window.OFFICERS_MASTER)) {

      const deltaMap = new Map(data.officersDelta.map(d => [d.id, d]));

      const masterMap = new Map(window.OFFICERS_MASTER.map(m => [m.id, m]));

      this.activeOfficers = [];

      data.officersDelta.forEach(d => {

        const master = masterMap.get(d.id);

        if (master) {

          const off = JSON.parse(JSON.stringify(master));

          if (d.clanId !== undefined) off.clanId = d.clanId;

          off.assignedProvId = d.assignedProvId || null;

          off.provId = off.assignedProvId;

          off.isDaimyo = !!d.isDaimyo;

          off.hasBeenDaimyo = !!d.hasBeenDaimyo;

          off.isCastellan = !!d.isCastellan;

          off.isDead = !!d.isDead;

          if (d.virtualLifespan) {

            off._virtualLifespan = true;

            off.birthYear = d.virtualBirthYear;

            off.deathYear = d.virtualDeathYear;

          }

          if (d.loyalty !== undefined) off.loyalty = d.loyalty;

          if (d.actionDone !== undefined) off.actionDone = !!d.actionDone;

          if (d.defaultProv) off.defaultProv = d.defaultProv;

          if (d.isStandby !== undefined) off.isStandby = !!d.isStandby;

          this.activeOfficers.push(off);

        }

      });

      this.officers = this.activeOfficers;

    } else if (data.activeOfficers) {

      this.activeOfficers = data.activeOfficers;

      this.officers = this.activeOfficers;

    }

    this.updateActiveOfficers();



    const loadedScen = (typeof SCENARIOS !== 'undefined' ? SCENARIOS : []).find(s => String(s.id) === String(this.currentScenarioId));

    if (loadedScen) this.currentScenario = loadedScen;

    // 上限を超えて伸びた古いセーブの石高を上限まで下げる（2026-10-11 bh）

    const commerceClamped = this.clampAllProvinceCommerce?.() || 0;

    if (commerceClamped) this.log?.(`💰【商業上限】${commerceClamped}州の商業が土地の上限を超えていたため、上限まで改めました。`, 'quiet');

    const riceClamped = this.clampAllProvinceRice?.() || 0;

    if (riceClamped) this.log?.(`🌾【石高上限】${riceClamped}州の石高が土地の上限を超えていたため、上限まで改めました。`, 'quiet');

    if (this.currentScenario && this.activeOfficers) {

      this.resolveOfficerAffiliations(this.currentScenario);

    }

    (this.activeOfficers || []).forEach(o => {

      if (!o.clanId || o.clanId === 'ronin') {

        o.clanId = 'ronin';

        o.assignedProvId = null;

        o.provId = null;

        o.isDaimyo = false;

        o.isCastellan = false;

      }

    });

    (this.provinces || []).forEach(p => {

      if (!p.governorId) return;

      const gov = (this.activeOfficers || []).find(o => o.id === p.governorId);

      if (!gov || gov.isDead || !p.ownerId || gov.clanId === 'ronin' || gov.clanId !== p.ownerId) {

        p.governorId = null;

      }

    });

    this.foundingLeaderNames = data.foundingLeaderNames || this.foundingLeaderNames || {};

    // 家督相続で借りた家紋・領国色（無い古いセーブは上書きなし。2026-10-11 bp）

    this.clanLookOverrides = (data.clanLookOverrides && typeof data.clanLookOverrides === 'object') ? data.clanLookOverrides : {};

    this.lastDaimyoNames = data.lastDaimyoNames || { ...(this.foundingLeaderNames || {}) };

    this.kiyohiraFujiwaraAccepted = !!data.kiyohiraFujiwaraAccepted;

    this.kiyohiraSurnameDeclined = !!data.kiyohiraSurnameDeclined;

    this.tenmuEnthronementAccepted = !!data.tenmuEnthronementAccepted;

    this.tenmuEnthronementDeclined = !!data.tenmuEnthronementDeclined;

    this.jimmuEnthronementAccepted = !!data.jimmuEnthronementAccepted;

    this.jimmuEnthronementDeclined = !!data.jimmuEnthronementDeclined;

    this.triggeredHistoricalEvents = new Set(Array.isArray(data.triggeredHistoricalEvents) ? data.triggeredHistoricalEvents : []);

    this.happenedEvents = new Set(Array.isArray(data.happenedEvents) ? data.happenedEvents : []);

    // 1回だけのイベント：保存された記録に加え、古いセーブの発火済み記録も引き継ぐ（ui_fixed12）

    this.oncePerPlaythroughFired = new Set(Array.isArray(data.oncePerPlaythroughFired) ? data.oncePerPlaythroughFired : []);

    this.onceEventIds().forEach(id => { if (this.triggeredHistoricalEvents.has(id) || this.happenedEvents.has(id)) this.oncePerPlaythroughFired.add(id); });

    this._requeueOnceEvents = [];

    this.honnojiSplit = !!data.honnojiSplit;

    this.honnoujiAverted = !!data.honnoujiAverted;

    this.okehazamaOccurred = !!data.okehazamaOccurred;

    this.kanazawaOccurred = !!data.kanazawaOccurred;

    const hasHistoryState = Number(data.historyStateVersion) >= 1;

    if (hasHistoryState) {

      this.releasePendingHistoricalEvents(data.pendingHistoricalEvents);

    } else {

      this.sealCurrentSeasonHistoricalEvents();

    }

    this.updateKiyohiraSurname(false);

    this.updateTenmuEnthronement(false);

    this.updateJimmuEnthronement(false);

    this.updateClanNameEras(false);



    const templateDaimyo = (typeof DAIMYOS !== 'undefined' ? DAIMYOS : []).find(x => x.id === this.playerClanId);

    if (templateDaimyo) {

      this.playerDaimyo = JSON.parse(JSON.stringify(templateDaimyo));

    } else {

      const scen = (typeof SCENARIOS !== 'undefined' ? SCENARIOS : []).find(s => String(s.id) === String(this.currentScenarioId));

      const found = scen?.playables.find(d => d.id === this.playerClanId) || scen?.playables[0];

      this.playerDaimyo = found ? JSON.parse(JSON.stringify(found)) : null;

    }

    const livingLord = (this.activeOfficers || []).find(o => o.clanId === this.playerClanId && o.isDaimyo && !o.isDead);

    if (livingLord && this.playerDaimyo) {

      this.playerDaimyo.name = livingLord.name;

      this.playerDaimyo.officerId = livingLord.id;

      this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

    }



    const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    if (myProvs.length > 0) {

      const homeProv = this.getPlayerHomeProvince();

      this.selectProvince(homeProv ? homeProv.id : myProvs[0].id);

    }



    if (this._legacyShogunCheck) { // 項目の無い古いセーブ：今条件を満たしていれば達成済み（読込のたびの再宣下を防ぐ。2026-10-11 cc）

      this._legacyShogunCheck = false;

      if (this.meetsShogunCondition()) this.shogunAppointed = true;

    }

    this.music.init();

    this.music.playTrack(this.getSeasonTrackKey());

    this.updateUI();

    this.log(`【戦況再開】${formatYearWithEra(this.year)}年 ${this.seasonNames[this.seasonIdx]}の記録から戦況を再開しました！`, 'important');

    Swal.fire({ icon: 'success', title: '戦況再開完了', text: `${this.playerDaimyo?.name || ''}公の覇業を再開しました。`, background: '#241710', color: '#fff' });

    // 選ぶ前に保存された今季のイベントを出し直す（発火済みのものは出ない。仮想シナリオでは発生させない）

    if (hasHistoryState && !this.isVirtualScenario()) this.scheduleHistoricalEventCheck(900);

  },
};
