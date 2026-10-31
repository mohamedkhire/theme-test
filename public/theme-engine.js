/**
 * Relisys Theme Engine
 * Next-Generation Dark Glassify Framework for Pterodactyl Panel
 * Author: Mohamed Khire
 * Version: 2.0.0
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'relisys_theme_settings_v2';

  var THEME_PRESETS = [
    { id: 'cyan', name: 'Relisys Cyan', accent: '#00f0ff', rgb: '0, 240, 255' },
    { id: 'indigo', name: 'Royal Indigo', accent: '#6366f1', rgb: '99, 102, 241' },
    { id: 'violet', name: 'Amethyst Violet', accent: '#a855f7', rgb: '168, 85, 247' },
    { id: 'emerald', name: 'Neon Emerald', accent: '#10b981', rgb: '16, 185, 129' },
    { id: 'coral', name: 'Cyber Coral', accent: '#ff6363', rgb: '255, 99, 99' },
    { id: 'blue', name: 'Electric Blue', accent: '#3b82f6', rgb: '59, 130, 246' },
    { id: 'amber', name: 'Sunset Amber', accent: '#f59e0b', rgb: '245, 158, 11' },
    { id: 'white', name: 'Pure Frost', accent: '#ffffff', rgb: '255, 255, 255' }
  ];

  var DEFAULT_SETTINGS = {
    preset: 'indigo',
    accentColor: '#6366f1',
    accentRgb: '99, 102, 241',
    blur: 18,
    glassOpacity: 0.68,
    bgStyle: 'ambient-mesh', // 'ambient-mesh', 'deep-void', 'grid', 'wallpaper'
    wallpaperUrl: '',
    sidebarCollapsed: false,
    soundEffects: true,
    commandPaletteEnabled: true
  };

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_SETTINGS, parsed);
      }
    } catch (e) {
      console.warn('[Relisys Theme] Failed to parse local settings, using defaults.', e);
    }
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('[Relisys Theme] Could not save settings to localStorage', e);
    }
  }

  var currentSettings = loadSettings();

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var num = parseInt(hex, 16);
    if (isNaN(num)) return '99, 102, 241';
    var r = (num >> 16) & 255;
    var g = (num >> 8) & 255;
    var b = num & 255;
    return r + ', ' + g + ', ' + b;
  }

  // Audio synthesizer for micro-interactions
  var audioCtx = null;
  function playSound(type) {
    if (!currentSettings.soundEffects) return;
    try {
      if (!audioCtx) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'start') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'stop') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'toggle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      // Audio context might fail on restricted browser contexts, silently ignore
    }
  }

  function applyThemeVariables(settings) {
    var root = document.documentElement;
    var rgb = settings.accentRgb || hexToRgb(settings.accentColor);

    root.style.setProperty('--relisys-accent', settings.accentColor);
    root.style.setProperty('--relisys-accent-rgb', rgb);
    root.style.setProperty('--relisys-accent-glow', 'rgba(' + rgb + ', 0.35)');
    root.style.setProperty('--relisys-accent-soft', 'rgba(' + rgb + ', 0.15)');
    root.style.setProperty('--relisys-blur', settings.blur + 'px');
    root.style.setProperty('--relisys-glass-opacity', settings.glassOpacity);
    root.style.setProperty('--relisys-surface-glass', 'rgba(15, 18, 28, ' + settings.glassOpacity + ')');
    root.style.setProperty('--relisys-surface-elevated', 'rgba(23, 27, 42, ' + Math.min(1, settings.glassOpacity + 0.15) + ')');

    // Update body classes for background style
    document.body.classList.remove('relisys-bg-mesh', 'relisys-bg-void', 'relisys-bg-grid', 'relisys-bg-wallpaper');
    if (settings.bgStyle === 'ambient-mesh') {
      document.body.classList.add('relisys-bg-mesh');
      document.body.style.backgroundImage = '';
    } else if (settings.bgStyle === 'grid') {
      document.body.classList.add('relisys-bg-grid');
      document.body.style.backgroundImage = '';
    } else if (settings.bgStyle === 'wallpaper' && settings.wallpaperUrl) {
      document.body.classList.add('relisys-bg-wallpaper');
      document.body.style.backgroundImage = 'linear-gradient(rgba(7, 9, 14, 0.78), rgba(7, 9, 14, 0.88)), url("' + encodeURI(settings.wallpaperUrl) + '")';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.classList.add('relisys-bg-void');
      document.body.style.backgroundImage = '';
    }

    // Inform window listeners (e.g. charts)
    window.dispatchEvent(new CustomEvent('relisys:theme-changed', { detail: settings }));
  }

  // Create ambient backdrop mesh elements
  function initAmbientBackdrop() {
    if (document.getElementById('relisys-ambient-glow')) return;
    var container = document.createElement('div');
    container.id = 'relisys-ambient-glow';
    container.className = 'relisys-ambient-container';
    container.setAttribute('aria-hidden', 'true');
    container.innerHTML =
      '<div class="relisys-aura-blob blob-1"></div>' +
      '<div class="relisys-aura-blob blob-2"></div>' +
      '<div class="relisys-aura-blob blob-3"></div>' +
      '<div class="relisys-grain-layer"></div>';
    document.body.prepend(container);
  }

  // Inject Theme Studio Drawer
  function createThemeStudio() {
    if (document.getElementById('relisys-theme-studio')) return;

    var studio = document.createElement('div');
    studio.id = 'relisys-theme-studio';
    studio.className = 'relisys-studio-drawer';
    studio.innerHTML =
      '<div class="relisys-studio-backdrop" id="relisys-studio-close-bg"></div>' +
      '<div class="relisys-studio-panel">' +
      '  <div class="relisys-studio-header">' +
      '    <div class="relisys-studio-title">' +
      '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"/><path d="M2 12h20"/></svg>' +
      '      <span>Relisys Theme Studio</span>' +
      '    </div>' +
      '    <button class="relisys-studio-close" id="relisys-studio-close-btn" aria-label="Close">' +
      '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="relisys-studio-content">' +
      '    <!-- Section: Accent Presets -->' +
      '    <div class="relisys-studio-section">' +
      '      <label class="relisys-studio-label">Color Presets</label>' +
      '      <div class="relisys-preset-grid" id="relisys-preset-grid"></div>' +
      '    </div>' +
      '    <!-- Section: Custom Accent -->' +
      '    <div class="relisys-studio-section">' +
      '      <label class="relisys-studio-label">Custom Accent Color</label>' +
      '      <div class="relisys-custom-color-row">' +
      '        <input type="color" id="relisys-custom-color-input" class="relisys-color-picker" value="' + currentSettings.accentColor + '">' +
      '        <input type="text" id="relisys-custom-color-text" class="relisys-color-text" value="' + currentSettings.accentColor + '" placeholder="#6366f1">' +
      '      </div>' +
      '    </div>' +
      '    <!-- Section: Glass Blur -->' +
      '    <div class="relisys-studio-section">' +
      '      <div class="relisys-slider-header">' +
      '        <label class="relisys-studio-label">Glass Frosted Blur</label>' +
      '        <span class="relisys-slider-val" id="relisys-blur-val">' + currentSettings.blur + 'px</span>' +
      '      </div>' +
      '      <input type="range" id="relisys-blur-range" min="0" max="32" step="2" value="' + currentSettings.blur + '" class="relisys-range">' +
      '    </div>' +
      '    <!-- Section: Glass Opacity -->' +
      '    <div class="relisys-studio-section">' +
      '      <div class="relisys-slider-header">' +
      '        <label class="relisys-studio-label">Surface Opacity</label>' +
      '        <span class="relisys-slider-val" id="relisys-opacity-val">' + Math.round(currentSettings.glassOpacity * 100) + '%</span>' +
      '      </div>' +
      '      <input type="range" id="relisys-opacity-range" min="30" max="95" step="5" value="' + Math.round(currentSettings.glassOpacity * 100) + '" class="relisys-range">' +
      '    </div>' +
      '    <!-- Section: Background Style -->' +
      '    <div class="relisys-studio-section">' +
      '      <label class="relisys-studio-label">Background Style</label>' +
      '      <div class="relisys-bg-selector">' +
      '        <button type="button" class="relisys-bg-btn" data-bg="ambient-mesh">Ambient Mesh</button>' +
      '        <button type="button" class="relisys-bg-btn" data-bg="deep-void">Deep Void</button>' +
      '        <button type="button" class="relisys-bg-btn" data-bg="grid">Cyber Grid</button>' +
      '        <button type="button" class="relisys-bg-btn" data-bg="wallpaper">Custom Image</button>' +
      '      </div>' +
      '      <div class="relisys-wallpaper-box" id="relisys-wallpaper-box" style="display: ' + (currentSettings.bgStyle === 'wallpaper' ? 'block' : 'none') + ';">' +
      '        <input type="url" id="relisys-wallpaper-input" class="relisys-input" placeholder="https://example.com/wallpaper.jpg" value="' + (currentSettings.wallpaperUrl || '') + '">' +
      '        <p class="relisys-help">Direct HTTPS link to image</p>' +
      '      </div>' +
      '    </div>' +
      '    <!-- Section: Sound Effects -->' +
      '    <div class="relisys-studio-section relisys-switch-row">' +
      '      <div>' +
      '        <div class="relisys-studio-label mb-0">Haptic Audio SFX</div>' +
      '        <div class="relisys-help">Subtle synthesized feedback on clicks and power buttons</div>' +
      '      </div>' +
      '      <label class="relisys-toggle-switch">' +
      '        <input type="checkbox" id="relisys-sound-toggle"' + (currentSettings.soundEffects ? ' checked' : '') + '>' +
      '        <span class="relisys-toggle-slider"></span>' +
      '      </label>' +
      '    </div>' +
      '    <!-- Actions -->' +
      '    <div class="relisys-studio-actions">' +
      '      <button class="relisys-btn-reset" id="relisys-reset-btn">Reset Defaults</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(studio);

    // Populate presets
    var grid = document.getElementById('relisys-preset-grid');
    THEME_PRESETS.forEach(function (preset) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'relisys-preset-pill' + (currentSettings.preset === preset.id ? ' active' : '');
      item.dataset.id = preset.id;
      item.innerHTML =
        '<span class="relisys-preset-dot" style="background-color: ' + preset.accent + '; box-shadow: 0 0 10px ' + preset.accent + '"></span>' +
        '<span>' + preset.name + '</span>';
      item.addEventListener('click', function () {
        currentSettings.preset = preset.id;
        currentSettings.accentColor = preset.accent;
        currentSettings.accentRgb = preset.rgb;
        document.getElementById('relisys-custom-color-input').value = preset.accent;
        document.getElementById('relisys-custom-color-text').value = preset.accent;
        grid.querySelectorAll('.relisys-preset-pill').forEach(function (p) { p.classList.remove('active'); });
        item.classList.add('active');
        saveSettings(currentSettings);
        applyThemeVariables(currentSettings);
        playSound('click');
      });
      grid.appendChild(item);
    });

    // Custom color input listeners
    var colorPicker = document.getElementById('relisys-custom-color-input');
    var colorText = document.getElementById('relisys-custom-color-text');

    function onColorChange(val) {
      currentSettings.preset = 'custom';
      currentSettings.accentColor = val;
      currentSettings.accentRgb = hexToRgb(val);
      grid.querySelectorAll('.relisys-preset-pill').forEach(function (p) { p.classList.remove('active'); });
      saveSettings(currentSettings);
      applyThemeVariables(currentSettings);
    }

    colorPicker.addEventListener('input', function (e) {
      colorText.value = e.target.value;
      onColorChange(e.target.value);
    });
    colorText.addEventListener('change', function (e) {
      var val = e.target.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        colorPicker.value = val;
        onColorChange(val);
        playSound('click');
      }
    });

    // Blur slider
    var blurRange = document.getElementById('relisys-blur-range');
    var blurVal = document.getElementById('relisys-blur-val');
    blurRange.addEventListener('input', function (e) {
      var val = parseInt(e.target.value, 10);
      blurVal.textContent = val + 'px';
      currentSettings.blur = val;
      applyThemeVariables(currentSettings);
    });
    blurRange.addEventListener('change', function () {
      saveSettings(currentSettings);
    });

    // Opacity slider
    var opRange = document.getElementById('relisys-opacity-range');
    var opVal = document.getElementById('relisys-opacity-val');
    opRange.addEventListener('input', function (e) {
      var val = parseInt(e.target.value, 10);
      opVal.textContent = val + '%';
      currentSettings.glassOpacity = val / 100;
      applyThemeVariables(currentSettings);
    });
    opRange.addEventListener('change', function () {
      saveSettings(currentSettings);
    });

    // Background selector buttons
    var bgBtns = studio.querySelectorAll('.relisys-bg-btn');
    var wpBox = document.getElementById('relisys-wallpaper-box');
    var wpInput = document.getElementById('relisys-wallpaper-input');

    function updateBgBtns(selected) {
      bgBtns.forEach(function (b) {
        if (b.dataset.bg === selected) b.classList.add('active');
        else b.classList.remove('active');
      });
      wpBox.style.display = selected === 'wallpaper' ? 'block' : 'none';
    }
    updateBgBtns(currentSettings.bgStyle);

    bgBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var style = b.dataset.bg;
        currentSettings.bgStyle = style;
        updateBgBtns(style);
        saveSettings(currentSettings);
        applyThemeVariables(currentSettings);
        playSound('click');
      });
    });

    wpInput.addEventListener('change', function (e) {
      currentSettings.wallpaperUrl = e.target.value.trim();
      saveSettings(currentSettings);
      applyThemeVariables(currentSettings);
    });

    // Sound toggle
    var soundToggle = document.getElementById('relisys-sound-toggle');
    soundToggle.addEventListener('change', function (e) {
      currentSettings.soundEffects = e.target.checked;
      saveSettings(currentSettings);
      playSound('toggle');
    });

    // Reset button
    document.getElementById('relisys-reset-btn').addEventListener('click', function () {
      currentSettings = Object.assign({}, DEFAULT_SETTINGS);
      saveSettings(currentSettings);
      applyThemeVariables(currentSettings);
      blurRange.value = currentSettings.blur;
      blurVal.textContent = currentSettings.blur + 'px';
      opRange.value = Math.round(currentSettings.glassOpacity * 100);
      opVal.textContent = Math.round(currentSettings.glassOpacity * 100) + '%';
      colorPicker.value = currentSettings.accentColor;
      colorText.value = currentSettings.accentColor;
      soundToggle.checked = currentSettings.soundEffects;
      updateBgBtns(currentSettings.bgStyle);
      grid.querySelectorAll('.relisys-preset-pill').forEach(function (p) {
        if (p.dataset.id === currentSettings.preset) p.classList.add('active');
        else p.classList.remove('active');
      });
      playSound('toggle');
    });

    // Close handlers
    function closeStudio() {
      studio.classList.remove('open');
      playSound('click');
    }
    document.getElementById('relisys-studio-close-btn').addEventListener('click', closeStudio);
    document.getElementById('relisys-studio-close-bg').addEventListener('click', closeStudio);
  }

  function openThemeStudio() {
    createThemeStudio();
    var studio = document.getElementById('relisys-theme-studio');
    if (studio) {
      studio.classList.add('open');
      playSound('click');
    }
  }

  // Floating trigger button in bottom right
  function initStudioTriggerButton() {
    if (document.getElementById('relisys-studio-trigger')) return;
    var btn = document.createElement('button');
    btn.id = 'relisys-studio-trigger';
    btn.className = 'relisys-floating-studio-btn';
    btn.setAttribute('aria-label', 'Open Relisys Theme Studio');
    btn.setAttribute('title', 'Relisys Theme Studio');
    btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '  <circle cx="12" cy="12" r="10"/>' +
      '  <path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"/>' +
      '  <path d="M2 12h20"/>' +
      '</svg>';
    btn.addEventListener('click', openThemeStudio);
    document.body.appendChild(btn);
  }

  // Command Palette (Ctrl+K or Cmd+K)
  function initCommandPalette() {
    if (document.getElementById('relisys-cmd-palette')) return;

    var palette = document.createElement('div');
    palette.id = 'relisys-cmd-palette';
    palette.className = 'relisys-palette-overlay';
    palette.innerHTML =
      '<div class="relisys-palette-backdrop" id="relisys-palette-close-bg"></div>' +
      '<div class="relisys-palette-dialog">' +
      '  <div class="relisys-palette-search-box">' +
      '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
      '    <input type="text" id="relisys-palette-input" class="relisys-palette-input" placeholder="Type a command or jump to page... (ESC to close)" autocomplete="off">' +
      '    <span class="relisys-palette-kbd">ESC</span>' +
      '  </div>' +
      '  <div class="relisys-palette-list" id="relisys-palette-results"></div>' +
      '  <div class="relisys-palette-footer">' +
      '    <span>Navigation: <kbd>&uarr;</kbd> <kbd>&darr;</kbd></span>' +
      '    <span>Select: <kbd>Enter</kbd></span>' +
      '    <span>Theme: Relisys 2.0</span>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(palette);

    var input = document.getElementById('relisys-palette-input');
    var resultsBox = document.getElementById('relisys-palette-results');
    var selectedIdx = 0;

    var COMMANDS = [
      { category: 'Quick Navigation', title: 'Servers Dashboard', icon: 'server', action: function () { window.location.href = '/'; } },
      { category: 'Quick Navigation', title: 'Account Settings', icon: 'user', action: function () { window.location.href = '/account'; } },
      { category: 'Quick Navigation', title: 'Account API Keys', icon: 'key', action: function () { window.location.href = '/account/api'; } },
      { category: 'Quick Navigation', title: 'Account SSH Keys', icon: 'terminal', action: function () { window.location.href = '/account/ssh'; } },
      { category: 'Quick Navigation', title: 'Admin Control Center', icon: 'shield', action: function () { window.location.href = '/admin'; } },
      { category: 'Theme Studio', title: 'Open Theme Studio (Customize Colors & Glass)', icon: 'palette', action: function () { closePalette(); openThemeStudio(); } },
      { category: 'Server Actions', title: 'Jump to Console', icon: 'terminal', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id; else window.location.href = '/'; } },
      { category: 'Server Actions', title: 'Jump to File Manager', icon: 'folder', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id + '/files'; else window.location.href = '/'; } },
      { category: 'Server Actions', title: 'Jump to Databases', icon: 'database', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id + '/databases'; else window.location.href = '/'; } },
      { category: 'Server Actions', title: 'Jump to Backups', icon: 'archive', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id + '/backups'; else window.location.href = '/'; } },
      { category: 'Server Actions', title: 'Jump to Schedules', icon: 'calendar', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id + '/schedules'; else window.location.href = '/'; } },
      { category: 'Server Actions', title: 'Jump to Network', icon: 'wifi', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id + '/network'; else window.location.href = '/'; } },
      { category: 'Server Actions', title: 'Jump to Startup Configuration', icon: 'play', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id + '/startup'; else window.location.href = '/'; } },
      { category: 'Server Actions', title: 'Jump to Server Settings', icon: 'settings', action: function () { var id = getServerIdFromUrl(); if (id) window.location.href = '/server/' + id + '/settings'; else window.location.href = '/'; } }
    ];

    function getServerIdFromUrl() {
      var match = window.location.pathname.match(/\/server\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    function renderResults(filtered) {
      resultsBox.innerHTML = '';
      if (!filtered.length) {
        resultsBox.innerHTML = '<div class="relisys-palette-empty">No matching commands or pages found.</div>';
        return;
      }
      filtered.forEach(function (cmd, idx) {
        var el = document.createElement('div');
        el.className = 'relisys-palette-item' + (idx === selectedIdx ? ' selected' : '');
        el.innerHTML =
          '<div class="relisys-palette-item-left">' +
          '  <span class="relisys-palette-tag">' + cmd.category + '</span>' +
          '  <span class="relisys-palette-item-title">' + cmd.title + '</span>' +
          '</div>' +
          '<span class="relisys-palette-enter-hint">&crarr;</span>';
        el.addEventListener('click', function () {
          playSound('click');
          cmd.action();
        });
        resultsBox.appendChild(el);
      });
    }

    var currentFiltered = COMMANDS.slice(0, 8);
    renderResults(currentFiltered);

    input.addEventListener('input', function (e) {
      var query = e.target.value.toLowerCase().trim();
      if (!query) {
        currentFiltered = COMMANDS.slice(0, 8);
      } else {
        currentFiltered = COMMANDS.filter(function (cmd) {
          return cmd.title.toLowerCase().indexOf(query) !== -1 || cmd.category.toLowerCase().indexOf(query) !== -1;
        });
      }
      selectedIdx = 0;
      renderResults(currentFiltered);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentFiltered.length) {
          selectedIdx = (selectedIdx + 1) % currentFiltered.length;
          renderResults(currentFiltered);
          ensureSelectedVisible();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentFiltered.length) {
          selectedIdx = (selectedIdx - 1 + currentFiltered.length) % currentFiltered.length;
          renderResults(currentFiltered);
          ensureSelectedVisible();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFiltered[selectedIdx]) {
          playSound('click');
          currentFiltered[selectedIdx].action();
        }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });

    function ensureSelectedVisible() {
      var sel = resultsBox.querySelector('.relisys-palette-item.selected');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }

    function openPalette() {
      palette.classList.add('open');
      input.value = '';
      currentFiltered = COMMANDS.slice(0, 8);
      selectedIdx = 0;
      renderResults(currentFiltered);
      setTimeout(function () { input.focus(); }, 50);
      playSound('click');
    }

    function closePalette() {
      palette.classList.remove('open');
    }

    document.getElementById('relisys-palette-close-bg').addEventListener('click', closePalette);

    // Global keyboard shortcut
    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (palette.classList.contains('open')) closePalette();
        else openPalette();
      } else if (e.key === 'Escape' && palette.classList.contains('open')) {
        closePalette();
      }
    });

    window.RelisysTheme = window.RelisysTheme || {};
    window.RelisysTheme.openPalette = openPalette;
    window.RelisysTheme.closePalette = closePalette;
  }

  // Export theme API globally
  window.RelisysTheme = window.RelisysTheme || {};
  window.RelisysTheme.getSettings = function () { return currentSettings; };
  window.RelisysTheme.applySettings = function (s) {
    currentSettings = Object.assign({}, currentSettings, s);
    saveSettings(currentSettings);
    applyThemeVariables(currentSettings);
  };
  window.RelisysTheme.openStudio = openThemeStudio;
  window.RelisysTheme.playSound = playSound;

  // Initialize on load
  function init() {
    applyThemeVariables(currentSettings);
    initAmbientBackdrop();
    initStudioTriggerButton();
    createThemeStudio();
    initCommandPalette();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

