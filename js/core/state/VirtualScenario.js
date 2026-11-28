/**
 * @file js/core/state/VirtualScenario.js - GameState から機能別に分割したメソッド群（6個）
 * GameState.js が Object.assign で SengokuGame に合成する。内容は分割前と同一。
 */

import { INITIAL_PROVINCES, SCENARIOS, getClanAbility } from '../GameStateShared.js?v=20261128_v74';

export const VirtualScenarioMethods = {



  // ============================================================================

  // 仮想シナリオ共通: 看板武将・主力武将移籍マップ

  // ============================================================================

  getAllstarOfficerAffiliations() {

    // 所属一覧は data/rules.json（allstarAffiliations）へ移設（2026-11-14）
    return { ...((typeof window !== 'undefined' && window.ALLSTAR_OFFICER_AFFILIATIONS) || {}) };

  },



  // ============================================================================

  // [仮想2] 全領国オールスター群雄割拠（全国77国・一国一大名）

  // ============================================================================

  createAllstarFeudalScenario() {

    const scens = (typeof window !== 'undefined' && window.SCENARIOS_DATA && window.SCENARIOS_DATA.length > 0)

      ? window.SCENARIOS_DATA

      : (typeof SCENARIOS !== 'undefined' && Array.isArray(SCENARIOS) ? SCENARIOS : []);

    const existing = scens.find(s => String(s.id) === 'allstar_feudal');

    if (existing && !existing._isStub) {

      const cloned = JSON.parse(JSON.stringify(existing));

      if (cloned.title && cloned.title.length > 10) {

        cloned.title = '群雄割拠オールスター';

      }

      if (cloned.subtitle && cloned.subtitle.length > 20) {

        cloned.subtitle = '全国106州・群雄割拠';

      }

      if (!cloned.officerAffiliations || cloned.officerAffiliations.length === 0) {

        cloned.officerAffiliations = this.getAllstarOfficerAffiliations();

      }

      return cloned;

    }



    const mapping92 = {

      // 北海道・東北

      'ezo': 'kakizaki',

      'mutsu_tsugaru': 'tsugaru', 'mutsu_namioka': 'namioka', 'tsugaru': 'tsugaru',

      'mutsu_nanbu': 'nanbu',

      'ugo': 'ando', 'ugo_minato': 'ando', 'ugo_hinai': 'ando', 'ugo_yuri': 'ando',

      'ugo_senhoku': 'tozawa', 'ugo_hondoh': 'hondo', 'ugo_rokugoh': 'rokugo',

      'rikuchu': 'shiba', 'rikuchu_morioka': 'shiba', 'rikuchu_kamiheii': 'shiba', 'rikuchu_shimoheii': 'shiba', 'rikuchu_hienuki': 'shiba', 'rikuchu_waga': 'shiba',

      'ugo_yokote': 'onodera',

      'rikuchu_kasai': 'kasai',

      'uzen_shonai': 'daihoji',

      'rikuzen_osaki': 'osaki',

      'uzen': 'mogami', 'uzen_mogami': 'mogami', 'uzen_kitamurayama': 'mogami', 'uzen_nishimurayama': 'mogami', 'uzen_higashimurayama': 'mogami',

      'rikuzen': 'fujiwara_hiraizumi',

      'uzen_yonezawa_date': 'date', 'uzen_yonezawa': 'date', 'iwashiro_date_shinobu': 'date',

      'iwaki_soma': 'soma',

      'iwashiro': 'ashina', 'iwashiro_sukagawa': 'ashina', 'iwashiro_ishikawa': 'ashina',

      'iwashiro_tamura': 'tamura',

      'iwaki': 'iwaki',

      'iwaki_shirakawa': 'shirakawa_yuki',

      // 関東

      'shimotsuke_nasu': 'nasu',

      'shimotsuke': 'utsunomiya', 'shimotsuke_kanitsuga': 'utsunomiya',
      'sano_oyama': 'sano', 'shimotsuke_oyama': 'sano', 'shimotsuke_sano': 'sano',

      'hitachi': 'satake', 'hitachi_ohta': 'satake', 'hitachi_mito': 'satake', 'hitachi_makabe': 'satake', 'hitachi_shimodate': 'yuki', 'hitachi_shimotsuma': 'tagaya', 'hitachi_kashima': 'satake',

      'kozuke_takasaki': 'nitta',
      'kozuke_agatsuma': 'sanada',
      'kozuke_numata': 'uesugi',
      'kozuke_maebashi': 'nitta', 'kozuke_nitta_kanayama': 'nitta',

      'shimousa_koga': 'kamakura_fu', 'shimousa_yuhki': 'yuki',

      'hitachi_fuchu': 'daijo', 'hitachi_tsuchiura': 'oda_hitachi', 'hitachi_shida': 'toki_hitachi',

      'shimousa': 'chiba',

      'kazusa': 'satomi', 'kazusa_isumi': 'satomi', 'kazusa_togane_naruto': 'sakai_kazusa',

      'awa': 'satomi',

      'musashi': 'taira_masakado', 'musashi_oshi': 'taira_masakado', 'musashi_hachigata': 'taira_masakado', 'musashi_iwatsuki': 'taira_masakado', 'musashi_kawagoe': 'taira_masakado', 'musashi_edo_tama': 'taira_masakado', 'musashi_edo': 'taira_masakado', 'musashi_tama': 'taira_masakado',

      'sagami': 'hojo', 'sagami_miura': 'hojo',

      // 甲信越・北陸

      'sado': 'honma',

      'echigo': 'uesugi', 'echigo_murakami': 'uesugi', 'echigo_kanbara': 'shibata_echigo', 'echigo_higashikanbara': 'ashina', 'echigo_uonuma': 'uesugi',

      'noto': 'hatakeyama_noto',

      'etchu_west': 'jinbo',
      'etchu_east': 'uesugi',

      'shinano_kawanakajima': 'takanashi', 'shinano_sarashina_hanishina': 'murakami',
      'shinano_ueda': 'sanada',

      'shinano_chikuma_kiso': 'ogasawara', 'shinano_chikuma_azumi': 'ogasawara', 'shinano_kiso': 'ogasawara',
      'shinano_takato': 'takeda', 'shinano_iida': 'takeda', 'shinano_takato_iida': 'takeda',

      'kaga_north': 'maeda', 'kaga_south': 'niwa',

      'echizen': 'asakura', 'echizen_tsuruga': 'asakura', 'echizen_ohno': 'asakura',

      'wakasa': 'takeda_wakasa',

      'kai': 'takeda', 'kai_tsuru': 'takeda',

      // 東海

      'hida': 'anekoji', 'hida_takayama': 'anekoji', 'hida_kiun': 'anekoji', 'hida_kamioka': 'anekoji',

      'mino': 'saito', 'mino_iwamura': 'saito', 'mino_gujo': 'endo_gujo',

      'suruga': 'imagawa',

      'totomi_hamamatsu': 'ii', 'totomi_kakegawa': 'ii', 'totomi_futamata_haibara': 'ii', 'totomi_joto': 'ii',

      'mikawa_okazaki': 'tokugawa', 'mikawa_yoshida': 'tokugawa', 'mikawa_shitara': 'tokugawa',

      'owari_north': 'oda_iwakura', 'owari_south': 'oda',

      'izu': 'genji_yoritomo',

      'ise': 'kitabatake', 'ise_suzuka': 'kitabatake',

      'shima': 'kuki',

      'iga': 'momochi',

      // 近畿

      'omi_north': 'azai', 'omi_kutsukidani': 'kutsuki',

      'omi_south': 'rokkaku', 'omi_koka': 'koka',

      'yamashiro': 'ashikaga',

      'yamato': 'yamato_court', 'yamato_koriyama': 'yamato_court', 'yamato_takatori': 'yamato_court', 'yamato_yoshino': 'yamato_court', 'yamato_higashiyamauchi': 'yamato_court',

      'tamba': 'akechi', 'tamba_west': 'akechi', 'tamba_east': 'akechi',

      'tango': 'hosokawa',

      'settsu': 'toyotomi', 'settsu_shimakami': 'toyotomi', 'settsu_osaka': 'toyotomi',

      'kawachi_north': 'miyoshi', 'kawachi_south': 'kusunoki',

      'izumi': 'miyoshi',

      'harima_west': 'kuroda',
      'harima_east': 'bessho',

      'kii_saika_wakayama': 'suzuki',

      'kii_kichu': 'hatakeyama_bishu',

      'kii_kumano': 'horiuchi',

      'awaji': 'fujiwara_sumitomo',

      // 山陰・山陽

      'tajima': 'yamana',

      'inaba': 'tottori',

      'hoki_west': 'godaiho',
      'hoki_east': 'godaiho',

      'izumo_north': 'amago', 'izumo_south': 'amago',

      'iwami': 'masuda',

      'oki': 'gotoba_in',

      'mimasaka_west': 'kibi',
      'mimasaka_east': 'kibi',

      'bizen': 'ukita',

      'bitchu_matsuyama': 'mimura', 'bitchu_takamatsu': 'mimura',

      'bingo': 'asano',

      'aki_hiroshima': 'takeda_aki', 'aki_koriyama': 'mori',

      'suo': 'ouchi',

      'nagato': 'meiji',

      // 四国

      'sanuki': 'sogo', 'sanuki_west': 'kagawa',

      'awa_shikoku': 'hachisuka', 'awa_shikoku_west': 'onishi', 'awa_shikoku_south': 'ashikaga_hirashima',

      'iyo_matsuyama': 'kono',
      'iyo_nii': 'kono',

      'tosa_kochi': 'chosokabe',
      'tosa_aki': 'chosokabe',
      'tosa_gun': 'chosokabe',

      'tosa_nakamura': 'ichijo',

      // 九州・琉球

      'buzen': 'taira', 'buzen_ogura': 'taira', 'buzen_nakatsu': 'taira',

      'chikuzen_fukuoka': 'yamatai', 'chikuzen_hakata': 'yamatai', 'chikuzen_munakata': 'yamatai', 'chikuzen_kamashi': 'yamatai',
      'chikuzen_akizuki': 'yamatai',

      'hizen': 'ryuzoji', 'hizen_saga': 'ryuzoji', 'hizen_tsukushi': 'ryuzoji', 'hizen_karatsu': 'ryuzoji',

      'hizen_hirado': 'matsura',

      'chikugo_north': 'tachibana', 'chikugo_south': 'tachibana',

      'bungo_funai': 'otomo',
      'bungo_oka': 'otomo',
      'bungo_kitaamabe': 'otomo',
      'bungo_minamiamabe': 'otomo',
      'bungo_saiki_usuki': 'otomo',

      'hizen_omura': 'omura',

      'higo_kumamoto': 'kikuchi', 'higo_aso': 'kikuchi',
      'higo_yatsushiro': 'kikuchi',

      'higo_hitoyoshi': 'sagara',

      'hizen_shimabara': 'arima',

      'hyuga_takanabe': 'jimmu',
      'hyuga_sadowara': 'jimmu',
      'hyuga_obi': 'jimmu',

      'satsuma': 'shimazu',

      'osumi': 'saigo_gun',

      'tsushima': 'so',

      'ryukyu': 'ryukyu'

    };



    const rawProvs = (window.PROVINCES_DATA && window.PROVINCES_DATA.length > 0) ? window.PROVINCES_DATA : (INITIAL_PROVINCES || []);

    const owners = {};

    const castles = {};

    const provinceTroops = {};



    rawProvs.forEach(p => {

      const clanId = mapping92[p.id] || 'oda';

      owners[p.id] = clanId;

      castles[p.id] = p.castle || `${p.name || p.id}城`;

      provinceTroops[p.id] = this.getProvinceInitialTroops(Number(p.kokudaka) || 0);

    });



    const playables = [];

    Object.keys(mapping92).forEach(provId => {

      const cId = mapping92[provId];

      if (playables.some(x => x.id === cId)) return;

      const clanInfo = (typeof window !== 'undefined' && window.CLAN_MASTER && window.CLAN_MASTER[cId]) || {};

      const ability = (typeof getClanAbility === 'function') ? getClanAbility(cId) : { politics: 60, military: 60, stratagem: 55, personality: 'balanced' };

      const leaderName = (clanInfo.leaders && (clanInfo.leaders.default || clanInfo.leaders['1582'])) || clanInfo.name || cId;

      playables.push({

        id: cId,

        name: leaderName,

        clan: clanInfo.family || clanInfo.name || cId,

        desc: clanInfo.desc || '古代・中世・戦国・幕末の天下に名を馳せた名門。一国から日本全土の覇権を目指す。',

        difficulty: '普通',

        startProvId: provId,

        color: clanInfo.color || '#d4af37',

        kamonSvgId: clanInfo.kamon || 'kamon-default',

        stats: ability

      });

    });



    return {

      id: 'allstar_feudal',

      title: '群雄割拠オールスター',

      subtitle: '全国106州・群雄割拠',

      year: 1582,

      season: '春',

      seasonIdx: 0,

      gengo: '百花繚乱元年',

      isVirtual: true,

      desc: '古代・中世・戦国・幕末の日本史を彩る名門・豪族・王朝・志士たちが、全国106州に割拠する究極のオールスターモード！君の選んだ推し大名で、全国105州を平定し、日ノ本史上最強の覇者となれ！',

      lore_background: '神武東征軍、邪馬台国、ヤマト王権から平将門、奥州藤原氏、源平両氏、南北朝の英雄、戦国大名、そして長州維新軍や西郷軍まで、全106州を舞台に群雄が競う百花繚乱乱世。',

      lore_factions: '北は蝦夷・松前、津軽、南部、斯波、葛西、相馬、岩城から南は薩摩・島津、大隅・西郷軍、琉球王家まで、全106州を舞台に開幕。',

      lore_focus: 'お気に入りの英傑・大名家を選び、全国106国統一の偉業を達成せよ！',

      recommendedClan: 'oda',

      owners: owners,

      castles: castles,

      provinceTroops: provinceTroops,

      officerAffiliations: this.getAllstarOfficerAffiliations(),

      playables: playables

    };

  },



  triggerDefeat(reason) {

    if (this.isSpectatorMode) return;

    this.music.playTrack('defeat');

    const modal = document.getElementById('defeatModal');

    if (modal) {

      const msgEl = document.getElementById('defeatMessage');

      if (msgEl) {

        msgEl.textContent = reason === 'no-heir'

          ? '後継ぎがいないため滅亡'

          : '全ての領国を失い、貴家の覇業は露と消え去りました。';

      }

      document.getElementById('defeatQuoteText').textContent = '「露と落ち 露と消えにし 我が身かな 浪速のことも 夢のまた夢」';

      modal.classList.remove('hidden');

    }

  },



  continueDefeatAsSpectator() {

    const modal = document.getElementById('defeatModal');

    if (modal) modal.classList.add('hidden');



    this.isSpectatorMode = true;
    // 敗北後に観戦へ移る場合も、直前の自領選択を地図上に残さない。
    this.hideSelectionOutline = true;



    // 観戦バナーを非表示

    const banner = document.getElementById('spectatorBanner');

    if (banner) banner.style.display = 'none';



    // 音楽を季節曲に復帰

    try {

      this.music.playTrack(this.getSeasonTrackKey(), false, { seasonRestart: true });

    } catch (e) {}



    // 現存する勢力の中から領国数最多の大名の居城または領国を選択

    const activeProvs = (this.provinces || []).filter(p => p.ownerId && p.ownerId !== 'independent' && p.ownerId !== 'court');

    if (activeProvs.length > 0) {

      const clanCounts = {};

      activeProvs.forEach(p => clanCounts[p.ownerId] = (clanCounts[p.ownerId] || 0) + 1);

      const topClan = Object.keys(clanCounts).sort((a, b) => clanCounts[b] - clanCounts[a])[0];

      const topProv = activeProvs.find(p => p.ownerId === topClan) || activeProvs[0];

      if (topProv) {

        this.selectProvince(topProv.id);

      }

    }



    this.log('👀【天下観戦移行】御家滅亡後、天下の成り行きを見守る観戦モードへ移行しました。いつでもヘッダーの「途中参加」ボタンから他家を選んで参戦できます。', 'important');

    this.updateUI();



    // 観戦オート進行を開始

    setTimeout(() => {

      this.startAutoPlay();

    }, 400);

  },



  brightenHexColor(hex, percent) {

    if (!hex || hex[0] !== '#') return '#ffd700';

    let r = parseInt(hex.substring(1, 3), 16) || 0;

    let g = parseInt(hex.substring(3, 5), 16) || 0;

    let b = parseInt(hex.substring(5, 7), 16) || 0;



    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));

    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));

    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));



    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  },



  // 大名家カラーの半透明Glow用RGBA文字列生成,



  getClanGlowColor(clanId, alpha = 0.75) {

    const hex = this.getClanHighlightColor(clanId);

    let r = parseInt(hex.substring(1, 3), 16) || 255;

    let g = parseInt(hex.substring(3, 5), 16) || 215;

    let b = parseInt(hex.substring(5, 7), 16) || 0;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;

  },
};
