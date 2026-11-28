/**

 * @file js/core/GameState.js - データ状態管理・ターン進行・武将人事・合戦・歴史イベント

 * 戦国天下統一伝 ES6モジュール

 * @typedef {import('../types.js').Officer} Officer

 * @typedef {import('../types.js').Province} Province

 * @typedef {import('../types.js').PlayableDaimyo} PlayableDaimyo

 * @typedef {import('../types.js').Scenario} Scenario

 * @typedef {import('../types.js').HistoricalEvent} HistoricalEvent

 * @typedef {import('../types.js').AllianceBond} AllianceBond

 * @typedef {import('../types.js').GameSaveData} GameSaveData

 */



// ── 出身国（originProv）と時期別所領（fiefs:[{from,to,province,castle,clan?}]） ──

/** 指定年に有効な所領。master の fiefs を優先（ゲーム中の武将コピーにも fiefs は残る） */

export function officerFiefAt(o, year) {

  const fiefs = o && Array.isArray(o.fiefs) ? o.fiefs : null;

  if (!fiefs || !fiefs.length || year == null) return null;

  return fiefs.find(f => f && f.province && (f.from == null || year >= f.from) && (f.to == null || year <= f.to)) || null;

}

/** 指定年の拠点国：有効な所領 → 最初の所領より前なら originProv → 最後の所領より後なら最後の所領。fiefs が無ければ null（従来どおり） */

export function officerProvAtYear(o, year) {

  const fiefs = o && Array.isArray(o.fiefs) ? o.fiefs.filter(f => f && f.province) : [];

  if (!fiefs.length || year == null) return null;

  const hit = officerFiefAt(o, year);

  if (hit) return hit.province;

  const firstFrom = Math.min(...fiefs.map(f => (f.from == null ? -Infinity : f.from)));

  if (year < firstFrom) return o.originProv || null;

  const last = fiefs.slice().sort((a, b) => (b.to ?? Infinity) - (a.to ?? Infinity))[0];

  return last ? last.province : null;

}

if (typeof window !== 'undefined') { window.officerFiefAt = officerFiefAt; window.officerProvAtYear = officerProvAtYear; }

// ── 季節（ターン）制度：1年＝春・初夏・盛夏・秋・冬の5ターン（2026-11-07） ──
// 旧制度（春・夏・秋・冬の4季）のシナリオ・イベント・セーブは読み込み時に新制度へ換算する
export var SEASONS_PER_YEAR = 5;
export var SEASON_NAMES = ['春', '初夏', '盛夏', '秋', '冬'];
export var SEASON = { SPRING: 0, EARLY_SUMMER: 1, MIDSUMMER: 2, AUTUMN: 3, WINTER: 4 };
export var LEGACY_SEASON_TO_NEW = [0, 2, 3, 4]; // 旧 0春 1夏 2秋 3冬 → 新 0春 2盛夏 3秋 4冬
/** 季節名 → 新インデックス。旧データの「夏」は盛夏として扱う */
export function seasonIdxFromName(name) {
  const m = { '春': 0, '初夏': 1, '盛夏': 2, '夏': 2, '秋': 3, '冬': 4 };
  return m[String(name || '').trim()];
}
/** 季節名を正規化（「夏」→「盛夏」） */
export function normalizeSeasonName(name) {
  if (name === undefined || name === null) return name;
  const i = seasonIdxFromName(name);
  return i === undefined ? name : SEASON_NAMES[i];
}
/** 旧4季インデックス → 新5季インデックス */
export function legacySeasonIdxToNew(i) {
  const n = Math.round(Number(i) || 0);
  return LEGACY_SEASON_TO_NEW[((n % 4) + 4) % 4];
}
/** 旧4季単位の通し番号（年*4+季）→ 新5季単位の通し番号 */
export function legacyTurnIndexToNew(v) {
  const n = Math.round(Number(v) || 0);
  const y = Math.floor(n / 4);
  return y * SEASONS_PER_YEAR + legacySeasonIdxToNew(n - y * 4);
}
/** 旧4季単位の期間（季数）→ 新5季単位（年数換算を保つ） */
export function legacySeasonCountToNew(n) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? Math.max(1, Math.round(v * SEASONS_PER_YEAR / 4)) : v;
}
/** 新インデックス → 描画・天候用の旧4季（0春 1夏 2秋 3冬） */
export function seasonVisualIdx(i) { return [0, 1, 1, 2, 3][Number(i) || 0] ?? 0; }
if (typeof window !== 'undefined') {
  Object.assign(window, { SEASONS_PER_YEAR, SEASON_NAMES, SEASON, seasonIdxFromName, normalizeSeasonName, legacySeasonIdxToNew, legacyTurnIndexToNew, legacySeasonCountToNew, seasonVisualIdx });
}



// モジュール間安全参照ヘルパー

export var getClanAbility = (clanId) => (typeof window !== 'undefined' && typeof window.getClanAbility === 'function')

  ? window.getClanAbility(clanId)

  : ((typeof window !== 'undefined' && window.CLAN_ABILITIES?.[clanId]) || { politics: 60, military: 60, stratagem: 55, personality: 'balanced' });



export function _createArrayProxy(getter) {

  return new Proxy([], {

    get(target, prop, receiver) {

      const arr = getter();

      if (prop === 'length') return arr.length;

      if (prop === Symbol.iterator) return arr[Symbol.iterator].bind(arr);

      const val = Reflect.get(arr, prop, receiver);

      return typeof val === 'function' ? val.bind(arr) : val;

    },

    has(target, prop) { return Reflect.has(getter(), prop); },

    ownKeys(target) { return Reflect.ownKeys(getter()); },

    getOwnPropertyDescriptor(target, prop) { return Object.getOwnPropertyDescriptor(getter(), prop); }

  });

}

