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
  var AINU_PATTERN_SYMBOL_ID = 'kamon-ainu-pattern';
  var GORYOKAKU_SYMBOL_ID = 'kamon-goryokaku';
  var ENOMOTO_SYMBOL_ID = 'kamon-enomoto';
  var MIMURA_SYMBOL_ID = 'kamon-mimura';
  var AKIZUKI_SYMBOL_ID = 'kamon-akizuki';
  var KONISHI_SYMBOL_ID = 'kamon-konishi';
  var AKIZUKI_SYMBOL_MARKUP = `
    <symbol id="kamon-akizuki" viewBox="0 0 32 32">
      <title>秋月家・撫子紋（なでしこもん）</title>
      <circle cx="16" cy="16" r="15" fill="#6c3483" stroke="#ffd700" stroke-width="1.5"></circle>
      <path transform="rotate(0 16 16)" d="M16 16 C13.6 13.4 13.2 9.8 14.2 7.4 L15.1 8.6 L16 7 L16.9 8.6 L17.8 7.4 C18.8 9.8 18.4 13.4 16 16 Z" fill="#ffffff"></path><path transform="rotate(72 16 16)" d="M16 16 C13.6 13.4 13.2 9.8 14.2 7.4 L15.1 8.6 L16 7 L16.9 8.6 L17.8 7.4 C18.8 9.8 18.4 13.4 16 16 Z" fill="#ffffff"></path><path transform="rotate(144 16 16)" d="M16 16 C13.6 13.4 13.2 9.8 14.2 7.4 L15.1 8.6 L16 7 L16.9 8.6 L17.8 7.4 C18.8 9.8 18.4 13.4 16 16 Z" fill="#ffffff"></path><path transform="rotate(216 16 16)" d="M16 16 C13.6 13.4 13.2 9.8 14.2 7.4 L15.1 8.6 L16 7 L16.9 8.6 L17.8 7.4 C18.8 9.8 18.4 13.4 16 16 Z" fill="#ffffff"></path><path transform="rotate(288 16 16)" d="M16 16 C13.6 13.4 13.2 9.8 14.2 7.4 L15.1 8.6 L16 7 L16.9 8.6 L17.8 7.4 C18.8 9.8 18.4 13.4 16 16 Z" fill="#ffffff"></path>
      <circle cx="16" cy="16" r="2.2" fill="#ffd700"></circle>
    </symbol>
  `;
  var KONISHI_SYMBOL_MARKUP = `
    <symbol id="kamon-konishi" viewBox="0 0 32 32">
      <title>小西家・中結び祇園守（なかむすびぎおんまもり）</title>
      <circle cx="16" cy="16" r="15" fill="#b03a2e" stroke="#ffd700" stroke-width="1.5"></circle>
      <g transform="rotate(45 16 16)"><rect x="14" y="6" width="4" height="20" rx="1.2" fill="#ffffff"></rect><path d="M12.6 6.2 h6.8 M12.6 25.8 h6.8" stroke="#ffffff" stroke-width="1.6"></path></g>
      <g transform="rotate(-45 16 16)"><rect x="14" y="6" width="4" height="20" rx="1.2" fill="#ffffff"></rect><path d="M12.6 6.2 h6.8 M12.6 25.8 h6.8" stroke="#ffffff" stroke-width="1.6"></path></g>
      <rect x="12.4" y="14.3" width="7.2" height="3.4" rx="0.8" fill="#ffd700"></rect>
      <path d="M16 11.8 v8.4 M13.2 16 h5.6" stroke="#b03a2e" stroke-width="1.1"></path>
    </symbol>
  `;
  var GORYOKAKU_SYMBOL_MARKUP = `
    <symbol id="kamon-goryokaku" viewBox="0 0 32 32">
      <title>蝦夷共和国・五稜郭（新選組・誠）</title>
      <use href="#kamon-shinsengumi"/>
    </symbol>`;
  var ENOMOTO_SYMBOL_MARKUP = `
    <symbol id="kamon-enomoto" viewBox="0 0 32 32">
      <title>榎本家（五稜郭・新選組）</title>
      <use href="#kamon-shinsengumi"/>
    </symbol>`;
  var MIMURA_SYMBOL_MARKUP = `
    <symbol id="kamon-mimura" viewBox="0 0 32 32">
      <title>三村家・丸に二引両</title>
      <circle cx="16" cy="16" r="15" fill="#6e3448" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12.3" fill="none" stroke="#ffffff" stroke-width="1.4"/>
      <rect x="6" y="11" width="20" height="3" rx="0.6" fill="#ffffff"/>
      <rect x="6" y="18" width="20" height="3" rx="0.6" fill="#ffffff"/>
    </symbol>`;
  var AINU_PATTERN_SYMBOL_MARKUP = `
    <symbol id="kamon-ainu-pattern" viewBox="0 0 32 32">
      <title>蝦夷諸部族・アイヌ文様</title>
      <circle cx="16" cy="16" r="15" fill="#1f5f8b" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12.8" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>
      <g fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 16,6.2 L 16,8.5 M 14.3,7.6 L 16,6.2 L 17.7,7.6" stroke-width="1.4"/>
        <path d="M 16,8.5 C 13.2,8.5 10.2,10.2 10.2,13.2 C 10.2,15.2 11.8,16.2 13.5,15.5 C 14.5,15.0 14.8,13.8 14.0,13.2 C 13.2,12.6 12.2,13.5 12.5,14.2"/>
        <path d="M 16,8.5 C 18.8,8.5 21.8,10.2 21.8,13.2 C 21.8,15.2 20.2,16.2 18.5,15.5 C 17.5,15.0 17.2,13.8 18.0,13.2 C 18.8,12.6 19.8,13.5 19.5,14.2"/>
        <path d="M 16,25.8 L 16,23.5 M 14.3,24.4 L 16,25.8 L 17.7,24.4" stroke-width="1.4"/>
        <path d="M 16,23.5 C 13.2,23.5 10.2,21.8 10.2,18.8 C 10.2,16.8 11.8,15.8 13.5,16.5 C 14.5,17.0 14.8,18.2 14.0,18.8 C 13.2,19.4 12.2,18.5 12.5,17.8"/>
        <path d="M 16,23.5 C 18.8,23.5 21.8,21.8 21.8,18.8 C 21.8,16.8 20.2,15.8 18.5,16.5 C 17.5,17.0 17.2,18.2 18.0,18.8 C 18.8,19.4 19.8,18.5 19.5,17.8"/>
        <path d="M 6.2,16 L 8.5,16 M 7.6,14.3 L 6.2,16 L 7.6,17.7" stroke-width="1.4"/>
        <path d="M 25.8,16 L 23.5,16 M 24.4,14.3 L 25.8,16 L 24.4,17.7" stroke-width="1.4"/>
        <path d="M 8.5,16 C 8.5,13.2 10.2,11.2 12.5,11.2"/>
        <path d="M 8.5,16 C 8.5,18.8 10.2,20.8 12.5,20.8"/>
        <path d="M 23.5,16 C 23.5,13.2 21.8,11.2 19.5,11.2"/>
        <path d="M 23.5,16 C 23.5,18.8 21.8,20.8 19.5,20.8"/>
      </g>
      <polygon points="16,13.5 18.5,16 16,18.5 13.5,16" fill="#ffd700" stroke="#ffffff" stroke-width="0.8"/>
      <circle cx="16" cy="16" r="1.0" fill="#1f5f8b"/>
    </symbol>`;

  var MATSUNAGA_SYMBOL_ID = 'kamon-matsunaga';
  var MATSUNAGA_SYMBOL_MARKUP = `
<symbol id="kamon-matsunaga" viewBox="0 0 32 32">
      <title>松永家・蔦紋（つたもん）</title>
      <circle cx="16" cy="16" r="15" fill="#2d7a46" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffd700" stroke-width="1.1"/>
      
      <!-- 蔦の巻き蔓（下部の巻きひげ） -->
      <path d="M16 23 C15.5 24.5 14.5 25.8 13.0 25.8 C11.5 25.8 10.8 24.5 11.4 23.2 C11.8 22.2 13.0 22.2 13.2 23.2 C13.4 23.8 12.8 24.2 12.4 23.8" fill="none" stroke="#ffd700" stroke-width="0.75" stroke-linecap="round"/>
      <path d="M16 23 C16.5 24.5 17.5 25.8 19.0 25.8 C20.5 25.8 21.2 24.5 20.6 23.2 C20.2 22.2 19.0 22.2 18.8 23.2 C18.6 23.8 19.2 24.2 19.6 23.8" fill="none" stroke="#ffd700" stroke-width="0.75" stroke-linecap="round"/>
      <!-- 下部主茎 -->
      <path d="M16 24.8 L16 18.5" stroke="#ffd700" stroke-width="1.3" stroke-linecap="round"/>
      
      <!-- 蔦の実（3つの果実と花柄） -->
      <path d="M16 11.2 L16 7.2 M16 10.5 L12.8 8.8 M16 10.5 L19.2 8.8" fill="none" stroke="#ffd700" stroke-width="0.7" stroke-linecap="round"/>
      <circle cx="16" cy="6.6" r="1.15" fill="#ffd700"/>
      <circle cx="12.2" cy="8.4" r="1.0" fill="#ffd700"/>
      <circle cx="19.8" cy="8.4" r="1.0" fill="#ffd700"/>

      <!-- 蔦の三枚葉（白面＋深緑輪郭） -->
      <g fill="#ffffff" stroke="#2d7a46" stroke-width="0.45" stroke-linejoin="round">
        <!-- 中央主葉（掌状三裂・上部に凛と立つ） -->
        <path d="M16 8.2 
                 C16.8 10.2 18.5 10.8 19.6 10.6 
                 C18.8 12.0 18.6 13.4 19.4 14.6 
                 C18.2 15.0 17.0 16.2 16.0 18.2 
                 C15.0 16.2 13.8 15.0 12.6 14.6 
                 C13.4 13.4 13.2 12.0 12.4 10.6 
                 C13.5 10.8 15.2 10.2 16 8.2 Z"/>
                 
        <!-- 左側葉（左斜め下へ三裂展開） -->
        <path d="M14.2 17.0 
                 C13.2 15.4 11.2 14.6 9.5 15.0 
                 C10.0 16.4 9.2 17.6 7.6 18.4 
                 C8.8 19.6 9.6 21.2 11.2 21.8 
                 C12.0 20.2 13.2 19.2 15.0 18.8 Z"/>
                 
        <!-- 右側葉（右斜め下へ三裂展開） -->
        <path d="M17.8 17.0 
                 C18.8 15.4 20.8 14.6 22.5 15.0 
                 C22.0 16.4 22.8 17.6 24.4 18.4 
                 C23.2 19.6 22.4 21.2 20.8 21.8 
                 C20.0 20.2 18.8 19.2 17.0 18.8 Z"/>
      </g>
      
      <!-- 葉脈（繊細な主脈・側脈） -->
      <g fill="none" stroke="#2d7a46" stroke-width="0.6" stroke-linecap="round">
        <!-- 主葉脈 -->
        <path d="M16 17.5 L16 10.0"/>
        <path d="M16 14.2 L18.0 12.2"/>
        <path d="M16 14.2 L14.0 12.2"/>
        <!-- 左葉脈 -->
        <path d="M14.2 17.6 L9.6 18.0"/>
        <path d="M12.2 17.7 L10.8 16.2"/>
        <path d="M12.2 17.7 L11.0 19.8"/>
        <!-- 右葉脈 -->
        <path d="M17.8 17.6 L22.4 18.0"/>
        <path d="M19.8 17.7 L21.2 16.2"/>
        <path d="M19.8 17.7 L21.0 19.8"/>
      </g>
      
      <!-- 葉の結束点（ゴールドアクセント） -->
      <circle cx="16" cy="18.0" r="0.9" fill="#ffd700"/>
    </symbol>`;
  var KIMOTSUKI_SYMBOL_ID = 'kamon-kimotsuki';
  var KIMOTSUKI_SYMBOL_MARKUP = `
<symbol id="kamon-kimotsuki" viewBox="0 0 32 32">
      <title>肝付家・対い鶴喰若松三つ雁金（むかいづるくいはかまつみつかりがね）</title>
      <circle cx="16" cy="16" r="15" fill="#2e7d32" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12.3" fill="none" stroke="#ffffff" stroke-width="1.2"/>
      
      <!-- 1. 中央喰若松（向かい合う鶴が嘴にくわえる若松） -->
      <g stroke="#ffd700" stroke-linecap="round">
        <!-- 若松の主幹 -->
        <path d="M16 7.2 L16 14.5" stroke-width="1.1" fill="none"/>
        <!-- 若松の松葉対 -->
        <path d="M16 8.5 C14.5 7.2 13.0 7.5 11.8 8.8 M16 8.5 C17.5 7.2 19.0 7.5 20.2 8.8" stroke-width="0.75" fill="none"/>
        <path d="M16 10.0 C14.2 9.0 12.8 9.8 11.6 11.2 M16 10.0 C17.8 9.0 19.2 9.8 20.4 11.2" stroke-width="0.75" fill="none"/>
        <path d="M16 11.6 C14.5 11.0 13.5 12.0 12.2 13.2 M16 11.6 C17.5 11.0 18.5 12.0 19.8 13.2" stroke-width="0.75" fill="none"/>
      </g>
      <!-- 若松の芽（頂点） -->
      <circle cx="16" cy="6.8" r="0.85" fill="#ffd700"/>

      <!-- 2. 二羽の対い鶴（左右対称に向かい合い若松をくわえる） -->
      <!-- 左鶴 -->
      <g id="tsuru-l">
        <!-- 嘴（若松をくわえ込む） -->
        <path d="M12.0 10.8 L15.5 11.6 L12.2 11.9 Z" fill="#ffd700"/>
        <!-- 鶴の胴体・首・頭部（白） -->
        <path d="M11.4 10.2 
                 C10.6 9.0 9.6 9.4 9.0 10.4 
                 C8.4 11.5 8.8 13.0 8.0 14.5 
                 C7.0 16.2 5.8 18.5 6.4 21.4 
                 C7.4 20.2 8.6 19.0 9.0 17.2 
                 C9.6 19.2 10.4 21.2 11.4 22.8 
                 C11.6 20.8 11.6 18.8 11.2 16.8 
                 C11.8 15.2 11.6 13.6 11.0 12.2 
                 C11.6 12.0 12.0 11.2 11.4 10.2 Z" 
              fill="#ffffff" stroke="#2e7d32" stroke-width="0.4"/>
        <!-- 翼の羽先（外周円に沿う風切羽） -->
        <path d="M6.6 16.8 C5.6 18.8 5.6 21.8 7.0 23.8 C7.6 22.2 8.4 20.6 8.8 19.2 Z" fill="#ffffff"/>
        <!-- 丹頂（頭頂の鮮やかな赤） -->
        <circle cx="10.0" cy="9.6" r="0.8" fill="#d32f2f"/>
        <!-- 目 -->
        <circle cx="10.6" cy="10.6" r="0.35" fill="#2e7d32"/>
      </g>

      <!-- 右鶴 -->
      <g id="tsuru-r">
        <!-- 嘴（若松をくわえ込む） -->
        <path d="M20.0 10.8 L16.5 11.6 L19.8 11.9 Z" fill="#ffd700"/>
        <!-- 鶴の胴体・首・頭部（白） -->
        <path d="M20.6 10.2 
                 C21.4 9.0 22.4 9.4 23.0 10.4 
                 C23.6 11.5 23.2 13.0 24.0 14.5 
                 C25.0 16.2 26.2 18.5 25.6 21.4 
                 C24.6 20.2 23.4 19.0 23.0 17.2 
                 C22.4 19.2 21.6 21.2 20.6 22.8 
                 C20.4 20.8 20.4 18.8 20.8 16.8 
                 C20.2 15.2 20.4 13.6 21.0 12.2 
                 C20.4 12.0 20.0 11.2 20.6 10.2 Z" 
              fill="#ffffff" stroke="#2e7d32" stroke-width="0.4"/>
        <!-- 翼の羽先 -->
        <path d="M25.4 16.8 C26.4 18.8 26.4 21.8 25.0 23.8 C24.4 22.2 23.6 20.6 23.2 19.2 Z" fill="#ffffff"/>
        <!-- 丹頂 -->
        <circle cx="22.0" cy="9.6" r="0.8" fill="#d32f2f"/>
        <!-- 目 -->
        <circle cx="21.4" cy="10.6" r="0.35" fill="#2e7d32"/>
      </g>

      <!-- 3. 三つ雁金（中央下部に端正に配された3羽の伝統雁金紋） -->
      <!-- 雁金1（上中央） -->
      <g transform="translate(16 16.2)">
        <!-- 嘴（金） -->
        <path d="M-1.5 -0.3 L0 -1.1 L-0.4 0.3 Z" fill="#ffd700"/>
        <!-- 雁金の丸い頭と結び羽（白） -->
        <path d="M-0.2 -0.9 C0.9 -1.4 2.0 -0.7 2.0 0.4 C2.0 1.5 0.9 2.2 -0.2 1.7 C-1.1 1.3 -1.3 0.0 -0.2 -0.9 Z" fill="#ffffff"/>
        <!-- つぶらな目（背景抜き丸） -->
        <circle cx="0.4" cy="0.2" r="0.35" fill="#2e7d32"/>
      </g>

      <!-- 雁金2（左下） -->
      <g transform="translate(13.2 21.0)">
        <path d="M-1.5 -0.3 L0 -1.1 L-0.4 0.3 Z" fill="#ffd700"/>
        <path d="M-0.2 -0.9 C0.9 -1.4 2.0 -0.7 2.0 0.4 C2.0 1.5 0.9 2.2 -0.2 1.7 C-1.1 1.3 -1.3 0.0 -0.2 -0.9 Z" fill="#ffffff"/>
        <circle cx="0.4" cy="0.2" r="0.35" fill="#2e7d32"/>
      </g>

      <!-- 雁金3（右下、右向きの嘴で対をなす） -->
      <g transform="translate(18.8 21.0)">
        <path d="M1.5 -0.3 L0 -1.1 L0.4 0.3 Z" fill="#ffd700"/>
        <path d="M0.2 -0.9 C-0.9 -1.4 -2.0 -0.7 -2.0 0.4 C-2.0 1.5 -0.9 2.2 0.2 1.7 C1.1 1.3 1.3 0.0 0.2 -0.9 Z" fill="#ffffff"/>
        <circle cx="-0.4" cy="0.2" r="0.35" fill="#2e7d32"/>
      </g>
    </symbol>`;

  var TAKIGAWA_SYMBOL_ID = 'kamon-takigawa';
  var TODO_SYMBOL_ID = 'kamon-todo-tsuta';
  var TODO_SYMBOL_MARKUP = `
    <symbol id="kamon-todo-tsuta" viewBox="0 0 32 32">
      <title>藤堂家・藤堂蔦</title>
      <circle cx="16" cy="16" r="15" fill="#7b8791" stroke="#4b5563" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffffff" stroke-width="1.1"/>
      <g fill="#ffffff" stroke="#7b8791" stroke-width="0.55" stroke-linejoin="round">
        <g transform="translate(16 16.6)">
          <path d="M0 1.4 C-2.8 0.7 -4.2 -1.8 -3.3 -4.2 C-2.5 -6.2 -1.1 -7.8 0 -10.1 C1.1 -7.8 2.5 -6.2 3.3 -4.2 C4.2 -1.8 2.8 0.7 0 1.4 Z"/>
          <path d="M0 0.2 V-8.2 M0-4.1 L-1.9-5.7 M0-4.1 L1.9-5.7 M0-1.9 L-2.35-3.1 M0-1.9 L2.35-3.1" fill="none" stroke="#7b8791" stroke-width="0.72" stroke-linecap="round"/>
        </g>
        <g transform="translate(16 16.6) rotate(120)">
          <path d="M0 1.4 C-2.8 0.7 -4.2 -1.8 -3.3 -4.2 C-2.5 -6.2 -1.1 -7.8 0 -10.1 C1.1 -7.8 2.5 -6.2 3.3 -4.2 C4.2 -1.8 2.8 0.7 0 1.4 Z"/>
          <path d="M0 0.2 V-8.2 M0-4.1 L-1.9-5.7 M0-4.1 L1.9-5.7 M0-1.9 L-2.35-3.1 M0-1.9 L2.35-3.1" fill="none" stroke="#7b8791" stroke-width="0.72" stroke-linecap="round"/>
        </g>
        <g transform="translate(16 16.6) rotate(240)">
          <path d="M0 1.4 C-2.8 0.7 -4.2 -1.8 -3.3 -4.2 C-2.5 -6.2 -1.1 -7.8 0 -10.1 C1.1 -7.8 2.5 -6.2 3.3 -4.2 C4.2 -1.8 2.8 0.7 0 1.4 Z"/>
          <path d="M0 0.2 V-8.2 M0-4.1 L-1.9-5.7 M0-4.1 L1.9-5.7 M0-1.9 L-2.35-3.1 M0-1.9 L2.35-3.1" fill="none" stroke="#7b8791" stroke-width="0.72" stroke-linecap="round"/>
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
      ['kamon-todo', '#7b8791'],
      ['kamon-takeda', '#ea5424'],
      ['kamon-matsunaga', '#2d7a46'],
      ['kamon-yamanouchi', '#365a9c'],
      ['kamon-fukui', '#8a4a36'],
      ['kamon-okayama', '#3f5c9a'],
      ['kamon-tottori', '#7a5a90'],
      ['kamon-matsue', '#2f6f68'],
      ['kamon-nagaoka', '#643e21'],
      ['kamon-kuwana', '#5d6d7e'],
      ['kamon-saito', '#73787c'],
      ['kamon-ainu-pattern', '#1f5f8b']
    ].forEach(function ([symbolId, color]) {
      var pattern = new RegExp(`(<symbol id="${symbolId}"[\\s\\S]*?<circle\\b[^>]*\\bfill=")[^"]+`);
      window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace(pattern, `$1${color}`);
    });
    [[SYMBOL_ID, SYMBOL_MARKUP], [KUMAMOTO_HOSOKAWA_SYMBOL_ID, KUMAMOTO_HOSOKAWA_SYMBOL_MARKUP], [AKO_RONIN_SYMBOL_ID, AKO_RONIN_SYMBOL_MARKUP], [SAKAI_SYMBOL_ID, SAKAI_SYMBOL_MARKUP], [UWAJIMA_DATE_SYMBOL_ID, UWAJIMA_DATE_SYMBOL_MARKUP], [ANDO_SYMBOL_ID, ANDO_SYMBOL_MARKUP], [NIWA_SYMBOL_ID, NIWA_SYMBOL_MARKUP], [GOTO_SYMBOL_ID, GOTO_SYMBOL_MARKUP], [SUWA_SYMBOL_ID, SUWA_SYMBOL_MARKUP], [SENGOKU_SYMBOL_ID, SENGOKU_SYMBOL_MARKUP], [ICHIJO_SYMBOL_ID, ICHIJO_SYMBOL_MARKUP], [CHOSOKABE_SYMBOL_ID, CHOSOKABE_SYMBOL_MARKUP], [BESSHO_SYMBOL_ID, BESSHO_SYMBOL_MARKUP], [SHIINA_SYMBOL_ID, SHIINA_SYMBOL_MARKUP], [SANO_SYMBOL_ID, SANO_SYMBOL_MARKUP], [AKI_TOSA_SYMBOL_ID, AKI_TOSA_SYMBOL_MARKUP], [MOTOYAMA_SYMBOL_ID, MOTOYAMA_SYMBOL_MARKUP], [TAKATO_SYMBOL_ID, TAKATO_SYMBOL_MARKUP], [OYAMA_SYMBOL_ID, OYAMA_SYMBOL_MARKUP], [NANJO_SYMBOL_ID, NANJO_SYMBOL_MARKUP], [SAITO_SYMBOL_ID, SAITO_SYMBOL_MARKUP], [AINU_PATTERN_SYMBOL_ID, AINU_PATTERN_SYMBOL_MARKUP], [TAKIGAWA_SYMBOL_ID, TAKIGAWA_SYMBOL_MARKUP], [TODO_SYMBOL_ID, TODO_SYMBOL_MARKUP], [MATSUNAGA_SYMBOL_ID, MATSUNAGA_SYMBOL_MARKUP], [KIMOTSUKI_SYMBOL_ID, KIMOTSUKI_SYMBOL_MARKUP], [GORYOKAKU_SYMBOL_ID, GORYOKAKU_SYMBOL_MARKUP], [ENOMOTO_SYMBOL_ID, ENOMOTO_SYMBOL_MARKUP], [MIMURA_SYMBOL_ID, MIMURA_SYMBOL_MARKUP], [AKIZUKI_SYMBOL_ID, AKIZUKI_SYMBOL_MARKUP], [KONISHI_SYMBOL_ID, KONISHI_SYMBOL_MARKUP]].forEach(function ([symbolId, markup]) {
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
      ['kamon-todo', '#7b8791'],
      ['kamon-takeda', '#ea5424'],
      ['kamon-matsunaga', '#2d7a46'],
      ['kamon-yamanouchi', '#365a9c'],
      ['kamon-fukui', '#8a4a36'],
      ['kamon-okayama', '#3f5c9a'],
      ['kamon-tottori', '#7a5a90'],
      ['kamon-matsue', '#2f6f68'],
      ['kamon-nagaoka', '#643e21'],
      ['kamon-kuwana', '#5d6d7e'],
      ['kamon-saito', '#73787c'],
      ['kamon-ainu-pattern', '#1f5f8b']
    ].forEach(function ([symbolId, color]) {
      var symbol = document.getElementById(symbolId);
      var outerCircle = symbol && (symbol.querySelector('circle[r="15"]') || symbol.querySelector('circle'));
      if (outerCircle) outerCircle.setAttribute('fill', color);
    });
    [
      ['kamon-matsunaga', '松永家・蔦紋（つたもん）'],
      ['kamon-kimotsuki', '肝付家・対い鶴喰若松三つ雁金（むかいづるくいはかまつみつかりがね）']
    ].forEach(function ([symbolId, titleText]) {
      var symbol = document.getElementById(symbolId);
      if (symbol) {
        var title = symbol.querySelector('title');
        if (!title) {
          title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
          symbol.insertBefore(title, symbol.firstChild);
        }
        title.textContent = titleText;
      }
    });
    var defs = document.getElementById('mapSvgDefs') || document.querySelector('#kamonsGlobalContainer defs');
    if (!defs) return;
    [[SYMBOL_ID, SYMBOL_MARKUP], [KUMAMOTO_HOSOKAWA_SYMBOL_ID, KUMAMOTO_HOSOKAWA_SYMBOL_MARKUP], [AKO_RONIN_SYMBOL_ID, AKO_RONIN_SYMBOL_MARKUP], [SAKAI_SYMBOL_ID, SAKAI_SYMBOL_MARKUP], [UWAJIMA_DATE_SYMBOL_ID, UWAJIMA_DATE_SYMBOL_MARKUP], [ANDO_SYMBOL_ID, ANDO_SYMBOL_MARKUP], [NIWA_SYMBOL_ID, NIWA_SYMBOL_MARKUP], [GOTO_SYMBOL_ID, GOTO_SYMBOL_MARKUP], [SUWA_SYMBOL_ID, SUWA_SYMBOL_MARKUP], [SENGOKU_SYMBOL_ID, SENGOKU_SYMBOL_MARKUP], [ICHIJO_SYMBOL_ID, ICHIJO_SYMBOL_MARKUP], [CHOSOKABE_SYMBOL_ID, CHOSOKABE_SYMBOL_MARKUP], [BESSHO_SYMBOL_ID, BESSHO_SYMBOL_MARKUP], [SHIINA_SYMBOL_ID, SHIINA_SYMBOL_MARKUP], [SANO_SYMBOL_ID, SANO_SYMBOL_MARKUP], [AKI_TOSA_SYMBOL_ID, AKI_TOSA_SYMBOL_MARKUP], [MOTOYAMA_SYMBOL_ID, MOTOYAMA_SYMBOL_MARKUP], [TAKATO_SYMBOL_ID, TAKATO_SYMBOL_MARKUP], [OYAMA_SYMBOL_ID, OYAMA_SYMBOL_MARKUP], [NANJO_SYMBOL_ID, NANJO_SYMBOL_MARKUP], [SAITO_SYMBOL_ID, SAITO_SYMBOL_MARKUP], [AINU_PATTERN_SYMBOL_ID, AINU_PATTERN_SYMBOL_MARKUP], [TAKIGAWA_SYMBOL_ID, TAKIGAWA_SYMBOL_MARKUP], [TODO_SYMBOL_ID, TODO_SYMBOL_MARKUP], [MATSUNAGA_SYMBOL_ID, MATSUNAGA_SYMBOL_MARKUP], [KIMOTSUKI_SYMBOL_ID, KIMOTSUKI_SYMBOL_MARKUP], [GORYOKAKU_SYMBOL_ID, GORYOKAKU_SYMBOL_MARKUP], [ENOMOTO_SYMBOL_ID, ENOMOTO_SYMBOL_MARKUP], [MIMURA_SYMBOL_ID, MIMURA_SYMBOL_MARKUP], [AKIZUKI_SYMBOL_ID, AKIZUKI_SYMBOL_MARKUP], [KONISHI_SYMBOL_ID, KONISHI_SYMBOL_MARKUP]].forEach(function ([symbolId, markup]) {
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

/** 2026-11-12 日本地図v15で追加した大名家の家紋（史実の定紋を調査して作成）。 */
(function () {
  'use strict';
  var NEW_CLAN_KAMONS = `
