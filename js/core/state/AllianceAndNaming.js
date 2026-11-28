/**
 * @file js/core/state/AllianceAndNaming.js - GameState から機能別に分割したメソッド群（50個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { ALLIANCE_DURATION_SEASONS, EVENT_CLAN_LINEAGE, SEASONS_PER_YEAR, legacySeasonCountToNew, legacySeasonIdxToNew } from '../GameStateShared.js?v=20261128_v74';

export const AllianceAndNamingMethods = {



  // ============================================================================

  // 空白地での旗揚げ・御家再興システム

  // 要望1: 空白地に過去に大名になったことのある武将がいれば、その武将が旗揚げして、その空白地で大名となるようにする

  // ============================================================================,



  appointHistoricalHomeGovernors(targetClanId = null) {

    if (!this.provinces || !this.activeOfficers) return 0;

    // ゲーム進行中（シナリオ切替中・観戦モード以外）は、プレイヤー勢力の人事権を尊重し自動任命・上書きを行わない
    if (!this._isSwitchingScenario && !this.isSpectatorMode && targetClanId === this.playerClanId) {
      return 0;
    }



    const clansToCheck = targetClanId 

      ? [targetClanId] 

      : [...new Set(this.provinces.map(p => p.ownerId).filter(Boolean))];



    let totalAppointed = 0;

    const pinnedGovs = (window.PINNED_SCENARIO_GOVERNORS && this.currentScenario)

      ? (window.PINNED_SCENARIO_GOVERNORS[String(this.currentScenario.id)] || {})

      : {};

    const scenGovMap = (window.SCENARIO_HISTORICAL_GOVERNORS && this.currentScenario)

      ? (window.SCENARIO_HISTORICAL_GOVERNORS[String(this.currentScenario.id)] || {})

      : {};

    const isHistGov = (provId, o) => {

      if (!provId || !o) return false;

      const target = scenGovMap[provId] || pinnedGovs[provId];

      return !!(target && (target === o.id || target === o.name));

    };



    for (const clanId of clansToCheck) {

      if (clanId === 'ronin' || clanId === 'null') continue;

      // ゲーム進行中はプレイヤー勢力の城主設定（手動任命・城代統治）を絶対に自動リセットしない
      if (!this._isSwitchingScenario && !this.isSpectatorMode && clanId === this.playerClanId) continue;



      // その勢力の待機武将（生存武将・一般武将）

      const waitingOfficers = this.activeOfficers.filter(o => 

        o.clanId === clanId && 

        !o.assignedProvId && 

        !o.isDaimyo && 

        !o.isDead &&

        !this.isCourtFigure(o) &&

        !o.isStandby && o.canBeGovernor !== false && o.id !== 'off_dm_amago_1560'

      );

      if (waitingOfficers.length === 0) continue;



      // その勢力が領有している全領国

      const ownedProvs = this.provinces.filter(p => p.ownerId === clanId);



      for (const off of waitingOfficers) {

        if (off.assignedProvId) continue;



        // この武将の歴史上本拠地

        const homeProvId = off.defaultProv;

        if (!homeProvId) continue;



        // 自勢力がその歴史上本拠地を領有しているか？

        const homeProv = ownedProvs.find(p => p.id === homeProvId);

        if (!homeProv) continue;



        // 大名居城（本拠地）は本拠親政ルールの対象なので、傘下武将は城主にならない

        if (this.isCapitalProvince(homeProv.id, clanId)) continue;



        // 現在の城主の確認

        const currentGovId = homeProv.governorId;

        const currentGov = currentGovId 

          ? this.activeOfficers.find(o => o.id === currentGovId && !o.isDead) 

          : null;

        // ゲーム進行中は、すでに城主がいる城には待機武将を上書きしない（空き城にのみ任命）
        if (!this._isSwitchingScenario && currentGov) {
          continue;
        }

        // もしすでに城主がいて、かつその城主もこの国を歴史上本拠地としているなら交代させない

        if (currentGov && currentGov.defaultProv === homeProv.id) {

          continue;

        }

        // 応仁の乱向け追加武将（off_onin2_）は、ゆかりの国による城主任命の対象外（既存の配置を変えないため）

        if (String(off.id).startsWith('off_onin2_')) {

          continue;

        }

        // 史実城代（SCENARIO_HISTORICAL_GOVERNORS / PINNED_SCENARIO_GOVERNORS）は、ゆかりの家臣でも交代させない

        if (currentGov && isHistGov(homeProv.id, currentGov)) {

          continue;

        }



        // 任命実行！

        if (currentGov) {

          currentGov.assignedProvId = null;

        }



        homeProv.governorId = off.id;

        off.assignedProvId = homeProv.id;

        totalAppointed++;



        const castleName = homeProv.castleName || homeProv.castle || '城';

        if (clanId === this.playerClanId) {

          this.log(`🏯【城主任命】${off.name}公は、歴史的本拠地である${homeProv.name}国（${castleName}）の城主に任命されました！(武${off.military} 内${off.politic} 謀${off.intel})`, 'important');

        } else {

          const clanName = this.getClanFamilyName(clanId);

          this.log(`🏯【城主任命】${clanName}は、${off.name}をその本拠地たる${homeProv.name}国（${castleName}）の城主に任命しました。`);

        }

      }

    }



    if (totalAppointed > 0) {

      this.updateUI();

    }



    return totalAppointed;

  },



  // 他勢力や空白地と接する支城。進出と守りがかかる前線。,



  isClanFrontline(p) {

    if (!p || !p.ownerId) return false;

    return (p.neighbors || []).some(nId => {

      const n = this.provinces.find(x => x.id === nId);

      return n && n.ownerId !== p.ownerId;

    });

  },



  frontlineWeight(p) {

    let borders = 0;

    (p.neighbors || []).forEach(nId => {

      const n = this.provinces.find(x => x.id === nId);

      if (n && n.ownerId !== p.ownerId) borders++;

    });

    return borders * 1000 + (Number(p.kokudaka) || 0);

  },



  // ゆかりの地の城主は動かさない。空いた前線へ戦力の高い家臣を、残った城へ政務向きの家臣を置く。,



  ensureClanCapitalsMatchMap() {

    if (!window.CLAN_CAPITAL_PROVINCES_BASE) {

      window.CLAN_CAPITAL_PROVINCES_BASE = JSON.parse(JSON.stringify(window.CLAN_CAPITAL_PROVINCES || {}));

    }

    window.CLAN_CAPITAL_PROVINCES = JSON.parse(JSON.stringify(window.CLAN_CAPITAL_PROVINCES_BASE));

    const scenCaps = (this.currentScenario && this.currentScenario.capitals) || {};

    const owners = [...new Set((this.provinces || []).map(p => p.ownerId).filter(Boolean))];

    owners.forEach(ownerId => {

      const owned = this.provinces.filter(p => p.ownerId === ownerId);

      if (owned.length === 0) return;

      // シナリオ本拠 → 時代別本拠（CLAN_CAPITAL_ERAS）→ 史実本拠（CLAN_CAPITAL_PROVINCES）の順に、領内にあるものを採る

      const candidates = [scenCaps[ownerId], ...this.eraCapitalCandidates(ownerId), window.CLAN_CAPITAL_PROVINCES_BASE[ownerId]].filter(Boolean);

      const registered = candidates.find(pid => owned.some(p => p.id === pid));

      if (registered) {

        window.CLAN_CAPITAL_PROVINCES[ownerId] = registered;

        return;

      }

      const home = this.pickFallbackCapital(owned, ownerId);

      if (home) window.CLAN_CAPITAL_PROVINCES[ownerId] = home.id;

    });

    Object.keys(scenCaps).forEach(clanId => {

      if (!owners.includes(clanId)) window.CLAN_CAPITAL_PROVINCES[clanId] = scenCaps[clanId];

    });

  },



  /** data.js の CLAN_CAPITAL_ERAS から、今の年までに移った本拠を新しい順に返す */



  eraCapitalCandidates(clanId) {

    const eras = (window.CLAN_CAPITAL_ERAS || {})[clanId];

    if (!Array.isArray(eras)) return [];

    const year = Number(this.year || (this.currentScenario && this.currentScenario.year) || 0);

    return eras.filter(e => Array.isArray(e) && Number(e[0]) <= year)

      .sort((a, b) => Number(b[0]) - Number(a[0]))

      .map(e => e[1]);

  },



  isCapitalProvince(provId, ownerId) {
    if (!ownerId || !provId) return false;
    const owned = (this.provinces || []).filter(p => p.ownerId === ownerId);
    if (!owned.some(p => p.id === provId)) return false;

    // 1. 当主（大名）自身が実際に居城（城主）として座っている国があれば、そこが唯一無二の本拠地
    const daimyo = (this.activeOfficers || this.officers || []).find(o => o.clanId === ownerId && o.isDaimyo && !o.isDead);
    if (daimyo) {
      const seatedProv = owned.find(p => p.governorId === daimyo.id || (daimyo.assignedProvId && p.id === daimyo.assignedProvId));
      if (seatedProv) {
        return seatedProv.id === provId;
      }
    }

    // 2. 勢力本拠地マスター・シナリオ定義（CLAN_CAPITAL_PROVINCES）
    const capitals = window.CLAN_CAPITAL_PROVINCES || {};
    const registered = capitals[ownerId];
    if (registered && owned.some(p => p.id === registered)) {
      return registered === provId;
    }

    // 3. フォールバック本拠地計算
    const home = this.pickFallbackCapital(owned, ownerId);
    return !!(home && home.id === provId);
  },



  allianceMembers(group) {

    if (!group) return [];

    if (Array.isArray(group)) {

      // 配列末尾の数は同盟期間（季）なのでメンバーから除く

      return group.filter(x => typeof x === 'string' && x);

    }

    return Array.isArray(group.members) ? group.members.filter(x => typeof x === 'string' && x) : [];

  },



  normalizeAlliances(raw, year, seasonIdx, defaultDuration, legacyUnits = false) {

    if (!Array.isArray(raw)) return [];

    const fallback = Number.isFinite(defaultDuration) ? defaultDuration : ALLIANCE_DURATION_SEASONS;

    return raw.map(group => {

      let durationSeasons = fallback;

      let formedYear = year;

      let formedSeason = seasonIdx;

      let members;

      if (Array.isArray(group)) {

        const ids = [];

        for (const x of group) {

          if (typeof x === 'number' && Number.isFinite(x) && x > 0) durationSeasons = legacyUnits ? legacySeasonCountToNew(x) : x;

          else if (typeof x === 'string' && x) ids.push(x);

        }

        members = [...new Set(ids)];

      } else {

        members = [...new Set(this.allianceMembers(group))];

        if (Number.isFinite(group.formedYear)) formedYear = group.formedYear;

        if (Number.isFinite(group.formedSeason)) formedSeason = legacyUnits ? legacySeasonIdxToNew(group.formedSeason) : group.formedSeason;

        if (Number.isFinite(group.durationSeasons)) durationSeasons = legacyUnits ? legacySeasonCountToNew(group.durationSeasons) : group.durationSeasons;

      }

      if (members.length < 2) return null;

      return { members, formedYear, formedSeason, durationSeasons, ...this.allianceExtra(group) };

    }).filter(Boolean);

  },



  // 同盟の種別（counter 対抗同盟 / truce 和睦 / vassal 臣従 / coalition 包囲網）と名目を、作り直す時に引き継ぐ

  allianceExtra(group) {

    if (!group || Array.isArray(group)) return {};

    const o = {};

    if (group.kind) o.kind = group.kind;

    if (group.label) o.label = group.label;

    return o;

  },



  allianceDurationOf(group) {

    const n = Number(!Array.isArray(group) && group ? group.durationSeasons : NaN);

    return Number.isFinite(n) && n > 0 ? n : ALLIANCE_DURATION_SEASONS;

  },



  isClanExtant(clanId) {

    if (!clanId) return false;

    return (this.provinces || []).some(p => p.ownerId === clanId);

  },



  // 史実イベントの受け取り先IDを、いま地図上にいる同じ当主・同じ家系の勢力へ寄せる。

  // 例: 保元シナリオで源義朝家を頼朝が継いでいる時、壇ノ浦の genji_yoritomo を別勢力として生やさない。,



  resolveEventTargetClan(clanId) {

    if (!clanId) return clanId;



    // ★追加特例：プレイヤーが「源義経」勢力で、かつ1185年（平家滅亡）までの場合のみ、

    // 頼朝宛てとなる平家討伐の領土を義経が直接受け取る。

    // （1189年の奥州合戦では、義経が横取りせず史実通り頼朝が受け取る）

    if (clanId === 'genji_yoritomo' && this.playerClanId === 'genji_yoshitsune' && this.year <= 1185) {

      return 'genji_yoshitsune';

    }



    if (this.isClanExtant(clanId)) return clanId;

    const leaderName = this.namedLordForClan ? this.namedLordForClan(clanId) : '';

    if (leaderName && !this.looksLikeClanId(leaderName)) {

      const lord = (this.activeOfficers || []).find(o =>

        o && !o.isDead && o.isDaimyo && o.name && this.isClanExtant(o.clanId)

        && this.leaderNamesMatch(o.name, leaderName)

      );

      if (lord) return lord.clanId;

    }



    // 2. 同じ家系の別ID（データ上の表記揺れ・家督継承）を探す

    const lineage = EVENT_CLAN_LINEAGE.find(group => group.includes(clanId));

    if (lineage) {

      const heir = lineage.find(id => id !== clanId && this.isClanExtant(id));

      if (heir) return heir;

    }

    // 3. 本能寺の変が起きず信長が健在なら、秀吉は織田家臣のまま。羽柴宛ての領地は織田へ

    if (clanId === 'toyotomi' && this.honnoujiAverted && this.isClanExtant('oda')) return 'oda';

    return clanId;

  },



  allianceClanLabel(clanId) {

    return this.getClanFamilyName(clanId);

  },



  allianceTurnsElapsed(group) {

    const formedYear = Array.isArray(group) ? this.year : (group.formedYear ?? this.year);

    const formedSeason = Array.isArray(group) ? this.seasonIdx : (group.formedSeason ?? this.seasonIdx);

    return (this.year - formedYear) * SEASONS_PER_YEAR + (this.seasonIdx - formedSeason);

  },



  getAllianceRemainingSeasons(clanA, clanB) {

    let best = -1;

    (this.alliances || []).forEach(group => {

      const members = this.allianceMembers(group);

      if (!members.includes(clanA) || !members.includes(clanB)) return;

      const left = this.allianceDurationOf(group) - this.allianceTurnsElapsed(group);

      if (left > best) best = left;

    });

    return best;

  },



  rememberAllianceBreak(members) {

    if (!this.allianceCooldown) this.allianceCooldown = {};

    const now = this.year * SEASONS_PER_YEAR + this.seasonIdx;

    for (let i = 0; i < members.length; i++) {

      for (let j = i + 1; j < members.length; j++) {

        const key = [members[i], members[j]].sort().join('|');

        this.allianceCooldown[key] = now;

      }

    }

  },



  logAllianceExpired(members, seasons) {

    const years = Math.max(1, Math.round((Number(seasons) || ALLIANCE_DURATION_SEASONS) / SEASONS_PER_YEAR));

    const span = years === 2 ? '二年' : years === 5 ? '五年' : `${years}年`;

    const living = members.filter(id => this.isClanExtant(id));

    if (members.includes(this.playerClanId)) {

      const others = living.filter(id => id !== this.playerClanId).map(id => this.allianceClanLabel(id));

      if (others.length > 0) {

        this.log(`⌛【同盟満期】${others.join('・')}との同盟は${span}の約定を満了し、解消されました。`, 'important');

      }

      return;

    }

    if (living.length >= 2) {

      const names = living.map(id => this.allianceClanLabel(id));

      this.log(`⌛【同盟満期】${names.join('・')}の同盟は${span}の約定を満了し、解消されました。`);

    }

  },



  // 滅亡大名を同盟から外し、二年（八季）を過ぎた盟約を解消する,



  maintainAlliances() {

    const next = [];

    (this.alliances || []).forEach(group => {

      const members = this.allianceMembers(group);

      const formedYear = Array.isArray(group) ? this.year : (group.formedYear ?? this.year);

      const formedSeason = Array.isArray(group) ? this.seasonIdx : (group.formedSeason ?? this.seasonIdx);

      const durationSeasons = this.allianceDurationOf(group);

      if (this.allianceTurnsElapsed({ formedYear, formedSeason }) >= durationSeasons) {

        this.logAllianceExpired(members, durationSeasons);

        this.rememberAllianceBreak(members);

        return;

      }

      const alive = members.filter(id => this.isClanExtant(id));

      const dead = members.filter(id => !this.isClanExtant(id));

      dead.forEach(id => {

        if (members.includes(this.playerClanId)) {

          this.log(`【同盟消滅】${this.allianceClanLabel(id)}が滅亡したため、同盟一覧から除かれました。`, 'important');

        }

      });

      if (alive.length >= 2) {

        next.push({ members: alive, formedYear, formedSeason, durationSeasons, ...this.allianceExtra(group) });

      }

    });

    this.alliances = next;

  },



  removeClanFromAlliances(clanId) {

    if (!clanId || !this.alliances) return;

    let playerLost = false;

    this.alliances = this.alliances.map(group => {

      const members = this.allianceMembers(group);

      if (!members.includes(clanId)) {

        return {

          members,

          formedYear: Array.isArray(group) ? this.year : (group.formedYear ?? this.year),

          formedSeason: Array.isArray(group) ? this.seasonIdx : (group.formedSeason ?? this.seasonIdx),

          durationSeasons: this.allianceDurationOf(group),

          ...this.allianceExtra(group)

        };

      }

      if (members.includes(this.playerClanId)) playerLost = true;

      const alive = members.filter(id => id !== clanId);

      if (alive.length < 2) return null;

      return {

        members: alive,

        formedYear: Array.isArray(group) ? this.year : (group.formedYear ?? this.year),

        formedSeason: Array.isArray(group) ? this.seasonIdx : (group.formedSeason ?? this.seasonIdx),

        durationSeasons: this.allianceDurationOf(group),

        ...this.allianceExtra(group)

      };

    }).filter(Boolean);

    if (playerLost) {

      this.log(`【同盟消滅】${this.allianceClanLabel(clanId)}が滅亡したため、同盟一覧から除かれました。`, 'important');

    }

  },



  clansShareBorder(clanA, clanB) {

    return (this.provinces || []).some(p => {

      if (p.ownerId !== clanA) return false;

      return (p.neighbors || []).some(nId => {

        const n = this.provinces.find(x => x.id === nId);

        return n && n.ownerId === clanB;

      });

    });

  },



  clanFeelsThreatened(clanId) {

    const mine = (this.provinces || []).filter(p => p.ownerId === clanId).length;

    if (mine === 0) return false;

    const neighbors = new Set();

    this.provinces.filter(p => p.ownerId === clanId).forEach(p => {

      (p.neighbors || []).forEach(nId => {

        const n = this.provinces.find(x => x.id === nId);

        if (n && n.ownerId && n.ownerId !== clanId) neighbors.add(n.ownerId);

      });

    });

    for (const nid of neighbors) {

      const nCount = this.provinces.filter(p => p.ownerId === nid).length;

      if (nCount >= mine + 2) return true;

    }

    return false;

  },



  // ---- 家中分裂の停戦（2026-10-11 cf）：本家は独立した家を breakawayTruceSeasons 季攻められない ----

  truceTurnIndex() { return (Number(this.year) || 0) * SEASONS_PER_YEAR + (Number(this.seasonIdx) || 0); },

  addBreakawayTruce(parentId, childId) {

    const n = Math.max(0, Math.round(Number((this.aiBalance ? this.aiBalance() : {}).breakawayTruceSeasons ?? 2) || 0));

    if (!n || !parentId || !childId || parentId === childId) return 0;

    this.breakawayTruces = (this.breakawayTruces || []).filter(t => !(t.parent === parentId && t.child === childId));

    this.breakawayTruces.push({ parent: parentId, child: childId, until: this.truceTurnIndex() + n });

    return n;

  },

  /** 残り季数（停戦中でなければ 0）。独立した季の残りと続く n 季 */

  breakawayTruceLeft(parentId, childId) {

    const now = this.truceTurnIndex();

    this.breakawayTruces = (this.breakawayTruces || []).filter(t => t && t.until >= now);

    const t = this.breakawayTruces.find(x => x.parent === parentId && x.child === childId);

    if (!t) return 0;

    if (this.isClanExtant && (!this.isClanExtant(parentId) || !this.isClanExtant(childId))) return 0;

    return Math.max(1, t.until - now);

  },

  isTruceBlocked(attackerId, defenderId) {

    if (!attackerId || !defenderId || attackerId === defenderId || !(this.breakawayTruces || []).length) return false;

    return this.breakawayTruceLeft(attackerId, defenderId) > 0;

  },

  /** 外交一覧用：この家が関わる停戦のタグ */

  breakawayTruceTags(clanId) {

    const now = this.truceTurnIndex();

    return (this.breakawayTruces || []).filter(t => t && t.until >= now && (t.parent === clanId || t.child === clanId))

      .map(t => {

        const other = t.parent === clanId ? t.child : t.parent;

        const left = this.breakawayTruceLeft(t.parent, t.child);

        if (!left) return '';

        const label = t.parent === clanId ? `${this.getClanFamilyName(other)}へ攻撃不可` : `本家${this.getClanFamilyName(other)}と停戦`;

        return `<span style="display:inline-block; margin:2px 3px; padding:2px 7px; border-radius:3px; font-size:11pt; background:rgba(127,140,141,0.3); color:#ddd;">🕊 ${label} 残${left}季</span>`;

      }).join('');

  },



  // 同盟関係の判定 (フェーズ2: 同盟システム),



  isAllied(clanA, clanB) {

    if (!clanA || !clanB || clanA === clanB) return false;

    if (!this.isClanExtant(clanA) || !this.isClanExtant(clanB)) return false;

    const alliances = this.alliances || [];

    return alliances.some(group => {

      const members = this.allianceMembers(group);

      return members.includes(clanA) && members.includes(clanB);

    });

  },



  // 同盟相手の取得（滅亡済み大名は含めない）,



  getAllies(clanId) {

    if (!clanId) return [];

    const alliances = this.alliances || [];

    const allies = new Set();

    alliances.forEach(group => {

      const members = this.allianceMembers(group);

      if (members.includes(clanId)) {

        members.forEach(id => {

          if (id !== clanId && this.isClanExtant(id)) allies.add(id);

        });

      }

    });

    return Array.from(allies);

  },



  // 同盟締結アクション,



  formAlliance(targetClanId, onComplete) {

    if (this.ap < 1) {

      this.showOrderResult('⚠ 行動力不足', '外交には行動力(AP)が1点必要です。次期ターンまでお待ちください。', '#e74c3c');

      return;

    }

    const costGold = 500;

    if (this.gold < costGold) {

      this.showOrderResult('⚠ 軍資金不足', `同盟締結の使者・結納の贈答費用として軍資金が${costGold}両必要です。`, '#e74c3c');

      return;

    }

    const targetName = this.getClanFamilyName(targetClanId);

    const targetDaimyo = this.getDaimyoLeaderName(targetClanId);



    const executeForm = () => {

      this.ap -= 1;

      this.gold -= costGold;



      if (!this.alliances) {

        this.alliances = this.normalizeAlliances(this.currentScenario?.alliances || [], this.year, this.seasonIdx, undefined, this.currentScenario?.seasonScheme !== SEASONS_PER_YEAR);

      }



      if (!this.isAllied(this.playerClanId, targetClanId)) {

        this.alliances.push({

          members: [this.playerClanId, targetClanId],

          formedYear: this.year,

          formedSeason: this.seasonIdx

        });

      }



      this.updateUI();

      this.audio?.playFanfare();

      this.log(`🤝【同盟締結】${targetName}（当主・${targetDaimyo}公）と固い同盟の契りを結びました！二年間は相互に攻撃不可となり、防衛戦での援軍出兵が行われます。`, 'important');

      this.autoSave();

      if (onComplete) onComplete();

      this.showOrderResult('🤝 同盟締結 成功', `${targetName}（当主：${targetDaimyo}公）との同盟が成立しました！\n\n・相互に領国への攻撃が不可となります\n・合戦時に隣接領国から援軍として参陣します\n・約定は二年（八季）で自然に解消されます`, 'var(--gold-bright)');

    };



    if (typeof Swal !== 'undefined') {

      Swal.fire({

        title: '【同盟締結の使者】',

        html: `<div style="text-align:left; font-size:12pt; line-height:1.6; color:#ddd;">

                 <p><strong style="color:var(--gold-bright);">${targetName}</strong>（当主：${targetDaimyo}公）に使者を派遣し、同盟を締結しますか？</p>

                 <div style="background:rgba(0,0,0,0.4); padding:10px 14px; border-radius:5px; border-left:3px solid var(--gold); margin-top:10px;">

                   <div>💰 贈答費用: <strong style="color:#ffd700;">金${costGold}両</strong> (所持金: ${this.gold}両)</div>

                   <div>⚡ 消費行動力: <strong style="color:#5dade2;">AP 1点</strong> (残AP: ${this.ap})</div>

                   <div style="margin-top:6px; color:#2ecc71;">🛡️ 効果: 相互不可侵 ＆ 合戦時の援軍協力（二年で解消）</div>

                 </div>

               </div>`,

        icon: 'question',

        background: '#1b140e',

        color: '#f5eedc',

        showCancelButton: true,

        confirmButtonColor: '#27ae60',

        cancelButtonColor: '#555',

        confirmButtonText: '同盟を結ぶ',

        cancelButtonText: '取りやめる'

      }).then((result) => {

        if (result.isConfirmed) {

          executeForm();

        }

      });

    } else {

      if (confirm(`${targetName}（当主：${targetDaimyo}公）と同盟を締結しますか？（金${costGold}両・AP 1点消費）`)) {

        executeForm();

      }

    }

  },



  // 同盟破棄アクション,



  breakAlliance(targetClanId, onComplete) {

    if (this.ap < 1) {

      this.showOrderResult('⚠ 行動力不足', '同盟破棄には使者を送るため行動力(AP)が1点必要です。', '#e74c3c');

      return;

    }

    const targetName = this.getClanFamilyName(targetClanId);

    const targetDaimyo = this.getDaimyoLeaderName(targetClanId);



    const executeBreak = () => {

      this.ap -= 1;



      if (this.alliances) {

        const brokenPairs = [];

        this.alliances = this.alliances.map(group => {

          const members = this.allianceMembers(group);

          if (members.includes(this.playerClanId) && members.includes(targetClanId)) {

            brokenPairs.push(members);

            const nextMembers = members.filter(id => id !== targetClanId);

            if (nextMembers.length < 2) return null;

            return {

              members: nextMembers,

              formedYear: Array.isArray(group) ? this.year : (group.formedYear ?? this.year),

              formedSeason: Array.isArray(group) ? this.seasonIdx : (group.formedSeason ?? this.seasonIdx),

              durationSeasons: this.allianceDurationOf(group),

              ...this.allianceExtra(group)

            };

          }

          return {

            members,

            formedYear: Array.isArray(group) ? this.year : (group.formedYear ?? this.year),

            formedSeason: Array.isArray(group) ? this.seasonIdx : (group.formedSeason ?? this.seasonIdx),

            durationSeasons: this.allianceDurationOf(group),

            ...this.allianceExtra(group)

          };

        }).filter(Boolean);

        brokenPairs.forEach(members => this.rememberAllianceBreak(members));

      }



      this.updateUI();

      this.audio?.playHyoshigi();

      this.log(`⚡【同盟破棄・手切れ】${targetName}（当主・${targetDaimyo}公）との同盟を一方的に破棄しました！両家は手切れとなり、交戦状態に入りました。`, 'important');

      this.autoSave();

      if (onComplete) onComplete();

      this.showOrderResult('⚡ 手切れ・同盟破棄', `${targetName}との同盟を破棄しました。\n両家は手切れとなり、互いの領国への侵攻が可能となります。`, '#e74c3c');

    };



    if (typeof Swal !== 'undefined') {

      Swal.fire({

        title: '【同盟破棄の確認】',

        html: `<div style="text-align:left; font-size:12pt; line-height:1.6; color:#ddd;">

                 <p>本当に <strong style="color:var(--gold-bright);">${targetName}</strong>（当主：${targetDaimyo}公）との同盟を破棄しますか？</p>

                 <div style="background:rgba(192,57,43,0.15); padding:10px 14px; border-radius:5px; border-left:3px solid #e74c3c; margin-top:10px;">

                   <div>⚡ 消費行動力: <strong style="color:#5dade2;">AP 1点</strong> (残AP: ${this.ap})</div>

                   <div style="margin-top:6px; color:#ff6b6b;">⚠ 警告: 同盟破棄により両家は手切れとなり、互いに領国への武力侵攻が可能となります。</div>

                 </div>

               </div>`,

        icon: 'warning',

        background: '#1b140e',

        color: '#f5eedc',

        showCancelButton: true,

        confirmButtonColor: '#c0392b',

        cancelButtonColor: '#555',

        confirmButtonText: '同盟を破棄する',

        cancelButtonText: '取りやめる'

      }).then((result) => {

        if (result.isConfirmed) {

          executeBreak();

        }

      });

    } else {

      if (confirm(`本当に${targetName}との同盟を破棄しますか？\n両家は手切れとなり、交戦状態に入ります。`)) {

        executeBreak();

      }

    }

  },



  getDaimyoLeaderName(ownerId) {

    if (!ownerId || ownerId === 'null' || ownerId === 'undefined') return '空白地';



    // 1. 生存中の大名武将を最優先（複数いれば pickClanLeader で一意に）

    const currentDaimyo = this.getClanDaimyoOfficer(ownerId);

    if (currentDaimyo && currentDaimyo.name) return currentDaimyo.name;



    const profile = (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA[ownerId]) ? window.CLAN_MASTER_DATA[ownerId] : null;

    if (profile && profile.leaders) {

      const curY = Number(this.year || 0);

      // curY 以下の年代キーを降順ソートし、最も近い年代の史実当主名を取得

      const validYears = Object.keys(profile.leaders)

        .map(Number)

        .filter(y => !isNaN(y) && y <= curY)

        .sort((a, b) => b - a);

      if (validYears.length > 0) {

        return profile.leaders[String(validYears[0])];

      }

      // 【修正】下の名前がない苗字(family)より前に、フルネーム(leaders.default)を最優先で返却

      if (profile.leaders.default) return profile.leaders.default;

      // 年代が合致しない場合でも、登録されている全年代の中から最も近いフルネームを取得

      const allYears = Object.keys(profile.leaders)

        .map(Number)

        .filter(y => !isNaN(y))

        .sort((a, b) => Math.abs(a - curY) - Math.abs(b - curY));

      if (allYears.length > 0) {

        return profile.leaders[String(allYears[0])];

      }

      if (profile.family) return profile.family;

    }

    return this.getClanDisplayName(ownerId);

  },



  // 豊臣姓・羽柴姓の年代連動切り替え（史実: 天正14年(1586年)に正親町天皇より豊臣姓を賜姓）,



  updateToyotomiSurname(announce = false) {

    const isToyotomiEra = (this.year >= 1586);

    const targetSurname = isToyotomiEra ? '豊臣' : '羽柴';

    const oldSurname = isToyotomiEra ? '羽柴' : '豊臣';



    // 1. 武将名の更新 (activeOfficers & OFFICERS_MASTER)

    const allOffs = [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])];

    allOffs.forEach(o => {

      if (!o.name) return;

      // 改姓対象は data.js の TOYOTOMI_SURNAME_OFFICERS（ID→名）だけ。苗字の前方一致では選ばない

      const toyoGiven = (window.TOYOTOMI_SURNAME_OFFICERS || {})[o.id];

      if (toyoGiven) {

        o.name = `${targetSurname}${toyoGiven}`;

      } else if (o.id === 'off_tokugawa_ieyasu') {

        // 永禄6年（1563）に元康から家康へ改名。同一人物を二枚にしない

        o.name = (this.year >= 1567) ? '徳川家康' : ((this.year >= 1563) ? '松平家康' : '松平元康');

      }

    });



    // 徳川家康の改名連動（桶狭間の戦い・自立連動）

    this.updateTokugawaSurname(announce);



    // 上杉謙信（長尾景虎）の改名連動（1561年の関東管領就任・上杉改姓）

    this.updateKenshinName(announce);

    // 固有の改名イベント処理後に、名簿用の年代別表記を再同期する。
    this.applyEraOfficerNames();



    // 2. プレイヤー大名情報の更新

    if (this.playerClanId === 'toyotomi') {

      if (this.playerDaimyo) {

        this.playerDaimyo.clan = `${targetSurname}家`;

        const playerHideIds = ['off_toyotomi_hideyoshi', 'off_toyotomi_hidenaga'];

        if (playerHideIds.includes(this.playerDaimyo.officerId)) {

          this.playerDaimyo.name = `${targetSurname}` + (this.playerDaimyo.officerId === 'off_toyotomi_hidenaga' ? '秀長' : '秀吉');

        }

      }

    }



    // 3. CLAN_MASTER_DATA の更新

    if (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA['toyotomi']) {

      window.CLAN_MASTER_DATA['toyotomi'].family = `${targetSurname}家`;

      if (window.CLAN_MASTER_DATA['toyotomi'].leaders) {

        window.CLAN_MASTER_DATA['toyotomi'].leaders.default = `${targetSurname}秀吉`;

      }

    }



    // 4. プレイアブル大名リストの更新

    if (this.currentScenario && this.currentScenario.playables) {

      const pToyo = this.currentScenario.playables.find(d => d.id === 'toyotomi');

      if (pToyo) {

        pToyo.clan = `${targetSurname}家`;

        if (pToyo.officerId === 'off_toyotomi_hidenaga') {

          pToyo.name = `${targetSurname}秀長`;

        } else {

          pToyo.name = `${targetSurname}秀吉`;

        }

      }

    }



    // 5. 1585 -> 1586 年越しの改姓アナウンス

    if (announce && this.year === 1586) {

      this.log('👑【豊臣賜姓】羽柴秀吉公は朝廷より「豊臣」の姓を賜りました！羽柴家はこれより「豊臣家」となり天下平定の総仕上げへ邁進します。', 'important');

      if (this.audio) this.audio.playHyoshigi();

    }



    this.updateKiyohiraSurname(false);

    this.updateTenmuEnthronement(false);

    this.updateJimmuEnthronement(false);

    this.updateClanNameEras(announce);

  },



  // 大海人皇子は天武2年（673）春、飛鳥浄御原宮にて即位し第40代・天武天皇となる

  oamaInTenmuEra() {

    if (this.tenmuEnthronementDeclined) return false;

    if (this.tenmuEnthronementAccepted) return true;

    const y = Number(this.year);

    if (y > 673 && y < 710) return true;

    if (y === 673 && Number(this.seasonIdx) >= 1) return true;

    return false;

  },



  updateTenmuEnthronement(announce = false) {

    const isTenmuEra = this.oamaInTenmuEra();

    const targetName = isTenmuEra ? '天武天皇' : '大海人皇子';

    const targetWifeName = isTenmuEra ? '鵜野讚良皇后' : '鵜野讚良皇女';

    const targetClanName = isTenmuEra ? '飛鳥朝廷' : '大海人皇子軍';



    // 1. 武将名の更新 (activeOfficers & OFFICERS_MASTER)

    const allOffs = [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])];

    const seen = new Set();

    allOffs.forEach(o => {

      if (!o || seen.has(o)) return;

      seen.add(o);

      if (o.id === 'off_oama_prince') {

        o.name = targetName;

      } else if (o.id === 'off_unosarara') {

        o.name = targetWifeName;

      }

    });



    // 2. プレイヤー大名情報の更新

    if (this.playerClanId === 'oama' && this.playerDaimyo) {

      if (!this.playerDaimyo._origClan) this.playerDaimyo._origClan = this.playerDaimyo.clan || '大海人皇子軍';

      if (!this.playerDaimyo._origCrest) this.playerDaimyo._origCrest = this.playerDaimyo.crest || '海';

      if (this.playerDaimyo.officerId === 'off_oama_prince' || (this.playerDaimyo.name && this.leaderNamesMatch(this.playerDaimyo.name, '大海人皇子'))) {

        this.playerDaimyo.name = targetName;

      }

      if (isTenmuEra) {

        this.playerDaimyo.clan = '飛鳥朝廷';

        this.playerDaimyo.crest = '飛';

        this.playerDaimyo.tactic = '八色の姓・皇親政治';

        this.playerDaimyo.tacticDesc = '天武天皇の絶対的皇威と八色の姓の秩序により、全軍の士気・攻撃力・内政効率を最大化する。';

        this.playerDaimyo.desc = '壬申の乱を勝ち抜き飛鳥浄御原宮にて即位した第40代・天武天皇。皇后・鵜野讚良や高市皇子らとともに皇親政治を推進し、律令国家を建設する。';

      } else {

        this.playerDaimyo.clan = this.playerDaimyo._origClan || '大海人皇子軍';

        this.playerDaimyo.crest = this.playerDaimyo._origCrest || '海';

      }

    }



    // 3. プレイアブル大名リストの更新

    if (this.currentScenario && this.currentScenario.playables) {

      const pOama = this.currentScenario.playables.find(d => d.id === 'oama');

      if (pOama) {

        pOama.name = targetName;

        pOama.clan = targetClanName;

        pOama.crest = isTenmuEra ? '飛' : '海';

        if (isTenmuEra) {

          pOama.tactic = '八色の姓・皇親政治';

          pOama.tacticDesc = '天武天皇の絶対的皇威と八色の姓の秩序により、全軍の士気・攻撃力・内政効率を最大化する。';

          pOama.desc = '壬申の乱を勝ち抜き飛鳥浄御原宮にて即位した第40代・天武天皇。皇后・鵜野讚良や高市皇子らとともに皇親政治を推進し、律令国家を建設する。';

        }

      }

    }



    // 4. CLAN_MASTER_DATA の更新

    if (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA.oama) {

      const master = window.CLAN_MASTER_DATA.oama;

      master.family = targetClanName;

      master.tactic = isTenmuEra ? '八色の姓・皇親政治' : '吉野雷動の神算';

      master.tacticDesc = isTenmuEra

        ? '天武天皇の絶対的皇威と八色の姓の秩序により、全軍の士気・攻撃力・内政効率を最大化する。'

        : '不破関を封鎖し東国軍団を神速で統率。味方部隊の攻撃力と移動力を大幅に引き上げ、敵部隊の士気を挫く。';

      if (master.leaders) {

        master.leaders['672'] = targetName;

        master.leaders.default = targetName;

      }

    }



    // 5. アナウンス

    if (announce && isTenmuEra && !this._tenmuAnnounced) {

      this._tenmuAnnounced = true;

      this.log('👑【天武天皇即位】大海人皇子は飛鳥浄御原宮にて高御座に昇り、第40代「天武天皇」として即位しました！これより「飛鳥朝廷」を称し、律令国家の礎を築きます。', 'important');

      if (this.audio) this.audio.playHyoshigi();

    }

  },



  // 神武天皇は辛酉年（前660）春正月、畝傍山東南の橿原宮にて即位し初代天皇となる

  jimmuInTennoEra() {

    if (this.jimmuEnthronementDeclined) return false;

    if (this.jimmuEnthronementAccepted) return true;

    const y = Number(this.year);

    if (y > -660) return true;

    if (y === -660 && Number(this.seasonIdx) >= 1) return true;

    return false;

  },



  updateJimmuEnthronement(announce = false) {

    const isJimmuTennoEra = this.jimmuInTennoEra();

    const targetLeaderName = isJimmuTennoEra ? '神武天皇' : '神日本磐余彦尊';

    const targetEmpressName = isJimmuTennoEra ? '五十鈴媛皇后' : '媛蹈鞴五十鈴媛命';

    const targetClanName = isJimmuTennoEra ? '大和朝廷' : '神武東征軍';

    const targetCrest = isJimmuTennoEra ? '皇' : '神';

    const targetTactic = isJimmuTennoEra ? '八紘一宇・建国の詔' : '金鵄の神光と八咫烏';

    const targetTacticDesc = isJimmuTennoEra

      ? '畝傍山東南・橿原宮にて初代・神武天皇として即位。「八紘を掩いて宇と為む」と宣べ、全領国の治安・民忠を最大化し、全軍の攻撃力・守備力を飛躍的に向上させる。'

      : '日輪・金鵄の神威と八咫烏の導きにより、味方全軍の士気・攻撃力・行軍速度を飛躍的に高め、敵の奇策を無力化する。';

    const targetDesc = isJimmuTennoEra

      ? '畝傍山東南の橿原宮にて初代・神武天皇として即位。皇后・媛蹈鞴五十鈴媛命や道臣命・大久米命・宇摩志麻治命らとともに大和朝廷を開き、日本建国の基盤を定めた。'

      : '天孫瓊瓊杵尊の曾孫・神日本磐余彦尊（神武天皇）が率いる東征皇軍。日向を進発し、吉備・浪速を経て大和の平定を目指す。';



    // 1. 武将名の更新 (activeOfficers & OFFICERS_MASTER)

    const allOffs = [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])];

    const seen = new Set();

    allOffs.forEach(o => {

      if (!o || seen.has(o)) return;

      seen.add(o);

      if (o.id === 'off_jimmu') {

        o.name = targetLeaderName;

      } else if (o.id === 'off_isuzuhime') {

        o.name = targetEmpressName;

      }

    });



    // 2. プレイヤー大名情報の更新

    if (this.playerClanId === 'jimmu' && this.playerDaimyo) {

      if (!this.playerDaimyo._origClan) this.playerDaimyo._origClan = this.playerDaimyo.clan || '神武東征軍';

      if (!this.playerDaimyo._origCrest) this.playerDaimyo._origCrest = this.playerDaimyo.crest || '神';

      if (this.playerDaimyo.officerId === 'off_jimmu' || (this.playerDaimyo.name && (this.leaderNamesMatch(this.playerDaimyo.name, '神武天皇') || this.leaderNamesMatch(this.playerDaimyo.name, '神日本磐余彦尊')))) {

        this.playerDaimyo.name = targetLeaderName;

      }

      if (isJimmuTennoEra) {

        this.playerDaimyo.clan = targetClanName;

        this.playerDaimyo.crest = targetCrest;

        this.playerDaimyo.tactic = targetTactic;

        this.playerDaimyo.tacticDesc = targetTacticDesc;

        this.playerDaimyo.desc = targetDesc;

      } else {

        this.playerDaimyo.clan = this.playerDaimyo._origClan || '神武東征軍';

        this.playerDaimyo.crest = this.playerDaimyo._origCrest || '神';

        this.playerDaimyo.tactic = targetTactic;

        this.playerDaimyo.tacticDesc = targetTacticDesc;

        this.playerDaimyo.desc = targetDesc;

      }

    }



    // 3. プレイアブル大名リストの更新

    if (this.currentScenario && this.currentScenario.playables) {

      const pJimmu = this.currentScenario.playables.find(d => d.id === 'jimmu');

      if (pJimmu) {

        pJimmu.name = targetLeaderName;

        pJimmu.clan = targetClanName;

        pJimmu.crest = targetCrest;

        pJimmu.tactic = targetTactic;

        pJimmu.tacticDesc = targetTacticDesc;

        pJimmu.desc = targetDesc;

      }

    }



    // 4. CLAN_MASTER_DATA の更新

    if (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA.jimmu) {

      const master = window.CLAN_MASTER_DATA.jimmu;

      master.family = targetClanName;

      master.tactic = targetTactic;

      master.tacticDesc = targetTacticDesc;

      master.desc = targetDesc;

      if (master.leaders) {

        master.leaders['-663'] = targetLeaderName;

        master.leaders.default = targetLeaderName;

      }

    }



    // 5. アナウンス

    if (announce && isJimmuTennoEra && !this._jimmuAnnounced) {

      this._jimmuAnnounced = true;

      this.log('👑【神武天皇即位・橿原建国】神日本磐余彦尊は畝傍山東南の橿原宮にて初代「神武天皇」として即位しました！「八紘一宇」を宣し「大和朝廷」を開創、日本の建国がここに成りました！', 'important');

      if (this.audio) this.audio.playHyoshigi();

    }

  },



  // 清原清衡は寛治2年（1088）春、実父藤原経清の姓に復して藤原清衡となる,



  kiyohiraInFujiwaraEra() {

    if (this.kiyohiraSurnameDeclined) return false;

    if (this.kiyohiraFujiwaraAccepted) return true;

    const y = Number(this.year);

    // 史実: 寛治2年(1088年)春以降、または1087年冬金沢柵陥落後

    if (y > 1088) return true;

    // 1088年春は復姓イベントで決める。決断前に名前だけ先に変えない

    if (y === 1088 && Number(this.seasonIdx) >= 1) return true;

    return false;

  },



  updateKiyohiraSurname(announce = false) {

    const isFujiwaraEra = this.kiyohiraInFujiwaraEra();

    const targetName = isFujiwaraEra ? '藤原清衡' : '清原清衡';



    // 1. 武将名の更新 (activeOfficers & OFFICERS_MASTER)

    const allOffs = [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])];

    const seen = new Set();

    allOffs.forEach(o => {

      if (!o || seen.has(o)) return;

      seen.add(o);

      if (this.officerIdIn(o, window.KIYOHIRA_OFFICER_IDS || ['off_fujiwara_kiyohira'])) {

        o.name = targetName;

      }

    });



    // 2. プレイヤー大名情報の更新

    if (this.playerClanId === 'kiyohara') {

      if (this.playerDaimyo) {

        if (!this.playerDaimyo._origClan) this.playerDaimyo._origClan = this.playerDaimyo.clan;

        if (!this.playerDaimyo._origCrest) this.playerDaimyo._origCrest = this.playerDaimyo.crest;

        if (!this.playerDaimyo._origKamon) this.playerDaimyo._origKamon = this.playerDaimyo.kamonSvgId;

        if (!this.playerDaimyo._origColor) this.playerDaimyo._origColor = this.playerDaimyo.color;



        if (this.playerDaimyo.name && this.leaderNamesMatch(this.playerDaimyo.name, '清原清衡')) {

          this.playerDaimyo.name = targetName;

        }

        if (isFujiwaraEra) {

          this.playerDaimyo.clan = '奥州藤原氏';

          this.playerDaimyo.crest = '奥州藤原氏';

          this.playerDaimyo.kamonSvgId = 'kamon-fujiwara';

          this.playerDaimyo.color = '#d4ac0d';

          this.playerDaimyo.desc = '安倍頼時の孫で藤原経清の子。後三年の役を経て実父の藤原姓へ復姓し、平泉に奥州藤原氏百年の黄金文化を築いた。';

        } else {

          this.playerDaimyo.clan = this.playerDaimyo._origClan || '清原清衡党';

          this.playerDaimyo.crest = this.playerDaimyo._origCrest || '清原清衡党';

          this.playerDaimyo.kamonSvgId = this.playerDaimyo._origKamon || 'kamon-kiyohara';

          this.playerDaimyo.color = this.playerDaimyo._origColor || '#4a235a';

        }

      }

    }



    // 3. プレイアブル大名リストの更新

    if (this.currentScenario && this.currentScenario.playables) {

      const pKiyo = this.currentScenario.playables.find(d =>

        d.id === 'kiyohara' && d.name && this.leaderNamesMatch(d.name, '清原清衡')

      );

      if (pKiyo) {

        if (!pKiyo._origClan) pKiyo._origClan = pKiyo.clan;

        if (!pKiyo._origCrest) pKiyo._origCrest = pKiyo.crest;

        if (!pKiyo._origKamon) pKiyo._origKamon = pKiyo.kamonSvgId;

        if (!pKiyo._origColor) pKiyo._origColor = pKiyo.color;

        pKiyo.name = targetName;

        if (isFujiwaraEra) {

          pKiyo.clan = '奥州藤原氏';

          pKiyo.crest = '奥州藤原氏';

          pKiyo.kamonSvgId = 'kamon-fujiwara';

          pKiyo.color = '#d4ac0d';

          pKiyo.tactic = '黄金王国の威風';

          pKiyo.tacticDesc = '莫大な砂金と名馬の富により全軍の装備と士気を最大化する。';

          pKiyo.desc = '安倍頼時の孫で藤原経清の子。後三年の役を経て実父の藤原姓へ復姓し、平泉に奥州藤原氏百年の黄金文化を築いた。';

        } else {

          pKiyo.clan = pKiyo._origClan;

          pKiyo.crest = pKiyo._origCrest;

          pKiyo.kamonSvgId = pKiyo._origKamon;

          pKiyo.color = pKiyo._origColor || '#4a235a';

        }

      }

    }



    // 4. CLAN_MASTER_DATA の更新

    if (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA.kiyohara) {

      const master = window.CLAN_MASTER_DATA.kiyohara;

      if (!master._origFamily) master._origFamily = master.family;

      if (!master._origKamon) master._origKamon = master.kamon;

      if (!master._origColor) master._origColor = master.color;

      const scenarioLeaderIsKiyohira = !!(this.currentScenario && this.currentScenario.playables &&

        this.currentScenario.playables.some(d => d.id === 'kiyohara' && d.name && this.leaderNamesMatch(d.name, '清原清衡')));

      if (isFujiwaraEra && scenarioLeaderIsKiyohira) {

        master.family = '奥州藤原氏';

        master.kamon = 'kamon-fujiwara';

        master.color = '#d4ac0d';

        master.tactic = '黄金王国の威風';

        master.tacticDesc = '莫大な砂金と名馬の富により全軍の装備と士気を最大化する。';

        master.desc = '平泉に三代百年の黄金文化を築いた奥州藤原氏。清衡・基衡・秀衡が陸奥・出羽十七万石の独立王国を支配した。';

        if (master.leaders) {

          master.leaders['1088'] = '藤原清衡';

          master.leaders.default = '藤原清衡';

        }

      } else if (!isFujiwaraEra && scenarioLeaderIsKiyohira) {

        master.family = master._origFamily || '清原氏';

        master.kamon = master._origKamon || 'kamon-kiyohara';

        master.color = master._origColor || '#4a235a';

      }

    }



    // 5. アナウンス

    if (announce && isFujiwaraEra && !this._kiyohiraAnnounced) {

      this._kiyohiraAnnounced = true;

      this.log('👑【藤原復姓】清原清衡公は実父・藤原経清の姓に復し、「藤原清衡」と改姓しました。奥羽の主はこれより奥州藤原氏を称します。', 'important');

      if (this.audio) this.audio.playHyoshigi();

    }

  },



  // 改姓で家名が変わる家（data.js の CLAN_NAME_ERAS）。勢力IDは同じまま、年代で家名・当主名を切り替える

  // 例：大浦家（〜1589）→ 津軽家（1590〜）。年越し・シナリオ開始・ロード時に呼ぶ

  updateClanNameEras(announce = false) {

    const eras = window.CLAN_NAME_ERAS || {};

    const y = Number(this.year);

    Object.keys(eras).forEach(cid => {

      const e = eras[cid];

      if (!e || !e.switchYear) return;

      const before = y < Number(e.switchYear);

      const st = before ? e.before : e.after;

      if (!st) return;

      const master = (window.CLAN_MASTER_DATA || {})[cid];

      const prevFamily = master ? master.family : null;

      if (master && st.family) master.family = st.family;

      const names = st.officers || {};

      [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])].forEach(o => {

        if (o && names[o.id]) o.name = names[o.id];

      });

      const pl = this.currentScenario?.playables?.find(d => d.id === cid);

      if (pl) {

        if (st.family) pl.clan = st.family;

        if (pl.officerId && names[pl.officerId]) pl.name = names[pl.officerId];

      }

      if (this.playerClanId === cid && this.playerDaimyo) {

        if (st.family) this.playerDaimyo.clan = st.family;

        if (this.playerDaimyo.officerId && names[this.playerDaimyo.officerId]) this.playerDaimyo.name = names[this.playerDaimyo.officerId];

      }

      if (this.lastDaimyoNames && this.lastDaimyoNames[cid] && Object.values(e.before.officers || {}).concat(Object.values(e.after.officers || {})).includes(this.lastDaimyoNames[cid])) {

        const oid = Object.keys(names).find(id => (this.activeOfficers || []).some(o => o.id === id && o.isDaimyo && o.clanId === cid));

        if (oid) this.lastDaimyoNames[cid] = names[oid];

      }

      if (announce && !before && y === Number(e.switchYear) && e.log && prevFamily && prevFamily !== st.family

          && (this.provinces || []).some(p => p.ownerId === cid)) {

        this.log(e.log, 'important');

      }

    });

  },



  // 徳川家康・松平元康の改名連動（桶狭間イベント・年代連動）,



  updateTokugawaSurname(announce = false) {

    // 史実: 永禄6年（1563）に元康から家康へ改名。桶狭間（1560）の時点ではまだ松平元康

    const isIeyasuEra = (this.year >= 1563);

    // 永禄9年（1566）12月に徳川へ改姓。1563〜1566年は「松平家康」
    const isTokugawaEra = (this.year >= 1567);

    const targetName = isTokugawaEra ? '徳川家康' : (isIeyasuEra ? '松平家康' : '松平元康');

    const oldName = isIeyasuEra ? '松平元康' : '徳川家康';

    const targetClanName = isTokugawaEra ? '徳川家' : '松平家';



    // 1. 武将名の更新 (activeOfficers & OFFICERS_MASTER)

    const allOffs = [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])];

    allOffs.forEach(o => {

      if (!o.name) return;

      if (o.id === 'off_tokugawa_ieyasu' || o.id === 'off_matsudaira_motoyasu' || o.id === 'off_matsudaira_ieyasu_early') {

        o.name = targetName;

      }

    });



    // 2. プレイヤー大名情報の更新

    if (this.playerClanId === 'tokugawa' || this.playerClanId === 'matsudaira') {

      if (this.playerDaimyo) {

        this.playerDaimyo.clan = targetClanName;

        this.playerDaimyo.name = targetName;

      }

    }



    // 3. CLAN_MASTER_DATA の更新

    if (window.CLAN_MASTER_DATA) {

      ['tokugawa', 'matsudaira'].forEach(cid => {

        if (window.CLAN_MASTER_DATA[cid]) {

          if (isTokugawaEra) {

            window.CLAN_MASTER_DATA[cid].family = '徳川家';

          }

          if (window.CLAN_MASTER_DATA[cid].leaders) {

            window.CLAN_MASTER_DATA[cid].leaders.default = targetName;

            if (window.CLAN_MASTER_DATA[cid].leaders['1560']) {

              window.CLAN_MASTER_DATA[cid].leaders['1560'] = targetName;

            }

          }

        }

      });

    }



    // 4. プレイアブル大名リストの更新

    if (this.currentScenario && this.currentScenario.playables) {

      const pToku = this.currentScenario.playables.find(d => d.id === 'tokugawa' || d.id === 'matsudaira');

      if (pToku) {

        if (pToku.name && (this.leaderNamesMatch(pToku.name, '徳川家康') || pToku.name === '松平家康')) {

          pToku.name = targetName;

          pToku.clan = targetClanName;

        }

      }

    }



    // 5. アナウンス

    if (announce && this.year === 1563 && !this._ieyasuAnnounced) {

      this._ieyasuAnnounced = true;

      this.log('📜【改名】松平元康公は今川義元より賜った「元」の字を捨て、「家康」へと改名しました！', 'important');

      if (this.audio) this.audio.playHyoshigi();

    }

  },



  // 長尾景虎・上杉謙信の改名連動（1561年に関東管領上杉家の名跡を継承して改名）

  updateKenshinName(announce = false) {

    const isKenshinEra = (this.year >= 1561);

    const targetName = isKenshinEra ? (this.year >= 1570 ? '上杉謙信' : (this.year > 1561 ? '上杉輝虎' : '上杉政虎')) : '長尾景虎';

    const oldName = isKenshinEra ? '長尾景虎' : '上杉謙信';



    // 1. 武将名の更新 (activeOfficers & OFFICERS_MASTER)

    const allOffs = [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])];

    allOffs.forEach(o => {

      if (!o.name) return;

      if (o.id === 'off_uesugi_kenshin') {

        o.name = targetName;

      }

    });



    // 2. プレイヤー大名情報の更新

    if (this.playerClanId === 'nagao' || this.playerClanId === 'uesugi') {

      if (this.playerDaimyo && (this.playerDaimyo.officerId === 'off_uesugi_kenshin' || this.playerDaimyo.name === oldName)) {

        this.playerDaimyo.name = targetName;

      }

    }



    // 3. CLAN_MASTER_DATA の更新

    if (window.CLAN_MASTER_DATA) {

      ['nagao', 'uesugi'].forEach(cid => {

        if (window.CLAN_MASTER_DATA[cid] && window.CLAN_MASTER_DATA[cid].leaders) {

          if (this.year === 1555 || !isKenshinEra) {

            window.CLAN_MASTER_DATA[cid].leaders['1555'] = targetName;

          }

        }

      });

    }



    // 4. プレイアブル大名リストの更新

    if (this.currentScenario && this.currentScenario.playables) {

      const pNagao = this.currentScenario.playables.find(d => d.id === 'nagao' || d.id === 'uesugi');

      if (pNagao && (pNagao.officerId === 'off_uesugi_kenshin' || pNagao.name === oldName || pNagao.name === targetName)) {

        pNagao.name = targetName;

      }

    }



    // 5. 1561年の改名アナウンス

    if (announce && this.year === 1561 && this.seasonIdx === 0 && !this._kenshinAnnounced) {

      this._kenshinAnnounced = true;

      this.log('📜【改名】長尾景虎公は関東管領上杉家の名跡を継承し、「上杉政虎」へと改名しました！', 'important');

      if (this.audio) this.audio.playHyoshigi();

    }

    // 1561年の関東管領就任時のみ、山内上杉家が存在すれば統合し越後上杉家を確立
    if (this.year === 1561 && !this._kantoKanreiIntegrated) {
      this._kantoKanreiIntegrated = true;
      this.integrateYamanouchiUesugi(false);
    }

  },

  /**
   * 関東管領就任と上杉名跡継承：山内上杉家が存在したら統合して「越後上杉家」とし、
   * 越後上杉家の家紋（kamon-uesugi）・領土色（#1483bf）を反映する
   */
  integrateYamanouchiUesugi(isPlayerChoice = false) {
    let targetClanId = 'uesugi';
    if ((this.provinces || []).some(p => p.ownerId === 'nagao')) {
      targetClanId = 'nagao';
    } else if (this.playerClanId === 'nagao') {
      targetClanId = 'nagao';
    }

    // 山内上杉家（yamanouchi または 上杉憲政が当主の家）を探索
    let yamanouchiId = null;
    if ((this.provinces || []).some(p => p.ownerId === 'yamanouchi')) {
      yamanouchiId = 'yamanouchi';
    } else {
      const uOwner = (this.provinces || []).find(p => p.ownerId === 'uesugi');
      if (uOwner && this.getDaimyoLeaderName('uesugi') === '上杉憲政') {
        yamanouchiId = 'uesugi';
      }
    }

    // 山内上杉家が存在する場合の領国・武将統合
    if (yamanouchiId && yamanouchiId !== targetClanId) {
      const yProvs = (this.provinces || []).filter(p => p.ownerId === yamanouchiId);
      yProvs.forEach(p => {
        p.ownerId = targetClanId;
      });

      (this.activeOfficers || []).forEach(o => {
        if (o.clanId === yamanouchiId && !o.isDead) {
          o.clanId = targetClanId;
          o.isDaimyo = false; // 上杉憲政は家臣・一門へ
        }
      });
      this.log(`🤝【御家統合】関東管領・山内上杉家の領国（${yProvs.length}州）および麾下の全武将が越後上杉家へ統合されました！`, 'important');
    }

    // 長野家（nagano: 上野箕輪城・長野業正・業盛等）が存在する場合の領国・武将統合
    if ((this.provinces || []).some(p => p.ownerId === 'nagano') && targetClanId !== 'nagano') {
      const nProvs = (this.provinces || []).filter(p => p.ownerId === 'nagano');
      nProvs.forEach(p => {
        p.ownerId = targetClanId;
      });

      (this.activeOfficers || []).forEach(o => {
        if (o.clanId === 'nagano' && !o.isDead) {
          o.clanId = targetClanId;
          o.isDaimyo = false; // 長野業正・業盛らは越後上杉家の重臣へ
        }
      });
      this.log(`🤝【御家統合】上野の盟友・長野家の領国（${nProvs.length}州）および麾下の全武将が越後上杉家へ統合されました！`, 'important');
    }

    // 越後上杉家の家名・家紋・領土色の確立
    const echigoColor = '#1483bf';
    const echigoKamon = 'kamon-uesugi';
    const echigoFamily = '越後上杉家';

    this.clanLookOverrides = this.clanLookOverrides || {};
    this.clanLookOverrides[targetClanId] = {
      kamon: echigoKamon,
      color: echigoColor,
      family: echigoFamily
    };
    if (targetClanId !== 'uesugi') {
      this.clanLookOverrides['uesugi'] = {
        kamon: echigoKamon,
        color: echigoColor,
        family: echigoFamily
      };
    }

    if (window.CLAN_MASTER_DATA) {
      [targetClanId, 'nagao', 'uesugi'].forEach(cid => {
        if (window.CLAN_MASTER_DATA[cid]) {
          window.CLAN_MASTER_DATA[cid].family = echigoFamily;
          window.CLAN_MASTER_DATA[cid].color = echigoColor;
          window.CLAN_MASTER_DATA[cid].kamon = echigoKamon;
        }
      });
    }

    // プレイヤー大名の家名・当主名の更新
    if (this.playerClanId === targetClanId || this.playerClanId === 'nagao' || this.playerClanId === 'yamanouchi') {
      this.playerClanId = targetClanId;
      if (this.playerDaimyo) {
        this.playerDaimyo.clan = echigoFamily;
        this.playerDaimyo.color = echigoColor;
        this.playerDaimyo.kamon = echigoKamon;
        this.playerDaimyo.name = '上杉政虎';
      }
    }

    // 武将名の更新（長尾景虎 -> 上杉政虎）
    const allOffs = [...(this.activeOfficers || []), ...(window.OFFICERS_MASTER || [])];
    allOffs.forEach(o => {
      if (o.id === 'off_uesugi_kenshin' || o.name === '長尾景虎' || o.name === '上杉謙信') {
        o.name = '上杉政虎';
      }
    });

    try {
      if (typeof this.initSvgMap === 'function') this.initSvgMap();
      if (typeof this.updateMapDisplay === 'function') this.updateMapDisplay();
      if (typeof this.updateUI === 'function') this.updateUI();
    } catch (e) {
      console.warn('UI refresh failed during Uesugi integration:', e);
    }
  },



  // 領国の実効統治能力（本拠親政は大名本人の居城のみ、それ以外は通常の城代）

  // 旧国名を和名（尾張、三河、甲斐など）に変換するヘルパー,



  getProvinceJapaneseName(provId) {

    if (!provId) return '諸国';

    const cleanId = String(provId).replace(/^prov_/, '').toLowerCase();

    const p = (this.provinces || []).find(x => x.id === provId || x.id === cleanId || x.id === `prov_${cleanId}`)

           || (window.PROVINCES_DATA || []).find(x => x.id === provId || x.id === cleanId || x.id === `prov_${cleanId}`);

    const jpFromProv = p && p.name && !/^[a-z0-9_]+$/i.test(String(p.name)) ? p.name : '';

    if (jpFromProv) return jpFromProv;

    const map = {

      'owari_north': '尾張北', 'owari_south': '尾張南', 'mikawa_shitara': '三河設楽郡', 'owari_south': '尾張', 'mikawa_okazaki': '三河', 'mikawa_yoshida': '三河', 'totomi_hamamatsu': '遠江', 'totomi_kakegawa': '遠江', 'totomi_futamata_haibara': '遠江', 'totomi_joto': '遠江', 'suruga': '駿河', 'kai': '甲斐', 'kai_tsuru': '甲斐', 'shinano_kawanakajima': '高井・水内', 'shinano_sarashina_hanishina': '更級・埴科', 'kai_tsuru': '甲斐', 'shinano_kawanakajima': '高井・水内', 'shinano_sarashina_hanishina': '更級・埴科', 'shinano': '信濃',

      'kitashinano': '北信濃', 'minamishinano': '南信濃', 'shinano_kawanakajima': '川中島・松代', 'shinano_ueda': '上田', 'shinano_chikuma_kiso': '筑摩・木曽谷', 'shinano_chikuma_azumi': '筑摩・安曇', 'shinano_kiso': '木曽谷', 'shinano_takato': '信濃高遠', 'shinano_iida': '信濃飯田', 'shinano_takato_iida': '高遠・飯田',

      'mino': '美濃', 'mino_gujo': '美濃', 'mino_gujo': '美濃', 'mino_iwamura': '美濃', 'hida': '飛騨', 'hida_takayama': '飛騨', 'hida_kiun': '飛騨', 'hida_kamioka': '飛騨', 'echizen': '越前', 'echizen_tsuruga': '越前敦賀', 'echizen_ohno': '越前', 'kaga': '加賀', 'kaga_north': '加賀北', 'kaga_south': '加賀南', 'noto': '能登', 'ecchu': '越中',

      'etchu_west': '西越中', 'etchu_east': '東越中', 'echigo': '越後', 'echigo_murakami': '越後', 'echigo_kanbara': '越後蒲原', 'echigo_higashikanbara': '越後東蒲原', 'echigo_uonuma': '越後', 'echigo_kanbara': '越後蒲原', 'echigo_higashikanbara': '越後東蒲原', 'echigo_uonuma': '越後', 'sado': '佐渡', 'kozuke_takasaki': '高崎・箕輪', 'kozuke_agatsuma': '吾妻郡', 'kozuke_numata': '沼田', 'kozuke_maebashi': '厩橋', 'kozuke_nitta_kanayama': '新田・館林', 'shimotsuke': '下野', 'shimotsuke_kanitsuga': '下野', 'sano_oyama': '佐野・小山', 'shimotsuke_oyama': '佐野・小山', 'shimotsuke_sano': '佐野・小山', 'hitachi': '常陸', 'hitachi_ohta': '常陸', 'hitachi_mito': '常陸', 'hitachi_fuchu': '常陸', 'hitachi_tsuchiura': '常陸', 'hitachi_makabe': '常陸', 'hitachi_shimodate': '常陸', 'hitachi_shimotsuma': '常陸', 'hitachi_kashima': '常陸', 'hitachi_shida': '常陸信太郡',

      'shimousa': '下総', 'shimousa_koga': '下総古河', 'shimousa_yuhki': '下総', 'kazusa': '上総', 'kazusa_isumi': '上総', 'kazusa_togane_naruto': '上総', 'kazusa_togane_naruto': '上総', 'awa': '安房', 'awa': '安房', 'musashi': '武蔵', 'musashi_oshi': '武蔵', 'musashi_hachigata': '武蔵', 'musashi_iwatsuki': '武蔵', 'musashi_kawagoe': '武蔵', 'musashi_edo_tama': '武蔵', 'musashi_edo': '武蔵', 'musashi_tama': '武蔵', 'sagami': '相模', 'sagami_miura': '相模',

      'izu': '伊豆', 'omi': '近江', 'omi_north': '北近江', 'omi_kutsukidani': '近江朽木谷', 'omi_south': '南近江', 'omi_koka': '近江甲賀', 'yamashiro': '山城', 'yamato': '大和', 'yamato_koriyama': '大和', 'yamato_takatori': '大和', 'yamato_yoshino': '大和', 'yamato_higashiyamauchi': '大和',

      'kawachi_north': '河内北', 'kawachi_south': '河内南', 'kawachi_south': '河内', 'izumi': '和泉', 'settsu': '摂津', 'settsu_shimakami': '摂津', 'settsu_osaka': '摂津', 'tanba': '丹波', 'tamba': '丹波', 'tamba_west': '丹波', 'tamba_east': '丹波', 'tango': '丹後',

      'tajima': '但馬', 'inaba': '因幡', 'hoki_west': '西伯耆', 'hoki_east': '東伯耆', 'izumo': '出雲', 'izumo_north': '出雲北', 'izumo_south': '出雲南', 'iwami': '石見', 'oki': '隠岐',

      'harima_west': '西播磨', 'harima_east': '東播磨', 'mimasaka_west': '西美作', 'mimasaka_east': '東美作', 'bizen': '備前', 'bitchu': '備中', 'bitchu_matsuyama': '備中', 'bitchu_takamatsu': '備中', 'bingo': '備後',

      'aki_hiroshima': '安芸', 'aki_koriyama': '安芸郡山', 'suo': '周防', 'nagato': '長門', 'kii': '紀伊', 'awa_shikoku': '阿波東', 'awa_shikoku_west': '阿波西', 'awa_shikoku_south': '阿波南', 'sanuki': '讃岐東', 'sanuki_west': '讃岐西',

      'iyo_matsuyama': '伊予松山', 'iyo_nii': '新居・西条', 'tosa_kochi': '土佐長岡郡', 'tosa_aki': '土佐安芸', 'tosa_gun': '土佐郡', 'tosa_nakamura': '土佐中村', 'tosa': '土佐', 'chikuzen_fukuoka': '筑前福岡', 'chikuzen_hakata': '筑前博多', 'chikuzen_munakata': '筑前宗像', 'chikuzen_kamashi': '筑前嘉麻', 'chikuzen_akizuki': '夜須郡秋月', 'chikugo_north': '筑後', 'chikugo_south': '筑後', 'buzen': '豊前', 'buzen_ogura': '豊前', 'buzen_nakatsu': '豊前', 'bungo_funai': '豊後府内', 'bungo_oka': '豊後岡', 'bungo_kitaamabe': '豊後北海部', 'bungo_minamiamabe': '豊後南海部', 'bungo_saiki_usuki': '佐伯・臼杵',

      'hizen': '肥前', 'hizen_saga': '肥前', 'hizen_tsukushi': '肥前', 'hizen_karatsu': '肥前', 'higo_kumamoto': '熊本・阿蘇', 'higo_aso': '熊本・阿蘇', 'higo_yatsushiro': '宇土・八代', 'higo_hitoyoshi': '肥後人吉', 'hyuga_nobeoka': '延岡', 'hyuga_takanabe': '高鍋', 'hyuga_sadowara': '佐土原', 'hyuga_obi': '飫肥', 'osumi': '大隅', 'satsuma': '薩摩', 'tsushima': '対馬',

      'iki': '壱岐', 'mutsu_nanbu': '陸奥', 'dewa': '出羽', 'ezo': '蝦夷', 'tsugaru': '津軽', 'mutsu_tsugaru': '西津軽', 'mutsu_namioka': '東津軽', 'rikuchu': '陸中', 'rikuchu_morioka': '陸中', 'rikuchu_kamiheii': '陸中', 'rikuchu_shimoheii': '陸中', 'rikuchu_hienuki': '陸中', 'rikuchu_waga': '陸中',

      'rikuzen': '陸前', 'rikuzen_kurokawa': '陸前黒川', 'iwaki': '磐城', 'iwashiro': '岩代', 'iwashiro_sukagawa': '岩代', 'iwashiro_ishikawa': '岩代', 'ugo': '羽後', 'ugo_minato': '羽後', 'ugo_hinai': '羽後', 'ugo_yuri': '羽後', 'uzen': '羽前', 'uzen_mogami': '羽前', 'uzen_kitamurayama': '羽前', 'uzen_nishimurayama': '羽前', 'uzen_higashimurayama': '羽前', 'wakasa': '若狭',

      'shimanokuni': '志摩', 'shima': '志摩', 'ise': '伊勢', 'ise_suzuka': '伊勢', 'iga': '伊賀', 'awaji': '淡路',

      'okayama': '備前', 'wakayama': '紀伊', 'niigata': '越後', 'osaka': '摂津', 'kanagawa': '相模',

      'tottori': '因幡', 'mie': '伊勢', 'fukui': '越前', 'aichi_w': '尾張', 'aichi_e': '三河',

      'tokushima': '阿波', 'fukuoka': '筑前', 'kumamoto': '肥後', 'kochi': '土佐', 'shimane': '出雲',

      'ibaraki': '常陸'

    };

    return map[cleanId] || '諸国';

  },



  // 武将列伝テキスト内の英語国名・ID（izumo, bungo, higo等）を綺麗な日本語和名に変換・サニタイズ,



  cleanOfficerLore(lore) {

    if (!lore) return '';

    let res = String(lore);

    const map = {

      'iwashiro': '岩代', 'iwashiro_sukagawa': '岩代', 'iwashiro_ishikawa': '岩代', 'rikuchu': '陸中', 'rikuchu_morioka': '陸中', 'rikuchu_kamiheii': '陸中', 'rikuchu_shimoheii': '陸中', 'rikuchu_hienuki': '陸中', 'rikuchu_waga': '陸中', 'rikuzen': '陸前', 'rikuzen_kurokawa': '陸前黒川', 'iwaki': '磐城', 'mutsu_nanbu': '陸奥',

      'ugo': '羽後', 'ugo_minato': '羽後', 'ugo_hinai': '羽後', 'ugo_yuri': '羽後', 'uzen': '羽前', 'uzen_mogami': '羽前', 'uzen_kitamurayama': '羽前', 'uzen_nishimurayama': '羽前', 'uzen_higashimurayama': '羽前', 'dewa': '出羽', 'echigo': '越後', 'echigo_murakami': '越後', 'ecchu': '越中', 'etchu_west': '西越中', 'etchu_east': '東越中',

      'noto': '能登', 'kaga': '加賀', 'kaga_north': '加賀北', 'kaga_south': '加賀南', 'echizen': '越前', 'echizen_tsuruga': '越前敦賀', 'echizen_ohno': '越前', 'sado': '佐渡', 'kai': '甲斐', 'shinano': '信濃',

      'shinano_kawanakajima': '川中島・松代', 'shinano_ueda': '上田', 'shinano_chikuma_kiso': '筑摩・木曽谷', 'shinano_chikuma_azumi': '筑摩・安曇', 'shinano_kiso': '木曽谷', 'shinano_takato': '信濃高遠', 'shinano_iida': '信濃飯田', 'shinano_takato_iida': '高遠・飯田', 'kitashinano': '北信濃', 'minamishinano': '南信濃',

      'hida': '飛騨', 'hida_takayama': '飛騨', 'hida_kiun': '飛騨', 'hida_kamioka': '飛騨', 'mino': '美濃', 'mino_iwamura': '美濃', 'owari_north': '尾張北', 'mikawa_okazaki': '三河', 'mikawa_yoshida': '三河', 'mikawa_shitara': '三河設楽郡', 'totomi_hamamatsu': '遠江', 'totomi_kakegawa': '遠江', 'totomi_futamata_haibara': '遠江', 'totomi_joto': '遠江', 'suruga': '駿河',

      'izu': '伊豆', 'sagami': '相模', 'sagami_miura': '相模', 'musashi': '武蔵', 'musashi_oshi': '武蔵', 'musashi_hachigata': '武蔵', 'musashi_iwatsuki': '武蔵', 'musashi_kawagoe': '武蔵', 'musashi_edo_tama': '武蔵', 'musashi_edo': '武蔵', 'musashi_tama': '武蔵', 'kazusa': '上総', 'kazusa_isumi': '上総', 'shimousa': '下総', 'shimousa_koga': '下総古河', 'shimousa_yuhki': '下総', 'hitachi': '常陸', 'hitachi_ohta': '常陸', 'hitachi_mito': '常陸', 'hitachi_fuchu': '常陸', 'hitachi_tsuchiura': '常陸', 'hitachi_makabe': '常陸', 'hitachi_shimodate': '常陸', 'hitachi_shimotsuma': '常陸', 'hitachi_kashima': '常陸', 'hitachi_shida': '常陸信太郡',

      'shimotsuke': '下野', 'shimotsuke_kanitsuga': '下野', 'sano_oyama': '佐野・小山', 'shimotsuke_oyama': '佐野・小山', 'shimotsuke_sano': '佐野・小山', 'kozuke_takasaki': '高崎・箕輪', 'kozuke_agatsuma': '吾妻郡', 'kozuke_numata': '沼田', 'kozuke_maebashi': '厩橋', 'kozuke_nitta_kanayama': '新田・館林', 'awa': '安房', 'awa': '安房', 'omi': '近江',

      'omi_north': '北近江', 'omi_kutsukidani': '近江朽木谷', 'omi_south': '南近江', 'omi_koka': '近江甲賀', 'yamashiro': '山城', 'yamato': '大和', 'yamato_koriyama': '大和', 'yamato_takatori': '大和', 'yamato_yoshino': '大和', 'yamato_higashiyamauchi': '大和', 'kawachi_north': '河内北',

      'izumi': '和泉', 'settsu': '摂津', 'settsu_shimakami': '摂津', 'settsu_osaka': '摂津', 'iga': '伊賀', 'ise': '伊勢', 'ise_suzuka': '伊勢', 'shima': '志摩', 'kii': '紀伊',

      'tanba': '丹波', 'tamba': '丹波', 'tamba_west': '丹波', 'tamba_east': '丹波', 'tango': '丹後', 'tajima': '但馬', 'inaba': '因幡', 'hoki_west': '西伯耆', 'hoki_east': '東伯耆',

      'izumo': '出雲', 'izumo_north': '出雲北', 'izumo_south': '出雲南', 'iwami': '石見', 'oki': '隠岐', 'harima_west': '西播磨', 'harima_east': '東播磨', 'mimasaka_west': '西美作', 'mimasaka_east': '東美作', 'bizen': '備前',

      'bitchu_matsuyama': '備中', 'bitchu_takamatsu': '備中', 'bitchu': '備中', 'bingo': '備後', 'aki_hiroshima': '安芸', 'aki_koriyama': '安芸郡山', 'suo': '周防', 'nagato': '長門',

      'awa_shikoku': '阿波東', 'awa_shikoku_west': '阿波西', 'awa_shikoku_south': '阿波南', 'sanuki': '讃岐東', 'sanuki_west': '讃岐西', 'iyo_matsuyama': '伊予松山', 'iyo_nii': '新居・西条', 'tosa_kochi': '土佐長岡郡', 'tosa_aki': '土佐安芸', 'tosa_gun': '土佐郡', 'tosa_nakamura': '土佐中村', 'tosa': '土佐', 'chikuzen_fukuoka': '筑前福岡', 'chikuzen_hakata': '筑前博多', 'chikuzen_munakata': '筑前宗像', 'chikuzen_kamashi': '筑前嘉麻', 'chikuzen_akizuki': '夜須郡秋月',

      'chikugo_north': '筑後', 'chikugo_south': '筑後', 'buzen': '豊前', 'buzen_ogura': '豊前', 'buzen_nakatsu': '豊前', 'bungo_funai': '豊後府内', 'bungo_oka': '豊後岡', 'bungo_kitaamabe': '豊後北海部', 'bungo_minamiamabe': '豊後南海部', 'bungo_saiki_usuki': '佐伯・臼杵', 'hizen': '肥前', 'hizen_saga': '肥前', 'hizen_tsukushi': '肥前', 'hizen_karatsu': '肥前', 'higo_kumamoto': '熊本・阿蘇', 'higo_aso': '熊本・阿蘇', 'higo_yatsushiro': '宇土・八代', 'higo_hitoyoshi': '肥後人吉', 'hyuga_nobeoka': '延岡', 'hyuga_takanabe': '高鍋', 'hyuga_sadowara': '佐土原', 'hyuga_obi': '飫肥',

      'osumi': '大隅', 'satsuma': '薩摩', 'tsushima': '対馬', 'iki': '壱岐', 'ezo': '蝦夷', 'tsugaru': '津軽', 'mutsu_tsugaru': '西津軽', 'mutsu_namioka': '東津軽',

      'okayama': '備前・美作', 'wakayama': '紀伊', 'niigata': '越後', 'osaka': '摂津・大坂', 'kanagawa': '相模',

      'tottori': '因幡・伯耆', 'mie': '伊勢', 'fukui': '越前', 'aichi_w': '尾張', 'aichi_e': '三河',

      'tokushima': '阿波', 'fukuoka': '筑前', 'kumamoto': '肥後', 'kochi': '土佐', 'shimane': '出雲・石見',

      'ibaraki': '常陸'

    };

    const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);

    for (const k of sortedKeys) {

      const jp = map[k];

      // 単語境界 \b は「prov_izumo」や和文に挟まれた国名IDを取りこぼす

      const re = new RegExp('(?<![A-Za-z0-9_])(?:prov_)?' + k + '(?![A-Za-z0-9_])', 'gi');

      res = res.replace(re, jp);

    }

    res = res.replace(/本拠地(?!・)(?=[\u4e00-\u9fff])/g, '本拠地・');

    return res;

  },



  // 起点国から各国までの隣接ホップ数（BFS）,



  getProvinceDistanceMap(fromId) {

    const dist = new Map();

    if (!fromId) return dist;

    const byId = new Map((this.provinces || []).map(p => [p.id, p]));

    if (!byId.has(fromId)) return dist;

    const q = [fromId];

    dist.set(fromId, 0);

    while (q.length) {

      const cur = q.shift();

      const d = dist.get(cur);

      const p = byId.get(cur);

      if (!p) continue;

      for (const nId of (p.neighbors || [])) {

        if (dist.has(nId)) continue;

        dist.set(nId, d + 1);

        q.push(nId);

      }

    }

    return dist;

  },



  // 浪人の流浪国から、指定勢力の最寄り領国までのホップ数,



  getRoninDistanceToClan(ronin, clanId, distMap = null) {

    const fromId = ronin && ronin.defaultProv;

    if (!fromId || !clanId) return Infinity;

    const map = distMap || this.getProvinceDistanceMap(fromId);

    let best = Infinity;

    for (const p of (this.provinces || [])) {

      if (p.ownerId !== clanId) continue;

      const d = map.get(p.id);

      if (d != null && d < best) best = d;

      if (best === 0) break;

    }

    return best;

  },



  // 家中に継げる成人がいない（当主のみ、または世継ぎ不在）,



  householdLacksHeir(clanId) {

    if (!clanId || clanId === 'ronin') return false;

    const daimyo = (this.activeOfficers || []).find(o => o.clanId === clanId && o.isDaimyo && !o.isDead);

    const name = daimyo?.name || this.deceasedDaimyoName(clanId);

    const heirs = (this.activeOfficers || []).filter(o =>

      o && o.clanId === clanId && !o.isDaimyo && this.officerCanInherit(o)

    );

    if (!heirs.length) return true;

    // 一覧の描画などで浪人1人ごとに呼ばれるため、同じ処理単位の中では家ごとに結果を覚えておく

    // （家中の顔ぶれ・当主・年が変われば計算し直す。記憶は次の処理単位で消える）（2026-10-11 aq）

    const memoKey = `${clanId}|${this.year}|${name || ''}|${heirs.map(o => o.id).join(',')}`;

    if (!this._lacksHeirMemo) {

      this._lacksHeirMemo = new Map();

      setTimeout(() => { this._lacksHeirMemo = null; }, 0);

    }

    if (this._lacksHeirMemo.has(memoKey)) return this._lacksHeirMemo.get(memoKey);

    const result = this.sortHeirCandidates(heirs, clanId, name).length === 0;

    this._lacksHeirMemo.set(memoKey, result);

    return result;

  },



  // 仕官圏: 流浪国・隣国に加え、遠国も登用可。遠いほど成功率は下がる,



  getRoninServiceReach(ronin, clanId) {

    const dist = this.getRoninDistanceToClan(ronin, clanId);

    const lacksHeir = this.householdLacksHeir(clanId);

    if (dist === 0) {

      return { dist, reachable: true, label: '流浪国', bonus: lacksHeir ? 32 : 20, penalty: 0, lacksHeir };

    }

    if (dist === 1) {

      return { dist, reachable: true, label: '隣国', bonus: lacksHeir ? 16 : 0, penalty: lacksHeir ? 4 : 22, lacksHeir };

    }

    if (Number.isFinite(dist)) {

      const extra = Math.max(0, dist - 2);

      return {

        dist,

        reachable: true,

        label: '遠国',

        bonus: lacksHeir ? 22 : 0,

        penalty: (lacksHeir ? 24 : 46) + extra * 6,

        lacksHeir

      };

    }

    return { dist: 6, reachable: true, label: '諸国流浪', bonus: lacksHeir ? 12 : 0, penalty: lacksHeir ? 28 : 52, lacksHeir };

  },



  // プレイヤー登用の成功率（流浪国が高く、隣国・遠国は下がる。跡継ぎ不在なら上昇）,



  calcPlayerRoninRecruitRate(off) {

    const reach = this.getRoninServiceReach(off, this.playerClanId);

    if (!reach.reachable) return { ...reach, rate: 0 };



    let rate = 60 + reach.bonus - reach.penalty;

    const myDaimyoOff = (this.activeOfficers || []).find(o => o.clanId === this.playerClanId && o.isDaimyo && !o.isDead);

    const daimyoIntel = myDaimyoOff ? (myDaimyoOff.intel || 50) : 50;

    const daimyoPol = myDaimyoOff ? (myDaimyoOff.politic || 50) : 50;

    rate += Math.round((daimyoIntel + daimyoPol - 100) * 0.15);



    const offTotal = (off.military || 50) + (off.politic || 50) + (off.intel || 50);

    rate -= Math.round((offTotal - 150) * 0.08);



    const cap = reach.dist === 0 ? 95 : (reach.dist === 1 ? (reach.lacksHeir ? 88 : 72) : (reach.lacksHeir ? 62 : 32));

    const floor = reach.dist === 0 ? (reach.lacksHeir ? 55 : 40) : (reach.dist === 1 ? (reach.lacksHeir ? 32 : 15) : (reach.lacksHeir ? 22 : 6));

    rate = Math.max(floor, Math.min(cap, rate));

    return { ...reach, rate };

  },



  // 武将の現在所在国・拠点情報を取得（城主・大名・待機武将・浪人の所在国を特定）,



  getOfficerLocationInfo(off) {

    if (!off) return { prov: null, provName: '諸国', castleName: '', label: '流浪', type: 'unknown', isMine: false };



    // 1. 城主任命中の武将（任地領国・浪人は除く）

    if (off.clanId !== 'ronin' && off.assignedProvId) {

      const p = (this.provinces || []).find(x => x.id === off.assignedProvId);

      if (p) {

        return {

          prov: p,

          provName: this.getProvinceJapaneseName(p.id),

          castleName: p.castleName || p.castle || '居城',

          label: p.castleName || p.castle || '城主',

          type: 'governor',

          isMine: p.ownerId === this.playerClanId

        };

      }

    }



    // 2. 浪人武将（未仕官・在野）

    if (off.clanId === 'ronin') {

      const defProvId = off.defaultProv;

      const p = defProvId ? (this.provinces || []).find(x => x.id === defProvId) : null;

      const provName = defProvId ? this.getProvinceJapaneseName(defProvId) : '諸国';

      const isMine = p && p.ownerId === this.playerClanId;

      return {

        prov: p,

        provName: provName,

        castleName: p ? (p.castleName || p.castle) : '',

        label: isMine ? '自領内' : '在野',

        type: 'ronin',

        isMine: isMine

      };

    }



    // 3. 大名武将（本拠は、その家が現に領有している国だけ）

    if (off.isDaimyo) {

      const capProv = this.getDaimyoHomeProvince(off);

      if (!capProv) {

        return {

          prov: null,

          provName: '所領なし',

          castleName: '',

          label: '浪々',

          type: 'daimyo',

          isMine: false

        };

      }

      return {

        prov: capProv,

        provName: this.getProvinceJapaneseName(capProv.id),

        castleName: capProv.castleName || capProv.castle || '',

        label: '居城',

        type: 'daimyo',

        isMine: off.clanId === this.playerClanId

      };

    }



// 4. 配下待機武将（自家の領内にあるゆかりの地、なければ主君の本拠に待機）

    const baseProvId = this.officerBaseProvinceId(off);

    const baseProv = baseProvId ? (this.provinces || []).find(p => p.id === baseProvId) : null;

    const provName = baseProv ? this.getProvinceJapaneseName(baseProv.id) : '本国';

    const isMine = off.clanId === this.playerClanId;

    

    return {

      prov: baseProv,

      provName: provName,

      castleName: baseProv ? (baseProv.castleName || baseProv.castle) : '',

      label: '待機',

      type: 'waiting',

      isMine: isMine

    };

  },
};
