/**
 * @file js/core/DataLoader.js - ゲームデータの非同期ロード管理
 * 戦国天下統一伝 ES6モジュール
 * @typedef {import('../types.js').Scenario} Scenario
 * @typedef {import('../types.js').Officer} Officer
 * @typedef {import('../types.js').Province} Province
 * @typedef {import('../types.js').PlayableDaimyo} PlayableDaimyo
 * @typedef {import('../types.js').HistoricalEvent} HistoricalEvent
 */

export class DataLoader {
  static DATA_VERSION = '20261119_v38'; // japan_slg.html の preload と同じ値にすること
  static _fullScenariosPromise = null;
  static _fullScenariosLoaded = false;
  static _gameData = null;

  /**
   * 初回起動高速化のため、scenarios_meta.json と scenario_1560.json のみを先読みして統合する。
   * 片方でも取得に失敗した場合は従来の scenarios.json へフォールバックする。
   * @param {string} v
   * @returns {Promise<Scenario[]>}
   */
  static async fetchInitialScenarios(v = DataLoader.DATA_VERSION) {
    try {
      const [metaList, s1560] = await Promise.all([
        DataLoader.fetchJson(`data/scenarios_meta.json?v=${v}`),
        DataLoader.fetchJson(`data/scenario_1560.json?v=${v}`)
      ]);
      if (!Array.isArray(metaList) || !s1560 || typeof s1560 !== 'object') {
        throw new Error('Invalid initial scenario payload');
      }
      let replaced = false;
      const merged = metaList.map(entry => {
        if (entry && String(entry.id) === String(s1560.id)) {
          replaced = true;
          return s1560;
        }
        return entry && typeof entry === 'object' ? { ...entry, _isStub: true } : entry;
      });
      if (!replaced) merged.push(s1560);
      return merged;
    } catch (err) {
      console.warn('DataLoader: split initial scenarios fetch failed, falling back to scenarios.json', err);
      DataLoader._fullScenariosLoaded = true;
      return await DataLoader.fetchJson(`data/scenarios.json?v=${v}`);
    }
  }