<symbol id="kamon-oi-sangaibishi" viewBox="0 0 32 32"><title>大井家・三階菱（さんがいびし）・同族小笠原氏からの推定</title><circle cx="16" cy="16" r="15" fill="#5d6d7e" stroke="#ffd700" stroke-width="1.5"></circle>
      <polygon points="16,7 21,11 16,15 11,11" fill="#ffffff"></polygon><polygon points="16,13 21,17 16,21 11,17" fill="#ffffff"></polygon><polygon points="16,19 21,23 16,27 11,23" fill="#ffffff"></polygon></symbol>
<symbol id="kamon-uchigashima-maru-jumonji" viewBox="0 0 32 32"><title>内ヶ島家・丸に十文字（まるにじゅうもんじ）・幕紋</title><circle cx="16" cy="16" r="15" fill="#7b5e3b" stroke="#ffd700" stroke-width="1.5"></circle><circle cx="16" cy="16" r="11.6" fill="none" stroke="#ffffff" stroke-width="1.6"></circle><rect x="14.6" y="6.3" width="2.8" height="19.4" fill="#ffffff"></rect><rect x="6.3" y="14.6" width="19.4" height="2.8" fill="#ffffff"></rect></symbol>
<symbol id="kamon-ema-mitsuuroko" viewBox="0 0 32 32"><title>江馬家・三つ鱗（みつうろこ）</title><circle cx="16" cy="16" r="15" fill="#4a6b8a" stroke="#ffd700" stroke-width="1.5"></circle>
      <polygon points="16,6.5 21.5,16 10.5,16" fill="#ffffff"></polygon><polygon points="10.5,16.5 16,26 5,26" fill="#ffffff"></polygon><polygon points="21.5,16.5 27,26 16,26" fill="#ffffff"></polygon></symbol>
