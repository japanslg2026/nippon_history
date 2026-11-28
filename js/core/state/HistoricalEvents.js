/**
 * @file js/core/state/HistoricalEvents.js - GameState から機能別に分割したメソッド群（61個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { ALLIANCE_DURATION_SEASONS, EVENT_TROOP_ADD_CAP, EVENT_TROOP_BOOST_CAP, SCENARIOS, gameRandom, legacySeasonCountToNew, normalizeSeasonName } from '../GameStateShared.js?v=20261128_v74';

export const HistoricalEventsMethods = {



  getHistoricalEventsMaster() {

    return window.HISTORICAL_CHOICE_EVENTS || [];

  },



  /** events.json の rules / choiceEventRules から組み立てた、イベントIDごとの特殊扱い */



  historicalEventRules() {
    // 歴史イベントの特殊扱いはすべて data/events.json に書く：
    //  各イベントの rules（neverNoop / skipWhenFlag / setFlagOnPrereqSkip / setFlagOnReject / succession / clanCollapse /
    //  onApply / acceptEffectLines / playerRejectBonus）と、選択イベント用の choiceEventRules。ここで ID→値 の表に組み直す
    const data = (typeof window !== 'undefined' && window.HISTORICAL_EVENTS_DATA) || [];
    const choice = (typeof window !== 'undefined' && window.HISTORICAL_CHOICE_EVENT_RULES) || {};
    const cache = this._historicalRulesCache;
    if (cache && cache.data === data && cache.choice === choice && cache.len === data.length) return cache.rules;
    const R = {
      neverNoop: [], skipWhenFlag: {}, setFlagOnPrereqSkip: {}, setFlagOnReject: {}, setFlagOnIfChoice: {},
      successionEvents: [], clanCollapse: {}, onApply: {}, acceptEffectLines: {}, playerRejectBonus: {},
      repeatablePerSeason: [], deferToSeasonEnd: [], oncePerPlaythrough: []
    };
    (Array.isArray(data) ? data : []).forEach(ev => {
      const r = ev && ev.rules;
      if (!r || !ev.id) return;
      if (r.neverNoop) R.neverNoop.push(ev.id);
      [].concat(r.skipWhenFlag || []).forEach(flag => {
        if (!flag) return;
        (R.skipWhenFlag[flag] = R.skipWhenFlag[flag] || []).push(ev.id);
      });
      ['setFlagOnPrereqSkip', 'setFlagOnReject', 'clanCollapse', 'onApply', 'acceptEffectLines', 'playerRejectBonus'].forEach(key => {
        if (r[key]) R[key][ev.id] = r[key];
      });
      if (r.succession) R.successionEvents.push(ev.id);
    });
    Object.entries(choice || {}).forEach(([id, r]) => {
      if (!r) return;
      if (r.setFlagOnIfChoice) R.setFlagOnIfChoice[id] = r.setFlagOnIfChoice;
      ['repeatablePerSeason', 'deferToSeasonEnd', 'oncePerPlaythrough'].forEach(key => { if (r[key]) R[key].push(id); });
    });
    this._historicalRulesCache = { data, choice, len: data.length, rules: R };
    return R;
  },
  /** イベントの rules（events.json）。無ければ空 */
  historicalEventRuleSet(ev) {
    return (ev && ev.rules && typeof ev.rules === 'object') ? ev.rules : {};
  },
  /** 本能寺型の後継データ（events.json の rules.succession）。ev を省くと最初に見つかったもの */
  historicalSuccessionData(ev) {
    const own = ev && ev.rules && ev.rules.succession;
    if (own && typeof own === 'object') return own;
    const found = ((typeof window !== 'undefined' && window.HISTORICAL_EVENTS_DATA) || [])
      .find(e => e && e.rules && e.rules.succession && typeof e.rules.succession === 'object');
    return found ? found.rules.succession : {};
  },
  /** フラグ（rules.onApply.flag）を立てる出来事、またはそれに結ばれた選択イベントが既に起きたか */
  historicalFlagEventHappened(flag) {
    if (!flag || !this.happenedEvents) return false;
    return ((typeof window !== 'undefined' && window.HISTORICAL_EVENTS_DATA) || []).some(ev => {
      const r = ev && ev.rules;
      if (!r || !r.onApply || r.onApply.flag !== flag) return false;
      if (this.happenedEvents.has(ev.id)) return true;
      const link = r.linkedChoice && (r.linkedChoice.choiceId || r.linkedChoice);
      return typeof link === 'string' && this.happenedEvents.has(link);
    });
  },
  /** 選択イベントに結ばれた歴史イベント（rules.linkedChoice / rules.rebellion）が既に起きたか */
  linkedDataEventHappened(choiceId) {
    if (!choiceId || !this.happenedEvents) return false;
    return ((typeof window !== 'undefined' && window.HISTORICAL_EVENTS_DATA) || []).some(ev => {
      const r = ev && ev.rules;
      if (!r) return false;
      const linked = (r.linkedChoice && (r.linkedChoice.choiceId || r.linkedChoice)) === choiceId
        || (r.rebellion && r.rebellion.choiceId === choiceId);
      return linked && this.happenedEvents.has(ev.id);
    });
  },



  /** ルールの ID 配列にイベントが含まれるか */



  eventRuleHas(listKey, evId) {

    const list = this.historicalEventRules()[listKey];

    return Array.isArray(list) && !!evId && list.includes(evId);

  },



  /** ルールの ID→値 表から値を取る */



  eventRuleFor(mapKey, evId) {

    const map = this.historicalEventRules()[mapKey];

    return (map && evId && Object.prototype.hasOwnProperty.call(map, evId)) ? map[evId] : null;

  },



  /** 本能寺型（領地分割＋後継選択）のイベントか */



  isSuccessionEvent(ev) {

    return !!(ev && (ev.isHonnouji || ev.chooseSuccessor || this.eventRuleHas('successionEvents', ev.id)));

  },



  /** フラグが立っていると起こさないイベントか */



  eventBlockedByFlag(evId) {

    const gates = this.historicalEventRules().skipWhenFlag || {};

    return Object.entries(gates).some(([flag, ids]) => !!this[flag] && Array.isArray(ids) && ids.includes(evId));

  },



  /** ルールが指定するフラグを立てる（許可された真偽フラグだけ） */



  setHistoricalFlag(flag) {
    if (this.isHistoricalStateKey(flag)) this[flag] = true;
  },
  /** events.json から書き換えてよい真偽フラグ名（〜Averted / 〜Occurred / 〜Accepted / 〜Declined だけ） */
  isHistoricalStateKey(key) {
    return typeof key === 'string' && /^[a-z][A-Za-z0-9]*(Averted|Occurred|Accepted|Declined)$/.test(key);
  },
  /** rules.afterApply / rules.onDecline の state：許可された真偽フラグを書き換える */
  setHistoricalStates(state) {
    if (!state || typeof state !== 'object') return;
    Object.entries(state).forEach(([key, value]) => {
      if (this.isHistoricalStateKey(key)) this[key] = !!value;
    });
  },
  /** events.json から呼んでよい改名・昇格処理（引数は 適用=true / 見送り=false） */
  historicalHookTable() {
    return {
      updateTokugawaSurname: (v) => this.updateTokugawaSurname(v),
      updateKiyohiraSurname: (v) => this.updateKiyohiraSurname(v),
      updateTenmuEnthronement: (v) => this.updateTenmuEnthronement(v),
      updateJimmuEnthronement: (v) => this.updateJimmuEnthronement(v)
    };
  },
  runHistoricalHook(name, value) {
    const fn = name && this.historicalHookTable()[name];
    if (fn) fn(value);
  },



  /** 史実適用時の付帯処理（フラグ・改名）。hook は許可リストのみ */



  runHistoricalApplyHooks(evId) {

    const rule = this.eventRuleFor('onApply', evId);

    if (!rule) return;

    if (rule.flag) this.setHistoricalFlag(rule.flag);
    if (rule.hook) this.runHistoricalHook(rule.hook, true);

  },



  historicalEventLinks() {
    // events.json の rules.linkedChoice：{ choiceId, year, season }（年・季節を省くとイベントと同じ）
    const links = [];
    ((typeof window !== 'undefined' && window.HISTORICAL_EVENTS_DATA) || []).forEach(ev => {
      const lc = ev && ev.rules && ev.rules.linkedChoice;
      if (!lc) return;
      const choiceId = typeof lc === 'string' ? lc : lc.choiceId;
      if (!choiceId) return;
      const year = (lc.year !== undefined && lc.year !== null) ? lc.year : ev.year;
      const season = normalizeSeasonName(lc.season || ev.season); // 旧「夏」は盛夏
      const same = links.find(l => l.choiceId === choiceId && l.year === year && l.season === season);
      if (same) same.dataIds.push(ev.id);
      else links.push({ choiceId, dataIds: [ev.id], year, season });
    });
    return links;
  },



  /** 豊作など再発しうるイベントは年・季節付きで発火済みを記録する */



  /** 1回のプレーで1度しか起きないイベントのID（ui_fixed12） */

  onceEventIds() {

    const r = this.historicalEventRules().oncePerPlaythrough || [];

    return Array.isArray(r) ? r : [];

  },



  historicalOccurrenceId(ev) {

    if (!ev || !ev.id) return null;

    if (this.eventRuleHas('repeatablePerSeason', ev.id)) return `${ev.id}:${this.year}:${this.seasonIdx}`;

    return ev.id;

  },



  continueAfterHistoricalEvent() {

    const resolve = this._historyEventDone;

    this._historyEventDone = null;

    if (typeof resolve === 'function') {

      resolve();

      return;

    }

    // フォールバック（Promise 外から呼ばれた場合）。走行中の待ち行列には触らない

    if (!this._historyQueueRunning) void this.processHistoricalEventQueue();

  },



  async processHistoricalEventQueue() {

    if (this.isVirtualScenario()) {

      this.pendingHistoryQueue = [];

      this._historyQueueRunning = false;

      this.resumeAutoPlayAfterEvent();

      return;

    }

    if (this._historyQueueRunning) return;

    if (!this.pendingHistoryQueue || !this.pendingHistoryQueue.length) {

      this.resumeAutoPlayAfterEvent();

      return;

    }

    this._historyQueueRunning = true;

    if (this.isAutoPlay) this.pauseAutoPlayForEvent();

    let interruptedByBattle = false;

    try {

      while (this.pendingHistoryQueue && this.pendingHistoryQueue.length) {

        if (this.inBattle) { interruptedByBattle = true; break; }

        const next = this.pendingHistoryQueue.shift();

        if (!next || !next.ev) continue;

        // 1回だけのイベントは観戦モードでは出さない（ui_fixed12）

        if (this.isSpectatorMode && this.onceEventIds().includes(next.ev.id)) continue;

        // ダイアログ呼び出し直前に確実に発火済みフラグを立てる

        this.triggeredHistoricalEvents = this.triggeredHistoricalEvents || new Set();

        this.happenedEvents = this.happenedEvents || new Set();

        const occId = this.historicalOccurrenceId(next.ev);

        this.triggeredHistoricalEvents.add(occId);

        this.happenedEvents.add(occId);

        this._historyCurrentItem = next;

        await new Promise((resolve) => {

          this._historyEventDone = resolve;

          try {

            if (next.type === 'data') this.fireHistoricalEvent(next.ev);

            else this.showHistoricalEvent(next.ev);

          } catch (e) {

            console.error('historical event failed', next.ev && next.ev.id, e);

            this._historyEventDone = null;

            resolve();

          }

        });

        this._historyCurrentItem = null;

      }

    } finally {

      this._historyQueueRunning = false;

      this._historyEventDone = null;

      this._historyCurrentItem = null;

      if (interruptedByBattle) {

        // 残りは合戦後に出す（取りこぼし・永久待機を防ぐ）

        this.resumeHistoryQueueWhenFree();

      } else {

        this.resumeAutoPlayAfterEvent();

        // 選択結果を記録しておき、再読込で同じイベントが出直さないようにする

        if ((this.provinces || []).some(p => p.ownerId === this.playerClanId)) this.autoSave(true);

      }

    }

  },



  /** 史実の前提（当事者の家が地図上にいるか）。満たさない出来事は起こさない */



  historicalEventPrereqMet(ev) {

    if (!ev) return false;

    const required = Array.isArray(ev.requiresClans) ? ev.requiresClans : [];
    // requiresOwners：{ 国ID: [家ID…] } その国を指定の家が持っているときだけ起こす（2026-11-20）
    const reqOwners = (ev.requiresOwners && typeof ev.requiresOwners === 'object') ? ev.requiresOwners : null;
    if (reqOwners && !Object.entries(reqOwners).every(([pId, list]) => {
      const prov = (this.provinces || []).find(p => p.id === pId);
      const ids = [].concat(list || []);
      return !!prov && ids.some(c => prov.ownerId === c || prov.ownerId === (this.resolveEventTargetClan(c) || c));
    })) return false;

    return required.every(clanId => this.isClanExtant(this.resolveEventTargetClan(clanId) || clanId));

  },



  /** 実際に動かす領地。onlyFrom があれば、その家の領国だけを動かす（よそへ移った国は奪わない） */



  eventTerritoryFor(ev, changes) {

    const territory = changes && changes.territory;

    if (!territory || typeof territory !== 'object') return territory;

    const collapse = ev ? this.eventRuleFor('clanCollapse', ev.id) : null;

    if (collapse && collapse.from && collapse.to) {

      // 家の滅亡（山崎の明智など）：その家に残る領国をすべて勝者へ。手を離れた国は動かさない

      const result = {};

      (this.provinces || []).forEach(p => { if (p.ownerId === collapse.from) result[p.id] = collapse.to; });

      return result;

    }

    const from = ev && Array.isArray(ev.onlyFrom) ? ev.onlyFrom : null;

    if (!from || !from.length) return territory;

    const fromIds = new Set(from.map(id => this.resolveEventTargetClan(id) || id).concat(from));

    const result = {};

    for (const [pId, owner] of Object.entries(territory)) {

      const prov = (this.provinces || []).find(p => p.id === pId);

      if (prov && fromIds.has(prov.ownerId)) result[pId] = owner;

    }

    return result;

  },



  /** 史実を適用しても何も変わらない出来事（領地がすでに史実どおり）か */



  isHistoricalEventNoop(ev) {

    if (!ev || ev.forced || ev.onReject || this.isSuccessionEvent(ev)) return false;

    if (this.eventRuleHas('neverNoop', ev.id)) return false;

    const ch = ev.changes || {};

    if (!ch.territory) return false;

    if (ch.famine || ch.appoint || Number(ch.gold) || Number(ch.rice) || Number(ch.troops)) return false;

    if (this.hasEventExtras(ch)) return false;

    const territory = this.eventTerritoryFor(ev, ch) || {};

    const entries = Object.entries(territory);

    if (entries.length === 0) return true;

    // 地図上に現在領地を持たない新勢力への領地移動を含む場合は絶対にNoopではない

    if (entries.some(([_, raw]) => !this.isClanExtant(raw))) return false;

    return entries.every(([pId, raw]) => {

      const prov = (this.provinces || []).find(p => p.id === pId);

      if (!prov) return true;

      const to = this.resolveEventTargetClan(raw) || raw;

      return prov.ownerId === to;

    });

  },



  /** 前提を欠いた・効果のない出来事を、出さずに済ませる（対の選択イベントも封じる） */



  sealSkippedHistoricalEvent(ev, link, reason) {

    this.happenedEvents.add(ev.id);

    this.triggeredHistoricalEvents.add(ev.id);

    if (link) this.triggeredHistoricalEvents.add(link.choiceId);

    this.sealRebellionPair(ev.id);

    if (reason === 'prereq') {

      const flag = this.eventRuleFor('setFlagOnPrereqSkip', ev.id);

      if (flag) this.setHistoricalFlag(flag);

    }

    if (reason === 'noop') {

      this.log(`📜【歴史の流れ】${ev.title}：領地はすでに史実どおりのため、変化はありません。`, 'normal');

    }

  },



  checkHistoricalEvents() {

    if (this.isVirtualScenario()) return;

    if (this.inBattle) return;

    if (this.isHistoricalEventBusy()) return;



    this.happenedEvents = this.happenedEvents || new Set();

    this.triggeredHistoricalEvents = this.triggeredHistoricalEvents || new Set();

    const currentSeasonName = this.seasonNames[this.seasonIdx];

    const scen = SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId));

    const master = this.getHistoricalEventsMaster();

    const links = this.historicalEventLinks();

    const choiceById = new Map(master.map(ev => [ev.id, ev]));

    const queue = [];



    const linkForData = (id) => links.find(link => link.dataIds.includes(id));

    const choiceEligible = (link) => {

      if (!link || this.year !== link.year || currentSeasonName !== link.season) return false;

      if (this.triggeredHistoricalEvents.has(link.choiceId)) return false;

      const choice = choiceById.get(link.choiceId);

      if (!choice) return false;

      if (choice.scenarioId !== '*' && String(choice.scenarioId) !== String(this.currentScenarioId)) return false;

      try { return !!choice.check(this); } catch (e) { return false; }

    };

    const queueChoice = (ev, link) => {

      if (!ev) return;

      const occId = this.historicalOccurrenceId(ev);

      if (this.triggeredHistoricalEvents.has(occId) || this.happenedEvents.has(occId)) return;

      if (this.onceEventIds().includes(ev.id)) { if (!this.oncePerPlaythroughFired) this.oncePerPlaythroughFired = new Set(); this.oncePerPlaythroughFired.add(ev.id); }

      // キュー投入時点でもフラグを立て、同一ターン内の再収集を防ぐ

      this.triggeredHistoricalEvents.add(occId);

      this.happenedEvents.add(occId);

      if (link) link.dataIds.forEach(id => {

        this.happenedEvents.add(id);

        this.triggeredHistoricalEvents.add(id);

      });

      queue.push({ type: 'choice', ev });

    };



    if (window.HISTORICAL_EVENTS_DATA) {

      for (const ev of window.HISTORICAL_EVENTS_DATA) {

        if (ev.skipAuto) continue;

        if (this.happenedEvents.has(ev.id) || this.triggeredHistoricalEvents.has(ev.id)) continue;

        if (ev.scenarioId && ev.scenarioId !== '*' && scen && String(ev.scenarioId) !== String(scen.id) && String(ev.scenarioId) !== ('scen_' + scen.id)) continue;

        if (ev.year !== undefined && ev.year !== this.year) continue;

        if (ev.season !== undefined && normalizeSeasonName(ev.season) !== currentSeasonName) continue; // 旧「夏」のイベントは盛夏に発生



        const link = linkForData(ev.id);

        if (link && this.triggeredHistoricalEvents.has(link.choiceId)) {

          this.happenedEvents.add(ev.id);

          this.triggeredHistoricalEvents.add(ev.id);

          continue;

        }

        // フラグで封じる出来事（本能寺を回避した世界の山崎・賤ヶ岳など。events.json の rules.skipWhenFlag）

        if (this.eventBlockedByFlag(ev.id)) {

          this.sealSkippedHistoricalEvent(ev, link, 'prereq');

          continue;

        }

        // 当事者の家が既に滅んでいる等、前提がない出来事は対の選択イベントごと起こさない

        if (!this.historicalEventPrereqMet(ev)) {

          this.sealSkippedHistoricalEvent(ev, link, 'prereq');

          continue;

        }

        if (link && choiceEligible(link)) {

          queueChoice(choiceById.get(link.choiceId), link);

          continue;

        }

        if (this.isHistoricalEventNoop(ev)) {

          this.sealSkippedHistoricalEvent(ev, link, 'noop');

          continue;

        }



        this.happenedEvents.add(ev.id);

        this.triggeredHistoricalEvents.add(ev.id);

        queue.push({ type: 'data', ev });

      }

    }



    const onceIds = this.onceEventIds();

    if (!this.oncePerPlaythroughFired) this.oncePerPlaythroughFired = new Set();

    for (const ev of master) {

      // 1回だけのイベント：観戦モードでは出さない。発火済みなら出さない。ロード前に表示中だったものは出し直す（ui_fixed12）

      if (onceIds.includes(ev.id)) {

        if (this.isSpectatorMode) continue;

        const rq = this._requeueOnceEvents || [];

        if (rq.includes(ev.id)) {

          this._requeueOnceEvents = rq.filter(id => id !== ev.id);

          this.triggeredHistoricalEvents.add(ev.id); this.happenedEvents.add(ev.id);

          queue.push({ type: 'choice', ev });

          continue;

        }

        if (this.oncePerPlaythroughFired.has(ev.id)) continue;

      }

      const occId = this.historicalOccurrenceId(ev);

      if (this.triggeredHistoricalEvents.has(occId) || this.happenedEvents.has(occId)) continue;

      if (ev.scenarioId !== '*' && String(ev.scenarioId) !== String(this.currentScenarioId)) continue;

      const link = links.find(item => item.choiceId === ev.id);

      if (link && (this.year !== link.year || currentSeasonName !== link.season)) continue;

      if (link) {

        const twin = (window.HISTORICAL_EVENTS_DATA || []).find(d => link.dataIds.includes(d.id));

        if (twin && !this.historicalEventPrereqMet(twin)) continue;

      }

      let ok = false;

      try { ok = !!ev.check(this); } catch (e) { ok = false; }

      if (ok) queueChoice(ev, link);

    }



    const deferred = (item) => item.type === 'choice' && this.eventRuleHas('deferToSeasonEnd', item.ev.id);

    queue.sort((a, b) => Number(deferred(a)) - Number(deferred(b)));

    this.pendingHistoryQueue = queue;

    if (queue.length) {

      if (this.isAutoPlay) this.pauseAutoPlayForEvent();

      void this.processHistoricalEventQueue();

    }

  },



  /** セーブ用：まだ選ばれていない（表示中・待機中の）歴史イベント */



  pendingHistoricalEventItems() {

    const items = [];

    if (this._historyCurrentItem && this._historyCurrentItem.ev) items.push(this._historyCurrentItem);

    (this.pendingHistoryQueue || []).forEach(item => { if (item && item.ev) items.push(item); });

    return items.map(item => ({ type: item.type, id: item.ev.id }));

  },



  /** ロード時：選ばれる前に保存されたイベントの発火済みフラグを外し、同じ季節に出し直す */



  releasePendingHistoricalEvents(pending) {

    if (!Array.isArray(pending) || !pending.length) return;

    const links = this.historicalEventLinks();

    const release = (id) => {

      this.triggeredHistoricalEvents.delete(id);

      this.happenedEvents.delete(id);

    };

    pending.forEach(item => {

      if (!item || !item.id) return;

      // 1回だけのイベントは発火済みのまま、ロード後にそのまま出し直す（抽選に戻すと再発する原因になっていた）（ui_fixed12）

      if (this.onceEventIds().includes(item.id)) { if (!this._requeueOnceEvents) this._requeueOnceEvents = []; this._requeueOnceEvents.push(item.id); return; }

      release(item.id);

      const link = links.find(l => l.choiceId === item.id || l.dataIds.includes(item.id));

      if (link) { release(link.choiceId); link.dataIds.forEach(release); }

      const pair = this.rebellionPairs().find(p => p.includes(item.id));

      if (pair) pair.forEach(release);

    });

  },



  /** 旧形式のセーブ：その季節のイベントは既に出たものとみなし、二重発火を防ぐ */



  sealCurrentSeasonHistoricalEvents() {

    const seasonName = this.seasonNames[this.seasonIdx];

    (window.HISTORICAL_EVENTS_DATA || []).forEach(ev => {

      if (ev.year === this.year && normalizeSeasonName(ev.season) === seasonName) {

        this.triggeredHistoricalEvents.add(ev.id);

        this.happenedEvents.add(ev.id);

      }

    });

    this.historicalEventLinks().forEach(link => {

      if (link.year === this.year && link.season === seasonName) this.triggeredHistoricalEvents.add(link.choiceId);

    });

  },



  /** 新しいゲーム・ロードの前に、歴史イベントの進行状態を片付ける */



  resetHistoricalEventRuntime() {

    if (this._historyCheckTimer) clearTimeout(this._historyCheckTimer);

    if (this._historyQueueResumeTimer) clearTimeout(this._historyQueueResumeTimer);

    this._historyCheckTimer = null;

    this._historyQueueResumeTimer = null;

    this._historyCheckPending = false;

    this.pendingHistoryQueue = [];

    this._historyCurrentItem = null;

    const done = this._historyEventDone;

    this._historyEventDone = null;

    if (typeof done === 'function') done();

    ['historicalEventModal', 'historyEventModal'].forEach(id => {

      const el = typeof document !== 'undefined' ? document.getElementById(id) : null;

      if (el) el.classList.add('hidden');

    });

    const succ = typeof document !== 'undefined' ? document.getElementById('honnoujiSuccessorModal') : null;

    if (succ) succ.style.display = 'none';

  },



  updateCastlesForYear() {

    if (!window.HISTORICAL_CASTLE_CHANGES) return;

    this.provinces.forEach(p => {

      const changes = window.HISTORICAL_CASTLE_CHANGES[p.id];

      if (changes && Array.isArray(changes)) {

        for (const [cutoff, castleName] of changes) {

          if (this.year <= cutoff) {

            let actualCastleName = castleName;



            p.castle = actualCastleName;

            p.castleName = actualCastleName;

            if (window.HISTORICAL_CASTLE_LORES && window.HISTORICAL_CASTLE_LORES[actualCastleName]) {

              p.castleLore = window.HISTORICAL_CASTLE_LORES[actualCastleName];

            }

            break;

          }

        }

      }

    });

  },



  rebellionPairs() {
    // events.json の rules.rebellion：{ choiceId, successEventId } → [イベントID, 選択イベントID, 成功時イベントID]
    return ((typeof window !== 'undefined' && window.HISTORICAL_EVENTS_DATA) || [])
      .filter(ev => ev && ev.rules && ev.rules.rebellion && ev.rules.rebellion.choiceId)
      .map(ev => [ev.id, ev.rules.rebellion.choiceId, ev.rules.rebellion.successEventId || null]);
  },



  sealRebellionPair(eventId) {

    const pair = this.rebellionPairs().find(p => p.includes(eventId));

    if (!pair) return;

    this.happenedEvents = this.happenedEvents || new Set();

    this.triggeredHistoricalEvents = this.triggeredHistoricalEvents || new Set();

    this.happenedEvents.add(pair[0]);

    this.happenedEvents.add(pair[2]);

    this.triggeredHistoricalEvents.add(pair[1]);

  },



  /** 史実イベントの付帯効果：武将の死（killOfficerIds）・同盟（alliances）・兵力打撃（troopShock） */



  applyEventExtras(changes, { late = true } = {}) {

    if (!changes) return;

    let changed = false;

    const ids = (Array.isArray(changes.killOfficerIds) ? changes.killOfficerIds : []).slice();

    // chanceKills：[{ id, chance }] 合戦での討死など、確率で落命する武将（適用時に一度だけ判定）

    (Array.isArray(changes.chanceKills) ? changes.chanceKills : []).forEach(item => {

      if (!item || !item.id) return;

      const p = Number(item.chance);

      if (p > 0 && gameRandom() < p && !ids.includes(item.id)) ids.push(item.id);

    });

    if (ids.length) {

      const aliases = window.OFFICER_ID_ALIASES || {};

      const idSet = new Set(ids.concat(ids.map(id => aliases[id]).filter(Boolean)));

      const fallen = [];

      const lists = [this.activeOfficers, this.officers, (typeof window !== 'undefined' ? window.OFFICERS_MASTER : null)].filter((l, i, arr) => Array.isArray(l) && arr.indexOf(l) === i);

      lists.forEach(list => list.forEach(o => {

        if (!o || !idSet.has(o.id)) return;

        if (o.isDead) return;

        if (o.assignedProvId) {

          const prov = (this.provinces || []).find(p => p.id === o.assignedProvId);

          if (prov && prov.governorId === o.id) prov.governorId = null;

        }

        o.isDead = true;

        o.isDaimyo = false;

        o.assignedProvId = null;

        if (!fallen.includes(o.name)) fallen.push(o.name);

      }));

      if (fallen.length) {

        this.log(`⚰️【落命】${fallen.join('・')}が世を去りました。`, 'important');

        changed = true;

      }

    }

    const shock = changes.troopShock && typeof changes.troopShock === 'object' ? changes.troopShock : null;

    if (shock) {

      for (const [rawClan, rate] of Object.entries(shock)) {

        const r = Number(rate);

        if (!(r > 0) || r === 1) continue;

        const clanId = this.resolveEventTargetClan(rawClan) || rawClan;

        (this.provinces || []).filter(p => p.ownerId === clanId).forEach(p => {

          p.troops = Math.max(300, Math.round((Number(p.troops) || 0) * r));

        });

        changed = true;

      }

    }

    const pacts = Array.isArray(changes.alliances) ? changes.alliances : [];

    pacts.forEach(pact => {
      if (!pact) return;
      if (Array.isArray(pact.members) && pact.members.length >= 2) {
        const members = pact.members
          .map(m => this.resolveEventTargetClan(m) || m)
          .filter(m => m && this.isClanExtant(m));
        if (members.length >= 2) {
          this.alliances = this.alliances || [];
          const dur = Number(pact.durationSeasons) > 0
            ? (Number(pact.durationSeasons) >= 40 ? Number(pact.durationSeasons) : legacySeasonCountToNew(Number(pact.durationSeasons)))
            : ALLIANCE_DURATION_SEASONS;
          const formedY = Number(pact.formedYear) || this.year;
          const formedS = Number(pact.formedSeason) !== undefined && Number(pact.formedSeason) !== null ? Number(pact.formedSeason) : this.seasonIdx;
          this.alliances.push({
            members: members,
            formedYear: formedY,
            formedSeason: formedS,
            durationSeasons: dur,
            label: pact.label || '同盟'
          });
          const labels = members.map(m => this.allianceClanLabel(m)).join('・');
          this.log(`🤝【史実同盟】${labels}が${pact.label || '同盟'}を結びました。`, 'important');
          changed = true;
          return;
        }
      }
      if (!pact.a || !pact.b) return;

      const a = this.resolveEventTargetClan(pact.a) || pact.a;

      const b = this.resolveEventTargetClan(pact.b) || pact.b;

      if (a === b || !this.isClanExtant(a) || !this.isClanExtant(b)) return;

      if (typeof this.isAllied === 'function' && this.isAllied(a, b)) return;

      this.alliances = this.alliances || [];

      this.alliances.push({

        members: [a, b],

        formedYear: this.year,

        formedSeason: this.seasonIdx,

        durationSeasons: Number(pact.durationSeasons) > 0 ? (Number(pact.durationSeasons) >= 40 ? Number(pact.durationSeasons) : legacySeasonCountToNew(Number(pact.durationSeasons))) : ALLIANCE_DURATION_SEASONS

      });

      this.log(`🤝【史実同盟】${this.allianceClanLabel(a)}と${this.allianceClanLabel(b)}が${pact.label || '同盟'}を結びました。`, 'important');

      changed = true;

    });

    // breakAlliances：[{ a, b }] 謀反・決裂で同盟を破棄

    (Array.isArray(changes.breakAlliances) ? changes.breakAlliances : []).forEach(pact => {

      if (!pact || !pact.a || !pact.b || !this.alliances) return;

      const a = this.resolveEventTargetClan(pact.a) || pact.a;

      const b = this.resolveEventTargetClan(pact.b) || pact.b;

      let broke = false;

      this.alliances = this.alliances.map(group => {

        const members = this.allianceMembers(group);

        if (!members.includes(a) || !members.includes(b)) return group;

        broke = true;

        const rest = members.filter(id => id !== b);

        if (rest.length < 2) return null;

        return {

          members: rest,

          formedYear: Array.isArray(group) ? this.year : (group.formedYear ?? this.year),

          formedSeason: Array.isArray(group) ? this.seasonIdx : (group.formedSeason ?? this.seasonIdx),

          durationSeasons: this.allianceDurationOf(group),

          ...this.allianceExtra(group)

        };

      }).filter(Boolean);

      if (broke) {

        if (typeof this.rememberAllianceBreak === 'function') this.rememberAllianceBreak([a, b]);

        this.log(`💔【同盟破棄】${this.allianceClanLabel(a)}と${this.allianceClanLabel(b)}の盟約が破れました。`, 'important');

        changed = true;

      }

    });

    // clanResources：{ clanId: { gold, rice } } 金・兵糧の増減（金蔵を持つのはプレイヤー家のみ）

    Object.entries(changes.clanResources || {}).forEach(([rawClan, res]) => {

      const clanId = this.resolveEventTargetClan(rawClan) || rawClan;

      if (!res) return;

      if (clanId === this.playerClanId) {

        if (Number(res.gold)) this.gold = Math.max(0, (Number(this.gold) || 0) + Number(res.gold));

        if (Number(res.rice)) this.rice = Math.max(0, (Number(this.rice) || 0) + Number(res.rice));

        changed = true;

        return;

      }

      // AI 家：金蔵が無いため、金・兵糧を本拠（無ければ最初の領国）の国兵糧に換算して加える（兵糧1/10・金1/20）

      const owned = (this.provinces || []).filter(p => p.ownerId === clanId);

      if (!owned.length) return;

      const cap = owned.find(p => p.governorId && (this.activeOfficers || []).some(o => o && o.id === p.governorId && o.isDaimyo)) || owned[0];

      const delta = Math.round((Number(res.rice) || 0) / 10 + (Number(res.gold) || 0) / 20);

      if (delta) {

        cap.rice = Math.max(0, (Number(cap.rice) || 0) + delta);

        changed = true;

      }

    });

    if (ids.length) {

      this.syncDaimyoStatus();

      this.updateActiveOfficers();

    }

    if (late && this.applyEventLateExtras(changes)) changed = true;

    if (changed) {

      this.updateUI();

    }

  },



  /** 領地を動かした後にかける効果：国ごと・家ごとの兵力／防御／治安の変化 */



  applyEventLateExtras(changes) {

    if (!changes) return false;

    let changed = false;

    const apply = (prov, fx) => {

      if (!prov || !fx) return;

      // troopsRate：1回の倍率を 0.2〜1.3 に制限。増兵は1国あたり +5000 まで、史実イベントによる累積増兵倍率は 1.6 倍まで

      const rate = Number(fx.troopsRate);

      if (rate > 0 && rate !== 1) {

        const cur = Number(prov.troops) || 0;

        let r = Math.max(0.2, Math.min(1.3, rate));

        if (r > 1) {

          const boost = Number(prov.eventTroopBoost) > 0 ? Number(prov.eventTroopBoost) : 1;

          r = Math.max(1, Math.min(r, EVENT_TROOP_BOOST_CAP / boost));

          prov.eventTroopBoost = boost * r;

        }

        let next = Math.round(cur * r);

        if (r > 1) next = Math.min(next, cur + 5000);

        prov.troops = Math.max(100, next);

      }

      // troops：絶対値の上書きではなく加算（増援 +3000・損害 -5000 まで）

      if (fx.troops !== undefined && Number.isFinite(Number(fx.troops)) && Number(fx.troops) !== 0) {

        const add = Math.max(-5000, Math.min(EVENT_TROOP_ADD_CAP, Math.round(Number(fx.troops))));

        prov.troops = Math.max(100, (Number(prov.troops) || 0) + add);

      }

      // attackDelta（旧キー）は士気の増減として扱う

      if (Number(fx.attackDelta)) prov.morale = Math.max(0, Math.min(100, (Number(prov.morale) || 0) + Number(fx.attackDelta)));

      if (fx.defense !== undefined && Number.isFinite(Number(fx.defense))) prov.defense = Math.max(0, Math.min(100, Math.round(Number(fx.defense))));

      if (Number(fx.defenseDelta)) prov.defense = Math.max(0, Math.min(100, (Number(prov.defense) || 0) + Number(fx.defenseDelta)));

      if (Number(fx.orderDelta)) prov.order = Math.max(0, Math.min(100, (Number(prov.order) || 0) + Number(fx.orderDelta)));

      if (Number(fx.moraleDelta)) prov.morale = Math.max(0, Math.min(100, (Number(prov.morale) || 0) + Number(fx.moraleDelta)));

      changed = true;

    };

    Object.entries(changes.clanEffects || {}).forEach(([rawClan, fx]) => {

      const clanId = this.resolveEventTargetClan(rawClan) || rawClan;

      (this.provinces || []).filter(p => p.ownerId === clanId).forEach(p => apply(p, fx));

    });

    Object.entries(changes.provinceEffects || {}).forEach(([pId, fx]) => {

      apply((this.provinces || []).find(p => p.id === pId), fx);

    });

    return changed;

  },



  /** 付帯効果のキー（リンク先データの転記・判定用） */



  eventExtraKeys() {

    return ['killOfficerIds', 'chanceKills', 'troopShock', 'alliances', 'breakAlliances', 'clanResources', 'clanEffects', 'provinceEffects'];

  },



  hasEventExtras(changes) {

    if (!changes) return false;

    return this.eventExtraKeys().some(key => {

      const v = changes[key];

      if (Array.isArray(v)) return v.length > 0;

      return !!(v && typeof v === 'object' && Object.keys(v).length > 0);

    });

  },



  /**
   * 地震などの被害イベントで、表示上も実際に数値が下がる国だけを判定する。
   * イベント適用時の下限（兵力100、防御・治安・士気0）と同じ条件で確認する。
   */
  hasEffectiveProvinceDamage(pId, fx) {

    if (!fx || typeof fx !== 'object') return false;

    const prov = (this.provinces || []).find(item => item && item.id === pId);

    if (!prov) return false;

    const initialTroops = Number(prov.troops) || 0;
    let troops = initialTroops;
    const troopsRate = Number(fx.troopsRate);

    if (troopsRate > 0 && troopsRate < 1) {

      const rate = Math.max(0.2, Math.min(1.3, troopsRate));

      troops = Math.max(100, Math.round(troops * rate));

    }

    if (fx.troops !== undefined && Number.isFinite(Number(fx.troops)) && Number(fx.troops) !== 0) {

      const add = Math.max(-5000, Math.min(EVENT_TROOP_ADD_CAP, Math.round(Number(fx.troops))));

      troops = Math.max(100, troops + add);

    }

    const initialDefense = Number(prov.defense) || 0;
    let defense = initialDefense;

    if (fx.defense !== undefined && Number.isFinite(Number(fx.defense))
    ) defense = Math.max(0, Math.min(100, Math.round(Number(fx.defense))));

    if (Number(fx.defenseDelta)) defense = Math.max(0, Math.min(100, defense + Number(fx.defenseDelta)));

    const initialOrder = Number(prov.order) || 0;
    const order = Number(fx.orderDelta)
      ? Math.max(0, Math.min(100, initialOrder + Number(fx.orderDelta)))
      : initialOrder;

    const initialMorale = Number(prov.morale) || 0;
    let morale = initialMorale;

    if (Number(fx.attackDelta)) morale = Math.max(0, Math.min(100, morale + Number(fx.attackDelta)));
    if (Number(fx.moraleDelta)) morale = Math.max(0, Math.min(100, morale + Number(fx.moraleDelta)));

    return troops < initialTroops
      || defense < initialDefense
      || order < initialOrder
      || morale < initialMorale;

  },



  describeEventExtras(changes, options = {}) {

    if (!changes) return [];

    const lines = [];

    const officers = window.OFFICERS_MASTER || [];

    (changes.killOfficerIds || []).forEach(id => {

      const o = (this.activeOfficers || []).find(x => x && x.id === id) || officers.find(x => x && x.id === id);

      if (o && !o.isDead) lines.push(`${o.name}が落命する`);

    });

    Object.entries(changes.troopShock || {}).forEach(([clan, rate]) => {

      const r = Number(rate);

      if (r > 0 && r !== 1) lines.push(`${this.getClanDisplayName(this.resolveEventTargetClan(clan) || clan)}の兵力を${Math.round(r * 100)}%にする`);

    });

    (changes.alliances || []).forEach(pact => {
      if (!pact) return;
      if (Array.isArray(pact.members) && pact.members.length > 0) {
        const names = pact.members
          .map(m => this.getClanDisplayName(this.resolveEventTargetClan(m) || m))
          .filter(n => n && n !== '空白地');
        if (names.length >= 2) {
          lines.push(`${names.join('・')}が${pact.label || '同盟'}を結ぶ`);
          return;
        }
      }
      if (pact.a && pact.b) {
        const a = this.getClanDisplayName(this.resolveEventTargetClan(pact.a) || pact.a);
        const b = this.getClanDisplayName(this.resolveEventTargetClan(pact.b) || pact.b);
        if (a && b && a !== '空白地' && b !== '空白地') {
          lines.push(`${a}と${b}が${pact.label || '同盟'}を結ぶ`);
        }
      }
    });

    (changes.chanceKills || []).forEach(item => {

      if (!item || !item.id) return;

      const o = (this.activeOfficers || []).find(x => x && x.id === item.id) || officers.find(x => x && x.id === item.id);

      if (o && !o.isDead) lines.push(`${o.name}が${Math.round(Number(item.chance || 0) * 100)}%の確率で討死する`);

    });

    (changes.breakAlliances || []).forEach(pact => {

      if (!pact) return;

      const a = this.getClanDisplayName(this.resolveEventTargetClan(pact.a) || pact.a);

      const b = this.getClanDisplayName(this.resolveEventTargetClan(pact.b) || pact.b);

      lines.push(`${a}と${b}の同盟が破れる`);

    });

    Object.entries(changes.clanResources || {}).forEach(([clan, res]) => {

      if (!res) return;

      const clanId = this.resolveEventTargetClan(clan) || clan;

      if (clanId !== this.playerClanId) {

        if (Number(res.gold) || Number(res.rice)) lines.push(`${this.getClanDisplayName(clanId)}の兵糧が増減する`);

        return;

      }

      if (Number(res.gold)) lines.push(`自家の金 ${res.gold > 0 ? '+' : ''}${Number(res.gold).toLocaleString('ja-JP')}`);

      if (Number(res.rice)) lines.push(`自家の兵糧 ${res.rice > 0 ? '+' : ''}${Number(res.rice).toLocaleString('ja-JP')}`);

    });

    const fxText = (fx) => {

      const parts = [];

      if (Number(fx.troopsRate) > 0) parts.push(`兵力${Math.round(Number(fx.troopsRate) * 100)}%`);

      if (fx.troops !== undefined && Number(fx.troops)) parts.push(`兵力${Number(fx.troops) > 0 ? '+' : ''}${Number(fx.troops).toLocaleString('ja-JP')}`);

      if (fx.defense !== undefined) parts.push(`城郭防御${fx.defense}に`);

      if (Number(fx.defenseDelta)) parts.push(`城郭防御${fx.defenseDelta > 0 ? '+' : ''}${fx.defenseDelta}`);

      if (Number(fx.orderDelta)) parts.push(`治安${fx.orderDelta > 0 ? '+' : ''}${fx.orderDelta}`);

      if (Number(fx.moraleDelta)) parts.push(`士気${fx.moraleDelta > 0 ? '+' : ''}${fx.moraleDelta}`);

      return parts.join('・');

    };

    Object.entries(changes.clanEffects || {}).forEach(([clan, fx]) => {

      const t = fx ? fxText(fx) : '';

      if (t) lines.push(`${this.getClanDisplayName(this.resolveEventTargetClan(clan) || clan)}の全領国：${t}`);

    });

    const provinceNames = [];

    Object.entries(changes.provinceEffects || {}).forEach(([pId, fx]) => {

      if (options.effectiveProvinceDamageOnly && !this.hasEffectiveProvinceDamage(pId, fx)) return;

      if (options.provinceNamesOnly) {

        provinceNames.push(this.getProvinceJapaneseName(pId));

        return;

      }

      const t = fx ? fxText(fx) : '';

      if (t) lines.push(`${this.getProvinceJapaneseName(pId)}：${t}`);

    });

    if (provinceNames.length) lines.push(provinceNames.join('、'));

    return lines;

  },



    // 歴史イベント等で新大名が独立・領土獲得したときの当主確定・本拠地設定・城主任命・家臣団合流

  setupNewDaimyoFromTerritory(newOwnerIds) {

    if (!newOwnerIds || !this.provinces || !this.activeOfficers) return;

    const distinct = [...new Set(newOwnerIds)].filter(Boolean);



    // 新勢力ごとに合流すべき主要武将の定義

    const FACTION_ROSTER_MAPPINGS = (typeof window !== 'undefined' && window.FACTION_ROSTER_MAPPINGS) || {}; // data/rules.json（factionRosters）へ移設（2026-11-14）



    distinct.forEach(ownerId => {

      const myProvs = this.provinces.filter(p => p.ownerId === ownerId);

      if (myProvs.length === 0) return;



      // 1. 本拠地設定 (window.CLAN_CAPITAL_PROVINCES)

      if (window.CLAN_CAPITAL_PROVINCES) {

        if (!window.CLAN_CAPITAL_PROVINCES[ownerId] || !myProvs.some(p => p.id === window.CLAN_CAPITAL_PROVINCES[ownerId])) {

          window.CLAN_CAPITAL_PROVINCES[ownerId] = myProvs[0].id;

        }

      }

      const capProvId = (window.CLAN_CAPITAL_PROVINCES && window.CLAN_CAPITAL_PROVINCES[ownerId]) || myProvs[0].id;

      const capProv = myProvs.find(p => p.id === capProvId) || myProvs[0];



      // 2. 所属すべき主要武将を新勢力へ転属

      const targetOids = FACTION_ROSTER_MAPPINGS[ownerId];

      if (targetOids && targetOids.length) {

        targetOids.forEach(oid => {

          let off = this.activeOfficers.find(o => o.id === oid);

          if (!off && window.OFFICERS_MASTER) {

            const master = window.OFFICERS_MASTER.find(m => m.id === oid);

            if (master) {

              off = JSON.parse(JSON.stringify(master));

              this.activeOfficers.push(off);

            }

          }

          if (off) {

            off.clanId = ownerId;

            off.defaultProv = capProv.id;

            off.isDead = false;

          }

        });

      }



      // 3. 当主の着座 (seatNamedLord)

      let lord = this.activeOfficers.find(o => o.clanId === ownerId && o.isDaimyo && !o.isDead);

      if (!lord) {

        lord = this.seatNamedLord(ownerId);

      }

      if (!lord) {

        const clanOffs = this.activeOfficers.filter(o => o.clanId === ownerId && !o.isDead);

        if (clanOffs.length) {

          lord = this.pickClanLeader(ownerId, clanOffs);

          if (lord) {

            lord.isDaimyo = true;

            lord.isDead = false;

          }

        }

      }



      // 4. 当主を居城の城主に任命

      if (lord && capProv) {

        capProv.governorId = lord.id;

        lord.assignedProvId = capProv.id;

      }

    });

  },



