/**
 * js/core/GameRules.js - ゲームルール、合戦陣形、歴史イベント選択肢・分岐定義
 * 戦国天下統一伝 ES6モジュール
 */

export const HISTORICAL_CHOICE_EVENTS = [
  {
    id: 'uesugi_kanto_kanrei_succession',
    scenarioId: '*',
    year: 1561,
    title: '❖ 関東管領就任と上杉家名跡継承 ❖',
    subTitle: '山内上杉憲政より関東管領職と家督・系図を継承！越後上杉家誕生',
    check: (game) => {
      if (game.year < 1561) return false;
      if (game._kantoKanreiOccurred) return false;
      const hasKagetora = (game.activeOfficers || []).some(o => (o.id === 'off_uesugi_kenshin' || o.name === '長尾景虎' || o.name === '上杉謙信') && !o.isDead);
      const hasNagaoOrUesugi = (game.provinces || []).some(p => p.ownerId === 'nagao' || p.ownerId === 'uesugi');
      return hasKagetora && hasNagaoOrUesugi;
    },
    narrative: (game) => {
      const isPlayerKenshin = (game.playerClanId === 'nagao' || game.playerClanId === 'uesugi') && (game.playerDaimyo?.officerId === 'off_uesugi_kenshin' || game.playerDaimyo?.name?.includes('景虎') || game.playerDaimyo?.name?.includes('謙信'));
      if (isPlayerKenshin) {
        return '永禄四年、北条氏康の猛攻により上野平井城を逐われた関東管領・山内上杉憲政公が越後春日山城へ身を寄せてまいりました。憲政公は我が家の義心と武威に深く感じ入り、鎌倉鶴岡八幡宮にて関東管領職の重責とともに、上杉宗家の家督、重宝・系図を景虎公へ譲渡したいと強く申し出ております。これを受け「上杉政虎」と改名し、山内上杉家や長野家を統合して「越後上杉家」として坂東武士の盟主となるか、それとも長尾の旧名を貫くか！';
      }
      return '永禄四年春、北条氏康に平井城を逐われた関東管領・山内上杉憲政は、越後の長尾景虎を頼り、鶴岡八幡宮において関東管領職と上杉宗家の家督・系図・重宝を譲渡した。長尾景虎は名を「上杉政虎」と改め、山内上杉家や長野家を統合して「越後上杉家」として起ち上がった！越後・関東の諸勢力が激動の時代を迎える！';
    },
    choices: (game) => {
      const isPlayerKenshin = (game.playerClanId === 'nagao' || game.playerClanId === 'uesugi');
      if (isPlayerKenshin) {
        return [
          {
            text: '【史実ルート】上杉宗家を継承し「越後上杉家」を称す！山内上杉家・長野家を統合し、家紋と領国色を改める！',
            desc: '関東管領に就任し「上杉政虎」へ改名！山内上杉家・長野家の領国・武将をすべて統合！家紋を越後上杉家の竹に雀、領国色を越後上杉色へ一新！金+2,000、米+3,000、全軍兵力+5,000！',
            isHistorical: true,
            action: (g) => {
              g._kantoKanreiOccurred = true;
              g.gold += 2000;
              g.rice += 3000;
              g.integrateYamanouchiUesugi(true);
              g.log('🏯【関東管領就任】長尾景虎公は関東管領職と上杉宗家の名跡を継承し、「越後上杉家・上杉政虎」として立ち上がりました！', 'important');
              return '鶴岡八幡宮にて関東管領に就任！山内上杉家・長野家を統合し、「越後上杉家」として威信を天下に示しました！';
            }
          },
          {
            text: '【歴史改変IF】上杉の家名は受けず、長尾家の旗印のまま関東管領の軍事大権のみを振るう！',
            desc: '長尾家の誇りを堅持！前線部隊の突撃力と士気向上、全領国の治安+20、兵力+3,000！',
            isHistorical: false,
            action: (g) => {
              g._kantoKanreiOccurred = true;
              (g.provinces || []).filter(pr => pr.ownerId === g.playerClanId).forEach(pr => {
                pr.order = Math.min(100, (Number(pr.order) || 75) + 20);
                pr.troops += 1500;
              });
              g.log('⚔️【長尾武門の誇り】長尾家の誇りを保ちつつ、関東管領の軍令権を行使して諸将を統率しました！', 'important');
              return '長尾の家名を誇示しつつ関東の諸豪族を心服させ、強大な武威を確立しました！';
            }
          }
        ];
      } else {
        return [
          {
            text: '【史実ルート】長尾景虎が関東管領に就任し「越後上杉家」が成立！情勢を注視する',
            desc: '長尾景虎が上杉謙信へ改名し、山内上杉家を統合して越後上杉家が成立。関東・越後情勢が激変！',
            isHistorical: true,
            action: (g) => {
              g._kantoKanreiOccurred = true;
              g.integrateYamanouchiUesugi(false);
              g.log('📜【関東管領就任】越後の長尾景虎公が関東管領職と上杉名跡を継承、「越後上杉家」として山内上杉家を統合しました！', 'important');
              return '長尾景虎が上杉謙信と改名し越後上杉家が誕生！山内上杉家が統合されました。';
            }
          }
        ];
      }
    }
  },
{
        id: 'fujiwara_kiyohira_restoration',
        scenarioId: '*',
        year: 1087,
        title: '❖ 奥州藤原氏の黎明・清原清衡の復姓 ❖',
        subTitle: '後三年の役平定！清原の呪縛を断ち、父祖の藤原姓へ復姓',
        check: (game) => (game.year === 1088 || (game.year === 1087 && game.seasonIdx >= 4)) && (game.playerClanId === 'kiyohara' || game.playerClanId === 'minamoto_tsunemoto'),
        narrative: (game) => game.playerClanId === 'kiyohara'
          ? '寛治元年冬、出羽金沢柵が陥落し後三年の役は終結した。異父弟・家衡と叔父・武衡を討ち、奥羽六郡と出羽一円の実権を掌握した清衡。前九年の役で非業の最期を遂げた実父・藤原経清の無念と、連れ子として辛酸を舐めた清原一門の愛憎劇が胸に迫る。ここに養家の清原姓を捨てて父祖の「藤原」へと復姓し平泉に独自の仏国土・黄金平和王国を築くか、それとも出羽俘囚頭清原氏の武門を誇示し続けるか！'
          : '出羽金沢柵を攻め落とし、後三年の役を平定した源義家。共に戦い抜いた清原清衡は、実父・藤原経清の姓に復して「藤原清衡」と名乗り、奥州平泉の地に仏国土を拓くと伝えてきた。朝廷はこの戦いを私戦として義家に恩賞を出さない中、盟友・清衡の復姓と独立王国を承認するか、それとも源氏の武威のもとに奥羽への軍政を強めるか！',
        choices: (game) => game.playerClanId === 'kiyohara' ? [
          {
            text: '【史実ルート】父祖・藤原経清の志を継ぎ「藤原清衡」へ復姓！奥州藤原氏を興す！',
            desc: '「藤原清衡」へ改姓、勢力は「奥州藤原氏」へ！平泉黄金文化の礎を築き、金+2,000、米+2,500、全領国の治安・兵力向上！',
            isHistorical: true,
            action: (g) => {
              g.gold += 2000;
              g.rice += 2500;
              g.kiyohiraSurnameDeclined = false;
              g.kiyohiraFujiwaraAccepted = true;
              g.kanazawaOccurred = true;
              g.updateKiyohiraSurname(true);
              (g.provinces || []).filter(pr => pr.ownerId === 'kiyohara').forEach(pr => {
                pr.order = Math.min(100, (Number(pr.order) || 80) + 15);
                pr.troops += 1500;
              });
              g.log('👑【藤原復姓】清衡公は実父の姓に復して「藤原清衡」と名乗り、奥州藤原氏初代として平泉黄金文化の礎を築きました！', 'important');
              return '「これより我が家は奥州藤原氏なり！」中尊寺の建立を期し、平泉の地に百年の黄金平和王国を打ち立てました！';
            }
          },
          {
            text: '【歴史改変IF】清原の正嫡として「清原清衡」を堅持！出羽・陸奥の武門俘囚を束ねる！',
            desc: '清原氏の武威を誇示！出羽・奥州の荒武者を糾合し、全軍兵力+4,000、防衛力向上！',
            isHistorical: false,
            action: (g) => {
              g.kiyohiraSurnameDeclined = true;
              g.kiyohiraFujiwaraAccepted = false;
              g.updateKiyohiraSurname(false);
              (g.provinces || []).filter(pr => pr.ownerId === 'kiyohara').forEach(pr => {
                pr.troops += 2000;
                pr.defense = Math.min(100, (Number(pr.defense) || 60) + 15);
              });
              g.log('⚔️【清原武門の矜持】清原清衡公は清原の姓を保ち、出羽・陸奥の精強な武士団を率いて武威を示しました！', 'important');
              return '清原氏の棟梁として奥羽全土の武士を束ね、強大な武門政権としての威勢を天下に示しました！';
            }
          }
        ] : [
          {
            text: '【史実ルート】清衡の藤原復姓を承認し、固き盟約を結んで東国武士団の信を得る！',
            desc: '清衡が「藤原清衡」へ復姓！私財を投げ打って諸将に報いた義家の武名が東国に轟き、源氏兵力+3,500、金+1,000！',
            isHistorical: true,
            action: (g) => {
              g.gold += 1000;
              g.kiyohiraSurnameDeclined = false;
              g.kiyohiraFujiwaraAccepted = true;
              g.kanazawaOccurred = true;
              g.updateKiyohiraSurname(true);
              const p = g.provinces.find(pr => pr.ownerId === 'minamoto_tsunemoto');
              if (p) p.troops += 3500;
              g.log('🤝【八幡太郎の武名】清原清衡の「藤原復姓」を承認！義家公の器量に東国武士団が心服しました！', 'important');
              return '清衡の藤原復姓を認め、奥羽との固い絆を締結！朝廷の恩賞なき中、義家公の私財による恩賞が武士の心を掴みました！';
            }
          },
          {
            text: '【歴史改変IF】奥羽の自立を許さず、鎮守府将軍として軍事的威圧を加え臣従を迫る！',
            desc: '河内源氏の覇権を奥羽全土へ及ぼす！陸奥・出羽の調達により米+3,000、清原領から兵糧貢納！',
            isHistorical: false,
            action: (g) => {
              g.rice += 3000;
              (g.provinces || []).filter(pr => pr.ownerId === 'minamoto_tsunemoto').forEach(pr => pr.troops += 2000);
              g.log('⚔️【源氏の奥羽軍政】鎮守府将軍の権威を掲げ、奥羽諸勢力に服属を迫りました！', 'important');
              return '清衡の独立を牽制し、源氏軍の圧倒的威圧のもとに奥羽の軍事物資を収奪・掌握しました！';
            }
          }
        ]
      },
{
        id: 'minatogawa',
        scenarioId: '*',
        year: 1336,
        title: '❖ 湊川の決戦・桜井の別れ ❖',
        subTitle: '建武の忠臣・楠木正成公が魅せる不朽の智勇',
        check: (game) => game.year === 1336 && (game.playerClanId === 'kusunoki' || game.playerClanId === 'ashikaga'),
        narrative: (game) => game.playerClanId === 'kusunoki'
          ? '九州から数十万の大船団を率いて東上する足利尊氏。楠木正成は後醍醐天皇に「一旦京都を空けて比叡山に退き、尊氏軍を市中でおびき寄せて挟撃すべし」と建策するも容れられず。桜井の宿で嫡男・正行に別れを告げた正成は、湊川で尊氏軍を迎え撃つか、あるいは独自に比叡山策を断行するか！'
          : '大船団を率いて兵庫沖へ迫る足利尊氏。立ちはだかるは智謀の化身・楠木正成。水陸二面作戦で新田義貞と楠木正成を分断撃破するか、正面突破で一気に上洛を果たすか！',
        choices: (game) => game.playerClanId === 'kusunoki' ? [
          {
            text: '【歴史改変IF】独自の判断で兵を退き、新田義貞とともに尊氏軍を包囲殲滅！',
            desc: '比叡山挟撃策の成就！尊氏軍を京都で分断包囲し、楠木軍兵力+6,000、大義名分確立！',
            isHistorical: false,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'kusunoki');
              if (p) p.troops += 6000;
              g.provinces.filter(pr => pr.ownerId === 'ashikaga').forEach(pr => pr.troops = Math.round(pr.troops * 0.5));
              g.log('【比叡山挟撃の快挙】楠木正成公の神算鬼謀により、足利尊氏の大軍を京都にて包囲壊滅！', 'important');
              return '正成公の智謀炸裂！尊氏軍を市中に誘い込んで退路を断ち、大勝利を収めました！';
            }
          },
          {
            text: '【史実ルート】湊川にて命を賭して迎え撃ち、武士の鑑として不朽の忠義を示す！',
            desc: '尊氏軍前衛に壊滅的打撃を与える。民百姓の熱狂的忠誠、米+3,000！',
            isHistorical: true,
            action: (g) => {
              g.rice += 3000;
              g.log('【湊川の忠烈】楠木正成公の奮戦により、敵主力部隊に壊滅的打撃を与えました！', 'important');
              return '七生報国の壮絶なる奮戦！敵将も兜を脱ぐほどの忠勇を示し、後世に名を刻みました！';
            }
          }
        ] : [
          {
            text: '【史実ルート】水陸二面作戦を敷き、新田軍と楠木軍を完全に分断せよ！',
            desc: '卓越した用兵で勝利を掴む。足利軍兵力+5,000、京都進駐！',
            isHistorical: true,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'ashikaga');
              if (p) p.troops += 5000;
              g.log('【水陸二面作戦 成功】大船団と陸戦部隊の連携により、敵軍の分断に成功しました！', 'important');
              return '海陸から同時に攻め寄せ、敵防衛線を突破！京洛への道を切り拓きました！';
            }
          },
          {
            text: '【歴史改変IF】楠木正成の智勇を讃え、破格の条件で和睦交渉を仕掛ける！',
            desc: '正成公を味方に引き入れる歴史的融和。足利軍の政治・智謀大幅向上、金+1,500！',
            isHistorical: false,
            action: (g) => {
              g.gold += 1500;
              g.log('【楠木との和睦】尊氏公の寛大なる器量により、楠木勢との融和に成功しました！', 'important');
              return '無駄な流血を避け、天下の名将・楠木正成と盟約を結ぶことに成功しました！';
            }
          }
        ]
      },
{
        id: 'nanban_trade',
        scenarioId: '*',
        year: 1543,
        title: '❖ 南蛮船来航・新式鉄砲と火薬の交易 ❖',
        subTitle: 'はるかイスパニア・ポルトガルより来たりし黒船の威容',
        check: (game) => game.year === 1543,
        narrative: (game) => '領内の湊に、白帆を揚げた巨大な南蛮船が入港してまいりました。カピタン（船長）は珍奇な南蛮渡りの文物を献上するとともに、最新式の火縄銃・カルバリン巨砲と良質な硝石の大量売買を持ちかけております。',
        choices: (game) => [
          {
            text: '【鉄砲大量購入】最新式鉄砲500挺と火薬を買い入れ、鉄砲隊を編成！',
            desc: '軍資金500貫を投じ、鉄砲隊を大幅増強！本拠地兵力+3,500！',
            isHistorical: true,
            action: (g) => {
              const paid = Math.min(500, Math.max(0, Number(g.gold) || 0));
              g.gold = Math.max(0, g.gold - 500);
              const myProvs = g.provinces.filter(p => p.ownerId === g.playerClanId);
              const home = myProvs.find(p => p.id === g.capitalProvId) || myProvs.find(p => p.governorId && (g.activeOfficers || []).some(o => o && o.id === p.governorId && o.isDaimyo)) || myProvs[0];
              if (home) home.troops += Math.round(3500 * paid / 500);
              g.log('【鉄砲隊配備】南蛮最新式銃が全軍に配備され、火力と戦闘力が飛躍的に向上！', 'important');
              return '轟音響く最新式鉄砲を配備！合戦における遠距離火力と突撃力が大幅に強化されました！';
            }
          },
          {
            text: '【南蛮貿易港開設】関税を低く抑え、海外交易による莫大な富を得る！',
            desc: '南蛮商館を誘致し商業運上を急拡大。軍資金+1,500貫獲得！',
            isHistorical: false,
            action: (g) => {
              g.gold += 1500;
              g.log('【南蛮貿易の繁栄】港湾に世界中の富が集まり、軍資金1,500貫を獲得しました！', 'important');
              return '南蛮貿易港として大いに繁栄！世界と結ばれた港から莫大な交易利潤がもたらされました！';
            }
          }
        ]
      },
{
        id: 'kawagoe',
        scenarioId: '*',
        year: 1546,
        title: '❖ 河越夜戦・八万の大軍を崩す奇襲 ❖',
        subTitle: '日本三大夜戦・河越城を取り囲む連合軍の油断を突け',
        check: (game) => game.year === 1546 && (game.playerClanId === 'hojo' || game.playerClanId === 'uesugi'),
        narrative: (game) => game.playerClanId === 'hojo'
          ? '山内上杉・扇谷上杉・古河公方の連合軍八万が河越城を幾重にも包囲。北条氏康は僅か八千を率いて救援に駆けつける。「鎧を脱ぎ、身軽になって夜陰に乗じ突撃せよ！」十文字槍の夜襲を敢行するか、あるいは城兵と連携して持久戦を挑むか！'
          : '河越城を包囲して数ヶ月。敵の後詰・北条氏康は兵力寡少と見て、連合軍陣中には油断と酒宴が広がっている。夜番を厳しくして奇襲を警戒するか、総攻撃を仕掛けて一気に城を落とすか！',
        choices: (game) => game.playerClanId === 'hojo' ? [
          {
            text: '【史実ルート】甲冑を脱ぎ捨て十文字槍で突撃！漆黒の夜襲を敢行！',
            desc: '八万の大軍が壊滅！扇谷上杉家滅亡、関東の覇権確立！北条軍兵力+5,000、金+1,200！',
            isHistorical: true,
            action: (g) => {
              g.gold += 1200;
              const p = g.provinces.find(pr => pr.ownerId === 'hojo');
              if (p) p.troops += 5000;
              g.provinces.filter(pr => pr.ownerId === 'uesugi').forEach(pr => pr.troops = Math.round(pr.troops * 0.4));
              g.log('【河越夜戦 大勝利】北条氏康公の電光石火の夜襲により八万の連合軍を完膚なきまでに撃破！', 'important');
              return '闇夜を裂いて突撃一番！敵連合軍は大混乱に陥り、関東の覇権は北条の手に帰しました！';
            }
          },
          {
            text: '【歴史改変IF】敵の補給路を封鎖し、包囲軍を飢餓に追い込む持久戦！',
            desc: '兵力の損耗なく連合軍を撤退させる。北条軍の兵糧+3,000、治安向上！',
            isHistorical: false,
            action: (g) => {
              g.rice += 3000;
              g.log('【兵站封鎖の勝利】糧道を断たれた連合軍は自壊し、無傷で河越城を救出しました！', 'important');
              return '兵站を巧みに絶ち、敵軍を内側から崩壊させて大勝利を収めました！';
            }
          }
        ] : [
          {
            text: '【歴史改変IF】油断を戒め夜番を徹底！北条の夜襲を逆迎撃！',
            desc: '氏康の奇襲部隊を伏兵で挟撃！上杉軍兵力+4,000、北条軍撃退！',
            isHistorical: false,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'uesugi');
              if (p) p.troops += 4000;
              g.log('【夜番徹底の妙】北条の奇襲を完全に看破！氏康勢を返り討ちにしました！', 'important');
              return '厳重な警備により夜襲を粉砕！関東管領の威信を大いに示しました！';
            }
          },
          {
            text: '【史実ルート】大軍の威勢をもって夜明けとともに河越城へ総突撃！',
            desc: '力攻めを敢行。攻城戦の経験蓄積、金+500獲得。',
            isHistorical: true,
            action: (g) => {
              g.gold += 500;
              g.log('【総突撃号令】大軍による総攻撃を期して陣容を整えました。');
              return '全軍に総攻撃を命じ、決戦の火蓋を切りました！';
            }
          }
        ]
      },
{
        id: 'okehazama',
        scenarioId: '*',
        year: 1560,
        title: '❖ 桶狭間の奇襲・今川本陣強襲 ❖',
        subTitle: '豪雨の田楽狭間に潜む今川義元四万の大軍',
        check: (game) => game.year === 1560 && (game.playerClanId === 'oda' || game.playerClanId === 'imagawa'),
        narrative: (game) => game.playerClanId === 'oda'
          ? '駿河・遠江・三河の軍勢四万を率い、尾張へと怒涛の進撃を開始した今川義元。織田信長は熱田神宮で必勝を祈願し、豪雨の中、田楽狭間に油断休息する義元本陣の虚を突くか、あるいは清洲城に全軍を集結し鉄壁の籠城戦を挑むか。天下の命運を分ける決断の刻が迫る！'
          : '尾張・清洲城を目指し破竹の進撃を続ける今川軍。折悪しく天候は激しい豪雨となった。斥候より「織田信長が寡兵を率いて田楽狭間へ向かっている」との不穏な報せが届く。本陣の防備を直ちに固めるか、あるいは進軍号令を維持して信長を誘い込むか！',
        choices: (game) => game.playerClanId === 'oda' ? [
          {
            text: '【史実ルート】豪雨に紛れ、田楽狭間の義元本陣へ乾坤一擲の急襲！',
            desc: '義元を討ち取り今川軍を壊滅させる。尾張・三河の情勢が一変し、自軍兵力+4,000、金+600獲得！松平家が独立し100季の清洲同盟締結！',
            isHistorical: true,
            action: (g) => {
              g.gold += 600;
              const p = g.provinces.find(pr => pr.ownerId === 'oda');
              if (p) p.troops += 4000;
              g.provinces.filter(pr => pr.ownerId === 'imagawa').forEach(pr => pr.troops = Math.round(pr.troops * 0.5));
              g.log('【桶狭間の奇襲 成功】織田信長公の急襲により今川義元が討死！今川軍は総崩れとなりました！', 'important');
              g.okehazamaOccurred = true;

              // 三河国の松平（徳川）家独立
              const mikawaProv = (g.provinces || []).find(pr => pr.id === 'mikawa_okazaki');
              if (mikawaProv && mikawaProv.ownerId === 'imagawa') {
                mikawaProv.ownerId = 'matsudaira';
                mikawaProv.troops = 3000;
              }

              g.updateTokugawaSurname(true);

              // 織田家と徳川（松平）家との100季同盟（清洲同盟）締結
              const tokuId = g.isClanExtant('tokugawa') ? 'tokugawa' : (g.isClanExtant('matsudaira') ? 'matsudaira' : 'tokugawa');
              g.alliances = g.alliances || [];
              const exists = g.alliances.find(al => al.members && al.members.includes('oda') && al.members.includes(tokuId));
              if (exists) {
                exists.durationSeasons = 100;
                exists.formedYear = g.year;
                exists.formedSeason = g.seasonIdx;
                exists.label = '清洲同盟';
              } else {
                g.alliances.push({
                  members: ['oda', tokuId],
                  formedYear: g.year,
                  formedSeason: g.seasonIdx,
                  durationSeasons: 100,
                  label: '清洲同盟'
                });
              }
              g.log('🤝【清洲同盟】織田信長公と徳川（松平）家康公の間で百季（100季）に及ぶ不滅の盟約が結ばれました！', 'important');

              return '田楽狭間に雷鳴轟く中、信長公の突撃一番！見事今川義元を討ち取り、三河の松平家と百季同盟（清洲同盟）を締結しました！';
            }
          },
          {
            text: '【歴史改変IF】清洲城に全軍集結！徹底籠城で大軍の兵糧切れを待つ！',
            desc: '兵力の損耗を防ぎ、防衛力を極限まで高める。全領国の治安+20、備蓄兵糧+1,200！',
            isHistorical: false,
            action: (g) => {
              g.rice += 1200;
              g.provinces.filter(pr => pr.ownerId === 'oda').forEach(pr => { pr.order = Math.min(100, pr.order + 20); pr.troops += 2000; });
              g.log('【清洲籠城の英断】堅固な城壁に阻まれ今川軍は補給難に陥り、退却を余儀なくされました！', 'important');
              return '堅牢無比なる清洲城の守りに、今川大軍は攻めあぐねて兵糧を浪費。損害皆無で敵を撤退せしめました！';
            }
          }
        ] : [
          {
            text: '【歴史改変IF】斥候の急報を容れ、本陣防備を固め織田軍を逆包囲！',
            desc: '信長の奇襲を逆手にとり撃破！尾張の織田領を激震させ、今川軍兵力+3,000！',
            isHistorical: false,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'imagawa');
              if (p) p.troops += 3000;
              g.provinces.filter(pr => pr.ownerId === 'oda').forEach(pr => pr.troops = Math.round(pr.troops * 0.4));
              g.log('【桶狭間逆包囲 成功】今川義元公の智謀により織田の奇襲軍を返り討ちにしました！', 'important');
              return '奇襲を仕掛けてきた織田勢を四方から包囲網で殲滅！尾張侵攻の足がかりを盤石としました！';
            }
          },
          {
            text: '【史実ルート】豪雨は天の恵みと心得、全軍に清洲城への総攻撃を命ず！',
            desc: '士気は上がるが奇襲のリスクあり。今川軍士気向上、金+500獲得。',
            isHistorical: true,
            action: (g) => {
              g.gold += 500;
              g.log('【強気進軍】今川軍は進軍を継続。兵站を確保し軍資金を獲得しました。');
              return '義元公の大号令のもと進撃を継続。軍備を整え、決戦に備えます。';
            }
          }
        ]
      },
      {
        id: 'suruga_invasion',
        scenarioId: '*',
        year: 1568,
        title: '❖ 駿河侵攻・今川氏滅亡 ❖',
        subTitle: '甲相駿三国同盟の破綻と風林火山の駿河急襲',
        check: (game) => game.year === 1568 && game.seasonIdx === 4 && (game.playerClanId === 'takeda' || game.playerClanId === 'imagawa'),
        narrative: (game) => game.playerClanId === 'takeda'
          ? '永禄11年12月、甲斐の武田信玄は駿河へと侵攻を開始した。桶狭間の戦い以降、動揺が続いていた今川家では重臣の裏切りが相次ぎ、当主・今川氏真は居城・駿府館を支えきれず敗走した。武田軍が駿河を電撃制圧して今川氏を滅ぼすか、あるいは三国同盟を尊重し侵攻を見送り駿河から撤退するか、運命の決断が迫る！'
          : '永禄11年12月、甲斐の武田信玄は駿河へと侵攻を開始した。桶狭間の戦い以降、動揺が続いていた今川家では重臣の裏切りが相次ぎ、当主・今川氏真は居城・駿府館を支えきれず敗走の危機に瀕している。薩埵峠にて必死の防戦を試み武田軍を撃退するか、あるいは防備が崩壊し今川氏滅亡の時を迎えるか！',
        choices: (game) => game.playerClanId === 'takeda' ? [
          {
            text: '【史実ルート】駿府館へ乾坤一擲の急襲！今川氏を滅亡させ駿河を領有！',
            desc: '武田軍が勝利し今川氏は滅亡。甲斐・高遠飯田・駿河・諏訪小諸・筑摩木曽谷・北信濃を領土にし、兵力+4,000、金+800獲得！今川との同盟は決裂。',
            isHistorical: true,
            action: (g) => {
              g.gold += 800;
              const provIds = ['kai', 'kai_tsuru', 'shinano_takato', 'shinano_iida', 'shinano_takato_iida', 'shinano_sarashina_hanishina', 'suruga', 'suwa_komoro', 'shinano_saku_komoro', 'shinano_suwa', 'shinano_chikuma_kiso', 'shinano_chikuma_azumi', 'shinano_kiso', 'shinano_kawanakajima'];
              provIds.forEach(pid => {
                const pr = g.provinces.find(p => p.id === pid);
                if (pr) {
                  pr.ownerId = 'takeda';
                  pr.troops = Math.max(3000, pr.troops || 3000);
                }
              });
              ['totomi_hamamatsu', 'totomi_kakegawa', 'totomi_futamata_haibara', 'totomi_joto'].forEach(tid => {
                const totomi = g.provinces.find(p => p.id === tid);
                if (totomi && totomi.ownerId === 'imagawa') {
                  const tokuId = g.isClanExtant('tokugawa') ? 'tokugawa' : (g.isClanExtant('matsudaira') ? 'matsudaira' : 'takeda');
                  totomi.ownerId = tokuId;
                  totomi.troops = Math.max(3000, totomi.troops || 3000);
                }
              });
              g.alliances = (g.alliances || []).filter(al => {
                const m = al.members || [];
                return !(m.includes('takeda') && m.includes('imagawa'));
              });
              g.syncDaimyoStatus();
              g.updateActiveOfficers();
              if (g.currentScenario) g.resolveOfficerAffiliations(g.currentScenario);
              g.log('【駿河侵攻 成功】武田軍の電撃侵攻により駿府今川館が陥落！名門・今川氏は滅亡し、武田家が甲斐、高遠・飯田、駿河、諏訪・小諸、筑摩・木曽谷、北信濃を領有しました！', 'important');
              return '駿府今川館を急襲し駿河一国を完全制圧！今川氏を滅ぼし、甲斐・高遠飯田・駿河・諏訪小諸・筑摩木曽谷・北信濃を手中に収めました！';
            }
          },
          {
            text: '【歴史改変IF】侵攻を見送る（武田が勝たない）！同盟を維持し領内内政に専念',
            desc: '武田は勝利せず駿河侵攻を中止。全領国の治安+20、備蓄兵糧+1,500獲得。今川家は存続。',
            isHistorical: false,
            action: (g) => {
              g.rice += 1500;
              g.provinces.filter(pr => pr.ownerId === 'takeda').forEach(pr => pr.order = Math.min(100, pr.order + 20));
              g.log('【侵攻中止】武田信玄公は駿河侵攻を見送り、領内の治安向上と富国強兵に専念しました。');
              return '駿河侵攻を行わず、今川家との盟約を尊重して領国の経営に専念しました。';
            }
          }
        ] : [
          {
            text: '【歴史改変IF】重臣の動揺を鎮め、薩埵峠にて武田軍を撃退（武田が勝たない）！',
            desc: '北条の救援を得て武田軍を撃退！今川家は駿河領国を死守し、兵力+4,000、城防+30！',
            isHistorical: false,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'imagawa');
              if (p) {
                p.troops += 4000;
                p.defense = Math.min(150, p.defense + 30);
              }
              g.log('【薩埵峠の防戦 成功】今川軍は薩埵峠で武田軍の猛攻を凌ぎ、武田信玄を甲斐へ撤退させました！', 'important');
              return '薩埵峠の峻険な要害に布陣し武田軍を撃攘！武田を撤退させ、駿河の領国を守り抜きました！';
            }
          },
          {
            text: '【史実ルート】重臣の離反を止められず、駿府館を支えきれず敗走（武田勝利・今川滅亡）',
            desc: '武田軍の猛攻により今川館が陥落。今川氏は戦国大名として滅亡する。',
            isHistorical: true,
            action: (g) => {
              const provIds = ['kai', 'kai_tsuru', 'shinano_takato', 'shinano_iida', 'shinano_takato_iida', 'shinano_sarashina_hanishina', 'suruga', 'suwa_komoro', 'shinano_saku_komoro', 'shinano_suwa', 'shinano_chikuma_kiso', 'shinano_chikuma_azumi', 'shinano_kiso', 'shinano_kawanakajima'];
              provIds.forEach(pid => {
                const pr = g.provinces.find(p => p.id === pid);
                if (pr) {
                  pr.ownerId = 'takeda';
                  pr.troops = Math.max(3000, pr.troops || 3000);
                }
              });
              ['totomi_hamamatsu', 'totomi_kakegawa', 'totomi_futamata_haibara', 'totomi_joto'].forEach(tid => {
                const totomi = g.provinces.find(p => p.id === tid);
                if (totomi && totomi.ownerId === 'imagawa') {
                  const tokuId = g.isClanExtant('tokugawa') ? 'tokugawa' : (g.isClanExtant('matsudaira') ? 'matsudaira' : 'takeda');
                  totomi.ownerId = tokuId;
                  totomi.troops = Math.max(3000, totomi.troops || 3000);
                }
              });
              g.syncDaimyoStatus();
              g.updateActiveOfficers();
              if (g.currentScenario) g.resolveOfficerAffiliations(g.currentScenario);
              g.log('【今川氏滅亡】武田軍の電撃侵攻により駿府館は陥落し、今川家は戦国大名として滅亡しました。', 'important');
              return '重臣の裏切り相次ぎ駿府館は陥落。今川氏真公は掛川城へ敗走し、名門・今川氏は戦国大名としての幕を閉じました。';
            }
          }
        ]
      },