<symbol id="kamon-toyama-futatsubiki" viewBox="0 0 32 32"><title>岩村遠山家・丸に二つ引両（まるにふたつひきりょう）</title><circle cx="16" cy="16" r="15" fill="#8e6c3a" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffd700" stroke-width="2"></circle>
      <line x1="6" y1="12" x2="26" y2="12" stroke="#ffffff" stroke-width="3.2"></line>
      <line x1="6" y1="20" x2="26" y2="20" stroke="#ffffff" stroke-width="3.2"></line></symbol>
<symbol id="kamon-kashima-mukaicho" viewBox="0 0 32 32"><title>鹿島家・対い蝶（むかいちょう）・本家大掾氏からの推定</title><circle cx="16" cy="16" r="15" fill="#1f618d" stroke="#ffd700" stroke-width="1.5"></circle><g transform="translate(-1.4 0.6) rotate(-8 14 15)"><path d="M14.6 12.2 C10.6 5.4 4.6 5.8 5.4 11.6 C5.9 15 10.2 15.6 14.2 14 Z" fill="#ffffff"></path><path d="M14 15.4 C9.4 15.6 6.4 19.6 8.4 23.2 C10 25.4 13 22.6 14 17.6 Z" fill="#ffffff"></path><path d="M15.1 10.6 C15.6 13.5 15.3 19 14.5 24.2" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round"></path><path d="M15 10.8 Q15.8 7.4 14.6 5.6" stroke="#ffffff" stroke-width="0.6" fill="none"></path><circle cx="8.3" cy="10.4" r="1.1" fill="#1f618d"></circle><circle cx="10.2" cy="20.4" r="0.9" fill="#1f618d"></circle><path d="M7 11.6 C9.5 12.6 11.8 12.8 13.8 12.6" stroke="#ffd700" stroke-width="0.45" fill="none"></path></g><g transform="translate(32 0) scale(-1 1)"><g transform="translate(-1.4 0.6) rotate(-8 14 15)"><path d="M14.6 12.2 C10.6 5.4 4.6 5.8 5.4 11.6 C5.9 15 10.2 15.6 14.2 14 Z" fill="#ffffff"></path><path d="M14 15.4 C9.4 15.6 6.4 19.6 8.4 23.2 C10 25.4 13 22.6 14 17.6 Z" fill="#ffffff"></path><path d="M15.1 10.6 C15.6 13.5 15.3 19 14.5 24.2" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round"></path><path d="M15 10.8 Q15.8 7.4 14.6 5.6" stroke="#ffffff" stroke-width="0.6" fill="none"></path><circle cx="8.3" cy="10.4" r="1.1" fill="#1f618d"></circle><circle cx="10.2" cy="20.4" r="0.9" fill="#1f618d"></circle><path d="M7 11.6 C9.5 12.6 11.8 12.8 13.8 12.6" stroke="#ffd700" stroke-width="0.45" fill="none"></path></g></g></symbol>
<symbol id="kamon-daijo-mukaicho" viewBox="0 0 32 32"><title>大掾家・対い蝶（むかいちょう）</title><circle cx="16" cy="16" r="15" fill="#4a235a" stroke="#ffd700" stroke-width="1.5"></circle><g transform="translate(-1.4 0.6) rotate(-8 14 15)"><path d="M14.6 12.2 C10.6 5.4 4.6 5.8 5.4 11.6 C5.9 15 10.2 15.6 14.2 14 Z" fill="#ffffff"></path><path d="M14 15.4 C9.4 15.6 6.4 19.6 8.4 23.2 C10 25.4 13 22.6 14 17.6 Z" fill="#ffffff"></path><path d="M15.1 10.6 C15.6 13.5 15.3 19 14.5 24.2" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round"></path><path d="M15 10.8 Q15.8 7.4 14.6 5.6" stroke="#ffffff" stroke-width="0.6" fill="none"></path><circle cx="8.3" cy="10.4" r="1.1" fill="#4a235a"></circle><circle cx="10.2" cy="20.4" r="0.9" fill="#4a235a"></circle><path d="M7 11.6 C9.5 12.6 11.8 12.8 13.8 12.6" stroke="#ffd700" stroke-width="0.45" fill="none"></path></g><g transform="translate(32 0) scale(-1 1)"><g transform="translate(-1.4 0.6) rotate(-8 14 15)"><path d="M14.6 12.2 C10.6 5.4 4.6 5.8 5.4 11.6 C5.9 15 10.2 15.6 14.2 14 Z" fill="#ffffff"></path><path d="M14 15.4 C9.4 15.6 6.4 19.6 8.4 23.2 C10 25.4 13 22.6 14 17.6 Z" fill="#ffffff"></path><path d="M15.1 10.6 C15.6 13.5 15.3 19 14.5 24.2" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round"></path><path d="M15 10.8 Q15.8 7.4 14.6 5.6" stroke="#ffffff" stroke-width="0.6" fill="none"></path><circle cx="8.3" cy="10.4" r="1.1" fill="#4a235a"></circle><circle cx="10.2" cy="20.4" r="0.9" fill="#4a235a"></circle><path d="M7 11.6 C9.5 12.6 11.8 12.8 13.8 12.6" stroke="#ffd700" stroke-width="0.45" fill="none"></path></g></g></symbol>
<symbol id="kamon-mimasaka-miura-mitsubiki" viewBox="0 0 32 32"><title>美作三浦家・丸に三つ引両（まるにみつひきりょう）・相模三浦氏の家紋</title><circle cx="16" cy="16" r="15" fill="#5d6d7e" stroke="#ffd700" stroke-width="1.5"></circle><circle cx="16" cy="16" r="11.6" fill="none" stroke="#ffffff" stroke-width="1.7"></circle><rect x="7.08" y="10.4" width="17.83" height="2.6" fill="#ffffff"></rect><rect x="6.10" y="14.7" width="19.80" height="2.6" fill="#ffffff"></rect><rect x="7.08" y="19.0" width="17.83" height="2.6" fill="#ffffff"></rect></symbol>
<symbol id="kamon-makabe-tachibana" viewBox="0 0 32 32"><title>真壁家・橘（たちばな）</title><circle cx="16" cy="16" r="15" fill="#7b241c" stroke="#ffd700" stroke-width="1.5"></circle><g transform="rotate(-52 16 15)"><path d="M16 15 C13.3 11.4 13.6 7.4 16 5.2 C18.4 7.4 18.7 11.4 16 15 Z" fill="#ffffff"></path><path d="M16 14.4 L16 6.4" stroke="#ffd700" stroke-width="0.5"></path></g><g transform="rotate(52 16 15)"><path d="M16 15 C13.3 11.4 13.6 7.4 16 5.2 C18.4 7.4 18.7 11.4 16 15 Z" fill="#ffffff"></path><path d="M16 14.4 L16 6.4" stroke="#ffd700" stroke-width="0.5"></path></g><path d="M16 15 C13.3 11.4 13.6 7.4 16 5.2 C18.4 7.4 18.7 11.4 16 15 Z" fill="#ffffff"></path><path d="M16 14.4 L16 6.4" stroke="#ffd700" stroke-width="0.5"></path><circle cx="16" cy="20.2" r="5.3" fill="#ffffff"></circle><path d="M16 14.8 l0.9 1.6 l1.8 0.2 l-1.3 1.2 l0.4 1.8 l-1.8 -0.9 l-1.8 0.9 l0.4 -1.8 l-1.3 -1.2 l1.8 -0.2 Z" fill="#ffd700"></path><circle cx="13.6" cy="20" r="0.45" fill="#7b241c"></circle><circle cx="18.4" cy="20.4" r="0.45" fill="#7b241c"></circle><circle cx="15.2" cy="23" r="0.45" fill="#7b241c"></circle><circle cx="17.4" cy="22.6" r="0.45" fill="#7b241c"></circle><circle cx="14.6" cy="18.6" r="0.45" fill="#7b241c"></circle><circle cx="17.8" cy="18.4" r="0.45" fill="#7b241c"></circle></symbol>
<symbol id="kamon-hitachi-edo-hidari-mitsudomoe" viewBox="0 0 32 32"><title>江戸家（常陸）・左三つ巴（ひだりみつどもえ）</title><circle cx="16" cy="16" r="15" fill="#196f3d" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <g><path d="M 16 4.6 L 15.41 4.64 L 14.83 4.71 L 14.26 4.8 L 13.69 4.93 L 13.13 5.08 L 12.58 5.27 L 12.04 5.48 L 11.51 5.72 L 10.99 5.98 L 10.5 6.27 L 10.02 6.59 L 9.55 6.93 L 9.11 7.29 L 8.68 7.67 L 8.28 8.08 L 7.9 8.5 L 7.54 8.94 L 7.21 9.4 L 6.9 9.87 L 6.61 10.36 L 6.36 10.86 L 6.12 11.37 L 5.92 11.9 L 5.74 12.43 L 5.6 12.97 L 5.48 13.51 L 5.38 14.06 L 5.32 14.61 L 5.28 15.17 L 5.28 15.72 L 5.3 16.27 L 5.35 16.82 L 5.43 17.36 L 5.54 17.9 L 5.67 18.43 L 5.83 18.95 L 6.02 19.47 L 6.23 19.97 L 6.47 20.46 L 6.73 20.93 L 6.73 20.93 L 6.49 20.44 L 6.3 19.94 L 6.15 19.42 L 6.05 18.89 L 5.98 18.36 L 5.96 17.82 L 5.98 17.29 L 6.03 16.77 L 6.13 16.25 L 6.26 15.74 L 6.42 15.25 L 6.62 14.78 L 6.85 14.33 L 7.11 13.9 L 7.39 13.49 L 7.71 13.11 L 8.04 12.76 L 8.4 12.44 L 8.77 12.15 L 9.16 11.89 L 9.56 11.66 L 9.97 11.47 L 10.39 11.32 L 10.82 11.2 L 11.24 11.12 L 11.67 11.07 L 12.09 11.05 L 12.5 11.07 L 12.9 11.13 L 13.29 11.22 L 13.67 11.34 L 14.03 11.49 L 14.37 11.67 L 14.68 11.88 L 14.98 12.11 L 15.24 12.37 L 15.48 12.65 L 15.69 12.95 L 15.86 13.27 L 16 13.6 Z" fill="#ffffff" stroke="#7d6608" stroke-width="0.7" stroke-linejoin="round"></path><circle cx="16" cy="9.1" r="4.5" fill="#ffffff"></circle></g>
      <g><path d="M 25.87 21.7 L 26.13 21.17 L 26.37 20.64 L 26.57 20.09 L 26.74 19.53 L 26.89 18.97 L 27.01 18.4 L 27.09 17.83 L 27.15 17.25 L 27.18 16.67 L 27.17 16.1 L 27.14 15.52 L 27.08 14.95 L 26.99 14.39 L 26.87 13.83 L 26.72 13.28 L 26.55 12.74 L 26.34 12.2 L 26.11 11.69 L 25.86 11.18 L 25.58 10.69 L 25.27 10.22 L 24.94 9.76 L 24.59 9.32 L 24.22 8.9 L 23.83 8.51 L 23.42 8.13 L 22.99 7.77 L 22.54 7.44 L 22.08 7.14 L 21.6 6.86 L 21.11 6.6 L 20.61 6.37 L 20.1 6.16 L 19.59 5.99 L 19.06 5.84 L 18.53 5.72 L 17.99 5.62 L 17.45 5.56 L 16.91 5.52 L 16.37 5.51 L 16.37 5.51 L 16.91 5.54 L 17.44 5.63 L 17.96 5.76 L 18.47 5.94 L 18.97 6.15 L 19.44 6.39 L 19.89 6.68 L 20.32 6.99 L 20.72 7.33 L 21.09 7.69 L 21.43 8.08 L 21.75 8.49 L 22.02 8.91 L 22.27 9.35 L 22.48 9.8 L 22.65 10.26 L 22.79 10.73 L 22.89 11.2 L 22.95 11.66 L 22.98 12.13 L 22.97 12.59 L 22.93 13.04 L 22.86 13.48 L 22.75 13.91 L 22.61 14.32 L 22.44 14.71 L 22.24 15.08 L 22.02 15.43 L 21.77 15.75 L 21.49 16.05 L 21.2 16.31 L 20.89 16.55 L 20.57 16.75 L 20.23 16.92 L 19.88 17.06 L 19.52 17.16 L 19.16 17.22 L 18.8 17.25 L 18.44 17.24 L 18.08 17.2 Z" fill="#ffffff" stroke="#7d6608" stroke-width="0.7" stroke-linejoin="round"></path><circle cx="21.98" cy="19.45" r="4.5" fill="#ffffff"></circle></g>
      <g><path d="M 6.13 21.7 L 6.45 22.19 L 6.8 22.66 L 7.17 23.11 L 7.57 23.54 L 7.98 23.95 L 8.42 24.33 L 8.87 24.69 L 9.34 25.03 L 9.83 25.34 L 10.33 25.63 L 10.84 25.89 L 11.37 26.12 L 11.9 26.32 L 12.45 26.5 L 13 26.65 L 13.55 26.77 L 14.12 26.86 L 14.68 26.92 L 15.24 26.95 L 15.81 26.95 L 16.37 26.92 L 16.93 26.87 L 17.49 26.78 L 18.03 26.67 L 18.58 26.53 L 19.11 26.36 L 19.63 26.16 L 20.14 25.94 L 20.64 25.7 L 21.12 25.43 L 21.58 25.13 L 22.03 24.81 L 22.47 24.47 L 22.88 24.11 L 23.27 23.73 L 23.64 23.33 L 23.99 22.91 L 24.32 22.48 L 24.62 22.03 L 24.9 21.56 L 24.9 21.56 L 24.6 22.01 L 24.26 22.43 L 23.89 22.82 L 23.48 23.17 L 23.05 23.49 L 22.6 23.78 L 22.13 24.03 L 21.65 24.25 L 21.15 24.42 L 20.65 24.56 L 20.14 24.67 L 19.64 24.73 L 19.13 24.76 L 18.63 24.75 L 18.13 24.71 L 17.65 24.63 L 17.17 24.51 L 16.72 24.37 L 16.28 24.19 L 15.86 23.98 L 15.47 23.74 L 15.09 23.48 L 14.75 23.2 L 14.43 22.89 L 14.15 22.56 L 13.89 22.22 L 13.67 21.86 L 13.48 21.5 L 13.33 21.12 L 13.21 20.73 L 13.13 20.35 L 13.08 19.96 L 13.07 19.58 L 13.09 19.2 L 13.15 18.83 L 13.24 18.47 L 13.36 18.13 L 13.52 17.8 L 13.71 17.49 L 13.92 17.2 Z" fill="#ffffff" stroke="#7d6608" stroke-width="0.7" stroke-linejoin="round"></path><circle cx="10.02" cy="19.45" r="4.5" fill="#ffffff"></circle></g></symbol>
