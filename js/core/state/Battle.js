/**
 * @file js/core/state/Battle.js - GameState から機能別に分割したメソッド群（23個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { gameRandom, getClanAbility, getEraFlavor } from '../GameStateShared.js?v=20261128_v74';

export const BattleMethods = {



  // ============================================================================

  // 出陣侵攻 ＆ 野戦合戦 ＆ 攻城戦 (完全連動)

  // ============================================================================

  // ============================================================================

  // 出陣侵攻 ＆ 野戦合戦 ＆ 攻城戦 (完全連動)

  // ============================================================================,



  confirmDeploy() {

    const p = this.provinces.find(x => x.id === this.selectedProvId);

    const dstSelect = document.getElementById('deployDstSelect');

    const range = document.getElementById('deployTroopRange');

    const target = this.provinces.find(x => x.id === dstSelect?.value);

    const troopCount = parseInt(range?.value, 10) || 1000;



    if (!p || !target) return;



    // [23位] 豪雪（吹雪）時の北陸・東北・甲信・奥羽地域への出陣制限

    const blizzardRegions = ['北陸', '東北', '甲信', '奥羽'];

    if ((this.currentWeather === '吹雪' || this.currentWeather === '大雪') &&

        (blizzardRegions.includes(target.region) || blizzardRegions.includes(p.region))) {

      if (this.currentWeather === '吹雪') {

        this.showOrderResult('🌨️ 出陣不能（豪雪）', `猛烈な吹雪のため、${target.region}方面（${target.name}）への進軍行軍は不可能です。春を待たれよ。`, '#5dade2');

        return;

      }

    }



    // 出陣規模に応じた兵糧消費（天候による行軍消費増）

    let weatherRiceMult = 1.0;

    if (this.currentWeather === '恵みの雨') weatherRiceMult = 1.15;

    else if (this.currentWeather === '豪雨') weatherRiceMult = 1.30;

    else if (this.currentWeather === '大雪') weatherRiceMult = 1.50;

    else if (this.currentWeather === '吹雪') weatherRiceMult = 2.00;

    const riceCost = Math.round(troopCount * 0.08 * weatherRiceMult);



    if (this.rice < riceCost || this.ap <= 0) {

      this.showOrderResult('⚠ 出陣不能', `兵糧（必要: ${riceCost.toLocaleString()}石）または軍令権(AP)が不足しています。`, '#e74c3c');

      return;

    }



    this.rice -= riceCost;

    this.ap -= 1;

    p.troops -= troopCount;



    document.getElementById('deployModal')?.classList.add('hidden');



    // ユーザー要件: 「空白地となったエリアは侵攻しても戦争せずに領地取得できるようにする」

    if (!target.ownerId) {

      target.ownerId = this.playerClanId;

      target.troops = (target.troops || 0) + troopCount;

      target.defense = Math.max(50, target.defense || 50);

      target.morale = 80;

      target.governorId = null;

      target.governance = 'military';

      target.justConquered = true;



      try {

        if (window.SHOW_CONQUEST_ALERTS) { // 既定は通知なし（年代記のみ。2026-10-11 bn）

          this.audio.playFanfare?.();
        }
        this.music.playTrack(this.getSeasonTrackKey(), false, window.SHOW_CONQUEST_ALERTS ? { noFirstHit: true } : null);

      } catch(e) {}



      if (window.Swal && window.SHOW_CONQUEST_ALERTS) {

        Swal.fire({

          title: `❖ 空白地 接収完了 ❖`,

          html: `

            <div style="text-align:center; padding:10px; font-family:'Noto Serif JP',serif;">

              <p style="font-size:14pt; color:#ffd700; margin-bottom:12px;"><strong>【${target.name}（${target.castleName || target.castle || '城'}）無血領有！】</strong></p>

              <p style="font-size:11.5pt; color:#f5eedc; line-height:1.6;">

                領主不在の空白地であった【${target.name}】へ兵${troopCount.toLocaleString()}人を率いて進駐し、<br>

                戦火を交えることなく我が軍の支配下に組み入れました！

              </p>

            </div>

          `,

          background: '#1c130d',

          color: '#f5eedc',

          confirmButtonText: '善き哉！',

          confirmButtonColor: '#922b21'

        }).then(() => {

          this.updateUI({ provId: target.id });

        });

      }



      this.log(`🏯【無血占領】領主不在の空白地【${target.name}】に兵${troopCount.toLocaleString()}人を進駐させ、戦争を経ずに無血で領有いたしました！`, 'quiet');

      this.appointHistoricalHomeGovernors(this.playerClanId);

      this.updateUI({ provId: target.id });

      return;

    }



    // 攻め込んだ時の勇壮な効果音！（法螺貝 ＋ 轟く陣太鼓）

    try {

      this.audio.playHoragai?.(1.0);

    } catch(e) {}



    // 場面BGM: 合戦BGMへ（大軍勢激突なら決戦・修羅の道）

    try {

      const isLarge = (troopCount + (target.troops || 0)) >= 6000;

      this.music.playTrack(isLarge ? 'battle_intense' : 'battle', false, { noFirstHit: true });

    } catch(e) {}



    this.startFieldBattle(p, target, troopCount);

  },



  startFieldBattle(srcProv, dstProv, playerTroops) {

    this.inBattle = true;

    let enemyFieldTroops = Math.max(300, Math.round(dstProv.troops * 0.6)); // 6割が野戦迎撃に出陣



    // 【フェーズ2: 同盟援軍システム】

    // 防衛側の領国に隣接する「防衛側の同盟国」の領国がある場合、その同盟国の兵力の30%を援軍として加算

    let reinforceTotal = 0;

    const reinforceMsgs = [];

    (dstProv.neighbors || []).forEach(nId => {

      const neighbor = this.provinces.find(x => x.id === nId);

      if (neighbor && neighbor.ownerId && this.isAllied(dstProv.ownerId, neighbor.ownerId)) {

        const rf = Math.round(neighbor.troops * 0.30);

        if (rf > 0) {

          reinforceTotal += rf;

          reinforceMsgs.push(`${this.getClanFamilyName(neighbor.ownerId)}（${neighbor.name}領国より援軍 ${rf.toLocaleString()}人）`);

        }

      }

    });

    enemyFieldTroops += reinforceTotal;



    const playerFormKey = this.selectedFormationKey || 'gyorin';

    let enemyFormKey = (this._deployPredictedFor === dstProv.id && this._deployPredictedEnemyForm)

      ? this._deployPredictedEnemyForm

      : this.pickEnemyFormation(dstProv.ownerId, dstProv, playerFormKey);

    this._deployPredictedEnemyForm = null;

    this._deployPredictedFor = null;



    this.currentBattle = {

      srcProv,

      dstProv,

      playerMax: playerTroops,

      playerTroops: playerTroops,

      playerMorale: 90,

      enemyMax: enemyFieldTroops,

      enemyTroops: enemyFieldTroops,

      enemyMorale: dstProv.morale || 80,

      turn: 1,

      isActionProcessing: false,

      playerFormationKey: playerFormKey,

      enemyFormationKey: enemyFormKey

    };



    const bModal = document.getElementById('battleModal');

    if (bModal) {

      document.getElementById('battleTitle').textContent = `⚔️ ${dstProv.name}の野戦決戦 (${srcProv.name}進軍)`;

      document.getElementById('playerArmyClan').textContent = `${this.playerDaimyo.clan} (我が軍)`;

      document.getElementById('playerGeneralName').textContent = `総大将: ${this.playerDaimyo.name}`;

      document.getElementById('enemyArmyClan').textContent = `${this.getClanFamilyName(dstProv.ownerId)}軍`;

      document.getElementById('enemyGeneralName').textContent = `総大将: ${this.getClanDisplayName(dstProv.ownerId)}`;



      const pForm = this.getFormationMeta(playerFormKey);

      const eForm = this.getFormationMeta(enemyFormKey);

      const pLabel = document.getElementById('playerFormationLabel');

      const eLabel = document.getElementById('enemyFormationLabel');

      if (pLabel) pLabel.textContent = `陣形: ${pForm.name}`;

      const strat = this.getClanStratagemPower(this.playerClanId, srcProv.id);

      const pred = this.predictEnemyFormation(enemyFormKey, strat);

      if (eLabel) {

        if (pred.level === 'unknown') eLabel.textContent = '陣形: 不明';

        else if (pred.level === 'category') eLabel.textContent = `陣形: ${pred.displayName}？`;

        else eLabel.textContent = `陣形: ${eForm.name}（看破${pred.confidence}%）`;

      }

      const bonusEl = document.getElementById('battleFormationBonus');

      if (bonusEl) bonusEl.innerHTML = this.describeFormationMatchup(playerFormKey, enemyFormKey, dstProv).html;



      ['bCmdAssault', 'bCmdShoot', 'bCmdDefend', 'bCmdTactic', 'bCmdRetreat'].forEach(id => {

        document.getElementById(id)?.removeAttribute('disabled');

      });



      const era = (typeof getEraFlavor === 'function') ? getEraFlavor(this.year) : null;

      const bCmdShoot = document.getElementById('bCmdShoot');

      if (bCmdShoot && era) {

        const s1 = bCmdShoot.querySelector('span:first-child');

        if (s1) s1.textContent = era.shootCommand;

        const sub = bCmdShoot.querySelector('.sub');

        if (sub) sub.textContent = era.shootDesc;

      }

      const bCmdTactic = document.getElementById('bCmdTactic');

      if (bCmdTactic && era) {

        const s1 = bCmdTactic.querySelector('span:first-child');

        if (s1) s1.textContent = era.tacticCommand;

        const sub = bCmdTactic.querySelector('.sub');

        if (sub) sub.textContent = era.tacticDesc;

      }



      this.updateBattleUI();

      bModal.classList.remove('hidden');

    }



    try { this.audio.playTaiko?.(1.3); } catch(e) {}

    const openMatch = this.describeFormationMatchup(playerFormKey, enemyFormKey, dstProv);

    this.logBattle(`【野戦開戦】${dstProv.name}（${openMatch.terrain.label}）にて敵軍と激突！ 我が軍:${playerTroops.toLocaleString()}【${this.getFormationMeta(playerFormKey).name}】 vs 敵迎撃軍:${this.currentBattle.enemyTroops.toLocaleString()}【${this.getFormationMeta(enemyFormKey).name}】`);

    if (reinforceTotal > 0) {

      reinforceMsgs.forEach(msg => {

        this.logBattle(`🤝【同盟援軍参戦】${msg}が防衛軍に合流！`);

      });

    }

  },



  updateBattleUI() {

    if (!this.currentBattle) return;

    const b = this.currentBattle;



    const pPct = Math.max(0, Math.min(100, (b.playerTroops / b.playerMax) * 100));

    const ePct = Math.max(0, Math.min(100, (b.enemyTroops / b.enemyMax) * 100));



    document.getElementById('playerArmyBar').style.width = `${pPct}%`;

    document.getElementById('playerArmyTroopsText').textContent = `${b.playerTroops.toLocaleString()} / ${b.playerMax.toLocaleString()}`;

    document.getElementById('playerArmyMorale').textContent = b.playerMorale;



    document.getElementById('enemyArmyBar').style.width = `${ePct}%`;

    document.getElementById('enemyArmyTroopsText').textContent = `${b.enemyTroops.toLocaleString()} / ${b.enemyMax.toLocaleString()}`;

    document.getElementById('enemyArmyMorale').textContent = b.enemyMorale;

  },



  // 戦況ログ（年代記）への出力。リファクタ時に欠落していたため復旧。
  // シナリオ切替中（開始画面）は年代記へ流さず、呼び出し側が例外で止まらないようにする。
  log(msg, type = '') {
    if (this._isSwitchingScenario) return;
    const logBox = document.getElementById('gameLog');
    if (logBox) {
      logBox.innerHTML = '';
      const div = document.createElement('div');
      div.className = `log-entry ${type}`;
      div.textContent = msg;
      logBox.appendChild(div);
    }
    const fullList = document.getElementById('chronicleFullList');
    if (fullList) {
      const div = document.createElement('div');
      div.className = `log-entry ${type}`;
      const seasonName = (this.seasonNames && this.seasonNames[this.seasonIdx]) || '';
      div.textContent = `${this.year}年 ${seasonName}: ${msg}`;
      fullList.insertBefore(div, fullList.firstChild);
    }
  },

  logBattle(msg) {

    const log = document.getElementById('battleLog');

    if (log) {

      log.innerHTML = `<div>${msg}</div>` + log.innerHTML;

    }

  },



  handleBattleAction(actionType) {

    if (!this.currentBattle) return;

    const b = this.currentBattle;

    if (b.isActionProcessing) return;



    const ability = getClanAbility(this.playerClanId);

    const milBonus = (ability.military || 70) / 70; // 0.6〜1.4



    // 合戦中の兵糧消費（兵力に応じた兵站米消費：1ターンあたり8〜25石）

    const battleRiceCost = Math.max(8, Math.round(b.playerTroops * 0.006));

    if (this.rice >= battleRiceCost) {

      this.rice -= battleRiceCost;

    } else {

      b.playerMorale = Math.max(10, b.playerMorale - 15);

      this.logBattle(`⚠【兵糧枯渇】軍糧が尽き、将兵の士気が著しく低下！(士気-15)`);

    }



    let pDamage = 0;

    let eDamage = 0;



    const isRain = this.isRainWeather();

    const terrain = this.inferProvinceTerrain(b.dstProv);

    const horseInfo = this.getHorseBonusInfo(this.playerClanId);

    const gunInfo = this.getGunsmithPortBonusInfo(this.playerClanId);



    if (actionType === 'assault') {

      // 突撃：ハイリスク・ハイリターンな決死の突入

      let atkMultiplier = 1.0;

      let defDamageMultiplier = 1.0;

      let assaultNotes = [];



      // 名馬産地ボーナス：陸奥・甲斐・信濃などを支配すると、突撃系コマンドの攻撃力が底上げされる

      if (horseInfo.hasBonus) {

        atkMultiplier *= horseInfo.multiplier;

        assaultNotes.push(`🐎名馬産地(+${Math.round((horseInfo.multiplier - 1) * 100)}%)`);

      }



      // 天候と陣形の連動：「雨天・豪雨」の日は奇襲・突撃の成功率が上がる

      if (isRain) {

        atkMultiplier *= 1.35;

        defDamageMultiplier *= 0.70;

        assaultNotes.push('🌧️雨天急襲(+35%/自損-30%)');

      }



      eDamage = Math.max(180, Math.round(((b.playerTroops * 0.28 * milBonus) * (b.playerMorale / 80) + gameRandom() * 300) * atkMultiplier));

      pDamage = Math.max(60, Math.round(((b.enemyTroops * 0.22) * (b.enemyMorale / 85) + gameRandom() * 150) * defDamageMultiplier));

      b.playerMorale = Math.min(100, b.playerMorale + 5);



      try {

        this.audio.playGachaGacha?.(1.2);

        this.audio.playSword?.();

      } catch(e) {}

      const noteStr = assaultNotes.length ? `【${assaultNotes.join('・')}】` : '';

      this.logBattle(`⚔️ 我が軍の猛烈な突撃！${noteStr} 敵に${eDamage.toLocaleString()}の打撃！(自損:${pDamage.toLocaleString()})`);

    } else if (actionType === 'shoot') {

      // 射撃：時代連動（古代・中世は弓矢、戦国・幕末は鉄砲・洋式銃火砲）

      let shootMultiplier = 1.0;

      let shootNotes = [];



      // 鉄砲鍛冶・港町ボーナス：種子島・和泉（堺）・近江（国友）・肥前（長崎）を支配すると射撃系強化

      if (gunInfo.hasBonus) {

        shootMultiplier *= gunInfo.shootMultiplier;

        shootNotes.push('🔫鉄砲鍛冶・港町(+30%)');

      }



      // 天候と陣形の連動：「雨天・豪雨」の日は鉄砲系（弓砲射撃）の威力が半減

      if (isRain) {

        shootMultiplier *= 0.50;

        shootNotes.push('🌧️雨天(威力半減)');

      }



      eDamage = Math.max(40, Math.round(((b.playerTroops * 0.16) + gameRandom() * 180) * shootMultiplier));

      pDamage = Math.round(b.enemyTroops * 0.02);



      const era = (typeof getEraFlavor === 'function') ? getEraFlavor(this.year) : null;

      try {

        if (era && (era.key === 'ancient' || era.key === 'medieval')) {

          this.audio.playArrow?.();

        } else {

          this.audio.playTeppo?.();

        }

      } catch(e) {}

      const shootLabel = era?.shootCommand || '🏹 弓砲の一斉射撃';

      const noteStr = shootNotes.length ? `【${shootNotes.join('・')}】` : '';

      this.logBattle(`${shootLabel}！${noteStr} 敵前衛を削り${eDamage.toLocaleString()}の損害！(自損:${pDamage.toLocaleString()})`);

    } else if (actionType === 'defend') {

      // 防御：山岳国（甲斐・信濃など）での防衛戦は強化

      let defCounterMultiplier = 1.0;

      let defNotes = [];

      if (terrain.id === 'mountain') {

        defCounterMultiplier = 1.5;

        defNotes.push('⛰️山岳要害(反撃1.5倍)');

      }

      pDamage = Math.round(b.enemyTroops * 0.02);

      eDamage = Math.max(60, Math.round(b.playerTroops * 0.08 * defCounterMultiplier));

      b.playerMorale = Math.min(100, b.playerMorale + (terrain.id === 'mountain' ? 12 : 8));



      try {

        this.audio.playGachaGacha?.(0.9);

        this.audio.playTaiko?.(0.8);

      } catch(e) {}

      const noteStr = defNotes.length ? `【${defNotes.join('・')}】` : '';

      this.logBattle(`🛡️ 鉄壁の盾陣で反撃！${noteStr} 敵に${eDamage.toLocaleString()}打撃！(自損:${pDamage.toLocaleString()})`);

    } else if (actionType === 'tactic') {

      // 大名奥義発動時の専用ボイス風SE：奥義ボタンを押した瞬間、大太鼓連打＋銅鑼＋法螺貝が重なるド派手な複合サウンド

      try {

        if (this.audio.playOugiVoiceSe) {

          this.audio.playOugiVoiceSe();

        } else {

          this.audio.playWadaikoSound?.(1.3);

          this.audio.playDoraSound?.();

          this.audio.playHoragai?.(1.2);

        }

      } catch(e) {}



      const era = (typeof getEraFlavor === 'function') ? getEraFlavor(this.year) : null;

      const tacticLabel = era?.tacticCommand || '⚡【戦術奥義】';

      const tacticName = this.playerDaimyo?.tactic || '全軍突撃';



      // 大名奥義は効果ありすぎるので、本来の能力を発揮する確率は6割にとどめる

      const isSuccess = gameRandom() < 0.60;

      if (isSuccess) {

        eDamage = Math.max(360, Math.round((b.playerTroops * 0.38) + 420));

        pDamage = Math.round(b.enemyTroops * 0.02);

        b.enemyMorale = Math.max(10, b.enemyMorale - 35);

        this.logBattle(`${tacticLabel}【${tacticName}】が完全炸裂！（成功確率6割達成）敵陣粉砕・${eDamage.toLocaleString()}の超絶打撃！(自損:${pDamage.toLocaleString()})`);

      } else {

        // 4割は本来の能力を発揮できず威力半減

        eDamage = Math.max(120, Math.round((b.playerTroops * 0.16) + 120));

        pDamage = Math.round(b.enemyTroops * 0.05);

        b.enemyMorale = Math.max(10, b.enemyMorale - 10);

        this.logBattle(`⚠️ 敵の迅速な対応に阻まれ、${tacticLabel}【${tacticName}】本来の威力を発揮できず！（威力半減） 敵に${eDamage.toLocaleString()}の打撃。(自損:${pDamage.toLocaleString()})`);

      }

    } else if (actionType === 'retreat') {

      this.log(`【野戦撤退】我が軍は損害を抑えて${b.srcProv.name}へ撤退しました。`);

      b.srcProv.troops += b.playerTroops;

      this.endBattle();

      return;

    }



    // 陣形三すくみ＋地形補正

    {

      const myForm = b.playerFormationKey || this.selectedFormationKey || 'gyorin';

      const enForm = b.enemyFormationKey || 'kakuyoku';

      const rps = this.getRpsMultipliers(myForm, enForm);

      const myTerrain = this.getTerrainDealtBonus(myForm, b.dstProv, false);

      const enTerrain = this.getTerrainDealtBonus(enForm, b.dstProv, true);

      eDamage = Math.max(0, Math.round(eDamage * rps.dealt * myTerrain));

      pDamage = Math.max(0, Math.round(pDamage * rps.taken * enTerrain));



      // 地形ボーナスの可視化

      if (terrain.id === 'mountain' && myForm === 'hoen') {

        this.logBattle(`⛰️【山岳地形ボーナス】峻険な山岳要害にて「方円」の防備が1.5倍に強化！敵の突破を完全に阻む！`);

      } else if (terrain.id === 'plain' && (myForm === 'gyorin' || myForm === 'hoshi')) {

        this.logBattle(`🌾【平野地形ボーナス】広大な平野にて「${this.getFormationMeta(myForm).name}」の直撃突撃力が1.3倍に強化！`);

      }



      if (rps.outcome === 'advantage') {

        this.logBattle(`📜【陣形有利】${this.getFormationMeta(myForm).name}が${this.getFormationMeta(enForm).name}を制す！与ダメ強化／被ダメ軽減`);

      } else if (rps.outcome === 'disadvantage') {

        this.logBattle(`⚠【陣形不利】敵の${this.getFormationMeta(enForm).name}に${this.getFormationMeta(myForm).name}が飲まれる！`);

      }

      if (rps.weatherNote) {

        this.logBattle(`🌧️【天候陣形連動】${rps.weatherNote}`);

      }

    }



    b.enemyTroops = Math.max(0, b.enemyTroops - eDamage);

    b.playerTroops = Math.max(0, b.playerTroops - pDamage);

    this.updateBattleUI();



    // [86位] 戦況連動ダイナミック自動選曲

    try { this.music?.evaluateDynamicBGM?.(this); } catch(e) {}



    // 勝敗判定

    if (b.enemyTroops <= 0 || b.enemyMorale <= 15) {

      b.isActionProcessing = true;

      try { this.audio.playKachi?.(); } catch(e) {}



      // ボタンを無効化して重複クリックを防止

      ['bCmdAssault', 'bCmdShoot', 'bCmdDefend', 'bCmdTactic', 'bCmdRetreat'].forEach(id => {

        document.getElementById(id)?.setAttribute('disabled', 'true');

      });



      // 敵の城がすでに無防備（城防15以下または城兵200以下）なら即座に完全落城制覇！

      if ((b.dstProv.defense || 0) <= 15 || (b.dstProv.troops || 0) <= 300) {

        this.logBattle(`🎉 敵野戦軍を完全壊滅！ 城郭は無防備となり、我が軍は一気に本丸へ突入・完全制圧しました！`);

        setTimeout(() => {

          this.conquerProvince(b.dstProv, b.playerTroops);

        }, 800);

      } else {

        this.logBattle(`🎉 敵野戦軍を完全壊滅！ 残敵は城内へ敗走！ ただちに城郭包囲・攻城戦へ移行します！`);

        setTimeout(() => this.proceedToSiege(), 800);

      }

    } else if (b.playerTroops <= 0) {

      b.isActionProcessing = true;

      try { this.audio.playHyoshigi?.(); } catch(e) {}

      this.log(`【野戦敗北】我が軍は${b.dstProv.name}の野戦で壊滅しました。`, 'battle');

      setTimeout(() => this.endBattle(), 800);

    }

  },



  // 攻城戦へ移行 (確実に動作する設計),



  proceedToSiege() {

    const b = this.currentBattle;

    if (!b) return;



    document.getElementById('battleModal')?.classList.add('hidden');



    // 場面BGM切り替え: 攻城戦BGMへ！

    try { this.music.playTrack('siege'); } catch(e) {}



    // 城内籠城兵力 (野戦前の残存40% + 壊滅後の落武者)

    const castleGarrison = Math.max(300, Math.round(b.dstProv.troops * 0.4));



    // [32位] 名城固有攻城戦ギミック連動

    const gimmick = (window.CASTLE_GIMMICKS && window.CASTLE_GIMMICKS[b.dstProv.id]) || null;

    const baseWall = b.dstProv.defense || 60;

    const wallHp = gimmick ? Math.max(baseWall + (gimmick.defenseBonus || 0), gimmick.wallHp || 100) : baseWall;



    this.currentSiege = {

      dstProv: b.dstProv,

      srcProv: b.srcProv,

      playerMax: b.playerTroops,

      playerTroops: b.playerTroops,

      castleWall: wallHp,

      castleWallMax: Math.max(wallHp, 80),

      enemyTroops: castleGarrison,

      enemyTroopsMax: castleGarrison,

      castleMorale: Math.round(b.dstProv.morale * 0.75) || 70,

      isActionProcessing: false,

      atkMorale: b.playerMorale,   // 項目27 az：攻め手士気（野戦の士気を引継ぎ）

      prepTurns: 0,

      maxPrep: 3,

      persuadeTried: false,

      gimmick: gimmick

    };

    this.siegeOddsNow();



    const sModal = document.getElementById('siegeModal');

    if (sModal) {

      document.getElementById('siegeCastleName').textContent = `🏯 ${b.dstProv.name} (${b.dstProv.castleName || b.dstProv.castle || "居城"}) 包囲戦`;



      const gBanner = document.getElementById('siegeGimmickBanner');

      if (gBanner) {

        if (gimmick) {

          gBanner.style.display = 'flex';

          const iconEl = document.getElementById('siegeGimmickIcon');

          const titleEl = document.getElementById('siegeGimmickTitle');

          const descEl = document.getElementById('siegeGimmickDesc');

          if (iconEl) iconEl.textContent = gimmick.icon || '🏯';

          if (titleEl) titleEl.textContent = `【名城特性: ${gimmick.gimmickName}】`;

          if (descEl) descEl.textContent = gimmick.desc || '';

        } else {

          gBanner.style.display = 'none';

        }

      }



      // 攻城戦ボタンのdisabledを全解除

      this.setSiegeButtonsDisabled(false);



      this.updateSiegeUI();

      sModal.classList.remove('hidden');

    }



    this.logSiege(`【城壁包囲】${b.dstProv.castleName || b.dstProv.castle || "居城"}を完全包囲！ 城攻め作戦を選択してください。`);

    if (gimmick) {

      this.logSiege(`🏯【名城固有ギミック】${gimmick.castleName}・特性【${gimmick.gimmickName}】発動！(${gimmick.desc})`);

    }

    this.logSiege(`🎯 強襲の推定落城率 ${this.currentSiege.odds.pct}%（${this.describeSiegeOdds(this.currentSiege.odds, 4)}）`);

    this.renderSiegeOdds();

  },



  updateSiegeUI() {

    if (!this.currentSiege) return;

    const s = this.currentSiege;



    // 自軍包囲兵力

    const pPct = Math.max(0, Math.min(100, (s.playerTroops / s.playerMax) * 100));

    document.getElementById('siegePlayerBar').style.width = `${pPct}%`;

    document.getElementById('siegePlayerTroopsText').textContent = `${s.playerTroops.toLocaleString()} / ${s.playerMax.toLocaleString()}`;

    document.getElementById('siegePlayerTroopsBadge').textContent = `包囲我が軍: ${s.playerTroops.toLocaleString()} 人`;



    // 城壁耐久度

    const wallPct = Math.max(0, Math.min(100, (s.castleWall / s.castleWallMax) * 100));

    document.getElementById('siegeWallBar').style.width = `${wallPct}%`;

    document.getElementById('siegeWallText').textContent = `${s.castleWall} / ${s.castleWallMax}`;



    // 城内兵力

    const ePct = Math.max(0, Math.min(100, (s.enemyTroops / s.enemyTroopsMax) * 100));

    document.getElementById('siegeEnemyTroopsBar').style.width = `${ePct}%`;

    document.getElementById('siegeEnemyTroopsText').textContent = `${s.enemyTroops.toLocaleString()} 人`;



    // 城内士気

    const morPct = Math.max(0, Math.min(100, s.castleMorale));

    document.getElementById('siegeMoraleBar').style.width = `${morPct}%`;

    document.getElementById('siegeMoraleText').textContent = `${s.castleMorale}`;

  },



  logSiege(msg) {

    const log = document.getElementById('siegeLog');

    if (log) log.innerHTML = `<div>${msg}</div>` + log.innerHTML;

  },



  // 項目27（2026-10-11 az）攻城：強襲は「推定落城率」で一度だけ判定（成功＝落城、失敗＝撃退され生存兵が帰還）。

  // 矢砲斉射・兵糧遮断は準備（最大3手）で籠城兵・士気を削り落城率を上げる。開城勧告は1回だけ、落城率に応じた確率。

  // 以前の「矢砲を連打すれば無損害で必ず落ちる」状態を解消（準備で城兵は初期の5割、士気は15までしか下がらない）。

  siegeOddsNow() {

    const s = this.currentSiege;

    if (!s) return null;

    const odds = this.computeSiegeOdds({

      attackerClanId: this.playerClanId,

      srcProv: s.srcProv,

      dstProv: s.dstProv,

      attackTroops: s.playerTroops,

      defenders: Math.max(1, s.enemyTroops) * 2.5,

      castleWall: s.castleWall,

      defMorale: Math.min(100, (Number(s.castleMorale) || 0) / 0.75),

      atkMorale: s.atkMorale

    });

    s.odds = odds;

    return odds;

  },



  renderSiegeOdds() {

    const s = this.currentSiege;

    if (!s) return;

    const odds = s.odds || this.siegeOddsNow();

    let box = document.getElementById('siegeOddsBox');

    const logEl = document.getElementById('siegeLog');

    if (!box && logEl && logEl.parentNode && typeof document.createElement === 'function') {

      box = document.createElement('div');

      box.id = 'siegeOddsBox';

      box.style.cssText = 'margin-bottom:8px; font-size:11.5pt; color:#ffe9a8; background:rgba(80,50,10,0.4); border:1px solid #a67c2a; border-radius:4px; padding:5px 8px;';

      logEl.parentNode.insertBefore(box, logEl);

    }

    if (box && odds) {

      const left = Math.max(0, (s.maxPrep || 3) - (s.prepTurns || 0));

      box.innerHTML = `🎯 強襲の推定落城率 <strong style="font-size:13pt; color:${odds.pct >= 70 ? '#2ecc71' : (odds.pct >= 45 ? '#f1c40f' : '#e74c3c')};">${odds.pct}%</strong>　<span style="font-size:10.5pt; color:#e8d9b0;">${this.describeSiegeOdds(odds, 5)}</span><br><span style="font-size:10.5pt; color:#cdbb92;">準備（矢砲・兵糧遮断・勧告）残り ${left} 手。強襲に失敗すると撃退され、生存兵は帰還します。</span>`;

    }

    const sub = (id, text) => { const el = document.getElementById(id); const sp = el && el.querySelector ? el.querySelector('.sub') : null; if (sp) sp.textContent = text; };

    sub('siegeBtnAssault', `落城判定 ${odds ? odds.pct : '-'}%`);

    sub('siegeBtnShoot', '城兵削り/自損小');

    sub('siegeBtnSurround', '士気削り/兵糧消費');

    sub('siegeBtnPersuade', s.persuadeTried ? '使者は一度きり' : '無血開城を促す');

  },



  setSiegeButtonsDisabled(disabled) {

    ['sCmdAssault', 'sCmdShoot', 'sCmdSurround', 'sCmdPersuade', 'sCmdRetreat', 'siegeBtnAssault', 'siegeBtnShoot', 'siegeBtnSurround', 'siegeBtnPersuade', 'siegeBtnRetreat'].forEach(id => {

      const el = document.getElementById(id);

      if (!el) return;

      if (disabled) el.setAttribute('disabled', 'true'); else el.removeAttribute('disabled');

    });

  },



  handleSiegeAction(actionType) {

    if (!this.currentSiege) return;

    const s = this.currentSiege;

    if (s.isActionProcessing) return;

    if (!s.odds) this.siegeOddsNow();

    s.prepTurns = s.prepTurns || 0;

    s.maxPrep = s.maxPrep || 3;

    const castleLabel = s.dstProv.castleName || s.dstProv.castle || '居城';

    const isPrep = actionType === 'shoot' || actionType === 'surround' || actionType === 'persuade';

    if (isPrep && s.prepTurns >= s.maxPrep) {

      this.logSiege(`⏳ 長陣の限界：これ以上の準備はできません。強襲で決着をつけるか、包囲を解いてください。`);

      this.renderSiegeOdds();

      return;

    }



    if (actionType === 'assault') {

      const odds = this.siegeOddsNow();

      const wallMax = Math.max(1, s.castleWallMax || 60);

      const wallRatio = Math.max(0, Math.min(1.0, s.castleWall / wallMax));

      const success = gameRandom() < odds.p;

      s.isActionProcessing = true;

      this.setSiegeButtonsDisabled(true);

      try { this.audio.playGachaGacha?.(1.1); this.audio.playTaiko?.(1.4); } catch(e) {}

      if (success) {

        let loss = Math.min(s.playerTroops - 1, Math.round(s.playerTroops * (0.08 + 0.10 * wallRatio + gameRandom() * 0.05)));

        if (s.gimmick && s.gimmick.assaultDefMult) loss = Math.round(loss * s.gimmick.assaultDefMult);

        s.playerTroops = Math.max(1, s.playerTroops - Math.max(0, loss));

        s.enemyTroops = 0;

        this.updateSiegeUI();

        try { this.audio.playKachi?.(); } catch(e) {}

        this.logSiege(`🔨 総攻撃！（推定落城率${odds.pct}%）城門を破り本丸へ突入！(自損:${Math.max(0, loss).toLocaleString()})`);

        this.logSiege(`🎉【城門突破・城池陥落】${castleLabel}は完全に陥落しました！！`);

        this.log(`🏯【攻城成功】${castleLabel}を強襲で攻略！（推定落城率${odds.pct}%：${this.describeSiegeOdds(odds, 3)}）`, 'battle');

        try { this.music?.evaluateDynamicBGM?.(this); } catch(e) {}

        setTimeout(() => this.conquerProvince(s.dstProv, s.playerTroops), 800);

      } else {

        let loss = Math.round(s.playerTroops * (0.30 + 0.10 * wallRatio));

        if (s.gimmick && s.gimmick.assaultDefMult) loss = Math.round(loss * s.gimmick.assaultDefMult);

        const survivors = Math.max(0, s.playerTroops - loss);

        const defLoss = Math.round(s.enemyTroops * 0.15);



        // 強襲の決死攻撃により城門・城壁も削る

        const wallBreach = Math.floor(15 + gameRandom() * 8);

        s.castleWall = Math.max(5, s.castleWall - wallBreach);

        s.dstProv.defense = Math.round(s.castleWall); // 城壁耐久度を領国に持ち越し保存



        s.playerTroops = survivors;

        s.enemyTroops = Math.max(0, s.enemyTroops - defLoss);

        s.srcProv.troops = (Number(s.srcProv.troops) || 0) + survivors;

        this.updateSiegeUI();

        try { this.audio.playHyoshigi?.(); } catch(e) {}

        this.logSiege(`💥 総攻撃は撃退された！（推定落城率${odds.pct}%）損害${loss.toLocaleString()}、敵城壁-${wallBreach}（残り耐久${s.castleWall}）。生存兵${survivors.toLocaleString()}は${s.srcProv.name}へ退却。`);

        this.log(`【攻城失敗】${castleLabel}の総攻撃は撃退されましたが、城壁を${s.castleWall}まで削りました（城壁損壊は次季へ持ち越されます）。生存兵${survivors.toLocaleString()}は${s.srcProv.name}へ帰還。`, 'battle');

        try { this.music?.evaluateDynamicBGM?.(this); } catch(e) {}

        setTimeout(() => this.endBattle(), 800);

      }

      return;

    } else if (actionType === 'shoot') {

      // 矢砲斉射（準備）：城兵を削る。城兵は初期の5割まで、反撃でわずかに自損

      const floor = Math.round((s.enemyTroopsMax || s.enemyTroops) * 0.5);

      const isRain = this.isRainWeather();

      const rainMult = isRain ? 0.50 : 1.0;

      let enemyLoss = Math.min(Math.max(0, s.enemyTroops - floor), Math.round((s.enemyTroops * (0.04 + gameRandom() * 0.03)) * rainMult));

      if (s.gimmick && s.gimmick.shootResist) {

        enemyLoss = Math.round(enemyLoss * (1 - s.gimmick.shootResist));

      }

      const playerLoss = Math.round(s.playerTroops * (0.01 + gameRandom() * 0.01));



      // 城壁耐久度も削る（雨天は威力半減）

      const wallDmg = Math.max(2, Math.round((4 + Math.floor(gameRandom() * 5)) * rainMult));

      s.castleWall = Math.max(5, s.castleWall - wallDmg);

      s.dstProv.defense = Math.round(s.castleWall); // 持ち越し保存



      s.enemyTroops = Math.max(0, s.enemyTroops - enemyLoss);

      s.playerTroops = Math.max(1, s.playerTroops - playerLoss);

      s.castleMorale = Math.max(15, s.castleMorale - 3);

      s.prepTurns++;

      try { this.audio.playTeppo?.(); } catch(e) {}

      const rainNote = isRain ? '（🌧️雨天により威力半減）' : '';

      this.logSiege(`🏹 城内へ矢砲の雨を浴びせる！${rainNote} 籠城兵-${enemyLoss}、城壁耐久-${wallDmg}（残耐久:${s.castleWall}、自損:${playerLoss}）`);

      if (s.gimmick && s.gimmick.shootResist) {

        this.logSiege(`🏯【名城防御】${s.gimmick.castleName}の高所天主・石垣により射撃被害を軽減！`);

      }

      try { this.music?.evaluateDynamicBGM?.(this); } catch(e) {}

    } else if (actionType === 'surround') {

      // 兵糧遮断（準備：自軍の兵糧を消費、足りない場合は強制撤退）

      const siegeRiceCost = Math.max(10, Math.round(s.playerTroops * 0.008));

      if (this.rice < siegeRiceCost) {

        s.isActionProcessing = true;

        s.dstProv.defense = Math.round(s.castleWall); // 城壁耐久度持ち越し保存

        this.log(`⚠️【兵糧枯渇・攻城失敗】包囲軍の兵糧が底をつき（必要:${siegeRiceCost}石/所持:${this.rice}石）、城囲みを維持できず強制撤退しました！（城壁耐久${s.castleWall}は持ち越し）`, 'battle');

        s.srcProv.troops += s.playerTroops;

        this.setSiegeButtonsDisabled(true);

        setTimeout(() => this.endBattle(), 800);

        return;

      }

      this.rice -= siegeRiceCost;

      this.updateStatusHeader();
      try { window.SengokuSoundSync?.syncAllUI?.(); } catch (_) {}

      let morLoss = 8 + Math.floor(gameRandom() * 5);

      const floor = Math.round((s.enemyTroopsMax || s.enemyTroops) * 0.5);

      let starve = Math.min(Math.max(0, s.enemyTroops - floor), Math.round(s.enemyTroops * 0.02));



      // 名城ギミック：兵糧攻め耐性

      if (s.gimmick && s.gimmick.siegeResist) {

        morLoss = Math.round(morLoss * s.gimmick.siegeResist);

        starve = Math.round(starve * s.gimmick.siegeResist);

      }



      s.castleMorale = Math.max(15, s.castleMorale - morLoss);

      s.enemyTroops = Math.max(0, s.enemyTroops - starve);

      s.prepTurns++;

      try { this.audio.playHyoshigi?.(); } catch(e) {}

      this.logSiege(`🌾 外部からの補給路を遮断！(軍糧消費:${siegeRiceCost}石) 敵士気-${morLoss}、籠城兵-${starve}`);

      if (s.gimmick && s.gimmick.siegeResist) {

        this.logSiege(`🏯【名城特性: ${s.gimmick.gimmickName}】備蓄と堅牢な大総構えにより兵糧攻めの影響を軽減！`);

      }

      // 名城ギミック：逆襲反撃

      if (s.gimmick && s.gimmick.counterRate) {

        const counterDmg = Math.max(30, Math.round(s.playerTroops * s.gimmick.counterRate * 0.04));

        s.playerTroops = Math.max(1, s.playerTroops - counterDmg);

        this.logSiege(`⚡【城内逆襲】${s.gimmick.castleName}の守備隊が包囲陣へ夜襲反撃！ 我が軍損害: -${counterDmg.toLocaleString()}人`);

      }

      try { this.music?.evaluateDynamicBGM?.(this); } catch(e) {}

    } else if (actionType === 'persuade') {

      // 開城勧告（1回だけ）：落城率が高いほど、士気が低いほど受諾しやすい

      if (s.persuadeTried) {

        this.logSiege(`📜 再度の使者は門前払い。勧告は一度きりです。`);

        this.renderSiegeOdds();

        return;

      }

      s.persuadeTried = true;

      s.prepTurns++;

      const odds = this.siegeOddsNow();

      const chance = Math.max(0.03, Math.min(0.45, (odds.p - 0.5) * 0.6 + (s.castleMorale <= 40 ? 0.10 : 0)));

      if (gameRandom() < chance) {

        s.isActionProcessing = true;

        this.setSiegeButtonsDisabled(true);

        this.logSiege(`📜 開城勧告を受諾！（受諾率${Math.round(chance * 100)}%）「兵の命を救うため、城を明け渡す！」 無血開城！`);

        this.logSiege(`🎉【無血開城】${castleLabel}を接収しました！`);

        try { this.audio.playKachi?.(); } catch(e) {}

        setTimeout(() => this.conquerProvince(s.dstProv, s.playerTroops), 800);

        return;

      }

      s.castleMorale = Math.min(100, s.castleMorale + 5);

      try { this.audio.playSlash?.(); } catch(e) {}

      this.logSiege(`📜 勧告使者を追い返された！（受諾率${Math.round(chance * 100)}%）「城を枕に討死あるのみ！」(敵士気+5)`);

    } else if (actionType === 'retreat') {

      // 包囲解除撤退：削った城壁耐久度を領国に確実に持ち越し保存

      s.dstProv.defense = Math.round(s.castleWall);

      this.log(`🏯【攻城撤退・城壁持ち越し】我が軍は包囲を解き、${s.srcProv.name}へ兵力を帰還させました。削った城壁耐久度（${s.castleWall} / ${s.castleWallMax}）は保持され、次季以降の攻略が容易になります！`);

      s.srcProv.troops += s.playerTroops;

      this.endBattle();

      return;

    }



    this.updateSiegeUI();

    this.siegeOddsNow();

    this.renderSiegeOdds();

  },



  // ---- 余勢の制圧（2026-10-11 bo）----

  // 大大名（攻略後の領国数が MOMENTUM_LARGE_CLAN_PROVS 以上）が合戦で国を取ったとき、隣接する同じ敗者の手薄な国も制圧する。

  // 戻り値：制圧した国の配列（兵は conqueredProv の勝ち残りから移すだけで増えない）

  applyMomentumCaptures(winnerId, loserId, conqueredProv, opts = {}) {

    const LARGE = Number(window.MOMENTUM_LARGE_CLAN_PROVS) || 20;

    const MAXN = Number.isFinite(Number(window.MOMENTUM_MAX_CAPTURES)) ? Number(window.MOMENTUM_MAX_CAPTURES) : 2;

    const WEAK = Number(window.MOMENTUM_WEAK_RATIO) || 0.35;

    if (!winnerId || !loserId || loserId === 'null' || winnerId === loserId || !conqueredProv || MAXN <= 0) return [];

    const owned = (this.provinces || []).filter(p => p.ownerId === winnerId).length;

    if (owned < LARGE) return [];

    const survivors = Number(conqueredProv.troops) || 0;

    if (survivors < 1000) return [];

    const nbrs = (conqueredProv.neighbors || []).map(id => (this.provinces || []).find(p => p.id === id)).filter(Boolean);

    const cands = nbrs.filter(p => p.ownerId === loserId && !this.isCapitalProvince(p.id, loserId)

      && (Number(p.troops) || 0) < survivors * WEAK)

      .sort((a, b) => ((Number(a.troops) || 0) - (Number(b.troops) || 0)) || String(a.id).localeCompare(String(b.id)));

    const out = [];

    for (const p of cands) {

      if (out.length >= MAXN) break;

      // 本拠の判定は都度（直前の制圧で遷都が起きても本拠は取らない）。最後の1国も取らない

      if (this.isCapitalProvince(p.id, loserId)) continue;

      if ((this.provinces || []).filter(x => x.ownerId === loserId).length <= 1) break;

      const garrison = Number(p.troops) || 0;

      const avail = (Number(conqueredProv.troops) || 0) - Math.round(survivors * 0.4);

      const move = Math.min(avail, Math.round(Math.max(survivors * 0.2, garrison * 1.2, 200)));

      if (move < 200 || move <= garrison) continue;

      this.handleProvinceLoss(p, loserId, !!opts.isPlayer);

      conqueredProv.troops = (Number(conqueredProv.troops) || 0) - move;

      p.ownerId = winnerId;

      p.troops = move;

      p.defense = Math.max(30, (Number(p.defense) || 50) - 15);

      p.morale = 75;

      if (opts.isPlayer) p.governance = 'direct';

      out.push({ id: p.id, name: p.name, troops: move, garrison });

    }

    if (out.length) {

      const names = out.map(c => c.name).join('・');

      const winner = winnerId === this.playerClanId ? '我が軍' : `${this.getClanFamilyName(winnerId)}軍`;

      this.log(`🐎【余勢】${winner}は${conqueredProv.name}攻略の勢いに乗り、${this.getClanFamilyName(loserId)}の手薄な${names}も制圧しました（兵${out.reduce((s, c) => s + c.troops, 0).toLocaleString()}を分遣）。`, 'quiet');

    }

    return out;

  },



  async conquerProvince(dstProv, remainTroops) {

    const oldOwner = dstProv.ownerId;

    const remainingProvs = this.provinces.filter(p => p.ownerId === oldOwner && p.id !== dstProv.id);

    const isClanDestroyed = (remainingProvs.length === 0);



    // 滅亡時に捕縛する対象武将（大名および勢力の全存命武将） (要件3)

    let capturedList = [];

    if (isClanDestroyed && oldOwner && oldOwner !== this.playerClanId) {

      capturedList = (this.activeOfficers || []).filter(o => o.clanId === oldOwner && !o.isDead);

    }



    this.handleProvinceLoss(dstProv, oldOwner, true);

    dstProv.ownerId = this.playerClanId;

    dstProv.troops = Math.max(500, remainTroops);

    dstProv.defense = 40;

    dstProv.morale = 80;

    dstProv.governance = 'direct';



    // 余勢の制圧（大大名のみ。2026-10-11 bo）：合戦/攻城の画面に一行出して少し長く開いておく

    let momentum = [];

    try { momentum = this.applyMomentumCaptures(this.playerClanId, oldOwner, dstProv, { isPlayer: true }) || []; } catch (e) { momentum = []; }

    if (momentum.length) {

      const line = `🐎 余勢で${momentum.map(c => c.name).join('・')}も制圧！`;

      try {

        const siegeOpen = document.getElementById('siegeModal') && !document.getElementById('siegeModal').classList.contains('hidden');

        if (siegeOpen) this.logSiege?.(line); else this.logBattle?.(line);

      } catch (e) {}

      await new Promise(r => setTimeout(r, 1800));

    }



    document.getElementById('battleModal')?.classList.add('hidden');

    document.getElementById('siegeModal')?.classList.add('hidden');

    this.endBattle();



    this.stats.battlesWon++;

    // 攻略の通知は出さず年代記にだけ（合戦・攻城の画面の勝鬨はそのまま。2026-10-11 bn）

    if (window.SHOW_CONQUEST_ALERTS) { try { this.audio.playGrandFanfare?.(); } catch(e) {} }

    this.log(`🚩【城池陥落・領国平定】${dstProv.name} (${dstProv.castleName || dstProv.castle || "居城"}) を完全制圧！ 貴家の支配領国となりました！`, 'quiet');

    if (window.SHOW_CONQUEST_ALERTS) this.showOrderResult('🏯 領国制覇！', `${dstProv.name} (${dstProv.castleName || dstProv.castle || "居城"}) を完全平定・占領しました！`, '#2ecc71');



    if (isClanDestroyed) {

      this.log(`【御家滅亡】${this.getClanFamilyName(oldOwner)}はすべての領国を失い、完全に滅亡しました！`, 'important');

      // 滅亡のアラート（アイキャッチ通知）は省略し、戦国年代記の記録で確認

    }



    // 自動セーブ実行

    this.autoSave();



    // 領国表示とマップ更新（必ず先行実行して領土色・バッジを確実に自国へ切り替え）

    this.selectProvince(dstProv.id);

    this.appointHistoricalHomeGovernors(this.playerClanId);

    this.autoAppointComputerCastellans({ fillVacancies: true });

    // [42位] 前線から後方へ移行した国の統治方針を自動切替

    this.checkAutoFrontierPolicySwitch();

    // [81位] 領土拡大履歴の記録

    this.recordTerritoryHistory();

    this.updateUI();



    // 敵大名滅亡時の捕縛武将処断・登用ダイアログ (要件3, 4, 5)

    if (capturedList.length > 0) {

      await this.handleCapturedOfficers(capturedList, oldOwner);

    }



    // 天下統一 ＆ 征夷大将軍就任判定

    if (this.checkEndGameConditions()) {

      return;

    }

  },



  // 敵大名滅亡時の捕縛武将処断・登用システム (要件3: 捕縛/登用/斬首/解放, 要件4: 登用確率6割, 要件5: 浪人化)

  async handleCapturedOfficers(officers, oldOwnerId) {

    if (!officers || officers.length === 0) return;

    const noExecution = Number(this.year) >= 1880; // 1880年以降は敵武将を斬首できない（2026-11-09）
    const clanName = this.getClanFamilyName(oldOwnerId);



    // 捕縛アナウンスダイアログ

    if (window.Swal) {

      await Swal.fire({

        title: '⚔️【敵将捕縛・滅亡処断】⚔️',

        html: `

          <div style="font-size:12pt; text-align:left; line-height:1.7; color:#f5eedc; font-family:'Noto Serif JP',serif;">

            <p style="font-size:13pt; color:var(--gold-bright); margin-bottom:8px;">

              <strong>【${clanName}】</strong>は最後の居城を失い、完全に滅亡いたしました！

            </p>

            <p>

              城内にて敵大名および麾下の武将 <strong>${officers.length}名</strong> を全員捕縛いたしました。

            </p>

            <div style="background:rgba(0,0,0,0.4); padding:10px 14px; border-radius:5px; border-left:3px solid var(--gold); margin-top:10px;">

              捕縛した武将一人ひとりと対面し、<strong>【登用】</strong>（登用確率60%）、${noExecution ? '' : '<strong>【斬首】</strong>（処刑）、'}<strong>【解放】</strong>（放免・浪人）の処遇をご決断ください。

            </div>

          </div>

        `,

        background: '#1c130d',

        color: '#f5eedc',

        confirmButtonText: '武将と対面する',

        confirmButtonColor: '#922b21'

      });

    }



    // 1人ずつ対面処断（5名以上なら一括登用・一括解放・一括斬首も選べる。一括斬首は1880年以降は不可）（2026-11-09）
    const canBulk = officers.length >= 5;
    let bulk = null;
    const bulkResults = [];

    for (let i = 0; i < officers.length; i++) {

      const off = officers[i];

      const comment = this.getOfficerComment(off);

      const isDaimyo = off.isDaimyo;

      const roleText = isDaimyo ? '👑 旧当主' : '🏯 配下武将';

      const age = this.year - (off.birthYear || 1530);



      let decision = 'release'; // デフォルト
      if (bulk) decision = bulk;



      if (window.Swal && !bulk) {
        let bulkChoice = null;
        const remain = officers.length - i;
        const res = await Swal.fire({

          title: `❖ 捕縛武将 (${i + 1}/${officers.length}) ❖`,

          html: `

            <div style="font-size:12pt; text-align:left; color:#f5eedc; font-family:'Noto Serif JP',serif;">

              <!-- 武将ヘッダー -->

              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #5a4638; padding-bottom:8px; margin-bottom:12px;">

                <div>

                  <span style="font-size:18pt; font-weight:bold; color:#fff;">${off.name}</span>

                  <span style="background:${isDaimyo ? '#b7950b' : '#2980b9'}; color:#fff; padding:2px 10px; border-radius:3px; font-size:11pt; margin-left:8px; font-weight:bold;">${roleText}</span>

                  <span style="color:#aaa; font-size:11.5pt; margin-left:6px;">(${age}歳)</span>

                </div>

              </div>



              <!-- 能力値カード -->

              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px; text-align:center;">

                <div style="background:rgba(231,76,60,0.18); border:1px solid #c0392b; padding:6px; border-radius:4px;">

                  <div style="font-size:11pt; color:#ff7675;">⚔️ 武勇</div>

                  <div style="font-size:16pt; font-weight:bold; color:#ff7675;">${off.military}</div>

                </div>

                <div style="background:rgba(52,152,219,0.18); border:1px solid #2980b9; padding:6px; border-radius:4px;">

                  <div style="font-size:11pt; color:#74b9ff;">🌾 内政</div>

                  <div style="font-size:16pt; font-weight:bold; color:#74b9ff;">${off.politic || off.politics}</div>

                </div>

                <div style="background:rgba(46,204,113,0.18); border:1px solid #27ae60; padding:6px; border-radius:4px;">

                  <div style="font-size:11pt; color:#55efc4;">📜 知略</div>

                  <div style="font-size:16pt; font-weight:bold; color:#55efc4;">${off.intel || off.stratagem}</div>

                </div>

              </div>



              <!-- 列伝ダイアログ -->

              <div style="font-size:11.5pt; color:#ddd; min-height:50px; max-height:240px; height:auto; overflow-y:auto; word-break:break-word; line-height:1.6; margin-bottom:14px; background:rgba(0,0,0,0.4); padding:8px 10px; border-radius:4px; border:1px solid #4a3b2c;">

                <strong>【列伝】</strong> ${this.cleanOfficerLore(off.lore) || '歴史に名高い名将。'}

              </div>



              <div style="text-align:center; padding:4px; color:#ffd700; font-size:12pt; font-weight:bold;">

                いかが処遇なさいますか？

              </div>
              ${canBulk ? `
              <div style="margin-top:10px; padding:8px 10px; border-top:1px dashed #5a4638; text-align:center;">
                <div style="font-size:11pt; color:#c8b896; margin-bottom:6px;">残り${remain}名をまとめて処遇</div>
                <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
                  <button type="button" class="cap-bulk-btn" data-bulk="recruit" style="background:#1e8449; color:#fff; border:1px solid #2ecc71; border-radius:4px; padding:5px 12px; font-size:11.5pt; font-weight:bold; cursor:pointer;">一括登用</button>
                  <button type="button" class="cap-bulk-btn" data-bulk="release" style="background:#5d6d7e; color:#fff; border:1px solid #95a5a6; border-radius:4px; padding:5px 12px; font-size:11.5pt; font-weight:bold; cursor:pointer;">一括解放</button>
                  ${noExecution ? '' : `<button type="button" class="cap-bulk-btn" data-bulk="execute" style="background:#922b21; color:#fff; border:1px solid #e74c3c; border-radius:4px; padding:5px 12px; font-size:11.5pt; font-weight:bold; cursor:pointer;">一括斬首</button>`}
                </div>
              </div>` : ''}

            </div>

          `,

          background: '#1c130d',

          color: '#f5eedc',

          showCancelButton: true,

          showDenyButton: !noExecution, // 1880年以降は斬首できない（2026-11-09）

          confirmButtonText: '🤝 登用 (確率60%)',

          confirmButtonColor: '#27ae60',

          denyButtonText: '🗡️ 斬首 (処刑)',

          denyButtonColor: '#c0392b',

          cancelButtonText: '🕊️ 解放 (放免・浪人)',

          cancelButtonColor: '#7f8c8d',

          allowOutsideClick: false,
          didOpen: (popup) => {
            popup.querySelectorAll('.cap-bulk-btn').forEach(btn => {
              btn.addEventListener('click', () => { bulkChoice = btn.dataset.bulk; Swal.close(); });
            });
          }

        });

        if (bulkChoice && !(bulkChoice === 'execute' && noExecution)) {
          bulk = bulkChoice;
          bulkResults.length = 0; // 一括開始前の個別処遇は一覧に含めない
          decision = bulk;
        } else if (res.isConfirmed) {

          decision = 'recruit';

        } else if (res.isDenied && !noExecution) {

          decision = 'execute';

        } else {

          decision = 'release';

        }

      }



      // 処遇判定

      if (decision === 'recruit') {

        // 登用確率 60% (要件4: 登用できる確率は6割)

        const isSuccess = gameRandom() < 0.60;

        if (isSuccess) {

          off.clanId = this.playerClanId;

          off.isDaimyo = false;

          off.assignedProvId = null;

          this.log(`🤝【登用成功】「我が命、貴殿に捧げましょう！」${off.name}が我が軍の配下に加わりました！`, 'important');

          this.appointHistoricalHomeGovernors(this.playerClanId);
          bulkResults.push({ name: off.name, text: '登用成功（配下に加わる）', color: '#2ecc71' });

          try { this.audio.playTaiko?.(); } catch(e) {}

          if (window.Swal && !bulk) {

            await Swal.fire({

              icon: 'success',

              title: '登用成功！',

              html: `

                <div style="font-size:13pt; color:#2ecc71; font-weight:bold; margin-bottom:8px;">「我が命、貴殿に捧げましょう！」</div>

                <div style="font-size:12pt; color:#eee;">${off.name}公が我が軍の配下に加わりました！</div>

              `,

              background: '#1c130d',

              color: '#fff',

              confirmButtonColor: '#27ae60',
              confirmButtonText: '次へ (1秒で進行)',
              timer: 1000,
              timerProgressBar: true

            });

          }

        } else {

          // 登用拒絶 -> 浪人化 (要件5: 解放された武将は浪人となり、他家に仕官できるようになります)

          off.clanId = 'ronin';

          off.isDaimyo = false;

          off.assignedProvId = null;

          if (off.id === 'off_ashikaga_yoshiaki') {

            off.defaultProv = 'bingo';

            off.assignedProvId = null;

          }

          bulkResults.push({ name: off.name, text: '登用拒絶（浪人となる）', color: '#e74c3c' });
          this.log(`💢【登用拒絶】「主君を討たれ、仇敵に仕えるつもりはない！」${off.name}は登用を拒絶し、浪人となりました。`, 'battle');

          try { this.audio.playHyoshigi?.(); } catch(e) {}

          if (window.Swal && !bulk) {

            await Swal.fire({

              icon: 'error',

              title: '登用拒絶……',

              html: `

                <div style="font-size:13pt; color:#e74c3c; font-weight:bold; margin-bottom:8px;">「仇敵に仕えるつもりはない！」</div>

                <div style="font-size:12pt; color:#eee;">${off.name}は登用を断固拒絶し、陣を立ち去りました（浪人となりました）。</div>

              `,

              background: '#1c130d',

              color: '#fff',

              confirmButtonColor: '#7f8c8d',
              confirmButtonText: '次へ (1秒で進行)',
              timer: 1000,
              timerProgressBar: true

            });

          }

        }

      } else if (decision === 'execute') {

        // 斬首 (処刑)

        off.isDead = true;

        off.assignedProvId = null;

        bulkResults.push({ name: off.name, text: '斬首', color: '#c0392b' });
        this.log(`【斬首処刑】${off.name}を処刑いたしました。「無念……！」`, 'important');

        try { this.audio.playHyoshigi?.(); } catch(e) {}

        if (window.Swal && !bulk) {

          await Swal.fire({

            icon: 'warning',

            title: '処刑執行',

            html: `

              <div style="font-size:13pt; color:#e74c3c; margin-bottom:8px;">「無念……！」</div>

              <div style="font-size:12pt; color:#eee;">${off.name}を処刑いたしました。</div>

            `,

            background: '#1c130d',

            color: '#fff',

            confirmButtonColor: '#c0392b',
              confirmButtonText: '次へ (1秒で進行)',
              timer: 1000,
              timerProgressBar: true

          });

        }

      } else {

        // 解放 (放免・浪人)

        off.clanId = 'ronin';

        off.isDaimyo = false;

        off.assignedProvId = null;

        if (off.id === 'off_ashikaga_yoshiaki') {

          off.defaultProv = 'bingo';

          off.assignedProvId = null;

        }

        bulkResults.push({ name: off.name, text: '解放（浪人となる）', color: '#5dade2' });
        this.log(`🕊️【放免解放】「情けは無用なれど……忝い」${off.name}を放免いたしました（浪人となりました）。`);

        if (window.Swal && !bulk) {

          await Swal.fire({

            icon: 'info',

            title: '放免・解放',

            html: `

              <div style="font-size:13pt; color:#3498db; margin-bottom:8px;">「情けは無用なれど……忝い」</div>

              <div style="font-size:12pt; color:#eee;">${off.name}を放免いたしました（浪人となり各地へ落ち延びました）。</div>

            `,

            background: '#1c130d',

            color: '#fff',

            confirmButtonColor: '#3498db',
              confirmButtonText: '次へ (1秒で進行)',
              timer: 1000,
              timerProgressBar: true

          });

        }

      }

    }



    // 一括処遇の結果はまとめて一つの画面に、一人ずつ続けて表示する
    if (bulk && window.Swal) {
      const shown = bulkResults.slice();
      const label = { recruit: '一括登用', release: '一括解放', execute: '一括斬首' }[bulk] || '一括処遇';
      const cnt = (t) => shown.filter(r => r.text.startsWith(t)).length;
      const summary = bulk === 'recruit'
        ? `登用成功 ${cnt('登用成功')}名 ／ 登用拒絶 ${cnt('登用拒絶')}名`
        : (bulk === 'execute' ? `斬首 ${cnt('斬首')}名` : `解放 ${cnt('解放')}名`);
      await Swal.fire({
        title: `❖ ${label}の結果 ❖`,
        html: `
          <div style="font-size:12pt; color:#f5eedc; text-align:left; font-family:'Noto Serif JP',serif;">
            <div id="capBulkList" style="max-height:calc(50vh / var(--ui-zoom, 1)); overflow-y:auto; background:rgba(0,0,0,0.35); border:1px solid #4a3b2c; border-radius:4px; padding:6px 10px;">
              ${shown.map(r => `<div class="cap-bulk-line" style="display:flex; justify-content:space-between; gap:10px; padding:3px 0; border-bottom:1px dotted #3d2f22; opacity:0; transition:opacity .25s;"><span style="color:#fff; font-weight:bold;">${r.name}</span><span style="color:${r.color}; white-space:nowrap;">${r.text}</span></div>`).join('')}
            </div>
            <div style="text-align:center; margin-top:8px; color:#ffd700; font-weight:bold;">${summary}</div>
          </div>
        `,
        background: '#1c130d',
        color: '#f5eedc',
        confirmButtonText: '了解',
        confirmButtonColor: '#922b21',
        didOpen: (popup) => {
          const lines = popup.querySelectorAll('.cap-bulk-line');
          const box = popup.querySelector('#capBulkList');
          lines.forEach((ln, idx) => setTimeout(() => {
            ln.style.opacity = '1';
            if (box) box.scrollTop = ln.offsetTop - box.offsetTop - box.clientHeight + ln.offsetHeight + 8;
          }, 180 * idx));
        }
      });
    }
    this.updateActiveOfficers();

    this.updateUI();

  },



  // 浪人の他家・自軍仕官システム（大名の武将不足・滅亡を防止）,



  processRoninEmployment() {

    const ronins = (this.activeOfficers || []).filter(o => o.clanId === 'ronin' && !o.isDead);

    if (ronins.length === 0) return;



    const aliveClans = [...new Set(this.provinces.map(p => p.ownerId).filter(Boolean))];

    if (aliveClans.length === 0) return;



    const myOfficers = (this.activeOfficers || []).filter(o => o.clanId === this.playerClanId && !o.isDead);



    // 1. プレイヤーへの仕官希望者（遠国も可。跡継ぎ不在なら確率が上がり、遠国からも来る）

    let applicantForPlayer = null;

    const playerLacksHeir = aliveClans.includes(this.playerClanId) && this.householdLacksHeir(this.playerClanId);

    if (aliveClans.includes(this.playerClanId)) {

      const eligible = ronins

        .map(r => ({ r, dist: this.getRoninDistanceToClan(r, this.playerClanId) }))

        .filter(x => Number.isFinite(x.dist) && (playerLacksHeir || x.dist <= 1));

      const hasLocal = eligible.some(x => x.dist === 0);

      const hasNear = eligible.some(x => x.dist <= 1);

      const isCrisis = myOfficers.length <= 3;

      const applyChance = playerLacksHeir

        ? (hasLocal ? 0.90 : (hasNear ? 0.74 : 0.58))

        : (hasLocal ? (isCrisis ? 0.80 : 0.32) : (isCrisis ? 0.40 : 0.12));



      if (eligible.length > 0 && gameRandom() < applyChance) {

        const pool = [];

        eligible.forEach(x => {

          const weight = x.dist === 0 ? 5 : (x.dist === 1 ? 2 : 1);

          for (let i = 0; i < weight; i++) pool.push(x.r);

        });

        applicantForPlayer = pool[Math.floor(gameRandom() * pool.length)];

      }

    }



    // 2. CPU大名への仕官（遠国も可。跡継ぎ不在の家には遠い浪人も仕官しやすい）

    const aiClans = aliveClans.filter(c => c !== this.playerClanId);

    if (aiClans.length > 0) {

      const clanOfficerCounts = {};

      const lacksHeirByClan = {};

      aiClans.forEach(c => {

        clanOfficerCounts[c] = (this.activeOfficers || []).filter(o => o.clanId === c && !o.isDead).length;

        lacksHeirByClan[c] = this.householdLacksHeir(c);

      });



      ronins.forEach(ronin => {

        if (applicantForPlayer && ronin.id === applicantForPlayer.id) return;



        const distMap = this.getProvinceDistanceMap(ronin.defaultProv);

        const candidates = aiClans

          .map(c => ({

            clan: c,

            dist: this.getRoninDistanceToClan(ronin, c, distMap),

            officers: clanOfficerCounts[c] || 0,

            lacksHeir: !!lacksHeirByClan[c]

          }))

          .filter(x => Number.isFinite(x.dist) && (x.lacksHeir || x.dist <= 1));

        if (candidates.length === 0) return;



        const weightOf = (c) => {

          let w = c.dist === 0 ? 6 : (c.dist === 1 ? 2 : 1);

          if (c.officers <= 2) w += 2;

          if (c.lacksHeir) w += 3;

          return w;

        };

        const total = candidates.reduce((s, c) => s + weightOf(c), 0);

        let roll = gameRandom() * total;

        let target = candidates[0];

        for (const c of candidates) {

          roll -= weightOf(c);

          if (roll <= 0) { target = c; break; }

        }



        // 流浪国は高く、隣国・遠国は低い。跡継ぎ不在なら全体が上がる

        let chance = target.dist === 0 ? 0.38 : (target.dist === 1 ? 0.14 : 0.08);

        if (target.lacksHeir) {

          chance = target.dist === 0 ? 0.64 : (target.dist === 1 ? 0.42 : 0.30);

        }

        if (gameRandom() < chance) {

          ronin.clanId = target.clan;

          ronin.assignedProvId = null;

          ronin.isDaimyo = false;

          const where = target.dist === 0 ? '流浪の国' : (target.dist === 1 ? '隣国' : '遠国');

          const heirNote = target.lacksHeir ? '（跡継ぎ不在を聞きつけて）' : '';

          this.log(`📜【仕官報】${where}に身を寄せていた${ronin.name}が、${heirNote}${this.getClanFamilyName(target.clan)}に仕官いたしました。`);

          this.appointHistoricalHomeGovernors(target.clan);

        }

      });

    }



    // 3. プレイヤーへの仕官願い出イベント（モーダル対面表示）

    if (applicantForPlayer) {

      const ronin = applicantForPlayer;

      const defProvName = ronin.defaultProv ? this.getProvinceJapaneseName(ronin.defaultProv) : '諸国';

      const reach = this.getRoninServiceReach(ronin, this.playerClanId);

      const isDefProvMine = reach.dist === 0;

      const isNeighbor = reach.dist === 1;

      const age = this.year - (ronin.birthYear || 1530);

      const arriveBadge = isDefProvMine

        ? { bg: 'rgba(46,204,113,0.3)', border: '#27ae60', color: '#2ecc71', text: `🏯 流浪国（自領） (${defProvName})` }

        : isNeighbor

          ? { bg: 'rgba(230,126,34,0.3)', border: '#e67e22', color: '#f5b041', text: `隣国より参上 (${defProvName})` }

          : { bg: 'rgba(52,152,219,0.28)', border: '#2980b9', color: '#85c1e9', text: `遠国より参上 (${defProvName})` };

      const arriveLine = reach.lacksHeir

        ? '「貴家に継ぐべき者がおらぬと聞き、はるばる馳せ参じました。我が槍を貴家に捧げたく存じます。」'

        : '「殿の仁政と天下泰平の志を慕い、馳せ参じましてございます！我が槍を貴家に捧げたく存じます。」';



      if (this.isAutoPlay) {

        this.acceptRoninApplicant(ronin);

        this.log(`⏩【オート承諾】${ronin.name}の仕官の申し出を自動で受け入れました。`);

      } else {

      // 願い出は待ち行列で1件ずつ出し、返答を待つ（イベント等のポップアップと重ねない）

      this.enqueueRoninRequest(async () => {

        if (!window.Swal) {

          this.acceptRoninApplicant(ronin);

          return;

        }



        try { this.audio.playTaiko?.(); } catch(e) {}



        const res = await Swal.fire({

          title: `❖ 浪人仕官の願い出 ❖`,

          html: `

            <div style="text-align:left; font-size:12pt; color:#f5eedc; font-family:'Noto Serif JP',serif; line-height:1.6;">

              <div style="border-bottom:1px solid #5a4638; padding-bottom:8px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">

                <div>

                  <span style="font-size:16pt; font-weight:bold; color:var(--gold-bright);">${ronin.name}</span>

                  <span style="font-size:11.5pt; color:#ccc; margin-left:6px;">(${age}歳)</span>

                </div>

                <div>

                  <span style="background:${arriveBadge.bg}; border:1px solid ${arriveBadge.border}; color:${arriveBadge.color}; padding:2px 8px; border-radius:3px; font-size:11pt;">

                    ${arriveBadge.text}

                  </span>

                </div>

              </div>

              <p style="font-size:12pt; color:#ffd700; margin-bottom:10px;">

                ${arriveLine}

              </p>

              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; text-align:center; margin-bottom:12px;">

                <div style="background:rgba(231,76,60,0.2); border:1px solid #c0392b; padding:4px; border-radius:4px;">

                  <div style="font-size:10pt; color:#ff7675;">⚔️ 武勇</div>

                  <div style="font-size:14pt; font-weight:bold; color:#ff7675;">${ronin.military}</div>

                </div>

                <div style="background:rgba(52,152,219,0.2); border:1px solid #2980b9; padding:4px; border-radius:4px;">

                  <div style="font-size:10pt; color:#74b9ff;">🌾 内政</div>

                  <div style="font-size:14pt; font-weight:bold; color:#74b9ff;">${ronin.politic}</div>

                </div>

                <div style="background:rgba(46,204,113,0.2); border:1px solid #27ae60; padding:4px; border-radius:4px;">

                  <div style="font-size:10pt; color:#55efc4;">📜 知略</div>

                  <div style="font-size:14pt; font-weight:bold; color:#55efc4;">${ronin.intel}</div>

                </div>

              </div>

              <div style="background:rgba(0,0,0,0.4); padding:8px 10px; border-radius:4px; margin-bottom:12px; font-size:11.5pt; color:#ddd; line-height:1.5;">

                <strong>【列伝】</strong> ${this.cleanOfficerLore(ronin.lore) || '天下に名を響かせる士。'}

              </div>

              <div style="text-align:center; color:#ccc; font-size:11.5pt;">

                この武将を召し抱えますか？（召し抱えると直ちに配下武将となります）

              </div>

            </div>

          `,

          showCancelButton: true,

          confirmButtonText: '🤝 召し抱える (登用)',

          confirmButtonColor: '#27ae60',

          cancelButtonText: '🕊️ 辞退する (見送る)',

          cancelButtonColor: '#7f8c8d',

          background: '#1c130d',

          color: '#f5eedc',

          allowOutsideClick: false

        });



        if (res.isConfirmed) {

          this.acceptRoninApplicant(ronin);

        } else {

          this.log(`🕊️【仕官見送り】${ronin.name}の仕官願いを見送りました（浪人を継続します）。`);

        }

      });

      }

    }



    this.updateActiveOfficers();

  },



  // ---- 浪人の仕官の願い出：待ち行列（2026-10-11 at） ----

  enqueueRoninRequest(showFn) {

    this.pendingRoninRequests = this.pendingRoninRequests || [];

    this.pendingRoninRequests.push(showFn);

    if (!this._roninRequestRunning && !this._roninRequestTimer) {

      // 季節の表示が落ち着いてから（従来どおり 0.8 秒後）出す

      this._roninRequestTimer = setTimeout(() => {

        this._roninRequestTimer = null;

        void this.processRoninRequestQueue();

      }, 800);

    }

  },



  hasPendingRoninRequests() {

    return !!(this._roninRequestRunning || this._roninRequestTimer

      || (this.pendingRoninRequests && this.pendingRoninRequests.length));

  },



  // 他のポップアップ（合戦・イベント画面・Swal の通知や確認）が開いているか

  isBlockingPopupOpen() {

    if (this.inBattle) return true;

    if (this.isEventChoiceOpen && this.isEventChoiceOpen()) return true;

    return !!(window.Swal && typeof Swal.isVisible === 'function' && Swal.isVisible());

  },



  async processRoninRequestQueue() {

    if (this._roninRequestRunning) return;

    this._roninRequestRunning = true;

    try {

      while (this.pendingRoninRequests && this.pendingRoninRequests.length) {

        // 他のポップアップが閉じるまで待つ（上書きして閉じてしまわない）。最長約5分で諦めて出す

        for (let i = 0; i < 1200 && this.isBlockingPopupOpen(); i++) {

          await new Promise(r => setTimeout(r, 250));

        }

        const show = this.pendingRoninRequests.shift();

        try { await show(); } catch (e) { console.error('ronin request failed', e); }

      }

    } finally {

      this._roninRequestRunning = false;

    }

  },



  acceptRoninApplicant(ronin) {

    if (!ronin || ronin.clanId === this.playerClanId) return;

    ronin.clanId = this.playerClanId;

    ronin.assignedProvId = null;

    ronin.isDaimyo = false;

    this.log(`🤝【名将仕官】浪人の${ronin.name}公が、仕官を願い出て我が軍の配下に加わりました！`, 'important');

    try { this.audio.playGrandFanfare?.(); } catch(e) {}

    this.appointHistoricalHomeGovernors(this.playerClanId);

    this.updateActiveOfficers();

    this.updateUI(); // 選択中の国パネルも updateUI 内で再描画

  },



  endBattle() {

    this.inBattle = false;

    this.currentBattle = null;

    this.currentSiege = null;

    document.getElementById('battleModal')?.classList.add('hidden');

    document.getElementById('siegeModal')?.classList.add('hidden');



    // ボタンの無効化をリセット

    ['bCmdAssault', 'bCmdShoot', 'bCmdDefend', 'bCmdTactic', 'bCmdRetreat'].forEach(id => {

      document.getElementById(id)?.removeAttribute('disabled');

    });

    ['sCmdAssault', 'sCmdShoot', 'sCmdSurround', 'sCmdPersuade', 'sCmdRetreat', 'siegeBtnAssault', 'siegeBtnShoot', 'siegeBtnSurround', 'siegeBtnPersuade', 'siegeBtnRetreat'].forEach(id => {

      document.getElementById(id)?.removeAttribute('disabled');

    });



    try { this.music.playTrack(this.getSeasonTrackKey()); } catch(e) {}

    this.updateUI();

  },
};
