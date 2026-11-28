/**
 * @file js/core/state/ScenarioInit.js - GameState から機能別に分割したメソッド群（15個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { INITIAL_ALLIANCE_DURATION_SEASONS, INITIAL_PROVINCES, SCENARIOS, SEASONS_PER_YEAR, buildFactionHeadsText, formatHistoricalYear, getClanAbility, legacySeasonIdxToNew, seasonIdxFromName } from '../GameStateShared.js?v=20261128_v74';

export const ScenarioInitMethods = {

  formatYear(year = this.year) {

    return formatHistoricalYear(year);

  },

  // index.html の年代別表記と同一の改名規則。表示箇所ごとに処理を
  // 重複させず、ゲーム内の名簿・詳細・城主表示を同じ名称へそろえる。
  getOfficerEraName(officer, year = this.year) {
    if (!officer) return '';
    const y = Number(year);
    // 年代別の名前は data/officers.json の eraNames（from 年以降はその名）で管理する（2026-11-14）
    let list = officer.eraNames;
    if (!Array.isArray(list)) {
      if (!this._eraNamesById) {
        this._eraNamesById = new Map();
        (window.OFFICERS_MASTER || []).forEach(m => { if (m && Array.isArray(m.eraNames)) this._eraNamesById.set(m.id, m.eraNames); });
      }
      list = this._eraNamesById.get(officer.id);
    }
    if (Array.isArray(list) && list.length) {
      let picked = null;
      for (const e of list) { if (e && (e.from == null || y >= e.from)) picked = e.name; }
      if (picked) return picked;
    }
    return officer.name || '';
  },

  applyEraOfficerNames() {
    (this.activeOfficers || []).forEach(off => {
      const name = this.getOfficerEraName(off, this.year);
      if (name) off.name = name;
    });
  },



  isFormerDaimyo(off) {

    if (!off) return false;

    if (off.hasBeenDaimyo || off.isDaimyo) return true;

    if (this.formerDaimyoIds && this.formerDaimyoIds.has(off.id)) return true;

    if (String(off.id).startsWith('off_daimyo_')) return true;

    const master = (window.OFFICERS_MASTER || []).find(m => m.id === off.id);

    if (master && master.isDaimyo) return true;

    return false;

  },



  initData() {

    const rawProvs = (window.PROVINCES_DATA && window.PROVINCES_DATA.length > 0) ? window.PROVINCES_DATA : (INITIAL_PROVINCES || []);

    this.provinces = JSON.parse(JSON.stringify(rawProvs));

    // 佐渡につながる経路は越後のみに限定する
    const sado = this.provinces.find(p => p && p.id === 'sado');
    if (sado) {
      sado.neighbors = ['echigo'];
    }
    this.provinces.forEach(p => {
      if (!p || !Array.isArray(p.neighbors)) return;
      if (p.id !== 'echigo') {
        p.neighbors = p.neighbors.filter(nId => nId !== 'sado');
      } else if (!p.neighbors.includes('sado')) {
        p.neighbors.push('sado');
      }
    });

    this.provinces.forEach(p => {

      p.governance = 'direct';

    });

  },



  normalizeProvince(p) {

    if (p && p.id) {

      const jp = this.getProvinceJapaneseName(p.id);

      if (jp && jp !== '諸国' && (!p.name || /^[a-z0-9_]+$/i.test(String(p.name)))) p.name = jp;

    }

    const isBad = v => v == null || !Number.isFinite(Number(v));

    const kokudaka = Number(p.kokudaka) || 0;

    // 駐留兵力: 石高×2.5%を千人未満切り捨て＋1000

    if (isBad(p.troops)) p.troops = this.getProvinceInitialTroops(kokudaka);

    // 兵糧・石高 (千石): 最大値（基準石高）の4割からスタート（越後も含む）

    if (isBad(p.rice)) {
      const baseKoku = Math.round(kokudaka / 1000);
      p.rice = Math.max(10, Math.round(baseKoku * 0.4));
    }

    // 商業 (貫): 石高÷2000 (10〜90貫)

    if (isBad(p.commerce)) p.commerce = this.getProvinceBaseCommerce ? this.getProvinceBaseCommerce(p) : Math.max(10, Math.round(kokudaka / 2000)); // 国ごとの商業係数（2026-10-11 cd）

    // 軍勢士気: マスターデータの忠誠度 (loyalty) を流用

    if (isBad(p.morale)) p.morale = Number(p.loyalty) || 80;

    // 城郭防御・治安度の補正（越後・相模は他国の1.5倍＝75）

    if (isBad(p.defense)) p.defense = (p.id === 'echigo') ? 200 : (p.id === 'kai' ? 100 : (p.id === 'sagami' ? 75 : 50));

    if (isBad(p.order)) p.order = 85;

  },

  getProvinceMaxDefense(p) {

    if (!p) return 100;

    const pid = typeof p === 'string' ? p : p.id;

    if (pid === 'echigo') return 200;

    if (pid === 'kai') return 150;

    if (pid === 'sagami') return 150;

    return 100;

  },



  getSeasonTrackKey() {

    // 大名家専用BGMが有効な場合、プレイヤー大名家のテーマを優先再生

    if (this.music && this.music.daimyoBgmEnabled && this.playerClanId) {

      const clanId = this.playerClanId;

      if (clanId === 'oda') return 'oda';

      if (clanId === 'takeda') return 'takeda';

      if (clanId === 'uesugi') return 'uesugi';

      if (clanId === 'date') return 'date';

      if (clanId === 'mori' || clanId === 'chosokabe') return 'mori_choso';

      if (clanId === 'shimazu') return 'shimazu';

      if (clanId === 'hojo') return 'hojo';

    }

    return this.seasonBgmTracks[this.seasonIdx] || 'spring';

  },



  looksLikeClanId(value) {

    return !value || /^[a-z0-9_]+$/i.test(String(value));

  },



  // 全領国オールスター群雄割拠：武将は斬首（処刑）以外では死なない（不老不死）（2026-11-09）
  isAllstarImmortalScenario() {
    const id = String(this.currentScenarioId || this.currentScenario?.id || '');
    return id === 'allstar_feudal' || id === 'allstar_shuffle';
  },

  isVirtualScenario() {

    if (this.currentScenario?.isVirtual || this.currentScenario?.category === 'virtual') return true;

    const id = String(this.currentScenarioId || this.currentScenario?.id || '');

    if (id === 'allstar_shuffle' || id === 'allstar_feudal' || id.startsWith('allstar')) return true;

    const scens = (typeof window !== 'undefined' && window.SCENARIOS_DATA && window.SCENARIOS_DATA.length > 0)

      ? window.SCENARIOS_DATA

      : (typeof SCENARIOS !== 'undefined' && Array.isArray(SCENARIOS) ? SCENARIOS : []);

    const scen = scens.find(s => String(s.id) === id);

    if (scen && (scen.isVirtual || scen.category === 'virtual')) return true;

    return false;

  },



  // 再開案内用。セーブ時点の当主名を日本語で返す（英語IDには落とさない）,



  async switchScenario(scenarioId) {

    this._isSwitchingScenario = true;

    this._virtualDeadOfficerIds = new Set();

    this.playerClanId = null;
    this.playerDaimyo = null;

    this.activeOfficers = null;

    this.currentScenarioId = scenarioId;

    // [81位] 領土推移履歴の初期化

    this.territoryHistory = [];

    const scens = (window.SCENARIOS_DATA && window.SCENARIOS_DATA.length > 0) ? window.SCENARIOS_DATA : (SCENARIOS || []);

    // 旧「超時空シャッフル乱世」は廃止。旧IDは全領国オールスターへ読み替える

    if (scenarioId === 'allstar_shuffle') { scenarioId = 'allstar_feudal'; this.currentScenarioId = scenarioId; }

    this._pendingSwitchScenarioId = scenarioId;

    // オールスターは本体JSONを使うため、スタブのままなら先に個別取得しておく
    if (scenarioId === 'allstar_feudal' && typeof window !== 'undefined' && window.DataLoader?.ensureScenario) {
      try { await window.DataLoader.ensureScenario('allstar_feudal'); } catch (_) {}
    }
    let scen = (scenarioId === 'allstar_feudal')

        ? this.createAllstarFeudalScenario()

        : (scens.find(s => String(s.id) === String(scenarioId)) || scens[0]);

    if (!scen) return;

    if (scen._isStub && typeof window !== 'undefined' && window.DataLoader?.ensureScenario) {

      document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.classList.toggle('selected', String(btn.dataset.scenId) === String(scenarioId));
      });
      const descEl = document.getElementById('scenarioDescBox');
      if (descEl && scen.desc) {
        descEl.textContent = scen.desc;
      }
      const grid = document.getElementById('daimyoGrid');
      if (grid) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding: 28px; color: #f1c40f; font-size: 13pt;">シナリオデータを読み込み中です…</div>';
      }
      try {
        await window.DataLoader.ensureScenario(scenarioId);
      } catch (err) {
        console.warn('switchScenario: failed to load full scenarios', err);
        this._isSwitchingScenario = false;
        if (grid) {
          grid.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding: 28px; color: #ff8888; font-size: 12pt;">シナリオデータの読み込みに失敗しました。再度お試しください。</div>';
        }
        return;
      }
      if (String(this._pendingSwitchScenarioId) !== String(scenarioId)) {
        return;
      }
      this._pendingSwitchScenarioId = null;
      return this.switchScenario(scenarioId);

    }

    this._pendingSwitchScenarioId = null;

    this.currentScenario = scen;



    this.year = scen.year;

    this.honnojiSplit = false;

    this.honnoujiAverted = false;

    this.okehazamaOccurred = false;

    this.kanazawaOccurred = false;

    this._kantoKanreiOccurred = scen.year > 1561;

    this._kantoKanreiIntegrated = scen.year > 1561;

    this._kenshinAnnounced = scen.year > 1561;

    this.triggeredHistoricalEvents = new Set();

    this.happenedEvents = new Set();

    this.oncePerPlaythroughFired = new Set(); // 1回だけのイベント（ui_fixed12）

    this._requeueOnceEvents = [];

    this.resetHistoricalEventRuntime();

    this.kiyohiraFujiwaraAccepted = false;

    this.kiyohiraSurnameDeclined = false;

    this._kiyohiraAnnounced = false;

    this.tenmuEnthronementAccepted = false;

    this.tenmuEnthronementDeclined = false;

    this._tenmuAnnounced = false;

    this.jimmuEnthronementAccepted = false;

    this.jimmuEnthronementDeclined = false;

    this._jimmuAnnounced = false;

    this.ambitionState = null; // 大名の志向（地方統一の達成状況）は新しい戦の開始ごとにリセット

    // シナリオの季節は旧4季表記（season: 春/夏/秋/冬, seasonIdx: 0-3）。seasonScheme:5 なら新表記
    this.seasonIdx = scen.seasonIdx !== undefined
      ? (scen.seasonScheme === SEASONS_PER_YEAR ? Number(scen.seasonIdx) : legacySeasonIdxToNew(scen.seasonIdx))
      : (seasonIdxFromName(scen.season) ?? 0);

    this.alliances = this.normalizeAlliances(scen.alliances || [], this.year, this.seasonIdx, INITIAL_ALLIANCE_DURATION_SEASONS, scen.seasonScheme !== SEASONS_PER_YEAR);

    // 建武朝廷（godaiho）と楠木家（kusunoki）、北畠家（kitabatake）、菊池家（kikuchi）は互いにシナリオ開始時に20年間（100季）の同盟関係にあるものとする
    const kenmuTargetClans = ['godaiho', 'kusunoki', 'kitabatake', 'kikuchi'];
    const activeKenmuClans = kenmuTargetClans.filter(id => this.isClanExtant(id));
    if (activeKenmuClans.includes('godaiho') && activeKenmuClans.length >= 2) {
      let kenmuPact = this.alliances.find(g => {
        const m = this.allianceMembers(g);
        return m.includes('godaiho') && activeKenmuClans.some(id => id !== 'godaiho' && m.includes(id)) && !m.includes('ashikaga');
      });
      if (kenmuPact) {
        activeKenmuClans.forEach(id => {
          if (!kenmuPact.members.includes(id)) kenmuPact.members.push(id);
        });
        kenmuPact.durationSeasons = Math.max(kenmuPact.durationSeasons || 0, 100);
        if (!kenmuPact.label) kenmuPact.label = '建武南朝盟約';
      } else {
        this.alliances.push({
          members: activeKenmuClans,
          formedYear: this.year,
          formedSeason: this.seasonIdx,
          durationSeasons: 100,
          label: '建武南朝盟約'
        });
      }
    }

    this.allianceCooldown = {};

    this.aiEconomy = {};

    this.aiDiploMemory = {};

    this.currentWeather = '晴天';



    const descBox = document.getElementById('scenarioDescBox');

    if (descBox) {

      descBox.innerHTML = `

        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #775533; padding-bottom:3px; margin-bottom:5px;">

          <strong style="color:var(--gold-bright); font-size: 12pt;">【${this.formatYear(scen.year)}年 ${scen.title} 〜${scen.subtitle || ''}〜】</strong>

          <span style="font-size: 12pt; color:#ffd700;">年号: ${scen.gengo || ''}</span>

        </div>

        <div style="margin-bottom:5px; color:#f5eedc; font-size: 12pt; line-height:1.5;">

          <strong style="color:#ffd700;">【時代背景】</strong>${scen.lore_background || scen.desc}

        </div>

        ${buildFactionHeadsText(scen) ? `

          <div style="margin-bottom:5px; font-size: 12pt; color:#e0d0b0; background:rgba(0,0,0,0.35); padding:5px 8px; border-radius:3px; border-left:3px solid var(--gold);">

            <div class="sl-faction-line" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><strong style="color:#ffcc66;">【主要勢力】</strong>${buildFactionHeadsText(scen).split('\n').filter(Boolean).map(l => l.replace('当主：', '')).join('　／　')}</div>

          </div>

        ` : ''}

        ${scen.lore_focus ? `

          <div style="font-size: 12pt; color:#ffdd88; background:rgba(212,175,55,0.08); padding:3px 6px; border-radius:3px;">

            <strong style="color:#ffd700;">【覇道の焦点】</strong>${scen.lore_focus}

          </div>

        ` : ''}

      `;

    }



    document.querySelectorAll('.scenario-btn').forEach(btn => {

      const isSel = btn.dataset.scenId === scenarioId;

      btn.classList.toggle('selected', isSel);

      if (isSel) {

        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

      }

    });



    this.provinces = JSON.parse(JSON.stringify(INITIAL_PROVINCES));

    this.provinces.forEach(p => {

      p.governance = 'direct';

      this.normalizeProvince(p);

      p.order = p.order !== undefined ? p.order : 85;

      if (scen.owners && scen.owners[p.id]) {

        p.ownerId = scen.owners[p.id];

      }

      if (scen.provinceNames && scen.provinceNames[p.id]) {

        p.name = scen.provinceNames[p.id];

      }

      if (scen.castles && scen.castles[p.id]) {

        p.castle = scen.castles[p.id];

        p.castleName = scen.castles[p.id];

      }

      if (scen.castleLores && scen.castleLores[p.id]) {

        p.castleLore = scen.castleLores[p.id];

      } else if (window.HISTORICAL_CASTLE_LORES && window.HISTORICAL_CASTLE_LORES[p.castle]) {

        p.castleLore = window.HISTORICAL_CASTLE_LORES[p.castle];

      }

      // 全シナリオで同じ基準式を用いる。旧 provinceTroops / troopScale の
      // 個別上書きは石高と乖離するため、開始時の駐留兵力には反映しない。
      p.troops = this.getProvinceInitialTroops(Number(p.kokudaka) || 0);

    });



    // シナリオ開始時に当主として指定された武将（15歳未満でも当主にする。以後の相続では年齢規則を維持）

    this._startHeadIds = this.computeScenarioStartHeadIds(scen);



    // 武将ライフサイクル更新（要件2: switchScenario実行時の呼び出し）

    this.updateActiveOfficers();



    // マスターデータの初期値 (isDaimyo: true) への依存を断ち切り、シナリオ初期化時にフラグを一度すべて損切り（リセット）

    if (this.activeOfficers) {

      this.activeOfficers.forEach(o => { o.isDaimyo = false; });

    }



    // 所属先大名不在武将の史実振り替え・浪人化

    this.resolveOfficerAffiliations(scen);



    // 豊臣姓・羽柴姓の年代連動（1583年以降は豊臣、それ以前は羽柴）

    this.updateToyotomiSurname(false);



    // 1. 大名の自動生成 & 当主の確定 (要件3-1)

    // 地図上の ownerId（存在している全勢力）を走査し、各勢力の当主を決定

    const activeOwners = [...new Set(this.provinces.map(p => p.ownerId).filter(Boolean))];

    activeOwners.forEach(ownerId => {

      const ability = getClanAbility(ownerId);

      const playableD = scen.playables?.find(d => d.id === ownerId);

      const leaderName = playableD?.name || playableD?.leaderName || (playableD?.officerId && window.OFFICERS_MASTER?.find(o => o.id === playableD.officerId)?.name) || this.getDaimyoLeaderName(ownerId);



      // 自勢力に所属する生存武将

      const clanOfficers = this.activeOfficers.filter(o => o.clanId === ownerId && !o.isDead);

      let leaderOfficer = this.seatNamedLord(ownerId);



      // 仮想シナリオやシナリオ指定の当主名に合致する武将がいれば最優先

      if (!leaderOfficer && leaderName && clanOfficers.length > 0) {

        const matched = clanOfficers.find(o => o.name === leaderName || (o.name && leaderName && (o.name.includes(leaderName) || leaderName.includes(o.name))));

        if (matched) {

          leaderOfficer = matched;

          leaderOfficer.isDaimyo = true;

          leaderOfficer.hasBeenDaimyo = true;

          if (this.formerDaimyoIds) this.formerDaimyoIds.add(leaderOfficer.id);

          this.activeOfficers.filter(o => o.clanId === ownerId && o.id !== leaderOfficer.id).forEach(o => {

            o.isDaimyo = false;

          });

        }

      }



      if (!leaderOfficer && clanOfficers.length > 0) {

        const masterDm = new Set((window.OFFICERS_MASTER || []).filter(m => m.isDaimyo && m.clanId === ownerId).map(m => m.id));

        const flaggedPool = clanOfficers.filter(o => masterDm.has(o.id));

        leaderOfficer = this.pickClanLeader(ownerId, flaggedPool.length ? flaggedPool : clanOfficers);

        leaderOfficer.isDaimyo = true;

        leaderOfficer.hasBeenDaimyo = true;

        if (this.formerDaimyoIds) this.formerDaimyoIds.add(leaderOfficer.id);

        this.activeOfficers.filter(o => o.clanId === ownerId && o.id !== leaderOfficer.id).forEach(o => {

          o.isDaimyo = false;

        });

      }



      if (!leaderOfficer) {

        const hasProvNow = (this.provinces || []).some(p => p.ownerId === ownerId);

        if (hasProvNow) {

          leaderOfficer = this.seatNamedLord(ownerId);

        }

        const explicit = scen.owners && Object.values(scen.owners).includes(ownerId);

        if (!explicit && !hasProvNow) {

          this.provinces.filter(p => p.ownerId === ownerId).forEach(p => {

            p.ownerId = null;

            p.governorId = null;

          });

        }

      }

    });



    // 【同姓同名・重複武将の完全排除】

    // ユーザー要件: 「羽柴秀吉と豊臣秀吉が重複して存在するので統一」「年齢の差が100歳以内で同姓同名の武将が複数散在する。史実で正しいほうの武将を残して重複は削除して」

    const getCanonicalName = (name) => {

      if (!name) return '';

      let clean = name.replace(/[（(][^）)]+[）)]/g, '').trim();

      if (clean === '羽柴秀吉' || clean === '豊臣秀吉') return '秀吉';

      if (clean === '羽柴秀長' || clean === '豊臣秀長') return '秀長';

      if (clean === '羽柴秀次' || clean === '豊臣秀次') return '秀次';

      if (clean === '松平元康' || clean === '松平家康' || clean === '徳川家康') return '家康';

      if (clean === '黒田官兵衛' || clean === '黒田孝高' || clean === '黒田如水') return '黒田官兵衛';

      if (clean === '細川藤孝' || clean === '細川幽斎') return '細川藤孝';

      if (clean === '片倉景綱' || clean === '片倉小十郎') return '片倉景綱';

      if (clean === '穴山信君' || clean === '穴山梅雪') return '穴山信君';

      if (clean === '佐々木広綱' || clean === '佐佐木広綱') return '佐々木広綱';

      if (clean === '後白河天皇' || clean === '後白河院') return '後白河天皇';

      if (clean === '後鳥羽上皇' || clean === '後鳥羽天皇') return '後鳥羽上皇';

      if (clean === '後嵯峨上皇' || clean === '後嵯峨天皇') return '後嵯峨上皇';

      if (clean === '松平秀忠' || clean === '徳川秀忠') return '徳川秀忠';

      if (clean === '松平家光' || clean === '徳川家光') return '徳川家光';

      if (clean === '松平家綱' || clean === '徳川家綱') return '徳川家綱';

      if (clean === '松平綱吉' || clean === '徳川綱吉') return '徳川綱吉';

      if (clean === '松平家宣' || clean === '徳川家宣') return '徳川家宣';

      if (clean === '松平治郷' || clean === '松平不昧') return '松平治郷';

      if (clean === '神武天皇' || clean === '神日本磐余彦尊') return '神武天皇';

      return clean;

    };



    const masterNameById = new Map(((typeof window !== 'undefined' && window.OFFICERS_MASTER) || []).map(m => [m.id, m.name]));
    // 同姓同名だが別人（data/rules.json distinctHomonymOfficerIds）は同一人物としてまとめない
    const distinctPairs = new Set();
    ((typeof window !== 'undefined' && window.DISTINCT_HOMONYM_OFFICER_IDS) || []).forEach(grp => { (grp || []).forEach(a => (grp || []).forEach(b => { if (a !== b) distinctPairs.add(a + '|' + b); })); });
    const nameGroups = new Map();

    this.activeOfficers.forEach(o => {

      // 年代別の名前（eraNames）で一時的に同名になった別人（島津義久の初名「忠良」と祖父忠良など）を巻き込まないよう、基本名で判定
      const canonKey = getCanonicalName((Array.isArray(o.eraNames) && o.eraNames.length && masterNameById.get(o.id)) || o.name);

      if (!nameGroups.has(canonKey)) {

        nameGroups.set(canonKey, []);

      }

      nameGroups.get(canonKey).push(o);

    });



    const deduplicatedOfficers = [];

    nameGroups.forEach((group) => {

      if (group.length === 1) {

        deduplicatedOfficers.push(group[0]);

        return;

      }



      const getPriority = (off) => {

        let score = 0;

        if (off.id === 'off_tokugawa_ieyasu') score += 2000;

        if (off.id === 'off_toyotomi_hideyoshi') score += 2000;

        if (off.id === 'off_kuroda_kanbei') score += 2000;

        if (off.id === 'off_kuroda_nagamasa') score += 2000;

        if (off.id === 'off_ashikaga_yoshiaki') score += 2000;

        if (off.isDaimyo) score += 500;

        if (!off.id.startsWith('off_daimyo_') && !off.id.includes('_clan') && !off.id.includes('_early')) score += 100;

        return score;

      };



      const clusters = [];

      group.forEach(off => {

        const b = off.birthYear || 1500;

        let matchedCluster = clusters.find(cl => Math.abs((cl[0].birthYear || 1500) - b) <= 100 && !cl.some(m => distinctPairs.has(m.id + '|' + off.id)));

        if (matchedCluster) {

          matchedCluster.push(off);

        } else {

          clusters.push([off]);

        }

      });



      clusters.forEach(cl => {

        if (cl.length === 1) {

          deduplicatedOfficers.push(cl[0]);

        } else {

          cl.sort((a, b) => getPriority(b) - getPriority(a));

          deduplicatedOfficers.push(cl[0]);

        }

      });

    });



    this.activeOfficers = deduplicatedOfficers;



    // 2. 時代考証・史実に沿った確実な城主任命

    this.ensureClanCapitalsMatchMap();

    this.activeOfficers.forEach(o => { o.assignedProvId = null; });

    this.provinces.forEach(p => {

      p.governorId = null;

      // 城主不在時の「城代」能力比率 (大名能力の40%〜75%の間で固定決定)

      const hash = ((p.id.charCodeAt(0) * 17) + (p.id.length * 23) + (p.ownerId ? p.ownerId.charCodeAt(0) * 7 : 11)) % 36;

      p.jodaiRatio = 0.40 + (hash / 100);

    });



    const histGovMap = (window.SCENARIO_HISTORICAL_GOVERNORS && window.SCENARIO_HISTORICAL_GOVERNORS[String(scenarioId)])
      ? window.SCENARIO_HISTORICAL_GOVERNORS[String(scenarioId)]
      : {};
    const pinnedGovMap = (window.PINNED_SCENARIO_GOVERNORS && window.PINNED_SCENARIO_GOVERNORS[String(scenarioId)])
      ? window.PINNED_SCENARIO_GOVERNORS[String(scenarioId)]
      : {};

    // 【絶対原則ステップ1: 大名本拠地への大名配置（最優先・傘下武将は絶対に城代にならない）】

    // ユーザー要件: 「大名が本拠地としている城では傘下の武将は城代になりません。本拠親政となるのは大名の居城だけです」

    this.provinces.forEach(p => {

      // 当主が特定の自国領（assignedProvId）に在城している場合は、その城も当主親政とする。
      const stationedDaimyo = p.ownerId && this.activeOfficers.find(o => o.clanId === p.ownerId && o.isDaimyo && o.assignedProvId === p.id && !o.isDead);
      if (stationedDaimyo) {
        p.governorId = stationedDaimyo.id;
        return;
      }

      // 当主がいる州（本拠地）は常に当主親政とし、他の武将を城主にしない。

      if (p.ownerId && this.isCapitalProvince(p.id, p.ownerId)) {

        const daimyoOfficer = this.activeOfficers.find(o => o.clanId === p.ownerId && o.isDaimyo && !o.assignedProvId && !o.isDead);

        if (daimyoOfficer) {

          p.governorId = daimyoOfficer.id;

          daimyoOfficer.assignedProvId = p.id;

        }

      }

    });



    // 【ステップ2: 支城（本拠地以外の城）への史実城代・有力家臣の配置】

    // 2-A: シナリオ固有の史実城代マッピングの適用（当主がいる本拠地には城代を置かない）

    if (histGovMap) {

      this.provinces.forEach(p => {

        

        const targetIdOrName = pinnedGovMap[p.id] || histGovMap[p.id];
        if (!p.governorId && p.ownerId && !this.isCapitalProvince(p.id, p.ownerId) && targetIdOrName) {

          

          const forcedClan = window.JODAI_CLAN_BY_SCENARIO

            && window.JODAI_CLAN_BY_SCENARIO[String(scenarioId)]

            && window.JODAI_CLAN_BY_SCENARIO[String(scenarioId)][targetIdOrName];

          if (forcedClan) {

            const named = this.activeOfficers.find(o => (o.id === targetIdOrName || o.name === targetIdOrName) && !o.isDead && (!o.isDaimyo || !o.assignedProvId));

            if (named && !this.isNamedLandedLeader(named)) named.clanId = forcedClan;

          }

          const matchHist = (o) => (o.id === targetIdOrName || o.name === targetIdOrName) && !o.assignedProvId && !o.isDead && (!o.isDaimyo || !o.assignedProvId) && !(this.isNamedLandedLeader(o) && o.clanId !== p.ownerId);

          let histOff = this.activeOfficers.find(o => matchHist(o) && o.clanId === p.ownerId);

          if (!histOff) {

            histOff = this.activeOfficers.find(o => matchHist(o));

            if (histOff) histOff.clanId = p.ownerId;

          }

          if (histOff) {

            p.governorId = histOff.id;

            histOff.assignedProvId = p.id;

          }

        }

      });

    }



    const scenarioGovIds = new Set(Object.values(

      (window.SCENARIO_HISTORICAL_GOVERNORS && this.currentScenario)

        ? (window.SCENARIO_HISTORICAL_GOVERNORS[String(this.currentScenario.id)] || {})

        : {}

    ));

    // 特定の年の史実城代は、名簿のない別シナリオの支城へ流さない

    const isUnlistedJodai = (o) => String(o.id || '').startsWith('off_jd_') && !scenarioGovIds.has(o.id);



    // 2-B: 空き城で、同一勢力(clanId)かつ初期拠点(defaultProv)が一致する一般武将を配置

    this.provinces.forEach(p => {

      if (!p.governorId && p.ownerId && !this.isCapitalProvince(p.id, p.ownerId)) {

        const matchCand = (o) => {

          if ((p.id === 'mutsu_namioka' || p.id === 'mutsu_tsugaru' || p.id === 'tsugaru') && p.ownerId === 'namioka') {

            if (o.id === 'off_jd_013' || o.id === 'off_tsugaru_tamenobu' || (o.name && o.name.startsWith('大浦'))) return false;

          }

          const aff = this.currentScenario?.officerAffiliations?.[o.id];
          if (aff && typeof aff === 'object' && aff.isCastleLord === false) return false;

          return o.defaultProv === p.id && 

          o.clanId === p.ownerId && 

          !o.assignedProvId && 

          !o.isDead && 

          !o.isDaimyo &&

          !this.isCourtFigure(o) &&

          !isUnlistedJodai(o) && o.canBeGovernor !== false && o.id !== 'off_dm_amago_1560';

        };

        // 応仁の乱向け追加武将（off_onin2_）はこの段階では城主にしない（既存の配置を変えないため）

        const matchingOfficer = this.activeOfficers.find(o => matchCand(o) && !String(o.id).startsWith('off_onin2_'));

        if (matchingOfficer) {

          p.governorId = matchingOfficer.id;

          matchingOfficer.assignedProvId = p.id;

        }

      }

    });



    // 2-C: ゆかりの地でも史実城代でもない支城へ、能力の高い待機武将は流さない。

    // 隠岐のように該当者がいない国は城主名を置かず、城代のままにする。



    this.clanLookOverrides = {}; // 家督相続で借りた家紋・領国色（2026-10-11 bp）

    this.shogunAppointed = false; this.shogunAtStart = false; // 征夷大将軍はシナリオごと（2026-10-11 cc）

    this.coalitionWatch = null; // 反覇道包囲網の開始時国数と経過季（2026-10-11 ck）
    this.coalitionFormed = false;
    this.syncCoalitionUI?.();

    this.breakawayTruces = []; // 家中分裂の停戦（2026-10-11 cf）

    // 最終フィルタ: GameRules 強制配置・城主割当の後でも、没後／未生／15歳未満（開始時の幼少当主を除く）の武将を残さない

    this.enforceScenarioLifespanFinal(scen);
    // シナリオ指定当主（playables.officerId）を各家ただ一人の当主として確定（2026-10-25 heads）
    try { this.enforcePlayableHeads(scen); } catch (e) { console.warn('[heads]', e); }
    this.foundingLeaderNames = {};

    (this.activeOfficers || []).forEach(o => {

      if (o.clanId && o.isDaimyo && !o.isDead && o.name && !this.foundingLeaderNames[o.clanId]) {

        this.foundingLeaderNames[o.clanId] = o.name;

      }

    });

    this.lastDaimyoNames = { ...this.foundingLeaderNames };



    // 初期配置は史実城代とゆかりの地（出身国・本拠地）のみ。進行が始まってから前線や空き城へ配る

    // （空白地での反乱・旗揚げやゆかり以外の穴埋め配置はゲーム進行開始後にのみ実行）

    this.appointHistoricalHomeGovernors();

    this.autoAppointComputerCastellans({ fillVacancies: false });

    // 各州で城主は1名のみ（重複・非城主の assignedProvId 残存を完全に排除）
    const provById = new Map((this.provinces || []).map(p => [p.id, p]));
    const seenGovIds = new Set();
    (this.provinces || []).forEach(p => {
      if (!p.governorId) return;
      if (seenGovIds.has(p.governorId)) {
        p.governorId = null;
      } else {
        seenGovIds.add(p.governorId);
      }
    });
    (this.activeOfficers || []).forEach(o => {
      if (!o.assignedProvId) return;
      const gp = provById.get(o.assignedProvId);
      if (!gp || gp.ownerId !== o.clanId || gp.governorId !== o.id) {
        o.assignedProvId = null;
      }
    });



    const allPlayables = this.ensureAllPlayables(scen);

    scen.playables = allPlayables;

    // シナリオ切り替え時は以前の大名をリセットし、そのシナリオのお勧め初期選択大名を選択状態にする
    const defaultClanId = scen.recommendedClan || (allPlayables.length > 0 ? allPlayables[0].id : null);
    const defaultDaimyo = allPlayables.find(p => p.id === defaultClanId) || (allPlayables.length > 0 ? allPlayables[0] : null);
    this.playerClanId = defaultDaimyo ? defaultDaimyo.id : null;
    this.playerDaimyo = defaultDaimyo ? JSON.parse(JSON.stringify(defaultDaimyo)) : null;

    this.renderDaimyoGrid(allPlayables, this.playerClanId);

    // ここで領主データが反映された正確な位置・家紋でSVGマップを再構築する

    this.initSvgMap();

    this.updateMapDisplay();

    // 幼少当主の印（開始後も当主である間は登場を維持する）

    (this.activeOfficers || []).forEach(o => {

      if (o && o.isDaimyo && !o.isDead && Number(this.year) - Number(o.birthYear) < 15) o._startChildHead = true;

    });

    this._isSwitchingScenario = false;

  },



  ensureAllPlayables(scen) {

    if (!scen || !this.provinces) return scen?.playables || [];



    // 現在のマップ上で実際に領国を持っている全勢力（null, roninを除く）

    const ownedProvsByClan = {};

    this.provinces.forEach(p => {

      const cid = p.ownerId;

      if (!cid || cid === 'null' || cid === 'ronin') return;

      if (!ownedProvsByClan[cid]) ownedProvsByClan[cid] = [];

      ownedProvsByClan[cid].push(p.id);

    });



    const activeClanIds = Object.keys(ownedProvsByClan);

    const existingPlayables = Array.isArray(scen.playables) ? [...scen.playables] : [];

    const existingMap = new Map(existingPlayables.map(p => [p.id, p]));



    const allPlayables = [];



    activeClanIds.forEach(clanId => {

      const owned = ownedProvsByClan[clanId] || [];

      const provCount = owned.length;

      if (provCount === 0) return;



      const existing = existingMap.get(clanId);

      if (existing) {

        const master = (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA[clanId]) || {};

        const ability = (typeof getClanAbility === 'function') ? getClanAbility(clanId) : {};

        const item = { ...existing };

        item.provCount = provCount;

        item.myProvinces = owned;



        // シナリオ既定の本拠が今の領国にないとき、または登録本拠と食い違うときは実際の本拠に合わせる

        const capId = this.resolveClanCapitalId(clanId, owned);

        if (capId) item.startProvId = capId;



        // 当主武将の特定 (officerId または生存中の大名武将)

        let leaderOfficer = null;

        if (item.officerId && Array.isArray(window.OFFICERS_MASTER)) {

          leaderOfficer = window.OFFICERS_MASTER.find(o => o.id === item.officerId);

        }

        if (!leaderOfficer) {

          leaderOfficer = this.getClanDaimyoOfficer(clanId);

        }



        // 当主名

        let leaderName = leaderOfficer ? leaderOfficer.name : (item.name || item.leaderName || this.getDaimyoLeaderName(clanId));

        if (!leaderName || leaderName === clanId || leaderName === '空白地') {

          leaderName = master.family || clanId;

        }

        // シナリオ原本の当主名は残す（再訪時に前回の表示名で当主を選ばない）

        // 当主名の最新化（シナリオ指定のofficerIdを最優先、なければ生存中の大名武将を反映）

        if (leaderOfficer && leaderOfficer.name) {

          item.name = leaderOfficer.name;

        } else {

          const currentLeader = this.getClanDaimyoOfficer(clanId);

          if (currentLeader && currentLeader.name) {

            item.name = currentLeader.name;

          } else {

            item.name = leaderName;

          }

        }



        // 家名

        let clanFamily = item.clan || this.getClanFamilyName(clanId);

        if (clanId === 'kakizaki' && scen.year >= 1599) {

          clanFamily = '松前家';

        }

        if (clanId === 'matsura') {

          clanFamily = (scen.year <= 1333) ? '松浦党' : '松浦家';

        }

        if (!clanFamily || clanFamily === clanId) {

          clanFamily = master.family || `${item.name}家`;

        }

        item.clan = clanFamily;



        // カラー、家紋、crest

        item.color = item.color || master.color || '#445566';

        item.crest = item.crest || (item.clan ? item.clan.slice(0, 1) : '武');

        item.kamonSvgId = (!item.kamonSvgId || item.kamonSvgId === 'kamon-default') ? this.getClanKamonId(clanId) : item.kamonSvgId;



        // 戦術

        item.tactic = item.tactic || master.tactic || '威風の指揮';

        item.tacticDesc = item.tacticDesc || master.tacticDesc || '士気を高め、軍の進軍と戦闘威力を底上げする。';



        // 能力値 (stats)

        if (!item.stats) {

          if (leaderOfficer) {

            const mil = leaderOfficer.military ?? ability.military ?? 60;

            const pol = leaderOfficer.politic ?? leaderOfficer.politics ?? ability.politics ?? 60;

            const str = leaderOfficer.intel ?? leaderOfficer.stratagem ?? ability.stratagem ?? 55;

            item.stats = {

              military: mil,

              politics: pol,

              intellect: str,

              stratagem: str

            };

          } else {

            item.stats = {

              military: ability.military || 60,

              politics: ability.politics || 60,

              intellect: ability.stratagem || 55,

              stratagem: ability.stratagem || 55

            };

          }

        }



        // personality

        item.personality = item.personality || ability.personality || 'balanced';



        allPlayables.push(item);

      } else {

        const master = (window.CLAN_MASTER_DATA && window.CLAN_MASTER_DATA[clanId]) || {};

        const ability = getClanAbility(clanId);



        // 当主武将の特定

        let leaderName = '';

        const daimyoOff = this.getClanDaimyoOfficer(clanId);

        if (daimyoOff) {

          leaderName = daimyoOff.name;

        } else {

          leaderName = this.getDaimyoLeaderName(clanId);

        }

        if (!leaderName || leaderName === clanId || leaderName === '空白地') {

          leaderName = master.family || clanId;

        }



        // 家名

        let clanFamily = this.getClanFamilyName(clanId);

        if (clanId === 'kakizaki' && scen.year >= 1599) {

          clanFamily = '松前家';

        }

        if (clanId === 'matsura') {

          clanFamily = (scen.year <= 1333) ? '松浦党' : '松浦家';

        }

        if (!clanFamily || clanFamily === clanId) {

          clanFamily = master.family || `${leaderName}家`;

        }



        // 難易度・勝率

        let difficulty = '上級';

        let winRate = 58;

        if (provCount >= 5) {

          difficulty = '初級';

          winRate = 85;

        } else if (provCount >= 3) {

          difficulty = '中級';

          winRate = 75;

        } else if (provCount >= 2) {

          difficulty = '中級';

          winRate = 68;

        } else {

          difficulty = '上級';

          winRate = 58;

        }



        // 本拠は実際の本拠判定と同じ関数で決める（画面の「本拠」とゲーム内の居城を一致させる）

        const startProvId = this.resolveClanCapitalId(clanId, owned) || owned[0];



        const desc = master.desc 

          ? master.desc 

          : `${clanFamily}の当主・${leaderName}。${provCount}州を領有し、領民を守りつつ天下統一の覇業に挑む。`;



        const tactic = master.tactic || '剛勇の指揮';

        const tacticDesc = master.tacticDesc || '士気を高め、軍勢の進軍と戦闘威力を向上させる。';



        allPlayables.push({

          id: clanId,

          name: leaderName,

          clan: clanFamily,

          color: master.color || '#445566',

          crest: clanFamily.slice(0, 1),

          kamonSvgId: this.getClanKamonId(clanId),

          difficulty: difficulty,

          winRate: winRate,

          startProvId: startProvId,

          provCount: provCount,

          myProvinces: owned,

          gold: Math.max(2500, provCount * 2000 + 1000),

          rice: Math.max(3000, provCount * 2500 + 1200),

          desc: desc,

          tactic: tactic,

          tacticDesc: tacticDesc,

          stats: {

            military: ability.military || 60,

            politics: ability.politics || 60,

            intellect: ability.stratagem || 55,

            stratagem: ability.stratagem || 55

          },

          personality: ability.personality || 'balanced'

        });

      }

    });



    // ソート: 北の勢力から順に（本拠の北緯の降順。同緯度は領国の平均北緯、次に東から）

    this.sortPlayablesNorthToSouth(allPlayables);



    // ★追加: 九州・東北の大名、および佐竹氏・村上氏・大宝寺氏・鈴木氏・椎名氏・神保氏・姉小路氏を「内政型」に一括変更する

    const FORCED_DOMESTIC_CLANS = new Set(['satake', 'murakami', 'murakami_suigun', 'daihoji', 'suzuki', 'saika', 'shiina', 'jinbo', 'anekoji']);

    allPlayables.forEach(d => {

      const startProv = (this.provinces || []).find(p => p.id === d.startProvId);

      // 本拠地の地方名、または強制内政型の家で判定

      if (FORCED_DOMESTIC_CLANS.has(d.id) || (startProv && /東北|奥羽|蝦夷|北海道|九州/.test(startProv.region || ''))) {

        // UI（大名選択画面のバッジ）を「内政型」に変更

        d.personality = 'domestic';

        

        // AI思考ロジック（CPUの行動）を「内政型」に上書き

        if (typeof window !== 'undefined' && window.CLAN_ABILITIES) {

          if (!window.CLAN_ABILITIES[d.id]) {

            window.CLAN_ABILITIES[d.id] = { politics: 60, military: 60, stratagem: 55 };

          }

          window.CLAN_ABILITIES[d.id].personality = 'domestic';

        }

      }

    });



    // ★追加: 上杉氏（越後上杉・山内上杉・扇谷上杉・米沢藩）と毛利氏（長州藩を含む）は「バランス型」に固定する

    // （東北の内政型一括変更より優先。米沢藩の上杉もバランス型）

    const FORCED_BALANCED_CLANS = new Set(['uesugi', 'yamanouchi', 'ogigayatsu', 'mori', 'choshu_han']);

    allPlayables.forEach(d => {

      if (!FORCED_BALANCED_CLANS.has(d.id)) return;

      d.personality = 'balanced';

      if (typeof window !== 'undefined' && window.CLAN_ABILITIES) {

        if (!window.CLAN_ABILITIES[d.id]) window.CLAN_ABILITIES[d.id] = { politics: 60, military: 60, stratagem: 55 };

        window.CLAN_ABILITIES[d.id].personality = 'balanced';

      }

    });

    if (typeof window !== 'undefined' && window.CLAN_ABILITIES) {

      // 選択肢にない（CPU専用の）上杉・毛利の家も同様に

      FORCED_BALANCED_CLANS.forEach(id => { if (window.CLAN_ABILITIES[id]) window.CLAN_ABILITIES[id].personality = 'balanced'; });

    }



    scen.playables = allPlayables;

    return allPlayables;

  },



  /** 勢力カードを北→南に並べる。鍵は本拠（startProvId）の北緯、同値なら領国の平均北緯 */



  sortPlayablesNorthToSouth(playables) {

    if (!Array.isArray(playables)) return playables;



    // 地方ブロック定義（東北→関東甲信越→中部→近畿→中国→四国→九州沖縄）

    const PROVINCE_BLOCKS = {

      // 1: 東北地方（北海道・蝦夷含む）

      'ezo': 1, 'mutsu_tsugaru': 1, 'mutsu_namioka': 1, 'tsugaru': 1, 'mutsu_nanbu': 1, 'ugo': 1, 'ugo_minato': 1, 'ugo_hinai': 1, 'ugo_yuri': 1, 'ugo_senhoku': 1, 'ugo_hondoh': 1, 'ugo_rokugoh': 1,

      'rikuchu': 1, 'rikuchu_morioka': 1, 'rikuchu_kamiheii': 1, 'rikuchu_shimoheii': 1, 'rikuchu_hienuki': 1, 'rikuchu_waga': 1, 'ugo_yokote': 1, 'uzen_shonai': 1, 'uzen': 1, 'uzen_mogami': 1, 'uzen_kitamurayama': 1, 'uzen_nishimurayama': 1, 'uzen_higashimurayama': 1, 'rikuchu_kasai': 1,

      'rikuzen_osaki': 1, 'uzen_yonezawa_date': 1, 'uzen_yonezawa': 1, 'iwashiro_date_shinobu': 1, 'rikuzen': 1, 'rikuzen_kurokawa': 1, 'iwashiro': 1, 'iwashiro_sukagawa': 1, 'iwashiro_ishikawa': 1,

      'iwaki_soma': 1, 'iwashiro_tamura': 1, 'iwaki_shirakawa': 1, 'iwaki': 1,



      // 2: 関東甲信越地方

      'sado': 2, 'echigo': 2, 'echigo_murakami': 2, 'echigo_kanbara': 2, 'echigo_higashikanbara': 2, 'echigo_uonuma': 2, 'shinano_kawanakajima': 2, 'shinano_sarashina_hanishina': 2, 'shinano_ueda': 2, 'kozuke_takasaki': 2, 'kozuke_agatsuma': 2, 'kozuke_numata': 2, 'kozuke_maebashi': 2, 'kozuke_nitta_kanayama': 2, 'shimotsuke_nasu': 2,

      'shinano_chikuma_kiso': 2, 'shinano_chikuma_azumi': 2, 'shinano_kiso': 2, 'shinano_takato': 2, 'shinano_iida': 2, 'shinano_takato_iida': 2, 'shimotsuke': 2, 'shimotsuke_kanitsuga': 2, 'sano_oyama': 2, 'shimotsuke_oyama': 2, 'shimotsuke_sano': 2, 'kai': 2, 'kai_tsuru': 2, 'hitachi': 2, 'hitachi_ohta': 2, 'hitachi_mito': 2, 'hitachi_makabe': 2, 'hitachi_shimodate': 2, 'hitachi_shimotsuma': 2, 'hitachi_kashima': 2, 'shimousa_koga': 2, 'shimousa_yuhki': 2,

      'musashi': 2, 'musashi_oshi': 2, 'musashi_hachigata': 2, 'musashi_iwatsuki': 2, 'musashi_kawagoe': 2, 'musashi_edo_tama': 2, 'musashi_edo': 2, 'musashi_tama': 2, 'hitachi_fuchu': 2, 'hitachi_tsuchiura': 2, 'hitachi_shida': 2, 'sagami': 2, 'sagami_miura': 2, 'shimousa': 2, 'kazusa': 2, 'kazusa_isumi': 2, 'kazusa_togane_naruto': 2, 'awa': 2,



      // 3: 中部地方（北陸・東海・飛騨）

      'noto': 3, 'kaga_north': 3, 'kaga_south': 3, 'etchu_west': 3, 'etchu_east': 3, 'echizen': 3, 'echizen_tsuruga': 3, 'echizen_ohno': 3, 'hida': 3, 'hida_takayama': 3, 'hida_kiun': 3, 'hida_kamioka': 3,

      'mino': 3, 'mino_gujo': 3, 'mino_iwamura': 3, 'owari_north': 3, 'owari_south': 3, 'mikawa_okazaki': 3, 'mikawa_yoshida': 3, 'mikawa_shitara': 3, 'suruga': 3, 'totomi_hamamatsu': 3, 'totomi_kakegawa': 3, 'totomi_futamata_haibara': 3, 'totomi_joto': 3, 'izu': 3,



      // 4: 近畿地方

      'tajima': 4, 'tango': 4, 'wakasa': 4, 'harima_west': 4, 'harima_east': 4, 'tamba': 4, 'tamba_west': 4, 'tamba_east': 4,

      'omi_north': 4, 'omi_kutsukidani': 4, 'settsu': 4, 'settsu_shimakami': 4, 'settsu_osaka': 4, 'yamashiro': 4, 'omi_south': 4, 'omi_koka': 4,

      'awaji': 4, 'kawachi_north': 4, 'kawachi_south': 4, 'izumi': 4, 'iga': 4, 'ise': 4, 'ise_suzuka': 4,

      'yamato': 4, 'yamato_koriyama': 4, 'yamato_takatori': 4, 'yamato_yoshino': 4, 'yamato_higashiyamauchi': 4, 'kii_saika_wakayama': 4, 'kii_kichu': 4, 'kii_kumano': 5, 'kii': 4, 'shima': 4,



      // 5: 中国地方

      'oki': 5, 'izumo_north': 5, 'izumo_south': 5, 'iwami': 5, 'hoki_west': 5, 'hoki_east': 5, 'nagato': 5,

      'inaba': 5, 'aki_hiroshima': 5, 'aki_koriyama': 5, 'bingo': 5, 'suo': 5, 'mimasaka_west': 5, 'mimasaka_east': 5,

      'bitchu_matsuyama': 5, 'bitchu_takamatsu': 5, 'bizen': 5,



      // 6: 四国地方

      'sanuki': 6, 'sanuki_west': 6, 'iyo_matsuyama': 6, 'iyo_nii': 6, 'awa_shikoku': 6, 'awa_shikoku_west': 6, 'awa_shikoku_south': 6, 'tosa_kochi': 6, 'tosa_aki': 6, 'tosa_gun': 6, 'tosa_nakamura': 6, 'tosa': 6,



      // 7: 九州地方・沖縄地方

      'tsushima': 7, 'hizen_hirado': 7, 'chikuzen_fukuoka': 7, 'chikuzen_hakata': 7, 'chikuzen_munakata': 7, 'chikuzen_kamashi': 7, 'chikuzen_akizuki': 7, 'hizen': 7, 'hizen_saga': 7, 'hizen_tsukushi': 7, 'hizen_karatsu': 7, 'buzen': 7, 'buzen_ogura': 7, 'buzen_nakatsu': 7,

      'chikugo_north': 7, 'chikugo_south': 7, 'hizen_omura': 7, 'hizen_shimabara': 7, 'bungo_funai': 7, 'bungo_oka': 7, 'bungo_kitaamabe': 7, 'bungo_minamiamabe': 7, 'bungo_saiki_usuki': 7, 'higo_kumamoto': 7, 'higo_aso': 7, 'higo_yatsushiro': 7, 'higo_hitoyoshi': 7,

      'hyuga_takanabe': 7, 'hyuga_sadowara': 7, 'hyuga_obi': 7, 'hyuga_nobeoka': 7, 'satsuma': 7, 'osumi': 7, 'ryukyu': 7

    };



    const keyOf = (d) => {

      const provs = (d.myProvinces && d.myProvinces.length) ? d.myProvinces : [d.startProvId].filter(Boolean);

      const capId = d.startProvId || provs[0];

      const block = PROVINCE_BLOCKS[capId] ?? 9;

      const capProv = (this.provinces || []).find(p => p.id === capId);

      const cy = capProv ? (capProv.cy ?? 0) : 0;

      const cx = capProv ? (capProv.cx ?? 0) : 0;

      return { block, cy, cx };

    };



    const keys = new Map(playables.map(d => [d, keyOf(d)]));

    playables.sort((a, b) => {

      const ka = keys.get(a), kb = keys.get(b);

      // 1. 地方ブロック順（東北→関東甲信越→中部→近畿→中国→四国→九州沖縄）

      if (ka.block !== kb.block) return ka.block - kb.block;

      // 2. 各地方ブロック内は北から南へ（cy昇順：小さい方が北）

      if (ka.cy !== kb.cy) return ka.cy - kb.cy;

      // 3. 同緯度は東から西へ（cx降順：大きい方が東）

      if (kb.cx !== ka.cx) return kb.cx - ka.cx;

      return String(a.id).localeCompare(String(b.id));

    });

    return playables;

  },



  getCastleName(provId) {

    const prov = this.provinces.find(p => p.id === provId);

    if (!prov) return '城';

    return prov.castleName || prov.castle || '城';

  },
};
