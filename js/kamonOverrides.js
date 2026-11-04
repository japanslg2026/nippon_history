/** 加藤嘉明系など、共通家紋セットへ後から追加する家紋定義。 */
(function () {
  'use strict';

  var SYMBOL_ID = 'kamon-kato-yoshiaki-sagari-fuji';
  var KUMAMOTO_HOSOKAWA_SYMBOL_ID = 'kamon-kumamoto-hosokawa';
  var AKO_RONIN_SYMBOL_ID = 'kamon-ako-ronin';
  var SAKAI_SYMBOL_ID = 'kamon-sakai-harima';
  var UWAJIMA_DATE_SYMBOL_ID = 'kamon-uwajima-date';
  var ANDO_SYMBOL_ID = 'kamon-ando-northern';
  var SYMBOL_MARKUP = `
    <symbol id="kamon-kato-yoshiaki-sagari-fuji" viewBox="0 0 32 32">
      <title>加藤嘉明家・下り藤</title>
      <circle cx="16" cy="16" r="15" fill="#c65d2e" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.8" fill="none" stroke="#ffffff" stroke-width="1"/>
      <g fill="none" stroke="#ffffff" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 7.2 C15.8 9.6 13.5 10.6 11.3 11.5 C9.8 12.1 9.4 13.1 9.3 14.1"/>
        <path d="M16 7.2 C16.2 9.6 18.5 10.6 20.7 11.5 C22.2 12.1 22.6 13.1 22.7 14.1"/>
        <path d="M16 8.4 L16 13.2"/>
      </g>
      <g fill="#ffffff">
        <circle cx="11.1" cy="14.2" r="2.0"/><circle cx="9.8" cy="16.8" r="1.8"/><circle cx="10.6" cy="19.1" r="1.55"/><circle cx="11.5" cy="21.0" r="1.25"/>
        <circle cx="20.9" cy="14.2" r="2.0"/><circle cx="22.2" cy="16.8" r="1.8"/><circle cx="21.4" cy="19.1" r="1.55"/><circle cx="20.5" cy="21.0" r="1.25"/>
        <circle cx="16" cy="14.1" r="1.75"/><circle cx="16" cy="16.5" r="1.55"/><circle cx="16" cy="18.5" r="1.3"/>
      </g>
      <circle cx="16" cy="7.2" r="1.15" fill="#ffd700"/>
    </symbol>`;
  var AKO_RONIN_SYMBOL_MARKUP = `
    <symbol id="kamon-ako-ronin" viewBox="0 0 32 32">
      <title>赤穂浪士・違い鷹の羽</title>
      <circle cx="16" cy="16" r="15" fill="#7b1e32" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.8" fill="none" stroke="#ffffff" stroke-width="1"/>
      <g fill="#ffffff">
        <path d="M7.8 8.6 C10.8 7.6 14.6 9.1 17.1 12.1 C19.3 14.7 20.5 18.1 20.4 23.3 C17.1 20.7 14.6 17.8 12.7 14.4 C11.5 12.3 9.8 10.4 7.8 8.6 Z"/>
        <path d="M24.2 8.6 C21.2 7.6 17.4 9.1 14.9 12.1 C12.7 14.7 11.5 18.1 11.6 23.3 C14.9 20.7 17.4 17.8 19.3 14.4 C20.5 12.3 22.2 10.4 24.2 8.6 Z"/>
      </g>
      <path d="M9.4 9.7 L17.8 21.5 M22.6 9.7 L14.2 21.5" stroke="#7b1e32" stroke-width="0.8" stroke-linecap="round"/>
      <circle cx="16" cy="16" r="1.15" fill="#ffd700"/>
    </symbol>`;
  var KUMAMOTO_HOSOKAWA_SYMBOL_MARKUP = `
    <symbol id="kamon-kumamoto-hosokawa" viewBox="0 0 32 32">
      <title>熊本藩細川家・九曜</title>
      <circle cx="16" cy="16" r="15" fill="#596146" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.8" fill="none" stroke="#ffffff" stroke-width="1"/>
      <g fill="#ffffff">
        <circle cx="16" cy="8.3" r="2.05"/><circle cx="21.45" cy="10.55" r="2.05"/>
        <circle cx="23.7" cy="16" r="2.05"/><circle cx="21.45" cy="21.45" r="2.05"/>
        <circle cx="16" cy="23.7" r="2.05"/><circle cx="10.55" cy="21.45" r="2.05"/>
        <circle cx="8.3" cy="16" r="2.05"/><circle cx="10.55" cy="10.55" r="2.05"/>
        <circle cx="16" cy="16" r="2.2"/>
      </g>
      <circle cx="16" cy="16" r="0.75" fill="#ffd700"/>
    </symbol>`;
  var SAKAI_SYMBOL_MARKUP = `
    <symbol id="kamon-sakai-harima" viewBox="0 0 32 32">
      <title>酒井家・三つ星</title>
      <circle cx="16" cy="16" r="15" fill="#8a6b3f" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="10" r="3.2" fill="#ffffff"/>
      <circle cx="11" cy="19" r="3.2" fill="#ffffff"/>
      <circle cx="21" cy="19" r="3.2" fill="#ffffff"/>
    </symbol>`;
  var UWAJIMA_DATE_SYMBOL_MARKUP = `
    <symbol id="kamon-uwajima-date" viewBox="0 0 32 32">
      <title>宇和島伊達家・宇和島笹（竹に雀紋）</title>
      <circle cx="16" cy="16" r="15" fill="#5a3d86" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffffff" stroke-width="1.1"/>
      <!-- 宇和島笹：二本の竹と左右へ張る笹葉 -->
      <path d="M10 24.2 C12.3 18.7 12.6 12.6 11.6 7.5 M22 24.2 C19.7 18.7 19.4 12.6 20.4 7.5" stroke="#ffd700" stroke-width="1.05" stroke-linecap="round" fill="none"/>
      <g fill="#ffffff">
        <path d="M11.7 10.3 C8.4 9.5 7.2 7.6 7.1 6.2 C9.8 6.5 11.7 7.7 12.5 9.9 Z"/>
        <path d="M11.7 14.2 C8.4 14.6 6.6 13.4 5.7 11.9 C8.1 11 10.7 11.7 12.3 13.4 Z"/>
        <path d="M12.1 18 C9.2 19.3 7 18.8 5.5 17.4 C7.8 15.9 10.7 16.2 12.8 17.1 Z"/>
        <path d="M20.3 10.3 C23.6 9.5 24.8 7.6 24.9 6.2 C22.2 6.5 20.3 7.7 19.5 9.9 Z"/>
        <path d="M20.3 14.2 C23.6 14.6 25.4 13.4 26.3 11.9 C23.9 11 21.3 11.7 19.7 13.4 Z"/>
        <path d="M19.9 18 C22.8 19.3 25 18.8 26.5 17.4 C24.2 15.9 21.3 16.2 19.2 17.1 Z"/>
        <!-- 向かい合う二羽の雀 -->
        <path d="M8.8 21.7 C11.2 18.9 14.2 19.7 15.1 22.1 C12.7 23.8 10.3 23.6 8.8 21.7 Z"/>
        <path d="M23.2 21.7 C20.8 18.9 17.8 19.7 16.9 22.1 C19.3 23.8 21.7 23.6 23.2 21.7 Z"/>
      </g>
      <path d="M9.7 21.5 L12.8 21.8 M22.3 21.5 L19.2 21.8" stroke="#ffd700" stroke-width="0.7" stroke-linecap="round"/>
      <circle cx="16" cy="23.1" r="1" fill="#ffd700"/>
    </symbol>`;
  var ANDO_SYMBOL_MARKUP = `
    <symbol id="kamon-ando-northern" viewBox="0 0 32 32">
      <title>安東家・檜扇に違い鷲の羽</title>
      <circle cx="16" cy="16" r="15" fill="#2f7a78" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffffff" stroke-width="1.1"/>
      <!-- 檜扇：要を中心に広がる扇面と檜の骨 -->
      <path d="M16 23.8 L8.3 10.4 Q16 6.4 23.7 10.4 Z" fill="#ffffff" stroke="#ffd700" stroke-width="0.75" stroke-linejoin="round"/>
      <path d="M16 23.4 L10.4 10.1 M16 23.4 L13.2 8.5 M16 23.4 L16 7.8 M16 23.4 L18.8 8.5 M16 23.4 L21.6 10.1" stroke="#2f7a78" stroke-width="0.72" stroke-linecap="round"/>
      <circle cx="16" cy="23.4" r="1.55" fill="#ffd700"/>
      <!-- 違い鷲の羽：左右から交差する二枚の羽 -->
      <path d="M8.1 9.7 C11.7 9.1 15.4 12.2 18.5 18.7 C14.6 18 10.8 15.2 8.1 9.7 Z" fill="#ffffff" stroke="#2f7a78" stroke-width="0.55"/>
      <path d="M23.9 9.7 C20.3 9.1 16.6 12.2 13.5 18.7 C17.4 18 21.2 15.2 23.9 9.7 Z" fill="#ffffff" stroke="#2f7a78" stroke-width="0.55"/>
      <path d="M9.2 10.6 L18.2 18.1 M22.8 10.6 L13.8 18.1" stroke="#ffd700" stroke-width="0.65" stroke-linecap="round"/>
    </symbol>`;

  function addToSource() {
    if (!window.KAMONS_SVG_CONTENT) return;
    [
      ['kamon-gamo', '#2f5f9e'],
      ['kamon-todo', '#5b6068'],
      ['kamon-yamanouchi', '#365a9c'],
      ['kamon-fukui', '#8a4a36'],
      ['kamon-okayama', '#3f5c9a'],
      ['kamon-tottori', '#7a5a90'],
      ['kamon-matsue', '#2f6f68'],
      ['kamon-nagaoka', '#643e21'],
      ['kamon-kuwana', '#5d6d7e']
    ].forEach(function ([symbolId, color]) {
      var pattern = new RegExp(`(<symbol id="${symbolId}"[\\s\\S]*?<circle\\b[^>]*\\bfill=")[^"]+`);
      window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace(pattern, `$1${color}`);
    });
    [[SYMBOL_ID, SYMBOL_MARKUP], [KUMAMOTO_HOSOKAWA_SYMBOL_ID, KUMAMOTO_HOSOKAWA_SYMBOL_MARKUP], [AKO_RONIN_SYMBOL_ID, AKO_RONIN_SYMBOL_MARKUP], [SAKAI_SYMBOL_ID, SAKAI_SYMBOL_MARKUP], [UWAJIMA_DATE_SYMBOL_ID, UWAJIMA_DATE_SYMBOL_MARKUP], [ANDO_SYMBOL_ID, ANDO_SYMBOL_MARKUP]].forEach(function ([symbolId, markup]) {
      if (window.KAMONS_SVG_CONTENT.indexOf(`id="${symbolId}"`) === -1) {
        window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace('</defs>', `${markup}\n</defs>`);
      }
    });
  }

  function addToDocument() {
    if (typeof document === 'undefined') return;
    [
      ['kamon-gamo', '#2f5f9e'],
      ['kamon-todo', '#5b6068'],
      ['kamon-yamanouchi', '#365a9c'],
      ['kamon-fukui', '#8a4a36'],
      ['kamon-okayama', '#3f5c9a'],
      ['kamon-tottori', '#7a5a90'],
      ['kamon-matsue', '#2f6f68'],
      ['kamon-nagaoka', '#643e21'],
      ['kamon-kuwana', '#5d6d7e']
    ].forEach(function ([symbolId, color]) {
      var symbol = document.getElementById(symbolId);
      var outerCircle = symbol && (symbol.querySelector('circle[r="15"]') || symbol.querySelector('circle'));
      if (outerCircle) outerCircle.setAttribute('fill', color);
    });
    var defs = document.getElementById('mapSvgDefs') || document.querySelector('#kamonsGlobalContainer defs');
    if (!defs) return;
    [[SYMBOL_ID, SYMBOL_MARKUP], [KUMAMOTO_HOSOKAWA_SYMBOL_ID, KUMAMOTO_HOSOKAWA_SYMBOL_MARKUP], [AKO_RONIN_SYMBOL_ID, AKO_RONIN_SYMBOL_MARKUP], [SAKAI_SYMBOL_ID, SAKAI_SYMBOL_MARKUP], [UWAJIMA_DATE_SYMBOL_ID, UWAJIMA_DATE_SYMBOL_MARKUP], [ANDO_SYMBOL_ID, ANDO_SYMBOL_MARKUP]].forEach(function ([symbolId, markup]) {
      if (document.getElementById(symbolId)) return;
      var parsed = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg"><defs>${markup}</defs></svg>`, 'image/svg+xml');
      var symbol = parsed.querySelector('symbol');
      if (symbol) defs.appendChild(document.importNode(symbol, true));
    });
  }

  addToSource();
  addToDocument();
  window.installKamonOverrides = function () {
    addToSource();
    addToDocument();
  };
})();