<symbol id="kamon-toki-kazusa-kikyo" viewBox="0 0 32 32"><title>上総土岐家・土岐桔梗（ときききょう）</title><circle cx="16" cy="16" r="15" fill="#5b2c6f" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <g transform="translate(16 16.6) rotate(0)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(72)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(144)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(216)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(288)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <circle cx="16" cy="16.6" r="2.3" fill="#2e86a3"></circle>
      <path d="M 16 15.2 L 16 13 M 16.82 15.47 L 18.12 13.69 M 17.33 16.17 L 19.42 15.49 M 17.33 17.03 L 19.42 17.71 M 16.82 17.73 L 18.12 19.51 M 16 18 L 16 20.2 M 15.18 17.73 L 13.88 19.51 M 14.67 17.03 L 12.58 17.71 M 14.67 16.17 L 12.58 15.49 M 15.18 15.47 L 13.88 13.69" stroke="#ffd700" stroke-width="0.45" stroke-linecap="round" fill="none"></path>
      <circle cx="16" cy="16.6" r="1.1" fill="#ffd700"></circle></symbol>
<symbol id="kamon-narita-tatemitsubiki" viewBox="0 0 32 32"><title>成田家・丸に竪三つ引両（まるにたてみつひきりょう）</title><circle cx="16" cy="16" r="15" fill="#2e4053" stroke="#ffd700" stroke-width="1.5"></circle><circle cx="16" cy="16" r="11.6" fill="none" stroke="#ffffff" stroke-width="1.7"></circle><rect x="10.4" y="7.08" width="2.6" height="17.83" fill="#ffffff"></rect><rect x="14.7" y="6.10" width="2.6" height="19.80" fill="#ffffff"></rect><rect x="19.0" y="7.08" width="2.6" height="17.83" fill="#ffffff"></rect></symbol>
<symbol id="kamon-ota-kikyo" viewBox="0 0 32 32"><title>岩付太田家・太田桔梗（おおたききょう）・丸に細桔梗</title><circle cx="16" cy="16" r="15" fill="#b9770e" stroke="#ffd700" stroke-width="1.5"></circle><circle cx="16" cy="16" r="12.6" fill="none" stroke="#ffffff" stroke-width="1.4"></circle><g transform="translate(16 16) scale(0.74 0.82) translate(-16 -16)">
      
      <g transform="translate(16 16.6) rotate(0)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(72)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(144)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(216)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <g transform="translate(16 16.6) rotate(288)"><path d="M -0.75 -2.3 L -5.0 -7.4 C -5.7 -9.7 -3.4 -10.9 -1.7 -10.4 Q -0.5 -10.7 0 -11.9 Q 0.5 -10.7 1.7 -10.4 C 3.4 -10.9 5.7 -9.7 5.0 -7.4 L 0.75 -2.3 Z" fill="#ffffff"></path></g>
      <circle cx="16" cy="16.6" r="2.3" fill="#2e86a3"></circle>
      <path d="M 16 15.2 L 16 13 M 16.82 15.47 L 18.12 13.69 M 17.33 16.17 L 19.42 15.49 M 17.33 17.03 L 19.42 17.71 M 16.82 17.73 L 18.12 19.51 M 16 18 L 16 20.2 M 15.18 17.73 L 13.88 19.51 M 14.67 17.03 L 12.58 17.71 M 14.67 16.17 L 12.58 15.49 M 15.18 15.47 L 13.88 13.69" stroke="#ffd700" stroke-width="0.45" stroke-linecap="round" fill="none"></path>
      <circle cx="16" cy="16.6" r="1.1" fill="#ffd700"></circle></g></symbol>