{
        id: 'kanegasaki',
        scenarioId: '*',
        year: 1570,
        title: '❖ 金ヶ崎の退き口・木下藤吉郎の殿 ❖',
        subTitle: '越前朝倉攻めの最中、盟友浅井長政の裏切り発覚！',
        check: (game) => game.year === 1570 && game.seasonIdx === 0 && (game.playerClanId === 'oda' || game.playerClanId === 'azai'),
        narrative: (game) => game.playerClanId === 'oda'
          ? '越前・朝倉義景を討つべく敦賀へ進軍した織田軍。そこへお市の方より「小豆袋（袋の鼠）」の密書が届く。妹婿・浅井長政が盟約を破り、織田軍の背後を突くべく出陣したという！挟撃の危機に直面した信長は、木下藤吉郎（後の秀吉）に殿（しんがり）を託して脱出するか、全軍反転攻勢を仕掛けるか！'
          : '信長と朝倉の激突。浅井家代々の盟約を守って朝倉を助け信長を挟撃するか、あるいは信長との姻戚関係を優先し同盟を堅持するか。近江小谷城主・浅井長政の前に運命の二筋の道が横たわる！',
        choices: (game) => game.playerClanId === 'oda' ? [
          {
            text: '【史実ルート】木下藤吉郎に殿を任せ、電光石火の速さで京都へ脱出！',
            desc: '信長は無事帰還、藤吉郎の武名は天下に轟く！全軍再編により兵力+3,500、金+500！',
            isHistorical: true,
            action: (g) => {
              g.gold += 500;
              const p = g.provinces.find(pr => pr.ownerId === 'oda');
              if (p) p.troops += 3500;
              g.log('【金ヶ崎脱出 成功】木下藤吉郎の決死の殿により信長公は京洛へ無事帰還しました！', 'important');
              return '朽木越えを疾風の如く駆け抜け生還！藤吉郎の奮戦により全軍の損害を最小限に抑えました！';
            }
          },
          {
            text: '【歴史改変IF】撤退せず全軍反転！浅井・朝倉が合流する前に各個撃破！',
            desc: '電撃的各個撃破で近江・越前の両軍を撃攘！近江領内の浅井軍動揺、米+1,500！',
            isHistorical: false,
            action: (g) => {
              g.rice += 1500;
              g.provinces.filter(pr => pr.ownerId === 'azai').forEach(pr => pr.troops = Math.round(pr.troops * 0.6));
              g.log('【電撃反転攻勢】浅井軍の虚を突いて強襲！浅井・朝倉の包囲網を打ち破りました！', 'important');
              return '退却と見せかけて反転強襲！浅井軍を蹴散らし、逆転の勝機を掴み取りました！';
            }
          }
        ] : [
          {
            text: '【歴史改変IF】信長との同盟を維持！朝倉との調停に立ち天下静謐に貢献！',
            desc: '織田との同盟が深化。織田の経済・鉄砲支援を受け、浅井軍兵力+4,000、金+800！',
            isHistorical: false,
            action: (g) => {
              g.gold += 800;
              const p = g.provinces.find(pr => pr.ownerId === 'azai');
              if (p) p.troops += 4000;
              g.log('【浅井・織田の絆】信長との強固な同盟を堅持！近江の支配を確固たるものにしました！', 'important');
              return '信長公と固い握手を交わし同盟を維持。最新式の鉄砲と軍資金の支援を得て大いに発展しました！';
            }
          },
          {
            text: '【史実ルート】朝倉との信義を重んじ、織田軍の退路を遮断し挟撃！',
            desc: '浅井武士の義気を示す。浅井軍の結束力・防衛力向上、米+2,000！',
            isHistorical: true,
            action: (g) => {
              g.rice += 2000;
              g.log('【浅井の義挙】朝倉との古き絆を守り出陣！織田軍を挟撃の脅威に晒しました！');
              return '「浅井の信義ここにあり！」小谷城から全軍出陣し、信長軍の退路へ立ち塞がりました！';
            }
          }
        ]
      },
{
        id: 'sanpougahara',
        scenarioId: '*',
        year: 1572,
        title: '❖ 三方ヶ原の激突・武田騎馬軍団の猛威 ❖',
        subTitle: '上洛を目指す武田信玄対徳川家康・遠江の大激戦',
        check: (game) => game.year === 1572 && (game.playerClanId === 'takeda' || game.playerClanId === 'tokugawa' || game.playerClanId === 'matsudaira'),
        narrative: () => '三方ヶ原。武田信玄は浜松城を素通りし、打って出た徳川軍を魚鱗の陣で迎え撃つ。史実どおり武田が勝って遠江を奪うか、徳川が遠江を守り切るか。',
        choices: (game) => [
          {
            text: '【史実】武田が勝つ。北遠江（二俣）は武田領になる。',
            desc: '魚鱗の陣で徳川軍は敗れ、二俣城を含む北遠江（二俣・榛原）が武田領になる。',
            isHistorical: true,
            action: (g) => {
              ['totomi_futamata_haibara'].forEach(tid => {
                const totomi = g.provinces.find(pr => pr.id === tid);
                if (totomi) { totomi.ownerId = 'takeda'; totomi.troops = Math.max(totomi.troops || 0, 4500); }
              });
              const ieyasu = (pr) => pr.ownerId === 'tokugawa' || pr.ownerId === 'matsudaira';
              if (g.playerClanId === 'takeda') {
                g.gold += 800;
                const p = g.provinces.find(pr => pr.ownerId === 'takeda' && pr.id !== 'totomi_futamata_haibara') || g.provinces.find(pr => pr.ownerId === 'takeda');
                if (p) p.troops += 4500;
                g.provinces.filter(ieyasu).forEach(pr => pr.troops = Math.round(pr.troops * 0.5));
              } else {
                g.provinces.filter(ieyasu).forEach(pr => pr.order = 100);
              }
              g.log('【三方ヶ原】武田軍が勝利し、北遠江（二俣・榛原）は武田領となりました。', 'important');
              return '史実どおり武田が勝ち、北遠江（二俣・榛原）は武田領となりました。';
            }
          },
          {
            text: '【改変】徳川が遠江を守り切る。領地は動かない。',
            desc: '徳川が遠江を守り、武田の進撃を退ける。遠江の領主は変わらない。',
            isHistorical: false,
            action: (g) => {
              if (g.playerClanId === 'tokugawa' || g.playerClanId === 'matsudaira') {
                g.rice += 1000;
                g.provinces.filter(pr => pr.ownerId === 'tokugawa' || pr.ownerId === 'matsudaira').forEach(pr => pr.troops += 3000);
              }
              g.log('【三方ヶ原】徳川が遠江を守り切り、武田軍は退きました。', 'important');
              return '徳川が遠江を守り切りました。遠江の領主は変わりません。';
            }
          }
        ]
      },
{
        id: 'nagashino',
        scenarioId: '*',
        year: 1575,
        title: '❖ 長篠・設楽原の決戦 ❖',
        subTitle: '武田勝頼の騎馬軍団対織田・徳川連合軍の馬防柵と鉄砲',
        check: (game) => game.year === 1575 && ['takeda', 'tokugawa', 'matsudaira', 'oda'].includes(game.playerClanId),
        narrative: (game) => game.playerClanId === 'takeda'
          ? '奥平信昌の籠もる長篠城を囲む武田勝頼のもとへ、織田信長・徳川家康の大軍三万八千が設楽原に着陣したとの報が入った。敵は連吾川に沿って馬防柵を幾重にも結い、鉄砲を揃えて待ち構えている。馬場信春・山県昌景・内藤昌豊ら宿老は退却を説くが、勝頼は決戦を望む。設楽原へ打って出るか、長篠の囲みを解いて甲斐へ兵を返すか！'
          : '長篠城から抜け出した鳥居強右衛門の急報を受け、織田信長・徳川家康の連合軍は設楽原に布陣した。馬防柵の内に鉄砲を揃え、武田勝頼の騎馬軍団を迎え撃つ。史実どおり決戦となって武田軍が壊滅するか、勝頼が決戦を避けて兵を退くか。',
        choices: (game) => game.playerClanId === 'takeda' ? [
          {
            text: '【史実】設楽原へ打って出て、織田・徳川連合軍と決戦する。',
            desc: '馬防柵と鉄砲の前に武田軍は大敗。馬場信春・山県昌景・内藤昌豊らが討死し、北遠江（二俣）・東美濃（岩村）などを失う。',
            isHistorical: true,
            action: (g) => {
              g.log('【長篠の戦い】武田軍は設楽原で大敗し、馬場信春・山県昌景・内藤昌豊らが討死しました。', 'important');
              return '史実どおり設楽原で決戦し、武田軍は大敗しました。';
            }
          },
          {
            text: '【改変】長篠の囲みを解いて兵を返し、決戦を避ける。',
            desc: '宿老の諫めを容れて甲斐へ退く。宿将は討死せず、領地も動かない。',
            isHistorical: false,
            action: (g) => {
              g.log('【長篠】武田勝頼は宿老の諫めを容れて長篠の囲みを解き、決戦を避けて兵を退きました。', 'important');
              return '決戦を避けて兵を退きました。宿将は健在で、領地は動きません。';
            }
          }
        ] : [
          {
            text: '【史実】設楽原で武田軍を迎え撃ち、鉄砲で騎馬隊を打ち破る。',
            desc: '武田軍は大敗し、馬場信春・山県昌景・内藤昌豊らが討死。北遠江（二俣）・東美濃（岩村）などが徳川・織田領になる。',
            isHistorical: true,
            action: (g) => {
              g.gold += 500;
              g.log('【長篠の戦い】織田・徳川連合軍が設楽原で武田軍を破りました。', 'important');
              return '史実どおり設楽原で武田軍を打ち破りました。';
            }
          },
          {
            text: '【改変】武田勝頼は決戦を避けて兵を退き、合戦は起きない。',
            desc: '長篠城の囲みは解けるが、武田の宿将は健在で、領地は動かない。',
            isHistorical: false,
            action: (g) => {
              g.log('【長篠】武田勝頼は決戦を避けて兵を退き、設楽原の合戦は起きませんでした。', 'important');
              return '武田軍は兵を退きました。領地は動きません。';
            }
          }
        ]
      },
{
        id: 'honnoji',
        scenarioId: '*',
        year: 1582,
        title: '❖ 本能寺の変・天下統一前夜の激変 ❖',
        subTitle: '「敵は本能寺にあり！」京洛を揺るがす謀反と野望',
        check: (game) => game.year === 1582 && (game.playerClanId === 'oda' || game.playerClanId === 'akechi'),
        narrative: (game) => game.playerClanId === 'akechi'
          ? '西国・毛利攻めの援軍を命じられた明智光秀。しかし今や信長公は僅かな供回りとともに京都・本能寺に宿泊中。重臣たちを前に光秀は決断を迫られる。「敵は本能寺にあり」と天下を獲るか、あるいは忠節を守り毛利攻めへ出陣するか！'
          : '天下布武を目前にした織田信長。京都・本能寺にて茶会を催し休息中、突如として無数の銃声と勝ち鬨が響き渡る。桔梗紋の旗印――明智光秀の謀反である！寺院に踏みとどまり最後まで奮戦するか、あるいは南蛮寺の隠し地下道より脱出を図るか！',
        choices: (game) => game.playerClanId === 'akechi' ? [
          {
            text: '【史実ルート】「敵は本能寺にあり！」全軍反転、信長を急襲！',
            desc: '信長・信忠を討ち取り、山城・近江を手中に収める！諸将の所属先が再編され、天下の覇権へ名乗りを上げる！',
            isHistorical: true,
            action: (g) => {
              g.executeHonnoujiSuccession('akechi');
              g.gold += 1000;
              const p = g.provinces.find(pr => pr.ownerId === 'akechi');
              if (p) p.troops += 5000;
              g.log('【本能寺の変 勃発】明智光秀公が本能寺を急襲、天下の覇権へ名乗りを上げました！', 'important');
              return '早朝の本能寺を完全包囲！信長公を討ち取り、天下の主導権を掌握しました！';
            }
          },
          {
            text: '【歴史改変IF】私心を捨て、忠臣として西国毛利攻めへ急行！',
            desc: '織田家筆頭重臣の地位を確立。織田信長との固い絆により、全領国の兵力+3,000、米+2,000！',
            isHistorical: false,
            action: (g) => {
              g.rice += 2000;
              g.provinces.filter(pr => pr.ownerId === 'akechi').forEach(pr => pr.troops += 3000);
              g.log('【忠誠の貫徹】明智光秀公の忠節に信長公は大いに報い、織田・明智の絆は盤石となりました！', 'important');
              return '謀反の誘惑を断ち切り、西国へ出陣！信長公より絶大なる信頼を得て、天下統一の筆頭功臣となりました！';
            }
          }
        ] : [
          {
            text: '【歴史改変IF】南蛮寺の秘密通路より安土城へ脱出！反撃の烽火を上げよ！',
            desc: '信長生存の奇跡！安土城へ逃れ諸将に光秀討伐を令す。織田軍兵力+6,000、全領地治安回復！',
            isHistorical: false,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'oda');
              if (p) p.troops += 6000;
              g.provinces.filter(pr => pr.ownerId === 'oda').forEach(pr => pr.order = 100);
              g.log('【信長脱出の奇跡】織田信長公は奇跡的に安土城へ生還！諸将へ光秀討伐の号令を発しました！', 'important');
              return '南蛮寺の地下道を駆け抜け、無事に安土城へ帰還！「光秀を討て！」と全国へ大号令を下しました！';
            }
          },
          {
            text: '【史実ルート】「是非に及ばず！」弓を執り、最後まで覇王の誇りを示し奮戦！',
            desc: '織田信長公・信忠公落命。後継大名（羽柴・明智・柴田・織田信雄）を選択し、各武将の所属先を切り替えて乱世を生き抜きます。',
            isHistorical: true,
            action: (g) => {
              g.executeHonnoujiSuccession();
              // 後継選択が閉じるまで次のイベント・季節へ進まない
              g._historyFollowUp = true;
              g.showHonnoujiSuccessorSelectModal({ title: '本能寺の変・後継勢力の選択' });
              g.log('【本能寺の変】織田信長公落命。天下は分裂し、各後継勢力が乱立しました！', 'important');
              return '「人間五十年、下天の内をくらぶれば、夢幻の如くなり」――信長公は業火の中で誇り高く散りました。後継勢力を選定してください。';
            }
          }
        ]
      },
{
        id: 'kunohe_rebellion',
        scenarioId: '*',
        year: 1590,
        title: '❖ 九戸政実の乱・奥州覇王の蜂起 ❖',
        subTitle: '秀吉の奥州仕置に抗う東北屈指の猛将・陸奥九戸城の死闘',
        check: (game) => {
          if (game.linkedDataEventHappened && game.linkedDataEventHappened('kunohe_rebellion')) return false;
          return (game.year === 1590 || game.year === 1591 || game.year === 1592) && (game.playerClanId === 'nanbu' || game.playerClanId === 'kunohe' || game.playerClanId === 'toyotomi' || game.playerClanId === 'date');
        },
        narrative: () => '豊臣秀吉の奥州仕置に反発した九戸政実が、陸奥九戸城で蜂起した。史実通りなら仕置軍が乱を鎮圧し、陸奥・陸中は南部信直の支配に戻る。史実を適用しなければ、九戸政実が仕置軍を撃退して奥州独立を果たす。',
        choices: () => [
          {
            text: '【史実ルート】奥州仕置軍が九戸城を攻略し、乱を鎮圧する。',
            desc: '陸奥・陸中は南部信直の支配に戻る。九戸の独立は成らない。',
            isHistorical: true,
            action: (g) => g.applyRebellionFromChoice('kunohe_rebellion', 'suppress')
          },
          {
            text: '【歴史改変】史実を適用せず、九戸政実の乱を成功させる。',
            desc: '九戸政実が仕置軍を撃退し、陸奥・陸中を掌握して奥州独立を果たす。',
            isHistorical: false,
            action: (g) => g.applyRebellionFromChoice('kunohe_rebellion', 'success')
          }
        ]
      },
{
        id: 'sekigahara',
        scenarioId: '*',
        year: 1600,
        title: '❖ 関ヶ原の決戦・松尾山の問鉄砲 ❖',
        subTitle: '東軍十万対西軍八万・天下分け目の大激突',
        check: (game) => game.year === 1600 && (game.playerClanId === 'tokugawa' || game.playerClanId === 'ishida' || game.playerClanId === 'toyotomi'),
        narrative: (game) => game.playerClanId === 'tokugawa'
          ? '濃霧晴れわたる関ヶ原の盆地。西軍・石田三成の本隊と激戦を繰り広げる中、松尾山に陣取る小早川秀秋一万五千は日和見を決め込み動こうとしない。徳川家康は苛立ちの末、松尾山へ威嚇の問鉄砲を撃ち込ませるか、あるいは東軍自慢の精鋭で正面突破を図るか！'
          : '関ヶ原の合戦は酣。大谷吉継隊の奮戦により東軍前衛を押し戻しつつあるが、松尾山の小早川秀秋と南宮山の毛利秀元が動かない。三成は使者を送り即時参戦を強く促すか、あるいは自軍の防備を固め持久戦へ持ち込むか！',
        choices: (game) => game.playerClanId === 'tokugawa' ? [
          {
            text: '【史実ルート】松尾山の小早川陣へ問鉄砲を撃ち込み、寝返りを決断させよ！',
            desc: '小早川軍が寝返り西軍大谷隊へ突撃！西軍総崩れとなり、東軍兵力+5,000、金+1,000獲得！',
            isHistorical: true,
            action: (g) => {
              g.gold += 1000;
              const p = g.provinces.find(pr => pr.ownerId === 'tokugawa');
              if (p) p.troops += 5000;
              g.provinces.filter(pr => pr.ownerId === 'ishida').forEach(pr => pr.troops = Math.round(pr.troops * 0.4));
              g.log('【小早川寝返り 成功】問鉄砲に驚愕した小早川秀秋軍が西軍を強襲！天下分け目の大勝利！', 'important');
              return '松尾山から雪崩を打って駆け下りる小早川勢！西軍の防衛線は一瞬にして崩壊しました！';
            }
          },
          {
            text: '【歴史改変IF】他人の離反に頼らず、徳川旗本精鋭で三成本陣へ正面総突撃！',
            desc: '徳川武士団の無敵の武勇を見せつける。徳川軍全領国の兵力+4,000、武勇+10！',
            isHistorical: false,
            action: (g) => {
              g.provinces.filter(pr => pr.ownerId === 'tokugawa').forEach(pr => pr.troops += 4000);
              g.log('【徳川精鋭の正面突破】葵の御旗のもと徳川本隊が西軍中央を粉砕撃破しました！', 'important');
              return '小早川の態度を待たず、家康公自ら采配を振り正面撃破！徳川武士団の底力を見せつけました！';
            }
          }
        ] : [
          {
            text: '【歴史改変IF】毛利・吉川軍に直ちに背後を突かせ、家康本陣を完全包囲！',
            desc: '毛利秀元・吉川広家が参戦！家康本隊を挟み撃ちにし、西軍兵力+6,000、東軍大打撃！',
            isHistorical: false,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'ishida');
              if (p) p.troops += 6000;
              g.provinces.filter(pr => pr.ownerId === 'tokugawa').forEach(pr => pr.troops = Math.round(pr.troops * 0.5));
              g.log('【西軍総力戦の快挙】毛利・吉川の大軍が徳川の背後を急襲！歴史を覆す大包囲殲滅！', 'important');
              return '「毛利参陣せり！」南宮山の大軍が徳川軍の背後へ殺到！家康公を追い詰めて歴史的大勝利を収めました！';
            }
          },
          {
            text: '【史実ルート】大谷吉継・宇喜多秀家とともに義の陣形を死守！',
            desc: '不屈の忠義で防戦。西軍兵の結束力向上、米+2,500獲得！',
            isHistorical: true,
            action: (g) => {
              g.rice += 2500;
              g.log('【義の防戦】大谷・宇喜多の獅子奮迅の戦いにより、東軍の進撃を頑強に食い止めました！');
              return '豊臣恩顧の忠義を胸に奮戦！東軍の猛攻をしのぎ、防衛線を維持しました！';
            }
          }
        ]
      },
{
        id: 'shimabara_rebellion',
        scenarioId: '*',
        year: 1637,
        title: '❖ 島原の乱・原城籠城と幕府総動員 ❖',
        subTitle: '十字架の御旗を掲げる三万七千と西国諸大名十二万の激突',
        check: (game) => game.year === 1637 && (game.playerClanId === 'tokugawa' || game.playerClanId === 'amakusa' || game.playerClanId === 'hosokawa' || game.playerClanId === 'tachibana' || game.playerClanId === 'kuroda' || game.playerClanId === 'nabeshima'),
        narrative: (game) => game.playerClanId === 'amakusa'
          ? '苛酷を極める年貢取り立てとキリシタン弾圧に対し、島原・天草の農民・浪人三万七千が原城に蜂起！16歳の天草四郎時貞を中心に十字架の御旗のもと固く結束した。幕府軍十二万が城を重囲する中、信仰と有馬・小西旧臣の軍法で鉄壁の籠城戦を挑むか、あるいは闇夜に乗じて出撃し長崎を占拠して南蛮船と合流するか！'
          : '肥前島原・天草において天草四郎率いるキリシタン・浪人衆三万七千が原城に立て籠もり、幕府上使・板倉重昌が討死する大騒乱となった。幕府は知恵伊豆・松平信綱を総大将に、九州・西国の諸大名を総動員！兵糧攻めの末に大軍で原城を一気に総攻撃するか、あるいは苛政の元凶・松倉勝家を処罰し減税と和睦で乱の早期収拾を図るか！',
        choices: (game) => game.playerClanId === 'amakusa' ? [
          {
            text: '【歴史改変IF・反乱大成功】十字架の御旗のもと幕府十二万を完全撃退！九州西海に自由独立国を樹立！',
            desc: '原城の要害と不退転の団結で幕府軍を返り討ち！島原を完全掌握し肥後へ進撃！自軍兵力+7,000、金+2,500！',
            isHistorical: false,
            action: (g) => {
              g.gold += 2500;
              const hizen = g.provinces.find(pr => pr.id === 'hizen_shimabara');
              if (hizen) {
                hizen.troops += 7000;
                hizen.defense = 100;
                hizen.order = 100;
              }
              const higo = g.provinces.find(pr => pr.id === 'higo_yatsushiro');
              if (higo) {
                higo.ownerId = 'amakusa';
                higo.troops = 4000;
              }
              g.provinces.filter(pr => pr.ownerId === 'tokugawa').forEach(pr => {
                pr.troops = Math.round(pr.troops * 0.7);
              });
              g.log('【島原の乱 大勝利】天草四郎の奇跡の軍配により幕府軍十二万を完膚なきまでに撃退！九州西海にキリシタン独立領国を樹立しました！', 'important');
              return '十字架の御旗翻る原城にて幕府軍を撃滅！民衆の自由と信仰を守り抜き、西海に新たな時代を切り拓きました！';
            }
          },
          {
            text: '【史実ルート】十字架の御旗のもと、原城に死守籠城！奇跡の信仰で幕府軍を幾度も撃退！',
            desc: '驚異の団結力で籠城防衛！自軍兵力+5,000、防御度+40！敵軍に痛烈な打撃を与える！',
            isHistorical: true,
            action: (g) => {
              const hizen = g.provinces.find(pr => pr.id === 'hizen_shimabara');
              if (hizen) {
                hizen.troops += 5000;
                hizen.defense = Math.min(100, (hizen.defense || 50) + 40);
              }
              g.provinces.filter(pr => pr.ownerId === 'tokugawa').forEach(pr => {
                pr.troops = Math.round(pr.troops * 0.85);
              });
              g.log('【原城死守の奇跡】天草四郎の統率のもと、一揆軍は幕府軍の猛攻を幾度も撃退しました！', 'important');
              return '十字架の御旗翻る原城にて、三万七千の信徒と武士団が鉄壁の結束を発揮！幕府軍に甚大な損害を与えました！';
            }
          }
        ] : [
          {
            text: '【史実ルート】松平信綱の深謀！兵糧攻めの末に西国十二万の大軍で原城一斉総攻撃！',
            desc: '島原の乱を完全鎮圧！天下の泰平を盤石とし、幕府の威信が劇的向上！自軍兵力+5,000、金+1,500獲得！島原を天領直轄化！',
            isHistorical: true,
            action: (g) => {
              g.gold += 1500;
              const hizen = g.provinces.find(pr => pr.id === 'hizen_shimabara');
              if (hizen) {
                hizen.ownerId = g.playerClanId;
                hizen.troops = Math.max(hizen.troops, 5000);
                hizen.order = 95;
              }
              g.provinces.filter(pr => pr.ownerId === g.playerClanId).forEach(pr => {
                pr.troops += 1000;
              });
              g.log('【島原の乱 平定】松平信綱・九州諸大名の総攻撃により原城陥落！乱は完全鎮圧されました！', 'important');
              return '西国諸大名の総力をもって原城を攻略！反乱を完全に鎮圧し、天下の泰平と幕府の威信を揺るぎなきものとしました！';
            }
          },
          {
            text: '【歴史改変IF】苛政の元凶・松倉勝家を改易処断！寛大な減税と和睦で乱を収拾！',
            desc: '無益な殺傷を避け領民の心を掴む。九州全領国の治安+25、兵糧+3,000獲得！キリシタン武士団が帰順！',
            isHistorical: false,
            action: (g) => {
              g.rice += 3000;
              const hizen = g.provinces.find(pr => pr.id === 'hizen_shimabara');
              if (hizen) {
                hizen.ownerId = g.playerClanId;
                hizen.order = 90;
              }
              g.provinces.forEach(pr => {
                if (pr.region === '九州') pr.order = Math.min(100, (pr.order || 80) + 25);
              });
              g.log('【仁政による和睦】松倉勝家を厳罰に処し減税を断行！一揆勢の帰順を得て平和裏に事態を収拾しました！', 'important');
              return '悪政を糾弾して民心を取り戻し、戦火を未然に鎮火。名君の器量を天下に示しました！';
            }
          }
        ]
      },
{
        id: 'keian_yui_rebellion',
        scenarioId: '*',
        year: 1651,
        title: '❖ 由比正雪の乱（慶安の変）・十万牢人の江戸城強襲 ❖',
        subTitle: '家光急逝・十万の浪人を束ねて武断政治を揺るがす軍学者の大陰謀',
        check: (game) => {
          if (game.linkedDataEventHappened && game.linkedDataEventHappened('keian_yui_rebellion')) return false;
          return game.year === 1651 && (game.playerClanId === 'yui' || game.playerClanId === 'tokugawa' || game.playerClanId === 'kishu' || game.playerClanId === 'owari' || game.playerClanId === 'aizu');
        },
        narrative: () => '由比正雪と丸橋忠弥が、家光薨去に乗じて幕府転覆を謀った。史実通りなら松平信綱が一味を捕縛し、乱は鎮圧される。史実を適用しなければ、江戸城夜襲が成功し、正雪が武蔵・駿河・相模を掌握する。',
        choices: () => [
          {
            text: '【史実ルート】松平信綱が正雪一党を捕縛し、乱を鎮圧する。',
            desc: '慶安の変は未然に防がれ、武蔵・駿河は幕府の天領支配のままとなる。',
            isHistorical: true,
            action: (g) => g.applyRebellionFromChoice('keian_yui_rebellion', 'suppress')
          },
          {
            text: '【歴史改変】史実を適用せず、由比正雪の乱を成功させる。',
            desc: '丸橋忠弥の江戸城夜襲が成功し、由比正雪が武蔵・駿河・相模を掌握する。',
            isHistorical: false,
            action: (g) => g.applyRebellionFromChoice('keian_yui_rebellion', 'success')
          }
        ]
      },
{
        id: 'tenguto_rebellion',
        scenarioId: '*',
        year: 1864,
        title: '❖ 水戸天狗党の乱・中山道突破と尊皇維新 ❖',
        subTitle: '筑波山挙兵から雪の中山道千キロを踏破・尊皇攘夷の熱誠',
        check: (game) => {
          if (game.linkedDataEventHappened && game.linkedDataEventHappened('tenguto_rebellion')) return false;
          return game.year == 1864 && (game.playerClanId === 'mito' || game.playerClanId === 'tokugawa' || game.playerClanId === 'mori' || game.playerClanId === 'shimazu' || game.playerClanId === 'aizu');
        },
        narrative: () => '武田耕雲斎・藤田小四郎率いる天狗党が筑波山で挙兵し、中山道を西上して越前敦賀に達した。史実通りなら追討軍が包囲して乱を鎮圧する。史実を適用しなければ、天狗党が包囲を突破して近江へ進出する。',
        choices: () => [
                    {
            text: '【歴史改変】史実を適用せず、天狗党の乱を成功させる。',
            desc: '天狗党が敦賀の包囲を突破し、近江南北と常陸を水戸勢が掌握する。',
            isHistorical: false,
            action: (g) => g.applyRebellionFromChoice('tenguto_rebellion', 'success')
          },{
            text: '【史実ルート】諸藩の追討軍が敦賀で天狗党を包囲し、乱を鎮圧する。',
            desc: '天狗党は敦賀で降伏する。近江は井伊家・幕府の支配のまま、常陸は水戸藩の領に留まる。',
            isHistorical: true,
            action: (g) => g.applyRebellionFromChoice('tenguto_rebellion', 'suppress')
          }

        ]
      },
{
        id: 'tobafushimi',
        scenarioId: '*',
        year: 1868,
        title: '❖ 鳥羽・伏見の戦い ＆ 錦の御旗 ❖',
        subTitle: '幕末維新の夜明け・近代兵器と武士魂の激突',
        check: (game) => game.year === 1868 && (game.playerClanId === 'meiji' || game.playerClanId === 'tokugawa' || game.playerClanId === 'shimazu' || game.playerClanId === 'mori'),
        narrative: (game) => (game.playerClanId === 'meiji' || game.playerClanId === 'shimazu' || game.playerClanId === 'mori')
          ? '鳥羽街道・伏見街道で始まった新政府軍五千と旧幕府軍一万五千の激突。薩摩の砲兵と長州の銃隊が奮戦する中、朝廷より授かりし「錦の御旗」が前線に翻る！朝敵の汚名を恐れる旧幕府軍に対し、総攻撃を仕掛けるか、あるいは降伏を促すか！'
          : '大坂城から進軍した旧幕府軍。兵力では三倍勝るものの、新政府軍の最新式アームストロング砲とスナイドル銃に阻まれる。そこへ突如翻る「錦の御旗」！恭順の道を選び海路江戸へ退くか、大坂城に籠もり徹底抗戦を挑むか！',
        choices: (game) => (game.playerClanId === 'meiji' || game.playerClanId === 'shimazu' || game.playerClanId === 'mori') ? [
          {
            text: '【史実ルート】錦の御旗を高く掲げ、朝廷の官軍として総攻撃！',
            desc: '旧幕府軍は戦意喪失し大坂城へ退却！新政府軍兵力+5,000、近畿一円を完全制圧！',
            isHistorical: true,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === g.playerClanId);
              if (p) p.troops += 5000;
              g.provinces.filter(pr => pr.ownerId === 'tokugawa').forEach(pr => pr.troops = Math.round(pr.troops * 0.4));
              g.log('【錦の御旗の奇跡】官軍の錦旗に敵軍は総崩れ！鳥羽・伏見の大勝利を収めました！', 'important');
              return '菊の御紋の錦旗が翻ると、敵兵は戦意を失い潰走！維新への決定打となりました！';
            }
          },
          {
            text: '【歴史改変IF】徳川宗家に対し寛大な講和を提示し、無血で公議政体を発足！',
            desc: '内乱を即時終結させ、国力を温存。軍資金+2,000、全領地治安最大化！',
            isHistorical: false,
            action: (g) => {
              g.gold += 2000;
              g.provinces.forEach(pr => pr.order = 100);
              g.log('【大政奉還・無血融和】内戦の流血を最小限に防ぎ、諸藩合議の新国家を樹立しました！', 'important');
              return '徳川家と速やかに和睦を結び、国力を損なうことなく近代国家の建設へ踏み出しました！';
            }
          }
        ] : [
          {
            text: '【歴史改変IF】大坂城に籠もり諸藩を糾合！近代砲兵で徹底持久戦！',
            desc: '大坂城の巨城を盾に反撃！幕府海軍の軍艦を活用し、旧幕府軍兵力+6,000！',
            isHistorical: false,
            action: (g) => {
              const p = g.provinces.find(pr => pr.ownerId === 'tokugawa');
              if (p) p.troops += 6000;
              g.log('【大坂城死守の英断】幕府海軍と近代砲兵を組織し、新政府軍の進撃を阻止しました！', 'important');
              return '東洋一の名城・大坂城に拠り、榎本海軍の艦砲射撃とともに反撃を開始しました！';
            }
          },
          {
            text: '【史実ルート】朝敵となるを恐れ、海路江戸へ退却し恭順謹慎の道を選ぶ。',
            desc: '無用な戦火を避け、江戸を戦火から救う。軍資金+1,500獲得。',
            isHistorical: true,
            action: (g) => {
              g.gold += 1500;
              g.log('【恭順の道】無駄な流血を避けるため海路江戸へ退却。再起を図ります。');
              return '朝廷への恭順を示しつつ江戸へ後退。万民を戦火から守る英断を下しました。';
            }
          }
        ]
      }

];;
if (typeof window !== "undefined") window.HISTORICAL_CHOICE_EVENTS = HISTORICAL_CHOICE_EVENTS;


