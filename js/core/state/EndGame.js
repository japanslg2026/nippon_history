/**
 * @file js/core/state/EndGame.js - GameState から機能別に分割したメソッド群（13個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { DAIMYO_EPILOGUES, SCENARIOS, formatYearWithEra, toKanjiNumber } from '../GameStateShared.js?v=20261128_v74';

export const EndGameMethods = {



  // ============================================================================

  // 天下統一偉業 ＆ 征夷大将軍宣下 ＆ 御家滅亡

  // ============================================================================,



  checkEndGameConditions() {

    if (this.isSpectatorMode) {

      // 観戦モード時：いずれかの勢力が全領国完全統一した場合

      const activeOwners = [...new Set((this.provinces || []).map(p => p.ownerId).filter(id => id && id !== 'null' && id !== 'court' && id !== 'independent'))];

      if (activeOwners.length === 1 && this.provinces && this.provinces.length > 0) {

        const victorClan = activeOwners[0];

        const victorProvs = this.provinces.filter(p => p.ownerId === victorClan);

        if (victorProvs.length >= this.provinces.length) {

          this.playerClanId = victorClan;

          this.playerDaimyo = this.findDaimyoProfile(victorClan);

          this.triggerVictory(false);

          return true;

        }

      }

      return false;

    }



    const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    

    // 全領国完全統一（全72州制覇）

    if (myProvs.length >= this.provinces.length && this.provinces.length > 0) {

      this.triggerVictory(false);

      return true;

    }



    // 山城(yamashiro/kyoto)領有 かつ 70州以上領有で征夷大将軍宣下

    // 征夷大将軍は道中の節目。天下統一ではないので false を返し、季節の処理とオート進行を止めない（2026-10-11 cc）

    if (!this.shogunAppointed && this.meetsShogunCondition()) {

      this.triggerShogunAppointment();

    }



    return false;

  },



  /** 現在のシナリオの開始年（西暦）を取得 */

  getScenarioYear() {

    if (this.currentScenario && typeof this.currentScenario.year === 'number') {

      return this.currentScenario.year;

    }

    const scen = (typeof SCENARIOS !== 'undefined' ? SCENARIOS : []).find(s => String(s.id) === String(this.currentScenarioId));

    if (scen && typeof scen.year === 'number') {

      return scen.year;

    }

    const scenNum = Number(this.currentScenarioId);

    if (!isNaN(scenNum)) {

      return scenNum;

    }

    return typeof this.year === 'number' ? this.year : 1560;

  },



  /**

   * 現在のシナリオで征夷大将軍就任エンディングが許可されているか判定

   * 801年以前のシナリオ (year <= 801) と 明治時代のシナリオ (year >= 1868) では

   * 征夷大将軍就任によるエンディングはなく、完全統一のみとする

   */

  isShogunEndingAllowed() {

    const scenYear = this.getScenarioYear();

    if (scenYear <= 801 || scenYear >= 1868) {

      return false;

    }

    return true;

  },



  /** 征夷大将軍の条件：山城（京）を領有し、国数が閾値以上（801年以前・明治は対象外） */

  meetsShogunCondition() {

    if (!this.isShogunEndingAllowed()) return false;

    const myProvs = (this.provinces || []).filter(p => p.ownerId === this.playerClanId);

    const hasKyoto = myProvs.some(p => p.id === 'yamashiro' || p.id === 'kyoto');

    const threshold = Math.min(70, (this.provinces || []).length); // 山城制圧＋70州以上（205州中）で征夷大将軍

    return hasKyoto && myProvs.length >= threshold;

  },



  triggerShogunAppointment() {

    if (!this.isShogunEndingAllowed()) return;

    this.shogunAppointed = true; // 確実にフラグを立てて毎ターンブロックを防止

    if (this.isAutoPlay) this.pauseAutoPlayForEvent?.(); // 宣下はイベントと同じく一時停止（2026-10-11 cc）



    // 領国・勢力マップを確実に最新状態に更新

    this.updateUI();



    const totalCount = (this.provinces && this.provinces.length > 0) ? this.provinces.length : ((window.PROVINCES_DATA && window.PROVINCES_DATA.length) || 77);

    const halfCount = Math.min(70, totalCount); // 征夷大将軍の州数条件（meetsShogunCondition と同じ）

    const kanjiTotal = (typeof toKanjiNumber === 'function') ? toKanjiNumber(totalCount) : `${totalCount}`;

    const kanjiHalf = (typeof toKanjiNumber === 'function') ? toKanjiNumber(halfCount) : `${halfCount}`;



    const modal = document.getElementById('shogunModal');



    if (!modal) {

      // 万一モーダルDOMが見つからない場合のフォールバック

      this.shogunAppointed = true;

      this.log(`👑【征夷大将軍宣下】朝廷より正二位・征夷大将軍の宣下を受けました！日本全${kanjiTotal}州（全${totalCount}州）完全統一の覇道を邁進します！`, 'important');

      if (window.Swal) {

        Swal.fire({

          icon: 'success',

          title: '👑 征夷大将軍 宣下！',

          text: `朝廷より正二位・征夷大将軍に補任されました！日本全${kanjiTotal}州（全${totalCount}州）完全統一へ向け全軍を指揮しましょう！`,

          background: '#241710',

          color: '#ffd700'

        });

      }

      return;

    }



    const daimyoTitle = `${this.playerDaimyo?.clan || ''} 当主 ${this.playerDaimyo?.name || ''} 公`;

    const nameEl = document.getElementById('shogunDaimyoName');

    if (nameEl) nameEl.textContent = daimyoTitle;



    // シナリオの総領国数と完全連動したテキスト反映（漢数字＋実国数を併記）

    const threshEl = document.getElementById('shogunThresholdDesc');

    if (threshEl) {

      threshEl.textContent = `京洛・山城国を掌握し、全${totalCount}州中${kanjiHalf}州（${halfCount}州）以上を制覇せし武門の棟梁`;

    }

    const textEl = document.getElementById('shogunModalText');

    if (textEl) {

      textEl.innerHTML = `朝廷より勅使が下向し、天下の静謐を成し遂げし貴家に対し、正二位・征夷大将軍の官位宣下が下されました！<br>ここに武門の頂点たる新幕府を開き、万民安穏の泰平の世を築くか、あるいは残る諸勢力をことごとく平定し、日本全${kanjiTotal}州（全${totalCount}州）完全統一の覇道を邁進するか、御下問にございます。`;

    }



    try {

      this.audio.playGrandFanfare?.({ noHoragai: true });

      this.music.playTrack('shogun', false, { stinger: true, noFirstHit: true });

    } catch(e) {}



    modal.classList.remove('hidden');

  },



  closeEndingRoll() {

    const rollModal = document.getElementById('endingRollModal');

    if (rollModal) rollModal.classList.add('hidden');



    if (this._rollAnimId) cancelAnimationFrame(this._rollAnimId);

    if (this._sakuraAnimId) cancelAnimationFrame(this._sakuraAnimId);



    // victoryModal（詳細結果モーダル）を表示

    const modal = document.getElementById('victoryModal');

    if (modal) {

      modal.classList.remove('hidden');

      modal.scrollTop = 0;

      // [81位] 領土拡大推移グラフを描画

      setTimeout(() => this.renderVictoryChart?.(), 100);

    }

  },



  triggerVictory(isShogunRoute = false) {

    if (!this.isShogunEndingAllowed()) {

      isShogunRoute = false;

    }

    this._isShogunRoute = isShogunRoute;



    const modal = document.getElementById('victoryModal');

    if (!modal) return;



    const subTitleEl = document.getElementById('victorySubTitle');

    const mainTitleEl = document.getElementById('victoryMainTitle');

    const daimyoNameEl = document.getElementById('victoryDaimyoName');

    const statsEl = document.getElementById('victoryStatsSummary');

    const chronicleEl = document.getElementById('victoryChronicleText');



    const uniHead = this.syncPlayerHeadAtUnification();

    const clanName = uniHead.clanName;

    const daimyoName = uniHead.daimyoName;

    const myProvs = this.provinces.filter(p => p.ownerId === this.playerClanId);

    const scenYear = this.getScenarioYear();

    const isShogun = isShogunRoute && this.isShogunEndingAllowed();



    const totalCount = this.provinces?.length || (window.PROVINCES_DATA ? window.PROVINCES_DATA.length : 77);

    const kanjiTotal = (typeof toKanjiNumber === 'function') ? toKanjiNumber(totalCount) : `${totalCount}`;



    if (isShogun) {

      if (subTitleEl) subTitleEl.textContent = '【朝廷勅命・天下静謐の武門棟梁】';

      if (mainTitleEl) mainTitleEl.textContent = '❖ 征夷大将軍就任・天下泰平の幕府開府 ❖';

    } else {

      if (subTitleEl) subTitleEl.textContent = `【前人未到・日本全${kanjiTotal}州（全${totalCount}州）完全統一】`;

      if (mainTitleEl) mainTitleEl.textContent = '❖ 天下布武・不滅の大覇業達成 ❖';

    }



    if (daimyoNameEl) {

      daimyoNameEl.textContent = isShogun

        ? `${clanName} 征夷大将軍 ${daimyoName}`

        : `${clanName} 当主 ${daimyoName}`;

    }

    if (statsEl) {

      statsEl.textContent = `${formatYearWithEra(this.year)}年 ${this.seasonNames[this.seasonIdx]} 達成 ｜ 支配領国: ${myProvs.length}州 ｜ 激闘戦歴: ${this.stats.battlesWon}勝 (${this.stats.battlesFought}戦)`;

    }



    const defaultRegime = isShogun

      ? `${clanName}幕府・天下泰平の新体制`

      : (scenYear >= 1868 ? `${clanName}新政府・近代国家の新体制` : `${clanName}政権・天下泰平の新体制`);



    const ep = (!uniHead.headChanged && DAIMYO_EPILOGUES[this.playerClanId]) || {

      regime: defaultRegime,

      capital: `${daimyoName}公の居城（京洛ならびに天下の要衝）`,

      pillar1: scenYear <= 801

        ? '大いなる和の規範を敷き、私闘を禁じ民百姓が安心して暮らせる法と秩序を整えた。'

        : (scenYear >= 1868 ? '四民平等の原則を貫き、国民の権利を守り法の下の公正な統治を確立した。' : '万民の生業を安堵し、武力による横暴を厳禁とする徳政令と武家諸法度を敷いた。'),

      pillar2: scenYear >= 1868

        ? '近代産業の振興と交通網の整備を全国で推進し、国力富強の礎を築いた。'

        : '新田開拓と街道・河川の整備を全国で推進し、飢饉なき豊かな国づくりを成し遂げた。',

      pillar3: '諸勢力との和睦と公正な統治を確立し、百余年にわたる争乱の世を永遠に終焉させた。',

      future10: '【統一後十年：礎の時代】天下普請と新法度の敷設。荒廃した山河が蘇り、民百姓の安穏な耕作が戻った。',

      future50: '【統一後五十年：文化と産業の開花】二代・三代へと政権が継承され、街道と港湾が結ばれ空前の好景気を迎えた。',

      future100: '【統一後百年〜近代へ：悠久の泰平】百年の平和が人々の心を潤し、夜も戸を鎖さぬ世界無比の平和国家が完成した。',

      historianQuote: '『乱世の塗炭の苦しみから人々を救い出し、永遠の泰平を築いたその英名は、未来永劫語り継がれるであろう』'

    };



    const routeStory = isShogun

      ? `<p style="margin-bottom:12px; color:#ffd700; font-size:12.5pt; font-weight:bold;">

          「山城に入洛し都の戦乱を鎮定、天下七十有余州を統べる武威と仁徳を讃え、朝廷より征夷大将軍の重職を拝命す――」

        </p>

        <p style="margin-bottom:12px; text-indent:1.5em;">

          公儀の威信はここに甦り、荒廃していた都大路には満開の桜とともに歓喜の民の声が響き渡りました。諸国の武将たちは争いの太刀を収め、新たな武門の棟梁の前に恭しくひれ伏しました。武力による威嚇のみに頼らず、法と信義、そして民への慈悲を以て治める新たな武家政権がここに誕生したのです。

        </p>`

      : `<p style="margin-bottom:10px; color:#ffd700; font-size:12.5pt; font-weight:bold;">

          「北は蝦夷松前より南は薩摩大隅まで、日の本全土を完全に統一せり――」

        </p>

        <p style="margin-bottom:10px; text-indent:1.5em;">

          日本全土の完全平定。幾多の激闘を戦い抜き、倒れていった忠勇の将兵たちの想いを胸に、貴家はついに日の本すべての頂点へと登りつめました。もはやこの国土に刀を向け合う敵はなく、八百万の民が夜を徹して平和を喜び合いました。

        </p>`;



    const regimeTitleLabel = isShogun ? '幕府' : (scenYear >= 1868 ? '新政府' : '政権');

    const warriorLabel = scenYear <= 801 ? '将兵たち' : (scenYear >= 1868 ? '志士と将兵たち' : '武士');



    if (chronicleEl) {

      chronicleEl.innerHTML = `

        <div style="border-bottom: 1px solid rgba(255,215,0,0.35); padding-bottom: 8px; margin-bottom: 12px;">

          ${routeStory}

        </div>



        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">

          <!-- 左カラム：施政大綱・公儀の礎 -->

          <div style="background: rgba(212,175,55,0.08); border: 1px solid #8c734b; border-radius: 6px; padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between;">

            <div>

              <h3 style="color:var(--gold-bright); font-size:12.5pt; margin-bottom:6px; display:flex; align-items:center; gap:6px;">

                <span>📜</span> <span>施政大綱：${ep.regime}</span>

              </h3>

              <p style="margin-bottom:6px; font-size: 11.5pt; color:#e0d0b0;"><strong>【政庁本拠】：</strong>${ep.capital}</p>

              <ul style="padding-left:18px; line-height:1.8; font-size: 11.5pt; color:#f7f1e3; margin: 0;">

                <li style="margin-bottom: 4px;"><strong>【法治・道義】：</strong>${ep.pillar1}</li>

                <li style="margin-bottom: 4px;"><strong>【産業・民生】：</strong>${ep.pillar2}</li>

                <li style="margin-bottom: 4px;"><strong>【秩序・泰平】：</strong>${ep.pillar3}</li>

              </ul>

            </div>

          </div>



          <!-- 右カラム：百年の変遷と歴史家の総評 -->

          <div style="background: rgba(0,0,0,0.45); border: 1px solid #775533; border-radius: 6px; padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between;">

            <div>

              <h3 style="color:#ffd700; font-size:12pt; margin-bottom:6px;">

                ❖ この${regimeTitleLabel}が紡いだ「その後の日本」（百年の変遷）

              </h3>

              <div style="font-size: 11pt; color:#ddd; margin-bottom:6px; line-height: 1.6;">${ep.future10}</div>

              <div style="font-size: 11pt; color:#ddd; margin-bottom:6px; line-height: 1.6;">${ep.future50}</div>

              <div style="font-size: 11pt; color:#ddd; margin-bottom:6px; line-height: 1.6;">${ep.future100}</div>

            </div>

            <div style="font-size: 11pt; color:#ffd700; font-style:italic; margin-top:6px; border-top:1px dashed #664422; padding-top:6px;">

              ${ep.historianQuote}

            </div>

          </div>

        </div>



        <div style="border-top: 1px dashed #665533; padding-top: 8px; font-style: italic; color: #ffd700; font-size: 11.5pt; text-align: center; line-height: 1.8;">

          「${warriorLabel}が捧げし至誠は豊かなる国土を育み、民が流した汗は永遠の泰平の礎となった。<br>

          乱世の闇を切り裂き、輝かしき黎明をもたらした貴家の徳政と英名は、歴史の彼方まで語り継がれるであろう――」

        </div>

      `;

    }



    // 特別な体験として、まずは感動の全画面シアター・エンドロールから幕を開ける！

    this.startEndingRoll(isShogunRoute);

  },



  // ============================================================================

  // [81位] 天下統一クリア画面：戦績グラフ・クリア証書画像保存・𝕏ポスト

  // ============================================================================



  renderVictoryChart() {

    const canvas = document.getElementById('victoryTerritoryChart');

    if (!canvas) return;



    const myProvs = (this.provinces || []).filter(p => p.ownerId === this.playerClanId);

    const history = (this.territoryHistory && this.territoryHistory.length > 0)

      ? this.territoryHistory

      : [{ label: '開始', count: 1 }, { label: `${this.formatYear()}年`, count: myProvs.length }];



    const labels = history.map(h => h.label);

    const data = history.map(h => h.count);



    const metaEl = document.getElementById('victoryChartMeta');

    if (metaEl) {

      const startCount = data[0] || 1;

      const finalCount = data[data.length - 1] || myProvs.length;

      metaEl.textContent = `初期 ${startCount}州 ➔ 統一 ${finalCount}州（全${data.length}季の激闘記録）`;

    }



    if (this._victoryChartInstance) {

      try { this._victoryChartInstance.destroy(); } catch (e) {}

      this._victoryChartInstance = null;

    }



    if (window.Chart) {

      try {

        const ctx = canvas.getContext('2d');

        this._victoryChartInstance = new window.Chart(ctx, {

          type: 'line',

          data: {

            labels: labels,

            datasets: [{

              label: '支配領国数 (州)',

              data: data,

              borderColor: '#ffd700',

              backgroundColor: 'rgba(212, 175, 55, 0.22)',

              borderWidth: 2.5,

              pointBackgroundColor: '#ffd700',

              pointBorderColor: '#ffffff',

              pointRadius: data.length > 30 ? 2 : 4,

              fill: true,

              tension: 0.25

            }]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {

                labels: { color: '#ffd700', font: { size: 12 } }

              },

              tooltip: {

                callbacks: {

                  label: (ctx) => ` 支配領国: ${ctx.parsed.y} 州`

                }

              }

            },

            scales: {

              x: {

                ticks: { color: '#aaa', maxTicksLimit: 12 },

                grid: { color: 'rgba(255,255,255,0.06)' }

              },

              y: {

                min: 0,

                max: Math.max(70, Math.max(...data) + 2),

                ticks: { color: '#ffd700', stepSize: 10 },

                grid: { color: 'rgba(255,215,0,0.12)' }

              }

            }

          }

        });

        return;

      } catch (e) {

        console.warn('Chart.js render failed, falling back to 2D canvas', e);

      }

    }



    // 2D Canvas フォールバック描画

    try {

      const ctx = canvas.getContext('2d');

      const w = canvas.width = canvas.parentElement?.clientWidth || 700;

      const h = canvas.height = 140;

      ctx.clearRect(0, 0, w, h);



      ctx.fillStyle = 'rgba(10, 8, 5, 0.7)';

      ctx.fillRect(0, 0, w, h);



      const padLeft = 40, padRight = 20, padTop = 15, padBottom = 25;

      const plotW = w - padLeft - padRight;

      const plotH = h - padTop - padBottom;

      const maxVal = Math.max(70, Math.max(...data) + 2);



      ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';

      ctx.lineWidth = 1;

      for (let yVal = 0; yVal <= maxVal; yVal += 20) {

        const y = padTop + plotH - (yVal / maxVal) * plotH;

        ctx.beginPath();

        ctx.moveTo(padLeft, y);

        ctx.lineTo(w - padRight, y);

        ctx.stroke();

        ctx.fillStyle = '#888';

        ctx.font = '10px sans-serif';

        ctx.fillText(`${yVal}`, 10, y + 3);

      }



      const points = data.map((val, idx) => {

        const x = padLeft + (idx / Math.max(1, data.length - 1)) * plotW;

        const y = padTop + plotH - (val / maxVal) * plotH;

        return { x, y };

      });



      if (points.length > 0) {

        ctx.beginPath();

        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);

        ctx.strokeStyle = '#ffd700';

        ctx.lineWidth = 2.5;

        ctx.stroke();



        ctx.lineTo(points[points.length - 1].x, padTop + plotH);

        ctx.lineTo(points[0].x, padTop + plotH);

        ctx.closePath();

        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';

        ctx.fill();



        ctx.fillStyle = '#ffd700';

        points.forEach(pt => {

          ctx.beginPath();

          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);

          ctx.fill();

        });

      }

    } catch(e) {}

  },



  downloadVictoryCertificate(opts = {}) {

    const canvas = document.getElementById('victoryCertCanvas');

    if (!canvas) return null;



    const w = canvas.width = 960;

    const h = canvas.height = 640;

    const ctx = canvas.getContext('2d');



    // 和紙調の背景グラデーション

    const grad = ctx.createLinearGradient(0, 0, w, h);

    grad.addColorStop(0, '#fefbf1');

    grad.addColorStop(0.5, '#f7f1dd');

    grad.addColorStop(1, '#eee2c2');

    ctx.fillStyle = grad;

    ctx.fillRect(0, 0, w, h);



    // 金砂子（きんすなご）風の細かな散らし点

    ctx.fillStyle = 'rgba(197, 160, 89, 0.25)';

    for (let i = 0; i < 240; i++) {

      const rx = (Math.sin(i * 997) * 0.5 + 0.5) * w;

      const ry = (Math.cos(i * 613) * 0.5 + 0.5) * h;

      const rSize = (i % 3) + 1;

      ctx.fillRect(rx, ry, rSize, rSize);

    }



    // 豪華な二重金枠

    ctx.strokeStyle = '#9b7b32';

    ctx.lineWidth = 6;

    ctx.strokeRect(24, 24, w - 48, h - 48);



    ctx.strokeStyle = '#c5a059';

    ctx.lineWidth = 2;

    ctx.strokeRect(34, 34, w - 68, h - 68);



    // 四隅の和風飾り菱

    const drawCornerDiamond = (cx, cy) => {

      ctx.fillStyle = '#9b7b32';

      ctx.beginPath();

      ctx.moveTo(cx, cy - 8);

      ctx.lineTo(cx + 8, cy);

      ctx.lineTo(cx, cy + 8);

      ctx.lineTo(cx - 8, cy);

      ctx.closePath();

      ctx.fill();

    };

    drawCornerDiamond(34, 34);

    drawCornerDiamond(w - 34, 34);

    drawCornerDiamond(34, h - 34);

    drawCornerDiamond(w - 34, h - 34);



    // 表題（毛筆墨字）

    ctx.fillStyle = '#1a110a';

    ctx.textAlign = 'center';

    ctx.font = 'bold 36px "Yu Mincho", "Hiragino Mincho ProN", serif';

    const isShogun = !!this._isShogunRoute;

    const certTitle = isShogun ? '❖ 征 夷 大 将 軍 宣 下 証 ❖' : '❖ 天 下 統 一 顕 彰 之 証 ❖';

    ctx.fillText(certTitle, w / 2, 90);



    // 金箔調のアンダーライン

    ctx.strokeStyle = '#9b7b32';

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(w / 2 - 220, 105);

    ctx.lineTo(w / 2 + 220, 105);

    ctx.stroke();



    // 宛名

    const clanName = this.playerDaimyo?.clan || '御家';

    const daimyoName = this.playerDaimyo?.name || '当主';

    ctx.textAlign = 'left';

    ctx.font = 'bold 26px "Yu Mincho", "Hiragino Mincho ProN", serif';

    ctx.fillText(`${clanName} 当主　${daimyoName} 殿`, 70, 160);



    // 本文

    ctx.font = '20px "Yu Mincho", "Hiragino Mincho ProN", serif';

    ctx.fillStyle = '#2b1b10';

    const lines = isShogun ? [

      '貴殿ハ 京洛ニ入リテ天下ノ動乱ヲ鎮撫シ 山城国ヲ掌握',

      '天下七十有余ノ諸州ヲ席捲シテ 武威ト仁徳ヲ四海ニ轟カセタリ',

      '茲ニ 朝廷勅命ニ依リテ 正二位征夷大将軍ニ任ジ',

      '天下泰平ノ新幕府ヲ開闢セシ 偉大ナル功績ヲ永久ニ顕彰ス'

    ] : [

      '貴殿ハ 幾多ノ激戦ヲ勝チ抜キ 北ハ蝦夷ヨリ南ハ薩摩マデ',

      `日本全土${(typeof toKanjiNumber === 'function') ? toKanjiNumber((this.provinces && this.provinces.length) || 0) : ((this.provinces && this.provinces.length) || 0)}州ヲ席捲 天下布武ノ大偉業ヲ成シ遂ゲラレタリ`,

      '諸民ヲ戦乱ノ塗炭ヨリ救ヒ 永遠ナル泰平ノ世ヲ築キシ',

      '其ノ不滅ノ英名ト至誠ヲ讃ヘ 茲ニ之ヲ顕彰ス'

    ];



    let textY = 215;

    lines.forEach(line => {

      ctx.fillText(line, 80, textY);

      textY += 38;

    });



    // 戦績記録カード

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    ctx.fillRect(70, 385, w - 140, 130);

    ctx.strokeStyle = '#c5a059';

    ctx.lineWidth = 1;

    ctx.strokeRect(70, 385, w - 140, 130);



    ctx.fillStyle = '#1a110a';

    ctx.font = 'bold 18px "Yu Gothic", "Meiryo", sans-serif';

    ctx.fillText('【戦記・達成記録】', 90, 415);



    ctx.font = '16px "Yu Gothic", "Meiryo", sans-serif';

    const startY = this.getScenarioYear ? this.getScenarioYear() : 1560;

    const curY = this.year || 1575;

    const yearsPassed = Math.max(1, curY - startY + 1);

    const battlesWon = this.stats?.battlesWon || 0;

    const battlesFought = this.stats?.battlesFought || battlesWon;

    const myProvs = (this.provinces || []).filter(p => p.ownerId === this.playerClanId);

    const diffName = { relaxed: '初級 (安泰の世)', easy: '中級 (天下泰平)', normal: '上級 (群雄割拠)' }[this.currentDifficulty] || '初級 (安泰の世)';



    ctx.fillText(`・達成時期: ${formatYearWithEra(this.year)}年 ${this.seasonNames ? this.seasonNames[this.seasonIdx] : ''} (所要 ${yearsPassed}年)`, 95, 445);

    ctx.fillText(`・平定領国: ${myProvs.length}州 制覇 ｜ 戦績: ${battlesWon}勝 ${Math.max(0, battlesFought - battlesWon)}敗 (${battlesFought}戦)`, 95, 475);

    ctx.fillText(`・難易度: ${diffName} ｜ 最終統治体制: ${isShogun ? clanName + '幕府' : clanName + '政権'}`, 95, 505);



    // 落款印（朱文方印）

    const stampX = w - 190;

    const stampY = h - 165;

    ctx.fillStyle = 'rgba(192, 40, 30, 0.88)';

    ctx.fillRect(stampX, stampY, 95, 95);

    ctx.strokeStyle = 'rgba(140, 20, 15, 0.95)';

    ctx.lineWidth = 3;

    ctx.strokeRect(stampX + 3, stampY + 3, 89, 89);



    ctx.fillStyle = '#fff';

    ctx.font = 'bold 22px "Yu Mincho", serif';

    ctx.textAlign = 'center';

    ctx.fillText('天下', stampX + 47, stampY + 40);

    ctx.fillText('静謐', stampX + 47, stampY + 75);



    // 日付

    ctx.textAlign = 'right';

    ctx.fillStyle = '#3a2b20';

    ctx.font = 'italic 16px "Yu Mincho", serif';

    ctx.fillText(`皇紀二千六百有余年　武門執奏`, w - 210, h - 85);



    // 共有用に描画だけ行う場合はここで返す

    if (opts && opts.download === false) return canvas;



    // ダウンロード実行

    try {

      const dataUrl = canvas.toDataURL('image/png');

      const a = document.createElement('a');

      a.href = dataUrl;

      a.download = `戦国天下統一伝_${daimyoName}_天下統一証書.png`;

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      this.audio?.playHoragai?.();

    } catch (e) {

      console.error('Certificate export failed:', e);

    }

  },



  // 𝕏ポスト：本文＋ハッシュタグのみで投稿画面を開く（画像添付なし）

  shareVictoryOnX() {

    const daimyo = this.playerDaimyo?.name || '当主';

    const clan = this.playerDaimyo?.clan || '御家';

    const startY = this.getScenarioYear ? this.getScenarioYear() : 1560;

    const curY = this.year || 1575;

    const yearsPassed = Math.max(1, curY - startY + 1);

    const won = this.stats?.battlesWon || 0;

    const fought = this.stats?.battlesFought || won;

    const isShogun = !!this._isShogunRoute;

    const title = isShogun ? '征夷大将軍就任・新幕府開府' : '日本全土完全統一・天下布武';



    const text = `【戦国天下統一伝】${clan}の英傑・${daimyo}公にて『${title}』の偉業を達成！\n⚔️ 所要: ${yearsPassed}年 (${formatYearWithEra(this.year)}年 ${this.seasonNames ? this.seasonNames[this.seasonIdx] : ''})\n🏆 激闘戦歴: ${won}勝 (${fought}戦)\n#戦国天下統一伝 #歴史シミュレーション #天下統一\n`;

    const url = location.href;

    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    window.open(intentUrl, '_blank', 'noopener,noreferrer');

  },



  // ============================================================================

  // [42位] 前線／後方位置変化に応じた統治方針の自動切り替え

  // ============================================================================



  checkAutoFrontierPolicySwitch() {

    const targetMode = this.autoFrontierPolicy || 'logistics';

    if (targetMode === 'none') return;



    const myProvs = (this.provinces || []).filter(p => p.ownerId === this.playerClanId);

    let changedCount = 0;

    const changedNames = [];



    myProvs.forEach(p => {

      const isFrontier = this.isProvinceFrontier(p);

      // 前線でなく、かつ軍事方針（military）になっている場合

      if (!isFrontier && p.governance === 'military') {

        p.governance = targetMode;

        changedCount++;

        changedNames.push(p.name);

      }

    });



    if (changedCount > 0) {

      const modeName = this.getGovernModeName ? this.getGovernModeName(targetMode) : (targetMode === 'logistics' ? '兵站輸送' : '内政');

      this.log(`【統治自動転換】前線から後方へ移行した${changedCount}州（${changedNames.slice(0, 3).join('・')}${changedNames.length > 3 ? '等' : ''}）の方針を「${modeName}」へ自動切替しました。`, 'normal');

      if (this.renderGovernTable) this.renderGovernTable();

    }

  },



  // ============================================================================

  // [81位] 領土拡大履歴の時系列記録

  // ============================================================================



  recordTerritoryHistory() {

    if (!this.territoryHistory) this.territoryHistory = [];

    const myProvs = (this.provinces || []).filter(p => p.ownerId === this.playerClanId);

    if (myProvs.length === 0) return;



    const label = `${this.formatYear()}年${this.seasonNames ? this.seasonNames[this.seasonIdx] : ''}`;

    const last = this.territoryHistory[this.territoryHistory.length - 1];

    if (last && last.year === this.year && last.seasonIdx === this.seasonIdx) {

      last.count = myProvs.length;

      last.label = label;

    } else {

      this.territoryHistory.push({

        year: this.year,

        seasonIdx: this.seasonIdx,

        label: label,

        count: myProvs.length

      });

    }

  },



  // ============================================================================

  // [63位] AI同士の合戦結果・滅亡イベントの和風アイキャッチ通知

  // ============================================================================



  showNewsEyecatch(title, message, icon = '⚔️', type = 'clash') {

    let container = document.getElementById('newsEyecatchContainer');

    if (!container) {

      container = document.createElement('div');

      container.id = 'newsEyecatchContainer';

      container.style.cssText = `

        position: fixed;

        top: 20px;

        left: 50%;

        transform: translateX(-50%);

        z-index: 100000;

        display: flex;

        flex-direction: column;

        align-items: center;

        gap: 10px;

        pointer-events: none;

        width: 90%;

        max-width: 600px;

      `;

      document.body.appendChild(container);

    }



    const toast = document.createElement('div');

    const isExtinct = type === 'extinct';

    const borderCol = isExtinct ? '#e74c3c' : '#d4af37';

    const bgGrad = isExtinct

      ? 'linear-gradient(135deg, rgba(45,10,10,0.96), rgba(20,5,5,0.96))'

      : 'linear-gradient(135deg, rgba(25,18,10,0.96), rgba(15,10,5,0.96))';

    const shadowCol = isExtinct ? 'rgba(231,76,60,0.5)' : 'rgba(212,175,55,0.4)';



    toast.style.cssText = `

      pointer-events: auto;

      background: ${bgGrad};

      border: 1.5px solid ${borderCol};

      box-shadow: 0 4px 25px ${shadowCol};

      border-radius: 6px;

      padding: 10px 18px;

      color: #f7f1e3;

      display: flex;

      align-items: center;

      gap: 12px;

      cursor: pointer;

      animation: newsEyecatchSlideIn 0.28s ease-out forwards;

      transition: opacity 0.35s ease, transform 0.35s ease;

      user-select: none;

    `;



    toast.innerHTML = `

      <div style="font-size: 22pt; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">${icon}</div>

      <div style="flex: 1 1 auto; min-width: 0;">

        <div style="font-size: 11pt; font-weight: bold; color: ${isExtinct ? '#ff8888' : '#ffd700'}; letter-spacing: 1px; margin-bottom: 2px;">

          ${title}

        </div>

        <div style="font-size: 11.5pt; color: #fff; line-height: 1.4; word-break: break-all;">

          ${message}

        </div>

      </div>

    `;



    const dismiss = () => {

      toast.style.opacity = '0';

      toast.style.transform = 'translateY(-15px)';

      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);

    };

    toast.onclick = dismiss;



    container.appendChild(toast);

    setTimeout(dismiss, 2800);

  },
};
