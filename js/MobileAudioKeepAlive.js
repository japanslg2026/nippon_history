/* スマホ向け BGM 継続再生（2026-11-01）
 * 原因: スマホでは画面ロック・通知・着信・タブ切替・一定時間後に AudioContext が
 * suspended / interrupted (iOS) へ落ち、既存の解除処理は初回タッチ1回だけなので二度と戻らなかった。
 * 対策（スマホ判定時のみ・PC の動作は変更なし）:
 *  - 画面復帰・ページ表示・フォーカス・毎タッチで AudioContext を resume
 *  - statechange 監視と 1.5 秒ごとの見張りで止まったら自動復帰、先読み予約も補充
 *  - iOS 17+ は audioSession を playback にしてマナースイッチ等で無音化されにくくする */
(function () {
  'use strict';
  const isMobile = (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent || ''))) &&
    (!window.matchMedia || window.matchMedia('(pointer: coarse)').matches);
  if (!isMobile) return;
  const eng = () => window.sengokuMusic || null;
  const muted = () => { const e = eng(); return !e || !!e.isMuted || !!e.isBgmMuted; };
  let hooked = null;
  function setSession() {
    try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (_) {}
  }
  function revive() {
    const e = eng(); if (!e || !e.ctx || muted()) return;
    const c = e.ctx;
    if (hooked !== c) { hooked = c; try { c.addEventListener('statechange', () => { if (!document.hidden) setTimeout(revive, 60); }); } catch (_) {} }
    if (c.state === 'closed') return;
    if (c.state !== 'running') { c.resume().then(() => { try { if (e.timerId) e.scheduleAhead(); } catch (_) {} }).catch(() => {}); return; }
    // 裏で setInterval が間引かれても、表に戻ったら予約を即補充
    try { if (e.timerId && typeof e.scheduleAhead === 'function') e.scheduleAhead(); } catch (_) {}
  }
  function onGesture() { setSession(); revive(); }
  ['touchend', 'pointerdown', 'click'].forEach(t => window.addEventListener(t, onGesture, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { revive(); setTimeout(revive, 300); } });
  window.addEventListener('pageshow', revive);
  window.addEventListener('focus', revive);
  setInterval(() => { if (!document.hidden) revive(); }, 1500);
})();