export function _createObjectProxy(getter) {

  return new Proxy({}, {

    get(target, prop, receiver) {

      const obj = getter();

      const val = Reflect.get(obj, prop, receiver);

      return typeof val === 'function' ? val.bind(obj) : val;

    },

    has(target, prop) { return Reflect.has(getter(), prop); },

    ownKeys(target) { return Reflect.ownKeys(getter()); },

    getOwnPropertyDescriptor(target, prop) { return Object.getOwnPropertyDescriptor(getter(), prop); }

  });

}



export var SCENARIOS = _createArrayProxy(() => (typeof window !== 'undefined' && ((window.SCENARIOS_DATA?.length ? window.SCENARIOS_DATA : window.SCENARIOS) || [])) || []);

export var INITIAL_PROVINCES = _createArrayProxy(() => (typeof window !== 'undefined' && ((window.PROVINCES_DATA?.length ? window.PROVINCES_DATA : window.INITIAL_PROVINCES) || [])) || []);

export var CLAN_MASTER = _createObjectProxy(() => (typeof window !== 'undefined' && (window.CLAN_MASTER_DATA || window.CLAN_MASTER || {})) || {});

export var INITIAL_ALLIANCE_DURATION_SEASONS = (typeof window !== 'undefined' && window.INITIAL_ALLIANCE_DURATION_SEASONS) || 25; // 5年（5ターン制）

export var ALLIANCE_DURATION_SEASONS = (typeof window !== 'undefined' && window.ALLIANCE_DURATION_SEASONS) || 10; // 2年（5ターン制）

export var DAIMYOS = (typeof window !== 'undefined' && window.DAIMYOS) || [];

export var FORMATIONS_DATA = (typeof window !== 'undefined' && window.FORMATIONS_DATA) || {};

export var DAIMYO_EPILOGUES = (typeof window !== 'undefined' && window.DAIMYO_EPILOGUES) || {};

export var EVENT_CLAN_LINEAGE = (typeof window !== 'undefined' && window.EVENT_CLAN_LINEAGE) || [

  ['genji_yoritomo', 'minamoto_yoritomo', 'genji', 'minamoto_yoshitomo'],

  ['kiso', 'kiso_genji'],

  ['tokugawa', 'matsudaira'],

  ['uesugi', 'nagao']

];

export var EVENT_TROOP_BOOST_CAP = 1.6;

export var EVENT_TROOP_ADD_CAP = 3000;

export var HISTORICAL_ALLIANCE_BONDS = (typeof window !== 'undefined' && window.HISTORICAL_ALLIANCE_BONDS) || [];



export function formatHistoricalYear(year) {

  if (year === null || year === undefined || year === '') return '';

  const str = String(year).trim();

  if (str.startsWith('前') || str.startsWith('紀元前')) return str;

  const y = Number(year);

  if (isNaN(y)) return str;

  return y < 0 ? `前${Math.abs(y)}` : `${y}`;

}

if (typeof window !== 'undefined') window.formatHistoricalYear = formatHistoricalYear;



/** 和暦（元号）表。[元号, 開始年(西暦), 表示に使い始める年(省略時=開始年)]

 *  改元のあった年は新元号で表示（その年を新元号元年とする対照表の慣例）。

 *  南北朝期（1331〜1392）は南朝の元号を採用（明治以降の正統）。1393年より北朝系の明徳（4年）へ。

 *  元号のない年（大化以前・白雉と朱鳥の間・朱鳥と大宝の間）は天皇の治世年で表示（JAPANESE_REIGNS）。 */