<symbol id="kamon-hienuki-futatsubiki" viewBox="0 0 32 32"><title>稗貫家・七つ割丸に二つ引両（ななつわりまるにふたつひきりょう）</title><circle cx="16" cy="16" r="15" fill="#7d6608" stroke="#ffd700" stroke-width="1.5"></circle><circle cx="16" cy="16" r="11.2" fill="none" stroke="#ffffff" stroke-width="3.0"></circle><rect x="7.4" y="11.6" width="17.2" height="3" fill="#ffffff"></rect><rect x="7.4" y="17.4" width="17.2" height="3" fill="#ffffff"></rect></symbol>
<symbol id="kamon-waga-tachiaigumo" viewBox="0 0 32 32"><title>和賀家・立合雲（たちあいぐも）</title><circle cx="16" cy="16" r="15" fill="#6e2c00" stroke="#ffd700" stroke-width="1.5"></circle><path d="M14.6 27 C13.8 23.2 11.2 21.4 10.4 17.6" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"></path><path d="M10.4 18.4 C6.2 18.6 4.4 15.6 5.8 13 C4.6 10.4 7 8 9.4 8.8 C10 6 13.4 5.4 14.6 7.6 C15.4 9.6 14.2 11.2 12.8 11.4 C14.4 12.8 13.6 15.4 11.6 15.4 C12.4 16.6 11.8 18 10.4 18.4 Z" fill="#ffffff"></path><path d="M8.4 14.2 C7.4 12.6 8.8 11.2 10.2 12 C11.2 12.8 10.4 14.2 9.4 13.6" stroke="#ffd700" stroke-width="0.6" fill="none"></path><g transform="translate(32 0) scale(-1 1)"><path d="M14.6 27 C13.8 23.2 11.2 21.4 10.4 17.6" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"></path><path d="M10.4 18.4 C6.2 18.6 4.4 15.6 5.8 13 C4.6 10.4 7 8 9.4 8.8 C10 6 13.4 5.4 14.6 7.6 C15.4 9.6 14.2 11.2 12.8 11.4 C14.4 12.8 13.6 15.4 11.6 15.4 C12.4 16.6 11.8 18 10.4 18.4 Z" fill="#ffffff"></path><path d="M8.4 14.2 C7.4 12.6 8.8 11.2 10.2 12 C11.2 12.8 10.4 14.2 9.4 13.6" stroke="#ffd700" stroke-width="0.6" fill="none"></path></g></symbol>
<symbol id="kamon-asonuma-mokko" viewBox="0 0 32 32"><title>阿曽沼家・木瓜（もっこう）</title><circle cx="16" cy="16" r="15" fill="#196f3d" stroke="#ffd700" stroke-width="1.5"></circle><circle cx="16" cy="9.4" r="5.4" fill="#ffffff"></circle><circle cx="22.6" cy="16" r="5.4" fill="#ffffff"></circle><circle cx="16" cy="22.6" r="5.4" fill="#ffffff"></circle><circle cx="9.4" cy="16" r="5.4" fill="#ffffff"></circle><rect x="10.5" y="10.5" width="11" height="11" fill="#ffffff"></rect><circle cx="16" cy="10.5" r="3.6" fill="#196f3d"></circle><circle cx="21.5" cy="16" r="3.6" fill="#196f3d"></circle><circle cx="16" cy="21.5" r="3.6" fill="#196f3d"></circle><circle cx="10.5" cy="16" r="3.6" fill="#196f3d"></circle><rect x="12.4" y="12.4" width="7.2" height="7.2" fill="#196f3d"></rect><g transform="rotate(0 16 16)"><ellipse cx="16" cy="13.4" rx="1.3" ry="2" fill="#ffffff"></ellipse></g><g transform="rotate(90 16 16)"><ellipse cx="16" cy="13.4" rx="1.3" ry="2" fill="#ffffff"></ellipse></g><g transform="rotate(180 16 16)"><ellipse cx="16" cy="13.4" rx="1.3" ry="2" fill="#ffffff"></ellipse></g><g transform="rotate(270 16 16)"><ellipse cx="16" cy="13.4" rx="1.3" ry="2" fill="#ffffff"></ellipse></g><circle cx="16" cy="16" r="1" fill="#ffd700"></circle></symbol>
<symbol id="kamon-asari-gohonbone-ogi" viewBox="0 0 32 32"><title>浅利家・五本骨扇（ごほんぼねおうぎ）</title><circle cx="16" cy="16" r="15" fill="#a04000" stroke="#ffd700" stroke-width="1.5"></circle><path d="M16 22.5 L5.2 15 A12.4 12.4 0 0 1 26.8 15 Z" fill="#ffffff"></path><path d="M16 22.5 L11.6 19.4 A5.2 5.2 0 0 1 20.4 19.4 Z" fill="#a04000"></path><line x1="16" y1="22.5" x2="6.01" y2="15.50" stroke="#a04000" stroke-width="0.7"></line><line x1="16" y1="22.5" x2="10.37" y2="11.68" stroke="#a04000" stroke-width="0.7"></line><line x1="16" y1="22.5" x2="16.00" y2="10.30" stroke="#a04000" stroke-width="0.7"></line><line x1="16" y1="22.5" x2="21.63" y2="11.68" stroke="#a04000" stroke-width="0.7"></line><line x1="16" y1="22.5" x2="25.99" y2="15.50" stroke="#a04000" stroke-width="0.7"></line><path d="M14.6 22.4 L16 27.4 L17.4 22.4 Z" fill="#ffffff"></path><circle cx="16" cy="22.6" r="1.1" fill="#ffd700"></circle></symbol>
<symbol id="kamon-nikaho-ichimonji-mitsuboshi" viewBox="0 0 32 32"><title>仁賀保家・一文字に三つ星（いちもんじにみつぼし）・推定</title><circle cx="16" cy="16" r="15" fill="#1f618d" stroke="#ffd700" stroke-width="1.5"></circle>
      <rect x="7" y="8" width="18" height="4.5" rx="1.5" fill="#ffffff"></rect><circle cx="16" cy="17.5" r="3.2" fill="#ffffff"></circle><circle cx="10.5" cy="24" r="3.2" fill="#ffffff"></circle><circle cx="21.5" cy="24" r="3.2" fill="#ffffff"></circle></symbol>
<symbol id="kamon-sakenobe-yotsumeyui" viewBox="0 0 32 32"><title>鮭延家・四つ目結（よつめゆい）・佐々木氏流からの推定</title><circle cx="16" cy="16" r="15" fill="#4a235a" stroke="#ffd700" stroke-width="1.5"></circle>
      <polygon points="16,6 20,10 16,14 12,10" fill="#ffffff"></polygon><polygon points="16,8 18,10 16,12 14,10" fill="#758242"></polygon><polygon points="22,12 26,16 22,20 18,16" fill="#ffffff"></polygon><polygon points="22,14 24,16 22,18 20,16" fill="#758242"></polygon><polygon points="16,18 20,22 16,26 12,22" fill="#ffffff"></polygon><polygon points="16,20 18,22 16,24 14,22" fill="#758242"></polygon><polygon points="10,12 14,16 10,20 6,16" fill="#ffffff"></polygon><polygon points="10,14 12,16 10,18 8,16" fill="#758242"></polygon></symbol>
<symbol id="kamon-hei-yotsumeyui" viewBox="0 0 32 32"><title>閉伊家・四つ目結（よつめゆい）・佐々木十郎行光（閉伊頼基）以来の家紋</title><circle cx="16" cy="16" r="15" fill="#1a5276" stroke="#ffd700" stroke-width="1.5"></circle>
      <polygon points="16,6 20,10 16,14 12,10" fill="#ffffff"></polygon><polygon points="16,8 18,10 16,12 14,10" fill="#1a5276"></polygon><polygon points="22,12 26,16 22,20 18,16" fill="#ffffff"></polygon><polygon points="22,14 24,16 22,18 20,16" fill="#1a5276"></polygon><polygon points="16,18 20,22 16,26 12,22" fill="#ffffff"></polygon><polygon points="16,20 18,22 16,24 14,22" fill="#1a5276"></polygon><polygon points="10,12 14,16 10,20 6,16" fill="#ffffff"></polygon><polygon points="10,14 12,16 10,18 8,16" fill="#1a5276"></polygon></symbol>
<symbol id="kamon-yuri-nukedomoe" viewBox="0 0 32 32"><title>由利家・抜け巴（三つ巴）・由利氏の家紋と伝わる</title><circle cx="16" cy="16" r="15" fill="#7b241c" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <g><path d="M 16 4.6 L 15.41 4.64 L 14.83 4.71 L 14.26 4.8 L 13.69 4.93 L 13.13 5.08 L 12.58 5.27 L 12.04 5.48 L 11.51 5.72 L 10.99 5.98 L 10.5 6.27 L 10.02 6.59 L 9.55 6.93 L 9.11 7.29 L 8.68 7.67 L 8.28 8.08 L 7.9 8.5 L 7.54 8.94 L 7.21 9.4 L 6.9 9.87 L 6.61 10.36 L 6.36 10.86 L 6.12 11.37 L 5.92 11.9 L 5.74 12.43 L 5.6 12.97 L 5.48 13.51 L 5.38 14.06 L 5.32 14.61 L 5.28 15.17 L 5.28 15.72 L 5.3 16.27 L 5.35 16.82 L 5.43 17.36 L 5.54 17.9 L 5.67 18.43 L 5.83 18.95 L 6.02 19.47 L 6.23 19.97 L 6.47 20.46 L 6.73 20.93 L 6.73 20.93 L 6.49 20.44 L 6.3 19.94 L 6.15 19.42 L 6.05 18.89 L 5.98 18.36 L 5.96 17.82 L 5.98 17.29 L 6.03 16.77 L 6.13 16.25 L 6.26 15.74 L 6.42 15.25 L 6.62 14.78 L 6.85 14.33 L 7.11 13.9 L 7.39 13.49 L 7.71 13.11 L 8.04 12.76 L 8.4 12.44 L 8.77 12.15 L 9.16 11.89 L 9.56 11.66 L 9.97 11.47 L 10.39 11.32 L 10.82 11.2 L 11.24 11.12 L 11.67 11.07 L 12.09 11.05 L 12.5 11.07 L 12.9 11.13 L 13.29 11.22 L 13.67 11.34 L 14.03 11.49 L 14.37 11.67 L 14.68 11.88 L 14.98 12.11 L 15.24 12.37 L 15.48 12.65 L 15.69 12.95 L 15.86 13.27 L 16 13.6 Z" fill="#ffffff" stroke="#7d6608" stroke-width="0.7" stroke-linejoin="round"></path><circle cx="16" cy="9.1" r="4.5" fill="#ffffff"></circle></g>
      <g><path d="M 25.87 21.7 L 26.13 21.17 L 26.37 20.64 L 26.57 20.09 L 26.74 19.53 L 26.89 18.97 L 27.01 18.4 L 27.09 17.83 L 27.15 17.25 L 27.18 16.67 L 27.17 16.1 L 27.14 15.52 L 27.08 14.95 L 26.99 14.39 L 26.87 13.83 L 26.72 13.28 L 26.55 12.74 L 26.34 12.2 L 26.11 11.69 L 25.86 11.18 L 25.58 10.69 L 25.27 10.22 L 24.94 9.76 L 24.59 9.32 L 24.22 8.9 L 23.83 8.51 L 23.42 8.13 L 22.99 7.77 L 22.54 7.44 L 22.08 7.14 L 21.6 6.86 L 21.11 6.6 L 20.61 6.37 L 20.1 6.16 L 19.59 5.99 L 19.06 5.84 L 18.53 5.72 L 17.99 5.62 L 17.45 5.56 L 16.91 5.52 L 16.37 5.51 L 16.37 5.51 L 16.91 5.54 L 17.44 5.63 L 17.96 5.76 L 18.47 5.94 L 18.97 6.15 L 19.44 6.39 L 19.89 6.68 L 20.32 6.99 L 20.72 7.33 L 21.09 7.69 L 21.43 8.08 L 21.75 8.49 L 22.02 8.91 L 22.27 9.35 L 22.48 9.8 L 22.65 10.26 L 22.79 10.73 L 22.89 11.2 L 22.95 11.66 L 22.98 12.13 L 22.97 12.59 L 22.93 13.04 L 22.86 13.48 L 22.75 13.91 L 22.61 14.32 L 22.44 14.71 L 22.24 15.08 L 22.02 15.43 L 21.77 15.75 L 21.49 16.05 L 21.2 16.31 L 20.89 16.55 L 20.57 16.75 L 20.23 16.92 L 19.88 17.06 L 19.52 17.16 L 19.16 17.22 L 18.8 17.25 L 18.44 17.24 L 18.08 17.2 Z" fill="#ffffff" stroke="#7d6608" stroke-width="0.7" stroke-linejoin="round"></path><circle cx="21.98" cy="19.45" r="4.5" fill="#ffffff"></circle></g>
      <g><path d="M 6.13 21.7 L 6.45 22.19 L 6.8 22.66 L 7.17 23.11 L 7.57 23.54 L 7.98 23.95 L 8.42 24.33 L 8.87 24.69 L 9.34 25.03 L 9.83 25.34 L 10.33 25.63 L 10.84 25.89 L 11.37 26.12 L 11.9 26.32 L 12.45 26.5 L 13 26.65 L 13.55 26.77 L 14.12 26.86 L 14.68 26.92 L 15.24 26.95 L 15.81 26.95 L 16.37 26.92 L 16.93 26.87 L 17.49 26.78 L 18.03 26.67 L 18.58 26.53 L 19.11 26.36 L 19.63 26.16 L 20.14 25.94 L 20.64 25.7 L 21.12 25.43 L 21.58 25.13 L 22.03 24.81 L 22.47 24.47 L 22.88 24.11 L 23.27 23.73 L 23.64 23.33 L 23.99 22.91 L 24.32 22.48 L 24.62 22.03 L 24.9 21.56 L 24.9 21.56 L 24.6 22.01 L 24.26 22.43 L 23.89 22.82 L 23.48 23.17 L 23.05 23.49 L 22.6 23.78 L 22.13 24.03 L 21.65 24.25 L 21.15 24.42 L 20.65 24.56 L 20.14 24.67 L 19.64 24.73 L 19.13 24.76 L 18.63 24.75 L 18.13 24.71 L 17.65 24.63 L 17.17 24.51 L 16.72 24.37 L 16.28 24.19 L 15.86 23.98 L 15.47 23.74 L 15.09 23.48 L 14.75 23.2 L 14.43 22.89 L 14.15 22.56 L 13.89 22.22 L 13.67 21.86 L 13.48 21.5 L 13.33 21.12 L 13.21 20.73 L 13.13 20.35 L 13.08 19.96 L 13.07 19.58 L 13.09 19.2 L 13.15 18.83 L 13.24 18.47 L 13.36 18.13 L 13.52 17.8 L 13.71 17.49 L 13.92 17.2 Z" fill="#ffffff" stroke="#7d6608" stroke-width="0.7" stroke-linejoin="round"></path><circle cx="10.02" cy="19.45" r="4.5" fill="#ffffff"></circle></g></symbol>
