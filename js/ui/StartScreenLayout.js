// deploy47: 髑髏絵文字の代替 — 暗色の甲冑（兜）ピクトグラム。全画面共通ヘルパー
window.armorIconHTML = window.armorIconHTML || function (title) {
  return '<svg class="armor-icon" viewBox="0 0 24 24" role="img" aria-label="' + (title || '甲冑') + '"><path fill="#1a1a1a" stroke="#c9a54a" stroke-width="1" stroke-linejoin="round" d="M3 4.5 7.5 9 9 3h6l1.5 6L21 4.5 18.5 11H19c.6 0 1 .4 1 1v1.5c0 .6-.4 1-1 1h-1.2L16 20l-4 1.5L8 20l-1.8-5.5H5c-.6 0-1-.4-1-1V12c0-.6.4-1 1-1h.5Z"/><path fill="none" stroke="#c9a54a" stroke-width=".9" d="M8 13.5h8M9.5 16.5h5"/></svg>';
};
// 初期選択画面 フルウィンドウレイアウト
// 左: シナリオ一覧 / 中: 大名一覧 / 右上: シナリオ解説 / 右下: 勢力地図（大名選択と連動）
// 既存の DOM ノードを移動するだけなので、UIManager のイベント委譲・開始フローはそのまま動く。
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let built = false, svg = null, paths = {}, slBorderEls = [], slCoastEls = [], selected = null, passClick = false;

  const game = () => window.game || null;
  const scen = () => game()?.currentScenario || null;
  const owners = () => scen()?.owners || {};
  const playables = () => (game()?.currentScenario?.playables || []);

  function clanInfo(id) {
    const cm = window.CLAN_MASTER_DATA; const m = (cm && (cm.clans || cm)) || {};
    const p = [...document.querySelectorAll('#daimyoGrid .daimyo-card')].find(c => c.dataset.id === id);
    const pl = playables().find(x => x && x.id === id);
    return {
      color: pl?.color || m[id]?.color || hashColor(id),
      name: pl?.clan || m[id]?.family || m[id]?.name || id,
      leader: p ? p.querySelector('.daimyo-name-text')?.textContent : (pl?.name || ''),
      playable: !!p,
    };
  }

  function stripEraYears() {
    document.querySelectorAll('#scenarioEraTabs .era-tab-btn').forEach(b => {
      const t = b.textContent, n = t.replace(/\s*[（(][^）)]*[）)]\s*/g, '').trim();
      if (n !== t) { b.title = t; b.textContent = n; }
    });
  }

  const lcache = {};
  function lighten(c) {
    if (lcache[c]) return lcache[c];
    const cv = document.createElement('canvas').getContext('2d'); cv.fillStyle = '#000'; cv.fillStyle = c;
    const hx = cv.fillStyle; if (!/^#/.test(hx)) return (lcache[c] = c);
    let r = parseInt(hx.slice(1,3),16)/255, g = parseInt(hx.slice(3,5),16)/255, b = parseInt(hx.slice(5,7),16)/255;
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn; let h = 0, l = (mx+mn)/2; const sat = d ? d/(1-Math.abs(2*l-1)) : 0;
    if (d) { h = mx===r ? ((g-b)/d)%6 : mx===g ? (b-r)/d+2 : (r-g)/d+4; h = (h*60+360)%360; }
    l = Math.min(l + 0.12, 0.72);
    return (lcache[c] = `hsl(${h.toFixed(0)},${(Math.min(sat,1)*100).toFixed(0)}%,${(l*100).toFixed(0)}%)`);
  }

  function addTroops(own) {
    const tot = {}; (game()?.provinces || []).forEach(p => { const o = own[p.id]; if (o) tot[o] = (tot[o] || 0) + (Number(p.troops) || 0); });
    document.querySelectorAll('#daimyoGrid .daimyo-card').forEach(c => {
      const st = c.querySelector('.daimyo-card-stats'); if (!st) return;
      let sp = st.querySelector('.sl-troops'); if (!sp) { sp = document.createElement('span'); sp.className = 'sl-troops'; } if (st.firstElementChild !== sp) st.prepend(sp);
      const t = (tot[c.dataset.id] || 0).toLocaleString('ja-JP'); if (sp.dataset.t !== t) { sp.dataset.t = t; sp.innerHTML = IS_PHONE ? `<i class="sl-ic" aria-hidden="true">⚔️</i><strong>${t}</strong>` : `兵<strong>${t}</strong>`; sp.title = `兵力 ${t}`; }
    });
  }

  const clanMaster = (id) => { const cm = window.CLAN_MASTER_DATA; return ((cm && (cm.clans || cm)) || {})[id] || null; };

  function addTactics() {
    document.querySelectorAll('#daimyoGrid .daimyo-card').forEach(c => {
      const m = clanMaster(c.dataset.id); let t = c.querySelector('.sl-tactic');
      if (!m?.tactic) { t?.remove(); return; }
      if (!t) { t = document.createElement('span'); t.className = 'sl-tactic'; c.appendChild(t); }
      if (t.dataset.t !== m.tactic) { t.dataset.t = m.tactic; t.innerHTML = `<small>固有戦法</small><b>${esc(m.tactic)}</b>`; t.title = `${m.tactic}：${m.tacticDesc || ''}`; }
    });
  }

  const vcache = {};
  function vivid(c) {
    if (vcache[c]) return vcache[c];
    const cv = document.createElement('canvas').getContext('2d'); cv.fillStyle = '#000'; cv.fillStyle = c;
    let hx = cv.fillStyle; if (!/^#/.test(hx)) return (vcache[c] = c);
    let r = parseInt(hx.slice(1,3),16)/255, g = parseInt(hx.slice(3,5),16)/255, b = parseInt(hx.slice(5,7),16)/255;
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn; let h = 0, l = (mx+mn)/2, sat = d ? d/(1-Math.abs(2*l-1)) : 0;
    if (d) { h = mx===r ? ((g-b)/d)%6 : mx===g ? (b-r)/d+2 : (r-g)/d+4; h = (h*60+360)%360; }
    sat = d ? Math.max(sat, 0.68) : 0.1; l = Math.min(Math.max(l, 0.52), 0.66);
    return (vcache[c] = `hsl(${h.toFixed(0)},${(sat*100).toFixed(0)}%,${(l*100).toFixed(0)}%)`);
  }

  function hashColor(id) { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return `hsl(${h % 360},38%,42%)`; }
  const provName = (id) => (window.PROVINCES_DATA || []).find(p => p.id === id)?.name || id;

  const IS_PHONE = !!window.SENGOKU_IS_PHONE;
  const ERA_ICON = { all: '🗾', ancient: '⛩️', genpei_kamakura: '🏹', muromachi: '🌸', medieval: '🏹', sengoku_early: '🔥', sengoku_climax: '⚔️', unification: '🏯', edo_bakumatsu: '⛵', virtual: '🎲' };
  const ERA_SHORT = { all: 'すべて', ancient: '古代・平安', genpei_kamakura: '源平・鎌倉', muromachi: '室町', medieval: '中世', sengoku_early: '黎明', sengoku_climax: '戦国乱世', unification: '天下統一', edo_bakumatsu: '泰平・幕末', virtual: '仮想' };
  const DIFF_NAME_MAP = { relaxed: '楽級', easy: '初級', normal: '中級', hard: '上級' };
  const DIFF_INFO_MAP = {
    relaxed: '【楽級】基準値に金+1,200／兵糧+1,500・ゆったり遊べる難易度',
    easy: '【初級】基準値に金+650／兵糧+850・遊びやすい難易度',
    normal: '【中級】基準値に金+150／兵糧+200・標準バランス',
    hard: '【上級】基準値から金-50／兵糧-100・歯ごたえのある難易度'
  };

  const FAMOUS_CLANS = new Set([
    'oda', 'takeda', 'uesugi', 'hojo', 'imagawa', 'mori', 'chosokabe',
    'shimazu', 'date', 'otomo', 'tokugawa', 'azai', 'asakura', 'miyoshi',
    'amago', 'ryuzoji', 'satake', 'ashikaga', 'toyotomi', 'sanada', 'maeda',
    'nabeshima', 'kuroda', 'ukita', 'tachibana', 'mogami', 'nanbu', 'honganji', 'matsunaga', 'rokkaku'
  ]);

  let currentRegion = 'all';
  let currentSearchQuery = '';
  let setStep = () => {};

  // 現在表示されているシナリオの時代区分のみを時代タブに表示する関数
  function syncEraTabsVisibility() {
    const visibleEras = new Set();
    document.querySelectorAll('#scenarioSelectorGroup .scenario-btn').forEach(btn => {
      if (btn.style.display !== 'none' && !btn.classList.contains('hidden')) {
        const e = btn.dataset.era;
        if (e) visibleEras.add(e);
      }
    });
    // クッションボタンが開いていない初期状態等のフォールバック
    if (visibleEras.size === 0) {
      visibleEras.add('sengoku_climax');
      visibleEras.add('unification');
    }
    document.querySelectorAll('#scenarioEraTabs .era-tab-btn').forEach(tab => {
      const era = tab.dataset.era;
      const shouldShow = visibleEras.has(era);
      tab.style.setProperty('display', shouldShow ? 'inline-flex' : 'none', 'important');
    });
  }

  function scrollCardToCenter(card, smooth = true) {
    if (!card) return;
    const container = card.closest('.sl-daimyo-body') || card.closest('#daimyoGrid') || card.parentElement;
    if (container && container.scrollHeight > container.clientHeight) {
      const cardTop = card.offsetTop;
      const cardHeight = card.offsetHeight;
      const containerHeight = container.clientHeight;
      const targetScrollTop = cardTop - (containerHeight / 2) + (cardHeight / 2);
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: smooth ? 'smooth' : 'auto'
        });
      } else {
        container.scrollTop = Math.max(0, targetScrollTop);
      }
    } else {
      try {
        card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
      } catch (e) {
        card.scrollIntoView();
      }
    }
  }

  // 選択中大名カードへ自動スクロール（ジャンプ）
  function scrollToSelectedDaimyo(smooth = false) {
    requestAnimationFrame(() => {
      const curId = selected || $('#daimyoGrid .daimyo-card.selected')?.dataset?.id;
      const card = curId ? document.querySelector(`#daimyoGrid .daimyo-card[data-id="${curId}"]`) : document.querySelector('#daimyoGrid .daimyo-card.selected');
      if (card) {
        scrollCardToCenter(card, smooth);
      }
    });
  }

  function getProvRegionName(provId) {
    const p = (window.PROVINCES_DATA || []).find(x => x.id === provId);
    return p?.region || '';
  }

  // 地方名・国名からの地方フォールバック辞書（中国・四国を分離、東北に北海道含む）
  const PROV_TO_REGION = {
    '蝦夷': 'tohoku', '東津軽': 'tohoku', '西津軽': 'tohoku', '陸奥': 'tohoku', '陸中': 'tohoku', '陸前': 'tohoku', '羽後': 'tohoku', '羽前': 'tohoku', '岩代': 'tohoku', '磐城': 'tohoku',
    '相模': 'kanto', '武蔵': 'kanto', '上野': 'kanto', '下野': 'kanto', '常陸': 'kanto', '下総': 'kanto', '上総': 'kanto', '安房': 'kanto',
    '尾張': 'chubu', '三河': 'chubu', '遠江': 'chubu', '駿河': 'chubu', '伊豆': 'chubu', '甲斐': 'chubu', '信濃': 'chubu', '飛騨': 'chubu', '美濃': 'chubu', '越前': 'chubu', '加賀': 'chubu', '能登': 'chubu', '越中': 'chubu', '越後': 'chubu',
    '山城': 'kinki', '大和': 'kinki', '河内': 'kinki', '和泉': 'kinki', '摂津': 'kinki', '近江': 'kinki', '丹波': 'kinki', '丹後': 'kinki', '但馬': 'kinki', '播磨': 'kinki', '伊賀': 'kinki', '伊勢': 'kinki', '志摩': 'kinki', '紀伊': 'kinki', '淡路': 'kinki',
    '因幡': 'chugoku', '伯耆': 'chugoku', '出雲': 'chugoku', '石見': 'chugoku', '隠岐': 'chugoku', '美作': 'chugoku', '備前': 'chugoku', '備中': 'chugoku', '備後': 'chugoku', '安芸': 'chugoku', '周防': 'chugoku', '長門': 'chugoku',
    '阿波': 'shikoku', '讃岐': 'shikoku', '伊予': 'shikoku', '土佐': 'shikoku',
    '筑前': 'kyushu', '筑後': 'kyushu', '豊前': 'kyushu', '豊後': 'kyushu', '肥前': 'kyushu', '肥後': 'kyushu', '日向': 'kyushu', '大隅': 'kyushu', '薩摩': 'kyushu', '壱岐': 'kyushu', '対馬': 'kyushu', '琉球': 'kyushu'
  };

  function getClanRegionCategory(clanId, card) {
    const pl = playables().find(x => x.id === clanId);
    const scenData = scen();
    let homeProvId = pl?.startProvId || (pl?.myProvinces && pl.myProvinces[0]);
    if (!homeProvId && scenData?.owners) {
      for (const [pid, cid] of Object.entries(scenData.owners)) {
        if (cid === clanId) { homeProvId = pid; break; }
      }
    }
    const reg = getProvRegionName(homeProvId);
    if (reg === '北海道' || reg === '東北') return 'tohoku';
    if (reg === '関東') return 'kanto';
    if (reg === '中部') return 'chubu';
    if (reg === '近畿') return 'kinki';
    if (reg === '中国') return 'chugoku';
    if (reg === '四国') return 'shikoku';
    if (reg === '九州') return 'kyushu';

    // 国名テキストからのフォールバック
    const provNameText = card ? card.querySelector('.daimyo-clan-name')?.textContent?.trim() : '';
    if (provNameText && PROV_TO_REGION[provNameText]) {
      return PROV_TO_REGION[provNameText];
    }
    return 'other';
  }

  function isMajorClan(clanId, provCount) {
    return FAMOUS_CLANS.has(clanId) || (provCount >= 2);
  }

  function getProvTroops(provId) {
    const g = game();
    if (g?.provinces) {
      const p = g.provinces.find(x => x.id === provId);
      if (p && p.troops != null && Number(p.troops) > 0) return Number(p.troops).toLocaleString('ja-JP');
    }
    const provObj = (window.PROVINCES_DATA || []).find(p => p.id === provId);
    if (provObj?.troops != null && Number(provObj.troops) > 0) return Number(provObj.troops).toLocaleString('ja-JP');
    return '800';
  }

  // 難易度説明リアルタイム更新
  function updateDiffDesc() {
    const bar = document.querySelector('.sl-diff-desc-bar');
    if (!bar) return;
    const selBtn = document.querySelector('.diff-option-btn.selected');
    const dKey = selBtn?.dataset?.diff || 'normal';
    bar.textContent = DIFF_INFO_MAP[dKey] || DIFF_INFO_MAP.normal;
  }

  // Step 1: シナリオプレビューカード・タイトル・解説更新
  function updateScenarioPreview() {
    const s = scen();
    if (!s) return;
    const yearText = s.year < 0 ? `前${Math.abs(s.year)}年` : `${s.year}年`;
    const gengo = s.gengo ? `年号: ${s.gengo}` : '';
    const title = s.title || '';
    const sub = s.subtitle ? `〜${s.subtitle}〜` : '';
    const lore = s.lore_background || s.desc || '';

    // ③ 勢力図のヘッダータイトル
    const descName = document.querySelector('.sl-desc-name');
    if (descName) descName.textContent = `${yearText} ${title}`;

    // ① シナリオのヘッダータイトル（今選択中のシナリオのタイトル）
    const scenCurTitle = document.querySelector('.sl-scen-cur-title');
    if (scenCurTitle) {
      scenCurTitle.textContent = `${yearText} ${title}`;
      scenCurTitle.title = `${yearText} ${title} ${sub}`;
    }

    // ① シナリオの詳細解説ドロップダウン
    const scenDescDrop = document.querySelector('.sl-scen-desc-drop');
    if (scenDescDrop) {
      scenDescDrop.innerHTML = `
        <div class="sl-scen-drop-head">
          <span class="sl-scen-drop-title">${esc(title)} <small style="font-size:12px; font-weight:normal; color:#ffd98a;">${esc(sub)}</small></span>
          ${gengo ? `<span class="sl-scen-drop-gengo">${esc(gengo)}</span>` : ''}
        </div>
        <div class="sl-scen-drop-lore">${esc(lore)}</div>
      `;
    }

    const prev = document.querySelector('.sl-phone-scen-preview');
    if (!prev) return;

    let factionStr = '';
    const pl = playables();
    if (pl && pl.length) {
      const sorted = [...pl].sort((a, b) => {
        const aMaj = isMajorClan(a.id, a.provCount || 1) ? 1 : 0;
        const bMaj = isMajorClan(b.id, b.provCount || 1) ? 1 : 0;
        return bMaj - aMaj;
      });
      const topNames = sorted.slice(0, 4).map(x => x.name || x.clan).join('、');
      factionStr = `<b>主な大名:</b> ${esc(topNames)}${pl.length > 4 ? ` ほか全${pl.length}家` : ''}`;
    }

    prev.innerHTML = `
      <div class="sl-scen-prev-head">
        <span class="sl-scen-prev-badge">${esc(yearText)}</span>
        <span class="sl-scen-prev-title">${esc(title)} <small style="font-size:12px; font-weight:normal; color:#ffd98a;">${esc(sub)}</small></span>
        ${gengo ? `<span class="sl-scen-prev-gengo">${esc(gengo)}</span>` : ''}
      </div>
      <div class="sl-scen-prev-lore">${esc(lore)}</div>
      ${factionStr ? `<div class="sl-scen-prev-factions">${factionStr}</div>` : ''}
      <button type="button" class="sl-scen-prev-next-btn">🏯 このシナリオの大名を選ぶ ➔</button>
    `;
    prev.querySelector('.sl-scen-prev-next-btn')?.addEventListener('click', () => setStep(2));
  }

  // 大名フィルタリング
  function filterDaimyos() {
    const query = currentSearchQuery.trim().toLowerCase();
    const cards = document.querySelectorAll('#daimyoGrid .daimyo-card');
    let matched = 0;
    cards.forEach(c => {
      const id = c.dataset.id;
      const reg = c.dataset.region || getClanRegionCategory(id, c);
      c.dataset.region = reg;
      const name = (c.querySelector('.daimyo-name-text')?.textContent || '').toLowerCase();
      const clan = (c.querySelector('.daimyo-clan-name')?.textContent || '').toLowerCase();
      const provBadge = c.querySelector('.daimyo-prov-badge')?.textContent || '';
      const provNum = parseInt(provBadge) || 1;
      const major = isMajorClan(id, provNum);

      let regionMatch = true;
      if (currentRegion === 'major') {
        regionMatch = major;
      } else if (currentRegion !== 'all') {
        regionMatch = (reg === currentRegion);
      }

      let queryMatch = true;
      if (query) {
        queryMatch = name.includes(query) || clan.includes(query) || id.toLowerCase().includes(query);
      }

      const show = regionMatch && queryMatch;
      c.classList.toggle('sl-filtered-out', !show);
      c.style.display = show ? '' : 'none';
      if (show) matched++;
    });

    const cnt = document.querySelector('.sl-count-daimyo');
    if (cnt) {
      if (currentRegion !== 'all' || query) {
        cnt.textContent = `${matched} / ${cards.length}家`;
      } else {
        cnt.textContent = `${cards.length}家`;
      }
    }
  }

  // 大名カードの装飾（詳細ボタン追加、地方データ付与）
  function decorateDaimyoCards() {
    document.querySelectorAll('#daimyoGrid .daimyo-card').forEach(c => {
      const id = c.dataset.id;
      c.dataset.region = getClanRegionCategory(id, c);

      if (IS_PHONE && !c.querySelector('.sl-card-detail-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sl-card-detail-btn';
        btn.innerHTML = 'ℹ️ 詳細';
        btn.title = '大名列伝・戦略図・奥義を確認';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectClan(id, { scroll: false });
          passClick = true;
          try { c.click(); } finally { passClick = false; }
        });
        c.appendChild(btn);
      }
    });
  }

  // 選択中大名ジャンプバー更新（位置へジャンプボタンは廃止し自動ジャンプ）
  function updateDaimyoJumpBar(id) {
    const bar = document.querySelector('.sl-daimyo-jump-bar');
    if (bar) bar.style.display = 'none';
  }

  // 地図タップ時の領国情報バー更新（ユーザー要望：この大名を選択ボックスは省略）
  function updateMapTouchInfo(provId) {
    const bar = document.querySelector('.sl-map-touch-info');
    if (bar) bar.style.display = 'none';
  }

  // シナリオ全体詳細モーダル（①シナリオおよび③勢力図の詳細ボタン共通）
  function openScenarioDetailModal() {
    const s = scen();
    if (!s) return;
    const modal = document.getElementById('scenarioDetailModal');
    if (!modal) return;
    const body = document.getElementById('scenarioDetailBody');
    if (!body) return;

    const yearText = s.year < 0 ? `前${Math.abs(s.year)}年` : `${s.year}年`;
    const gengo = s.gengo ? `年号: ${s.gengo}` : '';
    const title = s.title || '';
    const sub = s.subtitle ? `〜${s.subtitle}〜` : '';
    const lore = s.lore_background || s.desc || '';

    let factionHtml = '';
    const pl = playables();
    if (pl && pl.length) {
      const sorted = [...pl].sort((a, b) => {
        const aMaj = isMajorClan(a.id, a.provCount || 1) ? 1 : 0;
        const bMaj = isMajorClan(b.id, b.provCount || 1) ? 1 : 0;
        return bMaj - aMaj;
      });
      const chips = sorted.map(x => {
        const maj = isMajorClan(x.id, x.provCount || 1);
        return `<span class="scen-modal-clan-chip ${maj ? 'major' : ''}">${esc(x.name || x.clan)}<small>（${x.provCount || 1}国）</small></span>`;
      }).join('');
      factionHtml = `
        <div class="scen-modal-section">
          <div class="scen-modal-sec-title">🏯 参戦各大名家（全${pl.length}家）</div>
          <div class="scen-modal-clans-grid">${chips}</div>
        </div>
      `;
    }

    body.innerHTML = `
      <div class="scen-modal-header-card">
        <div class="scen-modal-badge-row">
          <span class="scen-modal-year">${esc(yearText)}</span>
          ${gengo ? `<span class="scen-modal-gengo">${esc(gengo)}</span>` : ''}
        </div>
        <div class="scen-modal-title">${esc(title)}</div>
        ${sub ? `<div class="scen-modal-sub">${esc(sub)}</div>` : ''}
      </div>
      <div class="scen-modal-section">
        <div class="scen-modal-sec-title">📖 歴史背景・天下情勢</div>
        <div class="scen-modal-lore">${esc(lore)}</div>
      </div>
    `;

    modal.classList.remove('hidden');

    const closeBtn = document.getElementById('scenarioDetailCloseBtn');
    const closeFooterBtn = document.getElementById('scenarioDetailCloseFooterBtn');
    const close = () => modal.classList.add('hidden');
    if (closeBtn) closeBtn.onclick = close;
    if (closeFooterBtn) closeFooterBtn.onclick = close;
    modal.onclick = (e) => {
      if (e.target === modal) close();
    };
  }

  // 大名詳細ポップアップ（#daimyoPopup）の3段固定構造化
  function setupDaimyoPopupMobile() {
    if (!IS_PHONE) return;
    const popupCard = document.querySelector('#daimyoPopup .daimyo-popup-card');
    if (!popupCard || popupCard.dataset.mobileSetup) return;
    // Markup already has a scrollable body.  Re-wrapping its children leaves the
    // original, empty flex item between the header and the ability cards.
    if ([...popupCard.children].some(child => child.classList?.contains('daimyo-popup-scrollable-body'))) {
      popupCard.dataset.mobileSetup = 'true';
      return;
    }
    popupCard.dataset.mobileSetup = 'true';

    const header = popupCard.querySelector('.daimyo-popup-header');
    const stats = popupCard.querySelector('.daimyo-popup-stats');
    const tacticRow = popupCard.querySelector('.daimyo-popup-personality-tactic-row');
    const bodyGrid = popupCard.querySelector('.daimyo-popup-body-grid');
    const footer = popupCard.querySelector('.daimyo-popup-footer-actions');

    if (header && stats && tacticRow && bodyGrid && footer) {
      const scrollBody = document.createElement('div');
      scrollBody.className = 'daimyo-popup-scrollable-body';

      popupCard.insertBefore(scrollBody, footer);
      scrollBody.appendChild(stats);
      scrollBody.appendChild(tacticRow);
      scrollBody.appendChild(bodyGrid);
    }
  }

  function buildPhone(root) { // スマホ: ステップ切替 + 下部固定バー
    root.classList.add('sl-m'); root.dataset.step = '1';
    const ttl = document.querySelector('#startModal .start-game-title');
    if (ttl) {
      ttl.childNodes.forEach(nd => { if (nd.nodeType === 3) nd.textContent = nd.textContent.replace(/\s*❖\s*/g, ''); });
    }

    // ステップタブ
    const steps = document.createElement('nav'); steps.className = 'sl-steps'; steps.setAttribute('role', 'tablist');
    steps.innerHTML = [
      ['1', '📜', '① シナリオ'],
      ['2', '🏯', '② 大名'],
      ['3', '🗾', '③ 勢力図']
    ].map(([n, ic, l]) =>
      `<button type="button" role="tab" class="sl-step" data-step="${n}" aria-label="${l}"><i>${ic}</i><span>${l}</span></button>`).join('');
    root.before(steps);

    // 下部固定出陣バー
    const bar = document.createElement('div'); bar.className = 'sl-mbar';
    bar.innerHTML = `
      <div class="sl-mbar-sel"><i class="sl-dot"></i><span class="sl-mbar-txt">大名を選択</span></div>
      <button type="button" class="sl-mbar-detail-btn" id="slMobileDetail" title="選択中大名の詳細・戦略図を確認">ℹ️ 詳細</button>
      <button type="button" class="sl-mbar-go" id="slMobileGo" aria-label="この大名で天下統一へ出陣">⚔ 出陣</button>
    `;
    root.after(bar);

    setStep = (n) => {
      root.dataset.step = String(n);
      steps.querySelectorAll('.sl-step').forEach(b => {
        const on = b.dataset.step === String(n);
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on);
      });
      // ①シナリオでは一番下の大名家・出陣バーを非表示（省略）
      if (bar) {
        bar.style.display = (String(n) === '1') ? 'none' : 'flex';
      }
      if (String(n) === '1') {
        updateScenarioPreview();
        syncEraTabsVisibility();
      }
      if (String(n) === '2') {
        decorateDaimyoCards();
        filterDaimyos();
        updateDiffDesc();
        scrollToSelectedDaimyo(true);
      }
      if (String(n) === '3') {
        requestAnimationFrame(() => $('.sl-map-body svg')?.dispatchEvent(new Event('sl-fit')));
        updateMapTouchInfo(null);
      }
    };

    steps.addEventListener('click', (e) => {
      const b = e.target.closest('.sl-step');
      if (b) {
        if (String(b.dataset.step) === '1') {
          const sp = $('.sl-scen', root);
          sp?.classList.remove('is-scen-detail-open');
          const fv = sp?.querySelector('.sl-scen-fullscreen-view');
          if (fv) fv.hidden = true;
        }
        setStep(b.dataset.step);
      }
    });
    bar.querySelector('.sl-mbar-sel').addEventListener('click', () => setStep(2));
    bar.querySelector('.sl-mbar-detail-btn').addEventListener('click', () => {
      const c = document.querySelector('#daimyoGrid .daimyo-card.selected') || document.querySelector('#daimyoGrid .daimyo-card');
      if (c) {
        passClick = true;
        try { c.click(); } finally { passClick = false; }
      }
    });
    bar.querySelector('.sl-mbar-go').addEventListener('click', () => {
      const curSelected = selected || $('#daimyoGrid .daimyo-card.selected')?.dataset?.id;
      if (!curSelected) {
        setStep(2);
        return;
      }
      const g = game();
      if (g?.audio) {
        g.audio.init();
        if (g.audio.ctx && g.audio.ctx.state === 'suspended') g.audio.ctx.resume().catch(() => {});
      }
      if (window.SengokuTitleBgm && typeof window.SengokuTitleBgm.horagai === 'function') {
        window.SengokuTitleBgm.horagai();
      }
      $('#slStartBtn')?.click();
    });

    // Step 1: シナリオボタンを押したら、シナリオ解説を全面表示し、説明の下に「このシナリオ選択に戻る」「大名選択に進む」を表示する。
    const scenPanel = $('.sl-scen', root);
    const scenHead = scenPanel && $('.sl-head', scenPanel);
    if (scenHead) {
      scenHead.innerHTML = '<span>歴史シナリオ</span>';
    }

    const scenBody = $('.sl-scen-body', root);
    const scenActions = document.createElement('div');
    scenActions.className = 'sl-scen-fullscreen-view';
    scenActions.hidden = true;
    scenActions.innerHTML = `
      <div class="sl-scen-fs-card">
        <div class="sl-scen-fs-badges">
          <span class="sl-scen-fs-year"></span>
          <span class="sl-scen-fs-gengo"></span>
        </div>
        <h3 class="sl-scen-fs-title"></h3>
        <div class="sl-scen-fs-sub"></div>
        <div class="sl-scen-fs-divider"></div>
        <div class="sl-scen-fs-sec-label">📖 シナリオ解説・天下情勢</div>
        <div class="sl-scen-fs-lore"></div>
        <div class="sl-scen-choice-actions">
          <button type="button" class="sl-scen-back-btn">このシナリオ選択に戻る</button>
          <button type="button" class="sl-scen-next-btn">大名選択に進む</button>
        </div>
      </div>
    `;
    scenBody?.after(scenActions);

    const openScenarioFullscreen = () => {
      const s = scen();
      if (!s) return;
      const yearText = s.year < 0 ? `前${Math.abs(s.year)}年` : `${s.year}年`;
      const yrEl = scenActions.querySelector('.sl-scen-fs-year');
      const ggEl = scenActions.querySelector('.sl-scen-fs-gengo');
      const ttEl = scenActions.querySelector('.sl-scen-fs-title');
      const sbEl = scenActions.querySelector('.sl-scen-fs-sub');
      const lrEl = scenActions.querySelector('.sl-scen-fs-lore');
      if (yrEl) yrEl.textContent = yearText;
      if (ggEl) {
        ggEl.textContent = s.gengo ? `年号：${s.gengo}` : '';
        ggEl.hidden = !s.gengo;
      }
      if (ttEl) ttEl.textContent = s.title || '';
      if (sbEl) {
        sbEl.textContent = s.subtitle ? `〜${s.subtitle}〜` : '';
        sbEl.hidden = !s.subtitle;
      }
      if (lrEl) {
        const mainLore = s.lore_background || s.desc || '';
        const extraFocus = s.lore_focus ? `\n\n【見どころ】\n${s.lore_focus}` : '';
        lrEl.textContent = `${mainLore}${extraFocus}`.trim();
      }
      scenPanel?.classList.add('is-scen-detail-open');
      scenActions.hidden = false;
      scenActions.scrollTop = 0;
    };

    const closeScenarioFullscreen = () => {
      scenPanel?.classList.remove('is-scen-detail-open');
      scenActions.hidden = true;
    };

    // 「大名選択に進む」を押すと ③ 勢力図 に遷移する
    scenActions.querySelector('.sl-scen-next-btn')?.addEventListener('click', () => {
      closeScenarioFullscreen();
      setStep(3);
    });
    scenActions.querySelector('.sl-scen-back-btn')?.addEventListener('click', () => {
      closeScenarioFullscreen();
    });

    scenBody?.addEventListener('click', (e) => {
      if (e.target.closest('.scenario-btn')) {
        setTimeout(() => {
          updateScenarioPreview();
          openScenarioFullscreen();
        }, 60);
      }
    });

    // 歴史シナリオ選択時およびクッション開閉時の連動
    document.getElementById('scenarioSelectorGroup')?.addEventListener('click', (e) => {
      if (e.target.closest('.era-cushion-btn')) {
        setTimeout(() => syncEraTabsVisibility(), 50);
        setTimeout(() => syncEraTabsVisibility(), 180);
      }
      if (e.target.closest('.scenario-btn')) {
        setTimeout(() => scrollToSelectedDaimyo(true), 60);
        setTimeout(() => scrollToSelectedDaimyo(true), 150);
      }
    });

    // Step 1〜3: 難易度はステップ切替の直下に常時表示する。
    const diffWrap = $('.sl-diff', root);
    if (diffWrap) {
      const diffDesc = document.createElement('div');
      diffDesc.className = 'sl-diff-desc-bar';
      diffWrap.appendChild(diffDesc);
      diffWrap.addEventListener('click', (e) => {
        if (e.target.closest('.diff-option-btn')) setTimeout(() => updateDiffDesc(), 50);
      });
      const mobileDifficulty = document.createElement('div');
      mobileDifficulty.className = 'sl-mobile-difficulty';
      root.before(mobileDifficulty);
      mobileDifficulty.appendChild(diffWrap);
    }

    // Step 2: スマホでは大名を一覧で直接選ぶ。検索欄と地方フィルターは表示しない。

    // Step 3: シナリオ解説パネルはシナリオ名＋「詳細」ボタンの1行にし、押すと全文を開閉
    const descPanel = $('.sl-desc', root);
    const descHead = descPanel && $('.sl-head', descPanel);
    if (descHead) {
      descHead.innerHTML = '<span class="sl-desc-name"></span><button type="button" class="sl-desc-more-btn" aria-expanded="false">詳細</button>';
      const moreBtn = descHead.querySelector('.sl-desc-more-btn');
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openScenarioDetailModal();
      });
    }

    // Step 3: 家伝・固有戦法を独立カードとして表示
    const lore = $('.sl-map-lore', root);
    const descBody = $('.sl-desc-body', root);
    if (lore && descBody) {
      lore.className = 'sl-desc-lore-box';
      descBody.appendChild(lore);
    }

    // 年代タブからピクトグラムを削除し、テキストのみ設定 ＆ 現在表示シナリオと連動
    document.querySelectorAll('#scenarioEraTabs .era-tab-btn').forEach(b => {
      const k = b.dataset.era;
      b.title = b.title || b.textContent.trim();
      b.setAttribute('aria-label', b.title);
      b.textContent = ERA_SHORT[k] || b.title;
    });
    syncEraTabsVisibility();

    // 難易度ボタンからピクトグラムを削除し、楽級・初級・中級・上級に設定
    document.querySelectorAll('#startModal .diff-option-btn[data-diff]').forEach(b => {
      b.querySelectorAll('.sl-dicon').forEach(el => el.remove());
      const k = b.dataset.diff;
      const label = DIFF_NAME_MAP[k] || '中級';
      const n = b.querySelector('.diff-btn-name');
      if (n) {
        n.textContent = label;
      } else {
        b.textContent = label;
      }
      const sub = b.querySelector('.diff-btn-sub');
      if (sub) sub.style.display = 'none';
    });

    setupDaimyoPopupMobile();
    setStep(1);
  }

  const troopsOf = (card) => card?.querySelector('.sl-troops')?.dataset.t ?? null;

  function updatePhoneBar(id, n) {
    const t = $('.sl-mbar-txt'); if (!t) return;
    const goBtn = $('#slMobileGo');
    if (!id) {
      t.textContent = '大名を選択してください';
      if (goBtn) { goBtn.textContent = '大名選択'; }
      updateDaimyoJumpBar(null);
      return;
    }
    const ci = clanInfo(id);
    const card = [...document.querySelectorAll('#daimyoGrid .daimyo-card')].find(c => c.dataset.id === id);
    const tr = troopsOf(card);
    const kid = document.getElementById('kamon-' + id) ? 'kamon-' + id : '';

    let kamonHtml = '';
    if (kid) {
      kamonHtml = `<svg class="sl-mbar-kamon" viewBox="0 0 32 32" aria-hidden="true"><use href="#${kid}"></use></svg>`;
    } else {
      kamonHtml = `<i class="sl-dot" style="background:${ci.color}"></i>`;
    }

    const selWrap = $('.sl-mbar-sel');
    if (selWrap) {
      // 下部バーは文字切れを避けるため、大名家の家名（織田家・武田家など）のみ表示
      selWrap.innerHTML = `${kamonHtml}<span class="sl-mbar-txt"><b>${esc(ci.name || ci.leader)}</b></span>`;
      selWrap.title = `${ci.leader || ci.name}・支配${n}国${tr != null ? '・兵力' + tr : ''}`;
    }
    if (goBtn) {
      goBtn.textContent = '⚔ 出陣';
    }
    updateDaimyoJumpBar(id);
  }

  function build() {
    const modal = $('#startModal'); const card = modal && $('.modal-card', modal);
    const grid = $('#daimyoGrid'); const scenWrap = $('.scenario-selector-container'); const desc = $('#scenarioDescBox');
    if (!card || !grid || !scenWrap || !desc || built || !(window.PROVINCES_DATA || []).length || !window.game) return false;
    built = true;
    modal.classList.add('sl-active'); document.body.classList.add('sl-start-open');
    card.removeAttribute('style');
    const tabs = $('#scenarioEraTabs'); const diff = $('.diff-selector-wrapper', card);
    const badge = $('#selectedDaimyoBadge'); const title = $('.start-game-title', card);
    const root = document.createElement('div'); root.className = 'sl-root';
    root.innerHTML = `
      <section class="sl-panel sl-scen"><div class="sl-head"><span>歴史シナリオ</span><small class="sl-count-scen"></small></div><div class="sl-body sl-scen-body"></div></section>
      <section class="sl-panel sl-daimyo"><div class="sl-diff"></div><div class="sl-head"><span>大名家</span><small class="sl-count-daimyo"></small></div><div class="sl-body sl-daimyo-body"></div>
        <div class="sl-foot"><button type="button" class="sl-start-btn" id="slStartBtn">この大名で出陣</button></div></section>
      <section class="sl-panel sl-desc"><div class="sl-head"><span>シナリオ解説</span></div><div class="sl-body sl-desc-body"></div></section>
      <section class="sl-panel sl-map"><div class="sl-head"><span>勢力図</span><small class="sl-map-info">地図の国をクリックすると、その国を治める大名を選択します</small></div><div class="sl-map-lore" hidden></div><div class="sl-body sl-map-body"></div></section>`;

    [...card.children].forEach(ch => { if (!ch.classList.contains('start-header-actions') && ch !== title) ch.classList.add('sl-hidden-legacy'); });
    card.appendChild(root);
    if (tabs) $('.sl-scen-body', root).before(tabs);
    $('.sl-scen-body', root).appendChild(scenWrap);
    $('.sl-daimyo-body', root).appendChild(grid);
    if (badge) $('.sl-daimyo .sl-head', root).after(badge);
    if (diff) $('.sl-diff', root).appendChild(diff);
    $('.sl-desc-body', root).appendChild(desc);
    buildMap($('.sl-map-body', root));
    document.querySelectorAll('#startModal .diff-option-btn[data-diff] .diff-btn-name').forEach(n => { n.textContent = n.textContent.replace(/[【】]/g, ''); });

    if (IS_PHONE) buildPhone(root);

    // 大名リストクリック
    grid.addEventListener('click', (e) => {
      const c = e.target.closest('.daimyo-card'); if (!c || passClick) return;
      if (!c.classList.contains('selected') || selected !== c.dataset.id) {
        e.stopImmediatePropagation();
        selectClan(c.dataset.id, { scroll: false });
      }
    }, true);

    $('#slStartBtn').addEventListener('click', () => {
      const g = game();
      if (!g) return;
      const curSelected = selected || $('#daimyoGrid .daimyo-card.selected')?.dataset?.id;
      if (!curSelected) {
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
        return;
      }

      selectClan(curSelected, { scroll: false, silent: true });
      const pl = playables().find(x => x && x.id === curSelected);
      if (pl) {
        g.playerClanId = pl.id;
        g.playerDaimyo = JSON.parse(JSON.stringify(pl));
        if (typeof g._playableFunds === 'function') {
          g.gold = g._playableFunds(pl, 'gold');
          g.rice = g._playableFunds(pl, 'rice');
        }
      }

      if (g.music) {
        g.music.init();
        if (g.music.ctx && g.music.ctx.state === 'suspended') {
          g.music.ctx.resume().catch(() => {});
        }
      }
      if (g.audio) {
        g.audio.init();
        if (g.audio.ctx && g.audio.ctx.state === 'suspended') {
          g.audio.ctx.resume().catch(() => {});
        }
      }
      if (window.SengokuTitleBgm && typeof window.SengokuTitleBgm.horagai === 'function') {
        window.SengokuTitleBgm.horagai();
      }
      const popup = document.getElementById('daimyoPopup');
      if (popup) popup.classList.add('hidden');
      g.startGame();
    });

    new MutationObserver(() => queueRefresh()).observe(grid, { childList: true });
    new MutationObserver(() => queueRefresh()).observe(desc, { childList: true });
    queueRefresh();
    return true;
  }

  function buildMap(el) {
    svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'sl-svgmap');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const provs = window.PROVINCES_DATA || [];
    const SHIKOKU_IDS = new Set(['iyo_matsuyama', 'iyo_nii', 'iyo_ohzu', 'iyo_uwajima', 'noshima', 'sanuki', 'awa_shikoku', 'tosa_kochi', 'tosa_aki', 'tosa_gun', 'tosa_nakamura']);
    const provById = new Map(provs.map(p => [p.id, p]));
    const getProvTransform = (pid) => {
      const tr = [];
      if (pid === 'ryukyu') tr.push('rotate(3 500 340)');
      if (pid !== 'goto') tr.push('translate(16 0)');
      const pr = provById.get(pid);
      const ox = Number(pr?.mapOffsetX), oy = Number(pr?.mapOffsetY);
      if ((Number.isFinite(ox) && ox) || (Number.isFinite(oy) && oy)) {
        tr.push(`translate(${Number.isFinite(ox) ? ox : 0} ${Number.isFinite(oy) ? oy : 0})`);
      }
      if (SHIKOKU_IDS.has(pid)) tr.push('rotate(4 280 450)');
      return tr.join(' ');
    };
    const getBorderTransform = (p1, p2) => {
      if (p1 === 'goto' || p2 === 'goto') return getProvTransform('goto');
      const tr = ['translate(16 0)'];
      if (SHIKOKU_IDS.has(p1) && SHIKOKU_IDS.has(p2)) tr.push('rotate(4 280 450)');
      return tr.join(' ');
    };
    const bData = window.MAP_BORDERS_DATA || null;
    let bordersHtml = '';
    if (bData) {
      if (Array.isArray(bData.coastlines)) {
        bordersHtml += bData.coastlines.map(c => {
          const ct = getProvTransform(c.p);
          return `<path class="sl-coast-line sl-coastline" data-p="${esc(c.p)}" d="${esc(c.d)}"${ct ? ` transform="${ct}"` : ''} fill="none" stroke="rgba(20, 14, 8, 0.78)" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>`;
        }).join('');
      } else if (bData.coastline) {
        bordersHtml += `<path class="sl-coastline" d="${esc(bData.coastline)}" fill="none" stroke="rgba(20, 14, 8, 0.78)" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>`;
      }
      if (Array.isArray(bData.borders)) {
        bordersHtml += bData.borders.map(b => {
          const bt = getBorderTransform(b.p1, b.p2);
          return `<path class="sl-border-line" data-p1="${esc(b.p1)}" data-p2="${esc(b.p2)}" d="${esc(b.d)}"${bt ? ` transform="${bt}"` : ''} fill="none" stroke="rgba(20, 14, 8, 0.72)" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>`;
        }).join('');
      }
    }
    svg.innerHTML = `<g class="sl-archipelago-wrap"><g class="sl-archipelago" transform="rotate(-3, 500, 340)"><g class="sl-provs">${provs.map(p => {
      const pt = getProvTransform(p.id);
      return `<path class="sl-prov" data-p="${esc(p.id)}" d="${esc(p.svgPath || p.d || '')}"${pt ? ` transform="${pt}"` : ''}><title>${esc(p.name)}</title></path>`;
    }).join('')}</g>${bordersHtml ? `<g class="sl-borders" style="pointer-events:none;">${bordersHtml}</g>` : ''}</g></g>`;
    el.appendChild(svg);
    paths = Object.fromEntries([...svg.querySelectorAll('.sl-prov')].map(p => [p.dataset.p, p]));
    slBorderEls = [...svg.querySelectorAll('.sl-border-line')].map(el => ({ el, p1: el.dataset.p1, p2: el.dataset.p2 }));
    slCoastEls = [...svg.querySelectorAll('.sl-coast-line')].map(el => ({ el, p: el.dataset.p }));
    const fit = () => { try { const b = svg.querySelector('g').getBBox(); if (b.width) svg.setAttribute('viewBox', `${b.x - 6} ${b.y - 6} ${b.width + 12} ${b.height + 12}`); } catch (_) {} };
    fit(); if (!svg.getAttribute('viewBox')) { svg.setAttribute('viewBox', '0 0 1000 620'); requestAnimationFrame(fit); }
    const tip = document.createElement('div'); tip.className = 'sl-tip'; el.appendChild(tip);

    svg.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768 || document.documentElement.classList.contains('sl-phone')) {
        tip.style.opacity = 0;
        return;
      }
      const p = e.target.closest('.sl-prov'); if (!p) { tip.style.opacity = 0; return; }
      const o = owners()[p.dataset.p]; const ci = o ? clanInfo(o) : null;
      tip.innerHTML = `<b>${esc(provName(p.dataset.p))}</b>${ci ? `<span><i style="background:${ci.color}"></i>${esc(ci.name)}${ci.leader ? '・' + esc(ci.leader) : ''}${ci.playable ? '' : '（選択不可）'}</span>` : '<span>空白地</span>'}`;
      const r = el.getBoundingClientRect(); tip.style.left = (e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 10) + 'px'; tip.style.opacity = 1;
    });
    svg.addEventListener('mouseleave', () => { tip.style.opacity = 0; });

    let base = null, vb = null, drag = null, dragged = false;
    const getVB = () => svg.getAttribute('viewBox').split(/\s+/).map(Number);
    const setVB = (v) => { vb = v; svg.setAttribute('viewBox', v.map(n => n.toFixed(2)).join(' ')); };
    const ensure = () => { if (!base) { base = getVB(); vb = base.slice(); } };
    const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(); const sc = Math.max(vb[2] / r.width, vb[3] / r.height);
      const ox = (r.width - vb[2] / sc) / 2, oy = (r.height - vb[3] / sc) / 2; return [vb[0] + (cx - r.left - ox) * sc, vb[1] + (cy - r.top - oy) * sc, sc]; };
    const clampVB = (v) => { const [bx, by, bw, bh] = base; const w = v[2], h = v[3];
      const mx = bw * 0.25, my = bh * 0.25; let x = Math.min(Math.max(v[0], bx - mx), bx + bw + mx - w); let y = Math.min(Math.max(v[1], by - my), by + bh + my - h);
      if (w >= bw) x = bx + (bw - w) / 2; if (h >= bh) y = by + (bh - h) / 2; return [x, y, w, h]; };

    svg.addEventListener('wheel', (e) => {
      e.preventDefault(); ensure();
      const k = Math.exp(Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) * 0.0018);
      const z = Math.min(Math.max(base[2] / (vb[2] * k), 1), 8); const w = base[2] / z, h = base[3] / z;
      const [px, py] = toSvg(e.clientX, e.clientY); const fx = (px - vb[0]) / vb[2], fy = (py - vb[1]) / vb[3];
      setVB(clampVB([px - fx * w, py - fy * h, w, h])); resetBtn.hidden = z <= 1.001;
    }, { passive: false });

    const ptrs = new Map(); let pinch = null;
    const zoomTo = (z, cx, cy, from) => { const w = base[2] / z, h = base[3] / z; vb = from.slice(); const [px, py] = toSvg(cx, cy);
      const fx = (px - from[0]) / from[2], fy = (py - from[1]) / from[3]; setVB(clampVB([px - fx * w, py - fy * h, w, h])); resetBtn.hidden = z <= 1.001; };

    svg.addEventListener('sl-fit', () => { if (base) { setVB(base.slice()); resetBtn.hidden = true; } });
    svg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return; ensure(); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: base[2] / vb[2], v: vb.slice() }; drag = null; dragged = true; return; }
      if (ptrs.size === 1) { drag = { x: e.clientX, y: e.clientY, v: vb.slice(), id: e.pointerId }; dragged = false; }
    });
    window.addEventListener('pointermove', (e) => {
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        const z = Math.min(Math.max(pinch.z * d / pinch.d, 1), 8); zoomTo(z, (a.x + b.x) / 2, (a.y + b.y) / 2, pinch.v); pinch.v = vb.slice(); pinch.z = z; pinch.d = d; return; }
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!dragged && Math.hypot(dx, dy) < 5) return;
      if (!dragged) { dragged = true; svg.classList.add('sl-dragging'); try { svg.setPointerCapture(drag.id); } catch (_) {} }
      const r = svg.getBoundingClientRect(); const sc = Math.max(drag.v[2] / r.width, drag.v[3] / r.height);
      setVB(clampVB([drag.v[0] - dx * sc, drag.v[1] - dy * sc, drag.v[2], drag.v[3]])); tip.style.opacity = 0;
    });
    const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (ptrs.size === 0 && drag) { drag = null; svg.classList.remove('sl-dragging'); } };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);

    const resetBtn = document.createElement('button'); resetBtn.type = 'button'; resetBtn.className = 'sl-map-reset'; resetBtn.textContent = '全体表示'; resetBtn.title = '地図の拡大・移動をリセット'; resetBtn.hidden = true;
    resetBtn.addEventListener('click', (e) => { e.stopPropagation(); if (base) setVB(base.slice()); resetBtn.hidden = true; });
    el.appendChild(resetBtn);

    svg.addEventListener('click', (e) => {
      if (dragged) { dragged = false; e.stopPropagation(); return; }
      const p = e.target.closest('.sl-prov'); if (!p) return;
      const pid = p.dataset.p;
      const o = owners()[pid]; const info = $('.sl-map-info');

      if (IS_PHONE) {
        updateMapTouchInfo(pid);
      }

      if (!o) {
        if (info) { info.classList.remove('sl-sel-badge'); info.textContent = `${provName(pid)}: 支配勢力なし`; }
        return;
      }
      const ci = clanInfo(o);
      if (!ci.playable) {
        if (info) { info.classList.remove('sl-sel-badge'); info.textContent = `${provName(pid)}: ${ci.name}（このシナリオでは選択できません）`; }
        return;
      }
      selectClan(o, { scroll: true });
    });
  }

  let rq = 0;
  function queueRefresh() { cancelAnimationFrame(rq); rq = requestAnimationFrame(refresh); }
  function refresh() {
    if (!svg) return;
    const own = owners();
    for (const [pid, p] of Object.entries(paths)) {
      const o = own[pid];
      const fillCol = o ? lighten(clanInfo(o).color) : '#3a3631';
      p.style.fill = fillCol;
      p.style.stroke = 'none';
      p.dataset.owner = o || '';
    }
    updateSlBorders(selected);
    stripEraYears(); addTroops(own);
    const cards = document.querySelectorAll('#daimyoGrid .daimyo-card');
    const s = $('.sl-count-daimyo'); if (s) s.textContent = `${cards.length}家`;
    const ns = document.querySelectorAll('.scenario-btn').length; const sc = $('.sl-count-scen'); if (sc) sc.textContent = `${ns}`;
    $('.scenario-btn.selected')?.scrollIntoView({ block: 'nearest' });
    const sel = $('#daimyoGrid .daimyo-card.selected');
    selectClan(sel ? sel.dataset.id : (scen()?.recommendedClan || (playables()[0]?.id) || null), { scroll: true, silent: true });

    if (IS_PHONE) {
      decorateDaimyoCards();
      filterDaimyos();
      updateScenarioPreview();
      updateDiffDesc();
      syncEraTabsVisibility();
      setupDaimyoPopupMobile();
    }
  }

  function updateSlBorders(selClanId) {
    const own = owners();
    if (slBorderEls && slBorderEls.length > 0) {
      slBorderEls.forEach(({ el, p1, p2 }) => {
        const o1 = own[p1], o2 = own[p2];
        if (o1 && o2 && o1 === o2) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
          if (selClanId) {
            const isSelBorder = (o1 === selClanId || o2 === selClanId);
            if (isSelBorder) {
              el.style.stroke = '#ffd700';
              el.style.strokeWidth = '1.8px';
              el.style.opacity = '1';
              el.style.filter = 'none';
              if (el.parentNode) el.parentNode.appendChild(el);
            } else {
              el.style.stroke = 'rgba(70, 62, 52, 0.45)';
              el.style.strokeWidth = '0.5px';
              el.style.opacity = '0.5';
              el.style.filter = 'none';
            }
          } else {
            el.style.stroke = 'rgba(20, 14, 8, 0.72)';
            el.style.strokeWidth = '0.75px';
            el.style.opacity = '1';
            el.style.filter = 'none';
          }
        }
      });
    }
    if (typeof slCoastEls !== 'undefined' && slCoastEls && slCoastEls.length > 0) {
      slCoastEls.forEach(({ el, p }) => {
        const o = own[p];
        if (selClanId) {
          if (o === selClanId) {
            // 選択大名の海岸線：ゴールドでクッキリハイライト（ぼやけ・影なし）
            el.style.stroke = '#ffd700';
            el.style.strokeWidth = '1.8px';
            el.style.opacity = '1';
            el.style.filter = 'none';
            if (el.parentNode) el.parentNode.appendChild(el);
          } else {
            el.style.stroke = 'rgba(70, 62, 52, 0.45)';
            el.style.strokeWidth = '0.55px';
            el.style.opacity = '0.5';
            el.style.filter = 'none';
          }
        } else {
          el.style.stroke = 'rgba(20, 14, 8, 0.78)';
          el.style.strokeWidth = '0.85px';
          el.style.opacity = '1';
          el.style.filter = 'none';
        }
      });
    }
  }

  function selectClan(id, { scroll = false, silent = false } = {}) {
    selected = id;
    const g = game();
    if (g) {
      if (id) {
        g.playerClanId = id;
        const pl = playables().find(x => x && x.id === id);
        if (pl) {
          g.playerDaimyo = JSON.parse(JSON.stringify(pl));
          if (typeof g._playableFunds === 'function') {
            g.gold = g._playableFunds(pl, 'gold');
            g.rice = g._playableFunds(pl, 'rice');
          }
        }
      } else {
        g.playerClanId = null;
        g.playerDaimyo = null;
      }
    }
    updateSlBorders(id);
    document.querySelectorAll('#daimyoGrid .daimyo-card').forEach(c => c.classList.toggle('selected', c.dataset.id === id));
    const card = id && [...document.querySelectorAll('#daimyoGrid .daimyo-card')].find(c => c.dataset.id === id);
    if (card && (scroll || IS_PHONE)) scrollCardToCenter(card, true);
    svg?.classList.toggle('has-sel', !!id);
    let n = 0;
    for (const p of Object.values(paths)) { const on = !!id && p.dataset.owner === id; p.classList.toggle('sel', on); if (on) { n++; p.parentNode.appendChild(p); } }
    const info = $('.sl-map-info');
    if (info && id) {
      const ci = clanInfo(id); const kid = document.getElementById('kamon-' + id) ? 'kamon-' + id : '';
      info.classList.add('sl-sel-badge'); info.style.setProperty('--sl-clan', ci.color);
      info.innerHTML = `${kid ? `<svg class="sl-sel-kamon" viewBox="0 0 32 32" aria-hidden="true"><use href="#${kid}"></use></svg>` : `<i class="sl-dot sl-sel-dot" style="background:${ci.color}"></i>`}<span class="sl-sel-lbl">選択中</span><b class="sl-sel-name">${esc(ci.leader || ci.name)}</b>${ci.leader ? `<span class="sl-sel-clan">${esc(ci.name)}</span>` : ''}${IS_PHONE ? `<span class="sl-sel-n" title="支配 ${n} 国"><i class="sl-ic" aria-hidden="true">🏯</i>${n}</span>` : `<span class="sl-sel-n">支配 ${n} 国</span>`}${troopsOf(card) != null ? (IS_PHONE ? `<span class="sl-sel-t" title="兵力 ${troopsOf(card)}"><i class="sl-ic" aria-hidden="true">⚔️</i>${troopsOf(card)}</span>` : `<span class="sl-sel-t">兵 ${troopsOf(card)}</span>`) : ''}`;
    } else if (info) {
      info.classList.remove('sl-sel-badge');
    }

    const lore = $('.sl-map-lore, .sl-desc-lore-box');
    if (lore) {
      const m = id && clanMaster(id);
      if (m?.desc || m?.tactic) {
        lore.hidden = false; lore.removeAttribute('title');
        const tac = m.tactic ? `<div class="sl-tac" title="${esc(m.tactic + (m.tacticDesc ? '：' + m.tacticDesc : ''))}"><b>⚔ ${esc(m.tactic)}</b>${m.tacticDesc ? ' — ' + esc(m.tacticDesc) : ''}</div>` : '';
        lore.innerHTML = tac + (m.desc ? `<div class="sl-lore-txt" title="${esc(m.desc)}"><b>家伝</b>${esc(m.desc)}</div>` : '');
      } else {
        lore.hidden = true; lore.textContent = '';
      }
    }

    if (IS_PHONE) {
      updatePhoneBar(id, n);
    }
    const badge = $('#selectedDaimyoBadge');
    if (badge) {
      if (id && card) {
        badge.textContent = `選択中: ${clanInfo(id).leader}（${clanInfo(id).name}・${n}国）`;
      } else {
        badge.textContent = '選択中: なし（大名家を選択してください）';
      }
    }
    if (!silent) { try { game()?.audio?.playHyoshigi?.(); } catch (_) {} }
  }

  if (IS_PHONE) {
    const ic = () => document.querySelectorAll('.start-header-actions button, .start-header-actions a').forEach(b => {
      const t = b.querySelector('.opening-btn-text');
      if (t && !b.getAttribute('aria-label')) b.setAttribute('aria-label', t.textContent.trim());
      if (t && !b.title) b.title = t.textContent.trim();
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ic); else ic();
  }

  const reveal = () => document.documentElement.classList.add('sl-ready');
  function tryBuild(n = 0) {
    if (built) { reveal(); return; }
    let ok = false;
    try { ok = build(); }
    catch (err) { console.error('[StartScreenLayout] build failed:', err); reveal(); return; }
    if (ok) {
      reveal();
    } else if (n < 600) {
      setTimeout(() => tryBuild(n + 1), n < 100 ? 50 : 100);
    } else {
      // 構築できない場合は旧レイアウトを表示（画面が不可視のままになるのを防止）
      document.documentElement.classList.remove('sl-desktop');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => tryBuild()); else tryBuild();
  window.addEventListener('load', () => tryBuild());

  // 500ms毎のgetComputedStyleポーリングを廃止し、モーダルのclass/style変化時のみ判定（スマホの負荷軽減）
  const syncOpen = () => {
    const m = $('#startModal'); if (!m) return;
    const open = !m.classList.contains('hidden') && m.style.display !== 'none' && getComputedStyle(m).display !== 'none';
    document.body.classList.toggle('sl-start-open', open);
    document.documentElement.classList.toggle('sl-start-open', open);
  };
  const watchOpen = () => {
    const m = $('#startModal'); if (!m) { setTimeout(watchOpen, 200); return; }
    syncOpen();
    new MutationObserver(syncOpen).observe(m, { attributes: true, attributeFilter: ['class', 'style'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchOpen); else watchOpen();
  window.SengokuStartLayout = { selectClan, refresh: queueRefresh, get selected() { return selected; }, setStep: (n) => setStep(n) };
})();