// 歴史イベントの特殊扱い（選択イベントとの連動・反乱の組・フラグ・本能寺の後継データなど）は data/events.json の rules / choiceEventRules に移した
// 同一人物の別名（改名・賜姓・表記ゆれ）。当主名の照合はこの完全一致グループだけで行い、部分一致は使わない;


// 武将配属ルール・一門名簿・主家の代替・改姓・本拠の変遷・AI補正などの家/武将データは
// data/rules.json に移しました（DataLoader が window.* に読み込みます）。2026-11-14

// 国の北→南の並びは provinces.json の mapNo を使う（緯度表・並び順表は廃止 2026-11-15）


export const FORMATION_TYPES = {
  assault: { id: 'assault', label: '突撃系', keys: ['gyorin', 'hoshi', 'kuruma'] },
  encircle: { id: 'encircle', label: '包囲系', keys: ['kakuyoku', 'ganko'] },
  defense: { id: 'defense', label: '防御系', keys: ['hoen'] }
};;
if (typeof window !== "undefined") window.FORMATION_TYPES = FORMATION_TYPES;

export const FORMATIONS_DATA = {
  gyorin:  { key: 'gyorin',  name: '魚鱗', label: '魚鱗 (突撃突破)', type: 'assault',  desc: '中央突破の突撃陣' },
  hoshi:   { key: 'hoshi',   name: '鋒矢', label: '鋒矢 (中央直撃)', type: 'assault',  desc: '一点突破の突撃陣' },
  kuruma:  { key: 'kuruma',  name: '車懸', label: '車懸 (波状連撃)', type: 'assault',  desc: '波状の連撃突撃' },
  kakuyoku:{ key: 'kakuyoku',name: '鶴翼', label: '鶴翼 (包囲殲滅)', type: 'encircle', desc: '両翼包囲の陣' },
  ganko:   { key: 'ganko',   name: '雁行', label: '雁行 (鉄砲斉射)', type: 'encircle', desc: '斜線斉射の包囲射撃' },
  hoen:    { key: 'hoen',    name: '方円', label: '方円 (鉄壁防御)', type: 'defense',  desc: '全周防御の鉄壁陣' }
};