applyEventTerritory(changes) {

    if (!changes) return;

    if (!changes.territory) {
      if (changes.setLeader) this.applyEventLeaders(changes.setLeader);
      this.applyEventExtras(changes);
      return;

    }

    // 兵力打撃（troopShock）は accept 経路と同じく領地移動の後にかける

    const { troopShock: lateShock, ...earlyChanges } = changes;

    this.applyEventExtras(earlyChanges, { late: false });

    const resolvedOwners = {};

    for (const newOwner of new Set(Object.values(changes.territory))) {

      resolvedOwners[newOwner] = this.resolveEventTargetClan(newOwner);

    }

    for (const [pId, rawOwner] of Object.entries(changes.territory)) {

      const newOwner = resolvedOwners[rawOwner] || rawOwner;

      const prov = this.provinces.find(p => p.id === pId);

      if (prov) {

        prov.ownerId = newOwner;

        prov.troops = Math.max(3000, prov.troops || 3000);

      }

    }

    this.syncDaimyoStatus();

    if (changes.appoint) this.appointHistoricalCastellans(changes.appoint);

    this.updateActiveOfficers();

    if (this.currentScenario) this.resolveOfficerAffiliations(this.currentScenario);

    this.setupNewDaimyoFromTerritory(Object.values(changes.territory));
    if (changes.setLeader) this.applyEventLeaders(changes.setLeader);
    if (lateShock) this.applyEventExtras({ troopShock: lateShock }, { late: false });

    this.applyEventLateExtras(changes);

    this.updateCastlesForYear();

    this.updateUI();

    const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    if (!this.isSpectatorMode && myProvs.length === 0) {

      if (this.isAutoPlay) this.stopAutoPlay('御家滅亡のため');

      setTimeout(() => { this.triggerDefeat(); }, 1200);

    }

  },



  applyRebellionFromChoice(choiceId, outcome) {

    const pair = this.rebellionPairs().find(p => p[1] === choiceId);

    const ev = (window.HISTORICAL_EVENTS_DATA || []).find(e => e.id === pair?.[0]);

    const changes = outcome === 'success' ? ev?.onReject : ev?.changes;

    this.sealRebellionPair(choiceId);

    if (changes) this.applyEventTerritory(changes);

    return changes?.message || (outcome === 'success' ? '乱は成功しました。' : '乱は鎮圧されました。');

  },



  escapeEventText(value) {

    return String(value ?? '').replace(/[&<>"']/g, ch => ({

      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'

    }[ch]));

  },



  describeTerritoryMoves(territory) {

    if (!territory || typeof territory !== 'object') return [];

    const resolvedOwners = {};

    for (const rawOwner of new Set(Object.values(territory))) {

      resolvedOwners[rawOwner] = this.resolveEventTargetClan(rawOwner);

    }

    const lines = [];

    for (const [pId, rawOwner] of Object.entries(territory)) {

      const newOwner = resolvedOwners[rawOwner] || rawOwner;

      const prov = (this.provinces || []).find(item => item.id === pId);

      const pname = this.getProvinceJapaneseName(pId);

      const fromId = prov ? prov.ownerId : null;

      const fromName = fromId ? this.getClanDisplayName(fromId) : '無主';

      const toName = this.getClanDisplayName(newOwner);

      if (fromId && fromId === newOwner) lines.push(`${pname}は${toName}のまま`);

      else lines.push(`${pname}：${fromName} → ${toName}`);

    }

    return lines;

  },



  describeAppointLines(appoint) {

    if (!appoint || typeof appoint !== 'object') return [];

    const officers = window.OFFICERS_MASTER || [];

    const aliases = window.OFFICER_ID_ALIASES || {};

    return Object.entries(appoint).map(([pId, officerId]) => {

      const resolvedId = aliases[officerId] || officerId;

      const officer = officers.find(item => item && (item.id === officerId || item.id === resolvedId));

      const name = officer && officer.name ? officer.name : '城代';

      return `${this.getProvinceJapaneseName(pId)}の城主：${name}`;

    });

  },



  eventEffectLines(ev, branch) {

    const changes = branch === 'reject' ? ev.onReject : ev.changes;

    const rejectBonus = branch === 'reject' ? this.eventRuleFor('playerRejectBonus', ev.id) : null;

    if (rejectBonus && rejectBonus.clanId === this.playerClanId && Array.isArray(rejectBonus.previewLines)) {

      return rejectBonus.previewLines.slice();

    }

    const lines = [];

    if (changes) {

      lines.push(...this.describeTerritoryMoves(branch === 'reject' ? changes.territory : this.eventTerritoryFor(ev, changes)));

      if (branch === 'accept') lines.push(...this.describeAppointLines(changes.appoint));

      const isEarthquake = /(?:^|_)quake(?:_|$)/.test(String(ev?.id || ''))
        || String(ev?.title || '').includes('地震');

      lines.push(...this.describeEventExtras(changes, {
        effectiveProvinceDamageOnly: isEarthquake,
        provinceNamesOnly: isEarthquake
      }));

      if (changes.famine) lines.push(...this.describeFamineLines(changes.famine));

      if (Number(changes.gold)) lines.push(`金 ${changes.gold > 0 ? '+' : ''}${Number(changes.gold).toLocaleString('ja-JP')}`);

      if (Number(changes.rice)) lines.push(`兵糧 ${changes.rice > 0 ? '+' : ''}${Number(changes.rice).toLocaleString('ja-JP')}`);

      if (Number(changes.troops)) lines.push(`兵力 ${changes.troops > 0 ? '+' : ''}${Number(changes.troops).toLocaleString('ja-JP')}`);

    }

    if (changes && changes.setLeader) lines.push(...this.describeLeaderLines(changes.setLeader));
    if (branch === 'accept') {
      lines.push(...(this.eventRuleFor('acceptEffectLines', ev.id) || []));
      const bonus = this.historicalEventRuleSet(ev).afterApply?.playerBonus;
      if (bonus && bonus.clanId === this.playerClanId && Array.isArray(bonus.previewLines)) lines.push(...bonus.previewLines);
    }

    return lines;

  },



  describeFamineLines(famine) {

    if (!famine) return [];

    const lines = [];

    const troop = Number(famine.troopRate);

    const rice = Number(famine.riceRate);

    if (troop > 0 && troop < 1) lines.push(`全国の兵力を${Math.round(troop * 100)}%まで減らす`);

    if (rice > 0 && rice < 1) lines.push(`自軍の兵糧と、諸国の収穫を${Math.round(rice * 100)}%まで減らす`);

    return lines;

  },



  describeScriptEffects(src) {

    const text = String(src || '');

    const lines = [];

    const sum = (re) => [...text.matchAll(re)].reduce((total, match) => total + Number(match[1]), 0);

    const goldPlus = sum(/gold\s*\+=\s*(\d+)/g);

    const ricePlus = sum(/rice\s*\+=\s*(\d+)/g);

    const goldMinus = sum(/gold\s*-\s*(\d+)/g);

    const riceMinus = sum(/rice\s*-\s*(\d+)/g);

    const troopPlus = [...text.matchAll(/troops\s*\+=\s*(\d+)/g)].map(match => Number(match[1]));

    const troopRatio = [...text.matchAll(/troops\s*=\s*Math\.round\([^;\n]*?\*\s*(0\.\d+)\s*\)/g)].map(match => Number(match[1]));

    const orderPlus = [...text.matchAll(/order\s*\+\s*(\d+)/g)].map(match => Number(match[1]));

    const orderMax = /order\s*=\s*100/.test(text);

    if (goldPlus) lines.push(`金 +${goldPlus.toLocaleString('ja-JP')}`);

    if (goldMinus) lines.push(`金 −${goldMinus.toLocaleString('ja-JP')}`);

    if (ricePlus) lines.push(`兵糧 +${ricePlus.toLocaleString('ja-JP')}`);

    if (riceMinus) lines.push(`兵糧 −${riceMinus.toLocaleString('ja-JP')}`);

    troopPlus.forEach(amount => lines.push(`兵力 +${amount.toLocaleString('ja-JP')}`));

    troopRatio.forEach(ratio => lines.push(`兵力を${Math.round(ratio * 100)}%まで減らす`));

    orderPlus.forEach(amount => lines.push(`治安 +${amount}`));

    if (orderMax) lines.push('治安が最大になる');

    return lines;

  },



  /**
   * 軍令権（AP）の上限：勢力の領国数に応じて増え、最大5。
   *  1〜2国:2 / 3〜5国:3 / 6〜9国:4 / 10国以上:5（領国0の浪人等は1）
   */
  computeMaxApForClan(clanId) {
    const n = (this.provinces || []).filter(p => p && p.ownerId === clanId).length;
    if (n <= 0) return 1;
    if (n <= 2) return 2;
    if (n <= 5) return 3;
    if (n <= 9) return 4;
    return 5;
  },

  /** プレイヤーの軍令権上限を領国数から更新する（現在値は上限を超えないよう丸める） */
  refreshMaxAp() {
    if (!this.playerClanId) return this.maxAp;
    this.maxAp = this.computeMaxApForClan(this.playerClanId);
    if (Number(this.ap) > this.maxAp) this.ap = this.maxAp;
    return this.maxAp;
  },

  applyFamineShock(famine) {

    const troopRate = Number(famine?.troopRate);

    const riceRate = Number(famine?.riceRate);

    const baseRice = (prov) => {

      const init = (window.PROVINCES_DATA || []).find(item => item.id === prov.id);

      const koku = Number(init?.kokudaka) || 50000;

      return Math.max(20, Math.round(koku / 1000));

    };

    (this.provinces || []).forEach(prov => {

      if (troopRate > 0 && troopRate < 1) {

        prov.troops = Math.max(300, Math.round((Number(prov.troops) || 0) * troopRate));

      }

      if (riceRate > 0 && riceRate < 1) {

        const floor = Math.round(baseRice(prov) * 0.35);

        prov.rice = Math.max(floor, Math.round((Number(prov.rice) || floor) * riceRate));

      }

    });

    if (riceRate > 0 && riceRate < 1) {

      this.rice = Math.max(0, Math.round((Number(this.rice) || 0) * riceRate));

    }

    this.updateUI();

  },



  eventEffectHtml(lines) {

    if (!lines.length) return '<div style="margin-top:6px;">領地の移動はありません。</div>';

    const items = lines.map(line => `<li>${this.escapeEventText(line)}</li>`).join('');

    return `<ul style="margin:6px 0 0 1.2em; padding:0; text-align:left; font-size:11pt; line-height:1.55; max-height:calc(28vh / var(--ui-zoom, 1)); overflow:auto;">${items}</ul>`;

  },



  choiceEffectHtml(choice, parentEv = null) {

    const src = typeof choice.action === 'function' ? String(choice.action) : '';

    const lines = [];

    const reb = src.match(/applyRebellionFromChoice\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/);

    if (reb) {

      const pair = this.rebellionPairs().find(item => item[1] === reb[1]);

      const dataEv = (window.HISTORICAL_EVENTS_DATA || []).find(item => item.id === pair?.[0]);

      if (dataEv) {

        const changes = reb[2] === 'success' ? dataEv.onReject : dataEv.changes;

        lines.push(...this.describeTerritoryMoves(changes && changes.territory));

        if (reb[2] !== 'success') lines.push(...this.describeAppointLines(changes && changes.appoint));

        lines.push(...this.describeEventExtras(changes));

      }

    } else if (choice.isHistorical && parentEv && !/executeHonnoujiSuccession/.test(src)) {

      // 史実ルートでは、リンク先データイベントの領地（選択側が動かさない場合）と付帯効果もプレビューする

      const movesLand = /\.ownerId\s*=\s*(?!=)/.test(src);

      const link = this.historicalEventLinks().find(item => item.choiceId === parentEv.id);

      const dataEv = link ? (window.HISTORICAL_EVENTS_DATA || []).find(item => link.dataIds.includes(item.id)) : null;

      if (dataEv && dataEv.changes && !this.isSuccessionEvent(dataEv)) {

        if (!movesLand) {

          lines.push(...this.describeTerritoryMoves(this.eventTerritoryFor(dataEv, dataEv.changes)));

          lines.push(...this.describeAppointLines(dataEv.changes.appoint));

        }

        lines.push(...this.describeEventExtras(dataEv.changes));

      }

    }

    const assign = /id === '([a-z0-9_]+)'[\s\S]{0,400}?\.ownerId\s*=\s*(?:'([^']+)'|g\.playerClanId)/g;

    const seen = new Set();

    let match;

    while ((match = assign.exec(src))) {

      const pId = match[1];

      if (seen.has(pId)) continue;

      seen.add(pId);

      const raw = match[2] || this.playerClanId;

      const toId = this.resolveEventTargetClan(raw) || raw;

      const prov = (this.provinces || []).find(item => item.id === pId);

      const fromId = prov ? prov.ownerId : null;

      const pname = this.getProvinceJapaneseName(pId);

      const fromName = fromId ? this.getClanDisplayName(fromId) : '無主';

      const toName = this.getClanDisplayName(toId);

      if (fromId && fromId === toId) lines.push(`${pname}は${toName}のまま`);

      else lines.push(`${pname}：${fromName} → ${toName}`);

    }

    const extras = this.describeScriptEffects(src);

    const blocks = [];

    if (lines.length) {

      blocks.push(`<div style="margin-top:8px; font-size:11pt; color:#ffd700;">領地の変化</div>${this.eventEffectHtml(lines)}`);

    }

    if (extras.length) {

      blocks.push(`<div style="margin-top:8px; font-size:11pt; color:#ffd700;">ほかの効果</div>${this.eventEffectHtml(extras)}`);

    }

    return blocks.join('');

  },



  fireHistoricalEvent(ev) {

    if (this.isVirtualScenario()) {

      this.continueAfterHistoricalEvent();

      return;

    }

    this.sealRebellionPair(ev.id);

    if (this.isAutoPlay) this.pauseAutoPlayForEvent();



    try {

      if (this.audio && this.audio.playEventChimeExclusive) {
        this.audio.playEventChimeExclusive();
      } else {
        this.audio.playEventNotice?.();
      }

    } catch(e) {}

    this.music.playTrack('event', false, { stinger: true, noFirstHit: true });



    const modal = document.getElementById('historicalEventModal');

    if (!modal) {

      const followUp = this.applyHistoricalEventAccept(ev, { closeModal: false }) === true;

      if (!followUp) this.continueAfterHistoricalEvent();

      return;

    }



    const titleEl = document.getElementById('eventModalTitle');

    if (titleEl) titleEl.textContent = `❖ ${ev.title} ❖`;



    const subEl = document.getElementById('eventModalSubtitle');

    if (subEl) subEl.textContent = `${this.formatYear()}年 ${this.seasonNames[this.seasonIdx]}`;



    const descEl = document.getElementById('eventModalDesc');

    if (descEl) descEl.innerHTML = ev.desc;



    const noticeEl = document.getElementById('eventModalNotice');

    if (noticeEl) {

      const acceptFx = this.eventEffectHtml(this.eventEffectLines(ev, 'accept'));

      if (ev.forced) {

        noticeEl.innerHTML = `<strong>【この季節に起きること】</strong>${this.escapeEventText(ev.changes?.message || '')}${acceptFx}`;

      } else if (ev.onReject) {

        const rejectFx = this.eventEffectHtml(this.eventEffectLines(ev, 'reject'));

        noticeEl.innerHTML = `<strong>【史実を適用】</strong>${this.escapeEventText(ev.changes?.message || '')}${acceptFx}<br><strong style="color:#f39c12;">【史実を適用しない】</strong>${this.escapeEventText(ev.onReject.message || '')}${rejectFx}`;

      } else {

        noticeEl.innerHTML = `<strong>【史実を適用すると】</strong>${this.escapeEventText(ev.changes?.message || '')}${acceptFx}<br><span style="font-size:11pt; color:#ffd700; margin-top:4px; display:inline-block;">現状維持を選ぶと、上の効果は起きません。</span>`;

      }

    }



    const acceptBtn = document.getElementById('eventModalAcceptBtn');

    const rejectBtn = document.getElementById('eventModalRejectBtn');



    if (acceptBtn) {

      const newAccept = acceptBtn.cloneNode(true);

      acceptBtn.parentNode.replaceChild(newAccept, acceptBtn);

      newAccept.textContent = ev.forced ? '承知した' : '⚔️ 史実通り効果を適用';

      newAccept.addEventListener('click', () => {

        if (this._eventDecidedId === ev.id) return;

        this._eventDecidedId = ev.id;

        const followUp = this.applyHistoricalEventAccept(ev, { closeModal: true }) === true;

        if (!followUp) this.continueAfterHistoricalEvent();

      });

    }



    if (rejectBtn) {

      const newReject = rejectBtn.cloneNode(true);

      rejectBtn.parentNode.replaceChild(newReject, rejectBtn);

      newReject.style.display = ev.forced ? 'none' : '';

      newReject.textContent = ev.onReject ? '⚡ 史実を適用しない' : '🛡️ 史実に抗い現状維持 (効果なし)';

      newReject.addEventListener('click', () => {

        if (this._eventDecidedId === ev.id) return;

        this._eventDecidedId = ev.id;

        this.audio.playHyoshigi();
        // 見送ったときの付帯処理（events.json の rules.onDecline）
        const decline = this.historicalEventRuleSet(ev).onDecline || null;
        this.runHistoricalActionBlock(ev, decline, false);

        if (ev.onReject) {

          this.applyEventTerritory(ev.onReject);

          const bonus = this.eventRuleFor('playerRejectBonus', ev.id);

          if (bonus && bonus.clanId === this.playerClanId) {

            this.rice += Number(bonus.rice) || 0;

            this.gold += Number(bonus.gold) || 0;

            this.updateUI();

          }

          this.log(`⚡【史実を適用せず】${ev.title}：${ev.onReject.message || '史実とは異なる展開となりました。'}`, 'important');

          modal.classList.add('hidden');

          if (!(this.pendingHistoryQueue && this.pendingHistoryQueue.length)) this.music.playTrack(this.getSeasonTrackKey(), false, { seasonReturn: true });

          this.continueAfterHistoricalEvent();

          return;

        }

        // 本能寺の変は起きなかった、など（events.json の rules.setFlagOnReject）

        const rejectFlag = this.eventRuleFor('setFlagOnReject', ev.id) || (ev.isHonnouji ? 'honnoujiAverted' : null);

        if (rejectFlag) this.setHistoricalFlag(rejectFlag);

        if (decline && decline.log) {
          this.log(decline.log, 'normal');
        } else {

          this.log(`🛡️【現状維持】${ev.title}：史実に抗い、現在の領土秩序を維持しました。（イベント効果なし）`, 'normal');

        }

        modal.classList.add('hidden');

        if (!(this.pendingHistoryQueue && this.pendingHistoryQueue.length)) this.music.playTrack(this.getSeasonTrackKey(), false, { seasonReturn: true });

        this.continueAfterHistoricalEvent();

      });

    }



    this._eventDecidedId = null;

    modal.classList.remove('hidden');

    this.log(`📜【歴史の奔流】${ev.title} が発生しました！`, 'important');

  },





  /**
   * events.json の rules.afterApply（適用時, accepted=true）/ rules.onDecline（見送り時, accepted=false）を実行する。
   *  state: { フラグ名: 真偽 }  hook: 改名・昇格処理名  ownerProvinceDelta: { clanId, order, orderMax, troops }
   *  playerBonus: { clanId, gold, rice, previewLines }  transferOfficers: { officerIds, fromClans, toClan, provId, revive }
   *  log: 記録文（afterApply は付帯ログ、onDecline は現状維持ログの差し替え）
   */
  runHistoricalActionBlock(ev, block, accepted) {
    if (!block || typeof block !== 'object') return;
    this.setHistoricalStates(block.state);
    if (block.hook) this.runHistoricalHook(block.hook, !!accepted);
    const delta = block.ownerProvinceDelta;
    if (delta && delta.clanId) {
      const cap = Number.isFinite(Number(delta.orderMax)) ? Number(delta.orderMax) : 100;
      (this.provinces || []).filter(p => p.ownerId === delta.clanId).forEach(p => {
        if (Number(delta.order)) p.order = Math.min(cap, (Number(p.order) || 0) + Number(delta.order));
        if (Number(delta.troops)) p.troops += Number(delta.troops);
      });
    }
    const bonus = block.playerBonus;
    if (bonus && bonus.clanId === this.playerClanId) {
      this.gold += Number(bonus.gold) || 0;
      this.rice += Number(bonus.rice) || 0;
    }
    // transferOfficers は配列でも可（順に適用。先に移した武将は後の fromClans に巻き込まれない）（2026-11-10）
    const moves = Array.isArray(block.transferOfficers) ? block.transferOfficers : (block.transferOfficers ? [block.transferOfficers] : []);
    const move = moves.length ? moves[0] : null;
    moves.forEach(move => {
    if (move && move.toClan) {
      const ids = Array.isArray(move.officerIds) ? move.officerIds : [];
      const fromClans = Array.isArray(move.fromClans) ? move.fromClans : [];
      const killed = Array.isArray(ev?.changes?.killOfficerIds) ? ev.changes.killOfficerIds : [];
      const allOffs = [...(this.activeOfficers || []), ...((typeof window !== 'undefined' && window.OFFICERS_MASTER) || [])];
      allOffs.forEach(o => {
        if (!o) return;
        if (!(ids.includes(o.id) || fromClans.includes(o.clanId))) return;
        if (killed.includes(o.id)) return;
        // 服属・帰順で移る旧当主は、移り先では当主にしない（2026-11-10）
        if (o.clanId !== move.toClan) { o.isDaimyo = false; if ('isLeader' in o) o.isLeader = false; }
        o.clanId = move.toClan;
        if (move.provId) o.assignedProvId = move.provId;
        if (move.revive !== false) o.isDead = false;
      });
    }
    });
    if (accepted && block.log) this.log(block.log, 'important');
    if (block.state || block.hook || delta || bonus || move || (accepted && block.log)) this.updateUI();
  },
  /** setLeader の効果プレビュー */
  describeLeaderLines(map) {
    if (!map || typeof map !== 'object') return [];
    const officers = (typeof window !== 'undefined' && window.OFFICERS_MASTER) || [];
    return Object.entries(map).filter(([, id]) => id).map(([clanId, id]) => {
      const off = officers.find(o => o && o.id === id);
      const cm = (typeof window !== 'undefined' && window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA[clanId]) || null;
      const clanName = (cm && (cm.family || cm.name)) || clanId;
      return `${clanName}の当主：${off && off.name ? off.name : id}`;
    });
  },
  /**
   * events.json の changes.setLeader：{ 勢力ID: 武将ID } で当主を立てる・差し替える。
   * 勢力が地図に残っていて、武将が存命（寿命内）のときだけ。自動で作られた仮の当主は外す
   */
  applyEventLeaders(map) {
    if (!map || typeof map !== 'object' || !this.activeOfficers) return [];
    const seated = [];
    Object.entries(map).forEach(([rawClan, officerId]) => {
      if (!rawClan || !officerId) return;
      const clanId = this.resolveEventTargetClan(rawClan) || rawClan;
      if (!this.isClanExtant(clanId)) return;
      let lord = this.activeOfficers.find(o => o && o.id === officerId);
      if (!lord && typeof window !== 'undefined' && Array.isArray(window.OFFICERS_MASTER)) {
        const master = window.OFFICERS_MASTER.find(o => o && o.id === officerId);
        if (master) {
          lord = JSON.parse(JSON.stringify(master));
          lord.isDead = false;
          this.activeOfficers.push(lord);
        }
      }
      if (!lord || lord.isDead || !this.officerCanInherit(lord)) return;
      if (lord.clanId === clanId && lord.isDaimyo) return;
      const previous = this.activeOfficers.filter(o => o && o !== lord && o.clanId === clanId && o.isDaimyo);
      const heldProvs = (this.provinces || []).filter(p => previous.some(o => p.governorId === o.id));
      previous.forEach(o => { o.isDaimyo = false; });
      // 自動生成の仮当主（off_event_〜）は家臣として残さない
      const placeholders = previous.filter(o => String(o.id || '').startsWith('off_event_'));
      if (placeholders.length) this.activeOfficers = this.activeOfficers.filter(o => !placeholders.includes(o));
      if (lord.assignedProvId) {
        const old = (this.provinces || []).find(p => p.id === lord.assignedProvId && p.governorId === lord.id && p.ownerId !== clanId);
        if (old) old.governorId = null;
      }
      lord.clanId = clanId;
      lord.isDaimyo = true;
      lord.isDead = false;
      lord.hasBeenDaimyo = true;
      if (this.formerDaimyoIds) this.formerDaimyoIds.add(lord.id);
      const capId = typeof window !== 'undefined' && window.CLAN_CAPITAL_PROVINCES ? window.CLAN_CAPITAL_PROVINCES[clanId] : null;
      const home = heldProvs.find(p => p.id === capId) || heldProvs[0]
        || (this.provinces || []).find(p => p.id === capId && p.ownerId === clanId)
        || (this.provinces || []).find(p => p.ownerId === clanId);
      if (home) {
        heldProvs.forEach(p => { if (p !== home && placeholders.some(o => o.id === p.governorId)) p.governorId = null; });
        home.governorId = lord.id;
        lord.assignedProvId = home.id;
      }
      this.lastDaimyoNames = this.lastDaimyoNames || {};
      this.lastDaimyoNames[clanId] = lord.name;
      seated.push(lord);
    });
    return seated;
  },
  /** 家の滅亡（rules.clanCollapse）：当主らを落命させ、残る領国を勝者へ */



  applyClanCollapse(rule) {

    if (!rule || !rule.from || !rule.to) return;

    const deadIds = Array.isArray(rule.killOfficerIds) ? rule.killOfficerIds : [];

    const markDead = (list) => {

      (list || []).forEach(o => {

        if (!o || !this.officerIdIn(o, deadIds)) return;

        o.isDead = true;

        o.isDaimyo = false;

        o.assignedProvId = null;

      });

    };

    markDead(this.activeOfficers);

    markDead(this.officers);

    markDead(window.OFFICERS_MASTER);

    const victor = this.resolveEventTargetClan(rule.to) || rule.to;

    const minTroops = Number(rule.minTroops) || 3000;

    (this.provinces || []).forEach(prov => {

      if (prov.ownerId === rule.from) {

        prov.ownerId = victor;

        prov.troops = Math.max(minTroops, prov.troops || minTroops);

      }

    });

    this.syncDaimyoStatus();

    this.updateActiveOfficers();

    this.updateUI();

  },



  applyHistoricalEventAccept(ev, { closeModal = true } = {}) {

    const modal = document.getElementById('historicalEventModal');

    const cleanUpAndClose = () => {

      if (closeModal && modal) modal.classList.add('hidden');

      if (!(this.pendingHistoryQueue && this.pendingHistoryQueue.length)) this.music.playTrack(this.getSeasonTrackKey(), false, { seasonReturn: true });

    };



      if (ev.changes && ev.changes.territory) {

      // onlyFrom 指定の出来事は、その家に残る領国だけを動かす

      const territory = this.eventTerritoryFor(ev, ev.changes) || {};

      // 受け取り先は領地を動かす前に決める（途中で新勢力が出来て判定がぶれないように）

      const resolvedOwners = {};

      for (const newOwner of new Set(Object.values(territory))) {

        resolvedOwners[newOwner] = this.resolveEventTargetClan(newOwner);

      }

      for (const [pId, rawOwner] of Object.entries(territory)) {

        const newOwner = resolvedOwners[rawOwner] || rawOwner;

        const prov = this.provinces.find(p => p.id === pId);

        if (prov) {

          prov.ownerId = newOwner;

          prov.troops = Math.max(3000, prov.troops || 3000);

        }

      }

      const isHonnouji = this.isSuccessionEvent(ev);

      if (!isHonnouji) {

        this.setupNewDaimyoFromTerritory(Object.values(territory));
        this.syncDaimyoStatus();

        if (ev.changes.appoint) this.appointHistoricalCastellans(ev.changes.appoint);

        this.updateActiveOfficers();

        if (this.currentScenario) this.resolveOfficerAffiliations(this.currentScenario);
        // 当主の指定（changes.setLeader）は所属の整理が済んでから
        if (ev.changes.setLeader) this.applyEventLeaders(ev.changes.setLeader);
      }

      this.runHistoricalApplyHooks(ev.id);

      const collapse = this.eventRuleFor('clanCollapse', ev.id);

      if (collapse) this.applyClanCollapse(collapse);

      this.updateCastlesForYear();

      this.updateUI();



      if (isHonnouji) {

        this.executeHonnoujiSuccession();

        if (!this.isSpectatorMode && this.playerClanId === (this.historicalSuccessionData(ev).formerClan || 'oda')) {
          /* イベント選択後のファンファーレは鳴らさない（2026-10-25） */
          this.log(`⚔️【史実受容】${ev.title}：${this.historicalSuccessionData(ev).playerLog || ev.changes?.message || ''}`, 'important');

          cleanUpAndClose();

          this.showHonnoujiSuccessorSelectModal(ev);

          return true;

        }

      }



      const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

      if (!this.isSpectatorMode && myProvs.length === 0) {

        if (this.isAutoPlay) this.stopAutoPlay('御家滅亡のため');

        setTimeout(() => { this.triggerDefeat(); }, 1200);

      }

    }

    if (ev.changes && !ev.changes.territory && ev.changes.setLeader) this.applyEventLeaders(ev.changes.setLeader);
    if (ev.changes && this.hasEventExtras(ev.changes)) this.applyEventExtras(ev.changes);

    if (ev.changes?.famine) this.applyFamineShock(ev.changes.famine);

    // 適用後の付帯処理（events.json の rules.afterApply）
    const afterApply = this.historicalEventRuleSet(ev).afterApply || null;
    this.runHistoricalActionBlock(ev, afterApply, true);
    /* イベント選択後のファンファーレは鳴らさない（2026-10-25） */

    if (ev.changes?.famine && !ev.changes?.territory) {

      this.log(`🌾【飢饉】${ev.title}：${ev.changes?.message || '兵力と兵糧が大きく減りました。'}`, 'important');

    } else if (!(afterApply && afterApply.suppressLog) && !ev.changes?.territory) {

      this.log(`⚔️【史実受容】${ev.title}：${ev.changes?.message || '史実どおりの結果になりました。'}`, 'important');

    } else if (!(afterApply && afterApply.suppressLog)) {

      this.log(`⚔️【史実受容】${ev.title}：史実通り領地が再編されました。（${ev.changes?.message || ''}）`, 'important');

    }

    cleanUpAndClose();

  },



  applyLinkedHistoricalDataFromChoice(ev, choice) {

    if (!ev || !choice || !choice.isHistorical) return;

    const src = typeof choice.action === 'function' ? String(choice.action) : '';

    if (/applyRebellionFromChoice|executeHonnoujiSuccession/.test(src)) return;

    // 選択側が領地を自前で動かす場合も、落命・同盟などの付帯効果はリンク先から補う

    const choiceMovesLand = /\.ownerId\s*=\s*(?!=)/.test(src);

    const link = this.historicalEventLinks().find(item => item.choiceId === ev.id);

    if (!link) return;

    const dataEv = (window.HISTORICAL_EVENTS_DATA || []).find(item => link.dataIds.includes(item.id));

    if (!dataEv || !dataEv.changes) return;

    if (this.isSuccessionEvent(dataEv)) return;



    const territory = choiceMovesLand ? {} : (this.eventTerritoryFor(dataEv, dataEv.changes) || dataEv.changes.territory || {});

    const pending = {};

    for (const [pId, raw] of Object.entries(territory)) {

      const to = this.resolveEventTargetClan(raw) || raw;

      const prov = (this.provinces || []).find(p => p.id === pId);

      if (prov && prov.ownerId !== to) pending[pId] = raw;

    }

    const payload = {};

    if (Object.keys(pending).length) payload.territory = pending;

    if (dataEv.changes.appoint && !choiceMovesLand) payload.appoint = dataEv.changes.appoint;

    this.eventExtraKeys().forEach(key => {

      if (dataEv.changes[key] !== undefined) payload[key] = dataEv.changes[key];

    });

    if (payload.territory || this.hasEventExtras(payload) || payload.appoint) {

      this.applyEventTerritory(payload);

    }

    this.runHistoricalApplyHooks(dataEv.id);

  },



  applyHistoricalChoice(ev, choice) {

    const modal = document.getElementById('historyEventModal');

    if (modal) modal.classList.add('hidden');



    this.audio.playHyoshigi();

    this._historyFollowUp = false;

    if (!choice.isHistorical) {

      const ifFlag = this.eventRuleFor('setFlagOnIfChoice', ev.id);

      if (ifFlag) this.setHistoricalFlag(ifFlag);

    }

    const resultMsg = choice.action(this);

    this.applyLinkedHistoricalDataFromChoice(ev, choice);



    this.updateUI();



    // 本能寺の後継選択など、続きのダイアログがある場合はそちらが閉じてから次へ進む

    if (this._historyFollowUp) {

      this._historyFollowUp = false;

      this.log(`【イベント決断】${resultMsg}`, 'important');

      return;

    }



    if (this.autoPlayPausedForEvent || this.isAutoPlay) {

      this.log(`【イベント決断】${resultMsg}`, 'important');

      this.continueAfterHistoricalEvent();

      return;

    }



    Swal.fire({

      icon: choice.isHistorical ? 'info' : 'success',

      title: choice.isHistorical ? '📜 史実の道を選択' : '⚡ 歴史改変の英断',

      html: `

        <div style="font-size:12pt; color:#ffd700; margin-bottom:8px; font-weight:bold;">${ev.title}</div>

        <div style="font-size: 12pt; color:#eee; line-height:1.7;">${resultMsg}</div>

      `,

      background: '#24160e',

      color: '#fff',

      confirmButtonColor: '#d4af37'

    }).then(() => this.continueAfterHistoricalEvent());

  }
};