export const JAPANESE_ERAS = [

  ['大化',645],['白雉',650],['@',655],['朱鳥',686],['@',687],['大宝',701],['慶雲',704],['和銅',708],['霊亀',715],['養老',717],['神亀',724],

  ['天平',729],['天平感宝',749],['天平勝宝',749],['天平宝字',757],['天平神護',765],['神護景雲',767],['宝亀',770],['天応',781],['延暦',782],

  ['大同',806],['弘仁',810],['天長',824],['承和',834],['嘉祥',848],['仁寿',851],['斉衡',854],['天安',857],['貞観',859],['元慶',877],

  ['仁和',885],['寛平',889],['昌泰',898],['延喜',901],['延長',923],['承平',931],['天慶',938],['天暦',947],['天徳',957],['応和',961],

  ['康保',964],['安和',968],['天禄',970],['天延',973],['貞元',976],['天元',978],['永観',983],['寛和',985],['永延',987],['永祚',989],

  ['正暦',990],['長徳',995],['長保',999],['寛弘',1004],['長和',1012],['寛仁',1017],['治安',1021],['万寿',1024],['長元',1028],['長暦',1037],

  ['長久',1040],['寛徳',1044],['永承',1046],['天喜',1053],['康平',1058],['治暦',1065],['延久',1069],['承保',1074],['承暦',1077],['永保',1081],

  ['応徳',1084],['寛治',1087],['嘉保',1094],['永長',1096],['承徳',1097],['康和',1099],['長治',1104],['嘉承',1106],['天仁',1108],['天永',1110],

  ['永久',1113],['元永',1118],['保安',1120],['天治',1124],['大治',1126],['天承',1131],['長承',1132],['保延',1135],['永治',1141],['康治',1142],

  ['天養',1144],['久安',1145],['仁平',1151],['久寿',1154],['保元',1156],['平治',1159],['永暦',1160],['応保',1161],['長寛',1163],['永万',1165],

  ['仁安',1166],['嘉応',1169],['承安',1171],['安元',1175],['治承',1177],['養和',1181],['寿永',1182],['元暦',1184],['文治',1185],['建久',1190],

  ['正治',1199],['建仁',1201],['元久',1204],['建永',1206],['承元',1207],['建暦',1211],['建保',1213],['承久',1219],['貞応',1222],['元仁',1224],

  ['嘉禄',1225],['安貞',1227],['寛喜',1229],['貞永',1232],['天福',1233],['文暦',1234],['嘉禎',1235],['暦仁',1238],['延応',1239],['仁治',1240],

  ['寛元',1243],['宝治',1247],['建長',1249],['康元',1256],['正嘉',1257],['正元',1259],['文応',1260],['弘長',1261],['文永',1264],['建治',1275],

  ['弘安',1278],['正応',1288],['永仁',1293],['正安',1299],['乾元',1302],['嘉元',1303],['徳治',1306],['延慶',1308],['応長',1311],['正和',1312],

  ['文保',1317],['元応',1319],['元亨',1321],['正中',1324],['嘉暦',1326],['元徳',1329],

  // 南朝

  ['元弘',1331],['建武',1334],['延元',1336],['興国',1340],['正平',1346],['建徳',1370],['文中',1372],['天授',1375],['弘和',1381],['元中',1384],

  ['明徳',1390,1393],['応永',1394],['正長',1428],['永享',1429],['嘉吉',1441],['文安',1444],['宝徳',1449],['享徳',1452],['康正',1455],['長禄',1457],

  ['寛正',1460],['文正',1466],['応仁',1467],['文明',1469],['長享',1487],['延徳',1489],['明応',1492],['文亀',1501],['永正',1504],['大永',1521],

  ['享禄',1528],['天文',1532],['弘治',1555],['永禄',1558],['元亀',1570],['天正',1573],['文禄',1592],['慶長',1596],['元和',1615],['寛永',1624],

  ['正保',1644],['慶安',1648],['承応',1652],['明暦',1655],['万治',1658],['寛文',1661],['延宝',1673],['天和',1681],['貞享',1684],['元禄',1688],

  ['宝永',1704],['正徳',1711],['享保',1716],['元文',1736],['寛保',1741],['延享',1744],['寛延',1748],['宝暦',1751],['明和',1764],['安永',1772],

  ['天明',1781],['寛政',1789],['享和',1801],['文化',1804],['文政',1818],['天保',1830],['弘化',1844],['嘉永',1848],['安政',1854],['万延',1860],

  ['文久',1861],['元治',1864],['慶応',1865],['明治',1868],['大正',1912],['昭和',1926],['平成',1989],['令和',2019]

];

if (typeof window !== 'undefined') window.JAPANESE_ERAS = JAPANESE_ERAS;



/** 元号のない時代は天皇の治世年（御代）で表す。京都通百科事典「皇紀・年号・歴代天皇・歴代将軍」の表に準拠。

 *  [表示名, 元年(西暦。負数=紀元前)]。即位から元年までの空き年は前代の治世年を続けて数える。 */

export const JAPANESE_REIGNS = [

  ['神武',-660],['綏靖',-581],['安寧',-548],['懿徳',-510],['孝昭',-475],['孝安',-392],['孝霊',-290],['孝元',-214],

  ['開化',-157],['崇神',-97],['垂仁',-29],['景行',71],['成務',131],['仲哀',192],['神功',201],['応神',270],

  ['仁徳',313],['履中',400],['反正',406],['允恭',412],['安康',454],['雄略',457],['清寧',480],['顕宗',485],

  ['仁賢',488],['武烈',499],['継体',507],['安閑',534],['宣化',536],['欽明',540],['敏達',572],['用明',586],

  ['崇峻',588],['推古',593],['舒明',629],['皇極',642],

  // 白雉と朱鳥の間・朱鳥と大宝の間

  ['斉明',655],['天智',662],['天武',672],['持統',687],['文武',697]

];

if (typeof window !== 'undefined') window.JAPANESE_REIGNS = JAPANESE_REIGNS;



/** 西暦（負数=紀元前、0年なし）→ 和暦文字列（例: 令和4 / 明治元 / 推古8 / 神武元 / 神武前3） */

export function getJapaneseEraLabel(year) {

  const y = Math.trunc(Number(year));

  if (!Number.isFinite(y) || y === 0) return '';

  const astro = v => (v < 0 ? v + 1 : v); // 0年なしの暦を連続した数に直す

  const reign = () => {

    let hit = null;

    for (const r of JAPANESE_REIGNS) {

      if (y < 645 && r[1] >= 645) break;

      if (astro(y) >= astro(r[1])) hit = r; else if (y < 645) break;

    }

    if (!hit) {

      // 神武元年（紀元前660年）より前

      return `神武前${astro(-660) - astro(y)}`;

    }

    const n = astro(y) - astro(hit[1]) + 1;

    return `${hit[0]}${n === 1 ? '元' : n}`;

  };

  if (y < 645) return reign();

  let hit = null;

  for (const e of JAPANESE_ERAS) {

    if (y >= (e[2] || e[1])) hit = e; else break;

  }

  if (!hit || hit[0] === '@') return reign();

  const n = y - hit[1] + 1;

  return `${hit[0]}${n === 1 ? '元' : n}`;

}

if (typeof window !== 'undefined') window.getJapaneseEraLabel = getJapaneseEraLabel;



/** 上部表示用: 令和4(2022) / 神武前3(前663) */

export function formatYearWithEra(year) {

  const base = formatHistoricalYear(year);

  const era = getJapaneseEraLabel(year);

  return era ? `${era}(${base})` : base;

}

if (typeof window !== 'undefined') window.formatYearWithEra = formatYearWithEra;

/** 上部表示用HTML（元号部分をやや小さく表示） */