// 突撃 > 包囲 > 防御 > 突撃。dealt=与ダメ倍率, taken=被ダメ倍率;
if (typeof window !== "undefined") window.FORMATIONS_DATA = FORMATIONS_DATA;

export const FORMATION_RPS = {
  assault:  { beats: 'encircle', losesTo: 'defense' },
  encircle: { beats: 'defense',  losesTo: 'assault' },
  defense:  { beats: 'assault',  losesTo: 'encircle' },
  advantage:  { dealt: 1.18, taken: 0.90 },
  disadvantage:{ dealt: 0.85, taken: 1.12 },
  neutral:    { dealt: 1.00, taken: 1.00 }
};

// 地形キーワード（specialty / culturalNotes / region 照合）。±10%程度;
if (typeof window !== "undefined") window.FORMATION_RPS = FORMATION_RPS;

export const TERRAIN_KEYWORDS = {
  plain:    { label: '平地', boost: 'assault',  keywords: /平原|平野|盆地|田園|穀倉|米どころ|大平野|沃野|平城/ },
  mountain: { label: '山地', boost: 'defense',  keywords: /山|峠|峡|山城|山地|嶺|峰|険|要塞|金坑|銀山|金山|鉱山/ },
  coast:    { label: '沿岸', boost: 'encircle', keywords: /港|湊|湾|海|島|水軍|船|黒潮|瀬戸|南蛮|貿易|舟運|湖|川/ }
};;
if (typeof window !== "undefined") window.TERRAIN_KEYWORDS = TERRAIN_KEYWORDS;

