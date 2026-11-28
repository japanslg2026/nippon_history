/**
 * @file js/core/state/UiSync.js - GameState から機能別に分割したメソッド群（5個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { gameRandom, seasonVisualIdx } from '../GameStateShared.js?v=20261128_v74';

export const UiSyncMethods = {



  // ============================================================================

  // 単一方向データフロー: 状態を変えたら必ず updateUI() で HUD・地図・選択国パネルを再描画

  // updateStatusHeader / updateMapDisplay は低レベルの描画関数（直接呼ばず updateUI を使う）

  // ============================================================================,



  // 反覇道包囲網の見出しバッジ／スマホ用バナーを coalitionFormed に合わせる（ロード・状態復元時も。2026-10-25 d54）
  syncCoalitionUI() {
    const on = !!this.coalitionFormed;
    const bn = document.getElementById('coalitionBanner'); if (bn) bn.style.display = on ? 'block' : 'none';
    const hb = document.getElementById('coalitionHeaderBadge'); if (hb) hb.style.display = on ? 'inline-flex' : 'none';
  },



  updateUI(opts = {}) {

    this.syncCoalitionUI();


    if (this._inUpdateUI) return; // selectProvince 経由の再入を防止

    this._inUpdateUI = true;

    try {

      this.updateStatusHeader();
      try { window.SengokuSoundSync?.syncAllUI?.(); } catch (_) {}

      const provId = opts.provId !== undefined ? opts.provId : this.selectedProvId;

      const refreshPanel = opts.panel !== false;

      const prov = provId ? (this.provinces || []).find(x => x.id === provId) : null;

      if (refreshPanel && prov && document.getElementById('provDetailBox')) {

        this.selectProvince(provId, { refresh: true }); // 内部で updateMapDisplay も実行（ドロワーは開き直さない）

      } else {

        this.updateMapDisplay();

      }

      this.updateMapHeatLegend();

    } finally {

      this._inUpdateUI = false;

    }

  },



  initSeasonParticles() {

    if (!this.seasonCanvas) return;

    const w = this.seasonCanvas.width || 800;

    const h = this.seasonCanvas.height || 600;

    this.seasonParticles = [];



    const s = seasonVisualIdx(this.seasonIdx); // 描画用 0:春, 1:夏（初夏・盛夏）, 2:秋, 3:冬

    const isBlizzard = this.currentWeather === '大雪' || this.currentWeather === '吹雪';

    const count = (s === 3 && isBlizzard) ? 60 : 35;



    for (let i = 0; i < count; i++) {

      this.seasonParticles.push({

        x: Math.random() * w,

        y: Math.random() * h,

        size: Math.random() * 5 + 3,

        speedY: Math.random() * 1.5 + 0.8,

        speedX: (Math.random() - 0.5) * 1.2,

        angle: Math.random() * Math.PI * 2,

        rotSpeed: (Math.random() - 0.5) * 0.04,

        opacity: Math.random() * 0.5 + 0.35,

        flip: gameRandom() * Math.PI,

        flipSpeed: gameRandom() * 0.03 + 0.01

      });

    }

  },



  updateSeasonVisuals() {

    this.initSeasonParticles();

  },



  showSeasonNoticeBanner(year, seasonName, weather) {

    const banner = document.getElementById('seasonNoticeBanner');

    if (!banner) return;

    const icons = ['🌸', '🌿', '☀️', '🍁', '❄️'];

    const seasonIcon = icons[this.seasonIdx] || '📜';

    banner.innerHTML = `

      <div style="font-size: 12pt; color:var(--gold); letter-spacing:3px; margin-bottom:4px;">❖ 季節の移ろい ❖</div>

      <div style="display:flex; align-items:center; justify-content:center; gap:10px;">

        <span style="font-size:24pt;">${seasonIcon}</span>

        <span>${this.formatYear(year)}年 ${seasonName}</span>

        <span style="font-size:13pt; color:#ffdd88; font-weight:normal; margin-left:6px;">【${weather}】</span>

      </div>

    `;

    banner.classList.add('show');

    const bannerDuration = this.isAutoPlay ? Math.min(1800, Math.round(this.autoPlaySpeed * 800)) : 1800;

    setTimeout(() => {

      banner.classList.remove('show');

    }, bannerDuration);

  },
};