export function formatYearWithEraHtml(year) {

  const base = formatHistoricalYear(year);

  const era = getJapaneseEraLabel(year);

  return era ? `${era}<span class="era-paren">(${base})</span>` : base;

}

if (typeof window !== 'undefined') window.formatYearWithEraHtml = formatYearWithEraHtml;



/** 数値を漢数字・大字（百拾七、七拾七、六拾九など）へ変換（100以上・1000以上にも完全対応） */
export function toKanjiNumber(n) {
  const digits = ['〇', '壱', '弐', '参', '四', '五', '六', '七', '八', '九'];
  n = Math.floor(Number(n)) || 0;
  if (n <= 0) return '零';
  if (n < 10) return digits[n];
  if (n < 20) {
    return (n === 10) ? '拾' : ('拾' + digits[n % 10]);
  }
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return digits[tens] + '拾' + (ones > 0 ? digits[ones] : '');
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const hStr = (hundreds === 1) ? '百' : (digits[hundreds] + '百');
    if (remainder === 0) return hStr;
    if (remainder < 10) return hStr + digits[remainder];
    if (remainder === 10) return hStr + '拾';
    if (remainder < 20) return hStr + '拾' + digits[remainder % 10];
    const tens = Math.floor(remainder / 10);
    const ones = remainder % 10;
    return hStr + digits[tens] + '拾' + (ones > 0 ? digits[ones] : '');
  }
  const thousands = Math.floor(n / 1000);
  const rem1000 = n % 1000;
  const tStr = (thousands === 1) ? '千' : (digits[thousands] + '千');
  if (rem1000 === 0) return tStr;
  return tStr + toKanjiNumber(rem1000);
}

if (typeof window !== 'undefined') window.toKanjiNumber = toKanjiNumber;



/** 時代区分ごとの用語・UIフレーバー設定 */

export const ERA_CONFIG = {

  ancient: {

    key: 'ancient',

    name: '古代・神話・飛鳥奈良',

    daimyoLabel: '首長',

    daimyoPlural: '諸豪族',

    rulerTitle: '首長',

    kokudakaLabel: '収穫高',

    kokudakaUnit: '束',

    kokudakaDesc: '穀力・収穫（石相当）',

    goldLabel: '宝玉・金銅',

    goldUnit: '貫',

    riceLabel: '稲実穀米',

    riceUnit: '束',

    troopsLabel: '動員軍勢',

    troopsUnit: '人',

    shootCommand: '🏹 弓矢射撃',

    shootDesc: '遠距離矢戦',

    tacticCommand: '⚡ 神威奥義',

    tacticDesc: '神祇の霊威',

    conquestGoal: '日本全土統一・大和建国',

    calcNote: (rice) => `稲実 ${rice}束 （現代換算: 約${(rice / 10).toFixed(1)}万石 / 最大動員: ${(rice * 12 + 2500).toLocaleString()}人）`

  },

  medieval: {

    key: 'medieval',

    name: '中世・源平・南北朝',

    daimyoLabel: '武家棟梁',

    daimyoPlural: '諸将・領主',

    rulerTitle: '武門領主',

    kokudakaLabel: '荘園高',

    kokudakaUnit: '貫',

    kokudakaDesc: '荘園公事・段銭',

    goldLabel: '軍資金',

    goldUnit: '貫文',

    riceLabel: '兵糧米',

    riceUnit: '石',

    troopsLabel: '郎党・軍勢',

    troopsUnit: '騎',

    shootCommand: '🏹 強弓斉射',

    shootDesc: '遠距離矢合せ',

    tacticCommand: '⚡ 武者奥義',

    tacticDesc: '武門一騎当千',

    conquestGoal: '武家一統・天下静謐',

    calcNote: (rice) => `貫高 約${Math.round(rice * 0.2)}貫文 （玄米 ${(rice / 10).toFixed(1)}万石相当 / 扶養兵力: ${(rice * 12 + 2500).toLocaleString()}騎）`

  },

  sengoku: {

    key: 'sengoku',

    name: '戦国・安土桃山・江戸',

    daimyoLabel: '当主',

    daimyoPlural: '諸大名',

    rulerTitle: '戦国大名',

    kokudakaLabel: '石高',

    kokudakaUnit: '石',

    kokudakaDesc: '領国石高（米収穫）',

    goldLabel: '金運上',

    goldUnit: '貫',

    riceLabel: '兵糧米',

    riceUnit: '石',

    troopsLabel: '総動員兵力',

    troopsUnit: '人',

    shootCommand: '🏹 弓砲射撃',

    shootDesc: '遠距離安全射',

    tacticCommand: '⚡ 陣形奥義',

    tacticDesc: '大名固有必殺',

    conquestGoal: '天下布武・全土統一',

    calcNote: (rice) => `表高 ${(rice / 10).toFixed(1)}万石 （扶養動員上限: ${(rice * 12 + 2500).toLocaleString()}人）`

  },

  modern: {

    key: 'modern',

    name: '幕末・明治維新',

    daimyoLabel: '藩主 / 総督',

    daimyoPlural: '諸藩・雄藩',

    rulerTitle: '総帥',

    kokudakaLabel: '石高',

    kokudakaUnit: '石',

    kokudakaDesc: '藩国力・産業実高',

    goldLabel: '藩国資金',

    goldUnit: '両',

    riceLabel: '兵站糧食',

    riceUnit: '俵',

    troopsLabel: '常備・召集軍',

    troopsUnit: '名',

    shootCommand: '💥 小銃砲火斉射',

    shootDesc: '近代火砲銃撃',

    tacticCommand: '⚡ 維新回天奥義',

    tacticDesc: '新式戦術・決起',

    conquestGoal: '近代日本統一・版籍奉還',

    calcNote: (rice) => `藩力実高 ${(rice / 10).toFixed(1)}万石 （動員兵力: ${(rice * 12 + 2500).toLocaleString()}名 / 産興力 ${Math.round(rice * 1.5).toLocaleString()}両相当）`

  }

};