export const SPECIALTY_SYNERGY = [
  {
    id: 'iron',
    label: '鉄・刀剣産地',
    keywords: /鉄|刀|刃物|鉄器|砂鉄|甲冑|武具|銅|兵器/,
    effects: { militaryGoldDiscount: 0.20 } // 軍備金コスト -20%
  },
  {
    id: 'rice',
    label: '米・穀倉',
    keywords: /米|穀|稲|縮|穀倉|米どころ|新田/,
    effects: { autumnRiceBonus: 0.20 } // 秋収穫 +20%
  },
  {
    id: 'port',
    label: '港・南蛮貿易',
    keywords: /港|湊|堺|博多|平戸|南蛮|貿易|海運|水軍/,
    effects: { autumnDefenseBonus: 2, autumnTroopBonus: 80, gunSupplyFlag: true }
  },
  {
    id: 'mine',
    label: '金山・銀山',
    keywords: /金山|銀山|金銀|金坑|生野|佐渡|石見|甲州金/,
    provinceIds: ['sado', 'iwami', 'tajima', 'kai'],
    effects: { seasonGoldBonus: 100 } // 毎季固定金収入ボーナス +100貫/国
  },
  {
    id: 'horse',
    label: '名馬産地',
    keywords: /南部馬|木曽馬|甲州馬|馬|牧|名馬/,
    provinceIds: ['mutsu_nanbu', 'kai', 'kai_tsuru', 'shinano_kawanakajima', 'shinano_sarashina_hanishina', 'shinano_ueda', 'shinano_chikuma_kiso', 'shinano_chikuma_azumi', 'shinano_kiso', 'shinano_takato', 'shinano_iida', 'shinano_takato_iida'],
    effects: { assaultBonus: 0.25 } // 突撃系攻撃力底上げ +25%
  },
  {
    id: 'gunsmith',
    label: '鉄砲鍛冶・南蛮港町',
    keywords: /堺|国友|種子島|長崎|鉄砲|砲術|火縄/,
    provinceIds: ['osumi', 'izumi', 'omi_north', 'omi_south', 'hizen', 'hizen_saga', 'hizen_tsukushi', 'hizen_karatsu'],
    effects: { shootBonus: 0.30, commerceGoldBonus: 80 } // 射撃強化+30%・商業金収入ボーナス
  }
];;
if (typeof window !== "undefined") window.SPECIALTY_SYNERGY = SPECIALTY_SYNERGY;

