/**
 * Relisys Theme Engine
 * Next-Generation Dark Glassify Framework for Pterodactyl Panel
 * Author: Mohamed Khire
 * Version: 2.1.0
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'relisys_theme_settings_v2';

  var THEME_PRESETS = [
    { id: 'indigo', name: 'Royal Indigo', accent: '#6366f1', rgb: '99, 102, 241' },
    { id: 'cyan', name: 'Relisys Cyan', accent: '#00f0ff', rgb: '0, 240, 255' },
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
    discordUrl: 'https://discord.gg',
    sidebarCollapsed: false,
    hideTopSubnav: false,
    soundEffects: true,
    commandPaletteEnabled: true
  };

  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return '99, 102, 241';
    hex = hex.replace('#', '').trim();
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

  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    var trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed) && !/^\//.test(trimmed)) return '';
    return trimmed.replace(/["'()\\]/g, '');
  }

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var merged = Object.assign({}, DEFAULT_SETTINGS, parsed);
        merged.accentRgb = hexToRgb(merged.accentColor);
        return merged;
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
    var rgb = hexToRgb(settings.accentColor);
    settings.accentRgb = rgb;

    var opacity = typeof settings.glassOpacity === 'number' ? settings.glassOpacity : 0.68;
    var blur = typeof settings.blur === 'number' ? settings.blur : 18;

    root.style.setProperty('--relisys-accent', settings.accentColor);
    root.style.setProperty('--relisys-accent-rgb', rgb);
    root.style.setProperty('--relisys-accent-glow', 'rgba(' + rgb + ', 0.35)');
    root.style.setProperty('--relisys-accent-soft', 'rgba(' + rgb + ', 0.15)');
    root.style.setProperty('--relisys-blur', blur + 'px');
    root.style.setProperty('--relisys-glass-opacity', String(opacity));
    root.style.setProperty('--relisys-surface', 'rgba(15, 18, 28, ' + opacity + ')');
    root.style.setProperty('--relisys-surface-glass', 'rgba(15, 18, 28, ' + opacity + ')');
    root.style.setProperty('--relisys-surface-elevated', 'rgba(23, 27, 42, ' + Math.min(1, +(opacity + 0.15).toFixed(2)) + ')');

    if (document.body) {
      // Update body classes for background style
      document.body.classList.remove('relisys-bg-mesh', 'relisys-bg-void', 'relisys-bg-grid', 'relisys-bg-wallpaper');
      var safeWp = sanitizeUrl(settings.wallpaperUrl);
      if (settings.bgStyle === 'ambient-mesh') {
        document.body.classList.add('relisys-bg-mesh');
        document.body.style.backgroundImage = '';
      } else if (settings.bgStyle === 'grid') {
        document.body.classList.add('relisys-bg-grid');
        document.body.style.backgroundImage = '';
      } else if (settings.bgStyle === 'wallpaper' && safeWp) {
        document.body.classList.add('relisys-bg-wallpaper');
        document.body.style.backgroundImage = 'linear-gradient(rgba(7, 9, 14, 0.78), rgba(7, 9, 14, 0.88)), url("' + safeWp + '")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      } else {
        document.body.classList.add('relisys-bg-void');
        document.body.style.backgroundImage = '';
      }

      document.body.classList.toggle('relisys-hide-top-subnav', !!settings.hideTopSubnav);
    }

    syncStudioUI(settings);

    // Inform window listeners (e.g. charts, sidebar, admin view)
    window.dispatchEvent(new CustomEvent('relisys:theme-changed', { detail: settings }));
  }

  function syncStudioUI(settings) {
    var studio = document.getElementById('relisys-theme-studio');
    if (!studio) return;

    var colorPicker = document.getElementById('relisys-custom-color-input');
    var colorText = document.getElementById('relisys-custom-color-text');
    if (colorPicker && colorPicker.value.toLowerCase() !== settings.accentColor.toLowerCase()) {
      if (/^#[0-9a-f]{6}$/i.test(settings.accentColor)) {
        colorPicker.value = settings.accentColor;
      }
    }
    if (colorText && document.activeElement !== colorText) {
      colorText.value = settings.accentColor;
    }

    var grid = document.getElementById('relisys-preset-grid');
    if (grid) {
      grid.querySelectorAll('.relisys-preset-pill').forEach(function (p) {
        var isMatch = p.dataset.id === settings.preset || (p.dataset.accent && p.dataset.accent.toLowerCase() === settings.accentColor.toLowerCase());
        p.classList.toggle('active', !!isMatch);
      });
    }

    var blurRange = document.getElementById('relisys-blur-range');
    var blurVal = document.getElementById('relisys-blur-val');
    if (blurRange && blurVal) {
      blurRange.value = settings.blur;
      blurVal.textContent = settings.blur + 'px';
    }

    var opRange = document.getElementById('relisys-opacity-range');
    var opVal = document.getElementById('relisys-opacity-val');
    if (opRange && opVal) {
      var pct = Math.round(settings.glassOpacity * 100);
      opRange.value = pct;
      opVal.textContent = pct + '%';
    }

    var bgBtns = studio.querySelectorAll('.relisys-bg-btn');
    var wpBox = document.getElementById('relisys-wallpaper-box');
    var wpInput = document.getElementById('relisys-wallpaper-input');
    bgBtns.forEach(function (b) {
      b.classList.toggle('active', b.dataset.bg === settings.bgStyle);
    });
    if (wpBox) wpBox.style.display = settings.bgStyle === 'wallpaper' ? 'block' : 'none';
    if (wpInput && document.activeElement !== wpInput) wpInput.value = settings.wallpaperUrl || '';

    var soundToggle = document.getElementById('relisys-sound-toggle');
    if (soundToggle) soundToggle.checked = !!settings.soundEffects;

    var cmdToggle = document.getElementById('relisys-cmd-toggle');
    if (cmdToggle) cmdToggle.checked = settings.commandPaletteEnabled !== false;

    var subnavToggle = document.getElementById('relisys-subnav-toggle');
    if (subnavToggle) subnavToggle.checked = !!settings.hideTopSubnav;
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
      '    <button type="button" class="relisys-studio-close" id="relisys-studio-close-btn" aria-label="Close">' +
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
      '    <!-- Section: Command Palette -->' +
      '    <div class="relisys-studio-section relisys-switch-row">' +
      '      <div>' +
      '        <div class="relisys-studio-label mb-0">Command Palette (Ctrl+K)</div>' +
      '        <div class="relisys-help">Instant keyboard search and server navigation</div>' +
      '      </div>' +
      '      <label class="relisys-toggle-switch">' +
      '        <input type="checkbox" id="relisys-cmd-toggle"' + (currentSettings.commandPaletteEnabled !== false ? ' checked' : '') + '>' +
      '        <span class="relisys-toggle-slider"></span>' +
      '      </label>' +
      '    </div>' +
      '    <!-- Section: Compact Top Subnav -->' +
      '    <div class="relisys-studio-section relisys-switch-row">' +
      '      <div>' +
      '        <div class="relisys-studio-label mb-0">Sidebar-Only Subnav</div>' +
      '        <div class="relisys-help">Hide duplicate horizontal server tab bar on desktop</div>' +
      '      </div>' +
      '      <label class="relisys-toggle-switch">' +
      '        <input type="checkbox" id="relisys-subnav-toggle"' + (currentSettings.hideTopSubnav ? ' checked' : '') + '>' +
      '        <span class="relisys-toggle-slider"></span>' +
      '      </label>' +
      '    </div>' +
      '    <!-- Actions -->' +
      '    <div class="relisys-studio-actions">' +
      '      <button type="button" class="relisys-btn-reset" id="relisys-reset-btn">Reset Defaults</button>' +
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
      item.dataset.accent = preset.accent;
      item.innerHTML =
        '<span class="relisys-preset-dot" style="background-color: ' + preset.accent + '; box-shadow: 0 0 10px ' + preset.accent + '"></span>' +
        '<span>' + preset.name + '</span>';
      item.addEventListener('click', function () {
        currentSettings.preset = preset.id;
        currentSettings.accentColor = preset.accent;
        currentSettings.accentRgb = preset.rgb;
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
      var matchedPreset = THEME_PRESETS.find(function (p) {
        return p.accent.toLowerCase() === val.toLowerCase();
      });
      currentSettings.preset = matchedPreset ? matchedPreset.id : 'custom';
      currentSettings.accentColor = val;
      currentSettings.accentRgb = hexToRgb(val);
      saveSettings(currentSettings);
      applyThemeVariables(currentSettings);
    }

    colorPicker.addEventListener('input', function (e) {
      colorText.value = e.target.value;
      onColorChange(e.target.value);
    });
    colorText.addEventListener('input', function (e) {
      var val = e.target.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        if (val.length === 7) colorPicker.value = val;
        onColorChange(val);
      }
    });

    // Blur slider
    var blurRange = document.getElementById('relisys-blur-range');
    blurRange.addEventListener('input', function (e) {
      currentSettings.blur = parseInt(e.target.value, 10);
      applyThemeVariables(currentSettings);
    });
    blurRange.addEventListener('change', function () {
      saveSettings(currentSettings);
    });

    // Opacity slider
    var opRange = document.getElementById('relisys-opacity-range');
    opRange.addEventListener('input', function (e) {
      var val = parseInt(e.target.value, 10);
      currentSettings.glassOpacity = val / 100;
      applyThemeVariables(currentSettings);
    });
    opRange.addEventListener('change', function () {
      saveSettings(currentSettings);
    });

    // Background selector buttons
    var bgBtns = studio.querySelectorAll('.relisys-bg-btn');
    var wpInput = document.getElementById('relisys-wallpaper-input');

    bgBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        currentSettings.bgStyle = b.dataset.bg;
        saveSettings(currentSettings);
        applyThemeVariables(currentSettings);
        playSound('click');
      });
    });

    wpInput.addEventListener('input', function (e) {
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

    // Command palette toggle
    var cmdToggle = document.getElementById('relisys-cmd-toggle');
    cmdToggle.addEventListener('change', function (e) {
      currentSettings.commandPaletteEnabled = e.target.checked;
      saveSettings(currentSettings);
      playSound('toggle');
    });

    // Subnav toggle
    var subnavToggle = document.getElementById('relisys-subnav-toggle');
    subnavToggle.addEventListener('change', function (e) {
      currentSettings.hideTopSubnav = e.target.checked;
      saveSettings(currentSettings);
      applyThemeVariables(currentSettings);
      playSound('toggle');
    });

    // Reset button
    document.getElementById('relisys-reset-btn').addEventListener('click', function () {
      currentSettings = Object.assign({}, DEFAULT_SETTINGS);
      saveSettings(currentSettings);
      applyThemeVariables(currentSettings);
      playSound('toggle');
    });

    // Close handlers
    function closeStudio() {
      studio.classList.remove('open');
      playSound('click');
    }
    document.getElementById('relisys-studio-close-btn').addEventListener('click', closeStudio);
    document.getElementById('relisys-studio-close-bg').addEventListener('click', closeStudio);

    syncStudioUI(currentSettings);
  }

  function openThemeStudio() {
    createThemeStudio();
    var studio = document.getElementById('relisys-theme-studio');
    if (studio) {
      syncStudioUI(currentSettings);
      studio.classList.add('open');
      playSound('click');
    }
  }

  // Floating trigger button in bottom right
  function initStudioTriggerButton() {
    if (document.getElementById('relisys-studio-trigger')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'relisys-studio-trigger';
    btn.className = 'relisys-floating-studio-btn relisys-btn-processed';
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

  // SPA Navigation Helper (prevents full page reload inside Pterodactyl React client)
  function navigateTo(path) {
    if (!path) return;
    var isAdminRoute = path.indexOf('/admin') === 0 || window.location.pathname.indexOf('/admin') === 0;
    if (isAdminRoute || !document.getElementById('app')) {
      window.location.href = path;
      return;
    }
    if (window.location.pathname === path) return;
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }

  function isRootAdmin() {
    if (window.PterodactylUser && typeof window.PterodactylUser.root_admin !== 'undefined') {
      return !!window.PterodactylUser.root_admin;
    }
    if (window.location.pathname.indexOf('/admin') === 0) return true;
    return !!document.querySelector('a[href*="/admin"]');
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
      '    <span>Theme: Relisys 2.1</span>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(palette);

    var input = document.getElementById('relisys-palette-input');
    var resultsBox = document.getElementById('relisys-palette-results');
    var selectedIdx = 0;

    function getServerIdFromUrl() {
      var match = window.location.pathname.match(/\/server\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    function getAvailableCommands() {
      var cmds = [
        { category: 'Quick Navigation', title: 'Servers Dashboard', action: function () { closePalette(); navigateTo('/'); } },
        { category: 'Quick Navigation', title: 'Account Settings', action: function () { closePalette(); navigateTo('/account'); } },
        { category: 'Quick Navigation', title: 'Account API Credentials', action: function () { closePalette(); navigateTo('/account/api'); } },
        { category: 'Quick Navigation', title: 'Account SSH Keys', action: function () { closePalette(); navigateTo('/account/ssh'); } },
        { category: 'Quick Navigation', title: 'Account Activity Log', action: function () { closePalette(); navigateTo('/account/activity'); } }
      ];

      if (isRootAdmin()) {
        cmds.push({ category: 'Quick Navigation', title: 'Admin Control Center', action: function () { closePalette(); window.location.href = '/admin'; } });
      }

      cmds.push({ category: 'Theme Studio', title: 'Open Theme Studio (Customize Colors & Glass)', action: function () { closePalette(); openThemeStudio(); } });

      var id = getServerIdFromUrl();
      if (id) {
        cmds.push(
          { category: 'Server Actions', title: 'Jump to Terminal Console', action: function () { closePalette(); navigateTo('/server/' + id); } },
          { category: 'Server Actions', title: 'Jump to File Manager', action: function () { closePalette(); navigateTo('/server/' + id + '/files'); } },
          { category: 'Server Actions', title: 'Jump to Databases', action: function () { closePalette(); navigateTo('/server/' + id + '/databases'); } },
          { category: 'Server Actions', title: 'Jump to Schedules', action: function () { closePalette(); navigateTo('/server/' + id + '/schedules'); } },
          { category: 'Server Actions', title: 'Jump to Subusers & Access', action: function () { closePalette(); navigateTo('/server/' + id + '/users'); } },
          { category: 'Server Actions', title: 'Jump to Backups', action: function () { closePalette(); navigateTo('/server/' + id + '/backups'); } },
          { category: 'Server Actions', title: 'Jump to Network Allocations', action: function () { closePalette(); navigateTo('/server/' + id + '/network'); } },
          { category: 'Server Actions', title: 'Jump to Startup Configuration', action: function () { closePalette(); navigateTo('/server/' + id + '/startup'); } },
          { category: 'Server Actions', title: 'Jump to Server Settings', action: function () { closePalette(); navigateTo('/server/' + id + '/settings'); } },
          { category: 'Server Actions', title: 'Jump to Server Activity Logs', action: function () { closePalette(); navigateTo('/server/' + id + '/activity'); } }
        );
      }

      // Dynamically add any visible servers on dashboard
      var serverLinks = document.querySelectorAll('a[href^="/server/"]');
      var seenHrefs = {};
      serverLinks.forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href || seenHrefs[href] || href.split('/').length > 3) return;
        var nameNode = a.querySelector('p[class*="ServerRow___StyledP-"], .server-row-name');
        var name = nameNode ? nameNode.textContent.trim() : '';
        if (name) {
          seenHrefs[href] = true;
          cmds.push({
            category: 'Servers',
            title: 'Connect to ' + name,
            action: function () { closePalette(); navigateTo(href); }
          });
        }
      });

      return cmds;
    }

    var currentFiltered = [];

    function renderResults(filtered) {
      resultsBox.innerHTML = '';
      if (!filtered.length) {
        resultsBox.innerHTML = '<div class="relisys-palette-empty">No matching commands or pages found.</div>';
        return;
      }
      filtered.forEach(function (cmd, idx) {
        var el = document.createElement('div');
        el.className = 'relisys-palette-item' + (idx === selectedIdx ? ' selected' : '');

        var left = document.createElement('div');
        left.className = 'relisys-palette-item-left';

        var tag = document.createElement('span');
        tag.className = 'relisys-palette-tag';
        tag.textContent = cmd.category;

        var title = document.createElement('span');
        title.className = 'relisys-palette-item-title';
        title.textContent = cmd.title;

        left.appendChild(tag);
        left.appendChild(title);

        var hint = document.createElement('span');
        hint.className = 'relisys-palette-enter-hint';
        hint.innerHTML = '&crarr;';

        el.appendChild(left);
        el.appendChild(hint);

        el.addEventListener('click', function () {
          playSound('click');
          cmd.action();
        });
        resultsBox.appendChild(el);
      });
    }

    input.addEventListener('input', function (e) {
      var query = e.target.value.toLowerCase().trim();
      var all = getAvailableCommands();
      if (!query) {
        currentFiltered = all.slice(0, 10);
      } else {
        currentFiltered = all.filter(function (cmd) {
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
      if (currentSettings.commandPaletteEnabled === false) return;
      palette.classList.add('open');
      input.value = '';
      currentFiltered = getAvailableCommands().slice(0, 10);
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
        if (currentSettings.commandPaletteEnabled === false) return;
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
    if (!s) return;
    if (s.accentColor && !s.accentRgb) {
      s.accentRgb = hexToRgb(s.accentColor);
    }
    if (s.accentColor && !s.preset) {
      var found = THEME_PRESETS.find(function (p) {
        return p.accent.toLowerCase() === s.accentColor.toLowerCase();
      });
      s.preset = found ? found.id : 'custom';
    }
    currentSettings = Object.assign({}, currentSettings, s);
    saveSettings(currentSettings);
    applyThemeVariables(currentSettings);
  };
  window.RelisysTheme.openStudio = openThemeStudio;
  window.RelisysTheme.playSound = playSound;
  window.RelisysTheme.navigateTo = navigateTo;
  window.RelisysTheme.isRootAdmin = isRootAdmin;

  // Apply CSS variables immediately so there is no flash of unstyled colors
  applyThemeVariables(currentSettings);

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