export function getEraKey(year) {

  const y = Number(year);

  if (isNaN(y)) return 'sengoku';

  if (y <= 801) return 'ancient';

  if (y <= 1466) return 'medieval';

  if (y <= 1852) return 'sengoku';

  return 'modern';

}



/** 領地生産力の呼称は、政治時代の区分とは別に歴史用語へ切り替える。 */
export function getKokudakaLabel(year) {
  const y = Number(year);
  // 平安時代は延暦13年（794年）の平安京遷都から扱う。
  if (!Number.isFinite(y) || y < 794) return '収穫高';
  // 平安・鎌倉期。建武以後は室町期として石高表記へ統一する。
  if (y < 1336) return '荘園高';
  return '石高';
}

export function getEraFlavor(year) {

  const era = ERA_CONFIG[getEraKey(year)] || ERA_CONFIG.sengoku;
  const kokudakaLabel = getKokudakaLabel(year);
  return era.kokudakaLabel === kokudakaLabel ? era : { ...era, kokudakaLabel };

}

if (typeof window !== 'undefined') {

  window.ERA_CONFIG = ERA_CONFIG;

  window.getEraKey = getEraKey;

  window.getKokudakaLabel = getKokudakaLabel;

  window.getEraFlavor = getEraFlavor;

}



/** 複数セーブスロット定義（自動保存枠＋直前退避バックアップ枠＋手動保存5枠） */

/**
 * localStorage への安全な書き込み。
 * 容量超過(QuotaExceededError)のときは「直前バックアップ → 古いシナリオ別自動保存」の順に退避して再試行する。
 * 手動スロット(sengoku_save_slot_*)と、いま書き込もうとしているキーは退避対象にしない。
 * 退避しても書けない場合は例外を投げる（呼び出し側の try/catch が失敗として扱う）。
 */
export let _storageToastAt = 0;
export function _storageToast(icon, title) {
  window.dispatchEvent(new CustomEvent('sengoku:storage-warning', { detail: { icon, title } }));
  const now = Date.now();
  if (now - _storageToastAt < 30000) return; // 連続表示の抑止
  _storageToastAt = now;
  if (typeof Swal !== 'undefined') {
    Swal.fire({ toast: true, position: 'top', icon, title, showConfirmButton: false, timer: 5000 });
  }
}
/** ゲームロジック用乱数（GameRng があればシード可能、無ければ Math.random） */
export const gameRandom = () => (globalThis.GameRng ? globalThis.GameRng.random() : Math.random());

export function safeStorageSet(key, value) {
  const isQuota = (e) => !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
  try {
    localStorage.setItem(key, value);
    return { evicted: [] };
  } catch (e) {
    if (!isQuota(e)) throw e;
    const candidates = [];
    if (key !== 'sengoku_save_data_bak') candidates.push('sengoku_save_data_bak');
    const scen = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === key || !k.startsWith('sengoku_save_scen_')) continue;
      let ts = 0;
      try { ts = Date.parse(JSON.parse(localStorage.getItem(k)).savedAt) || 0; } catch (_) {}
      scen.push([k, ts]);
    }
    scen.sort((a, b) => a[1] - b[1]); // 古い順
    for (const [k] of scen) candidates.push(k);
    const evicted = [];
    for (const k of candidates) {
      if (localStorage.getItem(k) === null) continue;
      try {
        localStorage.removeItem(k);
        evicted.push(k);
        localStorage.setItem(key, value);
        _storageToast('warning', '保存容量が不足したため、古い自動保存を整理しました');
        console.warn('safeStorageSet: evicted', evicted);
        return { evicted };
      } catch (e2) {
        if (!isQuota(e2)) throw e2;
      }
    }
    _storageToast('error', '保存容量が不足しています。不要な記録を削除してください');
    throw e;
  }
}

export const SAVE_SLOTS = [

  { id: 'auto', key: 'sengoku_save_data', label: '最新自動保存 (オートセーブ)', isAuto: true },

  { id: 'bak', key: 'sengoku_save_data_bak', label: '直前自動保存 (前シナリオ/直前退避バックアップ)', isAuto: true, isBackup: true },

  { id: 'slot1', key: 'sengoku_save_slot_1', label: '手動記録枠 壱' },

  { id: 'slot2', key: 'sengoku_save_slot_2', label: '手動記録枠 弐' },

  { id: 'slot3', key: 'sengoku_save_slot_3', label: '手動記録枠 参' },

  { id: 'slot4', key: 'sengoku_save_slot_4', label: '手動記録枠 四' },

  { id: 'slot5', key: 'sengoku_save_slot_5', label: '手動記録枠 五' }

];

if (typeof window !== 'undefined') window.SAVE_SLOTS = SAVE_SLOTS;



/** セーブスロットのメタデータ解析 */

