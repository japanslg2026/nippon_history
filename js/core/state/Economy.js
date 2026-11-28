/**
 * @file js/core/state/Economy.js - GameState から機能別に分割したメソッド群（18個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { INITIAL_PROVINCES, gameRandom } from '../GameStateShared.js?v=20261128_v74';

export const EconomyMethods = {



  // ============================================================================

  // 軍令結果通知 (心得たボタン不要・結果が1秒で流れて自動消去)

  // ============================================================================,



  // 大名家滅亡アラート（調略アラートと同じトースト様式。スマホは「○○家滅亡」のみ）

  showClanDestroyedAlert(clanId) {

    try {

      if (!clanId || clanId === 'ronin' || this._isSwitchingScenario) return;

      let fam = String(this.getClanFamilyName(clanId) || '').trim();

      if (!fam || fam === '空白地') return;

      if (!/[家氏衆軍]$/.test(fam)) fam += '家';

      const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

      const title = isMobile ? `${fam}滅亡` : `${window.armorIconHTML ? window.armorIconHTML() + ' ' : '【滅】'}${fam}滅亡`;

      const msg = `${fam}はすべての領国を失い、滅亡いたしました`;

      // 同じ瞬間の他トーストに上書きされないよう、わずかに遅らせて長めに表示

      setTimeout(() => this.showOrderResult(title, msg, '#e74c3c', 2400), 60);

    } catch (e) { /* 通知失敗でゲームを止めない */ }

  },



  showOrderResult(title, message, accentColor = '#ffd700', durationMs = 1000) {

    let toast = document.getElementById('orderResultToast');

    if (!toast) {

      toast = document.createElement('div');

      toast.id = 'orderResultToast';

      toast.className = 'order-result-toast';

      document.body.appendChild(toast);

    }



    if (this._toastTimer) {

      clearTimeout(this._toastTimer);

      this._toastTimer = null;

    }



    const isRepelled = /撃退/.test(title);

    if (isRepelled) {

      toast.classList.add('toast-repelled');

    } else {

      toast.classList.remove('toast-repelled');

    }



    toast.innerHTML = `

      <strong class="order-result-title" style="color:${accentColor}; font-size:12pt; white-space:nowrap;">${title}</strong>

      <span class="order-result-msg" style="color:#eee; font-size: 12pt; border-left:1px solid #665544; padding-left:10px;">${message}</span>

    `;

    toast.style.borderColor = accentColor;



    toast.classList.remove('hide');

    toast.classList.add('show');



    // ちょうど1秒(1000ms)で流れて自動終了

    this._toastTimer = setTimeout(() => {

      toast.classList.remove('show');

      toast.classList.add('hide');

    }, durationMs);

  },



  // ============================================================================

  // 厳選4大コマンド処理 (出陣、内政、軍備、調略)

  // ============================================================================,



  // ---- 兵力の初期配置と上限 ----
  // 初期兵力 = 石高×2.5% を千人未満切り捨て + 1000
  getProvinceInitialTroops(kokudaka) {
    const k = Number(kokudaka) || 0;
    return Math.floor(k * 0.025 / 1000) * 1000 + 1000;
  },

  // 兵力の上限 = 初期兵力 + 石高×10%（増加分の上限）。シナリオ指定の初期兵力がそれより大きければそれを基準にする
  getProvinceTroopCap(p) {
    if (!p) return 0;
    const list = (window.PROVINCES_DATA && window.PROVINCES_DATA.length) ? window.PROVINCES_DATA
      : (typeof INITIAL_PROVINCES !== 'undefined' ? INITIAL_PROVINCES : []);
    const init = (list || []).find(x => x.id === p.id);
    const koku = Number(init?.kokudaka) || Number(p.kokudaka) || 0;
    const base = this.getProvinceInitialTroops(koku);
    return base + Math.floor(koku * 0.1);
  },

  // ---- 石高（p.rice）の上限（2026-10-11 bh）----

  // 土地の基準石高（provinces.json の kokudaka ÷1000、最低20）× 2。開始時に兵糧を積んだ国はその値まで

  getProvinceRiceCap(p) {

    if (!p) return 0;

    const list = (window.PROVINCES_DATA && window.PROVINCES_DATA.length) ? window.PROVINCES_DATA

      : (typeof INITIAL_PROVINCES !== 'undefined' ? INITIAL_PROVINCES : []);

    const init = (list || []).find(x => x.id === p.id);

    const base = Math.max(20, Math.round((Number(init?.kokudaka) || Number(p.kokudaka) || 50000) / 1000));

    const mult = Number(window.PROVINCE_RICE_CAP_MULT) || 2;

    let cap = Math.round(base * mult);

    return cap;

  },



  clampProvinceRice(p) {

    if (!p) return false;

    const cap = this.getProvinceRiceCap(p);

    if ((Number(p.rice) || 0) > cap) { p.rice = cap; return true; }

    return false;

  },



  clampAllProvinceRice() {

    let n = 0;

    (this.provinces || []).forEach(p => { if (this.clampProvinceRice(p)) n++; });

    this.clampAllProvinceCommerce?.(); // 商業も一緒に（2026-10-11 bl）

    return n;

  },



  // ---- 商業（p.commerce）の上限（2026-10-11 bl）----

  // 土地の基準商業（石高 kokudaka ÷2000、最低10。開始時の商業と同じ式）× 2

  getProvinceCommerceCap(p) {

    if (!p) return 0;

    const list = (window.PROVINCES_DATA && window.PROVINCES_DATA.length) ? window.PROVINCES_DATA

      : (typeof INITIAL_PROVINCES !== 'undefined' ? INITIAL_PROVINCES : []);

    const init = (list || []).find(x => x.id === p.id);

    const base = this.getProvinceBaseCommerce(init || p); // 国ごとの商業係数を反映（2026-10-11 cd）

    const mult = Number(window.PROVINCE_COMMERCE_CAP_MULT) || 2;

    return Math.round(base * mult);

  },



  /** 商業の係数（港・都・街道の要地は高く、辺地は低く）。全国の石高加重平均が 1 になるよう正規化（2026-10-11 cd） */

  commerceHubFactor(provId) {

    const table = window.PROVINCE_COMMERCE_FACTOR || {

      izumi: 2.4, yamashiro: 2.0, settsu: 1.8, settsu_shimakami: 1.8, chikuzen_fukuoka: 1.8, chikuzen_hakata: 1.8, chikuzen_munakata: 1.8, chikuzen_kamashi: 1.8, hizen: 1.5, nagato: 1.5, owari: 1.2, owari_south: 1.5, kawachi_south: 1.0, shinano_sarashina_hanishina: 0.8, kai_tsuru: 0.7, mino_gujo: 0.7, echigo_kanbara: 0.9, echigo_uonuma: 0.8, kazusa_togane_naruto: 0.9, ise: 1.5, tsushima: 1.5,

      omi_south: 1.4, echizen: 1.4, echizen_tsuruga: 1.3, bingo: 1.4, omi_north: 1.3, wakasa: 1.3, satsuma: 1.3, suruga: 1.3, mino: 1.2, etchu_west: 1.2, etchu_east: 1.2,

      suo: 1.2, bizen: 1.2, bungo_funai: 1.1, sagami: 1.1, kii_saika_wakayama: 1.1, kii_kichu: 1.1, kii_kumano: 1.1, kii: 1.1, awaji: 1.1, sanuki: 1.1, sanuki_west: 1.0, kawachi: 1.1,

      ezo: 0.5, mutsu_tsugaru: 0.6, mutsu_namioka: 0.6, mutsu_nanbu: 0.6, hida: 0.6, oki: 0.6, rikuchu: 0.7, tosa_kochi: 0.7, tosa_aki: 0.7, tosa_gun: 0.7, tosa_nakamura: 0.7, tosa: 0.7, hyuga_nobeoka: 0.7, hyuga: 0.7, osumi: 0.7,

      ugo: 0.8, uzen: 0.8, iwaki: 0.8, iwashiro: 0.8, sado: 0.8, iga: 0.8, mimasaka_west: 0.8, mimasaka_east: 0.8, awa: 0.8, kai: 0.8,

      shinano_kawanakajima: 0.8, shinano_ueda: 0.8, shinano_chikuma_kiso: 0.8, shinano_chikuma_azumi: 0.8, shinano_kiso: 0.8, shinano_takato: 0.8, shinano_iida: 0.8, shinano_takato_iida: 0.8, tango: 0.9, tajima: 0.9, kazusa: 0.9, shimousa: 0.9, hitachi: 0.9, kozuke_takasaki: 0.9, kozuke_agatsuma: 0.9, kozuke_numata: 0.9, kozuke_maebashi: 0.9, kozuke_nitta_kanayama: 0.9,

      shimotsuke: 0.9, shimotsuke_kanitsuga: 0.9, sano_oyama: 0.9, noto: 0.9, hoki_west: 0.9, hoki_east: 0.9, inaba: 0.9, iwami: 0.9, higo_kumamoto: 0.9, higo_hitoyoshi: 0.9, shima: 0.9

    };

    if (!this._commerceNorm || this._commerceNorm.table !== table) {

      const list = (window.PROVINCES_DATA && window.PROVINCES_DATA.length) ? window.PROVINCES_DATA : (typeof INITIAL_PROVINCES !== 'undefined' ? INITIAL_PROVINCES : []);

      let w = 0, wf = 0;

      (list || []).forEach(x => { const k = Number(x.kokudaka) || 0; w += k; wf += k * (Number(table[x.id]) || 1); });

      this._commerceNorm = { table, norm: wf > 0 ? w / wf : 1 };

    }

    return (Number(table[provId]) || 1) * this._commerceNorm.norm;

  },



  /** 兵1人あたりの毎季の維持費（金）。window.TROOP_UPKEEP_GOLD で上書き可（2026-10-11 ci） */

  troopUpkeepRate() {

    const w = Number(window.TROOP_UPKEEP_GOLD);

    if (Number.isFinite(w) && window.TROOP_UPKEEP_GOLD != null) return Math.max(0, w);

    const B = this.aiBalance ? this.aiBalance() : {};

    return Math.max(0, Number(B.troopUpkeepGoldPerTroop ?? 0.01) || 0);

  },



  /** 国の金収入（春・秋）= 0.8 ×（商業 + 係数 × 基準超過分）。開発した分だけ上乗せ（2026-10-11 ce） */

  provinceCommerceIncome(p) {

    const c = Math.max(0, Number(p?.commerce) || 0);

    const bonus = Number.isFinite(Number(window.COMMERCE_DEV_INCOME_BONUS)) ? Number(window.COMMERCE_DEV_INCOME_BONUS) : 1.0;

    const over = Math.max(0, c - this.getProvinceBaseCommerce(p));

    return Math.round(0.8 * (c + bonus * over));

  },



  /** 国の基準商業 = max(10, 石高÷2000 × 商業係数)（2026-10-11 cd） */

  getProvinceBaseCommerce(p) {

    if (!p) return 10;

    const list = (window.PROVINCES_DATA && window.PROVINCES_DATA.length) ? window.PROVINCES_DATA : (typeof INITIAL_PROVINCES !== 'undefined' ? INITIAL_PROVINCES : []);

    const init = (list || []).find(x => x.id === p.id);

    const koku = Number(init?.kokudaka) || Number(p.kokudaka) || 50000;

    return Math.max(10, Math.round(koku / 2000 * this.commerceHubFactor(p.id)));

  },



  clampProvinceCommerce(p) {

    if (!p) return false;

    const cap = this.getProvinceCommerceCap(p);

    if ((Number(p.commerce) || 0) > cap) { p.commerce = cap; return true; }

    return false;

  },



  clampAllProvinceCommerce() {

    let n = 0;

    (this.provinces || []).forEach(p => { if (this.clampProvinceCommerce(p)) n++; });

    return n;

  },



  executeDomestic() {

    let p = this.provinces.find(x => x.id === this.selectedProvId);

    if (!p || p.ownerId !== this.playerClanId) {

      const myProvs = this.provinces.filter(x => x.ownerId === this.playerClanId);

      if (myProvs.length === 0) {

        this.showOrderResult('⚠ 御家滅亡', '貴家の支配領国が存在しません', '#e74c3c');

        return;

      }

      p = myProvs[0];

      this.selectProvince(p.id);

    }

    if (this.ap <= 0) {

      this.showOrderResult('⚠ 行動力不足', '今季の行動力(AP)を使い果たしました。「次季へ進む」を押してください。', '#e67e22');

      return;

    }

    if (this.gold < 40) {

      this.showOrderResult('⚠ 資金不足', `内政振興には金40貫が必要です (現在:${this.gold}貫)`, '#e74c3c');

      return;

    }



    const effStats = this.getEffectiveStats(p.id);

    // 城主武将の政治力（城主不在の直轄地は大名能力半減ペナルティ発動）による明確な成果差

    const polRatio = (effStats.politics || 50) / 100;

    const riceGain = Math.round(15 + polRatio * 25);       // 22〜40石

    const commerceGain = Math.round(15 + polRatio * 25);   // 22〜40貫

    const orderGain = Math.round(3 + polRatio * 6);         // 4〜9%



    // 【フェーズ2: 内政コマンドによる無限インフレの抑制】

    // 初期マスターデータ (INITIAL_PROVINCES) の石高を基準とした上限キャップ（初期値の3倍）

    const initMaster = (INITIAL_PROVINCES || window.PROVINCES_DATA || []).find(x => x.id === p.id);

    const baseKokudaka = Number(initMaster?.kokudaka) || 50000;

    const baseRice = Math.max(20, Math.round(baseKokudaka / 1000));

    const baseCommerce = this.getProvinceBaseCommerce(p); // 国ごとの商業係数（2026-10-11 cd）

    const maxRice = Math.max(Math.min(baseRice * 3, this.getProvinceRiceCap(p)), 0); // 石高は土地の上限まで（2026-10-11 bh）

    const maxCommerce = Math.max(Math.min(baseCommerce * 3, this.getProvinceCommerceCap(p)), 0); // 商業も土地の上限まで（2026-10-11 bl）

    if ((Number(p.rice) || 0) >= maxRice && (Number(p.commerce) || 0) >= maxCommerce) {

      this.showOrderResult('⚠ 開発の上限', `${p.name}は石高（上限${(maxRice / 10).toFixed(1)}万石）・商業（上限${maxCommerce}貫）とも上限まで開発しきっています。これ以上の内政振興はできません。`, '#e67e22');

      return;

    }



    this.gold -= 40;

    this.ap -= 1;

    const riceBefore = Number(p.rice) || 0;

    p.rice = Math.min(maxRice, riceBefore + riceGain);

    const riceCapNote = p.rice - riceBefore < riceGain ? `（石高は上限${(maxRice / 10).toFixed(1)}万石${p.rice - riceBefore > 0 ? `、+${((p.rice - riceBefore) / 10).toFixed(1)}万石のみ` : 'のため伸びず'}）` : '';

    const commerceBefore = Number(p.commerce) || 0;

    p.commerce = Math.min(maxCommerce, commerceBefore + commerceGain);

    const commerceAdded = Math.max(0, p.commerce - commerceBefore);

    const commerceCapNote = commerceAdded < commerceGain ? `（商業は上限${maxCommerce}貫${commerceAdded > 0 ? `、+${commerceAdded}のみ` : 'のため伸びず'}）` : '';

    p.order = Math.min(100, (p.order || 80) + orderGain);



    try {

      if (this.audio.playDomesticSound) {

        this.audio.playDomesticSound();

      } else {

        this.audio.playCoin?.();

      }

    } catch(e) {}

    const govTag = effStats.isDirectRule ? '【⚠️直轄領・大名能力半減】' : `【城主: ${effStats.name}】`;

    const polDesc = effStats.politics >= 85 ? '【名君の仁政】' : effStats.politics <= 50 ? '【拙劣な民政】' : '【内政振興】';

    this.log(`${govTag}${polDesc}${p.name}にて新田開墾・商業振興を推進！(実効内政:${effStats.politics}) 石高+${((p.rice - riceBefore) / 10).toFixed(1)}万石, 商業+${commerceAdded}, 治安+${orderGain}%。`);

    this.showOrderResult('🌾 内政振興 完了', `${p.name} 石高+${((p.rice - riceBefore) / 10).toFixed(1)}万石 (${(p.rice / 10).toFixed(1)}/${(maxRice / 10).toFixed(1)}万石)${riceCapNote} ｜ 商業+${commerceAdded} (${p.commerce}/${maxCommerce}貫)${commerceCapNote} ｜ 治安+${orderGain}%`, '#2ecc71');

    this.updateUI({ provId: p.id });

  },



  executeMilitary() {

    let p = this.provinces.find(x => x.id === this.selectedProvId);

    if (!p || p.ownerId !== this.playerClanId) {

      const myProvs = this.provinces.filter(x => x.ownerId === this.playerClanId);

      if (myProvs.length === 0) {

        this.showOrderResult('⚠ 御家滅亡', '貴家の支配領国が存在しません', '#e74c3c');

        return;

      }

      p = myProvs[0];

      this.selectProvince(p.id);

    }

    if (this.ap <= 0) {

      this.showOrderResult('⚠ 行動力不足', '今季の行動力(AP)を使い果たしました。「次季へ進む」を押してください。', '#e67e22');

      return;

    }

    const milGoldCost = this.getMilitaryGoldCost(p);

    if (this.gold < milGoldCost) {

      this.showOrderResult('⚠ 資金不足', `軍備増強には金${milGoldCost}貫が必要です (現在:${this.gold}貫)`, '#e74c3c');

      return;

    }



    const effStats = this.getEffectiveStats(p.id);

    // 兵力上限（初期兵力 + 石高×10%）でインフレを防止

    const maxTroops = this.getProvinceTroopCap(p);

    const milRatio = (effStats.military || 50) / 100;



    let troopsGain = 0;

    let note = '';

    if (p.troops >= maxTroops) {

      troopsGain = 0;

      note = ' (石高扶養上限に達しており兵力増員なし、城防と士気を集中的に強化)';

    } else {

      // 城主武将の軍事力（城主不在の直轄地は大名能力半減ペナルティ発動）と石高に応じた徴兵数

      const potential = Math.round(150 + milRatio * 180 + (p.rice * 0.08));

      troopsGain = Math.min(potential, maxTroops - p.troops);

    }



    const defenseGain = Math.round(5 + milRatio * 6); // 6〜11

    const moraleGain = Math.round(6 + milRatio * 7);  // 8〜13



    this.gold -= milGoldCost;

    this.ap -= 1;

    p.troops += troopsGain;

    p.defense = Math.min(this.getProvinceMaxDefense(p), p.defense + defenseGain);

    p.morale = Math.min(100, p.morale + moraleGain);

    // 徴兵による治安度への微小な影響

    if (troopsGain > 0) {

      const orderPenalty = Math.max(1, Math.round(3 - milRatio * 2));

      p.order = Math.max(30, (p.order || 80) - orderPenalty);

    }



    try {

      if (this.audio.playMilitarySound) {

        this.audio.playMilitarySound();

      } else {

        this.audio.playTaiko?.();

      }

    } catch(e) {}

    const govTag = effStats.isDirectRule ? '【⚠️直轄領・大名能力半減】' : `【城主: ${effStats.name}】`;

    const milDesc = effStats.military >= 88 ? '【名将の練兵】' : '【軍備増強】';

    const ironNote = milGoldCost < 50 ? `（鉄産地シナジー:金${milGoldCost}貫）` : '';

    this.log(`${govTag}${milDesc}${p.name}にて徴兵と城郭修築！(実効軍事:${effStats.military}) 兵力+${troopsGain.toLocaleString()}, 城防+${defenseGain}, 士気+${moraleGain}。${note}${ironNote}`);

    this.showOrderResult('⚔️ 軍備増強 完了', `${p.name} 兵力+${troopsGain} (${p.troops.toLocaleString()}/${maxTroops.toLocaleString()}) ｜ 城防+${defenseGain} ｜ 士気+${moraleGain}`, '#e74c3c');

    this.updateUI({ provId: p.id });

  },



  executeStratagem() {

    let p = this.provinces.find(x => x.id === this.selectedProvId);

    let target = null;



    if (p && p.ownerId !== this.playerClanId) {

      // 敵国を選択中に調略を押した場合：その敵国に工作を仕掛ける

      target = p;

      const friendlyNeighbor = (p.neighbors || []).map(nId => this.provinces.find(x => x.id === nId)).find(x => x && x.ownerId === this.playerClanId);

      if (!friendlyNeighbor) {

        this.showOrderResult('⚠ 調略不可', `${target.name}は貴家の領国と隣接していないため、忍びを潜入させられません。`, '#e74c3c');

        return;

      }

      p = friendlyNeighbor;

    } else {

      if (!p || p.ownerId !== this.playerClanId) {

        const myProvs = this.provinces.filter(x => x.ownerId === this.playerClanId);

        if (myProvs.length > 0) {

          p = myProvs[0];

          this.selectProvince(p.id);

        }

      }

      if (!p) {

        this.showOrderResult('⚠ 調略不可', '工作を発令する自領国を選択してください。', '#e74c3c');

        return;

      }

      const enemyNeighbors = (p.neighbors || []).map(nId => this.provinces.find(x => x.id === nId)).filter(x => x && x.ownerId !== this.playerClanId);

      if (enemyNeighbors.length === 0) {

        this.showOrderResult('⚠ 調略不可', `${p.name}の隣接領国に敵対勢力がいません。前線領国を選択してください。`, '#e74c3c');

        return;

      }

      target = enemyNeighbors.sort((a, b) => b.troops - a.troops)[0];

    }



    if (this.ap <= 0) {

      this.showOrderResult('⚠ 行動力不足', '今季の行動力(AP)を使い果たしました。「次季へ進む」を押してください。', '#e67e22');

      return;

    }

    if (this.gold < 40) {

      this.showOrderResult('⚠ 資金不足', `敵国調略には金40貫が必要です (現在:${this.gold}貫)`, '#e74c3c');

      return;

    }



    const srcEff = this.getEffectiveStats(p.id);

    const targetEff = this.getEffectiveStats(target.id);



    // 調略成功判定：城主（または直轄地）の知謀差による判定

    const diff = (srcEff.stratagem || 50) - (targetEff.stratagem || 50);

    const successRate = Math.max(0.35, Math.min(0.95, 0.70 + diff * 0.005));

    const isSuccess = gameRandom() < successRate;



    this.gold -= 40;

    this.ap -= 1;



    if (isSuccess) {

      const stratRatio = (srcEff.stratagem || 50) / 100;

      const moraleReduction = Math.round(14 + stratRatio * 20); // 20〜34

      const defenseReduction = Math.round(8 + stratRatio * 15);  // 12〜23



      target.morale = Math.max(15, target.morale - moraleReduction);

      target.defense = Math.max(10, target.defense - defenseReduction);



      let extraMsg = '';

      // 知謀85以上の知将は兵員離反・内応を誘発！

      if (srcEff.stratagem >= 85 && gameRandom() < 0.65) {

        const betrayTroops = Math.min(Math.round(target.troops * 0.10), 500);

        target.troops -= betrayTroops;

        extraMsg = ` さらに敵将の内応を誘発し兵員${betrayTroops.toLocaleString()}人が離反脱走！`;

      }



      try { this.audio.playSlash?.(); } catch(e) {}

      const govTag = srcEff.isDirectRule ? '【⚠️直轄・能力半減発令】' : `【城主: ${srcEff.name}発令】`;

      this.log(`${govTag}【敵国調略・成功】${target.name}へ忍者衆を放ち放火・流言工作！(発令知謀:${srcEff.stratagem} vs 防備知謀:${targetEff.stratagem}) 敵士気-${moraleReduction}, 城防-${defenseReduction}。${extraMsg}`, 'important');

      this.showOrderResult('🗡️ 敵国調略 成功！', `${target.name} 敵士気-${moraleReduction} ｜ 城防-${defenseReduction}${extraMsg}`, '#9b59b6');

    } else {

      // 失敗は通知（トースト・効果音）を出さず、年代記にだけ静かに記録する（2026-10-11 bb）

      this.log(`【敵国調略・失敗】${target.name}への忍びの侵入は敵警戒網に阻まれました。(敵防備知謀:${targetEff.stratagem})`, 'quiet');

    }



    this.updateUI({ provId: p.id });

  },



  // 兵力移動モーダル,



  confirmTransfer() {

    const p = this.provinces.find(x => x.id === this.selectedProvId);

    const dstSelect = document.getElementById('transferDstSelect');

    const range = document.getElementById('transferTroopRange');

    const target = this.provinces.find(x => x.id === dstSelect?.value);

    const amount = parseInt(range?.value, 10) || 0;



    if (!p || p.ownerId !== this.playerClanId) {

      this.showOrderResult('⚠ 移動不能', '自国の領国を選択してください。', '#e74c3c');

      return;

    }

    if (!target || target.ownerId !== this.playerClanId) {

      this.showOrderResult('⚠ 移動不能', '隣接する味方領国を移動先に指定してください。', '#e74c3c');

      return;

    }

    if (amount <= 0) {

      this.showOrderResult('⚠ 移動不能', '移動する兵力（100人以上）を指定してください。', '#e74c3c');

      return;

    }

    if (p.troops - amount < 500) {

      this.showOrderResult('⚠ 兵力不足', '城の最低防衛兵力(500人)を残す必要があります。', '#e74c3c');

      return;

    }



    p.troops -= amount;

    target.troops += amount;



    document.getElementById('transferModal')?.classList.add('hidden');

    this.audio.playTaiko();

    this.log(`【前線兵力移動】${p.name}から${target.name}へ兵力 ${amount.toLocaleString()} 人を配置転換しました。`);

    this.showOrderResult('🚚 兵力移動 完了', `${p.name} から ${target.name} へ兵力 ${amount.toLocaleString()}人 移動`, '#3498db');

    this.updateUI({ provId: p.id });

  },
};