export const IKKI_ORDER_THRESHOLD = 50;;
if (typeof window !== "undefined") window.IKKI_ORDER_THRESHOLD = IKKI_ORDER_THRESHOLD;

export const CASTELLAN_INDEPENDENCE_CHANCE = 0.32;;
if (typeof window !== "undefined") window.CASTELLAN_INDEPENDENCE_CHANCE = CASTELLAN_INDEPENDENCE_CHANCE;

export const RONIN_BLANK_UPRISING_CHANCE = 0.28;


// ===== 史実配置の補正（武将の所属・城代） =====
// 朝廷・院・公家方。城代の配置先を理由に武家へ吸収しない（app の一般一門吸収で参照）;
if (typeof window !== "undefined") window.RONIN_BLANK_UPRISING_CHANCE = RONIN_BLANK_UPRISING_CHANCE;


export const HEIR_TEMPERAMENT_RULE = { capableTop: 80, mediocreTop: 70, mediocreSum: 180, bioMinChars: 15 };
export const PASSIVE_HEIR_TUNING = { attackProb: 0.03, requiredRatio: 2.5, forceRatio: 0.6, minSourceTroops: 2500, coalitionBoost: 0, coalitionCap: 0.03, ignoreRice: false, allianceBonus: 0.15, frontShiftMax: 300 };
if (typeof window !== 'undefined') { window.HEIR_TEMPERAMENT_RULE = HEIR_TEMPERAMENT_RULE; window.PASSIVE_HEIR_TUNING = PASSIVE_HEIR_TUNING; }


