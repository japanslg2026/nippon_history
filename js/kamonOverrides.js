/** 加藤嘉明系など、共通家紋セットへ後から追加する家紋定義。 */
(function () {
  'use strict';

  var SYMBOL_ID = 'kamon-kato-yoshiaki-sagari-fuji';
  var KUMAMOTO_HOSOKAWA_SYMBOL_ID = 'kamon-kumamoto-hosokawa';
  var AKO_RONIN_SYMBOL_ID = 'kamon-ako-ronin';
  var SAKAI_SYMBOL_ID = 'kamon-sakai-harima';
  var UWAJIMA_DATE_SYMBOL_ID = 'kamon-uwajima-date';
  var ANDO_SYMBOL_ID = 'kamon-ando-northern';
  var NIWA_SYMBOL_ID = 'kamon-niwa-sujikai';
  var GOTO_SYMBOL_ID = 'kamon-goto-maruni-hanabishi';
  var SUWA_SYMBOL_ID = 'kamon-suwa-kajinoha';
  var SENGOKU_SYMBOL_ID = 'kamon-sengoku-eiraku-tsuho';
  var ICHIJO_SYMBOL_ID = 'kamon-ichijo-fuji';
  var CHOSOKABE_SYMBOL_ID = 'kamon-chosokabe-nanatsu-katabami';
  var BESSHO_SYMBOL_ID = 'kamon-bessho-hidari-mitsudomoe';
  var SHIINA_SYMBOL_ID = 'kamon-shiina-tsuta';
  var SANO_SYMBOL_ID = 'kamon-sano';
  var AKI_TOSA_SYMBOL_ID = 'kamon-aki-tosa';
  var MOTOYAMA_SYMBOL_ID = 'kamon-motoyama';
  var TAKATO_SYMBOL_ID = 'kamon-takato-kajinoha';
  var OYAMA_SYMBOL_ID = 'kamon-oyama-tomoe';
  var NANJO_SYMBOL_ID = 'kamon-nanjo';
  var SAITO_SYMBOL_ID = 'kamon-saito';
  var TAKIGAWA_SYMBOL_ID = 'kamon-takigawa';
  var TODO_SYMBOL_ID = 'kamon-todo-tsuta';
  var TODO_SYMBOL_MARKUP = `
    <symbol id="kamon-todo-tsuta" viewBox="0 0 32 32">
      <title>藤堂家・藤堂蔦</title>
      <circle cx="16" cy="16" r="15" fill="#d5d8dc" stroke="#4b5563" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#4b5563" stroke-width="1.1"/>
      <g fill="#374151" stroke="#d5d8dc" stroke-width="0.55" stroke-linejoin="round">
        <g transform="translate(16 16.6)">
          <path d="M0 1.4 C-2.8 0.7 -4.2 -1.8 -3.3 -4.2 C-2.5 -6.2 -1.1 -7.8 0 -10.1 C1.1 -7.8 2.5 -6.2 3.3 -4.2 C4.2 -1.8 2.8 0.7 0 1.4 Z"/>
          <path d="M0 0.2 V-8.2 M0-4.1 L-1.9-5.7 M0-4.1 L1.9-5.7 M0-1.9 L-2.35-3.1 M0-1.9 L2.35-3.1" fill="none" stroke="#d5d8dc" stroke-width="0.72" stroke-linecap="round"/>
        </g>
        <g transform="translate(16 16.6) rotate(120)">
          <path d="M0 1.4 C-2.8 0.7 -4.2 -1.8 -3.3 -4.2 C-2.5 -6.2 -1.1 -7.8 0 -10.1 C1.1 -7.8 2.5 -6.2 3.3 -4.2 C4.2 -1.8 2.8 0.7 0 1.4 Z"/>
          <path d="M0 0.2 V-8.2 M0-4.1 L-1.9-5.7 M0-4.1 L1.9-5.7 M0-1.9 L-2.35-3.1 M0-1.9 L2.35-3.1" fill="none" stroke="#d5d8dc" stroke-width="0.72" stroke-linecap="round"/>
        </g>
        <g transform="translate(16 16.6) rotate(240)">
          <path d="M0 1.4 C-2.8 0.7 -4.2 -1.8 -3.3 -4.2 C-2.5 -6.2 -1.1 -7.8 0 -10.1 C1.1 -7.8 2.5 -6.2 3.3 -4.2 C4.2 -1.8 2.8 0.7 0 1.4 Z"/>
          <path d="M0 0.2 V-8.2 M0-4.1 L-1.9-5.7 M0-4.1 L1.9-5.7 M0-1.9 L-2.35-3.1 M0-1.9 L2.35-3.1" fill="none" stroke="#d5d8dc" stroke-width="0.72" stroke-linecap="round"/>
        </g>
      </g>
      <circle cx="16" cy="16.6" r="1.2" fill="#4b5563"/>
    </symbol>`;
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
  var NIWA_SYMBOL_MARKUP = `
    <symbol id="kamon-niwa-sujikai" viewBox="0 0 32 32">
      <title>丹羽家・丹羽直違紋</title>
      <circle cx="16" cy="16" r="15" fill="#e67e22" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.8" fill="none" stroke="#ffffff" stroke-width="1.1"/>
      <path d="M8.5 7.8 L11.7 7.8 L23.5 24.2 L20.3 24.2 Z" fill="#ffffff"/>
      <path d="M20.3 7.8 L23.5 7.8 L11.7 24.2 L8.5 24.2 Z" fill="#ffffff"/>
    </symbol>`;
  var GOTO_SYMBOL_MARKUP = `
    <symbol id="kamon-goto-maruni-hanabishi" viewBox="0 0 32 32">
      <title>五島家・丸に花菱</title>
      <circle cx="16" cy="16" r="15" fill="#2874a6" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.7" fill="none" stroke="#ffffff" stroke-width="1.2"/>
      <g fill="#ffffff" stroke="#2874a6" stroke-width="0.55" stroke-linejoin="round">
        <path d="M16 8.1 L20.3 12.7 L16 16.1 L11.7 12.7 Z"/>
        <path d="M23.9 16 L19.3 20.3 L15.9 16 L19.3 11.7 Z"/>
        <path d="M16 23.9 L11.7 19.3 L16 15.9 L20.3 19.3 Z"/>
        <path d="M8.1 16 L12.7 11.7 L16.1 16 L12.7 20.3 Z"/>
      </g>
      <path d="M16 12.3 L19.7 16 L16 19.7 L12.3 16 Z" fill="#ffd700"/>
    </symbol>`;
  var SUWA_SYMBOL_MARKUP = `
    <symbol id="kamon-suwa-kajinoha" viewBox="0 0 32 32">
      <title>諏訪家・梶の葉</title>
      <circle cx="16" cy="16" r="15" fill="#1e8449" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.8" fill="none" stroke="#ffffff" stroke-width="1.1"/>
      <g fill="#ffffff" stroke="#1e8449" stroke-width="0.55" stroke-linejoin="round">
        <path d="M16 15.8 C12.8 13.7 11.2 10.5 12.3 7.2 C15.2 7.4 17.5 9.6 16 15.8 Z"/>
        <path d="M16 15.8 C18.1 12.6 21.4 11 24.7 12.1 C24.5 15 22.2 17.3 16 15.8 Z"/>
        <path d="M16 15.8 C19.2 17.9 20.8 21.2 19.7 24.6 C16.8 24.3 14.5 22.1 16 15.8 Z"/>
        <path d="M16 15.8 C13.9 19 10.6 20.6 7.3 19.5 C7.5 16.6 9.8 14.3 16 15.8 Z"/>
      </g>
      <circle cx="16" cy="16" r="2.1" fill="#ffd700"/>
    </symbol>`;
  var SENGOKU_SYMBOL_MARKUP = `
    <symbol id="kamon-sengoku-eiraku-tsuho" data-v="2" viewBox="0 0 32 32">
      <title>仙石家・永楽通宝</title>
      <circle cx="16" cy="16" r="15" fill="#8e5a2b" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.9" fill="none" stroke="#ffffff" stroke-width="1.4"/>
      <circle cx="16" cy="16" r="10.2" fill="none" stroke="#ffffff" stroke-width="0.6"/>
      <rect x="13.4" y="13.4" width="5.2" height="5.2" fill="none" stroke="#ffffff" stroke-width="1.1"/>
      <g fill="#ffffff" font-family="'Shippori Mincho','Yu Mincho','Hiragino Mincho ProN',serif" font-size="5" font-weight="700" text-anchor="middle">
      <text x="16" y="12.1">永</text>
      <text x="16" y="24.2">樂</text>
      <text x="22.1" y="18.1">通</text>
      <text x="9.9" y="18.1">寶</text>
      </g>
    </symbol>`;

  var ICHIJO_SYMBOL_MARKUP = `
    <symbol id="kamon-ichijo-fuji" viewBox="0 0 32 32">
      <title>土佐一条家・一条藤</title>
      <circle cx="16" cy="16" r="15" fill="#78281f" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12.4" fill="none" stroke="#ffffff" stroke-width="0.8"/>
      <path d="M16 6.6 C9 6.8 5.8 11 6.6 16.2" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round"/>
      <ellipse cx="11.8" cy="5.6" rx="1.75" ry="0.8" transform="rotate(20 11.8 5.6)" fill="#ffffff"/>
      <ellipse cx="8.8" cy="6.9" rx="1.75" ry="0.8" transform="rotate(-10 8.8 6.9)" fill="#ffffff"/>
      <ellipse cx="6.7" cy="9.6" rx="1.75" ry="0.8" transform="rotate(-40 6.7 9.6)" fill="#ffffff"/>
      <circle cx="6.6" cy="15.6" r="1.55" fill="#ffffff"/>
      <circle cx="7.13" cy="16.86" r="1.41" fill="#ffffff"/>
      <circle cx="7.89" cy="18.02" r="1.28" fill="#ffffff"/>
      <circle cx="8.79" cy="19.07" r="1.14" fill="#ffffff"/>
      <circle cx="9.79" cy="20.01" r="1.01" fill="#ffffff"/>
      <circle cx="10.86" cy="20.84" r="0.87" fill="#ffffff"/>
      <circle cx="12" cy="21.58" r="0.74" fill="#ffffff"/>
      <circle cx="13.2" cy="22.2" r="0.6" fill="#ffffff"/>
      <path d="M16 6.6 C23 6.8 26.2 11 25.4 16.2" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round"/>
      <ellipse cx="20.2" cy="5.6" rx="1.75" ry="0.8" transform="rotate(-20 20.2 5.6)" fill="#ffffff"/>
      <ellipse cx="23.2" cy="6.9" rx="1.75" ry="0.8" transform="rotate(10 23.2 6.9)" fill="#ffffff"/>
      <ellipse cx="25.3" cy="9.6" rx="1.75" ry="0.8" transform="rotate(40 25.3 9.6)" fill="#ffffff"/>
      <circle cx="25.4" cy="15.6" r="1.55" fill="#ffffff"/>
      <circle cx="24.87" cy="16.86" r="1.41" fill="#ffffff"/>
      <circle cx="24.11" cy="18.02" r="1.28" fill="#ffffff"/>
      <circle cx="23.21" cy="19.07" r="1.14" fill="#ffffff"/>
      <circle cx="22.21" cy="20.01" r="1.01" fill="#ffffff"/>
      <circle cx="21.14" cy="20.84" r="0.87" fill="#ffffff"/>
      <circle cx="20" cy="21.58" r="0.74" fill="#ffffff"/>
      <circle cx="18.8" cy="22.2" r="0.6" fill="#ffffff"/>
      <circle cx="16" cy="5.6" r="1.2" fill="#ffffff"/>
    </symbol>`;
  var CHOSOKABE_SYMBOL_MARKUP = `
    <symbol id="kamon-chosokabe-nanatsu-katabami" viewBox="0 0 32 32">
      <title>長宗我部家・丸に七つ片喰</title>
      <circle cx="16" cy="16" r="15" fill="#5dade2" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.6" fill="none" stroke="#ffffff" stroke-width="1.7"/>
      <path d="M16 16 C14.93 15.12 13.95 13.56 14.83 12.2 Q16 12.88 16 12.88 Q16 12.88 17.17 12.2 C18.05 13.56 17.07 15.12 16 16 Z M16 16 C17.3 15.51 19.13 15.45 19.88 16.89 Q18.7 17.56 18.7 17.56 Q18.7 17.56 18.71 18.91 C17.09 18.99 16.22 17.37 16 16 Z M16 16 C15.78 17.37 14.91 18.99 13.29 18.91 Q13.3 17.56 13.3 17.56 Q13.3 17.56 12.12 16.89 C12.87 15.45 14.7 15.51 16 16 Z M16 9.4 C15.15 8.7 14.37 7.46 15.07 6.38 Q16 6.92 16 6.92 Q16 6.92 16.93 6.38 C17.63 7.46 16.85 8.7 16 9.4 Z M16 9.4 C17.03 9.01 18.49 8.96 19.08 10.11 Q18.15 10.64 18.15 10.64 Q18.15 10.64 18.15 11.72 C16.86 11.78 16.18 10.49 16 9.4 Z M16 9.4 C15.82 10.49 15.14 11.78 13.85 11.72 Q13.85 10.64 13.85 10.64 Q13.85 10.64 12.92 10.11 C13.51 8.96 14.97 9.01 16 9.4 Z M21.72 12.7 C21.89 11.61 22.58 10.32 23.87 10.38 Q23.86 11.46 23.86 11.46 Q23.86 11.46 24.8 11.99 C24.21 13.14 22.75 13.09 21.72 12.7 Z M21.72 12.7 C22.57 13.4 23.34 14.64 22.65 15.72 Q21.72 15.18 21.72 15.18 Q21.72 15.18 20.79 15.72 C20.09 14.64 20.86 13.4 21.72 12.7 Z M21.72 12.7 C20.69 13.09 19.22 13.14 18.63 11.99 Q19.57 11.46 19.57 11.46 Q19.57 11.46 19.56 10.38 C20.85 10.32 21.54 11.61 21.72 12.7 Z M21.72 19.3 C22.75 18.91 24.21 18.86 24.8 20.01 Q23.86 20.54 23.86 20.54 Q23.86 20.54 23.87 21.62 C22.58 21.68 21.89 20.39 21.72 19.3 Z M21.72 19.3 C21.54 20.39 20.85 21.68 19.56 21.62 Q19.57 20.54 19.57 20.54 Q19.57 20.54 18.63 20.01 C19.22 18.86 20.69 18.91 21.72 19.3 Z M21.72 19.3 C20.86 18.6 20.09 17.36 20.79 16.28 Q21.72 16.82 21.72 16.82 Q21.72 16.82 22.65 16.28 C23.34 17.36 22.57 18.6 21.72 19.3 Z M16 22.6 C16.85 23.3 17.63 24.54 16.93 25.62 Q16 25.08 16 25.08 Q16 25.08 15.07 25.62 C14.37 24.54 15.15 23.3 16 22.6 Z M16 22.6 C14.97 22.99 13.51 23.04 12.92 21.89 Q13.85 21.36 13.85 21.36 Q13.85 21.36 13.85 20.28 C15.14 20.22 15.82 21.51 16 22.6 Z M16 22.6 C16.18 21.51 16.86 20.22 18.15 20.28 Q18.15 21.36 18.15 21.36 Q18.15 21.36 19.08 21.89 C18.49 23.04 17.03 22.99 16 22.6 Z M10.28 19.3 C10.11 20.39 9.42 21.68 8.13 21.62 Q8.14 20.54 8.14 20.54 Q8.14 20.54 7.2 20.01 C7.79 18.86 9.25 18.91 10.28 19.3 Z M10.28 19.3 C9.43 18.6 8.66 17.36 9.35 16.28 Q10.28 16.82 10.28 16.82 Q10.28 16.82 11.21 16.28 C11.91 17.36 11.14 18.6 10.28 19.3 Z M10.28 19.3 C11.31 18.91 12.78 18.86 13.37 20.01 Q12.43 20.54 12.43 20.54 Q12.43 20.54 12.44 21.62 C11.15 21.68 10.46 20.39 10.28 19.3 Z M10.28 12.7 C9.25 13.09 7.79 13.14 7.2 11.99 Q8.14 11.46 8.14 11.46 Q8.14 11.46 8.13 10.38 C9.42 10.32 10.11 11.61 10.28 12.7 Z M10.28 12.7 C10.46 11.61 11.15 10.32 12.44 10.38 Q12.43 11.46 12.43 11.46 Q12.43 11.46 13.37 11.99 C12.78 13.14 11.31 13.09 10.28 12.7 Z M10.28 12.7 C11.14 13.4 11.91 14.64 11.21 15.72 Q10.28 15.18 10.28 15.18 Q10.28 15.18 9.35 15.72 C8.66 14.64 9.43 13.4 10.28 12.7 Z" fill="#ffffff"/>
    </symbol>`;
  var BESSHO_SYMBOL_MARKUP = `
    <symbol id="kamon-bessho-hidari-mitsudomoe" viewBox="0 0 32 32">
      <title>別所家・左三つ巴</title>
      <circle cx="16" cy="16" r="15" fill="#c69c6d" stroke="#ffd700" stroke-width="1.5"/>
      <g fill="#ffffff">
      <path d="M16 5.4 L15.26 5.43 L14.52 5.5 L13.8 5.63 L13.08 5.81 L12.37 6.04 L11.69 6.32 L11.02 6.64 L10.38 7.01 L9.77 7.42 L9.19 7.88 L8.64 8.37 L8.12 8.91 L7.65 9.47 L7.21 10.07 L6.82 10.7 L6.47 11.35 L6.17 12.03 L5.92 12.72 L5.71 13.44 L5.56 14.16 L5.46 14.89 L5.41 15.63 L5.41 16.37 L5.46 17.11 L5.56 17.84 L5.71 18.56 L5.92 19.28 L6.17 19.97 L6.17 19.97 L5.93 19.27 L5.74 18.56 L5.63 17.83 L5.58 17.1 L5.6 16.36 L5.7 15.64 L5.86 14.93 L6.09 14.25 L6.38 13.6 L6.73 12.99 L7.14 12.42 L7.6 11.9 L8.1 11.44 L8.64 11.04 L9.22 10.7 L9.82 10.44 L10.44 10.24 L11.07 10.12 L11.7 10.08 L12.32 10.11 L12.92 10.21 L13.5 10.39 L14.05 10.64 L14.55 10.96 L15.01 11.34 L15.41 11.78 L15.74 12.27 L16 12.8 Z M 12.3 9.1 a 3.7 3.7 0 1 0 7.4 0 a 3.7 3.7 0 1 0 -7.4 0 Z"/>
      <path d="M25.18 21.3 L25.53 20.65 L25.83 19.97 L26.08 19.28 L26.29 18.56 L26.44 17.84 L26.54 17.11 L26.59 16.37 L26.59 15.63 L26.54 14.89 L26.44 14.16 L26.29 13.44 L26.08 12.72 L25.83 12.03 L25.53 11.35 L25.18 10.7 L24.79 10.07 L24.35 9.47 L23.88 8.91 L23.36 8.37 L22.81 7.88 L22.23 7.42 L21.62 7.01 L20.98 6.64 L20.31 6.32 L19.63 6.04 L18.92 5.81 L18.2 5.63 L17.48 5.5 L17.48 5.5 L18.2 5.64 L18.91 5.84 L19.6 6.1 L20.26 6.43 L20.88 6.82 L21.46 7.26 L21.99 7.75 L22.47 8.29 L22.89 8.87 L23.24 9.48 L23.53 10.11 L23.75 10.77 L23.9 11.44 L23.98 12.11 L23.98 12.78 L23.91 13.43 L23.77 14.06 L23.56 14.67 L23.28 15.23 L22.95 15.76 L22.55 16.23 L22.11 16.64 L21.62 16.99 L21.09 17.27 L20.53 17.47 L19.96 17.6 L19.37 17.64 L18.77 17.6 Z M 18.28 19.45 a 3.7 3.7 0 1 0 7.4 0 a 3.7 3.7 0 1 0 -7.4 0 Z"/>
      <path d="M6.82 21.3 L7.21 21.93 L7.65 22.53 L8.12 23.09 L8.64 23.63 L9.19 24.12 L9.77 24.58 L10.38 24.99 L11.02 25.36 L11.69 25.68 L12.37 25.96 L13.08 26.19 L13.8 26.37 L14.52 26.5 L15.26 26.57 L16 26.6 L16.74 26.57 L17.48 26.5 L18.2 26.37 L18.92 26.19 L19.63 25.96 L20.31 25.68 L20.98 25.36 L21.62 24.99 L22.23 24.58 L22.81 24.12 L23.36 23.63 L23.88 23.09 L24.35 22.53 L24.35 22.53 L23.87 23.09 L23.34 23.6 L22.77 24.07 L22.16 24.48 L21.51 24.82 L20.84 25.1 L20.15 25.32 L19.44 25.46 L18.73 25.53 L18.03 25.54 L17.33 25.47 L16.65 25.33 L16 25.12 L15.38 24.85 L14.8 24.52 L14.27 24.13 L13.79 23.69 L13.38 23.21 L13.02 22.69 L12.74 22.14 L12.53 21.56 L12.39 20.97 L12.33 20.37 L12.36 19.77 L12.46 19.19 L12.64 18.63 L12.9 18.09 L13.23 17.6 Z M 6.32 19.45 a 3.7 3.7 0 1 0 7.4 0 a 3.7 3.7 0 1 0 -7.4 0 Z"/>
      </g>
    </symbol>`;
  var SHIINA_SYMBOL_MARKUP = `
    <symbol id="kamon-shiina-tsuta" viewBox="0 0 32 32">
      <title>椎名家・蔦</title>
      <circle cx="16" cy="16" r="15" fill="#117a65" stroke="#ffd700" stroke-width="1.5"/>
      <path d="M16 21.8 C14.2 20.2 11.4 19.6 9 20.4 C9.6 18.8 9.2 17.6 7.2 16.2 C8.8 15.4 9.6 14.4 9.4 12.6 C11 13 12.4 12.6 13.2 11.2 C12.6 9.6 12.8 8 14 6.2 L16 7.6 L18 6.2 C19.2 8 19.4 9.6 18.8 11.2 C19.6 12.6 21 13 22.6 12.6 C22.4 14.4 23.2 15.4 24.8 16.2 C22.8 17.6 22.4 18.8 23 20.4 C20.6 19.6 17.8 20.2 16 21.8 Z" fill="#ffffff"/>
      <path d="M16 21 L16 8.6 M16 17 L10.4 13.8 M16 17 L21.6 13.8 M16 18.6 L9.6 18.8 M16 18.6 L22.4 18.8" fill="none" stroke="#117a65" stroke-width="0.7" stroke-linecap="round"/>
      <path d="M16 21.6 C16.2 23.6 17.2 25.4 18.6 26.6" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
    </symbol>`;
  var SANO_SYMBOL_MARKUP = `
    <symbol id="kamon-sano" viewBox="0 0 32 32">
      <title>佐野家・左三つ巴</title>
      <circle cx="16" cy="16" r="15" fill="#6c3483" stroke="#ffd700" stroke-width="1.5"/>
      <g fill="#ffffff">
      <path d="M16 5.4 L15.26 5.43 L14.52 5.5 L13.8 5.63 L13.08 5.81 L12.37 6.04 L11.69 6.32 L11.02 6.64 L10.38 7.01 L9.77 7.42 L9.19 7.88 L8.64 8.37 L8.12 8.91 L7.65 9.47 L7.21 10.07 L6.82 10.7 L6.47 11.35 L6.17 12.03 L5.92 12.72 L5.71 13.44 L5.56 14.16 L5.46 14.89 L5.41 15.63 L5.41 16.37 L5.46 17.11 L5.56 17.84 L5.71 18.56 L5.92 19.28 L6.17 19.97 L6.17 19.97 L5.93 19.27 L5.74 18.56 L5.63 17.83 L5.58 17.1 L5.6 16.36 L5.7 15.64 L5.86 14.93 L6.09 14.25 L6.38 13.6 L6.73 12.99 L7.14 12.42 L7.6 11.9 L8.1 11.44 L8.64 11.04 L9.22 10.7 L9.82 10.44 L10.44 10.24 L11.07 10.12 L11.7 10.08 L12.32 10.11 L12.92 10.21 L13.5 10.39 L14.05 10.64 L14.55 10.96 L15.01 11.34 L15.41 11.78 L15.74 12.27 L16 12.8 Z M 12.3 9.1 a 3.7 3.7 0 1 0 7.4 0 a 3.7 3.7 0 1 0 -7.4 0 Z"/>
      <path d="M25.18 21.3 L25.53 20.65 L25.83 19.97 L26.08 19.28 L26.29 18.56 L26.44 17.84 L26.54 17.11 L26.59 16.37 L26.59 15.63 L26.54 14.89 L26.44 14.16 L26.29 13.44 L26.08 12.72 L25.83 12.03 L25.53 11.35 L25.18 10.7 L24.79 10.07 L24.35 9.47 L23.88 8.91 L23.36 8.37 L22.81 7.88 L22.23 7.42 L21.62 7.01 L20.98 6.64 L20.31 6.32 L19.63 6.04 L18.92 5.81 L18.2 5.63 L17.48 5.5 L17.48 5.5 L18.2 5.64 L18.91 5.84 L19.6 6.1 L20.26 6.43 L20.88 6.82 L21.46 7.26 L21.99 7.75 L22.47 8.29 L22.89 8.87 L23.24 9.48 L23.53 10.11 L23.75 10.77 L23.9 11.44 L23.98 12.11 L23.98 12.78 L23.91 13.43 L23.77 14.06 L23.56 14.67 L23.28 15.23 L22.95 15.76 L22.55 16.23 L22.11 16.64 L21.62 16.99 L21.09 17.27 L20.53 17.47 L19.96 17.6 L19.37 17.64 L18.77 17.6 Z M 18.28 19.45 a 3.7 3.7 0 1 0 7.4 0 a 3.7 3.7 0 1 0 -7.4 0 Z"/>
      <path d="M6.82 21.3 L7.21 21.93 L7.65 22.53 L8.12 23.09 L8.64 23.63 L9.19 24.12 L9.77 24.58 L10.38 24.99 L11.02 25.36 L11.69 25.68 L12.37 25.96 L13.08 26.19 L13.8 26.37 L14.52 26.5 L15.26 26.57 L16 26.6 L16.74 26.57 L17.48 26.5 L18.2 26.37 L18.92 26.19 L19.63 25.96 L20.31 25.68 L20.98 25.36 L21.62 24.99 L22.23 24.58 L22.81 24.12 L23.36 23.63 L23.88 23.09 L24.35 22.53 L24.35 22.53 L23.87 23.09 L23.34 23.6 L22.77 24.07 L22.16 24.48 L21.51 24.82 L20.84 25.1 L20.15 25.32 L19.44 25.46 L18.73 25.53 L18.03 25.54 L17.33 25.47 L16.65 25.33 L16 25.12 L15.38 24.85 L14.8 24.52 L14.27 24.13 L13.79 23.69 L13.38 23.21 L13.02 22.69 L12.74 22.14 L12.53 21.56 L12.39 20.97 L12.33 20.37 L12.36 19.77 L12.46 19.19 L12.64 18.63 L12.9 18.09 L13.23 17.6 Z M 6.32 19.45 a 3.7 3.7 0 1 0 7.4 0 a 3.7 3.7 0 1 0 -7.4 0 Z"/>
      </g>
    </symbol>`;
  var AKI_TOSA_SYMBOL_MARKUP = `
    <symbol id="kamon-aki-tosa" viewBox="0 0 32 32">
      <title>土佐安芸家・三つ割剣花菱</title>
      <circle cx="16" cy="16" r="15" fill="#5b3a1e" stroke="#ffd700" stroke-width="1.5"/>
      <path d="M16 15 C13.1 10.4 13.1 10.4 14.4 6.3 L16 7.6 L17.6 6.3 C18.9 10.4 18.9 10.4 16 15 Z M16.87 16.5 C22.3 16.29 22.3 16.29 25.2 19.46 L23.27 20.2 L23.6 22.24 C19.4 21.31 19.4 21.31 16.87 16.5 Z M15.13 16.5 C12.6 21.31 12.6 21.31 8.4 22.24 L8.73 20.2 L6.8 19.46 C9.7 16.29 9.7 16.29 15.13 16.5 Z" fill="#ffffff"/>
      <path d="M25.87 10.3 L24.07 12.38 L18.35 15.28 L17.8 14.32 L23.17 10.82 Z M16 27.4 L15.1 24.8 L15.45 18.4 L16.55 18.4 L16.9 24.8 Z M6.13 10.3 L8.83 10.82 L14.2 14.32 L13.65 15.28 L7.93 12.38 Z" fill="#ffffff"/>
      <circle cx="16" cy="16" r="1.3" fill="#5b3a1e"/>
    </symbol>`;
  var MOTOYAMA_SYMBOL_MARKUP = `
    <symbol id="kamon-motoyama" viewBox="0 0 32 32">
      <title>本山家・檜扇</title>
      <defs>
      <clipPath id="kamon-motoyama-clip">
      <circle cx="16" cy="16" r="12.2"/>
      </clipPath>
      </defs>
      <circle cx="16" cy="16" r="15" fill="#7e57c2" stroke="#ffd700" stroke-width="1.5"/>
      <g clip-path="url(#kamon-motoyama-clip)">
      <path d="M13.2 22.95 L1.55 16.53 L3.27 14 L13.53 22.46 Z M13.6 22.39 L3.6 13.61 L5.82 11.52 L14.03 21.98 Z M14.11 21.92 L6.23 11.2 L8.84 9.63 L14.61 21.62 Z M14.7 21.57 L9.32 9.41 L12.2 8.44 L15.26 21.39 Z M15.36 21.36 L12.71 8.33 L15.74 8 L15.95 21.3 Z M16.05 21.3 L16.26 8 L19.29 8.33 L16.64 21.36 Z M16.74 21.39 L19.8 8.44 L22.68 9.41 L17.3 21.57 Z M17.39 21.62 L23.16 9.63 L25.77 11.2 L17.89 21.92 Z M17.97 21.98 L26.18 11.52 L28.4 13.61 L18.4 22.39 Z M18.47 22.46 L28.73 14 L30.45 16.53 L18.8 22.95 Z" fill="#ffffff"/>
      </g>
      <path d="M5.76 19.05 C4.56 21.45 6.36 23.65 5.36 26.05 M26.24 19.05 C27.44 21.45 25.64 23.65 26.64 26.05" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>
      <circle cx="16" cy="24.5" r="1.5" fill="#ffffff"/>
      <circle cx="16" cy="24.5" r="0.6" fill="#7e57c2"/>
    </symbol>`;
  var TAKATO_SYMBOL_MARKUP = `
    <symbol id="kamon-takato-kajinoha" viewBox="0 0 32 32">
      <title>高遠家・梶の葉</title>
      <circle cx="16" cy="16" r="15" fill="#c77dce" stroke="#ffd700" stroke-width="1.5"/>
      <path d="M16 4.6 C17.6 6.6 18.4 8.6 18.2 10.4 C19.6 9.2 21.6 8.9 23.6 9.6 C22.9 11.6 21.6 13 20 13.8 C21.8 14 23.6 15.2 24.6 17 C22.7 17.9 20.6 17.9 19 17.2 C19.6 19 19.2 21 17.8 22.6 L16 23.2 L14.2 22.6 C12.8 21 12.4 19 13 17.2 C11.4 17.9 9.3 17.9 7.4 17 C8.4 15.2 10.2 14 12 13.8 C10.4 13 9.1 11.6 8.4 9.6 C10.4 8.9 12.4 9.2 13.8 10.4 C13.6 8.6 14.4 6.6 16 4.6 Z" fill="#ffffff"/>
      <path d="M16 7 L16 22.4 M16 14 L21.6 10.6 M16 14 L10.4 10.6 M16 17.4 L22.4 16.6 M16 17.4 L9.6 16.6" fill="none" stroke="#c77dce" stroke-width="0.7" stroke-linecap="round"/>
      <path d="M16 22.8 C16 24.6 15.4 26 14.4 27.2" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
    </symbol>`;
  var OYAMA_SYMBOL_MARKUP = `
    <symbol id="kamon-oyama-tomoe" viewBox="0 0 32 32">
      <title>小山家・左二つ巴</title>
      <circle cx="16" cy="16" r="15" fill="#d9822b" stroke="#ffd700" stroke-width="1.5"/>
      <g fill="#ffffff">
      <path d="M16 5.4 L14.91 5.46 L13.83 5.62 L12.78 5.9 L11.76 6.28 L10.79 6.77 L9.87 7.36 L9.01 8.03 L8.23 8.79 L7.53 9.63 L6.92 10.53 L6.41 11.49 L5.99 12.5 L5.69 13.54 L5.49 14.62 L5.4 15.7 L5.43 16.79 L5.57 17.87 L5.81 18.93 L6.17 19.96 L6.63 20.95 L7.19 21.89 L7.84 22.76 L8.58 23.57 L9.39 24.29 L10.28 24.92 L11.22 25.46 L12.22 25.9 L13.26 26.24 L13.26 26.24 L12.22 25.89 L11.24 25.42 L10.33 24.83 L9.51 24.14 L8.78 23.36 L8.16 22.49 L7.66 21.57 L7.29 20.6 L7.05 19.61 L6.94 18.61 L6.96 17.62 L7.11 16.67 L7.39 15.76 L7.77 14.92 L8.26 14.16 L8.83 13.49 L9.48 12.93 L10.18 12.49 L10.92 12.17 L11.67 11.98 L12.42 11.92 L13.15 11.99 L13.84 12.18 L14.46 12.48 L15.01 12.89 L15.46 13.39 L15.79 13.97 L16 14.6 Z M 11.4 10 a 4.6 4.6 0 1 0 9.2 0 a 4.6 4.6 0 1 0 -9.2 0 Z"/>
      <path d="M16 26.6 L17.09 26.54 L18.17 26.38 L19.22 26.1 L20.24 25.72 L21.21 25.23 L22.13 24.64 L22.99 23.97 L23.77 23.21 L24.47 22.37 L25.08 21.47 L25.59 20.51 L26.01 19.5 L26.31 18.46 L26.51 17.38 L26.6 16.3 L26.57 15.21 L26.43 14.13 L26.19 13.07 L25.83 12.04 L25.37 11.05 L24.81 10.11 L24.16 9.24 L23.42 8.43 L22.61 7.71 L21.72 7.08 L20.78 6.54 L19.78 6.1 L18.74 5.76 L18.74 5.76 L19.78 6.11 L20.76 6.58 L21.67 7.17 L22.49 7.86 L23.22 8.64 L23.84 9.51 L24.34 10.43 L24.71 11.4 L24.95 12.39 L25.06 13.39 L25.04 14.38 L24.89 15.33 L24.61 16.24 L24.23 17.08 L23.74 17.84 L23.17 18.51 L22.52 19.07 L21.82 19.51 L21.08 19.83 L20.33 20.02 L19.58 20.08 L18.85 20.01 L18.16 19.82 L17.54 19.52 L16.99 19.11 L16.54 18.61 L16.21 18.03 L16 17.4 Z M 11.4 22 a 4.6 4.6 0 1 0 9.2 0 a 4.6 4.6 0 1 0 -9.2 0 Z"/>
      </g>
    </symbol>`;
  var NANJO_SYMBOL_MARKUP = `
    <symbol id="kamon-nanjo" viewBox="0 0 32 32"><title>南条家（文字紋）</title><circle cx="16" cy="16" r="15" fill="#b9770e" stroke="#ffd700" stroke-width="1.5"/><circle cx="16" cy="16" r="11.8" fill="none" stroke="#ffffff" stroke-width="1.1"/><text x="16" y="21.2" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff" font-family="serif">南</text></symbol>`;
  var SAITO_SYMBOL_MARKUP = `
    <symbol id="kamon-saito" data-v="2" viewBox="0 0 32 32">
      <title>斎藤家・二頭立浪</title>
      <circle cx="16" cy="16" r="15" fill="#73787c" stroke="#ffd700" stroke-width="1.5"/>
      <g fill="#ffffff">
        <path d="M 6.0,18.4 C 4.8,13.2 7.6,7.4 13.4,5.8 C 16.8,4.9 20.2,6.0 21.8,8.1 C 20.1,7.8 18.7,8.3 18.0,9.4 C 19.4,9.3 20.5,9.9 21.0,11.0 C 19.3,10.8 17.8,11.3 16.8,12.3 C 15.6,10.8 13.5,10.3 11.6,11.4 C 9.6,12.6 9.1,15.5 10.5,18.0 C 12.1,20.8 15.8,22.0 19.4,21.0 C 22.2,20.2 24.4,18.0 25.6,15.2 C 26.2,18.8 24.1,22.8 20.4,24.8 C 15.2,27.5 8.2,24.6 6.0,18.4 Z"/>
        <path d="M 25.7,16.8 C 26.6,12.8 24.8,9.2 22.0,7.8 C 23.0,9.6 23.0,11.8 21.8,13.4 C 20.5,15.1 18.2,15.6 16.2,14.8 C 17.0,13.8 16.8,12.7 15.8,12.1 C 14.5,12.5 13.2,13.5 12.6,14.9 C 13.8,14.8 14.8,15.3 15.2,16.2 C 13.8,16.3 12.7,17.0 12.2,18.1 C 14.2,19.6 17.4,20.1 20.2,19.2 C 22.8,18.4 24.7,17.8 25.7,16.8 Z"/>
        <circle cx="22.4" cy="6.9" r="0.95"/>
        <circle cx="11.8" cy="13.8" r="0.85"/>
      </g>
      <g fill="none" stroke="#73787c" stroke-width="0.9" stroke-linecap="round">
        <path d="M 7.7,17.6 C 6.9,13.2 9.4,8.6 14.2,7.4 C 16.4,6.8 18.4,7.3 19.8,8.4"/>
        <path d="M 8.9,19.8 C 10.6,23.6 15.6,25.2 19.8,23.2 C 22.2,22.0 23.9,19.9 24.6,17.5"/>
        <path d="M 24.2,11.2 C 24.0,13.8 22.1,16.2 19.2,17.0 C 17.2,17.5 15.3,17.2 13.9,16.4"/>
      </g>
    </symbol>`;
  var TAKIGAWA_SYMBOL_MARKUP = `
    <symbol id="kamon-takigawa" viewBox="0 0 32 32">
      <title>滝川家・丸に竪木瓜</title>
      <circle cx="16" cy="16" r="15" fill="#2c5e8a" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="11.8" fill="none" stroke="#ffffff" stroke-width="1.5"/>
      <g fill="none" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 13.2,9.2 C 13.8,6.8 18.2,6.8 18.8,9.2 C 21.2,9.8 21.8,14.2 19.8,16.0 C 21.8,17.8 21.2,22.2 18.8,22.8 C 18.2,25.2 13.8,25.2 13.2,22.8 C 10.8,22.2 10.2,17.8 12.2,16.0 C 10.2,14.2 10.8,9.8 13.2,9.2 Z"/>
      </g>
      <ellipse cx="16" cy="16" rx="2.6" ry="4.4" fill="none" stroke="#ffffff" stroke-width="1.1"/>
      <circle cx="16" cy="13.8" r="0.9" fill="#ffffff"/>
      <circle cx="16" cy="18.2" r="0.9" fill="#ffffff"/>
    </symbol>`;
  function addToSource() {
    if (!window.KAMONS_SVG_CONTENT) return;
    [
      ['kamon-gamo', '#2f5f9e'],
      ['kamon-todo', '#d5d8dc'],
      ['kamon-yamanouchi', '#365a9c'],
      ['kamon-fukui', '#8a4a36'],
      ['kamon-okayama', '#3f5c9a'],
      ['kamon-tottori', '#7a5a90'],
      ['kamon-matsue', '#2f6f68'],
      ['kamon-nagaoka', '#643e21'],
      ['kamon-kuwana', '#5d6d7e'],
      ['kamon-saito', '#73787c']
    ].forEach(function ([symbolId, color]) {
      var pattern = new RegExp(`(<symbol id="${symbolId}"[\\s\\S]*?<circle\\b[^>]*\\bfill=")[^"]+`);
      window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace(pattern, `$1${color}`);
    });
    [[SYMBOL_ID, SYMBOL_MARKUP], [KUMAMOTO_HOSOKAWA_SYMBOL_ID, KUMAMOTO_HOSOKAWA_SYMBOL_MARKUP], [AKO_RONIN_SYMBOL_ID, AKO_RONIN_SYMBOL_MARKUP], [SAKAI_SYMBOL_ID, SAKAI_SYMBOL_MARKUP], [UWAJIMA_DATE_SYMBOL_ID, UWAJIMA_DATE_SYMBOL_MARKUP], [ANDO_SYMBOL_ID, ANDO_SYMBOL_MARKUP], [NIWA_SYMBOL_ID, NIWA_SYMBOL_MARKUP], [GOTO_SYMBOL_ID, GOTO_SYMBOL_MARKUP], [SUWA_SYMBOL_ID, SUWA_SYMBOL_MARKUP], [SENGOKU_SYMBOL_ID, SENGOKU_SYMBOL_MARKUP], [ICHIJO_SYMBOL_ID, ICHIJO_SYMBOL_MARKUP], [CHOSOKABE_SYMBOL_ID, CHOSOKABE_SYMBOL_MARKUP], [BESSHO_SYMBOL_ID, BESSHO_SYMBOL_MARKUP], [SHIINA_SYMBOL_ID, SHIINA_SYMBOL_MARKUP], [SANO_SYMBOL_ID, SANO_SYMBOL_MARKUP], [AKI_TOSA_SYMBOL_ID, AKI_TOSA_SYMBOL_MARKUP], [MOTOYAMA_SYMBOL_ID, MOTOYAMA_SYMBOL_MARKUP], [TAKATO_SYMBOL_ID, TAKATO_SYMBOL_MARKUP], [OYAMA_SYMBOL_ID, OYAMA_SYMBOL_MARKUP], [NANJO_SYMBOL_ID, NANJO_SYMBOL_MARKUP], [SAITO_SYMBOL_ID, SAITO_SYMBOL_MARKUP], [TAKIGAWA_SYMBOL_ID, TAKIGAWA_SYMBOL_MARKUP], [TODO_SYMBOL_ID, TODO_SYMBOL_MARKUP]].forEach(function ([symbolId, markup]) {
      if (symbolId === SENGOKU_SYMBOL_ID || symbolId === SAITO_SYMBOL_ID) window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace(new RegExp(`<symbol id="${symbolId}"[\\s\\S]*?</symbol>`), '');
      if (window.KAMONS_SVG_CONTENT.indexOf(`id="${symbolId}"`) === -1) {
        window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace('</defs>', `${markup}\n</defs>`);
      }
    });
  }

  function addToDocument() {
    if (typeof document === 'undefined') return;
    [
      ['kamon-gamo', '#2f5f9e'],
      ['kamon-todo', '#d5d8dc'],
      ['kamon-yamanouchi', '#365a9c'],
      ['kamon-fukui', '#8a4a36'],
      ['kamon-okayama', '#3f5c9a'],
      ['kamon-tottori', '#7a5a90'],
      ['kamon-matsue', '#2f6f68'],
      ['kamon-nagaoka', '#643e21'],
      ['kamon-kuwana', '#5d6d7e'],
      ['kamon-saito', '#73787c']
    ].forEach(function ([symbolId, color]) {
      var symbol = document.getElementById(symbolId);
      var outerCircle = symbol && (symbol.querySelector('circle[r="15"]') || symbol.querySelector('circle'));
      if (outerCircle) outerCircle.setAttribute('fill', color);
    });
    var defs = document.getElementById('mapSvgDefs') || document.querySelector('#kamonsGlobalContainer defs');
    if (!defs) return;
    [[SYMBOL_ID, SYMBOL_MARKUP], [KUMAMOTO_HOSOKAWA_SYMBOL_ID, KUMAMOTO_HOSOKAWA_SYMBOL_MARKUP], [AKO_RONIN_SYMBOL_ID, AKO_RONIN_SYMBOL_MARKUP], [SAKAI_SYMBOL_ID, SAKAI_SYMBOL_MARKUP], [UWAJIMA_DATE_SYMBOL_ID, UWAJIMA_DATE_SYMBOL_MARKUP], [ANDO_SYMBOL_ID, ANDO_SYMBOL_MARKUP], [NIWA_SYMBOL_ID, NIWA_SYMBOL_MARKUP], [GOTO_SYMBOL_ID, GOTO_SYMBOL_MARKUP], [SUWA_SYMBOL_ID, SUWA_SYMBOL_MARKUP], [SENGOKU_SYMBOL_ID, SENGOKU_SYMBOL_MARKUP], [ICHIJO_SYMBOL_ID, ICHIJO_SYMBOL_MARKUP], [CHOSOKABE_SYMBOL_ID, CHOSOKABE_SYMBOL_MARKUP], [BESSHO_SYMBOL_ID, BESSHO_SYMBOL_MARKUP], [SHIINA_SYMBOL_ID, SHIINA_SYMBOL_MARKUP], [SANO_SYMBOL_ID, SANO_SYMBOL_MARKUP], [AKI_TOSA_SYMBOL_ID, AKI_TOSA_SYMBOL_MARKUP], [MOTOYAMA_SYMBOL_ID, MOTOYAMA_SYMBOL_MARKUP], [TAKATO_SYMBOL_ID, TAKATO_SYMBOL_MARKUP], [OYAMA_SYMBOL_ID, OYAMA_SYMBOL_MARKUP], [NANJO_SYMBOL_ID, NANJO_SYMBOL_MARKUP], [SAITO_SYMBOL_ID, SAITO_SYMBOL_MARKUP], [TAKIGAWA_SYMBOL_ID, TAKIGAWA_SYMBOL_MARKUP], [TODO_SYMBOL_ID, TODO_SYMBOL_MARKUP]].forEach(function ([symbolId, markup]) {
      var old = document.getElementById(symbolId);
      if (old && (symbolId === SENGOKU_SYMBOL_ID || symbolId === SAITO_SYMBOL_ID) && old.getAttribute('data-v') !== '2') old.parentNode.removeChild(old);
      else if (old) return;
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
