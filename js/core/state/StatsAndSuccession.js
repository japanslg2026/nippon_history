/**
 * @file js/core/state/StatsAndSuccession.js - GameState から機能別に分割したメソッド群（52個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { SCENARIOS, SEASON, buildFactionHeadsText, getClanAbility, safeStorageSet } from '../GameStateShared.js?v=20261128_v74';

export const StatsAndSuccessionMethods = {



  // 城主不在のとき、国司在京・天領代官・無名の城代を分ける,



  getVacantRule(p, ownerId) {

    const scen = this.currentScenario;

    if (scen && Array.isArray(scen.kokufuClans) && scen.kokufuClans.includes(ownerId)) {

      return {

        label: '国司',

        skill: '在京国司',

        badge: '国司在京',

        noPercentage: true,

        lore: '国司は京に駐まっており、現地に武士の城代は置いていない。国衙の在庁が政務を預かる。'

      };

    }

    if (scen && Array.isArray(scen.daikanProvinces) && scen.daikanProvinces.includes(p.id)) {

      return {

        label: '代官',

        skill: '天領代官',

        badge: '代官支配',

        lore: '幕府の天領、または幼主・預かりの国。城主は置かず代官が治める。'

      };

    }

    return null;

  },



  // 項目27（2026-10-11 az）攻城戦の落城率：「互角・平常の条件で約70%」を基準に要因で加減し、10〜95%に収める。

  // 守り手の城主は項目26の実効能力（配下補佐込み）。AI同士・AI対プレイヤー・プレイヤー委任軍・プレイヤー攻城で共通。

  //  opts: attackerClanId, srcProv, dstProv, attackTroops（攻め手兵）, defenders（守り手の「国の兵」換算。攻城中は籠城兵×2.5）,

  //        castleWall（城防。省略時 dstProv.defense）, defMorale（守り手士気。省略時 dstProv.morale）, atkMorale（攻め手士気。省略可）,

  //        formation（{dealt,taken,atkTerrain,defTerrain} AI即決用。省略可）, prep（攻城準備の加点。省略可）

  //  戻り値: { p, pct, base:70, factors:[{key,label,delta}] }（delta はパーセントポイント）

  computeSiegeOdds(opts = {}) {

    const W = SengokuGame.SIEGE_ODDS_WEIGHTS || (SengokuGame.SIEGE_ODDS_WEIGHTS = {

      base: 70, min: 10, max: 95,

      ratioUp: 20, ratioUpCap: 22, ratioDown: 30, ratioDownCap: -45,  // 兵力比 r：r≥1 は +20×log2(r)（上限+22）、r<1 は +30×log2(r)（下限-45）

      wallPer: 0.30, wallRef: 50,           // 城防：基準50から1につき -0.3

      lordPer: 0.35, lordRef: 70,           // 守将（城主実効 武0.6+知0.4）：基準70から1につき -0.35

      genPer: 0.35, genRef: 70,             // 攻め手の大将（出陣元城主実効 武0.7+知0.3）：基準70から1につき +0.35

      moralePer: 0.25, moraleRef: 80,       // 守り手士気：基準80から1につき -0.25

      atkMoralePer: 0.15, atkMoraleRef: 80, // 攻め手士気（プレイヤー攻城のみ）

      capital: -6, mountain: -3, plain: 2, winter: -8,

      riceMax: 12, riceNeedPerTroop: 0.05,  // 守り手の兵糧が「兵×0.05石」に満たないと最大+12

      allyEach: -3, allyCap: -6,            // 守り手の同盟国の隣接領（兵1000以上）1つにつき -3（最大-6）

      formationScale: 30, formationCap: 8   // AI即決時の陣形・地形（与ダメ比-1）×30、±8

    });

    const dst = opts.dstProv || null;

    const factors = [];

    const add = (key, label, delta) => { if (Number.isFinite(delta) && Math.abs(delta) >= 0.05) factors.push({ key, label, delta: Math.round(delta * 10) / 10 }); };

    const atk = Math.max(1, Number(opts.attackTroops) || 1);

    const def = Math.max(1, Number(opts.defenders ?? dst?.troops) || 1);

    const r = atk / def;

    const lr = Math.log2(r);

    add('ratio', `兵力比 ${r >= 10 ? r.toFixed(0) : r.toFixed(2)}:1`, lr >= 0 ? Math.min(W.ratioUpCap, W.ratioUp * lr) : Math.max(W.ratioDownCap, W.ratioDown * lr));

    const wall = Number(opts.castleWall ?? dst?.defense);

    if (Number.isFinite(wall)) add('wall', `城防 ${Math.round(wall)}`, -(wall - W.wallRef) * W.wallPer);

    const isBlank = !dst || !dst.ownerId || dst.ownerId === 'null';

    if (dst && !isBlank) {

      const eff = this.getEffectiveStats(dst.id);

      if (eff) {

        const ds = 0.6 * (Number(eff.military) || 50) + 0.4 * (Number(eff.stratagem) || 50);

        add('lord', `守将 ${eff.name || '城代'}（武${eff.military} 知${eff.stratagem}${eff.boosted ? '・配下補佐' : ''}）`, -(ds - W.lordRef) * W.lordPer);

      }

      if (this.isCapitalProvince(dst.id, dst.ownerId)) add('capital', '本拠の守り', W.capital);

    }

    if (opts.srcProv && opts.srcProv.ownerId) {

      const se = this.getEffectiveStats(opts.srcProv.id);

      if (se) {

        const as = 0.7 * (Number(se.military) || 50) + 0.3 * (Number(se.stratagem) || 50);

        add('general', `攻め手大将 ${se.name || '城代'}（武${se.military} 知${se.stratagem}）`, (as - W.genRef) * W.genPer);

      }

    }

    const mor = Number(opts.defMorale ?? dst?.morale);

    if (Number.isFinite(mor)) add('morale', `守兵士気 ${Math.round(mor)}`, -(mor - W.moraleRef) * W.moralePer);

    if (Number.isFinite(Number(opts.atkMorale))) add('atkMorale', `我が士気 ${Math.round(opts.atkMorale)}`, (Number(opts.atkMorale) - W.atkMoraleRef) * W.atkMoralePer);

    if (dst) {

      try { const tid = this.inferProvinceTerrain(dst).id; if (tid === 'mountain') add('terrain', '山城・険阻', W.mountain); else if (tid === 'plain') add('terrain', '平城', W.plain); } catch (e) {}

    }

    if (this.seasonIdx === SEASON.WINTER) add('winter', '冬の陣', W.winter);

    if (dst && !isBlank) {

      const stock = dst.ownerId === this.playerClanId ? Number(this.rice) : Number(this.aiEconomy?.[dst.ownerId]?.rice);

      const need = def * W.riceNeedPerTroop;

      if (Number.isFinite(stock) && need > 0 && stock < need) add('rice', `籠城兵糧不足（${Math.round(stock)}石）`, W.riceMax * (1 - Math.max(0, stock) / need));

      let allies = 0;

      (dst.neighbors || []).forEach(nId => {

        const n = (this.provinces || []).find(x => x.id === nId);

        if (n && n.ownerId && n.ownerId !== dst.ownerId && n.ownerId !== opts.attackerClanId && (Number(n.troops) || 0) >= 1000 && this.isAllied(dst.ownerId, n.ownerId)) allies++;

      });

      if (allies > 0) add('allies', `後詰め（同盟${allies}）`, Math.max(W.allyCap, W.allyEach * allies));

    }

    if (opts.formation) {

      const f = opts.formation;

      const ratio = ((Number(f.dealt) || 1) * (Number(f.atkTerrain) || 1)) / ((Number(f.taken) || 1) * (Number(f.defTerrain) || 1));

      add('formation', '陣形・地形', Math.max(-W.formationCap, Math.min(W.formationCap, (ratio - 1) * W.formationScale)));

    }

    if (Number(opts.prep)) add('prep', '攻城準備', Number(opts.prep));

    const raw = W.base + factors.reduce((s, f) => s + f.delta, 0);

    const pct = Math.max(W.min, Math.min(W.max, raw));

    factors.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    return { p: pct / 100, pct: Math.round(pct), raw: Math.round(raw * 10) / 10, base: W.base, factors };

  },



  // 内訳の短い文字列（大きい順に n 件）

  describeSiegeOdds(odds, n = 4) {

    if (!odds) return '';

    const fs = (odds.factors || []).slice(0, n).map(f => `${f.label} ${f.delta > 0 ? '+' : ''}${f.delta}`);

    return `基準${odds.base}%` + (fs.length ? '｜' + fs.join('／') : '');

  },



  // 項目26（2026-10-11 ay）配下補佐：同じ国に待機する同家の配下のほうが能力が高ければ、城主（本拠では当主）の実効能力はその値になる。

  // 能力ごと（武勇・内政・知略）に最大値を取る。武将の保存値は変えない。城代統治（城主不在）は対象外。

  // 戻り値は getBaseLordStats と同じ形に own（本人値）・aides（{military|politics|stratagem: {id,name,value}}）・boosted を加えたもの。

  getEffectiveStats(provId) {

    return this.getEffectiveLordStats(provId);

  },



  // 項目26（2026-11-07改定）配下補佐：
  // 城主の能力は、その国の武将の能力の最大値とその城主の能力の間の差の30%分が、その城主の能力に足されるものとする。(城主の能力が最大値であれば関係なし)
  getEffectiveLordStats(provId) {
    const base = this.getBaseLordStats(provId);
    if (!base || base.isJodai || base.isDirectRule || !(base.governor || base.isDaimyo)) return base;
    const p = (this.provinces || []).find(x => x.id === provId);
    if (!p || !p.ownerId) return base;
    const aides = this.getLordAideIndex().get(provId);
    if (!aides || aides.length === 0) return base;
    const lordId = base.governor ? base.governor.id : null;
    const out = Object.assign({}, base, {
      own: { military: base.military, politics: base.politics, stratagem: base.stratagem },
      aides: {},
      boosted: false
    });
    const statOf = {
      military: o => Number(o.military) || 0,
      politics: o => Number(o.politic ?? o.politics) || 0,
      stratagem: o => Number(o.intel ?? o.intelligence ?? o.stratagem) || 0
    };
    for (const k of ['military', 'politics', 'stratagem']) {
      const ownVal = Number(base[k]) || 0;
      let maxVal = ownVal;
      let bestOfficer = null;
      for (const o of aides) {
        if (!o || o.isDead || o.id === lordId || o.clanId !== p.ownerId) continue;
        const v = statOf[k](o);
        if (v > maxVal) {
          maxVal = v;
          bestOfficer = o;
        }
      }
      if (maxVal > ownVal && bestOfficer) {
        // 城主の能力は、その国の武将の能力の最大値とその城主の能力の間の差の30%分が、その城主の能力に足される
        const diff = maxVal - ownVal;
        const bonus = Math.round(diff * 0.3);
        if (bonus > 0) {
          out[k] = ownVal + bonus;
          out.aides[k] = { id: bestOfficer.id, name: bestOfficer.name, value: maxVal, diff: diff, bonus: bonus };
          out.boosted = true;
        }
      }
    }
    return out.boosted ? out : base;
  },



  // 配下待機武将の所在（国ID → 武将配列）。getOfficersInProvince の「家臣（vassal）」判定と同じ基準。

  // 武将・国の状態が前回と同じなら作り直さない（AI の繰り返し呼び出しで重くならないように）。

  getLordAideIndex() {

    const offs = this.activeOfficers || this.officers || [];

    const provs = this.provinces || [];

    const c = this._lordAideCache;

    if (c && c.offs === offs && c.provs === provs && c.nOff === offs.length && c.nProv === provs.length && this._lordAideStateSame(c.snap, offs, provs)) {

      return c.map;

    }

    const ownerOf = new Map();

    provs.forEach(p => ownerOf.set(p.id, p.ownerId || null));

    const homeByClan = new Map();

    const homeOf = (o) => {

      if (!homeByClan.has(o.clanId)) {

        const h = this.getDaimyoHomeProvince(o);

        homeByClan.set(o.clanId, h ? h.id : '');

      }

      return homeByClan.get(o.clanId);

    };

    const map = new Map();

    for (const o of offs) {

      if (!o || o.isDead || o.isDaimyo || !o.clanId || o.clanId === 'ronin') continue;

      let pid;

      if (o.assignedProvId) pid = o.assignedProvId;

      else if (o.defaultProv && ownerOf.get(o.defaultProv) === o.clanId) pid = o.defaultProv;

      else pid = homeOf(o);

      if (!pid || ownerOf.get(pid) !== o.clanId) continue;

      let arr = map.get(pid);

      if (!arr) { arr = []; map.set(pid, arr); }

      arr.push(o);

    }

    this._lordAideCache = { offs, provs, nOff: offs.length, nProv: provs.length, snap: this._lordAideSnapshot(offs, provs), map };

    return map;

  },



  _lordAideSnapshot(offs, provs) {

    const s = [];

    for (const o of offs) { s.push(o ? o.clanId : null, o ? (o.assignedProvId || null) : null, o ? !!o.isDead : true, o ? !!o.isDaimyo : false, o ? (o.defaultProv || null) : null); }

    for (const p of provs) { s.push(p.id, p.ownerId || null, p.governorId || null); }

    return s;

  },



  _lordAideStateSame(snap, offs, provs) {

    if (!snap) return false;

    let k = 0;

    for (const o of offs) {

      if (!o) { if (snap[k] !== null || snap[k + 2] !== true) return false; k += 5; continue; }

      if (snap[k] !== o.clanId || snap[k + 1] !== (o.assignedProvId || null) || snap[k + 2] !== !!o.isDead || snap[k + 3] !== !!o.isDaimyo || snap[k + 4] !== (o.defaultProv || null)) return false;

      k += 5;

    }

    for (const p of provs) {

      if (snap[k] !== p.id || snap[k + 1] !== (p.ownerId || null) || snap[k + 2] !== (p.governorId || null)) return false;

      k += 3;

    }

    return true;

  },



  invalidateLordAideCache() {

    this._lordAideCache = null;

  },



  // 実効能力に配下補佐があれば「配下補佐: 武勇 ○○(85)・知略 △△(90)」を返す（無ければ空文字）

  describeLordAides(eff) {
    if (!eff || !eff.boosted || !eff.aides) return '';
    const label = { military: '武勇', politics: '内政', stratagem: '知略' };
    const parts = ['military', 'politics', 'stratagem'].filter(k => eff.aides[k]).map(k => {
      const a = eff.aides[k];
      const bonusStr = a.bonus !== undefined ? `(+${a.bonus})` : `(${a.value})`;
      return `${label[k]} ${a.name}${bonusStr}`;
    });
    return parts.length ? '配下補佐: ' + parts.join('・') : '';
  },



  // 能力表示用の小さな印（上がった能力の数字の後に付ける ▲。ツールチップに補佐した武将）

  lordAideMark(eff, key) {
    if (!eff || !eff.aides || !eff.aides[key]) return '';
    const label = { military: '武勇', politics: '内政', stratagem: '知略' }[key];
    const a = eff.aides[key];
    const own = eff.own ? eff.own[key] : '';
    const bonus = a.bonus !== undefined ? a.bonus : (eff[key] - own);
    const tip = `配下補佐: ${label} 最高${a.name}(${a.value})との差の30%(+${bonus})加算／本人 ${own}→${eff[key]}`.replace(/"/g, '&quot;');
    return `<sup title="${tip}" style="color:#f7dc6f; font-size:8.5pt; cursor:help;">▲</sup>`;
  },



  // 城主任命画面などの「(武x 内y 謀z)」：この国の城主・当主本人なら実効値（配下補佐込み）で表示

  formatLordStatsInline(provId, off) {

    const eff = this.getEffectiveStats(provId);

    if (eff && eff.boosted && eff.governor && off && eff.governor.id === off.id) {

      const tip = this.describeLordAides(eff).replace(/"/g, '&quot;');

      return `<span title="${tip}">(武${eff.military}${this.lordAideMark(eff, 'military')} 内${eff.politics}${this.lordAideMark(eff, 'politics')} 謀${eff.stratagem}${this.lordAideMark(eff, 'stratagem')})</span>`;

    }

    return `(武${off.military} 内${off.politic} 謀${off.intel})`;

  },



  // 領国の基本統治能力（配下補佐を含まない）。ユーザー要件: 基本的に大名の本拠地では城代はいません。大名の能力が適用されます

  getBaseLordStats(provId) {

    const p = this.provinces.find(x => x.id === provId);

    if (!p) return { military: 60, politics: 60, stratagem: 60, ratio: 1.0, isCapital: false };

    const ownerId = p.ownerId || this.playerClanId;

    const daimyoAb = getClanAbility(ownerId) || { military: 75, politics: 75, stratagem: 75 };

    

    // 大名武将の検索

    const daimyoOff = (this.activeOfficers || this.officers || []).find(o => o.clanId === ownerId && o.isDaimyo && !o.isDead);

    const daimyoName = daimyoOff?.name || this.getDaimyoLeaderName(ownerId);

    const daimyoMil = daimyoOff?.military ?? daimyoAb.military ?? 75;

    const daimyoPol = daimyoOff?.politic ?? daimyoAb.politics ?? 75;

    const daimyoIntel = daimyoOff?.intel ?? daimyoAb.stratagem ?? 75;



    // 城主武将の検索

    const governor = (p.governorId && (this.officers || this.activeOfficers)) 

      ? (this.officers || this.activeOfficers).find(o => o.id === p.governorId && !o.isDead && o.clanId === ownerId) 

      : null;



    const isCap = this.isCapitalProvince(p.id, ownerId);



    // 【絶対原則】大名の本拠地では城代はいません。大名の能力（100%）が適用されます

    // 【修正】governor.isDaimyo への依存を削除し、現在の真の当主(daimyoOff)と一致するかのみを判定

    if (isCap || (governor && daimyoOff && governor.id === daimyoOff.id)) {

      return {

        governor: daimyoOff || governor,

        isCapital: true,

        isDirectRule: false,

        isDaimyo: true,

        isJodai: false,

        name: daimyoName,

        military: daimyoMil,

        politics: daimyoPol,

        stratagem: daimyoIntel,

        skill: daimyoOff?.skill || '本拠親政',

        lore: daimyoOff?.lore || `${daimyoName}公の居城・本拠地。大名本人が親政を行い能力を100%発揮します。`,

        ratio: 1.0

      };

    } else if (governor) {

      // 本拠地以外の支城で一般武将が城主（能力100%発揮）

      return {

        governor: governor,

        isCapital: false,

        isDirectRule: false,

        isDaimyo: false,

        isJodai: false,

        name: governor.name,

        military: governor.military,

        politics: governor.politic,

        stratagem: governor.intel,

        skill: governor.skill || '武辺者',

        lore: governor.lore || '',

        ratio: 1.0

      };

    } else {

      // 本拠地以外の支城で城主不在 ＝ 通常の城代統治（大名能力の40%〜75%）

      if (!p.jodaiRatio) {

        const hash = ((provId.charCodeAt(0) * 17) + (provId.length * 23) + (ownerId ? ownerId.charCodeAt(0) * 7 : 11)) % 36;

        p.jodaiRatio = 0.40 + (hash / 100); // 0.40 〜 0.75

      }

      const ratio = p.jodaiRatio;

      const jMil = Math.max(20, Math.round(daimyoMil * ratio));

      const jPol = Math.max(20, Math.round(daimyoPol * ratio));

      const jStrat = Math.max(20, Math.round(daimyoIntel * ratio));

      const vacant = this.getVacantRule(p, ownerId);

      const pct = Math.round(ratio * 100);



      const vacantBadge = vacant

        ? (vacant.noPercentage || vacant.badge === '国司在京' ? vacant.badge : `${vacant.badge}（${pct}%）`)

        : `城代統治（${pct}%）`;



      return {

        governor: null,

        isCapital: false,

        isDirectRule: true,

        isJodai: true,

        isDaimyo: false,

        name: vacant ? vacant.label : '城代',

        military: jMil,

        politics: jPol,

        stratagem: jStrat,

        skill: vacant ? vacant.skill : '城代統治',

        lore: vacant ? vacant.lore : `大名不在の支城のため城代が統治。大名能力の${pct}%を発揮。`,

        vacantBadge: vacantBadge,

        ratio: ratio

      };

    }

  },



  // 武将の一言コメント取得ヘルパー,



  getOfficerComment(off) {

    if (!off) return '忠勇の士';

    if (off.skill && typeof off.skill === 'string' && off.skill.trim()) {

      return off.skill.trim();

    }

    if (off.isDaimyo) {

      return '当主の威令';

    }

    const mil = Number(off.military) || 0;

    const pol = Number(off.politic || off.politics) || 0;

    const intel = Number(off.intel || off.stratagem) || 0;

    

    if (mil >= 90) return '天下無双の豪傑';

    if (intel >= 90) return '神算鬼謀の軍師';

    if (pol >= 90) return '天下屈指の治世家';

    if (mil >= 80) return '一騎当千の猛将';

    if (intel >= 80) return '深謀遠慮の智将';

    if (pol >= 80) return '富国強兵の能吏';

    if (mil >= 70) return '歴戦の武辺者';

    if (intel >= 70) return '機略に富む謀士';

    if (pol >= 70) return '民政巧者';

    if (mil >= 60 || pol >= 60 || intel >= 60) return '気鋭の将';

    return '忠勇の士';

  },



  // 武将詳細・人物列伝ポップアップモーダル（ワンクリック展開・文字サイズ12pt以上）,



  commitGovernorAppointment(provId, officerId, opts = {}) {

    const p = (this.provinces || []).find(x => x.id === provId);

    const newGov = (this.activeOfficers || []).find(o => o.id === officerId && o.clanId === this.playerClanId && !o.isDead);

    if (!p || p.ownerId !== this.playerClanId || !newGov) return false;

    if (newGov.id === p.governorId && newGov.assignedProvId === p.id) return false;



    const currentGov = p.governorId

      ? (this.activeOfficers || []).find(o => o.id === p.governorId && o.id !== newGov.id)

      : null;

    if (currentGov) currentGov.assignedProvId = null;



    if (newGov.isDaimyo) {

      const oldCapitalProvId = (window.CLAN_CAPITAL_PROVINCES && window.CLAN_CAPITAL_PROVINCES[this.playerClanId])

        ? window.CLAN_CAPITAL_PROVINCES[this.playerClanId]

        : newGov.assignedProvId;

      const oldProv = oldCapitalProvId ? this.provinces.find(x => x.id === oldCapitalProvId) : null;

      if (oldProv && oldProv.id !== p.id) {

        oldProv.governorId = null;

        if (!opts.silent) {

          this.log(`👑【本拠移転】${newGov.name}公は居城を${oldProv.name}から${p.name}国（${p.castleName || p.castle}）へ移転させました！旧本拠地・${oldProv.name}は城代統治となります。`, 'important');

        }

      }

      if (!window.CLAN_CAPITAL_PROVINCES) window.CLAN_CAPITAL_PROVINCES = {};

      window.CLAN_CAPITAL_PROVINCES[this.playerClanId] = p.id;

    } else if (newGov.assignedProvId && newGov.assignedProvId !== p.id) {

      const oldProv = this.provinces.find(x => x.id === newGov.assignedProvId);

      if (oldProv) {

        oldProv.governorId = null;

        if (!opts.silent) this.log(`【城主異動】${newGov.name}が${oldProv.name}から${p.name}へ転任しました。`);

      }

    }



    p.governorId = newGov.id;

    newGov.assignedProvId = p.id;

    if (!opts.silent) {

      this.log(`【城主任命】${newGov.name}を${p.name}国（${p.castleName || p.castle}）の城主に任命！(武${newGov.military} 内${newGov.politic} 謀${newGov.intel})`, 'important');

      this.audio.playTaiko();

    }

    return true;

  },



  clearCastleGovernor(provId, opts = {}) {

    const p = (this.provinces || []).find(x => x.id === provId);

    if (!p || p.ownerId !== this.playerClanId || !p.governorId) return false;

    const currentGov = (this.activeOfficers || []).find(o => o.id === p.governorId);

    if (currentGov) currentGov.assignedProvId = null;

    p.governorId = null;

    if (!opts.silent) {

      const isCap = this.isCapitalProvince(p.id, p.ownerId);

      if (isCap) {

        this.log(`【城主解任】${p.name}の城主を解任し、大名本拠地親政（能力100%発揮）としました。`);

      } else {

        this.log(`【城主解任】${p.name}の城主を解任し、城代統治（大名能力の${Math.round((p.jodaiRatio || 0.55) * 100)}%発揮）としました。`);

      }

    }

    return true;

  },



  // 自領の城主を一覧で選び、まとめて任命する,



  extractPersonSurname(fullName) {

    if (!fullName) return '';

    const rawName = String(fullName);
    const offList = this.activeOfficers || this.officers || [];
    const isPersonName = /家$/.test(rawName) && rawName.length >= 3 && (offList.some(o => o && o.name === rawName) || (window.OFFICER_NAME_SET && window.OFFICER_NAME_SET.has(rawName)));
    const name = isPersonName ? rawName : rawName.replace(/家$/, '');

    const prefixes = ['長宗我部', '宇喜多', '龍造寺', '竜造寺', '小早川', '宇都宮', '西園寺', '小笠原', '佐々木', '豊臣', '羽柴', '木下', '徳川', '松平', '藤原', '清原'];

    const list = [...new Set([...prefixes, ...this.getKnownSurnames()])].sort((a, b) => b.length - a.length);

    for (const surname of list) {

      if (!surname) continue;

      if (name === surname) return surname;

      if (name.startsWith(surname) && name.length > surname.length) return surname;

    }

    if (name.length === 3) return name[0];

    if (name.length >= 4) return name.slice(0, 2);

    return name;

  },



  // 同じ一門とみなす苗字（賜姓・改姓を含む）。木下は豊臣一門に含めない（秀頼→木下継承で家中分裂）。



  surnameGroup(surname) {

    const groups = [

      ['豊臣', '羽柴'],

      ['徳川', '松平'],

      ['藤原', '清原']

    ];

    if (!surname) return [];

    const found = groups.find(arr => arr.includes(surname));

    return found ? found.slice() : [surname];

  },



  // その家の一門（宗家の苗字、または先代当主と同じ苗字）,



  ichimonSurnames(clanId, deceasedName) {

    const set = new Set();

    const add = (raw) => {

      const sur = this.extractPersonSurname(raw);

      this.surnameGroup(sur).forEach(s => { if (s) set.add(s); });

    };

    const master = (window.CLAN_MASTER_DATA || {})[clanId];

    if (master?.family) add(String(master.family).replace(/家$/, ''));

    if (this.foundingLeaderNames?.[clanId]) add(this.foundingLeaderNames[clanId]);

    if (deceasedName) add(deceasedName);

    return set;

  },



  // 天皇・上皇・法皇・親王・内親王・小倉宮（皇族）の判定
  isImperialFamilyPerson(personOrName) {
    if (!personOrName) return false;
    const name = typeof personOrName === 'string' ? personOrName : (personOrName.name || '');
    const id = typeof personOrName === 'object' && personOrName ? (personOrName.id || '') : (typeof personOrName === 'string' ? personOrName : '');
    if (/天皇|上皇|法皇|親王|内親王|小倉宮/.test(name)) return true;
    if (id && (id.includes('tenno') || id.includes('shinno') || id.includes('oguramiya') || id.endsWith('_in'))) return true;
    return false;
  },

  // 武将同士の一門判定（登場する天皇と上皇と親王と小倉宮は全て互いに一門とする）
  areOfficersIchimon(offA, offB) {
    if (!offA || !offB) return false;
    if (offA.id && offB.id && offA.id === offB.id) return true;
    // 皇族同士は全て互いに一門
    if (this.isImperialFamilyPerson(offA) && this.isImperialFamilyPerson(offB)) return true;
    // 淀殿
    if (offA.id === 'off_yododono' && (this.isHideyoshiHouseHead(offB.name) || offB.clanId === 'toyotomi' || offB.clanId === 'oda')) return true;
    if (offB.id === 'off_yododono' && (this.isHideyoshiHouseHead(offA.name) || offA.clanId === 'toyotomi' || offA.clanId === 'oda')) return true;
    const surA = this.extractPersonSurname(offA.name);
    const surB = this.extractPersonSurname(offB.name);
    if (surA && surB) {
      const grpA = this.surnameGroup(surA);
      if (grpA.includes(surB)) return true;
    }
    return false;
  },

  isIchimonName(officerName, clanId, deceasedName) {
    // 皇族の一門判定（天皇・上皇・親王・小倉宮）
    if (this.isImperialFamilyPerson(officerName)) {
      if (this.isImperialFamilyPerson(deceasedName)) return true;
      const founding = this.foundingLeaderNames?.[clanId];
      if (this.isImperialFamilyPerson(founding)) return true;
      const imperialClans = ['godaiho', 'gotoba_in', 'goshirakawa_in', 'sutoku_in', 'heian_court', 'yamato_court', 'jimmu', 'meiji', 'court'];
      if (clanId && imperialClans.includes(clanId)) return true;
    }
    const sur = this.extractPersonSurname(officerName);
    return this.ichimonSurnames(clanId, deceasedName).has(sur);
  },

  // 一門判定：OFFICER_FAMILY_ROSTERS に家の一門 ID 名簿があればそれを優先、なければ苗字（完全一致）で判定
  isIchimonOfficer(off, clanId, deceasedName) {
    if (!off) return false;
    // 淀殿は豊臣秀吉の一門
    if (off.id === 'off_yododono' && (clanId === 'toyotomi' || this.isHideyoshiHouseHead(deceasedName) || this.isHideyoshiHouseHead(this.foundingLeaderNames?.[clanId]) || clanId === 'oda')) return true;

    // 天皇・上皇・親王・小倉宮は全て互いに一門とする
    if (this.isImperialFamilyPerson(off)) {
      if (this.isImperialFamilyPerson(deceasedName)) return true;
      const founding = this.foundingLeaderNames?.[clanId];
      if (this.isImperialFamilyPerson(founding)) return true;
      const currentDaimyo = (this.activeOfficers || []).find(o => o.clanId === clanId && o.isDaimyo && !o.isDead);
      if (currentDaimyo && this.isImperialFamilyPerson(currentDaimyo)) return true;
      const imperialClans = ['godaiho', 'gotoba_in', 'goshirakawa_in', 'sutoku_in', 'heian_court', 'yamato_court', 'jimmu', 'meiji', 'court'];
      if (clanId && imperialClans.includes(clanId)) return true;
    }

    const roster = (window.OFFICER_FAMILY_ROSTERS || {})[clanId];
    if (Array.isArray(roster) && roster.length && this.officerIdIn(off, roster)) return true;
    return this.isIchimonName(off.name, clanId, deceasedName);
  },



  isHideyoshiHouseHead(name) {

    if (!name) return false;

    const sur = this.extractPersonSurname(name);

    return this.surnameGroup(sur).includes('豊臣') && this.leaderNamesMatch(name, '豊臣秀吉');

  },



  // シナリオ開始時の当主指定: playables.officerId と、シナリオ当主名に一致する同家の武将

  computeScenarioStartHeadIds(scen) {

    const ids = new Set();

    const master = window.OFFICERS_MASTER || [];

    (scen?.playables || []).forEach(p => { if (p && p.officerId) ids.add(p.officerId); });

    const owners = new Set([...(this.provinces || []).map(p => p.ownerId), ...(scen?.playables || []).map(p => p && p.id)].filter(Boolean));

    owners.forEach(ownerId => {

      // シナリオ自身が指定した当主名のみ（家の年代別名簿 CLAN_MASTER_DATA.leaders は使わない）

      const pl = (scen?.playables || []).find(d => d && d.id === ownerId);

      const name = pl?.scenarioLeaderName || pl?.name || pl?.leaderName || scen?.leaders?.[ownerId] || '';

      if (!name) return;

      master.forEach(o => { if (o && o.clanId === ownerId && o.name && this.leaderNamesMatch(o.name, name)) ids.add(o.id); });

    });

    return ids;

  },



  enforcePlayableHeads(scen) {
    if (!scen || (this.isVirtualScenario && this.isVirtualScenario())) return;
    const Y = Number(this.year);
    const capitals = window.CLAN_CAPITAL_PROVINCES || {};
    (scen.playables || []).forEach(pl => {
      if (!pl || !pl.id || !pl.officerId) return;
      const head = (this.activeOfficers || []).find(o => o.id === pl.officerId && !o.isDead);
      if (!head) return;
      const b = Number(head.birthYear), d = Number(head.deathYear);
      if (Number.isFinite(Y) && ((Number.isFinite(b) && Y < b) || (Number.isFinite(d) && Y > d))) return;
      const owned = (this.provinces || []).filter(p => p.ownerId === pl.id);
      if (!owned.length) return;
      const capId = (scen.capitals && scen.capitals[pl.id]) || capitals[pl.id];
      const cap = owned.find(p => p.id === capId) || owned.find(p => p.id === pl.startProvId) || owned[0];
      (this.activeOfficers || []).forEach(o => {
        if (o !== head && o.clanId === pl.id) {
          if (o.isDaimyo) o.isDaimyo = false;
          if (o.assignedProvId === cap.id) o.assignedProvId = null;
        }
      });
      if (cap.governorId && cap.governorId !== head.id) {
        const prevGov = (this.activeOfficers || []).find(o => o.id === cap.governorId);
        if (prevGov && prevGov.assignedProvId === cap.id) prevGov.assignedProvId = null;
      }
      head.clanId = pl.id;
      head.isDaimyo = true;
      this.provinces.forEach(p => { if (p.governorId === head.id && p.id !== cap.id) p.governorId = null; });
      cap.governorId = head.id;
      head.assignedProvId = cap.id;
    });
  },

  enforceScenarioLifespanFinal(scen) {
    // 仮想シナリオは全時代の武将が共演するため、史実の生没年で名簿から外さない（2026-11-09）
    if (this.isVirtualScenario && this.isVirtualScenario()) return;

    if (!Array.isArray(this.activeOfficers) || !this.provinces) return;

    const Y = Number(this.year);

    if (!Number.isFinite(Y)) return;

    const master = new Map((window.OFFICERS_MASTER || []).map(m => [m.id, m]));

    const ok = (o) => {

      if (!o) return false;

      const m = master.get(o.id) || o;

      const b = Number(m.birthYear), d = Number(m.deathYear);

      if (m.birthYear == null || m.deathYear == null || Number.isNaN(b) || Number.isNaN(d)) return true;

      if (Y > d || Y < b) return false;

      if (Y - b < 15 && !(o.isDaimyo && this._startHeadIds && this._startHeadIds.has(o.id))) return false;

      return true;

    };

    const removed = this.activeOfficers.filter(o => !ok(o));

    if (!removed.length) return;

    const removedIds = new Set(removed.map(o => o.id));

    try { console.warn('[lifespan] シナリオ' + (scen && scen.id) + ' 開始名簿から除外: ' + removed.map(o => o.name + '(' + o.birthYear + '-' + o.deathYear + ')').join(', ')); } catch (e) {}

    const lostDaimyo = removed.filter(o => o.isDaimyo && o.clanId && o.clanId !== 'ronin').map(o => ({ clanId: o.clanId, name: o.name }));

    this.activeOfficers = this.activeOfficers.filter(o => !removedIds.has(o.id));

    this.provinces.forEach(p => { if (p.governorId && removedIds.has(p.governorId)) p.governorId = null; });

    const capitals = window.CLAN_CAPITAL_PROVINCES || {};

    lostDaimyo.forEach(({ clanId, name }) => {

      if (this.activeOfficers.some(o => o.clanId === clanId && o.isDaimyo && !o.isDead)) return;

      const owned = this.provinces.filter(p => p.ownerId === clanId);

      if (!owned.length) return;

      let pool = [];

      try { pool = this.collectHeirPool(clanId, name) || []; } catch (e) { pool = this.activeOfficers.filter(o => o.clanId === clanId && !o.isDead); }

      const heir = pool.find(o => ok(o));

      if (!heir) return;

      heir.clanId = clanId;

      heir.isDaimyo = true;

      const cap = owned.find(p => p.id === capitals[clanId]) || owned[0];

      if (cap) {

        this.provinces.forEach(p => { if (p.governorId === heir.id && p.id !== cap.id) p.governorId = null; });

        cap.governorId = heir.id;

        heir.assignedProvId = cap.id;

        heir.defaultProv = cap.id;

      }

    });

    try { this.reconcileDaimyoWithMap(); } catch (e) {}

  },

  isStartChildHead(off, existing) {

    if (!off) return false;

    if (this._isSwitchingScenario) return !!(this._startHeadIds && this._startHeadIds.has(off.id) && Number(this.year) === Number(this.currentScenario?.year));

    // 開始後: 開始時に幼少当主として立った武将が当主のままなら残す

    const o = existing || off;

    return !!(o._startChildHead && o.isDaimyo && !o.isDead);

  },



  officerCanInherit(off) {

    if (!off || off.isDead) return false;

    const year = Number(this.year || 0);

    const birth = Number(off.birthYear);

    const death = Number(off.deathYear);

    if (!Number.isNaN(birth) && year - birth < 15) {

      // シナリオ開始時に指定された当主だけ年齢規則を緩める（生まれていない者は不可。後の相続は従来どおり15歳以上）

      if (!(year - birth >= 0 && this._isSwitchingScenario && this.isStartChildHead(off))) return false;

    }

    if (!Number.isNaN(death) && year > death) return false;

    return true;

  },



  deceasedDaimyoName(clanId) {

    return this.lastDaimyoNames?.[clanId] || this.foundingLeaderNames?.[clanId] || '';

  },



  snapshotLivingDaimyoNames() {

    this.lastDaimyoNames = this.lastDaimyoNames || {};

    (this.activeOfficers || []).forEach(o => {

      if (o && o.clanId && o.isDaimyo && !o.isDead && o.name) {

        this.lastDaimyoNames[o.clanId] = o.name;

      }

    });

  },



  nextRosterHeirName(clanId, deceasedName) {

    const profile = (window.CLAN_MASTER_DATA || {})[clanId];

    if (!profile?.leaders) return '';

    const years = Object.keys(profile.leaders).map(Number).filter(y => !Number.isNaN(y)).sort((a, b) => a - b);

    const cur = Number(this.year || 0);

    const past = years.filter(y => y <= cur);

    if (past.length) {

      const name = profile.leaders[String(past[past.length - 1])];

      if (name && !this.leaderNamesMatch(name, deceasedName)) return name;

    }

    const futureYear = years.find(y => y > cur);

    if (futureYear) {

      const name = profile.leaders[String(futureYear)];

      if (name && !this.leaderNamesMatch(name, deceasedName)) return name;

    }

    return '';

  },



  // 一門を家臣より優先。秀吉の家なら秀頼、秀次、秀長の順。同格は能力で決める,



  scoreHeir(off, clanId, deceasedName) {

    const ichimon = this.isIchimonOfficer(off, clanId, deceasedName);

    let score = ichimon ? 1000000 : 0;

    const nextName = this.nextRosterHeirName(clanId, deceasedName);

    if (nextName && this.leaderNamesMatch(off.name, nextName)) score += 80000;

    const houseHead = this.isHideyoshiHouseHead(deceasedName) || this.isHideyoshiHouseHead(this.foundingLeaderNames?.[clanId]);

    if (ichimon && houseHead) {

      // 家督順は data.js の HIDEYOSHI_HEIR_ORDER_IDS（ID 完全一致）

      const order = window.HIDEYOSHI_HEIR_ORDER_IDS || [];

      const idx = order.indexOf(off.id);

      if (idx >= 0) score += 20000 - idx * 100;

    }

    score += (off.military || 0) + (off.politic || off.politics || 0) + (off.intel || off.intelligence || 0);

    return score;

  },



  sortHeirCandidates(candidates, clanId, deceasedName) {

    return [...candidates].sort((a, b) => this.scoreHeir(b, clanId, deceasedName) - this.scoreHeir(a, clanId, deceasedName));

  },



  // 家中の後継者に加え、浪人や所領のない家にいる一門だけを候補に足す,



  collectHeirPool(clanId, deceasedName) {

    const living = (this.activeOfficers || []).filter(o => this.officerCanInherit(o));

    const landed = (id) => id && id !== 'ronin' && (this.provinces || []).some(p => p.ownerId === id);

    const inClan = living.filter(o => o.clanId === clanId && !o.isDaimyo);

    const extras = living.filter(o => {

      if (!o || o.clanId === clanId || o.isDaimyo) return false;

      if (!this.isIchimonOfficer(o, clanId, deceasedName)) return false;

      return !landed(o.clanId);

    });

    return this.sortHeirCandidates([...inClan, ...extras], clanId, deceasedName);

  },



  // 動的世継ぎシステム (要件5),



  async checkDaimyoLifespan() {

    // 観戦モード時はプレイヤー用の世継ぎ選択ダイアログは非表示（全大名をAIと同等に自動代替わり処理）

    if (!this.isSpectatorMode) {

      // 1. プレイヤーの大名 (this.playerDaimyo) が this.activeOfficers に存在しなくなった場合を判定

      const currentDaimyo = (this.activeOfficers || []).find(o => 

        o.clanId === this.playerClanId && o.isDaimyo && !o.isDead

      );



      if (!currentDaimyo) {

        const oldName = this.deceasedDaimyoName(this.playerClanId) || this.playerDaimyo?.name || '';

      const oldLabel = oldName || '前当主';

      // 2. 一門を家臣より前に並べた世継ぎ候補（秀吉の後は秀頼）

      const candidates = this.collectHeirPool(this.playerClanId, oldName);



      // 3. 候補がいる場合は SweetAlert2 等で「世継ぎ（次の大名）を選択するダイアログ」を表示

      if (candidates.length > 0) {

        if (this.isAutoPlay) this.pauseAutoPlayForEvent();

        this.music.playTrack('crisis', false, { stinger: true, noFirstHit: true });

        if (this.audio && this.audio.playDaimyoDeathSeExclusive) {
          this.audio.playDaimyoDeathSeExclusive();
        } else if (this.audio) {
          this.audio.playHoragai();
        }



        const inputOptions = {};

        candidates.forEach(o => {

          const age = this.year ? (this.year - (o.birthYear || 1530)) : null;

          const ageStr = age ? ` (${age}歳)` : '';

          const kin = this.isIchimonOfficer(o, this.playerClanId, oldName) ? '【一門】' : '【家臣】';

          inputOptions[o.id] = `${kin}${o.name}${ageStr} ⚔️${o.military} 🌾${o.politic ?? o.politics ?? 0} 📜${o.intel ?? o.intelligence ?? 0}${o.skill ? ' [' + o.skill + ']' : ''}`;

        });



        // 年替わり処理をここで待機させる。後続の歴史イベントが選択画面を上書きし、
        // 死亡済み当主の家督相続が未確定のままになる競合を防ぐ。
        const result = await Swal.fire({

          title: `<span style="font-size:1.25rem; color:#f5eedc; font-weight:bold; letter-spacing:1px;">❖ 当主逝去と世継ぎ家督相続 ❖</span>`,

          width: '560px',

          customClass: {

            popup: 'heir-selection-popup',

            input: 'heir-selection-select'

          },

          html: `

            <div style="text-align:center; padding:0; font-family:'Noto Serif JP',serif;">

              <p style="font-size:11.5pt; color:#e74c3c; margin:2px 0 6px 0; letter-spacing:1px;"><strong>【当主・${oldLabel} 公、天寿を全うし逝去】</strong></p>

              <p style="font-size:9.5pt; color:#ded6c8; line-height:1.5; margin:0 0 8px 0;">

                当主の御逝去に伴い重臣評定を召集いたしました。<br>

                一門を優先し、我が家の血脈と志を継ぐ【新当主】を指名してください。

              </p>

              ${this.autoPlayPausedForEvent ? '<p class="event-auto-pause-note" style="margin:4px 0 8px 0; font-size:10.5pt; color:#f5b041; text-align:center; font-weight:bold;">⏸ オート進行を一時停止しています。新当主を決定すると再開します。</p>' : ''}

              <div style="font-size:10pt; color:#c59b27; margin-bottom:2px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:6px;">

                <span>▼</span><span>世継ぎ（新当主）候補武将を選択</span><span>▼</span>

              </div>

            </div>

          `,

          input: 'select',

          inputOptions: inputOptions,

          inputValue: candidates[0].id,

          allowOutsideClick: false,

          allowEscapeKey: false,

          showCancelButton: false,

          confirmButtonText: 'この武将に家督を継承させる',

          confirmButtonColor: '#922b21',

          background: '#1c130d',

          color: '#f5eedc',

          didOpen: (popup) => {

            const selectEl = popup.querySelector('.swal2-select');

            if (selectEl) {

              selectEl.style.setProperty('color-scheme', 'dark');

              selectEl.style.setProperty('background-color', '#241710', 'important');

              selectEl.style.setProperty('color', '#f5eedc', 'important');

              selectEl.style.setProperty('border', '1.5px solid #a07840', 'important');

              selectEl.style.setProperty('border-radius', '6px', 'important');

              selectEl.style.setProperty('padding', '8px 12px', 'important');

              selectEl.style.setProperty('font-size', '10.5pt', 'important');

              selectEl.style.setProperty('width', '92%', 'important');

              selectEl.style.setProperty('max-width', '480px', 'important');

              selectEl.style.setProperty('margin', '6px auto 10px auto', 'important');

              selectEl.style.setProperty('display', 'block', 'important');



              Array.from(selectEl.options).forEach(opt => {

                opt.style.setProperty('color-scheme', 'dark');

                opt.style.setProperty('background-color', '#241710', 'important');

                opt.style.setProperty('color', '#f5eedc', 'important');

                opt.style.setProperty('padding', '8px 10px', 'important');

              });



              // プレビュー表示エリアの生成・挿入

              const previewDiv = document.createElement('div');

              previewDiv.id = 'heir-preview-container';

              previewDiv.style.cssText = 'width:92%; max-width:480px; margin:4px auto 12px auto; background:rgba(0,0,0,0.5); border:1px solid #7d633b; border-radius:6px; padding:8px 12px; font-family:"Noto Serif JP",serif; text-align:left; box-sizing:border-box; box-shadow:inset 0 1px 4px rgba(0,0,0,0.5);';

              

              const updatePreview = (officerId) => {

                const off = candidates.find(c => c.id === officerId) || candidates[0];

                if (!off) return;

                const age = this.year ? (this.year - (off.birthYear || 1530)) : null;

                const ageText = age ? ` (${age}歳)` : '';

                const skillBadge = off.skill ? `<div style="margin-top:4px;"><span style="display:inline-flex; background:#8c6d3b; color:#fff; padding:2px 8px; border-radius:3px; font-size:9pt; border:1px solid #c59b27;">特性: ${off.skill}</span></div>` : '';

                

                previewDiv.innerHTML = `

                  <div style="border-bottom:1px solid #5a4638; padding-bottom:4px; margin-bottom:8px;">

                    <div>

                      <span style="font-size:13pt; font-weight:bold; color:#ffd700;">${off.name}</span>

                      <span style="color:#ded6c8; font-size:9.5pt; margin-left:4px;">${ageText}</span>

                      ${skillBadge}

                    </div>

                  </div>

                  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; text-align:center;">

                    <div style="background:rgba(231,76,60,0.22); border:1px solid #c0392b; padding:4px 6px; border-radius:4px;">

                      <div style="font-size:9.5pt; color:#ff7675; font-weight:bold;">⚔️ 武勇</div>

                      <div style="font-size:13.5pt; font-weight:bold; color:#ff7675;">${off.military}</div>

                    </div>

                    <div style="background:rgba(52,152,219,0.22); border:1px solid #2980b9; padding:4px 6px; border-radius:4px;">

                      <div style="font-size:9.5pt; color:#74b9ff; font-weight:bold;">🌾 内政</div>

                      <div style="font-size:13.5pt; font-weight:bold; color:#74b9ff;">${off.politic ?? off.politics ?? '-'}</div>

                    </div>

                    <div style="background:rgba(46,204,113,0.22); border:1px solid #27ae60; padding:4px 6px; border-radius:4px;">

                      <div style="font-size:9.5pt; color:#2ecc71; font-weight:bold;">📜 知略</div>

                      <div style="font-size:13.5pt; font-weight:bold; color:#2ecc71;">${off.intel ?? off.intelligence ?? '-'}</div>

                    </div>

                  </div>

                `;

              };



              updatePreview(selectEl.value || candidates[0].id);



              selectEl.addEventListener('change', (e) => {

                updatePreview(e.target.value);

              });



              selectEl.insertAdjacentElement('afterend', previewDiv);

            }

          }

        });

          const chosenId = result.value || candidates[0].id;

          const chosen = candidates.find(o => o.id === chosenId) || candidates[0];

          chosen.clanId = this.playerClanId;

          chosen.isDaimyo = true;

          chosen.assignedProvId = null; // 本拠地親政のため



          if (this.playerDaimyo) {

            this.playerDaimyo.name = chosen.name;

            this.playerDaimyo.officerId = chosen.id;

            this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

          }



          // 自勢力の全武将の所属先を新当主へ確実に連動

          (this.activeOfficers || []).forEach(o => {

            if (o.clanId === this.playerClanId && o.id !== chosen.id) {

              o.isDaimyo = false;

            }

          });



          const newFamilyName = this.getClanFamilyName(this.playerClanId);

          if (this.playerDaimyo) this.playerDaimyo.clan = newFamilyName;

          this.resyncOfficerPlacements();

          this.lastDaimyoNames = this.lastDaimyoNames || {};

          this.lastDaimyoNames[this.playerClanId] = chosen.name;

          this.log(`【家督相続】${oldLabel}公の御逝去に伴い、世継ぎ・${chosen.name}公が新当主へ就任。家名は${newFamilyName}となりました。`, 'important');

          // 一門以外が継いだときは、他で大名として登録された家臣がゆかりの地で独立する

          if (!this.isIchimonOfficer(chosen, this.playerClanId, oldName)) this.applySuccessionBreakaways?.(this.playerClanId, chosen, oldName);

          this.audio.playFanfare();

          this.updateUI();

          this.music.playTrack(this.getSeasonTrackKey(), false, { seasonReturn: true });

          if (this.autoPlayPausedForEvent) {

            this.resumeAutoPlayAfterEvent();

          }

      } else {

        // ★【大名滅亡防止】自家に後継候補武将がいない場合：浪人から新当主（客将・名跡継承）を推戴！

        const roninCandidates = (this.activeOfficers || []).filter(o => o.clanId === 'ronin' && !o.isDead);



        if (roninCandidates.length > 0 && window.Swal) {

          if (this.isAutoPlay) this.pauseAutoPlayForEvent();

          this.music.playTrack('crisis', false, { stinger: true, noFirstHit: true });

          if (this.audio && this.audio.playDaimyoDeathSeExclusive) {
          this.audio.playDaimyoDeathSeExclusive();
        } else if (this.audio) {
          this.audio.playHoragai();
        }



          // 能力順にソート

          roninCandidates.sort((a, b) => {

            const scoreA = (a.military || 0) + (a.politic || 0) + (a.intel || 0);

            const scoreB = (b.military || 0) + (b.politic || 0) + (b.intel || 0);

            return scoreB - scoreA;

          });



          const inputOptions = {};

          roninCandidates.forEach(o => {

            const defProv = o.defaultProv ? this.getProvinceJapaneseName(o.defaultProv) : '諸国';

            inputOptions[o.id] = `${o.name} [滞在:${defProv}] (武:${o.military} 内:${o.politic} 謀:${o.intel})`;

          });



          const result = await Swal.fire({

            title: `❖ 断絶危機！名将推戴による御家再興 ❖`,

            html: `

              <div style="text-align:center; padding:10px; font-family:'Noto Serif JP',serif;">

                <p style="font-size:13pt; color:#e74c3c; margin-bottom:12px;"><strong>【当主・${oldLabel} 公、御逝去／世継ぎ不在の危機】</strong></p>

                <p style="font-size:11.5pt; color:#f5eedc; line-height:1.7; margin-bottom:15px;">

                  当主が御逝去されましたが、直系の後継武将がおらず、このままでは御家断絶となります！<br>

                  しかし、領民・忠臣らが天下の流浪の士に檄を飛ばしたところ、名立たる浪人たちが我が家の名跡を継ぎ、御家を再興すべく参陣いたしました。<br>

                  <strong style="color:var(--gold-bright);">【新当主】として推戴・迎える名将を指名してください。</strong>

                </p>

                ${this.autoPlayPausedForEvent ? '<p class="event-auto-pause-note" style="margin:4px 0 8px 0; font-size:10.5pt; color:#f5b041; text-align:center; font-weight:bold;">⏸ オート進行を一時停止しています。新当主を推戴すると再開します。</p>' : ''}

              </div>

            `,

            input: 'select',

            inputOptions: inputOptions,

            inputValue: roninCandidates[0].id,

            allowOutsideClick: false,

            allowEscapeKey: false,

            showCancelButton: false,

            confirmButtonText: 'この名将を新当主に迎えて御家を再興する',

            confirmButtonColor: '#27ae60',

            background: '#1c130d',

            color: '#f5eedc'

          });

            const chosenId = result.value || roninCandidates[0].id;

            const chosen = roninCandidates.find(o => o.id === chosenId) || roninCandidates[0];

            chosen.clanId = this.playerClanId;

            chosen.isDaimyo = true;

            chosen.assignedProvId = null;



            if (this.playerDaimyo) {

              this.playerDaimyo.name = chosen.name;

              this.playerDaimyo.officerId = chosen.id;

              this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

            }



            const newFamilyName = this.getClanFamilyName(this.playerClanId);

            if (this.playerDaimyo) this.playerDaimyo.clan = newFamilyName;

            this.resyncOfficerPlacements();

            this.lastDaimyoNames = this.lastDaimyoNames || {};

            this.lastDaimyoNames[this.playerClanId] = chosen.name;

            this.log(`🔥【御家再興・名跡継承】${oldLabel}公の御逝去に伴い、${chosen.name}公が新当主に推戴され、家名は${newFamilyName}となりました。`, 'important');

            this.applySuccessionBreakaways?.(this.playerClanId, chosen, oldName);

            this.audio.playGrandFanfare?.();

            this.updateUI();

            this.music.playTrack(this.getSeasonTrackKey(), false, { seasonReturn: true });

            if (this.autoPlayPausedForEvent) {

              this.resumeAutoPlayAfterEvent();

            }

        } else {

          // 世界に浪人が1人もいない極限状況のみ滅亡

          this.log(`【御家滅亡】後継ぎがいないため滅亡`, 'important');

          this.triggerDefeat('no-heir');

        }

      }

    }

  }



    // 他勢力の大名代替わり処理（大名の断絶・空白地化を防止）

    // ※観戦モード時は直近で選択していた大名 (this.playerClanId) も含めて自動代替わりを行う

    const livingClanIds = [...new Set(this.provinces.map(p => p.ownerId).filter(id => id && (this.isSpectatorMode || id !== this.playerClanId)))];

    for (const clanId of livingClanIds) {

      const hasDaimyo = (this.activeOfficers || []).some(o => o.clanId === clanId && o.isDaimyo && !o.isDead);

      if (!hasDaimyo) {

        const deceasedName = this.deceasedDaimyoName(clanId);

        const otherCandidates = this.collectHeirPool(clanId, deceasedName);

        if (otherCandidates.length > 0) {

          const oldClanName = this.getClanFamilyName(clanId);

          const heir = otherCandidates[0];

          heir.clanId = clanId;

          heir.isDaimyo = true;

          heir.assignedProvId = null;

          // 他の武将の大名フラグを解除し、新当主へ所属を連動

          (this.activeOfficers || []).forEach(o => {

            if (o.clanId === clanId && o.id !== heir.id) {

              o.isDaimyo = false;

            }

          });

          if (clanId === this.playerClanId && this.playerDaimyo) {

            this.playerDaimyo.name = heir.name;

            this.playerDaimyo.officerId = heir.id;

            this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

          }

          const newClanFamily = this.getClanFamilyName(clanId);

          const kinLabel = this.isIchimonOfficer(heir, clanId, deceasedName) ? '一門の' : '';

          this.lastDaimyoNames = this.lastDaimyoNames || {};

          this.lastDaimyoNames[clanId] = heir.name;

          this.resyncOfficerPlacements();

          this.log(`【家督相続】${oldClanName}にて当主が逝去、世継ぎの${kinLabel}${heir.name}が新当主へ就任。家名は${newClanFamily}となりました。`, 'important');

          // 一門以外が継いだときは、他で大名として登録された家臣がゆかりの地で独立する

          if (!kinLabel) this.applySuccessionBreakaways?.(clanId, heir, deceasedName);

        } else {

          // ★【CPU大名滅亡防止】後継武将が不在の場合：領内滞在または全国の浪人から新当主を推戴！

          const roninCandidates = (this.activeOfficers || []).filter(o => o.clanId === 'ronin' && !o.isDead);

          if (roninCandidates.length > 0) {

            const myProvIds = this.provinces.filter(p => p.ownerId === clanId).map(p => p.id);

            // 領内に滞在している浪人を最優先、いなければ能力順

            let chosenRonin = roninCandidates.find(r => r.defaultProv && myProvIds.includes(r.defaultProv));

            if (!chosenRonin) {

              roninCandidates.sort((a, b) => {

                const scoreA = (a.military || 0) + (a.politic || 0) + (a.intel || 0);

                const scoreB = (b.military || 0) + (b.politic || 0) + (b.intel || 0);

                return scoreB - scoreA;

              });

              chosenRonin = roninCandidates[0];

            }



            chosenRonin.clanId = clanId;

            chosenRonin.isDaimyo = true;

            chosenRonin.assignedProvId = null;

            if (clanId === this.playerClanId && this.playerDaimyo) {

              this.playerDaimyo.name = chosenRonin.name;

              this.playerDaimyo.officerId = chosenRonin.id;

              this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

            }

            this.lastDaimyoNames = this.lastDaimyoNames || {};

            this.lastDaimyoNames[clanId] = chosenRonin.name;



            const clanName = this.getClanFamilyName(clanId);

            this.resyncOfficerPlacements();

            this.log(`🔥【名跡継承】当主逝去により、${chosenRonin.name}が家督を継承し、家名は${clanName}となりました。`, 'important');

            this.applySuccessionBreakaways?.(clanId, chosenRonin, deceasedName);

          } else {

            // 全国に浪人が1人もいない場合：ゆかり城主の独立 → 残り空白地化

            const clanName = this.getClanFamilyName(clanId);

            this.log(`【御家滅亡】${clanName}は後継ぎがいないため滅亡。領国の再編が始まります。`, 'important');

            this.resolveClanCollapseIndependence(clanId);

          }

        }

      }

    }

  },



  // イベント発生後の新勢力一斉滅亡・名前欠落バグの完全修正（大名・武将の自動補正・復帰・創設）,



  namedLordForClan(ownerId) {

    const playable = this.currentScenario?.playables?.find(d => d.id === ownerId);

    const scenarioName = playable?.scenarioLeaderName || playable?.name;

    if (scenarioName) return scenarioName;

    const scenLeaders = this.currentScenario?.leaders;

    if (scenLeaders && scenLeaders[ownerId]) return scenLeaders[ownerId];

    const profile = (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA[ownerId]) ? window.CLAN_MASTER_DATA[ownerId] : null;

    if (profile?.leaders) {

      const curY = Number(this.year || 0);

      const years = Object.keys(profile.leaders).map(Number).filter(y => !isNaN(y) && y <= curY).sort((a, b) => b - a);

      if (years.length) return profile.leaders[String(years[0])];

      if (profile.leaders.default) return profile.leaders.default;

    }

    return '';

  },



  // 同じ家に当主候補が複数いるときの一意な選び方。

  // 1) シナリオの勢力当主名と完全一致 2) scen.leaders[家] 3) CLAN_MASTER_DATA の年代当主

  // 4) 内政（politic）が高い順 5) 先頭,



  pickClanLeader(clanId, candidates) {

    const list = (candidates || []).filter(Boolean);

    if (list.length <= 1) return list[0] || null;

    const playable = this.currentScenario?.playables?.find(d => d.id === clanId);

    const names = [

      playable?.scenarioLeaderName || playable?.name,

      this.currentScenario?.leaders?.[clanId],

      this.getRosterLeaderName ? this.getRosterLeaderName(clanId) : ''

    ].filter(Boolean);

    for (const n of names) {

      const hit = list.find(o => o.name && this.leaderNamesMatch(o.name, n));

      if (hit) return hit;

    }

    const pol = (o) => Number(o.politic ?? o.politics ?? 0);

    return [...list].sort((a, b) => pol(b) - pol(a))[0] || list[0];

  },



  // 生存中の当主武将（isDaimyo）。複数いれば pickClanLeader で一人に絞る,



  getClanDaimyoOfficer(clanId) {

    const flagged = (this.activeOfficers || this.officers || []).filter(o => o.clanId === clanId && o.isDaimyo && !o.isDead);

    return this.pickClanLeader(clanId, flagged);

  },



  seatNamedLord(ownerId) {

    const leaderName = this.namedLordForClan(ownerId);

    if (!leaderName || !this.activeOfficers) return null;

    const matches = (o) => o && this.officerCanInherit(o) && o.name && this.leaderNamesMatch(o.name, leaderName);

    // 同名の別人（宗義功の兄・猪三郎と弟・富寿など）がいるときは、シナリオ開始時に当主に指定した武将IDを優先する

    const startHeadId = this._isSwitchingScenario ? (this.currentScenario?.playables || []).find(p => p && p.id === ownerId)?.officerId : null;

    let lord = (startHeadId && this.activeOfficers.find(o => o.id === startHeadId && matches(o) && o.clanId === ownerId))

      || this.activeOfficers.find(o => matches(o) && o.clanId === ownerId)

      || this.activeOfficers.find(matches);

    if (lord && lord.clanId !== ownerId && lord.isDaimyo && this.isClanExtant(lord.clanId)) {

      const theirName = this.namedLordForClan(lord.clanId);

      if (theirName && this.leaderNamesMatch(lord.name, theirName)) lord = null;

    }

    if (!lord && window.OFFICERS_MASTER) {

      const master = window.OFFICERS_MASTER.find(o => matches(o));

      if (master && !this.activeOfficers.some(o => o.id === master.id)) {

        lord = JSON.parse(JSON.stringify(master));

        lord.isDead = false;

        this.activeOfficers.push(lord);

      } else if (master) {

        lord = this.activeOfficers.find(o => o.id === master.id && this.officerCanInherit(o)) || null;

      }

    }

    if (!lord) return null;

    lord.clanId = ownerId;

    lord.isDaimyo = true;

    lord.isDead = false;

    lord.hasBeenDaimyo = true;

    if (this.formerDaimyoIds) this.formerDaimyoIds.add(lord.id);

    this.activeOfficers.filter(o => o.clanId === ownerId && o.id !== lord.id).forEach(o => {

      o.isDaimyo = false;

    });

    this.lastDaimyoNames = this.lastDaimyoNames || {};

    this.lastDaimyoNames[ownerId] = lord.name;

    return lord;

  },



  syncDaimyoStatus() {

    if (!this.provinces) return;

    this.activeOfficers = this.activeOfficers || [];



    const activeOwners = [...new Set(this.provinces.map(p => p.ownerId).filter(Boolean))];

    // 当主の死去で後継を立てた家（一門以外が継いだら、ループ後に家臣の独立を判定。2026-10-11 bc）

    const successions = [];

    activeOwners.forEach(ownerId => {

      // 1. 自勢力に生存中の大名武将(isDaimyo: true)がいるかチェック

      let daimyoOfficer = this.activeOfficers.find(o => o.clanId === ownerId && o.isDaimyo && !o.isDead);

      const deadLordName = daimyoOfficer ? '' : this.deceasedLordNameForSuccession(ownerId);



      // シナリオと史実名簿に名前がある当主が存命なら、家臣より先にその人を当主にする

      if (!daimyoOfficer) daimyoOfficer = this.seatNamedLord(ownerId);



      // 2. いない場合、一門を家臣より優先して大名に格上げ（秀吉の後は秀頼）

      if (!daimyoOfficer) {

        const deceasedName = this.deceasedDaimyoName(ownerId);

        const clanOfficers = this.collectHeirPool(ownerId, deceasedName);

        if (clanOfficers.length > 0) {

          daimyoOfficer = clanOfficers[0];

          daimyoOfficer.clanId = ownerId;

          daimyoOfficer.isDaimyo = true;

          this.lastDaimyoNames = this.lastDaimyoNames || {};

          this.lastDaimyoNames[ownerId] = daimyoOfficer.name;

        }

      }



      // 3. それでもいない場合（新勢力で武将が0人の場合: 生存している史実当主を呼び戻す、または創設）

      if (!daimyoOfficer) {

        let leaderName = this.getDaimyoLeaderName(ownerId);

        const deadLord = this.deceasedDaimyoName(ownerId);

        if (deadLord && this.leaderNamesMatch(leaderName, deadLord)) {

          const nextHeir = this.nextRosterHeirName(ownerId, deadLord);

          if (nextHeir) leaderName = nextHeir;

        }



        const canSpawn = (off) => this.officerCanInherit(off);



        // 秀吉がまだ寿命内のときだけ名寄せする。没した秀吉は復活させない

        if (this.leaderNamesMatch(leaderName, '豊臣秀吉')) {

          daimyoOfficer = this.activeOfficers.find(o =>

            this.officerIdIn(o, ['off_toyotomi_hideyoshi', 'toyotomi']) && canSpawn(o)

          );

        }



        // 以前のイベントで作った当主を使い回し、二重生成しない

        if (!daimyoOfficer) {

          daimyoOfficer = this.activeOfficers.find(o => o.id === `off_event_${ownerId}` && canSpawn(o));

        }



        // (A) 浪人、または領地を持たない家にいる史実当主だけを自勢力へ移す。他国の当主は奪わない

        if (!daimyoOfficer) {

          daimyoOfficer = this.activeOfficers.find(o => {

            if (!canSpawn(o) || !o.name) return false;

            // 名前の部分一致は使わない（別名は LEADER_NAME_ALIASES で完全一致）

            const nameHit = this.leaderNamesMatch(o.name, leaderName);

            if (!nameHit) return false;

            if (o.clanId !== ownerId && o.isDaimyo && this.isClanExtant(o.clanId)) return false;

            return true;

          });

        }



        // (B) 同名の生存武将だけを写す。没年を過ぎた武将と、すでに居る武将は複製しない

        if (!daimyoOfficer && window.OFFICERS_MASTER) {

          const masterOff = window.OFFICERS_MASTER.find(o => this.leaderNamesMatch(o.name, leaderName));

          if (masterOff && canSpawn(masterOff)) {

            const existing = this.activeOfficers.find(o => o.id === masterOff.id);

            if (existing && canSpawn(existing)) {

              daimyoOfficer = existing;

            } else if (!existing) {

              daimyoOfficer = JSON.parse(JSON.stringify(masterOff));

              daimyoOfficer.isDead = false;

              daimyoOfficer.isDaimyo = false;

              this.activeOfficers.push(daimyoOfficer);

            }

          }

        }



        // (C) それでも見つからない場合、正規の当主武将オブジェクトを自動生成

        if (!daimyoOfficer) {

          const profile = (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA[ownerId]) ? window.CLAN_MASTER_DATA[ownerId] : null;

          const clanAbility = getClanAbility(ownerId);

          const finalName = (leaderName && leaderName !== ownerId && !leaderName.endsWith('家')) 

            ? leaderName : `${this.getClanDisplayName(ownerId)}`;

          daimyoOfficer = {

            id: `off_event_${ownerId}`,

            name: finalName,

            clanId: ownerId,

            defaultProv: this.provinces.find(p => p.ownerId === ownerId)?.id || null,

            military: clanAbility.military || 75,

            politic: clanAbility.politics || 75,

            intel: clanAbility.stratagem || 75,

            era: 'sengoku',

            skill: profile?.tactic || '威風堂々',

            lore: profile?.desc || `${this.getClanDisplayName(ownerId)}の当主。`,

            birthYear: (this.year ?? 1560) - 30,

            deathYear: (this.year ?? 1560) + 40,

            isDaimyo: true,

            isDead: false

          };

          this.activeOfficers.push(daimyoOfficer);

        }



        if (daimyoOfficer && this.officerCanInherit(daimyoOfficer)) {

          daimyoOfficer.clanId = ownerId;

          daimyoOfficer.isDaimyo = true;

          daimyoOfficer.isDead = false;

          daimyoOfficer.assignedProvId = null;

          this.lastDaimyoNames = this.lastDaimyoNames || {};

          this.lastDaimyoNames[ownerId] = daimyoOfficer.name;

        } else {

          daimyoOfficer = null;

        }

      }



      // 4. 当主武将の確定と、同勢力他武将の大名フラグ解除

      if (daimyoOfficer) {

        this.activeOfficers.filter(o => o.clanId === ownerId && o.id !== daimyoOfficer.id).forEach(o => {

          o.isDaimyo = false;

        });

        if (deadLordName && !this.isIchimonOfficer(daimyoOfficer, ownerId, deadLordName)) {

          successions.push({ ownerId, heir: daimyoOfficer, deadLordName });

        }

      }



      // 5. プレイヤー勢力の場合は playerDaimyo とも同期（家名は後継当主の名字）

      if (ownerId === this.playerClanId && this.playerDaimyo && daimyoOfficer) {

        this.playerDaimyo.name = daimyoOfficer.name;

        this.playerDaimyo.officerId = daimyoOfficer.id;

        this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

      }

    });

    // 一門以外が継いだ相続：他で大名登録のある家臣がゆかりの地で独立（項目10の規則。年始の寿命死と同じ）

    successions.forEach(({ ownerId, heir, deadLordName }) => {

      if (heir && heir.isDaimyo && !heir.isDead && heir.clanId === ownerId) {

        this.applySuccessionBreakaways?.(ownerId, heir, deadLordName);

      }

    });

    this.reconcileDaimyoWithMap();

    // 領地が移った城に旧主の城主を残さず、新当主は本拠のみ、家臣は支城のみに置き直す

    this.resyncOfficerPlacements();

  },



  /**

   * 当主不在の家について、直前の当主が死去した（落命・没年超え）ときだけその名を返す（2026-10-11 bc）。

   * 新しく領地を得ただけの家や、当主が他家へ移っただけの家は相続ではないので ''。

   */

  deceasedLordNameForSuccession(ownerId) {

    const name = this.deceasedDaimyoName(ownerId);

    if (!name) return '';

    const lists = [this.activeOfficers, this.officers, window.OFFICERS_MASTER]

      .filter((l, i, arr) => Array.isArray(l) && arr.indexOf(l) === i);

    const year = Number(this.year || 0);

    const isGone = (o) => o.isDead || (Number.isFinite(Number(o.deathYear)) && year > Number(o.deathYear));

    let found = false, dead = false;

    lists.forEach(list => list.forEach(o => {

      if (!o || !o.name || !this.leaderNamesMatch(o.name, name)) return;

      found = true;

      if (isGone(o)) dead = true;

    }));

    if (!found || !dead) return '';

    // 同名の存命者が当主として残っているなら相続ではない

    if ((this.activeOfficers || []).some(o => o && !o.isDead && o.isDaimyo && this.leaderNamesMatch(o.name, name) && this.officerCanInherit(o))) return '';

    return name;

  },



  // イベント・家督相続のあと、城主配置を領有関係と一致させる,



  resyncOfficerPlacements() {

    if (!this.provinces || !this.activeOfficers) return;



    if (window.CLAN_CAPITAL_PROVINCES) {

      const ownersNow = [...new Set(this.provinces.map(p => p.ownerId).filter(Boolean))];

      ownersNow.forEach(ownerId => {

        const myProvs = this.provinces.filter(p => p.ownerId === ownerId);

        if (myProvs.length === 0) return;

        const mapped = window.CLAN_CAPITAL_PROVINCES[ownerId];

        if (mapped && myProvs.some(p => p.id === mapped)) return;

        const daimyo = this.activeOfficers.find(o => o.clanId === ownerId && o.isDaimyo && !o.isDead);

        const seated = daimyo && myProvs.find(p => p.governorId === daimyo.id || p.id === daimyo.assignedProvId);

        window.CLAN_CAPITAL_PROVINCES[ownerId] = (seated || this.pickFallbackCapital(myProvs, ownerId) || myProvs[0]).id;

      });

    }



    const officerById = new Map(this.activeOfficers.map(o => [o.id, o]));

    const cleared = new Set();

    const clearGov = (p) => {

      if (!p || !p.governorId) return;

      const gov = officerById.get(p.governorId);

      p.governorId = null;

      if (gov && gov.assignedProvId === p.id) gov.assignedProvId = null;

      cleared.add(p.id);

    };



    const seenGov = new Map();

    this.provinces.forEach(p => {

      if (!p.governorId) return;

      if (seenGov.has(p.governorId)) {

        clearGov(p);

        return;

      }

      seenGov.set(p.governorId, p.id);

    });



    this.provinces.forEach(p => {

      if (!p.governorId) return;

      const gov = officerById.get(p.governorId);

      const foreign = !gov || gov.isDead || !p.ownerId || gov.clanId !== p.ownerId;

      const daimyoOnBranch = gov && gov.isDaimyo && !gov.isDead && !this.isCapitalProvince(p.id, p.ownerId);

      if (foreign || daimyoOnBranch) clearGov(p);

    });



    this.activeOfficers.forEach(o => {

      if (!o.assignedProvId) return;

      const p = this.provinces.find(x => x.id === o.assignedProvId);

      if (!p || o.isDead || p.ownerId !== o.clanId || p.governorId !== o.id) {

        if (p && p.governorId === o.id) clearGov(p);

        o.assignedProvId = null;

      }

    });



    const owners = [...new Set(this.provinces.map(p => p.ownerId).filter(Boolean))];

    owners.forEach(ownerId => {

      const daimyo = this.activeOfficers.find(o => o.clanId === ownerId && o.isDaimyo && !o.isDead);

      if (!daimyo) return;

      const myProvs = this.provinces.filter(p => p.ownerId === ownerId);

      const cap = myProvs.find(p => this.isCapitalProvince(p.id, ownerId)) || myProvs[0];

      if (!cap) return;



      myProvs.forEach(p => {

        if (p.id !== cap.id && p.governorId === daimyo.id) clearGov(p);

      });

      if (daimyo.assignedProvId && daimyo.assignedProvId !== cap.id) {

        const old = this.provinces.find(p => p.id === daimyo.assignedProvId);

        if (old && old.governorId === daimyo.id) clearGov(old);

        daimyo.assignedProvId = null;

      }

      if (cap.governorId && cap.governorId !== daimyo.id) {

        const prev = officerById.get(cap.governorId);

        if (prev) prev.assignedProvId = null;

        cap.governorId = null;

        cleared.add(cap.id);

      }

      cap.governorId = daimyo.id;

      daimyo.assignedProvId = cap.id;

      cleared.delete(cap.id);

    });



    const seatVassal = (p, officer) => {

      p.governorId = officer.id;

      officer.assignedProvId = p.id;

    };



    const openBranches = () => this.provinces.filter(p =>

      cleared.has(p.id) && p.ownerId && !p.governorId && !this.isCapitalProvince(p.id, p.ownerId)

    );



    openBranches().forEach(p => {

      // プレイヤーの城は手動任命を尊重し、自動配置の対象外とする
      if (!this.isSpectatorMode && p.ownerId === this.playerClanId) return;

      const match = this.activeOfficers.find(o =>

        o.defaultProv === p.id && o.clanId === p.ownerId && !o.assignedProvId && !o.isDead && !o.isDaimyo && !this.isCourtFigure(o)

      );

      if (match) seatVassal(p, match);

    });



    this.autoAppointComputerCastellans({ fillVacancies: true });

  },



  // プレイヤー勢力の切り替え（本能寺の変・後継選択用）,



  switchPlayerClan(newClanId) {

    const scen = SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId));

    const targetPlayable = scen?.playables?.find(p => p.id === newClanId);

    const profile = window.CLAN_MASTER_DATA ? window.CLAN_MASTER_DATA[newClanId] : null;



    this.playerClanId = newClanId;



    // 当主武将の特定

    const daimyoOff = (this.activeOfficers || []).find(o => o.clanId === newClanId && o.isDaimyo && !o.isDead) ||

                      (this.activeOfficers || []).find(o => o.clanId === newClanId && !o.isDead);



    if (daimyoOff) {

      daimyoOff.isDaimyo = true;

    }



    if (targetPlayable) {

      this.playerDaimyo = JSON.parse(JSON.stringify(targetPlayable));

      if (daimyoOff) {

        this.playerDaimyo.name = daimyoOff.name;

        this.playerDaimyo.officerId = daimyoOff.id;

      }

      this.playerDaimyo.clan = this.getClanFamilyName(newClanId);

    } else if (profile) {

      this.playerDaimyo = {

        id: newClanId,

        name: daimyoOff ? daimyoOff.name : (profile.leaders?.['1582'] || profile.leaders?.default || newClanId),

        clan: this.getClanFamilyName(newClanId),

        color: profile.color || '#884422',

        crest: (profile.family || '').replace('家', '紋'),

        kamonSvgId: profile.kamon || `kamon-${newClanId}`,

        officerId: daimyoOff?.id,

        gold: 800,

        rice: 1200

      };

    }



    const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    if (myProvs.length > 0) {

      const homeProv = this.getPlayerHomeProvince();

      this.selectProvince(homeProv ? homeProv.id : myProvs[0].id);

    }



    this.updateUI();

    this.audio.playFanfare();

    this.log(`【後継就任】${this.playerDaimyo?.name || ''}公として乱世の覇権を継承いたしました！`, 'important');

  },



  // 本能寺の変・後継勢力分割＆各武将の所属先切り替え,



  executeHonnoujiSuccession(chosenSuccessorClanId = null) {



    // 【ここを追加】すでに本能寺の変が発生している場合は、処理を中断して重複を防ぐ

    if (this.honnojiSplit) {

      // 分裂は一度だけ。後継選択（2回目の呼び出し）ではプレイヤー勢力の切替だけ行う

      if (chosenSuccessorClanId && chosenSuccessorClanId !== this.playerClanId) {

        this.switchPlayerClan(chosenSuccessorClanId);

        this.syncDaimyoStatus();

        if (this.playerDaimyo) this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

        this.updateUI();

      }

      return;

    }

    

    this.honnojiSplit = true;

    // 本能寺の変の中身は events.json の rules.succession（落命・領地・後継・家臣団、すべて ID 完全一致）

    const H = this.historicalSuccessionData();

    const formerClan = H.formerClan || 'oda';

    const minTroops = Number(H.minTroops) || 3000;



    // 1. 落命退場

    const deadIds = Array.isArray(H.deadOfficerIds) ? H.deadOfficerIds : [];

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



    // 2. 領地再編

    for (const [pId, newOwner] of Object.entries(H.territory || {})) {

      const prov = this.provinces.find(p => p.id === pId);

      if (prov) {

        prov.ownerId = newOwner;

        prov.troops = Math.max(minTroops, prov.troops || minTroops);

      }

    }



    // 3. 各跡継ぎ大名本人の設定

    const findByIds = (ids) => {

      const hit = (list) => (list || []).find(o => this.officerIdIn(o, ids || []));

      return hit(this.activeOfficers) || hit(this.officers);

    };

    const successorClans = [];

    const successorIds = new Set();

    let nobukatsu = null; // 旧主家を継ぐ当主（houseHeir）

    (H.successors || []).forEach(spec => {

      if (!spec || !spec.clanId) return;

      successorClans.push(spec.clanId);

      let lord = findByIds(spec.officerIds);

      if (!lord && spec.houseHeir) {

        lord = (this.activeOfficers || []).find(o => o.clanId === formerClan && !o.isDead && !o.isDaimyo);

      }

      if (!lord) return;

      lord.clanId = spec.clanId;

      lord.isDaimyo = true;

      lord.isDead = false;

      lord.assignedProvId = null;

      successorIds.add(lord.id);

      if (spec.houseHeir) nobukatsu = lord;

    });



    // 4. 跡継ぎ大名への所属切替（名前部分一致禁止・ID 配列のみ）

    const retainerGroups = Array.isArray(H.retainers) ? H.retainers : [];

    const unseatIfNotOwned = (off) => {

      if (!off.assignedProvId) return;

      const prov = this.provinces.find(p => p.id === off.assignedProvId);

      if (!prov || prov.ownerId !== off.clanId) {

        if (prov && prov.governorId === off.id) prov.governorId = null;

        off.assignedProvId = null;

      }

    };



    const lists = (this.officers && this.officers !== this.activeOfficers)

      ? [this.activeOfficers, this.officers]

      : [this.activeOfficers];

    lists.forEach(list => {

      if (!list) return;

      list.forEach(off => {

        if (!off || off.isDead) return;

        // 領地を持つ他家の当主は引き抜かない

        if (off.isDaimyo && !successorIds.has(off.id) && this.isClanExtant(off.clanId)) return;



        const group = retainerGroups.find(g => g && this.officerIdIn(off, g.officerIds || []));

        if (group) {

          off.clanId = group.clanId;

          unseatIfNotOwned(off);

          return;

        }



        // 旧主家の城主だけ、領地の新しい領主（跡継ぎ）に所属を合わせる

        if (off.clanId === formerClan && off.assignedProvId && off.id !== nobukatsu?.id) {

          const prov = this.provinces.find(p => p.id === off.assignedProvId);

          if (prov && prov.ownerId && successorClans.includes(prov.ownerId)) {

            off.clanId = prov.ownerId;

            return;

          }

        }



        unseatIfNotOwned(off);

      });

    });



    // 5. プレイヤーが指定勢力に切り替える場合

    if (chosenSuccessorClanId) {

      this.switchPlayerClan(chosenSuccessorClanId);

    } else if (this.playerClanId === formerClan) {

      // 旧主家のままであれば houseHeir（信雄）が新当主に

      if (this.playerDaimyo && nobukatsu) {

        this.playerDaimyo.name = nobukatsu.name;

        this.playerDaimyo.officerId = nobukatsu.id;

      }

    }



    this.updateCastlesForYear();

    this.updateToyotomiSurname(false);

    this.syncDaimyoStatus();

    if (this.playerDaimyo) this.playerDaimyo.clan = this.getClanFamilyName(this.playerClanId);

    this.updateUI();

    if (H.log) this.log(H.log, 'important');

  },



  startGame() {

    this.music.init();

    if (this.playerDaimyo) {

      this.playerDaimyo = JSON.parse(JSON.stringify(this.playerDaimyo));

    }

    const modal = document.getElementById('startModal');

    if (modal) modal.classList.add('hidden');



    const scen = this.currentScenario || (window.SCENARIOS_DATA || SCENARIOS || []).find(s => String(s.id) === String(this.currentScenarioId));

    if (!this.playerDaimyo && scen) {

      const match = this.playerClanId ? scen.playables.find(p => p.id === this.playerClanId) : null;

      if (!match) {
        if (typeof Swal !== 'undefined' && Swal.fire) {
          Swal.fire({
            title: '大名未選択',
            text: '出陣する大名家を選択してください。',
            icon: 'warning',
            confirmButtonText: '閉じる',
            confirmButtonColor: '#9a7b2c',
            background: '#241710',
            color: '#ffd700'
          });
        } else {
          alert('出陣する大名家を選択してください。');
        }
        if (modal) modal.classList.remove('hidden');
        return;
      }
      this.playerDaimyo = match;

      this.playerClanId = this.playerDaimyo.id;

    }



    let goldBase = this.playerDaimyo?.gold || 500;

    let riceBase = this.playerDaimyo?.rice || 800;

    // 楽級・初級は初めての勢力でも序盤の内政・徴兵に余裕を持てるよう、
    // 大名ごとの基準資源に追加の支度金・兵糧を上乗せする。
    if (this.currentDifficulty === 'relaxed') { goldBase += 1200; riceBase += 1500; }

    else if (this.currentDifficulty === 'easy') { goldBase += 650; riceBase += 850; }

    else if (this.currentDifficulty === 'normal') { goldBase += 150; riceBase += 200; }

    else if (this.currentDifficulty === 'hard') { goldBase -= 50; riceBase -= 100; }



    this.gold = Math.max(250, goldBase);

    this.rice = Math.max(350, riceBase);

    this.ap = 3;



    // シナリオ開始前・時代背景＆天下情勢解説モーダルの表示

    const introModal = document.getElementById('scenarioIntroModal');

    if (false && introModal && scen) { // 時代背景モーダルは廃止（ユーザー要望）

      document.getElementById('introModalTitle').textContent = `❖ ${this.formatYear(scen.year)}年 【${scen.title}】 〜時代背景と天下情勢〜 ❖`;

      document.getElementById('introBackgroundText').textContent = scen.lore_background || scen.desc;

      document.getElementById('introFactionsText').textContent = buildFactionHeadsText(scen) || '全国諸侯が覇を競う天下の情勢。';

      document.getElementById('introFocusText').textContent = scen.lore_focus || '自領を固め、天下統一への覇道を切り拓け！';

      document.getElementById('introDaimyoOath').textContent = `「我ら${this.playerDaimyo?.clan || ''}、当主・${this.playerDaimyo?.name || ''}！この乱世に義の旗を掲げ、必ずや天下を静謐に導かん！」`;



      introModal.classList.remove('hidden');



      const startIntroBtn = document.getElementById('introStartBtn');

      if (startIntroBtn) {

        startIntroBtn.onclick = () => {

          introModal.classList.add('hidden');

          this.executeStartGameFlow();

        };

      }

    } else {

      this.executeStartGameFlow();

    }

  },



  getPlayerHomeProvince() {

    const clanId = this.playerClanId;

    if (!clanId) return null;

    const myProvs = (this.provinces || []).filter(p => p.ownerId === clanId);

    if (!myProvs.length) return null;



    // 1. シナリオ定義の大名 startProvId (指定本拠地を最優先)

    if (this.playerDaimyo && this.playerDaimyo.startProvId) {

      const match = myProvs.find(p => p.id === this.playerDaimyo.startProvId);

      if (match) return match;

    }



    // 2. シナリオ固有の勢力本拠地定義 (scen.capitals)

    const scen = this.currentScenario || (window.SCENARIOS_DATA || SCENARIOS || []).find(s => String(s.id) === String(this.currentScenarioId));

    if (scen && scen.capitals && scen.capitals[clanId]) {

      const match = myProvs.find(p => p.id === scen.capitals[clanId]);

      if (match) return match;

    }



    // 3. 大名家の本拠地判定 (isCapitalProvince: CLAN_CAPITAL_PROVINCES 等)

    const capProv = myProvs.find(p => this.isCapitalProvince(p.id, clanId));

    if (capProv) return capProv;



    // 4. 当主武将の居城・滞在国

    if (this.playerDaimyo && this.playerDaimyo.officerId) {

      const dOff = (this.activeOfficers || this.officers || []).find(o => o.id === this.playerDaimyo.officerId);

      if (dOff && dOff.assignedProvId) {

        const match = myProvs.find(p => p.id === dOff.assignedProvId);

        if (match) return match;

      }

    }



    // 5. フォールバック本拠地計算 (pickFallbackCapital: 北端ではなく地理的中心・重臣投票)

    const fallback = this.pickFallbackCapital(myProvs, clanId);

    if (fallback) return fallback;



    return myProvs[0];

  },



  /** 統一した時点の当主・家名（家督相続後の当主、改めた家名）を playerDaimyo に反映して返す（ui_fixed12） */

  syncPlayerHeadAtUnification() {

    const head = (this.activeOfficers || []).find(o => o.clanId === this.playerClanId && o.isDaimyo && !o.isDead) || null;

    const startHeadId = (this.startLordIds && this.startLordIds[this.playerClanId])

      || (this.currentScenario?.playables || []).find(x => x.id === this.playerClanId)?.officerId || null;

    const famName = typeof this.getClanFamilyName === 'function' ? this.getClanFamilyName(this.playerClanId) : '';

    if (this.playerDaimyo) {

      if (head && head.name) { this.playerDaimyo.name = head.name; this.playerDaimyo.officerId = head.id; }

      if (famName && famName !== '空白地' && famName !== '浪人') this.playerDaimyo.clan = famName;

    }

    return {

      clanName: this.playerDaimyo?.clan || famName || '武家',

      daimyoName: this.playerDaimyo?.name || head?.name || '当主',

      headChanged: !!(head && startHeadId && head.id !== startHeadId)

    };

  },



  // ===== 凡庸・無名の世継ぎは内政型（ほぼ攻めない）にする（ui_fixed12）=====

  // 開始時の当主を記録（シナリオに当主の武将IDが無い家のため）

  recordStartLords() {

    this.startLordIds = {};

    (this.activeOfficers || []).forEach(o => { if (o.isDaimyo && !o.isDead && o.clanId) this.startLordIds[o.clanId] = o.id; });

  },



  /** 武将の評価: 'capable'（有能）/ 'mediocre'（凡庸・無名）/ 'normal' */

  classifyHeirTemperament(off) {

    if (!off) return 'normal';

    const m = Number(off.military) || 0, p = Number(off.politic) || 0, i = Number(off.intel) || 0;

    const top = Math.max(m, p, i), sum = m + p + i;

    const R = window.HEIR_TEMPERAMENT_RULE || { capableTop: 80, mediocreTop: 70, mediocreSum: 180, bioMinChars: 15 };

    if (top >= R.capableTop) return 'capable';

    if (!this._masterById || this._masterByIdSrc !== window.OFFICERS_MASTER) {

      this._masterByIdSrc = window.OFFICERS_MASTER;

      this._masterById = new Map((window.OFFICERS_MASTER || []).map(x => [x.id, x]));

    }

    const master = this._masterById.get(off.id) || null;

    const generated = !master || String(off.id || '').startsWith('off_event_');

    const bio = String((master && (master.lore || master.comment)) || off.lore || off.comment || '').trim();

    const estimated = !!(off.yearsEstimated || (master && master.yearsEstimated));

    const unknown = generated || estimated || bio.length < R.bioMinChars;

    if ((top < R.mediocreTop && sum < R.mediocreSum) || unknown) return 'mediocre';

    return 'normal';

  },



  /** CPU 家で、開始時と違う当主が凡庸・無名なら内政型＋ほぼ攻めない補正を返す */

  getHeirTemperamentOverride(clanId) {

    if (!clanId || clanId === 'ronin' || clanId === 'null') return null;

    if (!this.isSpectatorMode && clanId === this.playerClanId) return null;

    const lord = (this.activeOfficers || []).find(o => o.clanId === clanId && o.isDaimyo && !o.isDead);

    if (!lord) return null;

    // 指定の当主以外は能力・知名度に関係なく凡庸扱い（織田家：信長以外。信長死後に始まるシナリオも）

    const forced = (window.FORCED_MEDIOCRE_UNLESS_HEAD || {})[clanId];

    if (forced) {

      const ok = (forced.headIds || []).includes(lord.id) || (forced.headNames || []).includes(lord.name);

      return ok ? null : { personality: 'domestic', passiveHeir: true };

    }

    const pl = (this.currentScenario?.playables || []).find(x => x.id === clanId);

    const startId = (this.startLordIds && this.startLordIds[clanId]) || pl?.officerId || null;

    if (!startId || startId === lord.id) return null;

    if (!this._heirTempCache) this._heirTempCache = {};

    if (!(lord.id in this._heirTempCache)) this._heirTempCache[lord.id] = this.classifyHeirTemperament(lord);

    if (this._heirTempCache[lord.id] !== 'mediocre') return null;

    return { personality: 'domestic', passiveHeir: true };

  },



  executeStartGameFlow() {

    const scen = this.currentScenario || (window.SCENARIOS_DATA || SCENARIOS || []).find(s => String(s.id) === String(this.currentScenarioId));

    try { this.applyAiClanStartBoosts?.(); } catch (e) {}

    try { this.recordStartLords?.(); } catch (e) {}

    this.updateUI();

    // 開始時点で征夷大将軍の条件を満たす家は達成済み（宣下ダイアログ・オート停止・曲替えなし。以後の目標は全国統一。2026-10-11 cc）

    this.shogunAtStart = false;

    this.initCoalitionWatch?.(true); // 開始時の国数を記録（2026-10-11 ck）

    if (this.meetsShogunCondition()) {

      this.shogunAppointed = true;

      this.shogunAtStart = true;

      this.log('👑【征夷大将軍】開始時点で京と七十州以上を押さえているため、将軍の位は既に手中にあります。目指すは全国統一のみ。', 'important');

    }



    // 初期状態は未選択（詳細・コマンドドロワーを隠す）にして全国地図をすっきり表示する
    if (typeof this.clearProvinceSelection === 'function') {
      this.clearProvinceSelection();
    } else {
      this.selectedProvId = null;
      this.updateMapDisplay();
    }

    this.updateSeasonVisuals();

    this.showSeasonNoticeBanner(this.year, this.seasonNames[this.seasonIdx], this.currentWeather);



    // 出陣ボタン押下によるゲーム開始時は必ず法螺貝を鳴らす（TitleBgm側・本編Audio両構えで確実再生）
    try {
      if (this.music && this.music.currentTrack === 'op' && this.music.timerId) {
        this.music.stop();
      }
      if (window.SengokuTitleBgm && typeof window.SengokuTitleBgm.horagai === 'function') {
        window.SengokuTitleBgm.horagai();
      }
      if (this.audio) {
        this.audio.init?.();
        if (this.audio.ctx && this.audio.ctx.state === 'suspended') {
          this.audio.ctx.resume?.().catch(() => {});
        }
        // TitleBgmで鳴っていない場合も本編Audioで必ず再生
        const tLeft = window.SengokuTitleBgm?.horagaiRemainingMs?.() || 0;
        if (tLeft <= 0) {
          try { this.audio.playHoragai(1.1); } catch (err) {}
        }
      }
    } catch (e) {}
    const horaLeftMs = Math.max(
      (() => { try { return window.SengokuTitleBgm?.horagaiRemainingMs?.() || 0; } catch (e) { return 0; } })(),
      2500
    );
    clearTimeout(this._postHoragaiBgmTimer);
    this._postHoragaiBgmTimer = setTimeout(() => {
      this._postHoragaiBgmTimer = null;
      try {
        if (!this.music.timerId || this.music.currentTrack === 'op') {
          this.music.playTrack(this.getSeasonTrackKey(), false, { noFirstHit: true });
        }
      } catch (e) {}
    }, horaLeftMs);



    this.log(`【覇業開幕】${this.playerDaimyo?.name || ''}公、${scen?.title || ''}の乱世へ出陣！`, 'important');

    // 出陣直後は別シナリオ閲覧による前回到達データの即座上書きを防ぐため、シナリオ別保存とバックアップ退避を実施

    try {

      const saveData = this.createSaveData();

      const jsonStr = JSON.stringify(saveData);

      const existing = localStorage.getItem('sengoku_save_data');

      if (existing) {

        safeStorageSet('sengoku_save_data_bak', existing);

      }

      if (this.currentScenarioId) {

        safeStorageSet(`sengoku_save_scen_${this.currentScenarioId}`, jsonStr);

      }

    } catch (e) {}

  },
};