  /**
   * 全シナリオ完全版 (data/scenarios.json) を1回だけフェッチし、既存の配列参照をインプレース更新する。
   * @returns {Promise<Scenario[]>}
   */
  static ensureFullScenarios() {
    const v = DataLoader.DATA_VERSION || '20261119_v38';
    const existing = (typeof window !== 'undefined' && (window.SCENARIOS_DATA || window.SCENARIOS)) || DataLoader._gameData?.scenarios;
    if (DataLoader._fullScenariosLoaded && Array.isArray(existing) && existing.length > 0 && !existing.some(s => s && s._isStub)) {
      return Promise.resolve(existing);
    }
    if (DataLoader._fullScenariosPromise) {
      return DataLoader._fullScenariosPromise;
    }
    DataLoader._fullScenariosPromise = DataLoader.fetchJson(`data/scenarios.json?v=${v}`)
      .then(fullScenarios => {
        if (!Array.isArray(fullScenarios)) {
          throw new Error('scenarios.json did not return an array');
        }
        const targets = new Set();
        if (DataLoader._gameData && Array.isArray(DataLoader._gameData.scenarios)) {
          targets.add(DataLoader._gameData.scenarios);
        }
        if (typeof window !== 'undefined') {
          if (Array.isArray(window.SCENARIOS_DATA)) targets.add(window.SCENARIOS_DATA);
          if (Array.isArray(window.SCENARIOS)) targets.add(window.SCENARIOS);
        }
        if (targets.size > 0) {
          targets.forEach(arr => {
            arr.splice(0, arr.length, ...fullScenarios);
          });
        } else if (typeof window !== 'undefined') {
          window.SCENARIOS_DATA = fullScenarios;
          window.SCENARIOS = fullScenarios;
        }
        if (DataLoader._gameData && !Array.isArray(DataLoader._gameData.scenarios)) {
          DataLoader._gameData.scenarios = fullScenarios;
        }
        DataLoader._fullScenariosLoaded = true;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('fullScenariosLoaded'));
        }
        return DataLoader._gameData?.scenarios || (typeof window !== 'undefined' ? window.SCENARIOS_DATA : fullScenarios) || fullScenarios;
      })
      .catch(err => {
        DataLoader._fullScenariosPromise = null;
        throw err;
      });
    return DataLoader._fullScenariosPromise;
  }

  /**
   * 全ゲームデータを非同期で並列フェッチし、統合データオブジェクトを生成する
   * @returns {Promise<{scenarios: Scenario[], officers: Officer[], provinces: Province[], clans: Object, clanAbilities: Object, clanCapitals: Object, governors: Object, jodaiClans: Object, pinnedGovernors: Object, historicalEvents: Object, castleChanges: Object, daimyoLifespans: Object}>}
   */
  static async loadAllData() {
    try {
      const v = DataLoader.DATA_VERSION;
      const [scenarios, officers, provinces, clansData, governorsData, eventsData, mapBordersData, rulesData] = await Promise.all([
        DataLoader.fetchInitialScenarios(v),
        DataLoader.fetchJson(`data/officers.json?v=${v}`),
        DataLoader.fetchJson(`data/provinces.json?v=${v}`),
        DataLoader.fetchJson(`data/clans.json?v=${v}`),
        DataLoader.fetchJson(`data/governors.json?v=${v}`),
        DataLoader.fetchJson(`data/events.json?v=${v}`),
        DataLoader.fetchJson(`data/map_borders.json?v=${v}`).catch(() => null),
        DataLoader.fetchJson(`data/rules.json?v=${v}`)
      ]);

      if (mapBordersData && typeof window !== 'undefined') {
        window.MAP_BORDERS_DATA = mapBordersData;
      }

      // 佐渡につながる経路は越後のみに限定する（サニタイズ処理）
      if (Array.isArray(provinces)) {
        const sado = provinces.find(p => p && p.id === 'sado');
        if (sado) {
          sado.neighbors = ['echigo'];
        }
        provinces.forEach(p => {
          if (!p || !Array.isArray(p.neighbors)) return;
          if (p.id !== 'echigo') {
            p.neighbors = p.neighbors.filter(nId => nId !== 'sado');
          } else if (!p.neighbors.includes('sado')) {
            p.neighbors.push('sado');
          }
        });
      }

      // 対馬につながる経路は筑前と平戸のみに限定する（2026-11-09）
      if (Array.isArray(provinces)) {
        const TSUSHIMA_LINKS = ['chikuzen_hakata', 'hizen_hirado'];
        provinces.forEach(p => {
          if (!p || !Array.isArray(p.neighbors)) return;
          if (p.id === 'tsushima') {
            p.neighbors = TSUSHIMA_LINKS.slice();
          } else if (TSUSHIMA_LINKS.includes(p.id)) {
            if (!p.neighbors.includes('tsushima')) p.neighbors.push('tsushima');
          } else {
            p.neighbors = p.neighbors.filter(nId => nId !== 'tsushima');
          }
        });
      }

      const gameData = {
        scenarios: scenarios || [],
        officers: officers || [],
        provinces: provinces || [],
        clans: clansData?.clans || {},
        clanAbilities: clansData?.abilities || {},
        clanCapitals: clansData?.capitals || {},
        governors: governorsData?.governors || {},
        jodaiClans: governorsData?.jodaiClans || {},
        pinnedGovernors: governorsData?.pinnedGovernors || {},
        historicalEvents: eventsData?.historicalEvents || {},
        castleChanges: eventsData?.castleChanges || {},
        daimyoLifespans: eventsData?.daimyoLifespans || {},
        choiceEventRules: eventsData?.choiceEventRules || {},
        rules: rulesData || {}
      };

      DataLoader._gameData = gameData;

      // 既存のコードとの100%完全な互換性を確保するためのグローバル参照同期
      DataLoader.syncGlobalReferences(gameData);

      // 残りの全シナリオデータをバックグラウンドで先読み
      if (!DataLoader._fullScenariosLoaded && Array.isArray(gameData.scenarios) && gameData.scenarios.some(s => s && s._isStub)) {
        setTimeout(() => {
          DataLoader.ensureFullScenarios().catch(err => {
            console.warn('DataLoader: background full scenarios load failed:', err);
          });
        }, 0);
      }

      return gameData;
    } catch (err) {
      console.warn('DataLoader: fetch failed or running under restricted protocol (e.g. file://). Attempting fallback.', err);
      // フォールバック: 既存グローバルデータが存在すればそれを利用
      if (typeof window !== 'undefined' && window.SCENARIOS_DATA && window.PROVINCES_DATA) {
        return {
          scenarios: window.SCENARIOS_DATA || [],
          officers: window.OFFICERS_MASTER || [],
          provinces: window.PROVINCES_DATA || [],
          clans: window.CLAN_MASTER_DATA || {},
          clanAbilities: window.CLAN_ABILITIES || {},
          clanCapitals: window.CLAN_CAPITAL_PROVINCES || {},
          governors: window.SCENARIO_HISTORICAL_GOVERNORS || {},
          jodaiClans: window.JODAI_CLAN_BY_SCENARIO || {},
          pinnedGovernors: window.PINNED_SCENARIO_GOVERNORS || {},
          historicalEvents: window.HISTORICAL_EVENTS_DATA || {},
          castleChanges: window.HISTORICAL_CASTLE_CHANGES || {},
          daimyoLifespans: window.DAIMYO_LIFESPAN_DATA || {},
          choiceEventRules: window.HISTORICAL_CHOICE_EVENT_RULES || {}
        };
      }
      throw err;
    }
  }

  /**
   * JSONファイルをfetchしてパース
   * @param {string} url 
   * @returns {Promise<any>}
   */
  static async fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status} while fetching ${url}`);
    }
    return await res.json();
  }

  /**
   * 既存コードとの互換性のためグローバル変数を安全に同期
   * @param {Object} data 
   */
  static syncGlobalReferences(data) {
    if (typeof window === 'undefined') return;

    window.SCENARIOS_DATA = data.scenarios;
    window.SCENARIOS = data.scenarios;
    window.OFFICERS_MASTER = data.officers;
    window.PROVINCES_DATA = data.provinces;
    window.INITIAL_PROVINCES = data.provinces;
    window.CLAN_MASTER_DATA = data.clans;
    window.CLAN_MASTER = data.clans;
    window.CLAN_ABILITIES = data.clanAbilities;
    window.CLAN_CAPITAL_PROVINCES = data.clanCapitals;
    window.SCENARIO_HISTORICAL_GOVERNORS = data.governors;
    window.JODAI_CLAN_BY_SCENARIO = data.jodaiClans;
    window.PINNED_SCENARIO_GOVERNORS = data.pinnedGovernors;
    window.HISTORICAL_EVENTS_DATA = data.historicalEvents;
    window.HISTORICAL_CASTLE_CHANGES = data.castleChanges;
    window.DAIMYO_LIFESPAN_DATA = data.daimyoLifespans;
    window.HISTORICAL_CHOICE_EVENT_RULES = data.choiceEventRules || {};
    DataLoader.syncRuleTables(data.rules);
  }

  /**
   * data/rules.json（武将配属ルール・一門名簿・家名の変遷など）を、従来の window.* 名で配る
   * @param {Object} r
   */
  static syncRuleTables(r) {
    if (typeof window === 'undefined' || !r) return;
    window.RULES_DATA = r;
    window.OFFICER_AFFILIATION_RULES = r.officerAffiliationRules || [];
    window.OFFICER_FAMILY_ROSTERS = r.officerFamilyRosters || {};
    window.CLAN_SERVICE_FALLBACKS = r.clanServiceFallbacks || [];
    window.LEADER_NAME_ALIASES = r.leaderNameAliases || [];
    window.CLAN_NAME_ERAS = r.clanNameEras || {};
    window.CLAN_CAPITAL_ERAS = r.clanCapitalEras || {};
    window.TOYOTOMI_SURNAME_OFFICERS = r.toyotomiSurnameOfficers || {};
    window.KIYOHIRA_OFFICER_IDS = r.kiyohiraOfficerIds || [];
    window.HIDEYOSHI_HEIR_ORDER_IDS = r.hideyoshiHeirOrderIds || [];
    window.AI_CLAN_STRENGTH_BOOSTS = r.aiClanStrengthBoosts || {};
    window.FORCED_MEDIOCRE_UNLESS_HEAD = r.forcedMediocreUnlessHead || {};
    window.NON_ABSORBABLE_CLANS = r.nonAbsorbableClans || [];
    window.OFFICER_ID_ALIASES = r.officerIdAliases || {};
    window.DISTINCT_HOMONYM_OFFICER_IDS = Array.isArray(r.distinctHomonymOfficerIds) ? r.distinctHomonymOfficerIds : [];
    window.ALLSTAR_OFFICER_AFFILIATIONS = r.allstarAffiliations || {};
    window.FACTION_ROSTER_MAPPINGS = r.factionRosters || {};
  }
}

if (typeof window !== 'undefined') {
  window.DataLoader = DataLoader;
}
