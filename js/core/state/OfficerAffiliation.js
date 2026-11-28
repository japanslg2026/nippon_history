/**
 * @file js/core/state/OfficerAffiliation.js - GameState から機能別に分割したメソッド群（27個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { officerFiefAt, officerProvAtYear } from '../GameStateShared.js?v=20261128_v74';

export const OfficerAffiliationMethods = {



  // ============================================================================

  // 武将システム & 大名本拠地親政（100%）・城代（40%〜75%ランダム）エンジン

  // ============================================================================

  // 武将ライフサイクル（元服・寿命・死亡）管理 (要件1: 年齢15歳未満は絶対に登場させない),



  updateActiveOfficers() {

    if (!window.OFFICERS_MASTER) return;



    // 既存の activeOfficers の状態（assignedProvId, isDaimyo, isDead等）を保持するためのマップ

    const existingMap = new Map();

    if (this.activeOfficers) {

      this.activeOfficers.forEach(o => existingMap.set(o.id, o));

    }



    const nextActive = [];



    const isVirtual = this.isVirtualScenario();



    const virtualClanIds = isVirtual ? new Set(

      (this.provinces || []).map(p => p.ownerId).concat((this.currentScenario?.playables || []).map(p => p.id)).filter(Boolean)

    ) : null;

    const virtualAffiliations = (isVirtual && this.currentScenario?.officerAffiliations) || {};

    const virtualDeadOfficerIds = this._virtualDeadOfficerIds || (this._virtualDeadOfficerIds = new Set());

    // 全国オールスター群雄割拠: 登場武将を最大500名の名簿に限定（マスタから決定的に選定）

    const allstarRoster = (isVirtual && this.currentScenario?.id === 'allstar_feudal')

      ? this.getAllstarFeudalRoster(virtualClanIds, virtualAffiliations) : null;



    // window.OFFICERS_MASTER から、武将を抽出（仮想シナリオでは全時代の英傑を現役登用）

    const scenExclude = (this.currentScenario && Array.isArray(this.currentScenario.excludeOfficers) && this.year === this.currentScenario.year)

      ? new Set(this.currentScenario.excludeOfficers) : null;

    for (const master of window.OFFICERS_MASTER) {

      if (isVirtual && virtualDeadOfficerIds.has(master.id)) continue;

      const existing = existingMap.get(master.id);

      const isNew = !existing;

      const officer = existing || JSON.parse(JSON.stringify(master));

      if (isNew) {

        officer.isDaimyo = false;

        // 時期別の所領（fiefs）があれば、シナリオ年の所領を初期拠点に（無ければ従来の defaultProv）

        const fiefProv = officerProvAtYear(master, this.year);

        if (fiefProv) officer.defaultProv = fiefProv;

      }

      // セーブに残った誤生年で、まだ生まれていない人物を登場させない

      if (!isVirtual || isNew || !officer._virtualLifespan) {

        officer.birthYear = master.birthYear;

        officer.deathYear = master.deathYear;

      }



      const bYear = Number(officer.birthYear);

      const dYear = Number(officer.deathYear);



      if (officer.name && /[（(][^）)]+[）)]/.test(officer.name)) {

        officer.name = officer.name.replace(/\s*[（(][^）)]+[）)]/g, '').trim();

      }



      // 後年登場武将（lateDebut: 近代の人物など）: どのシナリオの開始時名簿にも、仮想シナリオにも出さない。

      // 開始年の翌年以降、元服（15歳）かつ存命なら年次更新で在野/本拠の家から登場する。

      if (master.lateDebut && isNew && (isVirtual || Number(this.year) < 1878 || this._isSwitchingScenario || Number(this.year) <= Number(this.currentScenario?.year))) continue;

      if (allstarRoster && !allstarRoster.has(master.id)) continue;

      // 史実シナリオ配置対象外（非登場）の人物は登場させない
      if (!isVirtual && master.nonAppearing && !this.isStartChildHead(officer, existing)) continue;

      // 史実初登場年（debutYear）以前は登場させない（開始時大名・総大将を除く）
      if (!isVirtual && master.debutYear != null && Number.isFinite(Number(master.debutYear)) && Number(this.year) < Number(master.debutYear) && !this.isStartChildHead(officer, existing)) continue;

      // シナリオ開始年のみ除外（開始季節より前に没した／その年は史実上の所属がない武将）

      if (scenExclude && scenExclude.has(master.id)) continue;



      if (isVirtual) {

        // 所属指定は文字列（家ID）でも {clanId: ...} でもよい（2026-11-09 オールスター修正）
        const affV = virtualAffiliations[officer.id];
        const effClanId = (affV && typeof affV === 'object' ? affV.clanId : affV) || officer.clanId;

        const isBelongingToActiveClan = effClanId && virtualClanIds && virtualClanIds.has(effClanId);

        if (isBelongingToActiveClan || effClanId === 'ronin') {

          // 仮想シナリオでも開始時だけ年齢をそろえ、死亡年は年次更新で延長しない。
          // 以前は毎年 +200 年へ上書きしていたため、武将が死亡しなかった。
          if (this.isAllstarImmortalScenario()) {
            // オールスター：年を取らず寿命で没しない。開始時の年齢（30歳）のまま
            if (!Number.isFinite(Number(officer._allstarAge))) officer._allstarAge = 30;
            officer.birthYear = Number(this.year) - officer._allstarAge;
            officer.deathYear = 99999;
            officer._virtualLifespan = true;
          }
          const invalidOrLegacyLifetime = !this.isAllstarImmortalScenario() && (!officer._virtualLifespan
            || !Number.isFinite(Number(officer.birthYear))
            || !Number.isFinite(Number(officer.deathYear))
            || Number(officer.deathYear) - Number(this.year) > 80);

          if (invalidOrLegacyLifetime) {

            officer.birthYear = this.year - 30;

            officer.deathYear = this.year + 40;

            officer._virtualLifespan = true;

          }

          if (!officer.isDead && this.year <= Number(officer.deathYear)) {

            nextActive.push(officer);

          } else if (existing) {

            officer.isDead = true;

            virtualDeadOfficerIds.add(officer.id);

          }

          continue;

        }

      }



      // 生没年が無効な場合はスキップ

      if (isNaN(bYear) || isNaN(dYear)) continue;



      const age = this.year - bYear;

      // 15歳未満（およびマイナス年齢・まだ生まれていない武将）は絶対に登場させない

      // 例外: シナリオ開始時の幼少当主（例 1600年の豊臣秀頼）。開始後は当主である間だけ残す

      const isGenpuku = (age >= 15) || (age >= 0 && this.isStartChildHead(officer, existing));

      const isAlive = (this.year <= dYear) && !officer.isDead;



      // シナリオに明記された武将も、生年から没年までの範囲外には登場させない。
      // 過去の ignoreLifespan 指定は、史実シナリオの寿命制約を上書きしない。
      if (isGenpuku && isAlive) {
        officer.isDead = false;
        nextActive.push(officer);
      } else if (existing && this.year > dYear) {
        officer.isDead = true;
      }

    }



    // 動的生成された大名等（window.OFFICERS_MASTER 外の武将）も同様に15歳以上かつ寿命内のみ保持

    if (this.activeOfficers) {

      for (const o of this.activeOfficers) {

        if (!window.OFFICERS_MASTER.some(m => m.id === o.id)) {

          if (o.name && /[（(][^）)]+[）)]/.test(o.name)) {

            o.name = o.name.replace(/\s*[（(][^）)]+[）)]/g, '').trim();

          }

          const bYear = Number(o.birthYear);

          const dYear = Number(o.deathYear);

          if (!isNaN(bYear) && !isNaN(dYear)) {

            const age = this.year - bYear;

            if (age >= 15 && this.year <= dYear && !o.isDead) {

              nextActive.push(o);

            }

          }

        }

      }

    }



    this.activeOfficers = nextActive;
    this.applyEraOfficerNames();

    this.officers = this.activeOfficers; // 後方互換性



    // 現在の各領国 (this.provinces) を巡回し、城主 (governorId) が activeOfficers 内に存在しない場合は governorId = null として解任しログ出力

    if (this.provinces) {

      this.provinces.forEach(p => {

        if (p.governorId) {

          const exists = this.activeOfficers.some(o => o.id === p.governorId);

          if (!exists) {

            const prevName = existingMap.get(p.governorId)?.name || '城主';

            p.governorId = null;

            this.log(`【城主逝去】${p.name}の城主・${prevName}は天寿を全うし逝去しました。城主を解任します。`);

          }

        }

      });

    }

  },



  // 各シナリオにおける所属大名不在武将の史実振り替え・浪人化処理 (要件2),



  resolveOfficerAffiliations(scen) {

    if (!this.activeOfficers || !this.provinces) return;

    const ownersSet = new Set(this.provinces.map(p => p.ownerId).filter(Boolean));

    const year = this.year;

    const clanBefore = new Map(this.activeOfficers.map(o => [o.id, o.clanId]));

    const scenarioAffiliations = (scen && scen.officerAffiliations) || {};

    // 畠山三分家が地図に無く旧 hatakeyama 単一家が残る古いセーブでは旧家に寄せる（2026-10-18 hk）

    const hkLegacyClan = (cid) => (cid && /^hatakeyama_/.test(cid) && !ownersSet.has(cid) && ownersSet.has('hatakeyama')) ? 'hatakeyama' : cid;
    // ゲーム進行中、シナリオ開始時に領地を持っていた家が領地を失った（滅亡した）ら、その家を指すシナリオ所属指定・年代ルールはかけ直さない（滅亡処理＝仕官先振り替え・浪人化に任せる）（2026-11-22 K）
    const scenStartOwners = new Set(Object.values((scen && scen.owners) || {}).filter(Boolean));
    const isFallenScenarioClan = (cid) => !this._isSwitchingScenario && !!cid && scenStartOwners.has(cid) && !ownersSet.has(cid);



    const historicalGovMap = (window.SCENARIO_HISTORICAL_GOVERNORS && window.SCENARIO_HISTORICAL_GOVERNORS[String(scen.id)]) || {};
    const pinnedGovMap = (window.PINNED_SCENARIO_GOVERNORS && window.PINNED_SCENARIO_GOVERNORS[String(scen.id)]) || {};
    // 編集器で固定した城主は、通常の史実城主より優先する。
    const scenGovMap = { ...historicalGovMap, ...pinnedGovMap };



    // 各領国の城主（城代または大名居城当主）の事前把握

    const provCastellans = [];

    (this.provinces || []).forEach(p => {

      if (!p.ownerId || !ownersSet.has(p.ownerId)) return;

      const govId = scenGovMap[p.id];

      if (govId) {

        provCastellans.push({ provId: p.id, ownerId: p.ownerId, officerId: govId });

      } else if (this.isCapitalProvince(p.id, p.ownerId)) {

        const daimyoOff = this.activeOfficers.find(o => o.clanId === p.ownerId && o.isDaimyo);

        if (daimyoOff) {

          provCastellans.push({ provId: p.id, ownerId: p.ownerId, officerId: daimyoOff.id });

        }

      }

    });



    this.activeOfficers.forEach(off => {

      // ★【最重要】生存中の大名は、シナリオ補正や城代配置で絶対に大名フラグを解除せず、所属も変更しない

      // ただしシナリオ開始時に demoteDaimyo 指定（例：1438 伊東祐堯は家督前）のある武将は除く

      const demote = this._isSwitchingScenario && scenarioAffiliations[off.id] && scenarioAffiliations[off.id].demoteDaimyo;

      if (off.isDaimyo && !off.isDead && ownersSet.has(off.clanId) && !demote) return;



      // ゲーム進行中（年越し・イベント時）の保護ガード（シナリオ初期配置の上書きを防ぐ）

      if (!this._isSwitchingScenario) {

        // プレイヤー配下に仕官済みの武将は、年が変わってもシナリオ補正で引き抜かない

        if (off.clanId === this.playerClanId && ownersSet.has(this.playerClanId)) return;

        // 領地を持つ家の武将（新独立大名含む）は、シナリオ初期所属で別勢力に引き抜かれない

        if (ownersSet.has(off.clanId) && ['goryokaku', 'saigo_gun', 'amakusa', 'sue', 'matsunaga', 'kunohe', 'yui', 'oshio'].includes(off.clanId)) return;

      }



      // シナリオ固有の所属・配置は、武将マスターの既定所属より優先する。

      const scenarioOverride = scenarioAffiliations[off.id];
      const scenarioOverrideClan = scenarioOverride && hkLegacyClan(typeof scenarioOverride === 'string' ? scenarioOverride : scenarioOverride.clanId);

      if (scenarioOverride && !isFallenScenarioClan(scenarioOverrideClan)) {

        if (typeof scenarioOverride === 'string') {

          off.clanId = hkLegacyClan(scenarioOverride);

          return;

        }

        if (scenarioOverride.clanId) off.clanId = hkLegacyClan(scenarioOverride.clanId);

        if (scenarioOverride.defaultProv) off.defaultProv = scenarioOverride.defaultProv;

        if (scenarioOverride.assignedProvId) {
          const isDaimyoRole = !!(off.isDaimyo || (this._isSwitchingScenario && scenarioOverride.isDaimyo));
          const isCapTarget = this.isCapitalProvince(scenarioOverride.assignedProvId, off.clanId);
          const targetProv = (this.provinces || []).find(p => p.id === scenarioOverride.assignedProvId);
          if (isDaimyoRole || (!isCapTarget && scenarioOverride.isCastleLord !== false && (this._isSwitchingScenario || (targetProv && targetProv.governorId === off.id)))) {
            off.assignedProvId = scenarioOverride.assignedProvId;
          }
        }

        else if (scenarioOverride.clearAssignment) off.assignedProvId = null;

        // ★【世継ぎ大名保護】isDaimyo はシナリオ開始時（switchScenario）のみ適用し、ゲーム進行中は家督相続した大名を剥奪しない

        if (this._isSwitchingScenario && typeof scenarioOverride.isDaimyo === 'boolean') {

          off.isDaimyo = scenarioOverride.isDaimyo;

        }

        if (off.clanId === 'ronin') {

          off.assignedProvId = null;

          off.isDaimyo = false;

        }

        return;

      }



      // 【史実城代・配置武将の絶対保証】

      // シナリオの史実城代（SCENARIO_HISTORICAL_GOVERNORS）に指名されている武将は、

      // その領国の領主（ownerId）に確実に配属（浪人化・城主不在を完全防止）

      const myGovProv = Object.keys(scenGovMap).find(pId => scenGovMap[pId] === off.id);

      if (myGovProv) {

        const pObj = this.provinces.find(p => p.id === myGovProv);

        const provOwner = pObj ? pObj.ownerId : null;

        // 本拠（当主の居城）は城代を置かないので、そこへの指名では他家へ移さない

        if (provOwner && ownersSet.has(provOwner) && !this.isCapitalProvince(myGovProv, provOwner)) {

          // シナリオ当主は城代名簿で吸収しない（清衡が義家配下になる、など）

          if (this.isNamedLandedLeader(off)) return;

          off.clanId = provOwner;

          off.isDaimyo = false;

          off.defaultProv = myGovProv;

          off.assignedProvId = myGovProv;

          return;

        }

      }



      // 秀頼は浪人・所領のない家にいるときだけ豊臣本家へ戻す。仕官中の武将は引き抜かない

      if (ownersSet.has('toyotomi') && this.isHideyoriOfficer(off) && !this.isServingLandedClan(off, ownersSet)) {

        off.clanId = 'toyotomi';

        return;

      }



      // 時代・シナリオ固有の所属は data.js の OFFICER_AFFILIATION_RULES（ID完全一致）で適用

      if (this.applyOfficerAffiliationRules(off, { year, scenId: scen && scen.id, ownersSet, isFallenScenarioClan })) return;



      // 一門ロスター（ID集合）による城代領国への配属

      const familyRosters = window.OFFICER_FAMILY_ROSTERS || {};

      const assignByFamily = (familyKey, fallbackProvIds) => {

        const ids = familyRosters[familyKey] || [];

        if (!this.officerIdIn(off, ids)) return false;

        const target = provCastellans.find(c => {

          const cOff = this.activeOfficers.find(o => o.id === c.officerId);

          return cOff && this.officerIdIn(cOff, ids);

        }) || (fallbackProvIds || []).map(pid => provCastellans.find(c => c.provId === pid && ownersSet.has(c.ownerId))).find(Boolean);

        if (!target) return false;

        off.clanId = target.ownerId;

        off.isDaimyo = false;

        off.assignedProvId = null;

        if (!this.provinces.some(p => p.id === off.defaultProv && p.ownerId === target.ownerId)) off.defaultProv = target.provId;

        return true;

      };

      if (assignByFamily('chosokabe', ['tosa_kochi', 'tosa_aki', 'tosa_gun', 'tosa_nakamura', 'tosa'])) return;

      if (assignByFamily('nanbu', ['rikuchu', 'rikuchu_morioka', 'rikuchu_kamiheii', 'rikuchu_shimoheii', 'rikuchu_hienuki', 'rikuchu_waga', 'mutsu_nanbu'])) return;



      const homeClan = clanBefore.get(off.id) || off.clanId;



      // 主家が地図上に残っていれば、ゆかりの地が他家領でも主家の家臣のまま（他家吸収・浪人化しない）

      if (homeClan && homeClan !== 'ronin' && homeClan !== 'independent' && ownersSet.has(homeClan)) {

        off.clanId = homeClan;

        return;

      }



      // 主家が地図にないときは data.js の CLAN_SERVICE_FALLBACKS（年代つき）で史実の仕官先へ

      if (this.applyClanServiceFallback(off, homeClan, year, ownersSet)) return;



      // 朝廷・院・公家方は、城代の配置先を理由に武家へ吸収しない

      const nonAbsorbable = new Set(window.NON_ABSORBABLE_CLANS || ['heian_court', 'court']);



      // 一般一門：元々の主家clanIdが一致する城主がいる領国へ配属（城主の多い主家を優先）

      if (homeClan && homeClan !== 'ronin' && homeClan !== 'independent' && homeClan !== 'court' && !nonAbsorbable.has(homeClan)) {

        const matches = provCastellans.filter(c => {

          const cOff = this.activeOfficers.find(o => o.id === c.officerId);

          if (!cOff) return false;

          const cOrig = clanBefore.get(cOff.id) || cOff.clanId;

          return cOrig === homeClan;

        });

        const votes = new Map();

        matches.forEach(c => votes.set(c.ownerId, (votes.get(c.ownerId) || 0) + 1));

        const target = matches.slice().sort((a, b) => (votes.get(b.ownerId) || 0) - (votes.get(a.ownerId) || 0))[0];

        if (target) {

          off.clanId = target.ownerId;

          off.isDaimyo = false;

          off.assignedProvId = null;

          // 自分のゆかりの地が新しい主家の領内にあれば、それを上書きしない（本拠・城主選びに使う）

          if (!this.provinces.some(p => p.id === off.defaultProv && p.ownerId === target.ownerId)) off.defaultProv = target.provId;

          return;

        }

      }



      // 2. 所属大名が不在の武将は「浪人（諸国流浪・未仕官）」とし、仕官・登用の対象とする

      // 滅んだ家の旧臣を征服大名へ自動で吸収せず、浪人として登場させる

      // 天皇・親王は浪人にしない。新政府が地図に出るまで登場させない。

      if (this.isCourtFigure(off)) return;



      off.clanId = 'ronin';

      off.assignedProvId = null;

      off.isDaimyo = false;

      if (off.id === 'off_ashikaga_yoshiaki' && !scenarioAffiliations[off.id]) {

        off.defaultProv = 'bingo';

        off.assignedProvId = null;

      }

    });



    this.activeOfficers = this.activeOfficers.filter(off => {

      if (!this.isCourtFigure(off)) return true;

      return ownersSet.has(off.clanId);

    });



    // 領地のない滅家の名跡を浪人の山にしない。史実城代に指名した者だけ残す。

    if (scen && scen.fieldLandedOnly) {

      const govIds = new Set(Object.values(

        (window.SCENARIO_HISTORICAL_GOVERNORS && window.SCENARIO_HISTORICAL_GOVERNORS[String(scen.id)]) || {}

      ));

      // シナリオの keepRonin に指定した武将は浪人のまま残す（例：1702 の榊原政邦）

      const keepRonin = new Set(Array.isArray(scen.keepRonin) ? scen.keepRonin : []);

      this.activeOfficers = this.activeOfficers.filter(off => off.clanId !== 'ronin' || govIds.has(off.id) || keepRonin.has(off.id));

    }



    // 他家へ移った元当主は、移動先の当主にしない（史実振り替えは配下としての移籍）

    this.activeOfficers.forEach(off => {

      if (clanBefore.get(off.id) !== off.clanId) off.isDaimyo = false;

      if (off.id === 'off_ashikaga_yoshiaki' && off.clanId === 'ronin' && !(this._isSwitchingScenario && scenarioAffiliations[off.id])) {

        off.defaultProv = 'bingo';

        off.assignedProvId = null;

      }

    });

    // 津軽の大浦氏は浪岡家が大名の場合は浪人とする

    const hasNamiokaDaimyo = ownersSet.has('namioka') && !ownersSet.has('tsugaru');

    if (hasNamiokaDaimyo) {

      this.activeOfficers.forEach(off => {

        const isOura = off.id === 'off_jd_013' || off.id === 'off_tsugaru_tamenobu' || (off.name && (off.name.startsWith('大浦') || off.name === '津軽為信'));

        if (isOura) {

          off.clanId = 'ronin';

          off.assignedProvId = null;

          off.isDaimyo = false;

          off.defaultProv = 'mutsu_tsugaru';

        }

      });

    }



    this.activeOfficers.forEach(off => {

      if (!off.clanId || off.clanId === 'ronin') {

        off.clanId = 'ronin';

        off.assignedProvId = null;

        off.isDaimyo = false;

      }

    });



    this.reconcileDaimyoWithMap();

  },



  // 史実名簿上の当主名（生存中の isDaimyo には依存しない）,



  getRosterLeaderName(ownerId) {

    if (ownerId === 'anesanokoji' || ownerId === 'anesakoji') ownerId = 'anekoji';

    if (ownerId === 'hattori') ownerId = 'momochi';

    if (ownerId === 'saika') ownerId = 'suzuki';



    const profile = (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA[ownerId]) ? window.CLAN_MASTER_DATA[ownerId] : null;

    if (profile && profile.leaders) {

      const curY = Number(this.year || 0);

      const validYears = Object.keys(profile.leaders)

        .map(Number)

        .filter(y => !isNaN(y) && y <= curY)

        .sort((a, b) => b - a);

      if (validYears.length > 0) return profile.leaders[String(validYears[0])];

      if (profile.leaders.default) return profile.leaders.default;

    }

    const playable = this.currentScenario?.playables?.find(d => d.id === ownerId);

    return playable?.name || '';

  },



  // 領地を持つ家のシナリオ当主は、城代名簿で他家の配下にしない,



  isNamedLandedLeader(off) {

    if (!off || !off.name) return false;

    const owners = new Set((this.provinces || []).map(p => p.ownerId).filter(Boolean));

    const playables = this.currentScenario?.playables || [];

    for (const clanId of owners) {

      const playable = playables.find(d => d.id === clanId);

      if (playable && playable.name) {

        if (this.leaderNamesMatch(off.name, playable.name)) return true;

        continue;

      }

      if (this.leaderNamesMatch(off.name, this.getRosterLeaderName(clanId))) return true;

    }

    return false;

  },



  leaderNamesMatch(a, b) {

    if (!a || !b) return false;

    if (a === b) return true;

    // 別名は data.js の LEADER_NAME_ALIASES（完全一致のグループ）だけで名寄せする。部分一致はしない

    const groups = window.LEADER_NAME_ALIASES || [];

    const canon = (n) => {

      const g = groups.find(arr => Array.isArray(arr) && arr.includes(n));

      return g ? g[0] : n;

    };

    return canon(a) === canon(b);

  },



  isHideyoriOfficer(off) {

    if (!off) return false;

    return off.id === 'off_dm_toyotomi_1600' || off.id === 'off_toyotomi_hideyori';

  },







  // 武将IDがID配列（OFFICER_AFFILIATION_RULES / 一門ロスター）に含まれるか（ID完全一致）,



  officerIdIn(off, ids) {

    if (!off || !off.id || !ids) return false;

    if (ids instanceof Set) return ids.has(off.id);

    return Array.isArray(ids) && ids.includes(off.id);

  },



  // 主家が地図にない武将を、年代に応じた史実の仕官先へ（data.js の CLAN_SERVICE_FALLBACKS）,



  applyClanServiceFallback(off, homeClan, year, ownersSet) {

    if (!off || !homeClan) return false;

    const list = window.CLAN_SERVICE_FALLBACKS || [];

    for (const fb of list) {

      if (!fb || !Array.isArray(fb.clanIds) || !fb.clanIds.includes(homeClan)) continue;
      // inPlayOnly: ゲーム進行中の滅亡時だけ有効（シナリオ開始時の所属は変えない）。officerIds で人物限定、excludeOfficerIds で除外（2026-11-22 M）
      if (fb.inPlayOnly && this._isSwitchingScenario) continue;
      if (Array.isArray(fb.officerIds) && !fb.officerIds.includes(off.id)) continue;
      if (Array.isArray(fb.excludeOfficerIds) && fb.excludeOfficerIds.includes(off.id)) continue;

      if (fb.fromYear != null && year < fb.fromYear) continue;

      if (fb.toYear != null && year > fb.toYear) continue;

      if (!ownersSet.has(fb.setClanId)) continue;

      off.clanId = fb.setClanId;

      off.isDaimyo = false;

      off.assignedProvId = null;

      // その年の所領が仕官先の領内なら、そこを拠点に

      const fief = officerFiefAt(off, year);

      if (fief && fief.province && (!fief.clan || fief.clan === fb.setClanId)

        && (this.provinces || []).some(p => p.id === fief.province && p.ownerId === fb.setClanId)) off.defaultProv = fief.province;

      return true;

    }

    return false;

  },



  applyOfficerAffiliationRules(off, { year, scenId, ownersSet, isFallenScenarioClan }) {

    const rules = window.OFFICER_AFFILIATION_RULES || [];

    for (const rule of rules) {

      if (!rule || !this.officerIdIn(off, rule.officerIds || [])) continue;

      if (rule.unlessOwner && ownersSet.has(rule.unlessOwner)) continue;

      if (rule.fromYear != null || rule.toYear != null) {

        // 年代幅（fromYear〜toYear）。シナリオ指定があればそちらでも可

        const scenOk = rule.scenarioIds && rule.scenarioIds.some(id => String(id) === String(scenId));

        const inRange = (rule.fromYear == null || year >= rule.fromYear) && (rule.toYear == null || year <= rule.toYear);

        if (!inRange && !scenOk) continue;

      } else if (rule.years && rule.years.length) {

        const scenOk = rule.scenarioIds && rule.scenarioIds.some(id => String(id) === String(scenId));

        if (!rule.years.includes(year) && !scenOk) continue;

      } else if (rule.scenarioIds && rule.scenarioIds.length) {

        if (!rule.scenarioIds.some(id => String(id) === String(scenId))) continue;

      }

      if (rule.requireOwners && rule.requireOwners.length) {

        if (!rule.requireOwners.some(c => ownersSet.has(c))) continue;

      }
      // ゲーム進行中に滅亡した家への所属を指すルールは適用しない（2026-11-22 K）
      if (isFallenScenarioClan && isFallenScenarioClan(rule.setClanId)) continue;

      const wasLordOfTarget = off.clanId === rule.setClanId && !!off.isDaimyo;

      off.clanId = rule.setClanId;

      if (rule.setDaimyo === false && !wasLordOfTarget) off.isDaimyo = false;

      if (rule.setDaimyo === true) off.isDaimyo = true;

      // すでにその家の当主なら当主のまま（2026-10-11 be）

      if (rule.keepDaimyoIfSameClan && wasLordOfTarget) off.isDaimyo = true;

      if (rule.setDefaultProv) off.defaultProv = rule.setDefaultProv;

      if (rule.setAssignedProv) off.assignedProvId = rule.setAssignedProv;

      // その国を主家が持っていればそこ、無ければ主家の本拠に置く（2026-10-11 be）

      if (rule.placeInOwnedProv && !off.isDaimyo) {

        const owned = (this.provinces || []).filter(p => p.ownerId === rule.setClanId);

        const pick = owned.find(p => p.id === rule.placeInOwnedProv)

          || owned.find(p => this.isCapitalProvince(p.id, rule.setClanId))

          || owned[0];

        if (pick) {

          off.defaultProv = pick.id;

          off.assignedProvId = null;

        }

      }

      if (rule.clearAssignment) {

        off.assignedProvId = null;

        off.isStandby = true;

      }

      if (off.clanId === 'ronin') {

        off.assignedProvId = null;

        off.isDaimyo = false;

      }

      return true;

    }

    return false;

  },



  /** ダイアログ表示直前に発火済みフラグを立てる。既に発火済みなら false */



  markHistoricalEventTriggered(eventId) {

    this.triggeredHistoricalEvents = this.triggeredHistoricalEvents || new Set();

    this.happenedEvents = this.happenedEvents || new Set();

    if (!eventId) return false;

    if (this.triggeredHistoricalEvents.has(eventId)) return false;

    this.triggeredHistoricalEvents.add(eventId);

    this.happenedEvents.add(eventId);

    return true;

  },



  isHistoricalEventBusy() {

    if (this.isVirtualScenario()) return false;

    return !!(this._historyQueueRunning

      || this._historyEventDone

      || this._historyCheckPending

      || (this.pendingHistoryQueue && this.pendingHistoryQueue.length)

      || this.isEventChoiceOpen());

  },



  /** 歴史イベント判定を予約する。予約中は季節を進めないので、連打で季節イベントを飛ばさない */



  scheduleHistoricalEventCheck(delayMs = 0) {

    if (this.isVirtualScenario()) {

      this._historyCheckPending = false;

      if (this._historyCheckTimer) {

        clearTimeout(this._historyCheckTimer);

        this._historyCheckTimer = null;

      }

      return;

    }

    this._historyCheckPending = true;

    if (this._historyCheckTimer) {

      clearTimeout(this._historyCheckTimer);

      this._historyCheckTimer = null;

    }

    const run = () => {

      this._historyCheckTimer = null;

      // 合戦中は判定を見送らず、合戦が終わるまで待ってから同じ季節の判定を行う

      if (this.inBattle) {

        this._historyCheckTimer = setTimeout(run, 500);

        return;

      }

      // 浪人の仕官の願い出がすべて片付くまで、イベントは出さずに待つ

      if (this.hasPendingRoninRequests && this.hasPendingRoninRequests()) {

        this._historyCheckTimer = setTimeout(run, 300);

        return;

      }

      this._historyCheckPending = false;

      this.checkHistoricalEvents();

    };

    if (delayMs > 0) this._historyCheckTimer = setTimeout(run, delayMs);

    else run();

  },



  /** 合戦で中断した歴史イベントの待ち行列を、合戦後に再開する */



  resumeHistoryQueueWhenFree() {

    if (this._historyQueueResumeTimer) return;

    const tick = () => {

      this._historyQueueResumeTimer = null;

      if (!this.pendingHistoryQueue || !this.pendingHistoryQueue.length) return;

      if (this.inBattle || this._historyQueueRunning) {

        this._historyQueueResumeTimer = setTimeout(tick, 500);

        return;

      }

      void this.processHistoricalEventQueue();

    };

    this._historyQueueResumeTimer = setTimeout(tick, 500);

  },



  // 全国オールスター群雄割拠の登場武将名簿（最大500名）。

  // 各家の当主＋重臣（能力上位）を最低数確保し、残り枠を全体の能力・知名度上位で埋める。

  getAllstarFeudalRoster(clanIds, affiliations) {
    const key = [...(clanIds || [])].sort().join(',');
    if (this._allstarRosterCache && this._allstarRosterCache.key === key) return this._allstarRosterCache.set;
    const LIMIT = 498, MIN_PER_CLAN = 4, PER_PROV = 2, MAX_PER_CLAN = 14, RONIN_SLOTS = 10;
    const score = o => {
      const m = Number(o.military) || 0, p = Number(o.politic) || 0, i = Number(o.intel) || 0;
      return m + p + i + Math.max(m, p, i) * 0.5 + (o.comment ? 15 : 0) + ((o.lore || '').length > 80 ? 10 : 0) + (o.isDaimyo ? 20 : 0);
    };
    // 所属指定は文字列（家ID）でも {clanId: ...} でもよい（2026-11-09: オブジェクト形式が無視され、名将が名簿から漏れていた）
    const affClan = (a) => (a && typeof a === 'object') ? (a.clanId || a.clan || null) : (a || null);
    const affs = affiliations || {};
    const provCount = {};
    (this.provinces || []).forEach(pv => { if (pv.ownerId) provCount[pv.ownerId] = (provCount[pv.ownerId] || 0) + 1; });
    const masterById = new Map((window.OFFICERS_MASTER || []).map(o => [o.id, o]));
    const keep = new Set();
    const keptNames = new Set();
    const clanTaken = {};
    const playables = this.currentScenario?.playables || [];
    const normName = (n) => String(n || '').replace(/\s*[（(][^）)]+[）)]/g, '').trim();
    // 同名の別IDは一人だけ（同じ人物が二家に現れないように）
    const take = (o, c, force = false) => {
      if (!o || keep.has(o.id)) return false;
      const nm = normName(o.name);
      if (nm && keptNames.has(nm)) return false;
      if (!force && c !== 'ronin' && (clanTaken[c] || 0) >= MAX_PER_CLAN) return false;
      keep.add(o.id); if (nm) keptNames.add(nm);
      clanTaken[c] = (clanTaken[c] || 0) + 1;
      return true;
    };
    // 1) 各家の当主（シナリオ指定の officerId）
    playables.forEach(pl => { if (pl && pl.officerId && clanIds && clanIds.has(pl.id)) take(masterById.get(pl.officerId), pl.id, true); });
    // 2) シナリオで所属を指定した名将（家臣・浪人）。追加武将IDの除外規則より優先する
    Object.keys(affs).forEach(id => {
      const c = affClan(affs[id]);
      if (!c || (c !== 'ronin' && !(clanIds && clanIds.has(c)))) return;
      take(masterById.get(id), c, true);
    });
    const byClan = new Map();
    const ronin = [];
    for (const o of window.OFFICERS_MASTER || []) {
      if (keep.has(o.id)) continue;
      const eff = affClan(affs[o.id]) || o.clanId;
      // 応仁の乱向け追加武将（off_onin2_）はオールスター名簿の選定対象外（名簿を従来どおりに保つ）
      // 配置仕様（place_*.json）由来の追加武将（off_pl）も同様に対象外
      if (String(o.id).startsWith('off_onin2_') || /^off_pl\d+_/.test(String(o.id))) continue;
      // 後年登場武将（lateDebut / off_mod_）もオールスター名簿の選定対象外
      if (o.lateDebut) continue;
      if (eff === 'ronin') { ronin.push(o); continue; }
      if (!eff || !clanIds || !clanIds.has(eff)) continue;
      if (!byClan.has(eff)) byClan.set(eff, []);
      byClan.get(eff).push(o);
    }
    const pool = [];
    for (const [c, list] of byClan) {
      list.sort((a, b) => score(b) - score(a) || String(a.id).localeCompare(String(b.id)));
      if (!clanTaken[c]) {
        const pl = playables.find(d => d.id === c);
        const names = [pl && pl.name, pl && pl.leaderName, this.getRosterLeaderName(c)].filter(Boolean);
        const leader = list.find(o => names.some(n => this.leaderNamesMatch(o.name, n)))
          || list.find(o => o.isDaimyo) || list[0];
        if (leader) take(leader, c);
      }
      const need = Math.min(MAX_PER_CLAN, Math.max(MIN_PER_CLAN, (provCount[c] || 1) * PER_PROV));
      for (const o of list) { if ((clanTaken[c] || 0) >= need) break; take(o, c); }
      list.forEach(o => { if (!keep.has(o.id)) pool.push([o, c]); });
    }
    pool.sort((a, b) => score(b[0]) - score(a[0]) || String(a[0].id).localeCompare(String(b[0].id)));
    for (const [o, c] of pool) {
      if (keep.size >= LIMIT - RONIN_SLOTS) break;
      take(o, c);
    }
    ronin.sort((a, b) => score(b) - score(a));
    for (const o of ronin) { if (keep.size >= LIMIT) break; take(o, 'ronin'); }
    this._allstarRosterCache = { key, set: keep };
    return keep;
  },



  isServingLandedClan(off, ownersSet) {

    if (!off?.clanId || off.clanId === 'ronin' || off.clanId === 'toyotomi') return false;

    return ownersSet.has(off.clanId);

  },



  // 当主は「地図上に領国がある勢力」につき1人だけ。領地のない家の旗は外す。,



  reconcileDaimyoWithMap() {

    if (!this.activeOfficers || !this.provinces) return;

    const owners = new Set(this.provinces.map(p => p.ownerId).filter(Boolean));



    this.activeOfficers.forEach(o => {

      if (!owners.has(o.clanId)) o.isDaimyo = false;

      if (!o.clanId || o.clanId === 'ronin') {

        o.clanId = 'ronin';

        o.isDaimyo = false;

        o.assignedProvId = null;

        o.isCastellan = false;

      }

    });



    owners.forEach(ownerId => {

      const flagged = this.activeOfficers.filter(o => o.clanId === ownerId && o.isDaimyo && !o.isDead);

      if (flagged.length <= 1) return;



      const rosterName = this.getRosterLeaderName(ownerId);

      const capitalId = window.CLAN_CAPITAL_PROVINCES ? window.CLAN_CAPITAL_PROVINCES[ownerId] : null;

      const score = (o) => {

        const prov = o.assignedProvId

          ? this.provinces.find(p => p.id === o.assignedProvId && p.ownerId === ownerId && p.governorId === o.id)

          : null;

        let s = 0;

        if (prov && (prov.id === capitalId || this.isCapitalProvince(prov.id, ownerId))) s += 4;

        else if (prov) s += 2;

        if (this.leaderNamesMatch(o.name, rosterName)) s += 3;

        return s;

      };

      flagged.sort((a, b) => score(b) - score(a));

      const keep = flagged[0];

      flagged.forEach(o => {

        if (o.id !== keep.id) o.isDaimyo = false;

      });

    });

  },



  // 蝦夷から薩摩まで、地方を北から南、地方内も北から南,



  provinceGeoRank(provId) {

    // 地図データの mapNo は北海道から琉球まで北→南に連番で付与した表示ID。
    // 追加領国を含め、勢力一覧や同率時の並びもこの番号と一致させる。
    const masterProvince = (window.PROVINCES_DATA || []).find(p => p.id === provId);
    if (Number.isFinite(Number(masterProvince?.mapNo))) return Number(masterProvince.mapNo) - 1;

    return 10000;

  },



  officerBaseProvinceId(off) {

    if (!off) return '';

    if (off.assignedProvId) return off.assignedProvId;

    if (off.clanId === 'ronin') return off.defaultProv || '';

    // その年の所領（fiefs）が自勢力領なら、そこで待機中

    const fief = officerFiefAt(off, this.year);

    if (fief && fief.province && (this.provinces || []).some(p => p.id === fief.province && p.ownerId === off.clanId)) return fief.province;

    // 自勢力が領有しているゆかりの支城（城主と同族など）があれば、その領国で待機中

    if (off.defaultProv) {

      const ownedBranch = (this.provinces || []).find(p => p.id === off.defaultProv && p.ownerId === off.clanId);

      if (ownedBranch) return ownedBranch.id;

    }

    const home = this.getDaimyoHomeProvince(off);

    return home ? home.id : (off.defaultProv || '');

  },



  // 当主の居城は、その家が現に領有している国だけを返す,



  getDaimyoHomeProvince(off) {

    if (!off || !off.clanId || off.clanId === 'ronin') return null;

    const owned = (this.provinces || []).filter(p => p.ownerId === off.clanId);

    if (owned.length === 0) return null;

    const capId = window.CLAN_CAPITAL_PROVINCES && window.CLAN_CAPITAL_PROVINCES[off.clanId];

    if (capId) {

      const cap = owned.find(p => p.id === capId);

      if (cap) return cap;

    }

    return owned.find(p => this.isCapitalProvince(p.id, off.clanId)) || this.pickFallbackCapital(owned, off.clanId) || owned[0];

  },



  // 領国奪取時の城主解任・退避・滅亡処理 (要件4 & 捕縛連携),



  handleProvinceLoss(dstProv, oldOwnerId, isPlayerConquest = false) {

    if (!dstProv || !oldOwnerId) return;



    const oldGovId = dstProv.governorId;

    // 1. 必ず陥落した城の governorId = null にリセット

    dstProv.governorId = null;



    // 陥落時の城主武将を取得

    const gov = oldGovId ? (this.activeOfficers || []).find(o => o.id === oldGovId) : null;

    const remainingProvs = this.provinces.filter(p => p.ownerId === oldOwnerId && p.id !== dstProv.id);

    const isDestroyed = (remainingProvs.length === 0);

    if (isDestroyed && oldOwnerId !== this.playerClanId) this.showClanDestroyedAlert(oldOwnerId);



    // 【フェーズ1: 本拠地陥落時の大名逃亡・遷都フェイルセーフ】

    // 城主が大名かどうかの判定(gov.isDaimyo)に依存せず、陥落した領国が本拠地だった場合は確実に残存領国(remainingProvs[0])へ本拠地を移転

    const isCapitalLoss = (window.CLAN_CAPITAL_PROVINCES && window.CLAN_CAPITAL_PROVINCES[oldOwnerId] === dstProv.id) || this.isCapitalProvince(dstProv.id, oldOwnerId);

    if (isCapitalLoss && !isDestroyed && remainingProvs.length > 0) {

      const escapeProv = remainingProvs[0];

      if (window.CLAN_CAPITAL_PROVINCES) {

        window.CLAN_CAPITAL_PROVINCES[oldOwnerId] = escapeProv.id;

      }

      const daimyo = (this.activeOfficers || []).find(o => o.clanId === oldOwnerId && o.isDaimyo && !o.isDead);

      const daimyoName = daimyo ? daimyo.name : this.getDaimyoLeaderName(oldOwnerId);

      this.log(`🏛️【本拠陥落・遷都】${this.getClanFamilyName(oldOwnerId)}の本拠地・${dstProv.name}が陥落したため、${daimyoName}公は${escapeProv.name}へと本拠地を移転しました。`, 'quiet');

    }



    // 陥落した城にいた大名・待機武将が敵領地に取り残されないよう所在を安全に解除

    (this.activeOfficers || []).forEach(o => {

      if (o.clanId === oldOwnerId && o.assignedProvId === dstProv.id) {

        o.assignedProvId = null;

      }

    });



    if (gov) {

      // 2. 陥落時に城主がいた場合、その武将の assignedProvId = null にする

      gov.assignedProvId = null;



      // 3. もしその城主が大名（isDaimyo: true）だった場合

      if (gov.isDaimyo) {

        if (!isDestroyed) {

          // 他に自勢力の領国が残っていれば、そちらへ本拠地を移して逃亡した旨をログ出力

          const escapeProv = remainingProvs[0];

          if (window.CLAN_CAPITAL_PROVINCES) {

            window.CLAN_CAPITAL_PROVINCES[oldOwnerId] = escapeProv.id;

          }

          this.log(`🏃【本拠陥落・当主退避】${gov.name}公は居城を脱出し、${escapeProv.name}へと本拠地を移して退避しました！`, 'quiet');

        } else {

          // 最後の領国だった場合

          if (!isPlayerConquest) {

            // AI同士の滅亡なら自刃（オールスターでは斬首以外で死なないため、落ち延びて浪人となる）
            if (this.isAllstarImmortalScenario()) {
              gov.isDaimyo = false; gov.clanId = 'ronin'; gov.assignedProvId = null;
              this.log(`【御家滅亡・落ち延び】${gov.name}公は最後の居城を落とされ、${this.getClanFamilyName(oldOwnerId)}は滅亡しました。${gov.name}公は落ち延びて浪人となりました。`, 'important');
            } else {
            gov.isDead = true;
            this.log(`【御家滅亡・自刃】${gov.name}公は最後の居城にて討死または自刃し、${this.getClanFamilyName(oldOwnerId)}は滅亡しました……`, 'important');
            }

          }

          // プレイヤー攻略時は捕縛処理(handleCapturedOfficers)にて処断

        }

      } else {

        // 4. 一般武将だった場合

        if (!isDestroyed) {

          this.log(`🏃【城主敗走】城主・${gov.name}は陥落する城から落ち延び、本国へと逃げ帰りました（待機状態）。`, 'quiet');

        } else {

          if (!isPlayerConquest) {

            // AI同士で滅亡した場合は浪人化

            gov.clanId = 'ronin';

            // 【追加】元大名だった場合も含め大名フラグを初期化

            gov.isDaimyo = false;

            if (gov.id === 'off_ashikaga_yoshiaki') {

              gov.defaultProv = 'bingo';

              gov.assignedProvId = null;

            }

            this.log(`🍂【旧臣浪人】${gov.name}は主家滅亡に伴い浪人となりました。`);

          }

        }

      }

    } else {

      // 城主不在でも最後の領国なら

      if (isDestroyed && !isPlayerConquest) {

        const oldDaimyo = (this.activeOfficers || []).find(o => o.clanId === oldOwnerId && o.isDaimyo && !o.isDead);

        if (oldDaimyo) {

          if (this.isAllstarImmortalScenario()) { oldDaimyo.isDaimyo = false; oldDaimyo.clanId = 'ronin'; } else oldDaimyo.isDead = true; // オールスターは落ち延びて浪人

          oldDaimyo.assignedProvId = null;

        }

      }

    }



    // AI同士で滅亡した場合、残る全家臣（城にいなかった当主を含む）を浪人化

    if (isDestroyed && !isPlayerConquest) {

      (this.activeOfficers || []).forEach(o => {

        if (o.clanId === oldOwnerId && !o.isDead) {

          o.clanId = 'ronin';

          o.assignedProvId = null;

          o.isDaimyo = false;

          if (o.id === 'off_ashikaga_yoshiaki') {

            o.defaultProv = 'bingo';

            o.assignedProvId = null;

          }

        }

      });

    }



    if (isDestroyed) {

      this.removeClanFromAlliances(oldOwnerId);

    }

  },



  // 本拠の選び方（登録本拠が領内にないとき）：

  //  1) 存命当主のゆかりの地（defaultProv） 2) 家中の武将のゆかりの地（当主級→人数の多い国）

  //  3) 史実本拠（CLAN_CAPITAL_PROVINCES / シナリオ本拠 / CLAN_MASTER_DATA.capital_pref）

  //  4) 領国の地理的な中心に最も近い国。北端・石高最大では選ばない,



  pickFallbackCapital(owned, clanIdArg = null) {

    if (!owned || owned.length === 0) return null;

    const list = owned.filter(Boolean);

    if (list.length === 1) return list[0];

    const clanId = clanIdArg || list[0].ownerId;

    const byId = new Map(list.map(p => [p.id, p]));

    const homeOf = (o) => this.officerHomeProvince(o);

    const officers = (this.activeOfficers || []).filter(o => o && o.clanId === clanId && !o.isDead && homeOf(o));

    const power = (o) => (Number(o.military) || 0) + (Number(o.politic || o.politics) || 0) + (Number(o.intel || o.intelligence) || 0);



    // 1) 当主のゆかりの地

    const lords = officers.filter(o => o.isDaimyo).sort((a, b) => power(b) - power(a));

    for (const lord of lords) {

      if (byId.has(homeOf(lord))) return byId.get(homeOf(lord));

    }



    // 2) 家中のゆかりの地：大名経験者を重く、次に同郷の人数、同点は能力

    const votes = new Map();

    officers.forEach(o => {

      const home = homeOf(o);

      if (!byId.has(home)) return;

      const w = (o.hasBeenDaimyo || (this.formerDaimyoIds && this.formerDaimyoIds.has(o.id))) ? 5 : 1;

      const cur = votes.get(home) || { score: 0, best: 0 };

      cur.score += w;

      cur.best = Math.max(cur.best, power(o));

      votes.set(home, cur);

    });

    if (votes.size) {

      const [bestId] = [...votes.entries()].sort((a, b) => (b[1].score - a[1].score) || (b[1].best - a[1].best))[0];

      if (byId.has(bestId)) return byId.get(bestId);

    }



    // 3) 史実本拠

    const prefs = [];

    const scenCaps = (this.currentScenario && this.currentScenario.capitals) || {};

    if (scenCaps[clanId]) prefs.push(scenCaps[clanId]);

    prefs.push(...this.eraCapitalCandidates(clanId));

    const base = window.CLAN_CAPITAL_PROVINCES_BASE || {};

    if (base[clanId]) prefs.push(base[clanId]);

    const cur = window.CLAN_CAPITAL_PROVINCES || {};

    if (cur[clanId]) prefs.push(cur[clanId]);

    const master = (window.CLAN_MASTER_DATA || {})[clanId];

    if (master && Array.isArray(master.capital_pref)) prefs.push(...master.capital_pref);

    for (const pid of prefs) {

      if (byId.has(pid)) return byId.get(pid);

    }



    // 4) 地理的な中心

    return this.pickCentralProvince(list);

  },



  /** 武将本来のゆかりの地（OFFICERS_MASTER の defaultProv。所属替えで書き換わった値より優先） */



  officerHomeProvince(o) {

    if (!o) return '';

    const master = window.OFFICERS_MASTER || [];

    if (SengokuGame._homeProvSrc !== master) {

      SengokuGame._homeProvSrc = master;

      SengokuGame._homeProvMap = new Map(master.map(m => [m.id, m]));

    }

    const m = SengokuGame._homeProvMap.get(o.id);

    const fiefProv = m ? officerProvAtYear(m, this.year) : officerProvAtYear(o, this.year);

    return fiefProv || (m && m.defaultProv) || o.defaultProv || '';

  },



  /** 出身国（真の生国・本貫）。originProv が無ければ従来の defaultProv */

  officerOriginProv(o) {

    if (!o) return '';

    const m = (window.OFFICERS_MASTER || []).find(x => x.id === o.id);

    return (m && m.originProv) || o.originProv || (m && m.defaultProv) || o.defaultProv || '';

  },



  /** 国の中心座標（地図の cx/cy。無ければ PROVINCES_DATA） */



  pickCentralProvince(list) {

    if (!list || !list.length) return null;

    const pts = list.map(p => ({ p, c: this.provinceCenterXY(p) })).filter(item => item.c);

    if (!pts.length) {

      // 座標が無いときは北→南の並びの中央

      const sorted = list.slice().sort((a, b) => this.provinceGeoRank(a.id) - this.provinceGeoRank(b.id));

      return sorted[Math.floor((sorted.length - 1) / 2)];

    }

    const mx = pts.reduce((t, item) => t + item.c.x, 0) / pts.length;

    const my = pts.reduce((t, item) => t + item.c.y, 0) / pts.length;

    pts.sort((a, b) => {

      const da = (a.c.x - mx) ** 2 + (a.c.y - my) ** 2;

      const db = (b.c.x - mx) ** 2 + (b.c.y - my) ** 2;

      if (da !== db) return da - db;

      return (Number(b.p.kokudaka) || 0) - (Number(a.p.kokudaka) || 0);

    });

    return pts[0].p;

  },



  /** 勢力の現在の本拠（登録本拠が領内ならそれ、なければ pickFallbackCapital）。勢力選択画面の「本拠」もこれを使う */



  resolveClanCapitalId(clanId, ownedIds = null) {

    const owned = (this.provinces || []).filter(p => p.ownerId === clanId && (!ownedIds || ownedIds.includes(p.id)));

    if (!owned.length) return null;

    const registered = (window.CLAN_CAPITAL_PROVINCES || {})[clanId];

    if (registered && owned.some(p => p.id === registered)) return registered;

    const home = this.pickFallbackCapital(owned, clanId);

    return home ? home.id : owned[0].id;

  },






  isCourtFigure(off) {

    if (!off || !off.name) return false;

    return /天皇|上皇|法皇|神祇/.test(off.name);

  },



  // 史実イベントで「預かり」の城代を指定する。領地の主君は変えず、武将だけを家臣として座らせる。,



  appointHistoricalCastellans(appoint) {

    if (!appoint || !this.activeOfficers) return;

    for (const [pId, offId] of Object.entries(appoint)) {

      const prov = this.provinces.find(p => p.id === pId);

      if (!prov || !prov.ownerId) continue;

      const aliasId = (window.OFFICER_ID_ALIASES || {})[offId] || offId;

      const off = this.activeOfficers.find(o => o.id === offId || o.id === aliasId);

      if (!off || off.isDead || off.isDaimyo) continue;

      const prev = this.provinces.find(p => p.governorId === off.id);

      if (prev && prev.id !== prov.id) {

        prev.governorId = null;

      }

      off.clanId = prov.ownerId;

      off.isDaimyo = false;

      off.assignedProvId = prov.id;

      prov.governorId = off.id;

    }

  },
};
