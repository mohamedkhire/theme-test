/**
 * Relisys UI Enhancement & Real-Time Status Engine
 * Zero-lag server card telemetry, instant status dots, non-destructive terminal toolbar, and semantic UI
 * Author: Mohamed Khire
 * Version: 2.1.0
 */
(function () {
  'use strict';

  function textOf(el) {
    return (el && el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // Live cache of server states (keyed by short identifier / UUID prefix) for 0ms status dot updates
  var STATE_CACHE_KEY = 'relisys_server_states';
  var serverStateCache = {};
  try {
    var savedStates = sessionStorage.getItem(STATE_CACHE_KEY);
    if (savedStates) serverStateCache = JSON.parse(savedStates) || {};
  } catch (e) {}

  function normalizeStateName(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var s = raw.toLowerCase();
    if (s === 'running' || s === 'online') return 'online';
    if (s === 'starting' || s === 'stopping' || s === 'installing' || s === 'restoring') return 'starting';
    if (s === 'offline' || s === 'suspended') return 'offline';
    return null;
  }

  function recordServerState(serverId, rawState) {
    if (!serverId) return;
    var norm = normalizeStateName(rawState);
    if (!norm) return;
    var shortId = serverId.slice(0, 8);
    var changed = serverStateCache[serverId] !== norm || serverStateCache[shortId] !== norm;
    serverStateCache[serverId] = norm;
    serverStateCache[shortId] = norm;
    if (changed) {
      try {
        sessionStorage.setItem(STATE_CACHE_KEY, JSON.stringify(serverStateCache));
      } catch (e) {}
      scheduleRun();
    }
  }

  // Intercept Pterodactyl's /api/client/servers/<id>/resources XHR & fetch responses for 0ms telemetry sync
  function installTelemetryInterceptor() {
    if (window.__relisysTelemetryHooked) return;
    window.__relisysTelemetryHooked = true;

    if (typeof XMLHttpRequest !== 'undefined') {
      var origOpen = XMLHttpRequest.prototype.open;
      var origSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url) {
        this._relisysUrl = typeof url === 'string' ? url : '';
        return origOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function () {
        var xhr = this;
        if (xhr._relisysUrl && xhr._relisysUrl.indexOf('/resources') !== -1) {
          xhr.addEventListener('load', function () {
            try {
              var m = xhr._relisysUrl.match(/\/api\/client\/servers\/([a-zA-Z0-9_-]+)\/resources/);
              if (m && xhr.status === 200 && xhr.responseText) {
                var data = JSON.parse(xhr.responseText);
                var st = data && data.attributes && data.attributes.current_state;
                if (st) recordServerState(m[1], st);
              }
            } catch (e) {}
          });
        }
        return origSend.apply(this, arguments);
      };
    }
  }

  installTelemetryInterceptor();

  // Extract React Fiber node to read live server state directly without slow getComputedStyle polling
  function getReactFiber(el) {
    if (!el) return null;
    var keys = Object.keys(el);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf('__reactFiber$') === 0 || k.indexOf('__reactInternalInstance$') === 0) {
        return el[k];
      }
    }
    return null;
  }

  function extractRowServerId(row) {
    var href = row.getAttribute('href') || '';
    var m = href.match(/\/server\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }

  // Fast status resolution for a ServerRow element
  function detectServerStatus(row) {
    var serverId = extractRowServerId(row);

    // 1. Check React Fiber props/memoizedProps for $status or status
    var fiber = getReactFiber(row);
    var depth = 0;
    while (fiber && depth < 18) {
      var props = fiber.memoizedProps || fiber.pendingProps;
      if (props) {
        var rawStatus = props.$status || props.status || (props.server && props.server.status);
        var norm = normalizeStateName(rawStatus);
        if (norm) {
          if (serverId) recordServerState(serverId, norm);
          return norm;
        }
      }
      fiber = fiber.return;
      depth++;
    }

    // 2. Check .status-bar Fiber props
    var bar = row.querySelector('.status-bar');
    if (bar) {
      var barFiber = getReactFiber(bar);
      if (barFiber && barFiber.memoizedProps && barFiber.memoizedProps.$status) {
        var bNorm = normalizeStateName(String(barFiber.memoizedProps.$status));
        if (bNorm) {
          if (serverId) recordServerState(serverId, bNorm);
          return bNorm;
        }
      }
    }

    // 3. Check live XHR cache from /api/client/servers/<id>/resources
    if (serverId && (serverStateCache[serverId] || serverStateCache[serverId.slice(0, 8)])) {
      return serverStateCache[serverId] || serverStateCache[serverId.slice(0, 8)];
    }

    // 4. Check explicit text content inside row for "Offline", "Suspended", "Starting"
    var rowText = (row.textContent || '').toLowerCase();
    if (rowText.indexOf('offline') !== -1 || rowText.indexOf('suspended') !== -1 || rowText.indexOf('connection error') !== -1) {
      return 'offline';
    }
    if (rowText.indexOf('starting') !== -1 || rowText.indexOf('installing') !== -1 || rowText.indexOf('restoring') !== -1) {
      return 'starting';
    }

    // 5. If CPU / Memory live numbers or GiB/MiB metrics are visible on the card, server is online
    var metrics = row.querySelectorAll('p[class*="ServerRow___StyledP3-"], [class*="IconDescription"]');
    for (var m = 0; m < metrics.length; m++) {
      var mText = metrics[m].textContent || '';
      if (/\d+(\.\d+)?\s*(%|MiB|GiB|KiB|MB|GB)/i.test(mText)) {
        return 'online';
      }
    }

    // 6. Check computed background color of .status-bar only if not currently showing initial mount spinner
    var hasSpinner = !!row.querySelector('svg[class*="Spinner"], .animate-spin');
    if (bar && !hasSpinner) {
      var bg = window.getComputedStyle(bar).backgroundColor || '';
      var rgbMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        var r = parseInt(rgbMatch[1], 10);
        var g = parseInt(rgbMatch[2], 10);
        var b = parseInt(rgbMatch[3], 10);
        if (g > 150 && g > r * 1.3) return 'online';
        if (r > 180 && g > 120 && b < 100) return 'starting';
        if (r > 180 && g < 120) return 'offline';
      }
    }

    return hasSpinner ? 'starting' : 'offline';
  }

  // 1. Server Row Instant Status Dots & Live Telemetry Polish
  function enhanceServerRows() {
    var rows = document.querySelectorAll(
      'a[class*="ServerRow__StatusIndicatorBox"], div[class*="ServerRow__StatusIndicatorBox"], a.GreyRowBox-sc-1xo9c6v-0[href^="/server/"]'
    );

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row.classList.contains('relisys-row-enhanced')) {
        row.classList.add('relisys-row-enhanced');
      }

      var status = detectServerStatus(row);
      if (row.getAttribute('data-relisys-status') !== status) {
        row.setAttribute('data-relisys-status', status);
      }

      var nameEl = row.querySelector('p[class*="ServerRow___StyledP-"]') || row.querySelector('p');
      if (nameEl) {
        var dot = nameEl.querySelector('.relisys-server-dot');
        if (!dot) {
          // Remove any stray dots outside nameEl
          var stray = row.querySelectorAll('.relisys-server-dot');
          for (var s = 0; s < stray.length; s++) stray[s].remove();

          dot = document.createElement('span');
          dot.className = 'relisys-server-dot ' + status;
          nameEl.prepend(dot);
        } else if (!dot.classList.contains(status)) {
          dot.className = 'relisys-server-dot ' + status;
        }
      }
    }
  }

  // Find Xterm instance via React Fiber for clean, non-destructive terminal clear & full log copy
  function findXtermInstance(termEl) {
    if (!termEl) return null;
    if (termEl._xterm) return termEl._xterm;
    var node = getReactFiber(termEl) || getReactFiber(termEl.parentElement);
    var depth = 0;
    while (node && depth < 35) {
      var state = node.stateNode;
      if (state) {
        if (typeof state.clear === 'function' && state.buffer) return state;
        if (state.terminal && typeof state.terminal.clear === 'function') return state.terminal;
        if (state.term && typeof state.term.clear === 'function') return state.term;
      }
      var memo = node.memoizedState;
      while (memo) {
        if (memo.memoizedState && typeof memo.memoizedState === 'object') {
          var current = memo.memoizedState.current;
          if (current && typeof current.clear === 'function' && current.buffer) {
            return current;
          }
        }
        memo = memo.next;
      }
      node = node.return;
      depth++;
    }
    return null;
  }

  // 2. Terminal Window Chrome & Non-Destructive Toolbar
  function enhanceConsole() {
    var terms = document.querySelectorAll('.xterm');
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var wrap = term.closest('.style-module_1AMtO9lt') || term.closest('.style-module_1n_DiqmT') || term.parentElement;
      if (!wrap) continue;

      wrap.classList.add('relisys-term');

      if (!wrap.querySelector('.relisys-terminal-toolbar')) {
        var toolbar = document.createElement('div');
        toolbar.className = 'relisys-terminal-toolbar';
        toolbar.innerHTML =
          '<div class="relisys-term-dots">' +
          '  <span class="relisys-dot red"></span>' +
          '  <span class="relisys-dot yellow"></span>' +
          '  <span class="relisys-dot green"></span>' +
          '</div>' +
          '<div class="relisys-term-title">' +
          '  <span class="relisys-term-pulse"></span>' +
          '  <span>container@relisys-core:~$</span>' +
          '</div>' +
          '<div class="relisys-term-actions">' +
          '  <button type="button" class="relisys-term-btn relisys-btn-processed" data-action="copy" title="Copy Console Logs">' +
          '    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          '    <span>Copy</span>' +
          '  </button>' +
          '  <button type="button" class="relisys-term-btn relisys-btn-processed" data-action="clear" title="Clear Console">' +
          '    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          '    <span>Clear</span>' +
          '  </button>' +
          '</div>';

        wrap.prepend(toolbar);

        var clearBtn = toolbar.querySelector('[data-action="clear"]');
        if (clearBtn) {
          clearBtn.addEventListener('click', (function (currentTerm, currentWrap) {
            return function () {
              var xterm = findXtermInstance(currentTerm);
              if (xterm && typeof xterm.clear === 'function') {
                xterm.clear();
              } else {
                // Safe non-destructive fallback: clear text of individual row children without destroying xterm-rows pool
                var rowsContainer = currentWrap.querySelector('.xterm-rows');
                if (rowsContainer && rowsContainer.children) {
                  for (var r = 0; r < rowsContainer.children.length; r++) {
                    rowsContainer.children[r].textContent = '';
                  }
                }
              }
              if (window.RelisysTheme) window.RelisysTheme.playSound('click');
            };
          })(term, wrap));
        }

        var copyBtn = toolbar.querySelector('[data-action="copy"]');
        if (copyBtn) {
          copyBtn.addEventListener('click', (function (currentTerm, currentWrap, btnEl) {
            return function () {
              var text = '';
              var xterm = findXtermInstance(currentTerm);
              if (xterm && xterm.buffer && xterm.buffer.active) {
                var buf = xterm.buffer.active;
                var lines = [];
                for (var idx = 0; idx < buf.length; idx++) {
                  var lineObj = buf.getLine(idx);
                  if (lineObj) {
                    var lineStr = lineObj.translateToString(true);
                    if (lineStr) lines.push(lineStr);
                  }
                }
                text = lines.join('\n').trim();
              }
              if (!text) {
                var screen = currentWrap.querySelector('.xterm-rows') || currentWrap;
                text = (screen.innerText || screen.textContent || '').trim();
              }
              if (text && navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function () {
                  var span = btnEl.querySelector('span');
                  if (span) span.textContent = 'Copied!';
                  if (window.RelisysTheme) window.RelisysTheme.playSound('click');
                  setTimeout(function () {
                    if (span) span.textContent = 'Copy';
                  }, 1800);
                });
              }
            };
          })(term, wrap, copyBtn));
        }
      }
    }

    // Clean up command input bar
    var inputBoxes = document.querySelectorAll('input.style-module_3TDo--Tn, input[placeholder*="command"]');
    for (var j = 0; j < inputBoxes.length; j++) {
      var inp = inputBoxes[j];
      if (!inp.classList.contains('relisys-cmd-input')) {
        inp.classList.add('relisys-cmd-input');
        var p = inp.parentElement;
        if (p) {
          p.classList.remove('relisys-term');
          p.classList.add('relisys-cmd-bar');
        }
      }
    }
  }

  // 3. Semantic Button Normalization
  function enhanceButtons() {
    var buttons = document.querySelectorAll('button:not(.relisys-btn-processed), a.btn:not(.relisys-btn-processed), .btn:not(.relisys-btn-processed)');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.classList.add('relisys-btn-processed');

      // Skip sidebar or studio buttons
      if (btn.closest('#relisys-sidebar-root') || btn.closest('#relisys-theme-studio') || btn.closest('#relisys-cmd-palette')) {
        continue;
      }

      var label = textOf(btn).toLowerCase();

      // Power Buttons
      if (label === 'start' || label === 'start server') {
        btn.setAttribute('data-relisys-btn', 'success');
        btn.setAttribute('data-relisys-power', 'start');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('start');
        });
      } else if (label === 'restart' || label === 'restart server') {
        btn.setAttribute('data-relisys-btn', 'warning');
        btn.setAttribute('data-relisys-power', 'restart');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('start');
        });
      } else if (label === 'stop' || label === 'stop server') {
        btn.setAttribute('data-relisys-btn', 'danger');
        btn.setAttribute('data-relisys-power', 'stop');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('stop');
        });
      } else if (label === 'kill' || label === 'kill server' || label === 'force stop') {
        btn.setAttribute('data-relisys-btn', 'danger');
        btn.setAttribute('data-relisys-power', 'kill');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('stop');
        });
      }
      // Action Buttons (strict matching to avoid false positives like "Backups")
      else if (
        label === 'login' ||
        label === 'save' ||
        label === 'save changes' ||
        label === 'create' ||
        label.indexOf('create ') === 0 ||
        label.indexOf('new ') === 0 ||
        label === 'invite user' ||
        label.indexOf('update ') === 0 ||
        label.indexOf('enable ') === 0 ||
        label === 'launch sftp' ||
        label === 'upload'
      ) {
        btn.setAttribute('data-relisys-btn', 'primary');
      } else if (
        label === 'delete' ||
        label === 'remove' ||
        label === 'reinstall' ||
        label === 'reinstall server' ||
        label === 'wipe'
      ) {
        btn.setAttribute('data-relisys-btn', 'danger');
      } else if (label === 'cancel' || label === 'close') {
        btn.setAttribute('data-relisys-btn', 'ghost');
      }
    }
  }

  // 4. Login Page Beautification & Brand Panel
  function enhanceLoginPage() {
    var isLogin = window.location.pathname.indexOf('/auth/') !== -1 || !!document.querySelector('form[action*="login"]');
    if (!isLogin) {
      document.body.classList.remove('relisys-auth-page');
      return;
    }

    document.body.classList.add('relisys-auth-page');

    var oldLogos = document.querySelectorAll('img[src*="pterodactyl"], svg[class*="pterodactyl"]');
    for (var i = 0; i < oldLogos.length; i++) {
      var el = oldLogos[i];
      if (el.getAttribute('data-relisys-replaced')) continue;
      el.setAttribute('data-relisys-replaced', 'true');
      el.style.display = 'none';

      var brandHeader = document.createElement('div');
      brandHeader.className = 'relisys-auth-brand-header';
      brandHeader.innerHTML =
        '<div class="relisys-auth-logo-badge">' +
        '  <svg viewBox="0 0 175 135" class="relisys-auth-r-logo"><path fill="#ffffff" fill-rule="evenodd" d="M 97 62 L 96 62 L 95 61 L 68 61 L 67 62 L 65 62 L 59 68 L 59 69 L 55 73 L 55 74 L 51 78 L 51 79 L 46 84 L 46 85 L 42 89 L 42 90 L 38 94 L 38 95 L 33 100 L 33 101 L 29 105 L 29 106 L 24 111 L 24 112 L 19 117 L 19 118 L 16 121 L 51 121 L 52 120 L 54 120 L 55 119 L 56 119 L 57 118 L 57 117 L 61 113 L 61 112 L 65 108 L 65 107 L 69 103 L 69 102 L 73 98 L 73 97 L 78 92 L 78 91 L 83 86 L 83 85 L 91 76 L 91 75 L 93 73 L 93 72 L 95 70 L 95 69 L 97 66 Z M 15 16 L 17 18 L 18 18 L 35 35 L 36 35 L 43 42 L 81 42 L 82 43 L 106 43 L 107 44 L 109 44 L 110 45 L 111 45 L 117 51 L 117 52 L 118 53 L 118 61 L 117 62 L 116 65 L 113 68 L 113 69 L 108 74 L 108 75 L 101 82 L 101 83 L 96 88 L 96 89 L 95 90 L 95 92 L 96 93 L 96 94 L 99 97 L 99 98 L 103 102 L 103 103 L 109 109 L 109 110 L 113 114 L 113 115 L 118 120 L 119 120 L 120 121 L 161 121 L 160 120 L 160 119 L 156 115 L 156 114 L 150 108 L 150 107 L 146 103 L 146 102 L 141 97 L 141 96 L 136 91 L 136 90 L 132 86 L 132 83 L 133 82 L 136 81 L 139 78 L 140 78 L 144 74 L 144 73 L 147 70 L 147 69 L 148 68 L 148 67 L 151 62 L 151 60 L 152 59 L 152 54 L 153 53 L 153 47 L 152 46 L 152 42 L 151 41 L 151 38 L 150 37 L 150 36 L 149 35 L 148 32 L 144 28 L 144 27 L 137 21 L 136 21 L 133 19 L 131 19 L 130 18 L 128 18 L 127 17 L 124 17 L 123 16 Z"/></svg>' +
        '</div>' +
        '<h2 class="relisys-auth-h1">RELISYS CONTROL</h2>' +
        '<p class="relisys-auth-sub">Reliable systems for powerful servers</p>' +
        '<div class="relisys-auth-badges">' +
        '  <span class="relisys-auth-chip">24/7 Monitoring</span>' +
        '  <span class="relisys-auth-chip">99.99% Uptime</span>' +
        '  <span class="relisys-auth-chip">NVMe Storage</span>' +
        '</div>';

      if (el.parentNode) el.parentNode.insertBefore(brandHeader, el);
    }

    var recaptchaBadge = document.querySelector('.grecaptcha-badge');
    if (recaptchaBadge) {
      recaptchaBadge.style.setProperty('left', '16px', 'important');
      recaptchaBadge.style.setProperty('right', 'auto', 'important');
      recaptchaBadge.style.setProperty('bottom', '16px', 'important');
      recaptchaBadge.style.setProperty('z-index', '50', 'important');
    }
  }

  // 5. File Manager Folder Icons
  function enhanceFileManager() {
    var fileRows = document.querySelectorAll('div.style-module_1WqkLT9X, div[class*="FileObjectRow"]');
    for (var i = 0; i < fileRows.length; i++) {
      var row = fileRows[i];
      var iconWrap = row.querySelector('div[class*="FileObjectRow___StyledDiv"]') || row.querySelector('svg');
      if (iconWrap && !row.classList.contains('relisys-file-row-styled')) {
        row.classList.add('relisys-file-row-styled');
        var svg = row.querySelector('svg');
        if (svg) {
          var isFolder = svg.getAttribute('data-icon') === 'folder' || (svg.innerHTML && svg.innerHTML.indexOf('M464') !== -1);
          if (isFolder) {
            svg.classList.add('relisys-folder-svg');
          } else {
            svg.classList.add('relisys-file-svg');
          }
        }
      }
    }
  }

  // Zero-lag requestAnimationFrame scheduler
  var rafId = null;
  function runAll() {
    rafId = null;
    enhanceServerRows();
    enhanceConsole();
    enhanceButtons();
    enhanceLoginPage();
    enhanceFileManager();
  }

  function scheduleRun() {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(runAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }

  // Observe React DOM updates and attribute/style changes on status bars for instant dot updates
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var target = mutations[i].target;
        if (target && target.nodeType === 1) {
          // Ignore mutations inside our own static UI overlays to prevent unnecessary work
          if (
            target.id === 'relisys-ambient-glow' ||
            target.closest && (target.closest('#relisys-theme-studio') || target.closest('#relisys-cmd-palette'))
          ) {
            continue;
          }
          scheduleRun();
          break;
        }
      }
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  // Lightweight fallback check
  setInterval(enhanceServerRows, 1000);
})();