<symbol id="kamon-yura-maruni-futatsubiki" viewBox="0 0 32 32"><title>由良家・丸に二つ引（まるにふたつびき）・横瀬氏以来の家紋</title><circle cx="16" cy="16" r="15" fill="#1b4f72" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffd700" stroke-width="2"></circle>
      <line x1="6" y1="12" x2="26" y2="12" stroke="#ffffff" stroke-width="3.2"></line>
      <line x1="6" y1="20" x2="26" y2="20" stroke="#ffffff" stroke-width="3.2"></line></symbol>
<symbol id="kamon-nobesawa-futatsubiki" viewBox="0 0 32 32"><title>延沢家・二つ引両（ふたつひきりょう）・天童氏一族からの推定</title><circle cx="16" cy="16" r="15" fill="#784212" stroke="#ffd700" stroke-width="1.5"></circle><rect x="6" y="10.8" width="20" height="3.6" rx="0.4" fill="#ffffff"></rect><rect x="6" y="17.6" width="20" height="3.6" rx="0.4" fill="#ffffff"></rect></symbol>
<symbol id="kamon-shiratori-futatsubiki" viewBox="0 0 32 32"><title>白鳥家・丸に二つ引両（まるにふたつひきりょう）</title><circle cx="16" cy="16" r="15" fill="#5d6d7e" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <circle cx="16" cy="16" r="12" fill="none" stroke="#ffd700" stroke-width="2"></circle>
      <line x1="6" y1="12" x2="26" y2="12" stroke="#ffffff" stroke-width="3.2"></line>
      <line x1="6" y1="20" x2="26" y2="20" stroke="#ffffff" stroke-width="3.2"></line></symbol>
<symbol id="kamon-nikaido-mitsumori-kikko" viewBox="0 0 32 32"><title>二階堂家・三つ盛亀甲に花菱（みつもりきっこうにはなびし）</title><circle cx="16" cy="16" r="15" fill="#873600" stroke="#ffd700" stroke-width="1.5"></circle><path d="M 20.92 13.73 L 18.46 17.99 L 13.54 17.99 L 11.08 13.73 L 13.54 9.47 L 18.46 9.47 Z M 19.82 13.73 L 17.91 17.03 L 14.09 17.03 L 12.18 13.73 L 14.09 10.42 L 17.91 10.42 Z" fill="#ffffff" fill-rule="evenodd"></path><path transform="translate(16 13.73) rotate(0) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(16 13.73) rotate(90) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(16 13.73) rotate(180) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(16 13.73) rotate(270) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path d="M 13.04 18.27 L 10.59 22.53 L 5.67 22.53 L 3.21 18.27 L 5.66 14.01 L 10.59 14.01 Z M 11.95 18.27 L 10.04 21.58 L 6.22 21.58 L 4.3 18.27 L 6.21 14.97 L 10.04 14.97 Z" fill="#ffffff" fill-rule="evenodd"></path><path transform="translate(8.12 18.27) rotate(0) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(8.12 18.27) rotate(90) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(8.12 18.27) rotate(180) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(8.12 18.27) rotate(270) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path d="M 28.8 18.27 L 26.34 22.53 L 21.41 22.53 L 18.95 18.27 L 21.41 14.01 L 26.34 14.01 Z M 27.7 18.27 L 25.79 21.58 L 21.96 21.58 L 20.05 18.27 L 21.96 14.97 L 25.79 14.97 Z" fill="#ffffff" fill-rule="evenodd"></path><path transform="translate(23.88 18.27) rotate(0) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(23.88 18.27) rotate(90) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(23.88 18.27) rotate(180) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path><path transform="translate(23.88 18.27) rotate(270) scale(1.0)" d="M 0 -0.32 L -1.2 -1.45 Q -1.35 -1.62 -1.2 -1.8 L -0.62 -2.55 Q -0.45 -2.72 -0.28 -2.55 L 0 -2.18 L 0.28 -2.55 Q 0.45 -2.72 0.62 -2.55 L 1.2 -1.8 Q 1.35 -1.62 1.2 -1.45 Z" fill="#ffffff"></path></symbol>
<symbol id="kamon-ishikawa-mukaizuru" viewBox="0 0 32 32"><title>石川家・対い鶴（むかいづる）</title><circle cx="16" cy="16" r="15" fill="#2e4053" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <path d="M 14.9 3.45 L 14.32 3.51 L 13.74 3.6 L 13.17 3.72 L 12.61 3.87 L 12.05 4.04 L 11.5 4.23 L 10.96 4.45 L 10.43 4.7 L 9.91 4.97 L 9.4 5.26 L 8.91 5.58 L 8.44 5.92 L 7.98 6.28 L 7.54 6.66 L 7.11 7.07 L 6.71 7.49 L 6.33 7.93 L 5.96 8.38 L 5.62 8.86 L 5.3 9.35 L 5 9.85 L 4.73 10.37 L 4.48 10.89 L 4.26 11.43 L 4.06 11.98 L 3.88 12.54 L 3.74 13.11 L 3.62 13.68 L 3.52 14.25 L 3.45 14.83 L 3.41 15.42 L 3.4 16 L 8 16 L 7.89 15.62 L 7.79 15.24 L 7.72 14.84 L 7.66 14.44 L 7.62 14.02 L 7.6 13.6 L 7.61 13.18 L 7.64 12.75 L 7.68 12.31 L 7.75 11.88 L 7.85 11.44 L 7.96 11 L 8.1 10.57 L 8.27 10.13 L 8.45 9.7 L 8.66 9.28 L 8.9 8.86 L 9.15 8.45 L 9.43 8.04 L 9.74 7.65 L 10.06 7.27 L 10.41 6.9 L 10.78 6.54 L 11.17 6.2 L 11.58 5.88 L 12.01 5.57 L 12.46 5.28 L 12.93 5.01 L 13.41 4.76 L 13.91 4.53 L 14.43 4.33 L 14.96 4.15 Z" fill="#ffffff"></path><path d="M 14.9 28.55 L 14.32 28.49 L 13.74 28.4 L 13.17 28.28 L 12.61 28.13 L 12.05 27.96 L 11.5 27.77 L 10.96 27.55 L 10.43 27.3 L 9.91 27.03 L 9.4 26.74 L 8.91 26.42 L 8.44 26.08 L 7.98 25.72 L 7.54 25.34 L 7.11 24.93 L 6.71 24.51 L 6.33 24.07 L 5.96 23.62 L 5.62 23.14 L 5.3 22.65 L 5 22.15 L 4.73 21.63 L 4.48 21.11 L 4.26 20.57 L 4.06 20.02 L 3.88 19.46 L 3.74 18.89 L 3.62 18.32 L 3.52 17.75 L 3.45 17.17 L 3.41 16.58 L 3.4 16 L 8 16 L 7.89 16.38 L 7.79 16.76 L 7.72 17.16 L 7.66 17.56 L 7.62 17.98 L 7.6 18.4 L 7.61 18.82 L 7.64 19.25 L 7.68 19.69 L 7.75 20.12 L 7.85 20.56 L 7.96 21 L 8.1 21.43 L 8.27 21.87 L 8.45 22.3 L 8.66 22.72 L 8.9 23.14 L 9.15 23.55 L 9.43 23.96 L 9.74 24.35 L 10.06 24.73 L 10.41 25.1 L 10.78 25.46 L 11.17 25.8 L 11.58 26.12 L 12.01 26.43 L 12.46 26.72 L 12.93 26.99 L 13.41 27.24 L 13.91 27.47 L 14.43 27.67 L 14.96 27.85 Z" fill="#ffffff"></path><path d="M 13.16 4.99 L 12.97 4.23 M 11.57 6 L 11.08 4.89 M 10.23 7.23 L 9.32 5.85 M 9.16 8.61 L 7.75 7.08 M 8.39 10.1 L 6.4 8.56 M 7.9 11.63 L 5.31 10.23 M 7.71 13.16 L 4.5 12.07 M 7.78 14.63 L 4.01 14.01 M 13.16 27.01 L 12.97 27.77 M 11.57 26 L 11.08 27.11 M 10.23 24.77 L 9.32 26.15 M 9.16 23.39 L 7.75 24.92 M 8.39 21.9 L 6.4 23.44 M 7.9 20.37 L 5.31 21.77 M 7.71 18.84 L 4.5 19.93 M 7.78 17.37 L 4.01 17.99" stroke="#d35400" stroke-width="0.38" fill="none"></path><ellipse cx="10.4" cy="16.6" rx="3.0" ry="4.0" fill="#ffffff" stroke="#d35400" stroke-width="0.35"></ellipse><path d="M 8.6 14.6 Q 9.4 15.5 10.2 14.6 M 10.2 14.9 Q 11 15.8 11.8 14.9 M 8.4 16.6 Q 9.2 17.5 10 16.6 M 10.1 16.9 Q 10.9 17.8 11.7 16.9 M 8.7 18.6 Q 9.5 19.5 10.3 18.6 M 10.2 18.8 Q 11 19.7 11.8 18.8" stroke="#d35400" stroke-width="0.3" fill="none"></path><path d="M 11.6 19.2 C 14.4 17.6 14.9 14.6 13.6 12.6 C 12.5 10.9 12.9 9.4 14.1 9.0" stroke="#ffffff" stroke-width="1.7" fill="none" stroke-linecap="round"></path><circle cx="14.25" cy="9.2" r="1.3" fill="#ffffff"></circle><circle cx="14.55" cy="8.9" r="0.3" fill="#d35400"></circle><path d="M 15.0 9.6 L 15.75 13.6 L 15.2 9.4 Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.35" stroke-linejoin="round"></path>
      <g transform="translate(32 0) scale(-1 1)"><path d="M 14.9 3.45 L 14.32 3.51 L 13.74 3.6 L 13.17 3.72 L 12.61 3.87 L 12.05 4.04 L 11.5 4.23 L 10.96 4.45 L 10.43 4.7 L 9.91 4.97 L 9.4 5.26 L 8.91 5.58 L 8.44 5.92 L 7.98 6.28 L 7.54 6.66 L 7.11 7.07 L 6.71 7.49 L 6.33 7.93 L 5.96 8.38 L 5.62 8.86 L 5.3 9.35 L 5 9.85 L 4.73 10.37 L 4.48 10.89 L 4.26 11.43 L 4.06 11.98 L 3.88 12.54 L 3.74 13.11 L 3.62 13.68 L 3.52 14.25 L 3.45 14.83 L 3.41 15.42 L 3.4 16 L 8 16 L 7.89 15.62 L 7.79 15.24 L 7.72 14.84 L 7.66 14.44 L 7.62 14.02 L 7.6 13.6 L 7.61 13.18 L 7.64 12.75 L 7.68 12.31 L 7.75 11.88 L 7.85 11.44 L 7.96 11 L 8.1 10.57 L 8.27 10.13 L 8.45 9.7 L 8.66 9.28 L 8.9 8.86 L 9.15 8.45 L 9.43 8.04 L 9.74 7.65 L 10.06 7.27 L 10.41 6.9 L 10.78 6.54 L 11.17 6.2 L 11.58 5.88 L 12.01 5.57 L 12.46 5.28 L 12.93 5.01 L 13.41 4.76 L 13.91 4.53 L 14.43 4.33 L 14.96 4.15 Z" fill="#ffffff"></path><path d="M 14.9 28.55 L 14.32 28.49 L 13.74 28.4 L 13.17 28.28 L 12.61 28.13 L 12.05 27.96 L 11.5 27.77 L 10.96 27.55 L 10.43 27.3 L 9.91 27.03 L 9.4 26.74 L 8.91 26.42 L 8.44 26.08 L 7.98 25.72 L 7.54 25.34 L 7.11 24.93 L 6.71 24.51 L 6.33 24.07 L 5.96 23.62 L 5.62 23.14 L 5.3 22.65 L 5 22.15 L 4.73 21.63 L 4.48 21.11 L 4.26 20.57 L 4.06 20.02 L 3.88 19.46 L 3.74 18.89 L 3.62 18.32 L 3.52 17.75 L 3.45 17.17 L 3.41 16.58 L 3.4 16 L 8 16 L 7.89 16.38 L 7.79 16.76 L 7.72 17.16 L 7.66 17.56 L 7.62 17.98 L 7.6 18.4 L 7.61 18.82 L 7.64 19.25 L 7.68 19.69 L 7.75 20.12 L 7.85 20.56 L 7.96 21 L 8.1 21.43 L 8.27 21.87 L 8.45 22.3 L 8.66 22.72 L 8.9 23.14 L 9.15 23.55 L 9.43 23.96 L 9.74 24.35 L 10.06 24.73 L 10.41 25.1 L 10.78 25.46 L 11.17 25.8 L 11.58 26.12 L 12.01 26.43 L 12.46 26.72 L 12.93 26.99 L 13.41 27.24 L 13.91 27.47 L 14.43 27.67 L 14.96 27.85 Z" fill="#ffffff"></path><path d="M 13.16 4.99 L 12.97 4.23 M 11.57 6 L 11.08 4.89 M 10.23 7.23 L 9.32 5.85 M 9.16 8.61 L 7.75 7.08 M 8.39 10.1 L 6.4 8.56 M 7.9 11.63 L 5.31 10.23 M 7.71 13.16 L 4.5 12.07 M 7.78 14.63 L 4.01 14.01 M 13.16 27.01 L 12.97 27.77 M 11.57 26 L 11.08 27.11 M 10.23 24.77 L 9.32 26.15 M 9.16 23.39 L 7.75 24.92 M 8.39 21.9 L 6.4 23.44 M 7.9 20.37 L 5.31 21.77 M 7.71 18.84 L 4.5 19.93 M 7.78 17.37 L 4.01 17.99" stroke="#d35400" stroke-width="0.38" fill="none"></path><ellipse cx="10.4" cy="16.6" rx="3.0" ry="4.0" fill="#ffffff" stroke="#d35400" stroke-width="0.35"></ellipse><path d="M 8.6 14.6 Q 9.4 15.5 10.2 14.6 M 10.2 14.9 Q 11 15.8 11.8 14.9 M 8.4 16.6 Q 9.2 17.5 10 16.6 M 10.1 16.9 Q 10.9 17.8 11.7 16.9 M 8.7 18.6 Q 9.5 19.5 10.3 18.6 M 10.2 18.8 Q 11 19.7 11.8 18.8" stroke="#d35400" stroke-width="0.3" fill="none"></path><path d="M 11.6 19.2 C 14.4 17.6 14.9 14.6 13.6 12.6 C 12.5 10.9 12.9 9.4 14.1 9.0" stroke="#ffffff" stroke-width="1.7" fill="none" stroke-linecap="round"></path><circle cx="14.25" cy="9.2" r="1.3" fill="#ffffff"></circle><circle cx="14.55" cy="8.9" r="0.3" fill="#d35400"></circle><path d="M 15.0 9.6 L 15.75 13.6 L 15.2 9.4 Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.35" stroke-linejoin="round"></path></g></symbol>
