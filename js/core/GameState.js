/**
 * @file js/core/GameState.js - ゲーム状態クラスとメソッドの合成点
 * 定数・補助関数は GameStateShared.js、メソッド群は state/*.js に分割（2026-11-28）。
 */

import { ScenarioInitMethods } from './state/ScenarioInit.js?v=20261128_v74';
import { OfficerAffiliationMethods } from './state/OfficerAffiliation.js?v=20261128_v74';
import { AllianceAndNamingMethods } from './state/AllianceAndNaming.js?v=20261128_v74';
import { StatsAndSuccessionMethods } from './state/StatsAndSuccession.js?v=20261128_v74';
import { FormationAndMapColorMethods } from './state/FormationAndMapColor.js?v=20261128_v74';
import { EconomyMethods } from './state/Economy.js?v=20261128_v74';
import { BattleMethods } from './state/Battle.js?v=20261128_v74';
import { SeasonFlowMethods } from './state/SeasonFlow.js?v=20261128_v74';
import { CoalitionAndSaveMethods } from './state/CoalitionAndSave.js?v=20261128_v74';
import { EndGameMethods } from './state/EndGame.js?v=20261128_v74';
import { VirtualScenarioMethods } from './state/VirtualScenario.js?v=20261128_v74';
import { UiSyncMethods } from './state/UiSync.js?v=20261128_v74';
import { HistoricalEventsMethods } from './state/HistoricalEvents.js?v=20261128_v74';

export * from './GameStateShared.js?v=20261128_v74';

export class GameState {

  /**

   * @param {Object} [game] - SengokuGame インスタンス

   */

  constructor(game) {

    this.game = game;

    // ゲーム進行・単一情報源 (SSOT) 状態プロパティ

    this.currentScenarioId = '1560';

    this.year = 1560;

    this.seasonIdx = 0;

    this.season = '春';

    this.playerClanId = 'oda';

    this.gold = 3000;

    this.rice = 5000;

    this.ap = 3;

    this.provinces = [];

    this.activeOfficers = [];

    this._virtualDeadOfficerIds = new Set();

    this.alliances = [];

    this.formerDaimyoIds = new Set();

    this.triggeredHistoricalEvents = new Set();

    this.happenedEvents = new Set();

    this.selectedProvId = null;

    this.mapHeatMode = 'none';

    this._eventDecidedId = null;

    this.jimmuEnthronementAccepted = false;

    this.jimmuEnthronementDeclined = false;

    this._jimmuAnnounced = false;

    // [81位] 領土拡大の推移履歴（クリア画面グラフ用）

    this.territoryHistory = [];

    // [42位] 前線から後方へ移行した際の方針自動切替（'logistics' | 'domestic' | 'none'）

    this.autoFrontierPolicy = 'logistics';

  }



  /**

   * 単方向データフロー: 状態変更をコミットし、画面再描画を一元管理

   * @param {Object|Function} mutation - 状態変更データまたはミューテーション関数

   * @param {Object} [uiOpts] - 描画オプション

   */

  commit(mutation, uiOpts = {}) {

    if (typeof mutation === 'function') {

      mutation(this, this.game);

    } else if (mutation && typeof mutation === 'object') {

      Object.assign(this, mutation);

      if (this.game) Object.assign(this.game, mutation);

    }

    if (this.game && typeof this.game.updateUI === 'function') {

      this.game.updateUI(uiOpts);

    }

  }

}

export const GameStateMethods = {
  ...ScenarioInitMethods,
  ...OfficerAffiliationMethods,
  ...AllianceAndNamingMethods,
  ...StatsAndSuccessionMethods,
  ...FormationAndMapColorMethods,
  ...EconomyMethods,
  ...BattleMethods,
  ...SeasonFlowMethods,
  ...CoalitionAndSaveMethods,
  ...EndGameMethods,
  ...VirtualScenarioMethods,
  ...UiSyncMethods,
  ...HistoricalEventsMethods,
};
