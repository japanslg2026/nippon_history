/**
 * @file js/core/Html.js - HTML 出力まわりの安全対策
 *  escapeHtml           : innerHTML / 属性値へ埋め込む文字列のエスケープ
 *  sanitizeImportedSave : 外部から読み込んだセーブJSON中の文字列から、危険なタグ・属性を除去する
 *                         （ゲーム自身のログ等が使う装飾タグ span/b/br 等は残す）
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const ALLOWED_TAGS = new Set(['span', 'b', 'strong', 'i', 'em', 'u', 'br', 'small', 'sub', 'sup', 'div', 'p', 'ul', 'ol', 'li', 'hr', 'ruby', 'rt', 'rp', 'font']);

function cleanAttrs(rest) {
  return rest
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')              // onclick= 等
    .replace(/\s+(href|src|srcdoc|formaction|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '') // 外部参照
    .replace(/javascript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '(');
}

/** 1つの文字列を無害化（許可タグ以外の `<` は &lt; にする） */
export function sanitizeHtmlString(s) {
  if (typeof s !== 'string' || s.indexOf('<') === -1) return s;
  return s.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^<>]*)>|</g, (m, slash, tag, rest) => {
    if (!tag) return '&lt;';                                   // 単独の '<'
    if (!ALLOWED_TAGS.has(tag.toLowerCase())) return m.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<${slash}${tag}${slash ? '' : cleanAttrs(rest)}>`;
  });
}

/** オブジェクト全体の文字列を再帰的に無害化（新しいオブジェクトを返す）。キー名も対象。 */
export function sanitizeImportedSave(value, depth = 0) {
  if (depth > 40) return value;
  if (typeof value === 'string') return sanitizeHtmlString(value);
  if (Array.isArray(value)) return value.map(v => sanitizeImportedSave(v, depth + 1));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;   // プロトタイプ汚染対策
      out[sanitizeHtmlString(k)] = sanitizeImportedSave(v, depth + 1);
    }
    return out;
  }
  return value;
}

if (typeof window !== 'undefined') { window.escapeHtml = escapeHtml; window.sanitizeImportedSave = sanitizeImportedSave; }