<symbol id="kamon-honjo-goshichi-kiri" viewBox="0 0 32 32"><title>本庄家・五七の桐（ごしちのきり）</title><circle cx="16" cy="16" r="15" fill="#922b21" stroke="#ffd700" stroke-width="1.5"></circle>
      
      <g transform="translate(16 15.4) scale(1.02) translate(-16 -16)"><path d="M 16 17 L 16 5.2" stroke="#ffffff" stroke-width="0.6"></path><ellipse cx="16" cy="4.6" rx="0.85" ry="1.15" fill="#ffffff"></ellipse><path d="M 16 7.3 L 14.65 6.6" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="14.65" cy="6.4" rx="0.8" ry="1.05" transform="rotate(-28 14.65 6.4)" fill="#ffffff"></ellipse><path d="M 16 7.3 L 17.35 6.6" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="17.35" cy="6.4" rx="0.8" ry="1.05" transform="rotate(28 17.35 6.4)" fill="#ffffff"></ellipse><path d="M 16 9.3 L 14.65 8.6" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="14.65" cy="8.4" rx="0.8" ry="1.05" transform="rotate(-28 14.65 8.4)" fill="#ffffff"></ellipse><path d="M 16 9.3 L 17.35 8.6" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="17.35" cy="8.4" rx="0.8" ry="1.05" transform="rotate(28 17.35 8.4)" fill="#ffffff"></ellipse><path d="M 16 11.3 L 14.65 10.6" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="14.65" cy="10.4" rx="0.8" ry="1.05" transform="rotate(-28 14.65 10.4)" fill="#ffffff"></ellipse><path d="M 16 11.3 L 17.35 10.6" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="17.35" cy="10.4" rx="0.8" ry="1.05" transform="rotate(28 17.35 10.4)" fill="#ffffff"></ellipse><path d="M 10.6 16.4 L 10.6 8.9" stroke="#ffffff" stroke-width="0.6"></path><ellipse cx="10.6" cy="8.3" rx="0.85" ry="1.15" fill="#ffffff"></ellipse><path d="M 10.6 11 L 9.25 10.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="9.25" cy="10.1" rx="0.8" ry="1.05" transform="rotate(-28 9.25 10.1)" fill="#ffffff"></ellipse><path d="M 10.6 11 L 11.95 10.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="11.95" cy="10.1" rx="0.8" ry="1.05" transform="rotate(28 11.95 10.1)" fill="#ffffff"></ellipse><path d="M 10.6 13 L 9.25 12.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="9.25" cy="12.1" rx="0.8" ry="1.05" transform="rotate(-28 9.25 12.1)" fill="#ffffff"></ellipse><path d="M 10.6 13 L 11.95 12.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="11.95" cy="12.1" rx="0.8" ry="1.05" transform="rotate(28 11.95 12.1)" fill="#ffffff"></ellipse><path d="M 21.4 16.4 L 21.4 8.9" stroke="#ffffff" stroke-width="0.6"></path><ellipse cx="21.4" cy="8.3" rx="0.85" ry="1.15" fill="#ffffff"></ellipse><path d="M 21.4 11 L 20.05 10.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="20.05" cy="10.1" rx="0.8" ry="1.05" transform="rotate(-28 20.05 10.1)" fill="#ffffff"></ellipse><path d="M 21.4 11 L 22.75 10.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="22.75" cy="10.1" rx="0.8" ry="1.05" transform="rotate(28 22.75 10.1)" fill="#ffffff"></ellipse><path d="M 21.4 13 L 20.05 12.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="20.05" cy="12.1" rx="0.8" ry="1.05" transform="rotate(-28 20.05 12.1)" fill="#ffffff"></ellipse><path d="M 21.4 13 L 22.75 12.3" stroke="#ffffff" stroke-width="0.4"></path><ellipse cx="22.75" cy="12.1" rx="0.8" ry="1.05" transform="rotate(28 22.75 12.1)" fill="#ffffff"></ellipse><g transform="rotate(-58 16 17.6) translate(16 17.6) scale(0.86) translate(-16 -17.6)"><path d="M 16 17.4 C 18.6 16.7 20.7 17.6 20.8 20.0 C 20.9 22.7 18.7 24.4 16 26.6 C 13.3 24.4 11.1 22.7 11.2 20.0 C 11.3 17.6 13.4 16.7 16 17.4 Z" fill="#ffffff" stroke="#b7950b" stroke-width="0.45"></path><path d="M 16 18.0 L 16 25.6 M 16 20.2 L 13.0 18.9 M 16 20.2 L 19.0 18.9 M 16 22.4 L 13.0 21.4 M 16 22.4 L 19.0 21.4" stroke="#b7950b" stroke-width="0.4" fill="none"></path></g><g transform="rotate(58 16 17.6) translate(16 17.6) scale(0.86) translate(-16 -17.6)"><path d="M 16 17.4 C 18.6 16.7 20.7 17.6 20.8 20.0 C 20.9 22.7 18.7 24.4 16 26.6 C 13.3 24.4 11.1 22.7 11.2 20.0 C 11.3 17.6 13.4 16.7 16 17.4 Z" fill="#ffffff" stroke="#b7950b" stroke-width="0.45"></path><path d="M 16 18.0 L 16 25.6 M 16 20.2 L 13.0 18.9 M 16 20.2 L 19.0 18.9 M 16 22.4 L 13.0 21.4 M 16 22.4 L 19.0 21.4" stroke="#b7950b" stroke-width="0.4" fill="none"></path></g><g transform="rotate(0 16 17.6) translate(16 17.6) scale(1.0) translate(-16 -17.6)"><path d="M 16 17.4 C 18.6 16.7 20.7 17.6 20.8 20.0 C 20.9 22.7 18.7 24.4 16 26.6 C 13.3 24.4 11.1 22.7 11.2 20.0 C 11.3 17.6 13.4 16.7 16 17.4 Z" fill="#ffffff" stroke="#b7950b" stroke-width="0.45"></path><path d="M 16 18.0 L 16 25.6 M 16 20.2 L 13.0 18.9 M 16 20.2 L 19.0 18.9 M 16 22.4 L 13.0 21.4 M 16 22.4 L 19.0 21.4" stroke="#b7950b" stroke-width="0.4" fill="none"></path></g></g></symbol>
<symbol id="kamon-seki-ageha" viewBox="0 0 32 32"><title>関家・揚羽蝶（あげはちょう）</title><circle cx="16" cy="16" r="15" fill="#5d6d7e" stroke="#ffd700" stroke-width="1.5"></circle>
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="#ffd700" stroke-width="1.2"></circle>
      
      <path d="M15.5 12 C14 7.5 9 6 7.5 10 C6.5 13 8 16.5 13 16 C14.5 15.8 15.3 14 15.5 12 Z" fill="#ffffff"></path>
      <path d="M13.5 11.5 C12 8.5 9.5 8 8.8 10 C8.2 11.8 9.5 14 12.5 13.8 Z" fill="#b03a2e"></path>
      <circle cx="10" cy="11.5" r="1" fill="#ffd700"></circle>
      <path d="M16.5 12 C18 7.5 23 6 24.5 10 C25.5 13 24 16.5 19 16 C17.5 15.8 16.7 14 16.5 12 Z" fill="#ffffff"></path>
      <path d="M18.5 11.5 C20 8.5 22.5 8 23.2 10 C23.8 11.8 22.5 14 19.5 13.8 Z" fill="#b03a2e"></path>
      <circle cx="22" cy="11.5" r="1" fill="#ffd700"></circle>
      
      <path d="M15 16.5 C13 17 9.5 20 10.5 23.5 C11 25.5 13.5 25.5 14.5 23 C15.2 21.5 15.3 18.5 15 16.5 Z" fill="#ffffff"></path>
      <circle cx="12" cy="22" r="0.9" fill="#ffd700"></circle>
      <path d="M17 16.5 C19 17 22.5 20 21.5 23.5 C21 25.5 18.5 25.5 17.5 23 C16.8 21.5 16.7 18.5 17 16.5 Z" fill="#ffffff"></path>
      <circle cx="20" cy="22" r="0.9" fill="#ffd700"></circle>
      
      <ellipse cx="16" cy="17" rx="1.1" ry="5.5" fill="#ffd700"></ellipse>
      <circle cx="16" cy="10" r="1.3" fill="#ffd700"></circle>
      <path d="M15.5 9 C14.5 7.5 13 6.8 12.5 7.5 C12 8.2 13 9 14 8.5" fill="none" stroke="#ffd700" stroke-width="0.8" stroke-linecap="round"></path>
      <path d="M16.5 9 C17.5 7.5 19 6.8 19.5 7.5 C20 8.2 19 9 18 8.5" fill="none" stroke="#ffd700" stroke-width="0.8" stroke-linecap="round"></path></symbol>
