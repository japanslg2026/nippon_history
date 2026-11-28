/**
 * @file js/core/state/FormationAndMapColor.js - GameState から機能別に分割したメソッド群（45個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { CLAN_MASTER, FORMATIONS_DATA, SCENARIOS, gameRandom, getClanAbility } from '../GameStateShared.js?v=20261128_v74';

export const FormationAndMapColorMethods = {



// ============================================================================

  // SVG日本地図の初期化と描画

  // ============================================================================,



  getFormationMeta(key) {

    const table = window.FORMATIONS_DATA || FORMATIONS_DATA || {};

    return table[key] || table.gyorin || { key: 'gyorin', name: '魚鱗', type: 'assault', label: '魚鱗' };

  },



  getFormationType(key) {

    return this.getFormationMeta(key).type || 'assault';

  },



  getFormationTypeLabel(type) {

    return (window.FORMATION_TYPES && window.FORMATION_TYPES[type] && window.FORMATION_TYPES[type].label) || type || '不明';

  },



  isRainWeather(weather = null) {

    const w = weather || this.currentWeather || '';

    return /雨/.test(w); // '恵みの雨', '豪雨', '雨天', etc.

  },



  getRpsMultipliers(myKey, enemyKey, weather = null) {

    const rps = window.FORMATION_RPS || {};

    const myType = this.getFormationType(myKey);

    const enType = this.getFormationType(enemyKey);

    const rel = rps[myType];

    let res;

    if (rel && rel.beats === enType) res = { ...(rps.advantage || { dealt: 1.18, taken: 0.9 }), outcome: 'advantage', myType, enType };

    else if (rel && rel.losesTo === enType) res = { ...(rps.disadvantage || { dealt: 0.85, taken: 1.12 }), outcome: 'disadvantage', myType, enType };

    else res = { ...(rps.neutral || { dealt: 1, taken: 1 }), outcome: 'neutral', myType, enType };



    // 天候と陣形の連動：「雨天・豪雨」の日は鉄砲系（雁行陣・射撃）の威力が半減し、突撃系陣形が強化

    if (this.isRainWeather(weather)) {

      if (myKey === 'ganko' || myType === 'shoot') {

        res.dealt = Math.round(res.dealt * 0.50 * 100) / 100; // 雁行陣（鉄砲斉射）の威力半減

        res.weatherNote = '🌧️雨天により雁行陣・射撃の威力が半減！';

      } else if (myType === 'assault') {

        res.dealt = Math.round(res.dealt * 1.25 * 100) / 100; // 突撃系は雨煙に紛れる急襲ボーナス

        res.weatherNote = '🌧️雨天奇襲により突撃威力が強化！';

      }

    }

    return res;

  },



  inferProvinceTerrain(prov) {

    if (!prov) return { id: 'plain', label: '平野', boost: 'assault' };

    if (prov._terrainCache) return prov._terrainCache;

    // 山岳国（甲斐・信濃など）および平野（尾張・武蔵など）の確実な判定

    const mountainIds = ['kai', 'kai_tsuru', 'shinano_kawanakajima', 'shinano_sarashina_hanishina', 'mino_gujo', 'echigo_uonuma', 'shinano_ueda', 'shinano_chikuma_kiso', 'shinano_chikuma_azumi', 'shinano_kiso', 'shinano_takato', 'shinano_iida', 'shinano_takato_iida', 'hida', 'hida_takayama', 'hida_kiun', 'hida_kamioka', 'iwashiro', 'iwashiro_sukagawa', 'iwashiro_ishikawa', 'kozuke_takasaki', 'kozuke_agatsuma', 'kozuke_numata', 'tamba', 'tamba_west', 'tamba_east'];

    const plainIds = ['owari', 'owari_south', 'echigo_kanbara', 'kazusa_togane_naruto', 'musashi', 'musashi_oshi', 'musashi_hachigata', 'musashi_iwatsuki', 'musashi_kawagoe', 'musashi_edo_tama', 'musashi_edo', 'musashi_tama', 'mikawa_okazaki', 'mikawa_yoshida', 'echigo', 'echigo_murakami', 'settsu', 'settsu_shimakami', 'settsu_osaka', 'yamashiro', 'shimousa', 'kazusa', 'kazusa_isumi'];

    if (mountainIds.includes(prov.id)) {

      prov._terrainCache = { id: 'mountain', label: '山岳', boost: 'defense' };

      return prov._terrainCache;

    }

    if (plainIds.includes(prov.id)) {

      prov._terrainCache = { id: 'plain', label: '平野', boost: 'assault' };

      return prov._terrainCache;

    }

    const blob = `${prov.specialty || ''} ${prov.culturalNotes || ''} ${prov.castleLore || ''} ${prov.region || ''} ${prov.name || ''}`;

    const table = window.TERRAIN_KEYWORDS || {};

    let best = { id: 'plain', label: '平野', boost: 'assault', score: 0 };

    for (const [id, meta] of Object.entries(table)) {

      const re = meta.keywords;

      if (!re) continue;

      const m = blob.match(re);

      const score = m ? m.length + (id === 'mountain' && /山城|険/.test(blob) ? 2 : 0) : 0;

      if (score > best.score) best = { id, label: meta.label, boost: meta.boost, score };

    }

    if (best.score === 0 && /北海道|九州|四国|中国/.test(prov.region || '') && /島|港|湊/.test(blob)) {

      best = { id: 'coast', label: '沿岸', boost: 'encircle', score: 1 };

    }

    prov._terrainCache = { id: best.id, label: best.label, boost: best.boost };

    return prov._terrainCache;

  },



  getTerrainDealtBonus(formationKey, prov, isDefender = false) {

    const terrain = (prov && prov.label && prov.boost && prov.id) ? prov : this.inferProvinceTerrain(prov);

    const type = this.getFormationType(formationKey);

    // 山岳国（甲斐・信濃など）での防衛戦は「方円（防御）」が1.5倍

    if (terrain.id === 'mountain') {

      if (formationKey === 'hoen' || formationKey === 'houen' || (type === 'defense' && isDefender)) return 1.50;

      if (type === 'assault') return 0.85; // 峻険な山岳地帯は突撃に不利

      return 1.0;

    }

    // 平野（尾張・武蔵など）では「魚鱗・鋒矢」が強化

    if (terrain.id === 'plain') {

      if (formationKey === 'gyorin' || formationKey === 'hoshi') return 1.30;

      if (type === 'assault') return 1.15;

      if (type === 'defense') return 0.90;

      return 1.0;

    }

    if (terrain.boost === type) return 1.10;

    return 1.0;

  },



  pickEnemyFormation(enemyClanId, dstProv, playerKey) {

    const forms = Object.keys(window.FORMATIONS_DATA || FORMATIONS_DATA || { gyorin:1, kakuyoku:1, hoen:1 });

    const ability = getClanAbility(enemyClanId || 'default') || {};

    const personality = ability.personality || 'balanced';

    const terrain = this.inferProvinceTerrain(dstProv);

    const weights = {};

    forms.forEach(k => {

      const t = this.getFormationType(k);

      let w = 1;

      if (personality === 'aggressive' && t === 'assault') w += 2.2;

      if (personality === 'domestic' && t === 'defense') w += 2.2;

      if (personality === 'balanced' && t === 'encircle') w += 1.2;

      if (terrain.boost === t) w += 1.5;

      // 山岳国防御では敵AIも方円を強く志向

      if (terrain.id === 'mountain' && k === 'hoen') w += 2.5;

      // 平野では魚鱗・鋒矢を強く志向

      if (terrain.id === 'plain' && (k === 'gyorin' || k === 'hoshi')) w += 2.0;

      const counter = (window.FORMATION_RPS || {})[t];

      if (playerKey && counter && counter.beats === this.getFormationType(playerKey)) w += 1.3;

      weights[k] = w;

    });

    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;

    let r = gameRandom() * total;

    for (const k of forms) {

      r -= weights[k];

      if (r <= 0) return k;

    }

    return forms[0] || 'kakuyoku';

  },



  getClanStratagemPower(clanId, preferredProvId = null) {

    const ability = getClanAbility(clanId) || {};

    let best = Number(ability.stratagem) || 55;

    const offs = (this.activeOfficers || []).filter(o => o && !o.isDead && o.clanId === clanId);

    offs.forEach(o => {

      const intel = Number(o.intel || o.intelligence || o.stratagem) || 0;

      let score = intel;

      if (o.isDaimyo) score += 3;

      if (preferredProvId && (o.assignedProvId === preferredProvId || o.defaultProv === preferredProvId)) score += 5;

      if (score > best) best = score;

    });

    return Math.max(0, Math.min(100, best));

  },



  predictEnemyFormation(trueKey, stratagem) {

    const meta = this.getFormationMeta(trueKey);

    const s = Number(stratagem) || 0;

    if (s < 50) {

      return { text: '軍師の読み：敵陣形は【不明】（知略不足）', level: 'unknown', displayName: '不明' };

    }

    if (s < 70) {

      const typeLabel = this.getFormationTypeLabel(meta.type);

      return { text: `軍師の読み：敵は【${typeLabel}】の構えと見る（確度:カテゴリ）`, level: 'category', displayName: typeLabel, type: meta.type };

    }

    const conf = Math.min(96, Math.round(55 + (s - 70) * 1.35));

    return { text: `軍師の読み：敵陣形は【${meta.name}】と看破（確度 ${conf}%）`, level: 'exact', displayName: meta.name, key: trueKey, confidence: conf };

  },



  describeFormationMatchup(myKey, enemyKey, prov) {

    const mine = this.getFormationMeta(myKey);

    const enemy = this.getFormationMeta(enemyKey);

    const rps = this.getRpsMultipliers(myKey, enemyKey);

    const terrain = this.inferProvinceTerrain(prov);

    const tBonus = this.getTerrainDealtBonus(myKey, prov, false);

    const outcomeLabel = rps.outcome === 'advantage' ? '有利' : rps.outcome === 'disadvantage' ? '不利' : '互角';

    const color = rps.outcome === 'advantage' ? '#7dffa0' : rps.outcome === 'disadvantage' ? '#ff9a9a' : '#ffe9a8';



    let terrainNote = `地形:${terrain.label}（自陣×${tBonus.toFixed(2)}）`;

    if (terrain.id === 'mountain' && myKey === 'hoen') {

      terrainNote = `<strong style="color:#7dffa0">⛰️山岳要害【方円防衛1.5倍発動中！】</strong>`;

    } else if (terrain.id === 'plain' && (myKey === 'gyorin' || myKey === 'hoshi')) {

      terrainNote = `<strong style="color:#7dffa0">🌾平野合戦【${mine.name}突撃強化×${tBonus.toFixed(2)}！】</strong>`;

    }



    let weatherNote = '';

    if (this.isRainWeather()) {

      if (myKey === 'ganko') weatherNote = '｜<span style="color:#ff9a9a">🌧️雨天(雁行半減)</span>';

      else if (mine.type === 'assault') weatherNote = '｜<span style="color:#7dffa0">🌧️雨天(奇襲突撃強化)</span>';

    }



    return {

      html: `陣形: 我【${mine.name}】vs 敵【${enemy.name}】→ <strong style="color:${color}">${outcomeLabel}</strong>（与ダメ×${rps.dealt.toFixed(2)} / 被ダメ×${rps.taken.toFixed(2)}）｜${terrainNote}${weatherNote}`,

      rps, terrain, tBonus

    };

  },



  refreshDeployFormationIntel() {

    const box = document.getElementById('formationIntelBox');

    const hint = document.getElementById('formationMatchupHint');

    const dstSelect = document.getElementById('deployDstSelect');

    if (!box) return;

    const target = this.provinces.find(x => x.id === dstSelect?.value);

    if (!target || !target.ownerId) {

      box.textContent = '軍師の読み：空白地・無主地のため陣形予測は不要です';

      if (hint) hint.textContent = '三すくみ：突撃系 > 包囲系 > 防御系 > 突撃系';

      return;

    }

    if (!this._deployPredictedEnemyForm || this._deployPredictedFor !== target.id) {

      this._deployPredictedEnemyForm = this.pickEnemyFormation(target.ownerId, target, this.selectedFormationKey);

      this._deployPredictedFor = target.id;

    }

    const strat = this.getClanStratagemPower(this.playerClanId, this.selectedProvId);

    const pred = this.predictEnemyFormation(this._deployPredictedEnemyForm, strat);

    const terrain = this.inferProvinceTerrain(target);

    const weather = this.currentWeather || '晴天';

    const isRain = this.isRainWeather();



    let terrainIntel = '';

    if (terrain.id === 'mountain') {

      terrainIntel = `｜⛰️山岳要害(甲斐・信濃等): 防衛戦で【方円(防御)】が1.5倍に強化`;

    } else if (terrain.id === 'plain') {

      terrainIntel = `｜🌾平野決戦(尾張・武蔵等): 開けた平地で【魚鱗・鋒矢】の突破力が強化`;

    }



    let weatherIntel = isRain ? `｜🌧️天候: ${weather}(鉄砲系雁行は半減、奇襲突撃率上昇)` : `｜🌤️天候: ${weather}`;



    box.innerHTML = `${pred.text}（自軍知略 ${strat}）${terrainIntel} ${weatherIntel}`;



    if (hint) {

      const myForm = this.selectedFormationKey || 'gyorin';

      const enForm = this._deployPredictedEnemyForm || 'kakuyoku';

      const mine = this.getFormationMeta(myForm);

      const rps = this.getRpsMultipliers(myForm, enForm);

      const tBonus = this.getTerrainDealtBonus(myForm, target, false);

      const outcome = rps.outcome === 'advantage' ? '有利' : rps.outcome === 'disadvantage' ? '不利' : '互角';

      const rainHint = (isRain && myForm === 'ganko') ? ' (※雨天半減)' : (isRain && mine.type === 'assault') ? ' (※雨天急襲強化)' : '';

      hint.textContent = `選択中【${mine.name}】vs 予測敵陣 → ${outcome}（与×${rps.dealt.toFixed(2)} / 被×${rps.taken.toFixed(2)}）｜地形×${tBonus.toFixed(2)}${rainHint}`;

    }

  },



  provinceMatchesSpecialty(prov, rule) {

    if (!prov || !rule) return false;

    if (rule.provinceIds && rule.provinceIds.includes(prov.id)) return true;

    const blob = `${prov.specialty || ''} ${prov.culturalNotes || ''} ${prov.castleLore || ''} ${prov.name || ''}`;

    return rule.keywords ? rule.keywords.test(blob) : false;

  },



  clanOwnsSpecialty(clanId, synergyId) {

    const rule = (window.SPECIALTY_SYNERGY || []).find(r => r.id === synergyId);

    if (!rule) return false;

    return (this.provinces || []).some(p => p.ownerId === clanId && this.provinceMatchesSpecialty(p, rule));

  },



  _extractBonusProvinces(clanIdOrProvs) {

    if (Array.isArray(clanIdOrProvs)) {

      return clanIdOrProvs.map(x => {

        if (typeof x === 'string') {

          return (this.provinces || []).find(p => p.id === x) || { id: x, name: x };

        }

        return x || {};

      });

    }

    return (this.provinces || []).filter(p => p.ownerId === clanIdOrProvs);

  },



  /** 金山・銀山ボーナス判定 (佐渡・石見・但馬・甲斐など) */

  getMineBonusInfo(clanIdOrProvs) {

    const mineRule = (window.SPECIALTY_SYNERGY || []).find(r => r.id === 'mine');

    const myProvs = this._extractBonusProvinces(clanIdOrProvs);

    const mineProvs = myProvs.filter(p => {

      if (['sado', 'iwami', 'tajima', 'kai'].includes(p.id)) return true;

      if (p.goldMine || p.silverMine) return true;

      return mineRule && this.provinceMatchesSpecialty(p, mineRule);

    });

    const bonusGold = mineProvs.length * 100; // 1州につき毎季+100貫

    return {

      hasBonus: mineProvs.length > 0,

      count: mineProvs.length,

      mineCount: mineProvs.length,

      bonusGold,

      provinces: mineProvs,

      names: mineProvs.map(p => p.name || p.id)

    };

  },



  /** 名馬産地ボーナス判定 (陸奥・甲斐・信濃など) */

  getHorseBonusInfo(clanIdOrProvs) {

    const horseRule = (window.SPECIALTY_SYNERGY || []).find(r => r.id === 'horse');

    const myProvs = this._extractBonusProvinces(clanIdOrProvs);

    const horseProvs = myProvs.filter(p => {

      if (['mutsu_nanbu', 'kai', 'kai_tsuru', 'shinano', 'shinano_kawanakajima', 'shinano_sarashina_hanishina', 'shinano_ueda', 'shinano_chikuma_kiso', 'shinano_chikuma_azumi', 'shinano_kiso', 'shinano_takato', 'shinano_iida', 'shinano_takato_iida'].includes(p.id)) return true;

      return horseRule && this.provinceMatchesSpecialty(p, horseRule);

    });

    const multiplier = horseProvs.length > 0 ? (1 + Math.min(0.35, 0.20 + horseProvs.length * 0.05)) : 1.0;

    return {

      hasBonus: horseProvs.length > 0,

      count: horseProvs.length,

      horseCount: horseProvs.length,

      multiplier,

      provinces: horseProvs,

      names: horseProvs.map(p => p.name || p.id)

    };

  },



  /** 鉄砲鍛冶・南蛮港町ボーナス判定 (種子島/大隅・和泉/堺・近江/国友・肥前/長崎) */

  getGunsmithPortBonusInfo(clanIdOrProvs) {

    const gunRule = (window.SPECIALTY_SYNERGY || []).find(r => r.id === 'gunsmith');

    const myProvs = this._extractBonusProvinces(clanIdOrProvs);

    const gunProvs = myProvs.filter(p => {

      if (['tanegashima', 'osumi', 'izumi', 'sakai', 'oumi', 'omi_north', 'omi_south', 'kunitomo', 'hizen', 'hizen_saga', 'hizen_tsukushi', 'hizen_karatsu', 'nagasaki'].includes(p.id)) return true;

      return gunRule && this.provinceMatchesSpecialty(p, gunRule);

    });

    const shootMultiplier = gunProvs.length > 0 ? 1.30 : 1.0; // 射撃攻撃力+30%

    const extraCommerceGold = gunProvs.length * 80;          // 商業金収入+80貫/国

    return {

      hasBonus: gunProvs.length > 0,

      count: gunProvs.length,

      portCount: gunProvs.length,

      shootMultiplier,

      extraCommerceGold,

      provinces: gunProvs,

      names: gunProvs.map(p => p.name || p.id)

    };

  },



  getMilitaryGoldCost(prov) {

    let cost = 50;

    const iron = (window.SPECIALTY_SYNERGY || []).find(r => r.id === 'iron');

    if (iron && (this.provinceMatchesSpecialty(prov, iron) || this.clanOwnsSpecialty(this.playerClanId, 'iron'))) {

      cost = Math.round(cost * (1 - (iron.effects.militaryGoldDiscount || 0.2)));

    }

    return Math.max(30, cost);

  },



  getAutumnRiceMultiplier(prov) {

    const rice = (window.SPECIALTY_SYNERGY || []).find(r => r.id === 'rice');

    if (rice && this.provinceMatchesSpecialty(prov, rice)) {

      return 1 + (rice.effects.autumnRiceBonus || 0.2);

    }

    return 1;

  },



  setMapHeatMode(mode) {

    const valid = ['owner', 'diplomacy', 'troops', 'rice'];

    this.mapHeatMode = valid.includes(mode) ? mode : 'owner';

    if (this.mapHeatMode === 'diplomacy' && !this.mapPerspectiveClanId) {

      this.mapPerspectiveClanId = this.playerClanId;

    }

    document.querySelectorAll('#mapHeatFilter .map-heat-btn').forEach(btn => {

      btn.classList.toggle('active', btn.dataset.heat === this.mapHeatMode);

    });

    this.updateUI({ panel: false });

  },



  getHeatPerspectiveClanId() {

    return this.mapPerspectiveClanId || this.playerClanId;

  },



  getHeatRange(key) {

    let min = Infinity, max = -Infinity;

    (this.provinces || []).forEach(p => {

      let v = 0;

      if (key === 'troops') v = Number(p.troops) || 0;

      else if (key === 'rice') v = Number(p.rice || p.kokudaka) || 0;

      else v = Number(p[key]) || 0;

      if (v < min) min = v;

      if (v > max) max = v;

    });

    if (!Number.isFinite(min)) { min = 0; max = 1; }

    if (max <= min) max = min + 1;

    return { min, max };

  },



  // ヒートマップの配色（暗い地図に映える 4 段階ランプ）。兵力は深い藍→翠→水色、石高は焦茶→金→淡金,



  heatRampStops(mode) {

    return mode === 'rice'

      ? ['#1c1408', '#6b4e12', '#c9a227', '#ffe9a0']

      : ['#0e2233', '#135e72', '#1abc9c', '#7fdbff'];

  },



  heatRampColor(t, mode) {

    const stops = this.heatRampStops(mode).map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));

    // 少ない国どうしの差も見えるよう、低い側をやや持ち上げる

    const x = Math.pow(Math.max(0, Math.min(1, Number(t) || 0)), 0.8) * (stops.length - 1);

    const i = Math.min(stops.length - 2, Math.floor(x));

    const f = x - i;

    const rgb = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));

    return `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;

  },



  heatRampCss(mode) {

    return `linear-gradient(90deg, ${this.heatRampStops(mode).join(', ')})`;

  },



  // 互換用（旧名）。兵力ランプを返す,



  cyanHeatColor(t) {

    return this.heatRampColor(t, 'troops');

  },



  getDiplomacyProvinceColor(p) {

    const perspective = this.getHeatPerspectiveClanId();

    if (!p.ownerId) return '#4a4a4a';

    if (p.ownerId === perspective) {

      return this.brightenHexColor(this.getRegisteredProvinceColor(p), 25);

    }

    if (this.isAllied(perspective, p.ownerId)) return '#2f6fb5';

    const borders = (p.neighbors || []).some(nId => {

      const n = this.provinces.find(x => x.id === nId);

      return n && n.ownerId === perspective;

    });

    if (borders) return '#c0392b';

    return '#7f8c8d';

  },



  updateMapHeatLegend() {

    const legend = document.getElementById('mapHeatLegend');

    if (!legend) return;

    const mode = this.mapHeatMode || 'owner';

    const sw = (c, t) => `<span><span class="heat-sw" style="background:${c}"></span>${t}</span>`;

    if (mode === 'owner') {

      legend.innerHTML = '<span class="heat-note">各大名家の領国色</span>';

    } else if (mode === 'diplomacy') {

      const pers = this.getHeatPerspectiveClanId();

      const name = this.getClanFamilyName(pers) || '視点大名';

      legend.innerHTML = [

        `<span class="heat-note">視点:${name}</span>`,

        sw(this.brightenHexColor(this.getRegisteredProvinceColor({ ownerId: pers }) || '#d4af37', 25), '自勢力'),

        sw('#2f6fb5', '同盟'),

        sw('#7f8c8d', '中立'),

        sw('#c0392b', '敵対'),

        sw('#4a4a4a', '空白')

      ].join('');

    } else {

      const key = mode === 'rice' ? 'rice' : 'troops';

      const { min, max } = this.getHeatRange(key);

      const minText = key === 'rice' ? `${(min / 10).toFixed(1)}万石` : `${min.toLocaleString()}人`;
      const maxText = key === 'rice' ? `${(max / 10).toFixed(1)}万石` : `${max.toLocaleString()}人`;

      legend.innerHTML = `<span class="heat-num heat-num-${key}">${minText}</span><span class="heat-grad heat-grad-${key}" style="background:${this.heatRampCss(key)}"></span><span class="heat-num heat-num-${key}">${maxText}</span>`;

    }

  },



  getProvinceColor(p) {

    const mode = this.mapHeatMode || 'owner';

    if (mode === 'diplomacy') return this.getDiplomacyProvinceColor(p);

    if (mode === 'troops' || mode === 'rice') {

      if (!this._heatRangeCache || this._heatRangeCache.mode !== mode) {

        this._heatRangeCache = { mode, ...this.getHeatRange(mode) };

      }

      const { min, max } = this._heatRangeCache;

      const v = mode === 'troops' ? (Number(p.troops) || 0) : (Number(p.rice || p.kokudaka) || 0);

      return this.heatRampColor(max > min ? (v - min) / (max - min) : 0.5, mode);

    }

    if (!p.ownerId) {

      return '#3b322a'; // 空白地：落ち着いた無所属カラー

    }

    return this.getRegisteredProvinceColor(p);

  },



  // シナリオまたは大名家マスターに登録された、その大名固有の領国色,



  getRegisteredProvinceColor(p, raw = false) {

    if (!p || !p.ownerId) return '#3b322a';

    // 家督相続で登録家の旗色を用いる家（2026-10-11 bp）

    const lookOv = raw ? null : this.clanLookOverrides?.[p.ownerId];

    if (lookOv && lookOv.color) return lookOv.color;

    // 隣接しやすい勢力は、地図上で判別しやすい専用色を優先する。
    const mapColor = ((window.CLAN_MASTER || {})[p.ownerId] || {}).mapColor; // data/clans.json の mapColor（2026-11-14）
    if (mapColor) return mapColor;

    const scen = SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId));

    const playable = scen?.playables?.find(x => x.id === p.ownerId);

    if (playable && playable.color) return playable.color;



    const master = (window.CLAN_MASTER_DATA || CLAN_MASTER || {})[p.ownerId];

    if (master && master.color) return master.color;

    return '#5a4638';

  },



  // 家紋の記号が実際に定義されているか（kamons.js の内容、または画面上の symbol。どちらも無い環境では定義ありとみなす。2026-10-11 bt）

  kamonSymbolDefined(id) {

    if (!id) return false;

    const content = (typeof window !== 'undefined') ? window.KAMONS_SVG_CONTENT : null;

    let known = false;

    if (typeof content === 'string' && content.length) { known = true; if (content.includes(`id="${id}"`)) return true; }

    try {

      if (typeof document !== 'undefined') {

        if (document.getElementById && document.getElementById(id)) return true;

        if (document.querySelector && document.querySelector(`symbol[id="${id}"]`)) return true;

        if (document.querySelector && document.querySelector('symbol[id^="kamon-"]')) {

          known = true;

        }

      }

    } catch (e) {}

    return !known;

  },



  getClanKamonId(clanId, raw = false) {

    if (!clanId || clanId === 'null' || clanId === 'ronin') return 'kamon-default';

    // 家督相続で登録家の家紋を用いる家（2026-10-11 bp）

    const lookOv = raw ? null : this.clanLookOverrides?.[clanId];

    if (lookOv && lookOv.kamon) return lookOv.kamon;

    // 既存のシナリオ定義よりも、個別に調整した家紋背景を優先する。
    const fixedKamon = (window.CLAN_MASTER || {})[clanId]; // data/clans.json の kamonFixed（2026-11-14）
    if (fixedKamon && fixedKamon.kamonFixed && fixedKamon.kamon) return fixedKamon.kamon;



    // 勢力IDエイリアスの正規化

    if (clanId === 'anesanokoji' || clanId === 'anesakoji') clanId = 'anekoji';

    if (clanId === 'hattori') clanId = 'momochi';

    if (clanId === 'saika') clanId = 'suzuki';

    if (clanId === 'enomoto') clanId = 'goryokaku';

    let candidate = null;

    const scen = SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId));

    const playable = scen?.playables?.find(x => x.id === clanId);

    if (playable && playable.kamonSvgId && playable.kamonSvgId !== 'kamon-default') {

      candidate = playable.kamonSvgId.replace(/^#/, '');

    }



    if (!candidate) {

      const master = (window.CLAN_MASTER_DATA || CLAN_MASTER || {})[clanId];

      if (master && master.kamon) {

        candidate = master.kamon.replace(/^#/, '');

      } else {

        candidate = `kamon-${clanId}`;

      }

    }



    // 大名固有の家紋IDが特定できていればそれを最優先で返す

    // (非同期初期化やSVG外部シンボル参照環境でも各大名の家紋IDを確実に維持)

    if (candidate) {

      // 定義の無い家紋 ID は空白になるため既定の家紋に（2026-10-11 bt）

      return this.kamonSymbolDefined(candidate) ? candidate : 'kamon-default';

    }

    return 'kamon-default';

  },



  // 指定した領国に滞在している武将（城主・居城当主・本拠地待機家臣・浪人）を取得,



  getOfficersInProvince(provId) {

    const p = (this.provinces || []).find(x => x.id === provId);

    if (!p) return [];



    const activeList = (this.activeOfficers || this.officers || []).filter(o => !o.isDead);

    const result = [];

    const addedIds = new Set();



    const addOfficer = (off, roleCategory) => {

      if (!off || addedIds.has(off.id)) return;

      addedIds.add(off.id);

      result.push({

        officer: off,

        roleCategory: roleCategory // 'daimyo', 'governor', 'vassal', 'ronin'

      });

    };



    // 1. 城主 (governorId または assignedProvId)

    if (p.governorId) {

      const gov = activeList.find(o => o.id === p.governorId);

      if (gov && gov.clanId !== 'ronin' && gov.clanId === p.ownerId) {

        addOfficer(gov, gov.isDaimyo ? 'daimyo' : 'governor');

      }

    }

    activeList.forEach(o => {

      if (o.assignedProvId === p.id && o.clanId !== 'ronin') {

        const isGov = (p.governorId === o.id);

        addOfficer(o, o.isDaimyo ? 'daimyo' : (isGov ? 'governor' : 'vassal'));

      }

    });



    // 2. 本拠地・支城の待機家臣：

    // - 当該領国に滞在している待機家臣（拠点領国がこの国と一致）

    // - または本拠地の場合は、特定の支城に配属されていない一般待機家臣

    if (p.ownerId) {

      const isCapital = this.isCapitalProvince(p.id, p.ownerId);

      activeList.forEach(o => {

        if (o.clanId === p.ownerId) {

          if (o.isDaimyo) {

            if (!o.assignedProvId) {

              const home = this.getDaimyoHomeProvince(o);

              if ((home && home.id === p.id) || isCapital) {

                addOfficer(o, 'daimyo');

              }

            }

          } else if (!o.assignedProvId && (!p.governorId || p.governorId !== o.id)) {

            const baseProvId = this.officerBaseProvinceId(o);

            if (baseProvId === p.id) {

              addOfficer(o, 'vassal');

            } else if (!baseProvId && isCapital) {

              addOfficer(o, 'vassal');

            }

          }

        }

      });

    }



    // 3. この国に滞在している浪人 (defaultProv === p.id)

    activeList.forEach(o => {

      if (o.clanId === 'ronin' && o.defaultProv === p.id) {

        addOfficer(o, 'ronin');

      }

    });



    // 優先順ソート：当主(0) -> 城主(1) -> 家臣(2) -> 浪人(3)、同格なら武勇降順

    const rolePriority = { daimyo: 0, governor: 1, vassal: 2, ronin: 3 };

    result.sort((a, b) => {

      const pDiff = (rolePriority[a.roleCategory] ?? 99) - (rolePriority[b.roleCategory] ?? 99);

      if (pDiff !== 0) return pDiff;

      return (b.officer.military || 0) - (a.officer.military || 0);

    });



    return result.map(item => item.officer);

  },



  // 特定の領国に滞在している武将一覧モーダルを開く,



  isProvinceFrontier(p) {

    if (p.ownerId !== this.playerClanId) return false;

    return (p.neighbors || []).some(nId => {

      const neighbor = this.provinces.find(x => x.id === nId);

      return neighbor && neighbor.ownerId !== this.playerClanId;

    });

  },



  getGovernModeName(mode) {

    const map = {

      direct: '直轄',

      military: '軍事進攻型',

      domestic: '内政型',

      balanced: '均衡型',

      logistics: '兵站輸送型'

    };

    return map[mode] || '直轄';

  },



  getClanDisplayName(clanId) {

    if (!clanId || clanId === 'null' || clanId === 'undefined') return '空白地';

    if (clanId === 'ronin') return '浪人';



    // 1. ユーザー要件: 跡継ぎに大名が切り替わった場合、世継ぎ・新当主の氏名を最優先で返却！

    if (this.playerClanId === clanId && this.playerDaimyo?.name) {

      return this.playerDaimyo.name;

    }

    const currentDaimyo = (this.activeOfficers || this.officers || []).find(o => o.clanId === clanId && o.isDaimyo && !o.isDead);

    if (currentDaimyo && currentDaimyo.name) {

      return currentDaimyo.name;

    }



    // 2. 現在のシナリオのプレイアブル大名に完全一致するものがあればそれを優先

    const scen = SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId));

    const playable = scen?.playables?.find(x => x.id === clanId);

    if (playable && playable.name) return playable.name;



    // 3. 史実マスターデータから現在年以下の最新年代の当主名を取得

    const master = (window.CLAN_MASTER_DATA || CLAN_MASTER || {})[clanId];

    if (master) {

      if (master.leaders) {

        const curY = Number(this.year || (scen ? scen.year : 0));

        const validYears = Object.keys(master.leaders)

          .map(Number)

          .filter(y => !isNaN(y) && y <= curY)

          .sort((a, b) => b - a);

        if (validYears.length > 0) {

          return master.leaders[String(validYears[0])];

        }

        // 【修正】下の名前がない苗字(family)より前に、フルネーム(leaders.default)を優先

        if (master.leaders.default) return master.leaders.default;

        const allYears = Object.keys(master.leaders)

          .map(Number)

          .filter(y => !isNaN(y))

          .sort((a, b) => Math.abs(a - curY) - Math.abs(b - curY));

        if (allYears.length > 0) {

          return master.leaders[String(allYears[0])];

        }

        if (master.family) return master.family;

      }

      if (master.family) return master.family;

    }

    return clanId;

  },



  getKnownSurnames() {

    if (this._knownSurnames) return this._knownSurnames;

    const set = new Set([

      '長宗我部', '宇喜多', '龍造寺', '竜造寺', '宇都宮', '西園寺', '小笠原', '佐々木',

      '小早川', '佐渡本間', '北畠', '六角', '一色', '山名', '大内', '最上'

    ]);

    const master = window.CLAN_MASTER_DATA || CLAN_MASTER || {};

    Object.values(master).forEach(m => {

      if (!m || !m.family) return;

      const stem = String(m.family).replace(/(将軍家|幕府|政府|衆|党|家)$/, '');
      const stemChars = Array.from(stem);

      if (stemChars.length >= 2 && stemChars.length <= 5) set.add(stem);

      // 領国名などの接頭辞を除いた実際の姓も、史実当主名と照合して登録する。
      // 例: 「徳島藩蜂須賀家」→「蜂須賀正勝」から「蜂須賀」を取得する。
      Object.values(m.leaders || {}).forEach(leaderName => {
        if (typeof leaderName !== 'string') return;
        const maxLength = Math.min(5, stemChars.length, Array.from(leaderName).length - 1);
        for (let length = maxLength; length >= 2; length -= 1) {
          const candidate = stemChars.slice(-length).join('');
          if (leaderName.startsWith(candidate)) {
            set.add(candidate);
            break;
          }
        }
      });

    });

    this._knownSurnames = [...set].sort((a, b) => b.length - a.length);

    return this._knownSurnames;

  },



  // 当主名（氏名）から名字・家名を動的算出,



  extractFamilyNameFromLeader(fullName) {

    if (!fullName || fullName === '空白地' || fullName === '無所属' || fullName === '浪人') return fullName || '武家';

    for (const special of ['天皇', '上皇', '朝廷', '幕府', '政府', '首長']) {

      if (fullName.includes(special)) return fullName;

    }

    for (const surname of this.getKnownSurnames()) {

      if (fullName.startsWith(surname) && fullName.length > surname.length) return `${surname}家`;

    }

    if (fullName.length === 3) return `${fullName[0]}家`;

    if (fullName.length >= 4) return `${fullName.slice(0, 2)}家`;

    return `${fullName}家`;

  },



  getLivingDaimyoName(clanId) {

    const living = (this.activeOfficers || this.officers || []).find(o => o.clanId === clanId && o.isDaimyo && !o.isDead);

    if (living?.name) return living.name;

    if (this.playerClanId === clanId && this.playerDaimyo?.name) return this.playerDaimyo.name;

    return '';

  },



  familyStemOf(familyLabel) {

    if (!familyLabel) return '';

    return String(familyLabel).replace(/(将軍家|幕府|政府|衆|党|家)$/, '');

  },



  // その勢力の史実当主名簿（初期当主・年代別当主）に名があるか,



  isClanRosterLeader(clanId, name) {

    if (!name || !clanId) return false;

    const scen = SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId));

    const playable = scen?.playables?.find(x => x.id === clanId);

    if (playable && this.leaderNamesMatch(playable.name, name)) return true;

    const master = (window.CLAN_MASTER_DATA || CLAN_MASTER || {})[clanId];

    if (!master?.leaders) return false;

    return Object.values(master.leaders).some(n => typeof n === 'string' && this.leaderNamesMatch(n, name));

  },



  getClanFamilyName(clanId) {

    if (!clanId || clanId === 'null' || clanId === 'undefined') return '空白地';

    if (clanId === 'ronin') return '浪人';

    if (clanId === 'anesanokoji' || clanId === 'anesakoji') clanId = 'anekoji';

    if (clanId === 'hattori') clanId = 'momochi';

    if (clanId === 'saika') clanId = 'suzuki';

    if (clanId === 'enomoto') clanId = 'goryokaku';



    let currentLeaderName = this.getLivingDaimyoName(clanId);

    if (!currentLeaderName && this.lastDaimyoNames?.[clanId]) {

      currentLeaderName = this.lastDaimyoNames[clanId];

    }

    const foundingName = this.foundingLeaderNames?.[clanId];

    const scen = SCENARIOS.find(s => String(s.id) === String(this.currentScenarioId));

    const playable = scen?.playables?.find(x => x.id === clanId);

    const master = (window.CLAN_MASTER_DATA || CLAN_MASTER || {})[clanId];

    const canonical = (playable && playable.clan) || master?.family || '';



    if (currentLeaderName) {

      const sur = this.extractPersonSurname(currentLeaderName);

      const extracted = sur ? `${sur}家` : this.extractFamilyNameFromLeader(currentLeaderName);

      const stem = this.familyStemOf(canonical);

      const surGroup = this.surnameGroup(sur);

      const sameHouse = !!(stem && (currentLeaderName.startsWith(stem) || surGroup.includes(stem) || this.surnameGroup(stem).includes(sur)));

      const originalPerson = foundingName

        ? this.leaderNamesMatch(currentLeaderName, foundingName)

        : this.isClanRosterLeader(clanId, currentLeaderName);



      // 史実名簿（CLAN_MASTER_DATA.leaders）に載る後継者や、朝廷・在庁などの家名でない勢力名は、代替わりしても勢力名を保つ

      if (canonical && !originalPerson) {

        const rosterHeir = this.isClanRosterLeader(clanId, currentLeaderName);

        const institutional = /(朝廷|幕府|在庁|豪族|部族|上皇方|天皇方|院方)$/.test(canonical);

        if (rosterHeir || institutional) return canonical;

      }

      // 開幕時の当主は登録された家名を保つ。別家が継いだときだけ、その当主の名字を家名にする。

      if (!originalPerson && sur && stem && sur !== stem && surGroup.includes(stem)) return extracted;

      if (!originalPerson && !sameHouse) return extracted;

      if (canonical) return canonical;

      return extracted;

    }



    if (canonical) return canonical;

    const dName = this.getClanDisplayName(clanId);

    if (!dName || dName === '空白地' || dName === '無所属') return '空白地';

    return this.extractFamilyNameFromLeader(dName);

  },



  applyBatchGovernance(mode) {

    const checkboxes = document.querySelectorAll('.govern-select-cb:checked');

    if (checkboxes.length === 0) {

      Swal.fire({ icon: 'warning', title: '領国を選択してください', text: '一覧のチェックボックスで対象の領国を選択してください。', background: '#241710', color: '#fff' });

      return;

    }

    let count = 0;

    checkboxes.forEach(cb => {

      const p = this.provinces.find(x => x.id === cb.dataset.provId);

      if (p) {

        p.governance = mode;

        count++;

      }

    });

    this.renderGovernTable();

    this.audio.playHyoshigi();

    this.log(`【一括委任】${count}州の領国を「${this.getGovernModeName(mode)}」に一括設定しました。`, 'important');

  },



  applyPresetGovernance(presetType) {

    const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    let count = 0;



    myProvs.forEach(p => {

      const isFrontier = this.isProvinceFrontier(p);

      if (presetType === 'rear_domestic' && !isFrontier) {

        p.governance = 'domestic';

        count++;

      } else if (presetType === 'rear_logistics' && !isFrontier) {

        p.governance = 'logistics';

        count++;

      } else if (presetType === 'front_military' && isFrontier) {

        p.governance = 'military';

        count++;

      } else if (presetType === 'all_direct') {

        p.governance = 'direct';

        count++;

      }

    });



    this.renderGovernTable();

    this.audio.playHyoshigi();

    const names = {

      rear_domestic: '後方領地を全て【内政型】委任',

      rear_logistics: '後方領地を全て【兵站輸送型】委任',

      front_military: '前線国境領地を全て【軍事進攻型】委任（自律攻略）',

      all_direct: '全領国を【直轄】指揮'

    };

    this.log(`【方針一括適用】${names[presetType]} (${count}州) を実施しました。`, 'important');

    this.showOrderResult('📋 委任方針 適用', `${names[presetType]} (${count}州)`, '#ffd700');

  },
};
