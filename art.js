/**
 * Uygulamaya özel SVG çizimleri (art.js)
 *
 * Hazır simge seti, dış görsel veya emoji kullanılmaz.
 * Tüm Buddy karakterleri (200x200 tuval) ve arayüz simgeleri (48x48 tuval)
 * uygulamanın kendi yumuşak "fasulye" gövde ve parlak simge tarzında çizilir.
 */
(function () {
  'use strict';

  var BODY_PATH = 'M100 40 C146 40 160 82 160 122 C160 162 136 184 100 184 C64 184 40 162 40 122 C40 82 54 40 100 40 Z';
  var INK = '#1F2933';
  var uidCounter = 0;

  function nextUid(prefix) {
    uidCounter += 1;
    return (prefix || 'svg') + '-' + uidCounter;
  }

  /** İki HEX rengini karıştırır (amount: 0 = a, 1 = b) */
  function mixColor(a, b, amount) {
    function parse(h) {
      return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
    }
    var x = parse(a);
    var y = parse(b);
    return '#' + x.map(function (v, i) {
      var m = Math.round(v + (y[i] - v) * amount);
      var s = m.toString(16);
      return s.length < 2 ? '0' + s : s;
    }).join('');
  }

  /** Açık temadan karanlık mod karşılığını üretir (Buddy kimliğini korur) */
  function getDarkPalette(light) {
    return {
      primary: mixColor(light.primary, '#000000', 0.04),
      primaryDark: mixColor(light.primary, '#FFFFFF', 0.45),
      primaryShadow: mixColor(light.primary, '#000000', 0.35),
      background: mixColor('#0E1217', light.primary, 0.08),
      surface: mixColor('#171D25', light.primary, 0.06),
      surfaceElevated: mixColor('#1E2631', light.primary, 0.09),
      soft: mixColor('#181E25', light.primary, 0.28),
      border: mixColor('#2E3744', light.primary, 0.16),
      mutedBg: mixColor('#232B35', light.primary, 0.08),
      text: '#E9EDF1',
      textMuted: '#9AA5B1'
    };
  }

  function getLightPalette(light) {
    return {
      primary: light.primary,
      primaryDark: light.primaryDark,
      primaryShadow: light.primaryDark,
      background: light.background,
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      soft: light.soft,
      border: mixColor('#E3E8EF', light.primary, 0.12),
      mutedBg: '#EEF1F5',
      text: '#1F2933',
      textMuted: '#5C6877'
    };
  }

  var BUDDIES = [
    {
      id: 'dino',
      locked: false,
      currencyIcon: 'leaf',
      theme: { primary: '#0FA3B1', primaryDark: '#0A7580', background: '#EEF9FA', soft: '#CDEFF2' },
      art: {
        top: '#45D6C8',
        bottom: '#22A99C',
        limb: '#1C978B',
        blush: '#FF9AAA',
        blushOpacity: 0.85,
        fang: true,
        back: function () {
          return (
            '<path d="M148 150 Q192 156 190 118 Q176 138 146 132 Z" fill="#22A99C"/>' +
            '<path d="M84 46 L90 26 L100 44 Z M102 42 L110 20 L118 44 Z M120 48 L130 32 L134 54 Z" fill="#FFB547" stroke="#FFB547" stroke-width="6" stroke-linejoin="round"/>'
          );
        },
        front: function () {
          return '<ellipse cx="100" cy="146" rx="36" ry="30" fill="#D4F5F1"/>';
        }
      },
      tr: {
        name: 'Gümbür',
        kind: 'Ufak, tatlı canavar dino',
        personality: 'Minik ama kendini koca bir canavar sanıyor. Her başarında sevinçten zıplar.',
        quote: 'Raawr! Minik adımlarla gümbür gümbür ilerliyoruz!',
        currency: 'Yaprak'
      },
      en: {
        name: 'Rumble',
        kind: 'Tiny, cute monster dino',
        personality: 'Small, yet convinced it is a giant monster. Jumps for joy at every win.',
        quote: 'Raawr! Tiny steps, giant stomps — let us crush today’s goals!',
        currency: 'Leaves'
      }
    },
    {
      id: 'panda',
      locked: false,
      currencyIcon: 'bamboo',
      theme: { primary: '#3FA34D', primaryDark: '#2B7A36', background: '#F1FAEE', soft: '#DCF2DF' },
      art: {
        top: '#FFFFFF',
        bottom: '#E6ECF1',
        limb: '#2B2D42',
        limbEdge: '#6B7090',
        stroke: '#DCE3EA',
        blush: '#FF8FA3',
        patches: '#2B2D42',
        back: function () {
          return '<circle cx="60" cy="56" r="19" fill="#2B2D42"/><circle cx="140" cy="56" r="19" fill="#2B2D42"/>';
        },
        front: function (uid) {
          return (
            '<defs><clipPath id="pclip-' + uid + '"><path d="' + BODY_PATH + '"/></clipPath></defs>' +
            '<path d="M30 128 Q100 142 170 128 L170 152 Q100 166 30 152 Z" fill="#2B2D42" clip-path="url(#pclip-' + uid + ')"/>'
          );
        }
      },
      tr: {
        name: 'Pofi',
        kind: 'Sakin ve sevimli panda',
        personality: 'Sakin, sabırlı ve şefkatli. Seni asla yargılamaz, adım adım eşlik eder.',
        quote: 'Acele yok dostum, bugün küçük bir adım bile yeter!',
        currency: 'Bambu'
      },
      en: {
        name: 'Pofi',
        kind: 'Calm and cuddly panda',
        personality: 'Calm, patient and caring. Never judges you — walks beside you step by step.',
        quote: 'No rush at all — even one small step is enough today!',
        currency: 'Bamboo'
      }
    },
    {
      id: 'tilki',
      locked: false,
      currencyIcon: 'berry',
      theme: { primary: '#FF7A1A', primaryDark: '#C85A00', background: '#FFF4EA', soft: '#FFE3CC' },
      art: {
        top: '#FFA45C',
        bottom: '#F07A1F',
        limb: '#5A3A2A',
        blush: '#FF6F7F',
        back: function () {
          return (
            '<path d="M146 152 Q198 152 188 94 Q172 118 148 130 Z" fill="#F07A1F"/>' +
            '<path d="M188 94 Q196 108 190 120 Q182 108 176 104 Z" fill="#FFF4EA"/>' +
            '<path d="M58 64 L64 22 L92 46 Z M142 64 L136 22 L108 46 Z" fill="#F07A1F" stroke="#F07A1F" stroke-width="8" stroke-linejoin="round"/>' +
            '<path d="M66 54 L68 34 L82 46 Z M134 54 L132 34 L118 46 Z" fill="#FFE3CC" stroke="#FFE3CC" stroke-width="4" stroke-linejoin="round"/>'
          );
        },
        front: function () {
          return (
            '<ellipse cx="100" cy="150" rx="32" ry="26" fill="#FFF4EA"/>' +
            '<ellipse cx="100" cy="116" rx="24" ry="14" fill="#FFF4EA"/>' +
            '<ellipse cx="100" cy="105" rx="4.5" ry="3.2" fill="#2B2D42"/>'
          );
        }
      },
      tr: {
        name: 'Fındık',
        kind: 'Zeki ve enerjik tilki',
        personality: 'Hızlı, esprili ve rekabetçi. Seni oyunla motive eder.',
        quote: 'Hop! Bugün kimse bizi durduramaz, bir böğürtlen daha kapalım mı?',
        currency: 'Böğürtlen'
      },
      en: {
        name: 'Hazel',
        kind: 'Clever, energetic fox',
        personality: 'Quick, witty and competitive. Keeps you moving through play.',
        quote: 'Hop! Nobody can stop us today — shall we grab another berry?',
        currency: 'Berries'
      }
    },
    {
      id: 'kedi',
      locked: false,
      currencyIcon: 'fish',
      theme: { primary: '#844CE0', primaryDark: '#5E2FB0', background: '#F6F0FF', soft: '#E9DCFF' },
      art: {
        top: '#B58CF2',
        bottom: '#9B5DE5',
        limb: '#7E44C9',
        blush: '#FF8FB1',
        back: function () {
          return (
            '<path d="M152 160 Q190 160 184 124 Q180 104 192 96" fill="none" stroke="#9B5DE5" stroke-width="11" stroke-linecap="round"/>' +
            '<path d="M56 66 L60 24 L90 46 Z M144 66 L140 24 L110 46 Z" fill="#B58CF2" stroke="#B58CF2" stroke-width="8" stroke-linejoin="round"/>' +
            '<path d="M64 56 L66 36 L80 46 Z M136 56 L134 36 L120 46 Z" fill="#FFC2DA" stroke="#FFC2DA" stroke-width="4" stroke-linejoin="round"/>'
          );
        },
        front: function () {
          return (
            '<ellipse cx="100" cy="148" rx="34" ry="28" fill="#EDE2FF"/>' +
            '<g stroke="#5B2E99" stroke-width="2.2" stroke-linecap="round" opacity="0.7">' +
            '<line x1="52" y1="104" x2="70" y2="108"/><line x1="52" y1="116" x2="70" y2="114"/>' +
            '<line x1="148" y1="104" x2="130" y2="108"/><line x1="148" y1="116" x2="130" y2="114"/>' +
            '</g>'
          );
        }
      },
      tr: {
        name: 'Mırmır',
        kind: 'Huysuz ama tatlı kedi',
        personality: 'Biraz nazlı, biraz alaycı ama içten içe seninle gurur duyar.',
        quote: 'Şekerleme saatimden önce bir görev bitirirsen belki balık kazanırsın.',
        currency: 'Balık'
      },
      en: {
        name: 'Purr',
        kind: 'Grumpy but sweet cat',
        personality: 'A little fussy, a touch sarcastic, yet secretly proud of you.',
        quote: 'Finish one task before nap time and maybe you earn a fish... maybe.',
        currency: 'Fish'
      }
    },
    {
      id: 'robot',
      locked: false,
      currencyIcon: 'battery',
      theme: { primary: '#2D9CDB', primaryDark: '#1B6FA0', background: '#EEF7FD', soft: '#D6ECFA' },
      art: {
        top: '#7CCBF7',
        bottom: '#2D9CDB',
        limb: '#1B6FA0',
        blush: '#FF8FA3',
        back: function () {
          return (
            '<line x1="100" y1="44" x2="100" y2="20" stroke="#1B6FA0" stroke-width="5" stroke-linecap="round"/>' +
            '<circle cx="100" cy="16" r="8" fill="#FFB547"/>' +
            '<rect x="32" y="100" width="14" height="24" rx="5" fill="#1B6FA0"/>' +
            '<rect x="154" y="100" width="14" height="24" rx="5" fill="#1B6FA0"/>'
          );
        },
        front: function () {
          return (
            '<rect x="72" y="130" width="56" height="36" rx="10" fill="#D6ECFA"/>' +
            '<circle cx="88" cy="148" r="5" fill="#FF6B6B"/>' +
            '<circle cx="100" cy="148" r="5" fill="#FFB547"/>' +
            '<circle cx="112" cy="148" r="5" fill="#3FA34D"/>'
          );
        }
      },
      tr: {
        name: 'Bup',
        kind: 'Mantıklı asistan robot',
        personality: 'Planlı, net ve verimlilik meraklısı. Rutinlerini sistemli tutar.',
        quote: 'Bup bop! Sistem aktif. Bugünkü görev listesi yüklendi!',
        currency: 'Enerji'
      },
      en: {
        name: 'Bup',
        kind: 'Logical robot assistant',
        personality: 'Organised, clear and devoted to tidy daily systems.',
        quote: 'Beep boop! System online. Today’s mission queue is ready!',
        currency: 'Energy'
      }
    },
    {
      id: 'filiz',
      locked: false,
      currencyIcon: 'drop',
      theme: { primary: '#43B05C', primaryDark: '#2E8B3E', background: '#F0FAEC', soft: '#D7F2CF' },
      art: {
        top: '#B4EE84',
        bottom: '#55C463',
        limb: '#2E8B3E',
        blush: '#FF8FA3',
        blushOpacity: 0.8,
        back: function () {
          return (
            '<path d="M100 46 Q97 28 101 14" fill="none" stroke="#2E8B3E" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M100 30 Q78 8 62 22 Q78 36 100 30 Z" fill="#2FA84F"/>' +
            '<path d="M101 22 Q124 -2 144 12 Q126 30 101 22 Z" fill="#2FA84F"/>' +
            '<path d="M100 30 Q80 20 68 22 M101 22 Q122 10 138 12" fill="none" stroke="#7FD98E" stroke-width="2" stroke-linecap="round"/>'
          );
        },
        front: function () {
          return (
            '<path d="M44 148 L156 148 L142 184 Q100 190 58 184 Z" fill="#C8643B"/>' +
            '<rect x="36" y="134" width="128" height="18" rx="8" fill="#E07A4F"/>' +
            '<path d="M46 142 H154" stroke="#F4A37E" stroke-width="2.5" stroke-linecap="round"/>'
          );
        }
      },
      tr: {
        name: 'Filiz',
        kind: 'Seninle büyüyen fidan',
        personality: 'Yavaş ama istikrarlı büyümeye inanır.',
        quote: 'Her gün bir damla; ben de büyüyorum, sen de büyüyorsun!',
        currency: 'Damla'
      },
      en: {
        name: 'Sprout',
        kind: 'Little sapling growing with you',
        personality: 'Believes in gentle, steady growth every single day.',
        quote: 'One drop a day — I grow a little, and so do you!',
        currency: 'Drops'
      }
    },
    {
      id: 'bulut',
      locked: false,
      currencyIcon: 'star',
      theme: { primary: '#6272F5', primaryDark: '#4350C2', background: '#F1F3FF', soft: '#DEE2FF' },
      art: {
        top: '#FFFFFF',
        bottom: '#DCE1FF',
        limb: '#6C7CFF',
        stroke: '#D3D9FF',
        blush: '#FF8FB1',
        back: function () {
          return (
            '<g fill="#EEF0FF" stroke="#D3D9FF" stroke-width="2">' +
            '<circle cx="58" cy="74" r="24"/><circle cx="100" cy="50" r="30"/><circle cx="142" cy="74" r="24"/>' +
            '<circle cx="40" cy="116" r="18"/><circle cx="160" cy="116" r="18"/>' +
            '</g>'
          );
        },
        front: function () {
          return '<circle cx="44" cy="60" r="3" fill="#FFD166"/><circle cx="160" cy="46" r="4" fill="#FFD166"/>';
        }
      },
      tr: {
        name: 'Pamuk',
        kind: 'Pofuduk hayalperest bulut',
        personality: 'Rahat, pozitif ve yumuşacık bir yol arkadaşı.',
        quote: 'Pofuduk bir günaydın! Bugün birkaç yıldız toplamaya ne dersin?',
        currency: 'Yıldız'
      },
      en: {
        name: 'Puff',
        kind: 'Fluffy daydreaming cloud',
        personality: 'Relaxed, gentle and endlessly optimistic.',
        quote: 'A fluffy good morning! How about collecting a few stars today?',
        currency: 'Stars'
      }
    },
    {
      id: 'ejderha',
      locked: true,
      currencyIcon: 'coin',
      theme: { primary: '#E63946', primaryDark: '#A8222D', background: '#FFF0F1', soft: '#FFD9DC' },
      art: {
        top: '#FF7B7B',
        bottom: '#E63946',
        limb: '#A8222D',
        blush: '#FFB3BA',
        back: function () {
          return (
            '<path d="M50 108 Q8 80 16 132 Q30 118 44 132 Z" fill="#FF9F9F" stroke="#E63946" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M150 108 Q192 80 184 132 Q170 118 156 132 Z" fill="#FF9F9F" stroke="#E63946" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M76 50 Q66 30 74 18 Q82 34 90 44 Z M124 50 Q134 30 126 18 Q118 34 110 44 Z" fill="#FFD166"/>'
          );
        },
        front: function () {
          return (
            '<ellipse cx="100" cy="148" rx="34" ry="28" fill="#FFE1A8"/>' +
            '<g stroke="#F2B84B" stroke-width="2.5" stroke-linecap="round">' +
            '<line x1="78" y1="140" x2="122" y2="140"/><line x1="76" y1="152" x2="124" y2="152"/><line x1="82" y1="164" x2="118" y2="164"/>' +
            '</g>'
          );
        }
      },
      tr: {
        name: 'Kıvılcım',
        kind: 'Efsanevi ejderha',
        personality: 'Cesur, tutkulu ve kararlı. 7. seri gününden itibaren açılabilir.',
        quote: 'Ejderhalar asla pes etmez! Hazineni büyütme vakti!',
        currency: 'Altın'
      },
      en: {
        name: 'Sparky',
        kind: 'Legendary dragon',
        personality: 'Brave, fiery and determined. Unlocks once you build your streak.',
        quote: 'Dragons never give up! Time to grow your treasure!',
        currency: 'Gold'
      }
    },
    {
      id: 'unicorn',
      locked: true,
      currencyIcon: 'rainbow',
      theme: { primary: '#E03E8D', primaryDark: '#A82666', background: '#FFF0F7', soft: '#FFD8EA' },
      art: {
        top: '#FFFFFF',
        bottom: '#FFE3F1',
        limb: '#C7A4F5',
        stroke: '#F5C6DE',
        blush: '#FF8FB1',
        back: function () {
          return (
            '<path d="M93 46 L100 6 L107 46 Z" fill="#FFD166" stroke="#FFD166" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M66 56 L70 30 L86 46 Z" fill="#FFFFFF" stroke="#F5C6DE" stroke-width="4" stroke-linejoin="round"/>' +
            '<circle cx="128" cy="50" r="15" fill="#FF9EC7"/>' +
            '<circle cx="148" cy="66" r="14" fill="#B79CFF"/>' +
            '<circle cx="158" cy="88" r="12" fill="#8FD3FF"/>' +
            '<circle cx="162" cy="108" r="10" fill="#9EF0C0"/>'
          );
        },
        front: function () { return ''; }
      },
      tr: {
        name: 'Işıltı',
        kind: 'Büyülü tek boynuzlu at',
        personality: 'Neşeli, renkli ve ilham verici. Seri hakkıyla açılır.',
        quote: 'Merhaba yıldız tozu! Günlerine biraz ışıltı katalım!',
        currency: 'Gökkuşağı'
      },
      en: {
        name: 'Glimmer',
        kind: 'Magical unicorn',
        personality: 'Joyful, colourful and inspiring. Unlocks via streak milestones.',
        quote: 'Hello, stardust! Let us add a touch of sparkle to today!',
        currency: 'Rainbows'
      }
    },
    {
      id: 'uzayli',
      locked: true,
      currencyIcon: 'crystal',
      theme: { primary: '#D49200', primaryDark: '#966500', background: '#FFFBEA', soft: '#FFF0BF' },
      art: {
        top: '#FFE680',
        bottom: '#F2B705',
        limb: '#B07F00',
        blush: '#FF8FA3',
        blushOpacity: 0.7,
        thirdEye: true,
        back: function () {
          return (
            '<path d="M80 46 Q70 30 60 20" fill="none" stroke="#B07F00" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M120 46 Q130 30 140 20" fill="none" stroke="#B07F00" stroke-width="4" stroke-linecap="round"/>' +
            '<circle cx="58" cy="16" r="11" fill="#C77DFF" opacity="0.35"/>' +
            '<circle cx="142" cy="16" r="11" fill="#C77DFF" opacity="0.35"/>' +
            '<circle cx="58" cy="16" r="7" fill="#C77DFF"/>' +
            '<circle cx="142" cy="16" r="7" fill="#C77DFF"/>'
          );
        },
        front: function () {
          return (
            '<ellipse cx="100" cy="148" rx="34" ry="28" fill="#FFF4C2"/>' +
            '<circle cx="88" cy="146" r="4" fill="#F2B705" opacity="0.5"/>' +
            '<circle cx="110" cy="156" r="5" fill="#F2B705" opacity="0.5"/>' +
            '<circle cx="104" cy="138" r="3" fill="#F2B705" opacity="0.5"/>'
          );
        }
      },
      tr: {
        name: 'Zorp',
        kind: 'Meraklı uzaylı',
        personality: 'Dünyalıların alışkanlıklarını inceliyor. Seri hakkıyla açılır.',
        quote: 'Selamlar dünyalı! Benim gezegenimde böyle disiplin görülmedi!',
        currency: 'Kristal'
      },
      en: {
        name: 'Zorp',
        kind: 'Curious alien',
        personality: 'Studies Earthling routines with fascination. Unlocks via streaks.',
        quote: 'Greetings, Earthling! There is no discipline like yours on my planet!',
        currency: 'Crystals'
      }
    }
  ];

  function renderEyes(state, onPatch) {
    var color = onPatch ? '#FFFFFF' : INK;
    if (state === 'happy') {
      return (
        '<path d="M75 101 Q82 91 89 101" fill="none" stroke="' + color + '" stroke-width="3.6" stroke-linecap="round"/>' +
        '<path d="M111 101 Q118 91 125 101" fill="none" stroke="' + color + '" stroke-width="3.6" stroke-linecap="round"/>'
      );
    }
    if (state === 'closed') {
      return (
        '<path d="M75 98 Q82 104 89 98" fill="none" stroke="' + color + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M111 98 Q118 104 125 98" fill="none" stroke="' + color + '" stroke-width="3.4" stroke-linecap="round"/>'
      );
    }
    if (onPatch) {
      return (
        '<circle cx="82" cy="98" r="6" fill="#FFFFFF"/><circle cx="83" cy="98.5" r="3.4" fill="' + INK + '"/>' +
        '<circle cx="118" cy="98" r="6" fill="#FFFFFF"/><circle cx="117" cy="98.5" r="3.4" fill="' + INK + '"/>'
      );
    }
    return (
      '<circle cx="82" cy="98" r="7.5" fill="' + INK + '"/><circle cx="79.5" cy="95.5" r="2.6" fill="#FFFFFF"/>' +
      '<circle cx="118" cy="98" r="7.5" fill="' + INK + '"/><circle cx="115.5" cy="95.5" r="2.6" fill="#FFFFFF"/>'
    );
  }

  function renderThirdEye(state) {
    if (state === 'open') {
      return (
        '<circle cx="100" cy="70" r="9" fill="#FFFFFF"/>' +
        '<circle cx="100" cy="71" r="5" fill="' + INK + '"/>' +
        '<circle cx="102" cy="69" r="1.8" fill="#FFFFFF"/>'
      );
    }
    var d = state === 'happy' ? 'M93 72 Q100 64 107 72' : 'M93 70 H107';
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>';
  }

  function renderMouth(mood, isPanda) {
    var y = isPanda ? 124 : 112;
    if (mood === 'party') {
      return (
        '<path d="M90 ' + (y - 1) + ' Q100 ' + (y + 16) + ' 110 ' + (y - 1) + ' Z" fill="' + INK + '"/>' +
        '<ellipse cx="100" cy="' + (y + 7) + '" rx="5" ry="3" fill="#FF8FA3"/>'
      );
    }
    if (mood === 'sleepy') {
      return '<ellipse cx="100" cy="' + (y + 2) + '" rx="3.5" ry="3" fill="' + INK + '"/>';
    }
    return '<path d="M92 ' + y + ' Q100 ' + (y + 8) + ' 108 ' + y + '" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/>';
  }

  function getBuddy(id) {
    for (var i = 0; i < BUDDIES.length; i++) {
      if (BUDDIES[i].id === id) return BUDDIES[i];
    }
    return BUDDIES[0];
  }

  function renderMascot(id, opts) {
    var o = opts || {};
    var size = o.size || 120;
    var mood = o.mood || 'normal';
    var uid = o.uid || nextUid('m-' + id);
    var b = getBuddy(id);
    var a = b.art;
    var isPanda = !!a.patches;
    var eyeState = (mood === 'happy' || mood === 'party') ? 'happy' : (mood === 'sleepy' || mood === 'blink') ? 'closed' : 'open';
    var gradId = 'grad-' + uid;
    var strokeAttr = a.stroke ? ' stroke="' + a.stroke + '" stroke-width="2"' : '';
    var limbStroke = a.limbEdge ? ' stroke="' + a.limbEdge + '" stroke-width="2.5"' : '';
    var blushX1 = isPanda ? 64 : 68;
    var blushX2 = isPanda ? 136 : 132;
    var blushY = isPanda ? 122 : 113;
    var blushOp = a.blushOpacity || 0.55;

    var patchesSvg = isPanda
      ? '<ellipse cx="80" cy="99" rx="14" ry="18" transform="rotate(28 80 99)" fill="' + a.patches + '"/>' +
        '<ellipse cx="120" cy="99" rx="14" ry="18" transform="rotate(-28 120 99)" fill="' + a.patches + '"/>' +
        '<ellipse cx="100" cy="116" rx="6" ry="4.2" fill="' + a.patches + '"/>'
      : '';

    var fangSvg = (a.fang && mood !== 'party' && mood !== 'sleepy')
      ? '<path d="M101.5 115.5 L106 114 L104 120 Z" fill="#FFFFFF"/>'
      : '';

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 200 200" aria-hidden="true" class="mascot-svg">' +
      '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + a.top + '"/><stop offset="1" stop-color="' + a.bottom + '"/>' +
      '</linearGradient></defs>' +
      (a.back ? a.back(uid) : '') +
      '<path d="' + BODY_PATH + '" fill="url(#' + gradId + ')"' + strokeAttr + '/>' +
      (a.front ? a.front(uid) : '') +
      '<ellipse cx="50" cy="138" rx="9.5" ry="14.5" transform="rotate(-25 50 138)" fill="' + a.limb + '"' + limbStroke + '/>' +
      '<ellipse cx="150" cy="138" rx="9.5" ry="14.5" transform="rotate(25 150 138)" fill="' + a.limb + '"' + limbStroke + '/>' +
      '<ellipse cx="76" cy="184" rx="17" ry="8" fill="' + a.limb + '"/>' +
      '<ellipse cx="124" cy="184" rx="17" ry="8" fill="' + a.limb + '"/>' +
      patchesSvg +
      '<ellipse cx="' + blushX1 + '" cy="' + blushY + '" rx="10" ry="6" fill="' + a.blush + '" opacity="' + blushOp + '"/>' +
      '<ellipse cx="' + blushX2 + '" cy="' + blushY + '" rx="10" ry="6" fill="' + a.blush + '" opacity="' + blushOp + '"/>' +
      (a.thirdEye ? renderThirdEye(eyeState) : '') +
      renderEyes(eyeState, isPanda) +
      renderMouth(mood, isPanda) +
      fangSvg +
      '</svg>'
    );
  }

  /** Mor zeminli resmi uygulama ikonu (Gümbür) */
  function renderBrandLogo(size) {
    var uid = nextUid('brand');
    var s = size || 52;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 200 200" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="bg-' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B7CF6"/><stop offset="1" stop-color="#5B45E0"/></linearGradient>' +
      '<linearGradient id="bd-' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#45D6C8"/><stop offset="1" stop-color="#22A99C"/></linearGradient>' +
      '</defs>' +
      '<rect width="200" height="200" rx="46" fill="url(#bg-' + uid + ')"/>' +
      '<g transform="translate(14 22) scale(0.8)">' +
      '<path d="M148 150 Q192 156 190 118 Q176 138 146 132 Z" fill="#22A99C"/>' +
      '<path d="M84 46 L90 26 L100 44 Z M102 42 L110 20 L118 44 Z M120 48 L130 32 L134 54 Z" fill="#FFB547" stroke="#FFB547" stroke-width="6" stroke-linejoin="round"/>' +
      '<path d="' + BODY_PATH + '" fill="url(#bd-' + uid + ')"/>' +
      '<ellipse cx="100" cy="146" rx="36" ry="30" fill="#D4F5F1"/>' +
      '<ellipse cx="50" cy="138" rx="9.5" ry="14.5" transform="rotate(-25 50 138)" fill="#1C978B"/>' +
      '<ellipse cx="150" cy="138" rx="9.5" ry="14.5" transform="rotate(25 150 138)" fill="#1C978B"/>' +
      '<ellipse cx="76" cy="184" rx="17" ry="8" fill="#1C978B"/><ellipse cx="124" cy="184" rx="17" ry="8" fill="#1C978B"/>' +
      '<ellipse cx="68" cy="113" rx="10" ry="6" fill="#FF8FA3" opacity="0.6"/><ellipse cx="132" cy="113" rx="10" ry="6" fill="#FF8FA3" opacity="0.6"/>' +
      '<circle cx="82" cy="98" r="7.5" fill="#1F2933"/><circle cx="79.5" cy="95.5" r="2.6" fill="#FFFFFF"/>' +
      '<circle cx="118" cy="98" r="7.5" fill="#1F2933"/><circle cx="115.5" cy="95.5" r="2.6" fill="#FFFFFF"/>' +
      '<path d="M92 112 Q100 120 108 112" fill="none" stroke="#1F2933" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M101.5 115.5 L106 114 L104 120 Z" fill="#FFFFFF"/>' +
      '</g></svg>'
    );
  }

  /** 48x48 özel SVG simgeleri */
  function icon(name, size, color) {
    var s = size || 24;
    var c = color || 'currentColor';
    var inner = '';

    switch (name) {
      case 'flame':
        inner =
          '<path d="M24 4 C26 12 36 16 36 29 C36 37 30.5 43 24 43 C17.5 43 12 37 12 29 C12 22 16 18 18 13 C20 18 22 19 24 19 C23 14 22 9 24 4 Z" fill="#FF7A1A"/>' +
          '<path d="M24 22 C26 27 31 29 31 34.5 C31 39 28 42 24 42 C20 42 17 39 17 34.5 C17 30 21 28 24 22 Z" fill="#FFD166"/>';
        break;
      case 'stone':
        inner =
          '<path d="M24 5 L39 13.5 V32.5 L24 41 L9 32.5 V13.5 Z" fill="#9B5DE5" stroke="#9B5DE5" stroke-width="4" stroke-linejoin="round"/>' +
          '<path d="M24 5 L39 13.5 L31 18 H17 L9 13.5 Z" fill="#C9A2FF"/>' +
          '<path d="M17 18 H31 V28 H17 Z" fill="#A86BF0"/>' +
          '<ellipse cx="20" cy="22" rx="2" ry="3.4" transform="rotate(-20 20 22)" fill="#FFFFFF" opacity="0.55"/>';
        break;
      case 'check':
        inner =
          '<circle cx="24" cy="24" r="19" fill="' + (color || '#3FA34D') + '"/>' +
          '<path d="M15 24.5 L21.5 31 L33 18" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
        break;
      case 'timer':
        inner =
          '<rect x="19" y="3" width="10" height="6" rx="3" fill="#3D8BFD"/>' +
          '<path d="M24 8 V12 M36 12 L39.5 8.5" stroke="#2A6FD6" stroke-width="4" stroke-linecap="round"/>' +
          '<circle cx="24" cy="28" r="16" fill="#3D8BFD"/>' +
          '<circle cx="24" cy="28" r="12" fill="#FFFFFF"/>' +
          '<path d="M24 28 L24 16 A12 12 0 0 1 34.4 22 Z" fill="#FFB547"/>' +
          '<path d="M24 28 L31 21" stroke="#1F2933" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="24" cy="28" r="2" fill="#1F2933"/>';
        break;
      case 'flipclock':
        inner =
          '<rect x="4" y="10" width="18" height="28" rx="5" fill="#1F2933"/>' +
          '<rect x="26" y="10" width="18" height="28" rx="5" fill="#1F2933"/>' +
          '<line x1="4" y1="24" x2="22" y2="24" stroke="#000000" stroke-width="2"/>' +
          '<line x1="26" y1="24" x2="44" y2="24" stroke="#000000" stroke-width="2"/>' +
          '<path d="M10 19 L14 16 V32" fill="none" stroke="#ECECEC" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<rect x="31" y="16" width="8" height="16" rx="4" fill="none" stroke="#ECECEC" stroke-width="3"/>';
        break;
      case 'alarm':
        inner =
          '<circle cx="12" cy="12" r="6.5" fill="#FFB547"/><circle cx="36" cy="12" r="6.5" fill="#FFB547"/>' +
          '<path d="M14 40 L11 45 M34 40 L37 45" stroke="#A8222D" stroke-width="4" stroke-linecap="round"/>' +
          '<circle cx="24" cy="27" r="16" fill="#E63946"/><circle cx="24" cy="27" r="12" fill="#FFFFFF"/>' +
          '<path d="M24 27 L24 19 M24 27 L30 30" stroke="#1F2933" stroke-width="3" stroke-linecap="round"/>';
        break;
      case 'barcode':
        inner =
          '<rect x="6" y="10" width="36" height="28" rx="6" fill="#EEF2F6" stroke="#3D8BFD" stroke-width="3"/>' +
          '<path d="M13 16 V32 M18 16 V32 M22 16 V32 M28 16 V32 M31 16 V32 M35 16 V32" stroke="#1F2933" stroke-width="2.6" stroke-linecap="round"/>' +
          '<line x1="8" y1="24" x2="40" y2="24" stroke="#E63946" stroke-width="2.5" stroke-linecap="round"/>';
        break;
      case 'meditation':
        inner =
          '<circle cx="24" cy="24" r="18" fill="#DCF2DF"/>' +
          '<circle cx="24" cy="24" r="12" fill="#7FD98E"/>' +
          '<path d="M24 12 C28 18 28 30 24 36 C20 30 20 18 24 12 Z" fill="#2FA84F"/>' +
          '<path d="M13 26 C18 22 22 26 24 34 C17 33 14 30 13 26 Z" fill="#43B05C"/>' +
          '<path d="M35 26 C30 22 26 26 24 34 C31 33 34 30 35 26 Z" fill="#43B05C"/>';
        break;
      case 'waves':
        inner =
          '<circle cx="24" cy="24" r="19" fill="#D6ECFA"/>' +
          '<path d="M10 20 Q15 15 20 20 T30 20 T38 20" fill="none" stroke="#2D9CDB" stroke-width="3.5" stroke-linecap="round"/>' +
          '<path d="M10 29 Q15 24 20 29 T30 29 T38 29" fill="none" stroke="#1B6FA0" stroke-width="3.5" stroke-linecap="round"/>';
        break;
      case 'schedule':
        inner =
          '<rect x="7" y="10" width="34" height="31" rx="7" fill="#EDE2FF"/>' +
          '<path d="M7 17 A7 7 0 0 1 14 10 H34 A7 7 0 0 1 41 17 V20 H7 Z" fill="#844CE0"/>' +
          '<path d="M16 7 V13 M32 7 V13" stroke="#5E2FB0" stroke-width="4" stroke-linecap="round"/>' +
          '<rect x="13" y="25" width="9" height="5" rx="2" fill="#844CE0"/>' +
          '<rect x="26" y="25" width="9" height="5" rx="2" fill="#45D6C8"/>' +
          '<rect x="13" y="33" width="14" height="4" rx="2" fill="#B58CF2"/>';
        break;
      case 'widget':
        inner =
          '<rect x="6" y="8" width="16" height="16" rx="5" fill="#45D6C8"/>' +
          '<rect x="26" y="8" width="16" height="16" rx="5" fill="#8B7CF6"/>' +
          '<rect x="6" y="28" width="36" height="12" rx="5" fill="#FFB547"/>' +
          '<circle cx="12" cy="34" r="2.5" fill="#FFFFFF"/><circle cx="20" cy="34" r="2.5" fill="#FFFFFF"/><circle cx="28" cy="34" r="2.5" fill="#FFFFFF"/>';
        break;
      case 'speaker':
        inner =
          '<path d="M7 19 C7 17.9 7.9 17 9 17 H15 L24 9 C25.3 7.9 27 8.8 27 10.5 V37.5 C27 39.2 25.3 40.1 24 39 L15 31 H9 C7.9 31 7 30.1 7 29 Z" fill="#3A86FF"/>' +
          '<path d="M32 18 Q36 24 32 30 M37 13 Q44 24 37 35" fill="none" stroke="#3A86FF" stroke-width="3.5" stroke-linecap="round"/>';
        break;
      case 'shield':
        inner =
          '<path d="M24 5 L39 11 V23 C39 33 32.5 40 24 43 C15.5 40 9 33 9 23 V11 Z" fill="#22A99C"/>' +
          '<path d="M17 24 L22 29 L31 19" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
        break;
      case 'sparkle':
        inner =
          '<path d="M24 5 Q26.5 21.5 43 24 Q26.5 26.5 24 43 Q21.5 26.5 5 24 Q21.5 21.5 24 5 Z" fill="#FFB547"/>' +
          '<path d="M37 7 Q38 12 43 13 Q38 14 37 19 Q36 14 31 13 Q36 12 37 7 Z" fill="#8B7CF6"/>';
        break;
      case 'lock':
        inner =
          '<path d="M16 22 V16 A8 8 0 0 1 32 16 V22" fill="none" stroke="#9AA3AE" stroke-width="4.5"/>' +
          '<rect x="10" y="20" width="28" height="22" rx="7" fill="#FFC23D"/>' +
          '<circle cx="24" cy="30" r="3.2" fill="#8A5A00"/>';
        break;
      case 'heart':
        inner =
          '<path d="M24 40 C24 40 8 29 8 17.5 C8 12 12.5 8 17.5 8 C20.8 8 23 9.8 24 12 C25 9.8 27.2 8 30.5 8 C35.5 8 40 12 40 17.5 C40 29 24 40 24 40 Z" fill="#FF5D7A"/>' +
          '<ellipse cx="16" cy="15" rx="2.2" ry="3.6" transform="rotate(-25 16 15)" fill="#FFFFFF" opacity="0.5"/>';
        break;
      case 'sun':
        inner =
          '<circle cx="24" cy="24" r="9" fill="' + c + '"/>' +
          '<g stroke="' + c + '" stroke-width="3.6" stroke-linecap="round">' +
          '<line x1="24" y1="5" x2="24" y2="10"/><line x1="24" y1="38" x2="24" y2="43"/>' +
          '<line x1="5" y1="24" x2="10" y2="24"/><line x1="38" y1="24" x2="43" y2="24"/>' +
          '<line x1="10.6" y1="10.6" x2="14.2" y2="14.2"/><line x1="33.8" y1="33.8" x2="37.4" y2="37.4"/>' +
          '<line x1="37.4" y1="10.6" x2="33.8" y2="14.2"/><line x1="14.2" y1="33.8" x2="10.6" y2="37.4"/>' +
          '</g>';
        break;
      case 'moon':
        inner =
          '<path d="M31 8 A15 15 0 1 0 40 31 A12 12 0 0 1 31 8 Z" fill="' + c + '"/>';
        break;
      case 'mail':
        inner =
          '<rect x="6" y="11" width="36" height="26" rx="6" fill="#8B7CF6"/>' +
          '<path d="M9 14 L24 26 L39 14" fill="none" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
        break;
      case 'trash':
        inner =
          '<path d="M14 16 H34 L32 40 A4 4 0 0 1 28 43 H20 A4 4 0 0 1 16 40 Z" fill="#E63946"/>' +
          '<path d="M10 13 H38 M19 13 V9 H29 V13" fill="none" stroke="#A8222D" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>';
        break;
      case 'leaf':
        inner =
          '<path d="M38 10 C20 10 10 20 10 36 C26 36 38 26 38 10 Z" fill="#2FA84F"/>' +
          '<path d="M12 36 Q24 24 34 14" fill="none" stroke="#B4EE84" stroke-width="3" stroke-linecap="round"/>';
        break;
      case 'bamboo':
        inner =
          '<rect x="20" y="6" width="8" height="36" rx="4" fill="#3FA34D"/>' +
          '<line x1="19" y1="18" x2="29" y2="18" stroke="#DCF2DF" stroke-width="3" stroke-linecap="round"/>' +
          '<line x1="19" y1="30" x2="29" y2="30" stroke="#DCF2DF" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M28 16 Q38 10 39 17 Q33 21 28 16 Z M20 28 Q10 22 9 29 Q15 33 20 28 Z" fill="#55C463"/>';
        break;
      case 'berry':
        inner =
          '<circle cx="20" cy="28" r="8" fill="#E63946"/><circle cx="29" cy="29" r="7.5" fill="#C82838"/><circle cx="24" cy="20" r="8" fill="#FF5D7A"/>' +
          '<path d="M24 12 Q24 6 31 7" fill="none" stroke="#2FA84F" stroke-width="3.5" stroke-linecap="round"/>';
        break;
      case 'fish':
        inner =
          '<path d="M8 24 Q18 11 33 18 L41 12 V36 L33 30 Q18 37 8 24 Z" fill="#3D8BFD"/>' +
          '<circle cx="16" cy="22" r="2.4" fill="#FFFFFF"/>';
        break;
      case 'battery':
        inner =
          '<rect x="14" y="10" width="20" height="31" rx="5" fill="#2D9CDB"/>' +
          '<rect x="19" y="5" width="10" height="5" rx="2" fill="#1B6FA0"/>' +
          '<path d="M26 16 L19 26 H25 L22 35 L30 24 H24 Z" fill="#FFD166"/>';
        break;
      case 'drop':
        inner =
          '<path d="M24 6 C24 6 37 21 37 30 A13 13 0 0 1 11 30 C11 21 24 6 24 6 Z" fill="#3D8BFD"/>' +
          '<ellipse cx="19" cy="28" rx="2.5" ry="5" transform="rotate(-18 19 28)" fill="#FFFFFF" opacity="0.55"/>';
        break;
      case 'star':
        inner =
          '<path d="M24 5 L29.6 16.8 L42.5 18.5 L33 27.6 L35.4 40.5 L24 34.2 L12.6 40.5 L15 27.6 L5.5 18.5 L18.4 16.8 Z" fill="#FFB547"/>';
        break;
      case 'coin':
        inner =
          '<circle cx="24" cy="24" r="17" fill="#FFB547"/>' +
          '<circle cx="24" cy="24" r="12.5" fill="#FFD166"/>' +
          '<rect x="21.5" y="16" width="5" height="16" rx="2.5" fill="#C88200"/>';
        break;
      case 'rainbow':
        inner =
          '<path d="M8 34 A16 16 0 0 1 40 34" fill="none" stroke="#FF5D7A" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M13 34 A11 11 0 0 1 35 34" fill="none" stroke="#FFB547" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M18 34 A6 6 0 0 1 30 34" fill="none" stroke="#45D6C8" stroke-width="5" stroke-linecap="round"/>';
        break;
      case 'crystal':
        inner =
          '<path d="M24 4 L36 16 L31 42 H17 L12 16 Z" fill="#C77DFF"/>' +
          '<path d="M24 4 L36 16 L24 22 L12 16 Z" fill="#E0AAFF"/>' +
          '<path d="M24 22 L36 16 L31 42 L24 42 Z" fill="#9D4EDD"/>';
        break;
      case 'plus':
        inner = '<path d="M24 11 V37 M11 24 H37" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>';
        break;
      case 'play':
        inner = '<path d="M16 11 L37 24 L16 37 Z" fill="' + c + '" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/>';
        break;
      case 'pause':
        inner = '<rect x="14" y="11" width="7" height="26" rx="3" fill="' + c + '"/><rect x="27" y="11" width="7" height="26" rx="3" fill="' + c + '"/>';
        break;
      default:
        inner = '<circle cx="24" cy="24" r="16" fill="' + c + '"/>';
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 48 48" fill="none" aria-hidden="true" class="ui-icon">' + inner + '</svg>';
  }

  window.SiteArt = {
    BUDDIES: BUDDIES,
    getBuddy: getBuddy,
    renderMascot: renderMascot,
    renderBrandLogo: renderBrandLogo,
    icon: icon,
    getLightPalette: getLightPalette,
    getDarkPalette: getDarkPalette
  };
})();