<symbol id="kamon-ochi-tatebiki-mukaigashiwa" viewBox="0 0 32 32"><title>越智家・立引に向い柏（たてびきにむかいかしわ）</title><circle cx="16" cy="16" r="15" fill="#7d6608" stroke="#ffd700" stroke-width="1.5"></circle><rect x="15" y="4.4" width="2" height="23.2" fill="#ffffff"></rect><path d="M13.6 26 C9.8 25 7.6 22.6 7.4 19.6 C8.4 19.8 9 19.2 8.6 18.2 C7.6 16.6 7.8 14.4 8.6 13.2 C9.4 13.8 10.2 13.4 10 12.4 C10 10.4 11 8.4 12.4 7.2 C12.8 8.2 13.4 8.4 13.6 7.8 Z" fill="#ffffff"></path><path d="M13.2 25 C11.4 21 10.8 15 12 9.2" stroke="#7d6608" stroke-width="0.6" fill="none"></path><path d="M11.4 19 L8.8 18.4 M11 14.4 L9 13.6 M11.6 11 L10.6 9.8" stroke="#7d6608" stroke-width="0.45"></path><g transform="translate(32 0) scale(-1 1)"><path d="M13.6 26 C9.8 25 7.6 22.6 7.4 19.6 C8.4 19.8 9 19.2 8.6 18.2 C7.6 16.6 7.8 14.4 8.6 13.2 C9.4 13.8 10.2 13.4 10 12.4 C10 10.4 11 8.4 12.4 7.2 C12.8 8.2 13.4 8.4 13.6 7.8 Z" fill="#ffffff"></path><path d="M13.2 25 C11.4 21 10.8 15 12 9.2" stroke="#7d6608" stroke-width="0.6" fill="none"></path><path d="M11.4 19 L8.8 18.4 M11 14.4 L9 13.6 M11.6 11 L10.6 9.8" stroke="#7d6608" stroke-width="0.45"></path></g></symbol>
<symbol id="kamon-akai-musubi-karigane" viewBox="0 0 32 32"><title>赤井家・丸に結び雁金（まるにむすびかりがね）</title><circle cx="16" cy="16" r="15" fill="#a93226" stroke="#ffd700" stroke-width="1.5"></circle><circle cx="16" cy="16" r="12.4" fill="none" stroke="#ffffff" stroke-width="1.4"></circle><path d="M15 15.6 C12.8 12.4 9.6 10.4 5.8 10.6 C7.4 12 8.2 13.6 8.4 15.4 C9.8 14.6 11 14.8 11.8 15.6 C12.4 14.8 13.8 14.8 15 15.6 Z" fill="#ffffff"></path><path d="M9.6 12.4 C10.8 12.6 12.2 13.4 13.2 14.6" stroke="#a93226" stroke-width="0.5" fill="none"></path><g transform="translate(32 0) scale(-1 1)"><path d="M15 15.6 C12.8 12.4 9.6 10.4 5.8 10.6 C7.4 12 8.2 13.6 8.4 15.4 C9.8 14.6 11 14.8 11.8 15.6 C12.4 14.8 13.8 14.8 15 15.6 Z" fill="#ffffff"></path><path d="M9.6 12.4 C10.8 12.6 12.2 13.4 13.2 14.6" stroke="#a93226" stroke-width="0.5" fill="none"></path></g><circle cx="16" cy="8.8" r="1.7" fill="#ffffff"></circle><path d="M17.4 8.6 L19 9.2 L17.4 9.4 Z" fill="#ffd700"></path><path d="M16 10.4 C16 12 16 13 16 14.2" stroke="#ffffff" stroke-width="1.4"></path><path d="M16 14.6 C13 15.6 13 19.6 16 19.8 C19 19.6 19 15.6 16 14.6 Z M16 16.2 C14.8 16.8 14.8 18.6 16 18.6 C17.2 18.6 17.2 16.8 16 16.2 Z" fill="#ffffff" fill-rule="evenodd"></path><path d="M15.2 19.6 L13.2 24.4 M16.8 19.6 L18.8 24.4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path></symbol>
<symbol id="kamon-tsukushi-yorikakari-meyui" viewBox="0 0 32 32"><title>筑紫家・寄懸り目結（よりかかりめゆい）</title><circle cx="16" cy="16" r="15" fill="#7d6608" stroke="#ffd700" stroke-width="1.5"></circle><g transform="translate(16 9.6) rotate(20)"><rect x="-3" y="-3" width="6" height="6" fill="#ffffff"></rect><rect x="-1.1" y="-1.1" width="2.2" height="2.2" fill="#7d6608"></rect></g><g transform="translate(22.4 16) rotate(20)"><rect x="-3" y="-3" width="6" height="6" fill="#ffffff"></rect><rect x="-1.1" y="-1.1" width="2.2" height="2.2" fill="#7d6608"></rect></g><g transform="translate(16 22.4) rotate(20)"><rect x="-3" y="-3" width="6" height="6" fill="#ffffff"></rect><rect x="-1.1" y="-1.1" width="2.2" height="2.2" fill="#7d6608"></rect></g><g transform="translate(9.6 16) rotate(20)"><rect x="-3" y="-3" width="6" height="6" fill="#ffffff"></rect><rect x="-1.1" y="-1.1" width="2.2" height="2.2" fill="#7d6608"></rect></g></symbol>
<symbol id="kamon-hata-futatsubiki-mitsuboshi" viewBox="0 0 32 32"><title>波多家・二つ引両に三つ星（ふたつひきりょうにみつぼし）</title><circle cx="16" cy="16" r="15" fill="#1a5276" stroke="#ffd700" stroke-width="1.5"></circle><rect x="7" y="7.2" width="18" height="2.8" fill="#ffffff"></rect><rect x="7" y="11.8" width="18" height="2.8" fill="#ffffff"></rect><circle cx="16" cy="18.8" r="2.6" fill="#ffffff"></circle><circle cx="11.6" cy="23.4" r="2.6" fill="#ffffff"></circle><circle cx="20.4" cy="23.4" r="2.6" fill="#ffffff"></circle></symbol>
<symbol id="kamon-kokura-mori-tsurumaru" viewBox="0 0 32 32"><title>毛利家（豊前小倉）・鶴の丸（つるのまる）</title><circle cx="16" cy="16" r="15" fill="#7b241c" stroke="#ffd700" stroke-width="1.5"></circle><path d="M19.8 7.6 A9.4 9.4 0 1 1 11.4 7.8" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"></path><line x1="23.14" y1="14.00" x2="26.34" y2="12.84" stroke="#7b241c" stroke-width="0.5"></line><line x1="23.60" y1="16.87" x2="26.99" y2="16.98" stroke="#7b241c" stroke-width="0.5"></line><line x1="22.94" y1="19.69" x2="26.05" y2="21.07" stroke="#7b241c" stroke-width="0.5"></line><line x1="21.28" y1="22.07" x2="23.64" y2="24.51" stroke="#7b241c" stroke-width="0.5"></line><line x1="18.85" y1="23.65" x2="20.12" y2="26.80" stroke="#7b241c" stroke-width="0.5"></line><line x1="16.00" y1="24.20" x2="16.00" y2="27.60" stroke="#7b241c" stroke-width="0.5"></line><line x1="13.15" y1="23.65" x2="11.88" y2="26.80" stroke="#7b241c" stroke-width="0.5"></line><line x1="10.72" y1="22.07" x2="8.36" y2="24.51" stroke="#7b241c" stroke-width="0.5"></line><line x1="9.06" y1="19.69" x2="5.95" y2="21.07" stroke="#7b241c" stroke-width="0.5"></line><line x1="8.40" y1="16.87" x2="5.01" y2="16.98" stroke="#7b241c" stroke-width="0.5"></line><path d="M11.4 7.8 C13 9.6 14.6 9.6 15.6 8.4" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"></path><ellipse cx="16.4" cy="7.8" rx="1.9" ry="1.5" fill="#ffffff"></ellipse><path d="M18 7.6 L21.4 8.6 L18 8.6 Z" fill="#ffd700"></path><circle cx="16.2" cy="6.8" r="0.8" fill="#e74c3c"></circle><path d="M13.4 19.4 C14.6 21.6 17.4 21.6 18.6 19.4 C17.6 22.8 14.4 22.8 13.4 19.4 Z" fill="#ffffff"></path></symbol>
<symbol id="kamon-terazawa-kani" viewBox="0 0 32 32"><title>寺沢家・蟹（かに）</title><circle cx="16" cy="16" r="15" fill="#566573" stroke="#ffd700" stroke-width="1.5"></circle><path d="M11.8 16.4 L7.4 18.0 L5.8 20.4" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.8 18.6 L7.4 20.800000000000004 L5.8 23.0" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.8 20.8 L7.4 23.6 L5.8 25.6" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.2 13.6 L9.4 11 L8.6 8.4" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path><path d="M8.4 9.6 C5.4 8.8 5.2 5.2 7.6 4.6 C7.4 6.2 8.2 6.8 9.2 6.8 C9.6 5.6 10.8 5.2 11.6 5.8 C10.6 6.6 10.4 8.2 8.4 9.6 Z" fill="#ffffff"></path><g transform="translate(32 0) scale(-1 1)"><path d="M11.8 16.4 L7.4 18.0 L5.8 20.4" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.8 18.6 L7.4 20.800000000000004 L5.8 23.0" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.8 20.8 L7.4 23.6 L5.8 25.6" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.2 13.6 L9.4 11 L8.6 8.4" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path><path d="M8.4 9.6 C5.4 8.8 5.2 5.2 7.6 4.6 C7.4 6.2 8.2 6.8 9.2 6.8 C9.6 5.6 10.8 5.2 11.6 5.8 C10.6 6.6 10.4 8.2 8.4 9.6 Z" fill="#ffffff"></path></g><ellipse cx="16" cy="17.6" rx="5.6" ry="4.6" fill="#ffffff"></ellipse><path d="M12.4 16.4 C14.6 18 17.4 18 19.6 16.4" stroke="#566573" stroke-width="0.6" fill="none"></path><path d="M13.4 19.4 C15 20.4 17 20.4 18.6 19.4" stroke="#566573" stroke-width="0.5" fill="none"></path><circle cx="14.4" cy="13.2" r="0.9" fill="#ffffff"></circle><circle cx="17.6" cy="13.2" r="0.9" fill="#ffffff"></circle><circle cx="14.4" cy="13.2" r="0.4" fill="#566573"></circle><circle cx="17.6" cy="13.2" r="0.4" fill="#566573"></circle></symbol>
<symbol id="kamon-araki-daki-botan" viewBox="0 0 32 32"><title>荒木家・抱き牡丹（だきぼたん）</title><circle cx="16" cy="16" r="15" fill="#5b2c6f" stroke="#ffd700" stroke-width="1.5"></circle><path d="M15.2 26.6 C9.2 25.4 5.4 20.6 5.6 14.4 C6.8 15.6 8 15.4 8.4 14 C8.2 12.4 9.2 11 10.4 10.6 C10.6 12 11.6 12.6 12.4 12 C11.4 16.6 12.4 21.6 15.2 26.6 Z" fill="#ffffff"></path><path d="M14.6 25.4 C10.6 22 8.6 18.4 8.4 15" stroke="#ffd700" stroke-width="0.5" fill="none"></path><g transform="translate(32 0) scale(-1 1)"><path d="M15.2 26.6 C9.2 25.4 5.4 20.6 5.6 14.4 C6.8 15.6 8 15.4 8.4 14 C8.2 12.4 9.2 11 10.4 10.6 C10.6 12 11.6 12.6 12.4 12 C11.4 16.6 12.4 21.6 15.2 26.6 Z" fill="#ffffff"></path><path d="M14.6 25.4 C10.6 22 8.6 18.4 8.4 15" stroke="#ffd700" stroke-width="0.5" fill="none"></path></g><g transform="rotate(0 16 12.4)"><ellipse cx="16" cy="8" rx="2.4" ry="3.2" fill="#ffffff"></ellipse></g><g transform="rotate(60 16 12.4)"><ellipse cx="16" cy="8" rx="2.4" ry="3.2" fill="#ffffff"></ellipse></g><g transform="rotate(120 16 12.4)"><ellipse cx="16" cy="8" rx="2.4" ry="3.2" fill="#ffffff"></ellipse></g><g transform="rotate(180 16 12.4)"><ellipse cx="16" cy="8" rx="2.4" ry="3.2" fill="#ffffff"></ellipse></g><g transform="rotate(240 16 12.4)"><ellipse cx="16" cy="8" rx="2.4" ry="3.2" fill="#ffffff"></ellipse></g><g transform="rotate(300 16 12.4)"><ellipse cx="16" cy="8" rx="2.4" ry="3.2" fill="#ffffff"></ellipse></g><circle cx="16" cy="12.4" r="3.4" fill="#5b2c6f"></circle><g transform="rotate(30 16 12.4)"><ellipse cx="16" cy="10.4" rx="1.4" ry="1.9" fill="#ffffff"></ellipse></g><g transform="rotate(90 16 12.4)"><ellipse cx="16" cy="10.4" rx="1.4" ry="1.9" fill="#ffffff"></ellipse></g><g transform="rotate(150 16 12.4)"><ellipse cx="16" cy="10.4" rx="1.4" ry="1.9" fill="#ffffff"></ellipse></g><g transform="rotate(210 16 12.4)"><ellipse cx="16" cy="10.4" rx="1.4" ry="1.9" fill="#ffffff"></ellipse></g><g transform="rotate(270 16 12.4)"><ellipse cx="16" cy="10.4" rx="1.4" ry="1.9" fill="#ffffff"></ellipse></g><g transform="rotate(330 16 12.4)"><ellipse cx="16" cy="10.4" rx="1.4" ry="1.9" fill="#ffffff"></ellipse></g><circle cx="16" cy="12.4" r="1.1" fill="#ffd700"></circle></symbol>
  `;
  function ids() { return (NEW_CLAN_KAMONS.match(/<symbol id="([^"]+)"/g) || []).map(function (s) { return s.slice(12, -1); }); }
  function addToSource() {
    if (!window.KAMONS_SVG_CONTENT) return;
    var missing = ids().some(function (id) { return window.KAMONS_SVG_CONTENT.indexOf('id="' + id + '"') === -1; });
    if (missing) window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace('</defs>', NEW_CLAN_KAMONS + '\n</defs>');
  }
  function addToDocument() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    var defs = document.getElementById('mapSvgDefs') || document.querySelector('#kamonsGlobalContainer defs');
    if (!defs || typeof DOMParser === 'undefined') return;
    var parsed = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><defs>' + NEW_CLAN_KAMONS + '</defs></svg>', 'image/svg+xml');
    Array.prototype.forEach.call(parsed.querySelectorAll('symbol'), function (sym) {
      if (!document.getElementById(sym.id)) defs.appendChild(document.importNode(sym, true));
    });
  }
  addToSource();
  addToDocument();
  var prev = window.installKamonOverrides;
  window.installKamonOverrides = function () {
    if (typeof prev === 'function') prev();
    addToSource();
    addToDocument();
  };
})();