export function getSaveSlotMeta(slotKey, rawData = null) {

  try {

    const raw = rawData || (slotKey ? localStorage.getItem(slotKey) : null);

    if (!raw) return null;

    const data = (typeof raw === 'string') ? JSON.parse(raw) : raw;

    if (!data || (data.year === undefined && data.year === null)) return null;



    const provs = data.provincesDelta || data.provinces || [];

    const myProvs = provs.filter(p => p.ownerId === data.playerClanId);

    const totalTroops = myProvs.reduce((sum, p) => sum + (Number(p.troops) || 0), 0);

    const metaSeasonIdx = data.seasonScheme === SEASONS_PER_YEAR ? data.seasonIdx : legacySeasonIdxToNew(data.seasonIdx);

    const seasonName = SEASON_NAMES[metaSeasonIdx] || '春';

    const yearStr = formatHistoricalYear(data.year);



    const scens = (typeof window !== 'undefined' && window.SCENARIOS_DATA) || [];

    const scen = scens.find(s => String(s.id) === String(data.currentScenarioId));

    const scenTitle = scen ? scen.title : `${data.currentScenarioId}年`;



    let daimyoName = '当主';

    let clanName = data.playerClanId || '';

    if (data.officersDelta && window.OFFICERS_MASTER) {

      const dOff = data.officersDelta.find(o => o.clanId === data.playerClanId && o.isDaimyo && !o.isDead);

      if (dOff) {

        const mOff = window.OFFICERS_MASTER.find(m => m.id === dOff.id);

        if (mOff) daimyoName = mOff.name;

      }

    }

    const clanMaster = (typeof window !== 'undefined' && window.CLAN_MASTER_DATA) || {};

    if (clanMaster[data.playerClanId]?.family) {

      clanName = clanMaster[data.playerClanId].family;

    }



    let savedAtStr = '';

    if (data.savedAt) {

      const d = new Date(data.savedAt);

      if (!isNaN(d.getTime())) {

        savedAtStr = `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;

      }

    }



    return {

      isEmpty: false,

      year: data.year,

      yearStr,

      seasonIdx: metaSeasonIdx,

      seasonName,

      scenTitle,

      playerClanId: data.playerClanId,

      daimyoName,

      clanName,

      provCount: myProvs.length,

      totalProvs: provs.length || 77,

      totalTroops,

      gold: data.gold || 0,

      rice: data.rice || 0,

      savedAt: savedAtStr,

      data

    };

  } catch(e) {

    return null;

  }

}

if (typeof window !== 'undefined') window.getSaveSlotMeta = getSaveSlotMeta;



/** セーブデータをJSONファイルとしてダウンロード保存 */

export function downloadSaveJson(saveData, customFilename = null) {

  const jsonStr = JSON.stringify(saveData, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  

  let filename = customFilename;

  if (!filename) {

    const meta = getSaveSlotMeta(null, saveData);

    const dName = meta ? meta.daimyoName : 'sengoku';

    const yStr = meta ? meta.yearStr : 'year';

    const sName = meta ? meta.seasonName : '';

    filename = `sengoku_save_${dName}_${yStr}年_${sName}.json`.replace(/[\/\\:*?"<>|]/g, '_');

  }

  a.href = url;

  a.download = filename;

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);

}

if (typeof window !== 'undefined') window.downloadSaveJson = downloadSaveJson;



/** セーブデータをクリップボードへコピー */

export async function copySaveJsonToClipboard(saveData) {

  const jsonStr = JSON.stringify(saveData);

  try {

    if (navigator.clipboard && navigator.clipboard.writeText) {

      await navigator.clipboard.writeText(jsonStr);

      return true;

    }

  } catch (e) {}

  const ta = document.createElement('textarea');

  ta.value = jsonStr;

  ta.style.position = 'fixed';

  ta.style.opacity = '0';

  document.body.appendChild(ta);

  ta.select();

  const ok = document.execCommand('copy');

  document.body.removeChild(ta);

  return ok;

}

if (typeof window !== 'undefined') window.copySaveJsonToClipboard = copySaveJsonToClipboard;



/** セーブデータのバリデーション */

export function validateSaveData(data) {

  if (!data || typeof data !== 'object') return { valid: false, message: '無効なデータ形式です。' };

  if (data.year === undefined || data.year === null) return { valid: false, message: '年号データが存在しません。' };

  if (!data.playerClanId) return { valid: false, message: '大名勢力データが存在しません。' };

  if (!Array.isArray(data.provincesDelta) && !Array.isArray(data.provinces)) {

    return { valid: false, message: '領国データが含まれていません。' };

  }

  return { valid: true };

}

if (typeof window !== 'undefined') window.validateSaveData = validateSaveData;



// 主要勢力図: 各勢力は「勢力名＋当主名」のみ表示（家臣・武将名の羅列は表示しない）
// 主要勢力は最大3件まで表示
// 各シナリオの「歴史的に中心となる3勢力」（clanId, 表示ラベル任意）。無い/不足分は lore_factions → 領国数順で補う
export const FACTION_HEADS_OVERRIDE = {
  '-663': ['jimmu', 'nagasunehiko', 'kumano_tobe'],
  '97': ['yamato_court', 'ibuki', 'kumaso'],
  '240': ['yamatai', 'kuna', 'yamato_court'],
  '240_yamato': ['yamatai', 'kuna', 'kibi'],
  '645': ['naka_no_oe', 'soga', 'kibi'],
  '672': ['oama', 'omi_court', 'tsukushi'],
  '801': ['heian_court', 'aterui', 'dewa_emishi'],
  '939': ['taira_masakado', 'fujiwara_sumitomo', 'heian_court'],
  '1019': ['heian_court', 'toi', 'taira_tadatsune'],
  '1028': ['taira_tadatsune', ['minamoto_tsunemoto', '河内源氏'], 'heian_court'],
  '1056': ['abe', ['minamoto_tsunemoto', '河内源氏'], 'kiyohara'],
  '1087': [['minamoto_tsunemoto', '河内源氏'], ['kiyohara', '清原清衡方'], 'kiyohara_iehira'],
  '1156': ['goshirakawa_in', 'sutoku_in', 'taira'],
  '1159': ['taira', 'minamoto_yoshitomo', 'fujiwara_hiraizumi'],
  '1180': ['taira', 'genji_yoritomo', 'kiso'],
  '1183': ['genji_yoritomo', 'taira', 'kiso'],
  '1184': ['genji_yoritomo', 'taira', 'fujiwara_hiraizumi'],
  '1185': ['genji_yoritomo', 'taira', 'fujiwara_hiraizumi'],
  '1189': ['fujiwara_hiraizumi', 'genji_yoritomo'],
  '1221': ['hojo_kamakura', 'gotoba_in', 'ashikaga'],
  '1274': ['hojo_kamakura', 'shoni', 'yuan'],
  '1331': ['hojo_kamakura', 'godaiho', 'ashikaga'],
  '1333': ['godaiho', 'ashikaga', 'nitta'],
  '1336': ['ashikaga', 'godaiho', 'kusunoki'],
  '1350': ['ashikaga', 'kamakura_fu', 'yamana'],
  '1359': ['kikuchi', 'shoni', 'ashikaga'],
  '1391': ['ashikaga', 'yamana', 'ouchi'],
  '1400': ['date', 'kamakura_fu', 'ashikaga'],
  '1438': ['kamakura_fu', 'ashikaga', 'uesugi'],
  '1457': ['ashikaga_horikoshi', 'ashikaga_koga', 'yamanouchi'],
  '1467': ['hosokawa', 'yamana', 'hatakeyama_bishu'],
  '1493': ['hosokawa', 'ashikaga', 'hojo'],
  '1495': ['hojo', 'hosokawa', 'ouchi'],
  '1531': ['hosokawa', 'uragami', 'hojo'],
  '1538': ['ashikaga_oyumi', 'hojo', 'uesugi'],
  '1546': ['hojo', 'yamanouchi', 'ashikaga_koga'],
  '1550': ['takeda', 'murakami', 'miyoshi'],
  '1555': ['mori', 'sue', 'amago'],
  '1560': ['imagawa', 'oda', 'takeda'],
  '1565': ['oda', 'saito', 'miyoshi'],
  '1570': ['oda', 'azai', 'asakura'],
  '1573': ['takeda', 'tokugawa', 'oda'],
  '1575': ['takeda', 'oda', 'tokugawa'],
  '1576': ['mori', 'honganji', 'oda'],
  '1577': ['uesugi', 'oda', 'matsunaga'],
  '1578': ['araki', 'oda', 'mori'],
  '1582': ['oda', 'mori', 'tokugawa'],
  '1584': ['toyotomi', 'oda', 'tokugawa'],
  '1585': ['toyotomi', 'chosokabe', 'tokugawa'],
  '1587': ['toyotomi', 'shimazu', 'otomo'],
  '1590': ['toyotomi', 'hojo', 'date'],
  '1592': ['toyotomi', 'tokugawa', 'maeda'],
  '1597': ['toyotomi', 'tokugawa', 'kobayakawa'],
  '1600': ['tokugawa', ['ishida', '石田家（西軍）'], ['mori', '毛利家（西軍総大将）']],
  '1614': ['toyotomi', 'tokugawa', 'date'],
  '1637': ['amakusa', 'tokugawa', 'hosokawa'],
  '1651': ['yui', 'tokugawa', 'kishu'],
  '1702': ['ako_ronin', 'tokugawa', 'asano'],
  '1721': ['tokugawa', 'owari', 'kishu'],
  '1783': ['tokugawa', 'uesugi', 'kumamoto_hosokawa'],
  '1789': ['tokugawa', 'owari', 'uesugi'],
  '1837': ['oshio', 'tokugawa', 'mito'],
  '1853': ['tokugawa', 'shimazu', 'mito'],
  '1860': ['ii', 'tokugawa', 'mito'],
  '1866': ['shimazu', 'mori', 'tokugawa'],
  '1868': ['meiji', 'tokugawa', 'aizu'],
  '1877': ['saigo_gun', 'meiji'],
};
export function buildFactionHeadsText(scen) {
  if (!scen) return '';
  try {
    const officers = Array.isArray(window.OFFICERS_MASTER) ? window.OFFICERS_MASTER : [];
    const masters = window.CLAN_MASTER_DATA || {};
    const pls = Array.isArray(scen.playables) ? scen.playables.filter(p => p && p.id) : [];
    const owners = scen.owners || {};
    const provCnt = {};
    Object.values(owners).forEach(c => { if (c) provCnt[c] = (provCnt[c] || 0) + 1; });
    const exists = id => !!(pls.some(p => p.id === id) || provCnt[id]);
    const headOf = id => {
      const pl = pls.find(p => p.id === id);
      const m = masters[id] || {};
      let nm = '';
      const off = pl && pl.officerId ? officers.find(o => o.id === pl.officerId) : null;
      if (off && off.name) nm = off.name;
      if (!nm) { const d = officers.find(o => o && o.isDaimyo && o.clanId === id && !o.isDead); if (d) nm = d.name; }
      const ly = m.leaders && m.leaders[String(scen.year)];
      if (!nm && ly) nm = ly;
      // 改名（松平元康→徳川家康 等）は master の年代別当主表記に合わせる
      if (['松平元康', '松平家康', '徳川家康'].includes(nm) && ['松平元康', '松平家康', '徳川家康'].includes(ly)) nm = ly;
      return nm;
    };
    const labelOf = id => { const m = masters[id] || {}; const pl = pls.find(p => p.id === id); return m.family || m.name || (pl && pl.name) || id; };
    const picked = [];
    const add = (id, label) => { if (picked.length >= 3 || !id || picked.some(p => p.id === id) || !exists(id)) return; picked.push({ id, label: label || labelOf(id) }); };
    const ov = FACTION_HEADS_OVERRIDE[String(scen.id)];
    if (ov) ov.forEach(e => Array.isArray(e) ? add(e[0], e[1]) : add(e));
    if (!ov || !ov.length) {
      // lore_factions の【】ラベルに家名が含まれる勢力を出現順に
      const raw = String(scen.lore_factions || '');
      (raw.match(/【[^】]+】/g) || []).forEach(lb => {
        const id = Object.keys(provCnt).concat(pls.map(p => p.id)).find(c => { const f = String(labelOf(c)).replace(/(将軍家|家|氏|軍)$/, ''); return f.length >= 2 && lb.includes(f); });
        if (id) add(id);
      });
      Object.keys(provCnt).sort((a, b) => provCnt[b] - provCnt[a]).forEach(id => add(id));
    }
    return picked.map(p => { const h = headOf(p.id); return `【${p.label}】` + (h ? `当主：${h}` : ''); }).join('\n');
  } catch (e) { return ''; }
}
export function _buildFactionHeadsTextAll(scen) {
  const raw = (scen && scen.lore_factions) || '';
  const officers = Array.isArray(window.OFFICERS_MASTER) ? window.OFFICERS_MASTER : [];
  const masters = window.CLAN_MASTER_DATA || {};
  // lore_factions が空・【】形式でないシナリオは、プレイアブル勢力から「勢力名＋当主名」を生成する
  const fromPlayables = () => {
    const seen = new Set();
    return (scen && scen.playables || []).filter(pl => pl && pl.id && !seen.has(pl.id) && seen.add(pl.id)).map(pl => {
      const off = pl.officerId ? officers.find(o => o.id === pl.officerId) : null;
      const m = masters[pl.id] || {};
      const fam = m.family || m.name || pl.name || pl.id;
      const head = (off && off.name) || '';
      return `【${fam}】` + (head ? `当主：${head}` : '');
    }).join('\n');
  };
  if (!raw) return fromPlayables();
  const segs = raw.split(/(?=◆?【)/).map(s => s.trim()).filter(Boolean);
  if (!segs.some(s => /^◆?【[^】]+】/.test(s))) return fromPlayables();
  const cands = (scen.playables || []).map(pl => {
    const off = pl.officerId ? officers.find(o => o.id === pl.officerId) : null;
    const m = masters[pl.id] || {};
    const head = (off && off.name) || (m.leaders && (m.leaders[scen.year] || m.leaders[String(scen.year)])) || pl.name || '';
    const fam = String(m.family || '').replace(/(将軍家|家|氏|軍)$/, '');
    const alias = { toyotomi: ['豊臣', '羽柴'], shimazu: ['薩摩', '島津'], mori: ['長州', '毛利'], yamauchi: ['土佐', '山内'] }[pl.id] || [];
    return { head, fam, aliases: [fam, ...alias].filter(a => a && a.length >= 2), clan: m.family || '' };
  }).filter(c => c.head && c.head.length >= 2);
  const out = [];
  segs.forEach(seg => {
    const mm = seg.match(/^◆?【([^】]+)】([\s\S]*)$/);
    if (!mm) return;
    const label = mm[1], body = mm[2];
    // 本文に名前が出る当主（出現順）
    const posOf = c => { let i = body.indexOf(c.head); if (i < 0) { const a = c.aliases.find(a => c.head.startsWith(a) && c.head.length - a.length >= 2); if (a) i = body.indexOf(c.head.slice(a.length)); } return i; };
    const inBody = cands.map(c => ({ c, i: posOf(c) })).filter(x => x.i >= 0).sort((a, b) => a.i - b.i);
    // 勢力名ラベルに含まれる家名
    const byLabel = cands.filter(c => c.aliases.some(a => label.includes(a)));
    let heads = [];
    const isCoalition = /[・、]|方$|群雄|諸|網|雄族|御家人|御三家|反|西国/.test(label.replace(/（[^）]*）/g, ''));
    const inLabel = cands.filter(c => label.includes(c.head));
    const labelInBody = inBody.filter(x => byLabel.includes(x.c));
    if (inLabel.length) heads = isCoalition ? inLabel.map(c => c.head) : [inLabel[0].head];
    else if (isCoalition) {
      heads = inBody.length ? inBody.map(x => x.c.head) : byLabel.map(c => c.head);
    } else if (labelInBody.length) heads = [labelInBody[0].c.head];
    else if (byLabel.length) heads = [byLabel[0].head];
    else if (inBody.length) heads = [inBody[0].c.head];
    heads = [...new Set(heads)];
    if (!heads.length && (!isCoalition || /・/.test(label))) {
      // フォールバック: 本文先頭が人名の列挙のときだけ、その先頭の人名を当主とみなす
      const sentence = body.split(/[。]/)[0];
      const parts = sentence.split(/[・、,，]/).map(t => t.trim());
      const nameLike = t => t && t.length <= 12 && !/[ぁ-ん]/.test(t.replace(/（[^）]*）/g, '')) && !/(公方|将軍|幕府|朝廷|家|者|府|国|軍|衆)$/.test(t);
      if (parts.length && parts.every(nameLike) && !/^\S{1,3}$/.test(parts[0]) ) heads = [parts[0]];
      else if (parts.length === 1 && nameLike(parts[0])) heads = [parts[0]];
      // 最後の手段: 本文中で最初に登場する武将名（武将名鑑に載る人物）
      if (!heads.length) {
        let best = null;
        officers.forEach(of => {
          const nm = of && of.name;
          if (!nm || nm.length < 3) return;
          const i = body.indexOf(nm);
          if (i >= 0 && (!best || i < best.i || (i === best.i && nm.length > best.nm.length))) best = { i, nm };
        });
        if (best) heads = [best.nm];
      }
    }
    // 武将・勢力の説明文は表示しない（勢力名＋当主名のみ）
    const tail = heads.length ? `当主：${heads.join('・')}` : '';
    out.push(`【${label}】` + tail);
  });
  return out.join('\n');
}
