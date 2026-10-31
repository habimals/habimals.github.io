/**
 * Ortak Site Mantığı ve Etkileşimli Önizlemeler (site.js)
 *
 * Uygulama adını ve e-postayı yalnızca config.js içindeki SITE_CONFIG nesnesinden okur.
 * Dil (TR / EN), tema (Açık / Koyu), Buddy renk paleti ve canlı telefon önizlemesini yönetir.
 */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {
    appName: 'App',
    contactEmail: 'support@example.com',
    copyrightYear: '2026',
    privacyUpdated: { tr: '30 Ekim 2026', en: '30 October 2026' }
  };
  var Art = window.SiteArt;

  var STORAGE_LANG = 'app_site_lang';
  var STORAGE_THEME = 'app_site_theme';
  var STORAGE_BUDDY = 'app_site_buddy';

  var state = {
    lang: 'tr',
    theme: 'light',
    buddyId: 'dino',
    activeTab: 'today',
    focusSubMode: 'flip', // 'flip' | 'summary'
    clockMode: 'pomodoro', // 'pomodoro' | 'stopwatch'
    clockRunning: true,
    pomodoroSec: 24 * 60 + 48,
    stopwatchSec: 42 * 60 + 15,
    ambientId: 'rain',
    alarmMission: 'barcode', // 'barcode' | 'photo'
    alarmSolved: false,
    meditationSession: 'calm',
    breathePhase: 'in',
    petHappy: false,
    treats: 48,
    waterCount: 6,
    habits: [
      { id: 'stretch', done: true, tr: 'Sabah esnemesi (10 dk)', en: 'Morning stretch (10 min)' },
      { id: 'read', done: false, tr: '20 sayfa kitap oku', en: 'Read 20 pages' }
    ]
  };

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }

  function detectInitialLang() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('lang');
    if (q === 'en' || q === 'tr') return q;
    var saved = safeGet(STORAGE_LANG);
    if (saved === 'en' || saved === 'tr') return saved;
    var nav = (navigator.language || '').toLowerCase();
    return nav.indexOf('tr') === 0 ? 'tr' : 'en';
  }

  function detectInitialTheme() {
    var params = new URLSearchParams(window.location.search);
    var qt = params.get('theme');
    if (qt === 'dark' || qt === 'light') return qt;
    var saved = safeGet(STORAGE_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function detectInitialBuddy() {
    var params = new URLSearchParams(window.location.search);
    var qb = params.get('buddy');
    if (qb && Art) {
      var fromParam = Art.getBuddy(qb);
      if (fromParam && fromParam.id === qb) return qb;
    }
    var saved = safeGet(STORAGE_BUDDY);
    if (saved && Art) {
      var found = Art.getBuddy(saved);
      if (found && found.id === saved) return saved;
    }
    return 'dino';
  }

  function detectInitialTab() {
    var params = new URLSearchParams(window.location.search);
    var qtab = params.get('tab');
    if (qtab === 'today' || qtab === 'focus' || qtab === 'alarm' || qtab === 'meditate') {
      return qtab;
    }
    return 'today';
  }

  function applyPalette() {
    if (!Art) return;
    var buddy = Art.getBuddy(state.buddyId);
    var p = state.theme === 'dark'
      ? Art.getDarkPalette(buddy.theme)
      : Art.getLightPalette(buddy.theme);

    var root = document.documentElement;
    root.setAttribute('data-theme', state.theme);
    root.style.setProperty('--primary', p.primary);
    root.style.setProperty('--primary-dark', p.primaryDark);
    root.style.setProperty('--primary-shadow', p.primaryShadow);
    root.style.setProperty('--bg', p.background);
    root.style.setProperty('--surface', p.surface);
    root.style.setProperty('--surface-elevated', p.surfaceElevated);
    root.style.setProperty('--soft', p.soft);
    root.style.setProperty('--border', p.border);
    root.style.setProperty('--muted-bg', p.mutedBg);
    root.style.setProperty('--text', p.text);
    root.style.setProperty('--muted', p.textMuted);
  }

  function populateBrandPlaceholders() {
    var appNodes = document.querySelectorAll('[data-app]');
    for (var i = 0; i < appNodes.length; i++) {
      appNodes[i].textContent = CFG.appName;
    }

    var emailNodes = document.querySelectorAll('[data-email]');
    for (var j = 0; j < emailNodes.length; j++) {
      var el = emailNodes[j];
      el.textContent = CFG.contactEmail;
      if (el.tagName === 'A') {
        el.setAttribute('href', 'mailto:' + CFG.contactEmail);
      }
    }

    var updTr = document.querySelectorAll('[data-updated-tr]');
    for (var k = 0; k < updTr.length; k++) {
      updTr[k].textContent = CFG.privacyUpdated.tr;
    }

    var updEn = document.querySelectorAll('[data-updated-en]');
    for (var m = 0; m < updEn.length; m++) {
      updEn[m].textContent = CFG.privacyUpdated.en;
    }

    var body = document.body;
    if (body) {
      var titleTpl = body.getAttribute('data-title-' + state.lang);
      if (titleTpl) {
        document.title = titleTpl.replace(/\{app\}/g, CFG.appName);
      }
      var descTpl = body.getAttribute('data-desc-' + state.lang);
      var metaDesc = document.querySelector('meta[name="description"]');
      if (descTpl && metaDesc) {
        metaDesc.setAttribute('content', descTpl.replace(/\{app\}/g, CFG.appName));
      }
    }
  }

  function populateStaticIcons() {
    if (!Art) return;
    var nodes = document.querySelectorAll('[data-icon]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var name = el.getAttribute('data-icon');
      var size = parseInt(el.getAttribute('data-size') || '26', 10);
      el.innerHTML = Art.icon(name, size);
    }
  }

  function renderChrome() {
    var page = (document.body && document.body.getAttribute('data-page')) || 'index';
    var headerEl = document.getElementById('site-header');
    var navEl = document.getElementById('site-nav');
    var footerEl = document.getElementById('site-footer');

    var subTr = 'Buddy\'li Alışkanlık, Odak ve Alarm Arkadaşın';
    var subEn = 'Habit, Focus & Alarm Companion';
    if (page === 'privacy') {
      subTr = 'Gizlilik Politikası';
      subEn = 'Privacy Policy';
    } else if (page === 'support') {
      subTr = 'Destek ve Yardım Merkezi';
      subEn = 'Support & Help Centre';
    }

    var isDark = state.theme === 'dark';
    var themeIcon = Art ? Art.icon(isDark ? 'sun' : 'moon', 18, 'currentColor') : '';
    var themeLabelTr = isDark ? 'Açık Tema' : 'Koyu Tema';
    var themeLabelEn = isDark ? 'Light Mode' : 'Dark Mode';

    if (headerEl) {
      headerEl.innerHTML =
        '<a class="brand" href="index.html">' +
          '<span class="brand-logo-wrap">' + (Art ? Art.renderBrandLogo(50) : '') + '</span>' +
          '<div>' +
            '<p class="brand-title">' + CFG.appName + '</p>' +
            '<p class="brand-sub">' +
              '<span data-lang="tr">' + subTr + '</span>' +
              '<span data-lang="en">' + subEn + '</span>' +
            '</p>' +
          '</div>' +
        '</a>' +
        '<div class="header-controls">' +
          '<button type="button" class="icon-toggle" id="theme-toggle-btn" aria-label="Toggle colour scheme">' +
            themeIcon +
            '<span data-lang="tr">' + themeLabelTr + '</span>' +
            '<span data-lang="en">' + themeLabelEn + '</span>' +
          '</button>' +
          '<div class="lang-switch" role="group" aria-label="Language">' +
            '<button type="button" class="lang-btn ' + (state.lang === 'tr' ? 'active' : '') + '" data-set-lang="tr">TR</button>' +
            '<button type="button" class="lang-btn ' + (state.lang === 'en' ? 'active' : '') + '" data-set-lang="en">EN</button>' +
          '</div>' +
        '</div>';

      var themeBtn = document.getElementById('theme-toggle-btn');
      if (themeBtn) {
        themeBtn.addEventListener('click', function () {
          setTheme(state.theme === 'dark' ? 'light' : 'dark');
        });
      }

      var langBtns = headerEl.querySelectorAll('[data-set-lang]');
      for (var i = 0; i < langBtns.length; i++) {
        langBtns[i].addEventListener('click', function (ev) {
          setLang(ev.currentTarget.getAttribute('data-set-lang'));
        });
      }
    }

    if (navEl) {
      navEl.innerHTML =
        '<a class="nav-link ' + (page === 'index' ? 'active' : '') + '" href="index.html">' +
          '<span data-lang="tr">Tanıtım</span><span data-lang="en">Overview</span>' +
        '</a>' +
        '<a class="nav-link ' + (page === 'privacy' ? 'active' : '') + '" href="privacy.html">' +
          '<span data-lang="tr">Gizlilik Politikası</span><span data-lang="en">Privacy Policy</span>' +
        '</a>' +
        '<a class="nav-link ' + (page === 'support' ? 'active' : '') + '" href="support.html">' +
          '<span data-lang="tr">Destek ve SSS</span><span data-lang="en">Support &amp; FAQ</span>' +
        '</a>';
    }

    if (footerEl) {
      footerEl.innerHTML =
        '<div><strong>' + CFG.copyrightYear + ' ' + CFG.appName + '</strong> &middot; ' +
          '<span data-lang="tr">Reklamsız, izlemesiz günlük rutin arkadaşın.</span>' +
          '<span data-lang="en">Ad-free, tracker-free daily routine companion.</span>' +
        '</div>' +
        '<div class="footer-links">' +
          '<a href="index.html"><span data-lang="tr">Tanıtım</span><span data-lang="en">Overview</span></a>' +
          '<a href="privacy.html"><span data-lang="tr">Gizlilik Politikası</span><span data-lang="en">Privacy Policy</span></a>' +
          '<a href="support.html"><span data-lang="tr">Destek</span><span data-lang="en">Support</span></a>' +
          '<a href="mailto:' + CFG.contactEmail + '">' + CFG.contactEmail + '</a>' +
        '</div>';
    }
  }

  /* ---------- Etkileşimli Buddy Vitrini (index.html) ---------- */
  function renderBuddyShowcase() {
    var root = document.getElementById('buddy-showcase');
    if (!root || !Art) return;

    var lang = state.lang;
    var active = Art.getBuddy(state.buddyId);
    var activeInfo = active[lang];

    var tilesHtml = Art.BUDDIES.map(function (b) {
      var info = b[lang];
      var isSelected = b.id === state.buddyId;
      return (
        '<button type="button" class="buddy-tile ' + (isSelected ? 'active' : '') + '" data-pick-buddy="' + b.id + '">' +
          Art.renderMascot(b.id, { size: 68, mood: isSelected ? 'happy' : 'normal' }) +
          '<span class="buddy-tile-name">' + info.name + '</span>' +
        '</button>'
      );
    }).join('');

    root.innerHTML =
      '<div class="buddy-roster">' + tilesHtml + '</div>' +
      '<div class="buddy-spotlight">' +
        '<div>' + Art.renderMascot(active.id, { size: 112, mood: 'happy' }) + '</div>' +
        '<div class="buddy-spotlight-info">' +
          '<h3>' + activeInfo.name + '</h3>' +
          '<p class="buddy-spotlight-kind">' + activeInfo.kind + '</p>' +
          '<p class="buddy-spotlight-desc">' + activeInfo.personality + '</p>' +
        '</div>' +
        '<div class="buddy-currency-box">' +
          '<span class="buddy-currency-label">' + (lang === 'tr' ? 'Ödül Birimi' : 'Reward Unit') + '</span>' +
          '<div class="buddy-currency-val">' + Art.icon(active.currencyIcon, 22) + '<span>' + activeInfo.currency + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="custom-buddy-banner">' +
        '<div class="custom-buddy-banner-left">' +
          Art.icon('sparkle', 28) +
          '<p>' +
            (lang === 'tr'
              ? 'Kendi Buddy\'ni Tasarla: Renkleri ve kulak/boynuz detaylarını kendin seç ya da evcil hayvanının fotoğrafından sana özel bir Buddy oluştur.'
              : 'Design Your Own Buddy: Pick colours and features yourself, or generate a custom Buddy inspired by a photo of your pet.') +
          '</p>' +
        '</div>' +
      '</div>';

    var pickBtns = root.querySelectorAll('[data-pick-buddy]');
    for (var i = 0; i < pickBtns.length; i++) {
      pickBtns[i].addEventListener('click', function (ev) {
        var id = ev.currentTarget.getAttribute('data-pick-buddy');
        setBuddy(id);
      });
    }
  }

  /* ---------- Canlı Telefon Önizlemesi (index.html) ---------- */
  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function countDoneHabits() {
    var done = state.waterCount >= 8 ? 1 : 0;
    for (var i = 0; i < state.habits.length; i++) {
      if (state.habits[i].done) done += 1;
    }
    return done;
  }

  function renderPhoneMockup(blinkNow) {
    var root = document.getElementById('phone-mockup');
    if (!root || !Art) return;

    var lang = state.lang;
    var buddy = Art.getBuddy(state.buddyId);
    var bInfo = buddy[lang];

    var tabs = [
      { id: 'today', tr: 'Bugün', en: 'Today' },
      { id: 'focus', tr: 'Odak', en: 'Focus' },
      { id: 'alarm', tr: 'Alarm', en: 'Alarm' },
      { id: 'meditate', tr: 'Nefes', en: 'Breathe' }
    ];

    var tabsHtml = tabs.map(function (t) {
      return (
        '<button type="button" class="screen-tab ' + (state.activeTab === t.id ? 'active' : '') + '" data-mock-tab="' + t.id + '">' +
          (lang === 'tr' ? t.tr : t.en) +
        '</button>'
      );
    }).join('');

    var isFlipDark = state.activeTab === 'focus' && state.focusSubMode === 'flip';
    var bodyHtml = '';

    if (state.activeTab === 'today') {
      var doneCount = countDoneHabits();
      var mood = state.petHappy ? 'party' : (doneCount === 3 ? 'happy' : (blinkNow ? 'blink' : 'normal'));
      var bubbleText = state.petHappy
        ? (lang === 'tr' ? 'Harikasın! Birlikte devam edelim!' : 'Brilliant! Keep that momentum going!')
        : (doneCount === 3
          ? (lang === 'tr' ? 'Bugünkü tüm hedefler tamam! Gurur duydum!' : 'All of today’s habits are complete!')
          : bInfo.quote);

      var habitsHtml = state.habits.map(function (h) {
        return (
          '<button type="button" class="mock-habit-row ' + (h.done ? 'done' : '') + '" data-toggle-habit="' + h.id + '">' +
            '<span class="mock-habit-left">' +
              '<span class="mock-check-circle">' +
                (h.done ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') +
              '</span>' +
              '<span class="mock-habit-title">' + h[lang] + '</span>' +
            '</span>' +
            '<span class="mock-water-pill">+5</span>' +
          '</button>'
        );
      }).join('');

      var waterDone = state.waterCount >= 8;
      var waterRow =
        '<button type="button" class="mock-habit-row ' + (waterDone ? 'done' : '') + '" id="mock-water-btn">' +
          '<span class="mock-habit-left">' +
            Art.icon('drop', 20) +
            '<span class="mock-habit-title">' + (lang === 'tr' ? 'Su hedefi' : 'Daily water') + '</span>' +
          '</span>' +
          '<span class="mock-water-pill">' + state.waterCount + ' / 8 ' + (lang === 'tr' ? '+1 ekle' : '+1 cup') + '</span>' +
        '</button>';

      bodyHtml =
        '<div>' +
          '<div class="mock-top-pills">' +
            '<span class="mock-pill">' + Art.icon('flame', 16) + '<span>14 ' + (lang === 'tr' ? 'gün' : 'days') + '</span></span>' +
            '<span class="mock-pill">' + Art.icon(buddy.currencyIcon, 16) + '<span>' + state.treats + ' ' + bInfo.currency + '</span></span>' +
          '</div>' +
          '<div class="mock-buddy-area">' +
            '<button type="button" class="mock-pet-btn" id="mock-pet-trigger" aria-label="Buddy">' +
              Art.renderMascot(buddy.id, { size: 108, mood: mood }) +
              (state.petHappy ? '<span class="heart-burst">' + Art.icon('heart', 26) + '</span>' : '') +
            '</button>' +
            '<div class="speech-bubble">' + bubbleText + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mock-habit-list">' +
          habitsHtml +
          waterRow +
        '</div>';
    } else if (state.activeTab === 'focus') {
      var segBar =
        '<div class="flip-toggle-bar">' +
          '<div class="mini-seg">' +
            '<button type="button" class="mini-seg-btn ' + (state.focusSubMode === 'flip' ? 'active' : '') + '" data-focus-sub="flip">' +
              (lang === 'tr' ? 'Kartlı Saat' : 'Flip Clock') +
            '</button>' +
            '<button type="button" class="mini-seg-btn ' + (state.focusSubMode === 'summary' ? 'active' : '') + '" data-focus-sub="summary">' +
              (lang === 'tr' ? 'Zaman Özeti' : 'Time Summary') +
            '</button>' +
          '</div>' +
          (state.focusSubMode === 'flip'
            ? '<button type="button" class="mini-seg-btn active" id="clock-mode-toggle">' +
                (state.clockMode === 'pomodoro'
                  ? (lang === 'tr' ? 'Kronometre' : 'Stopwatch')
                  : (lang === 'tr' ? 'Pomodoro' : 'Pomodoro')) +
              '</button>'
            : '') +
        '</div>';

      if (state.focusSubMode === 'flip') {
        var sec = state.clockMode === 'pomodoro' ? state.pomodoroSec : state.stopwatchSec;
        var leftCard = pad2(Math.floor(sec / 60));
        var rightCard = pad2(sec % 60);
        var modeTag = state.clockMode === 'pomodoro'
          ? (lang === 'tr' ? 'ODAK · MATEMATİK' : 'FOCUS · MATHS')
          : (lang === 'tr' ? 'KRONOMETRE · TASARIM' : 'STOPWATCH · DESIGN');

        bodyHtml =
          segBar +
          '<div class="flip-clock-stage">' +
            '<span class="flip-tag-label">' + modeTag + '</span>' +
            '<div class="flip-cards-pair">' +
              '<div class="flip-card-box" id="flip-left-val">' + leftCard + '</div>' +
              '<div class="flip-card-box" id="flip-right-val">' + rightCard + '</div>' +
            '</div>' +
            '<button type="button" class="icon-toggle" id="clock-play-btn" style="background:#1C1D21;color:#ECECEC;border-color:#343842;">' +
              Art.icon(state.clockRunning ? 'pause' : 'play', 15, '#ECECEC') +
              '<span>' + (state.clockRunning ? (lang === 'tr' ? 'Duraklat' : 'Pause') : (lang === 'tr' ? 'Devam Et' : 'Resume')) + '</span>' +
            '</button>' +
          '</div>' +
          '<div style="text-align:center;font-size:11.5px;color:#8A8F98;font-weight:600;">' +
            (lang === 'tr' ? 'Tam siyah ekran: masada veya şarjda dikkat dağıtmaz' : 'Pure black display: distraction-free on your desk') +
          '</div>';
      } else {
        var days = lang === 'tr'
          ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        var heights = [48, 72, 60, 92, 80, 40, 66];
        var bars = days.map(function (d, idx) {
          return (
            '<div class="bar-col">' +
              '<div class="bar-fill" style="height:' + heights[idx] + '%;"></div>' +
              '<span class="bar-day">' + d + '</span>' +
            '</div>'
          );
        }).join('');

        var ambients = [
          { id: 'rain', tr: 'Çiseleme', en: 'Drizzle' },
          { id: 'waves', tr: 'Uzak sahil', en: 'Distant shore' },
          { id: 'pink', tr: 'Pamuk bulut', en: 'Cotton cloud' },
          { id: 'calm', tr: 'Sakin vadi', en: 'Quiet valley' }
        ];
        var ambientHtml = ambients.map(function (a) {
          return (
            '<button type="button" class="ambient-chip ' + (state.ambientId === a.id ? 'active' : '') + '" data-ambient="' + a.id + '">' +
              (lang === 'tr' ? a.tr : a.en) +
            '</button>'
          );
        }).join('');

        bodyHtml =
          segBar +
          '<div class="focus-summary-card">' +
            '<div style="display:flex;justify-content:space-between;align-items:baseline;">' +
              '<strong style="font-size:15px;">' + (lang === 'tr' ? 'Bu Hafta: 14 sa 20 dk' : 'This Week: 14h 20m') + '</strong>' +
              '<span style="font-size:11.5px;font-weight:800;color:var(--primary-dark);">+18%</span>' +
            '</div>' +
            '<div class="bar-chart">' + bars + '</div>' +
            '<div style="font-size:12px;color:var(--muted);display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid var(--border);">' +
              '<span>' + (lang === 'tr' ? 'Matematik · 6 sa 10 dk' : 'Maths · 6h 10m') + '</span>' +
              '<span>' + (lang === 'tr' ? 'Tasarım · 5 sa 05 dk' : 'Design · 5h 05m') + '</span>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div style="font-size:12px;font-weight:800;margin-bottom:4px;">' +
              (lang === 'tr' ? 'Ortam Sesi (Kesintisiz Döngü)' : 'Ambient Sound (Seamless Loop)') +
            '</div>' +
            '<div class="ambient-chips">' + ambientHtml + '</div>' +
          '</div>';
      }
    } else if (state.activeTab === 'alarm') {
      var missionToggle =
        '<div class="flip-toggle-bar" style="justify-content:center;">' +
          '<div class="mini-seg">' +
            '<button type="button" class="mini-seg-btn ' + (state.alarmMission === 'barcode' ? 'active' : '') + '" data-mission="barcode">' +
              (lang === 'tr' ? 'Barkod Görevi' : 'Barcode Mission') +
            '</button>' +
            '<button type="button" class="mini-seg-btn ' + (state.alarmMission === 'photo' ? 'active' : '') + '" data-mission="photo">' +
              (lang === 'tr' ? 'Fotoğraf Görevi' : 'Photo Mission') +
            '</button>' +
          '</div>' +
        '</div>';

      if (state.alarmSolved) {
        bodyHtml =
          missionToggle +
          '<div class="alarm-ring-box" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">' +
            Art.renderMascot(buddy.id, { size: 96, mood: 'party' }) +
            '<strong style="font-size:17px;">' + (lang === 'tr' ? 'Görev Doğrulandı!' : 'Mission Verified!') + '</strong>' +
            '<p style="font-size:13px;color:var(--muted);margin:0;">' +
              (lang === 'tr' ? 'Alarm susturuldu. Günaydın, harika bir gün olsun!' : 'Alarm dismissed. Good morning — have a great day!') +
            '</p>' +
            '<button type="button" class="btn-3d-secondary" id="alarm-reset-btn" style="margin-top:6px;padding:8px 14px;font-size:12.5px;">' +
              (lang === 'tr' ? 'Tekrar Dene' : 'Try Again') +
            '</button>' +
          '</div>';
      } else {
        var targetLabel = state.alarmMission === 'barcode'
          ? (lang === 'tr' ? 'Hedef: Diş macunu barkodu' : 'Target: Toothpaste barcode')
          : (lang === 'tr' ? 'Hedef: Mutfak lavabosu fotoğrafı' : 'Target: Kitchen sink photo');

        var visualInner = state.alarmMission === 'barcode'
          ? '<div class="barcode-bars">' +
              '<span style="width:4px"></span><span style="width:2px"></span><span style="width:6px"></span>' +
              '<span style="width:3px"></span><span style="width:5px"></span><span style="width:2px"></span>' +
              '<span style="width:6px"></span><span style="width:3px"></span><span style="width:4px"></span>' +
            '</div>' +
            '<div class="scan-laser"></div>' +
            '<div style="font-size:11.5px;color:#9AA5B1;">' + targetLabel + '</div>'
          : '<div style="padding:8px 0 4px;">' + Art.icon('sparkle', 30) + '</div>' +
            '<div style="font-size:11.5px;color:#9AA5B1;">' + targetLabel + '</div>';

        bodyHtml =
          missionToggle +
          '<div class="alarm-ring-box">' +
            '<span class="feature-tag">' + (lang === 'tr' ? 'Kesin Uyandıran Alarm' : 'Wake-Up Mission') + '</span>' +
            '<div class="alarm-time-big">07:30</div>' +
            '<div style="font-size:13px;font-weight:700;color:var(--muted);">' +
              (lang === 'tr' ? 'Sabah Dersi · Görev tamamlanmadan susmaz' : 'Morning Class · Rings until mission is done') +
            '</div>' +
            '<div class="scanner-viewport">' + visualInner + '</div>' +
            '<button type="button" class="btn-3d" id="alarm-solve-btn" style="width:100%;padding:10px 14px;font-size:13.5px;">' +
              (state.alarmMission === 'barcode'
                ? (lang === 'tr' ? 'Barkodu Okut ve Sustur' : 'Scan Barcode to Stop')
                : (lang === 'tr' ? 'Fotoğrafı Doğrula ve Sustur' : 'Verify Photo to Stop')) +
            '</button>' +
          '</div>';
      }
    } else {
      /* Meditasyon + Ana Ekran Widget'ları */
      var doneCnt = countDoneHabits();
      var dotsHtml = [0, 1, 2].map(function (idx) {
        return '<span class="widget-dot ' + (idx < doneCnt ? 'filled' : '') + '"></span>';
      }).join('');

      var cupsHtml = [0, 1, 2, 3, 4, 5, 6, 7].map(function (idx) {
        return '<span class="water-cup ' + (idx < state.waterCount ? 'full' : '') + '"></span>';
      }).join('');

      var breatheText = state.breathePhase === 'in'
        ? (lang === 'tr' ? 'Nefes al...' : 'Breathe in...')
        : (lang === 'tr' ? 'Yavaşça ver...' : 'Breathe out...');

      bodyHtml =
        '<div style="text-align:center;">' +
          '<div style="font-size:12px;font-weight:800;color:var(--primary-dark);">' +
            (lang === 'tr' ? 'Rehberli Meditasyon ve Nefes' : 'Guided Meditation & Breath') +
          '</div>' +
          '<div class="breathe-orb">' +
            Art.renderMascot(buddy.id, { size: 84, mood: 'sleepy' }) +
          '</div>' +
          '<div id="breathe-phase-label" style="font-size:14px;font-weight:800;">' + breatheText + '</div>' +
          '<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">' +
            (lang === 'tr' ? 'Sakinleş (5 dk) · Uykuya hazırlan (10 dk)' : 'Unwind (5m) · Ready for sleep (10m)') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:4px;">' +
            (lang === 'tr' ? 'Ana Ekran Widget\'ları (Canlı)' : 'Home Screen Widgets (Live)') +
          '</div>' +
          '<div class="widget-preview-grid">' +
            '<div class="mini-widget-card">' +
              '<div style="font-size:11.5px;font-weight:800;color:var(--primary-dark);">' + bInfo.name + '</div>' +
              '<div style="font-size:22px;font-weight:900;line-height:1.15;margin-top:2px;">' + doneCnt + '<span style="font-size:13px;color:var(--muted);">/3</span></div>' +
              '<div class="widget-dots">' + dotsHtml + '</div>' +
              '<div style="font-size:11px;font-weight:700;color:var(--muted);">' + (lang === 'tr' ? '14 günlük seri' : '14-day streak') + '</div>' +
            '</div>' +
            '<div class="mini-widget-card">' +
              '<div style="display:flex;justify-content:space-between;font-size:11.5px;font-weight:800;">' +
                '<span>' + (lang === 'tr' ? 'Su Sayacı' : 'Water') + '</span>' +
                '<span style="color:#2D9CDB;">' + state.waterCount + '/8</span>' +
              '</div>' +
              '<div class="water-cups">' + cupsHtml + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    var captionText = lang === 'tr'
      ? 'İpucu: Sekmelere, alışkanlıklara veya Buddy\'ye dokunarak canlı deneyebilirsin.'
      : 'Tip: Tap the tabs, habits, or your Buddy above to try it live.';

    root.innerHTML =
      '<div class="phone-frame">' +
        '<div class="phone-notch"></div>' +
        '<div class="screen-tabs">' + tabsHtml + '</div>' +
        '<div class="phone-screen-body ' + (isFlipDark ? 'flip-dark' : '') + '">' +
          bodyHtml +
        '</div>' +
      '</div>' +
      '<p class="mock-hint-caption">' + captionText + '</p>';

    bindPhoneMockupEvents(root);
  }

  function bindPhoneMockupEvents(root) {
    var tabBtns = root.querySelectorAll('[data-mock-tab]');
    for (var i = 0; i < tabBtns.length; i++) {
      tabBtns[i].addEventListener('click', function (ev) {
        state.activeTab = ev.currentTarget.getAttribute('data-mock-tab');
        renderPhoneMockup(false);
      });
    }

    var petBtn = document.getElementById('mock-pet-trigger');
    if (petBtn) {
      petBtn.addEventListener('click', function () {
        state.petHappy = true;
        state.treats += 1;
        renderPhoneMockup(false);
        setTimeout(function () {
          state.petHappy = false;
          renderPhoneMockup(false);
        }, 1200);
      });
    }

    var habitBtns = root.querySelectorAll('[data-toggle-habit]');
    for (var j = 0; j < habitBtns.length; j++) {
      habitBtns[j].addEventListener('click', function (ev) {
        var hid = ev.currentTarget.getAttribute('data-toggle-habit');
        for (var k = 0; k < state.habits.length; k++) {
          if (state.habits[k].id === hid) {
            state.habits[k].done = !state.habits[k].done;
            state.treats += state.habits[k].done ? 5 : -5;
          }
        }
        renderPhoneMockup(false);
      });
    }

    var waterBtn = document.getElementById('mock-water-btn');
    if (waterBtn) {
      waterBtn.addEventListener('click', function () {
        state.waterCount = state.waterCount >= 8 ? 5 : state.waterCount + 1;
        state.treats += 1;
        renderPhoneMockup(false);
      });
    }

    var subBtns = root.querySelectorAll('[data-focus-sub]');
    for (var s = 0; s < subBtns.length; s++) {
      subBtns[s].addEventListener('click', function (ev) {
        state.focusSubMode = ev.currentTarget.getAttribute('data-focus-sub');
        renderPhoneMockup(false);
      });
    }

    var clockModeBtn = document.getElementById('clock-mode-toggle');
    if (clockModeBtn) {
      clockModeBtn.addEventListener('click', function () {
        state.clockMode = state.clockMode === 'pomodoro' ? 'stopwatch' : 'pomodoro';
        renderPhoneMockup(false);
      });
    }

    var clockPlayBtn = document.getElementById('clock-play-btn');
    if (clockPlayBtn) {
      clockPlayBtn.addEventListener('click', function () {
        state.clockRunning = !state.clockRunning;
        renderPhoneMockup(false);
      });
    }

    var ambientBtns = root.querySelectorAll('[data-ambient]');
    for (var a = 0; a < ambientBtns.length; a++) {
      ambientBtns[a].addEventListener('click', function (ev) {
        state.ambientId = ev.currentTarget.getAttribute('data-ambient');
        renderPhoneMockup(false);
      });
    }

    var missionBtns = root.querySelectorAll('[data-mission]');
    for (var m = 0; m < missionBtns.length; m++) {
      missionBtns[m].addEventListener('click', function (ev) {
        state.alarmMission = ev.currentTarget.getAttribute('data-mission');
        state.alarmSolved = false;
        renderPhoneMockup(false);
      });
    }

    var solveBtn = document.getElementById('alarm-solve-btn');
    if (solveBtn) {
      solveBtn.addEventListener('click', function () {
        state.alarmSolved = true;
        renderPhoneMockup(false);
      });
    }

    var resetBtn = document.getElementById('alarm-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.alarmSolved = false;
        renderPhoneMockup(false);
      });
    }
  }

  /* ---------- Durum Değiştiriciler ---------- */
  function setLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'tr';
    document.documentElement.lang = state.lang;
    safeSet(STORAGE_LANG, state.lang);
    populateBrandPlaceholders();
    renderChrome();
    renderBuddyShowcase();
    renderPhoneMockup(false);
  }

  function setTheme(theme) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    safeSet(STORAGE_THEME, state.theme);
    applyPalette();
    renderChrome();
  }

  function setBuddy(buddyId) {
    state.buddyId = buddyId;
    safeSet(STORAGE_BUDDY, buddyId);
    applyPalette();
    renderBuddyShowcase();
    renderPhoneMockup(false);
  }

  /* ---------- Zamanlayıcılar (Saat tiki, Göz kırpma, Nefes evresi) ---------- */
  function startLiveTimers() {
    if (!document.getElementById('phone-mockup')) return;

    setInterval(function () {
      if (state.clockRunning) {
        if (state.clockMode === 'pomodoro') {
          state.pomodoroSec = state.pomodoroSec > 0 ? state.pomodoroSec - 1 : 25 * 60;
        } else {
          state.stopwatchSec += 1;
        }
        var leftEl = document.getElementById('flip-left-val');
        var rightEl = document.getElementById('flip-right-val');
        if (leftEl && rightEl) {
          var sec = state.clockMode === 'pomodoro' ? state.pomodoroSec : state.stopwatchSec;
          leftEl.textContent = pad2(Math.floor(sec / 60));
          rightEl.textContent = pad2(sec % 60);
        }
      }
    }, 1000);

    setInterval(function () {
      state.breathePhase = state.breathePhase === 'in' ? 'out' : 'in';
      var lbl = document.getElementById('breathe-phase-label');
      if (lbl) {
        lbl.textContent = state.breathePhase === 'in'
          ? (state.lang === 'tr' ? 'Nefes al...' : 'Breathe in...')
          : (state.lang === 'tr' ? 'Yavaşça ver...' : 'Breathe out...');
      }
    }, 3000);

    setInterval(function () {
      if (state.activeTab === 'today' && !state.petHappy) {
        renderPhoneMockup(true);
        setTimeout(function () {
          if (state.activeTab === 'today' && !state.petHappy) {
            renderPhoneMockup(false);
          }
        }, 150);
      }
    }, 4400);
  }

  /* ---------- Başlatma ---------- */
  function init() {
    state.lang = detectInitialLang();
    state.theme = detectInitialTheme();
    state.buddyId = detectInitialBuddy();
    state.activeTab = detectInitialTab();

    document.documentElement.lang = state.lang;
    applyPalette();
    populateBrandPlaceholders();
    populateStaticIcons();
    renderChrome();
    renderBuddyShowcase();
    renderPhoneMockup(false);
    startLiveTimers();

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          document.documentElement.classList.add('theme-ready');
        });
      });
    } else {
      document.documentElement.classList.add('theme-ready');
    }
  }

  // Arka plan lekeleri ve kaydırınca belirme
  function initMotion() {
    var blobs = document.createElement('div');
    blobs.className = 'motion-blobs';
    blobs.setAttribute('aria-hidden', 'true');
    blobs.innerHTML = '<span></span><span></span><span></span>';
    document.body.insertBefore(blobs, document.body.firstChild);

    if (!('IntersectionObserver' in window)) return;
    var targets = document.querySelectorAll('.section-head, .feature-card, .buddy-showcase-card, .privacy-strip, .doc-card, .faq-details');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    Array.prototype.forEach.call(targets, function (el) {
      // aynı ızgaradaki kartlar sırayla gelsin
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--reveal-delay', Math.min(index, 5) * 0.08 + 's');
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  function start() {
    init();
    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
