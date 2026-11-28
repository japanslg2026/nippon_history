/**
 * @file js/core/Rng.js - ゲームロジック用の乱数（シード指定可能）
 * 通常は Math.random と同じ挙動。URL に ?seed=123 を付ける、または GameRng.seed(123) を呼ぶと
 * mulberry32 による再現可能な乱数列になる（バグ再現・バランス検証・自己対戦テスト用）。
 * 演出（花びら等）の乱数には使わない。
 */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const GameRng = {
  _fn: Math.random.bind(Math),
  seedValue: null,
  random() { return this._fn(); },
  /** seed を渡すと決定的に。null/undefined で Math.random に戻す。 */
  seed(s) {
    if (s === null || s === undefined || s === '') { this._fn = Math.random.bind(Math); this.seedValue = null; return; }
    const n = Number(s);
    const v = Number.isFinite(n) ? n : [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
    this.seedValue = v; this._fn = mulberry32(v);
  }
};
globalThis.GameRng = GameRng;
try {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('seed') : null;
  if (q) GameRng.seed(q);
} catch (_) {}
