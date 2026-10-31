/**
 * Relisys UI Enhancement & Fix Engine
 * Resolves Pterodactyl DOM styling, button consistency, terminal chrome, and login page
 * Author: Mohamed Khire
 * Version: 2.1.0
 */
(function () {
  'use strict';

  function textOf(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // 1. Terminal Window Chrome & Toolbar
  function enhanceConsole() {
    // Only target the main terminal container, avoid duplicate bars
    var terms = document.querySelectorAll('.xterm');
    terms.forEach(function (term) {
      // Find the direct console container (.style-module_1AMtO9lt or .style-module_1n_DiqmT)
      var wrap = term.closest('.style-module_1AMtO9lt') || term.closest('.style-module_1n_DiqmT') || term.parentElement;
      if (!wrap) return;

      wrap.classList.add('relisys-term');

      // Check if toolbar already exists
      if (wrap.querySelector('.relisys-terminal-toolbar')) return;

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
        '  <span>server@relisys-core:~$</span>' +
        '</div>' +
        '<div class="relisys-term-actions">' +
        '  <button type="button" class="relisys-term-btn" id="relisys-copy-logs" title="Copy Console Logs">' +
        '    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
        '    <span>Copy</span>' +
        '  </button>' +
        '  <button type="button" class="relisys-term-btn" id="relisys-clear-logs" title="Clear Console">' +
        '    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
        '    <span>Clear</span>' +
        '  </button>' +
        '</div>';

      wrap.prepend(toolbar);

      // Event: Clear logs
      var clearBtn = toolbar.querySelector('#relisys-clear-logs');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          var screen = wrap.querySelector('.xterm-rows');
          if (screen) {
            screen.innerHTML = '<div style="color: #64748b; padding: 8px 0; font-family: monospace;">[Console output cleared by user]</div>';
            if (window.RelisysTheme) window.RelisysTheme.playSound('click');
          }
        });
      }

      // Event: Copy logs
      var copyBtn = toolbar.querySelector('#relisys-copy-logs');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          var screen = wrap.querySelector('.xterm-rows') || wrap;
          var text = screen.innerText || screen.textContent || '';
          if (text && navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function () {
              var span = copyBtn.querySelector('span');
              span.textContent = 'Copied!';
              if (window.RelisysTheme) window.RelisysTheme.playSound('click');
              setTimeout(function () { span.textContent = 'Copy'; }, 1800);
            });
          }
        });
      }
    });

    // Clean up input bar
    var inputBoxes = document.querySelectorAll('input.style-module_3TDo--Tn, input[placeholder*="command"]');
    inputBoxes.forEach(function (inp) {
      inp.classList.add('relisys-cmd-input');
      var p = inp.parentElement;
      if (p) {
        p.classList.remove('relisys-term');
        p.classList.add('relisys-cmd-bar');
      }
    });
  }

  // 2. Semantic Button Normalization
  function enhanceButtons() {
    var buttons = document.querySelectorAll('button, a.btn, .btn');
    buttons.forEach(function (btn) {
      if (btn.classList.contains('relisys-btn-processed')) return;
      btn.classList.add('relisys-btn-processed');

      var label = textOf(btn).toLowerCase();

      // Power Buttons
      if (label === 'start') {
        btn.setAttribute('data-relisys-btn', 'success');
        btn.setAttribute('data-relisys-power', 'start');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('start');
        });
      } else if (label === 'restart') {
        btn.setAttribute('data-relisys-btn', 'warning');
        btn.setAttribute('data-relisys-power', 'restart');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('start');
        });
      } else if (label === 'stop') {
        btn.setAttribute('data-relisys-btn', 'danger');
        btn.setAttribute('data-relisys-power', 'stop');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('stop');
        });
      } else if (label === 'kill') {
        btn.setAttribute('data-relisys-btn', 'danger');
        btn.setAttribute('data-relisys-power', 'kill');
        btn.addEventListener('click', function () {
          if (window.RelisysTheme) window.RelisysTheme.playSound('stop');
        });
      }
      // Action Buttons
      else if (label === 'login' || label.indexOf('save') !== -1 || label.indexOf('create') !== -1 || label.indexOf('new ') !== -1 || label.indexOf('upload') !== -1) {
        btn.setAttribute('data-relisys-btn', 'primary');
      } else if (label.indexOf('delete') !== -1 || label.indexOf('remove') !== -1 || label.indexOf('reinstall') !== -1) {
        btn.setAttribute('data-relisys-btn', 'danger');
      } else if (label.indexOf('cancel') !== -1 || label.indexOf('close') !== -1 || label.indexOf('back') !== -1) {
        btn.setAttribute('data-relisys-btn', 'ghost');
      }
    });
  }

  // 3. Login Page Beautification & Brand Panel
  function enhanceLoginPage() {
    var isLogin = window.location.pathname.indexOf('/auth/') !== -1 || document.querySelector('form[action*="login"]');
    if (!isLogin) return;

    document.body.classList.add('relisys-auth-page');

    // Replace Pterodactyl dinosaur logo in the left column
    var oldLogos = document.querySelectorAll('img[src*="pterodactyl"], svg[class*="pterodactyl"]');
    oldLogos.forEach(function (el) {
      if (el.getAttribute('data-relisys-replaced')) return;
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
    });

    // Make sure login button is styled as primary white pill
    var loginBtn = document.querySelector('form button[type="submit"]');
    if (loginBtn) {
      loginBtn.setAttribute('data-relisys-btn', 'primary');
    }

    // Reposition reCAPTCHA badge away from form and button
    var recaptchaBadge = document.querySelector('.grecaptcha-badge');
    if (recaptchaBadge) {
      recaptchaBadge.style.setProperty('left', '16px', 'important');
      recaptchaBadge.style.setProperty('right', 'auto', 'important');
      recaptchaBadge.style.setProperty('bottom', '16px', 'important');
      recaptchaBadge.style.setProperty('z-index', '50', 'important');
    }
  }

  // 4. Server Row Enhancements
  function enhanceServerRows() {
    var rows = document.querySelectorAll('a[class*="ServerRow__StatusIndicatorBox"], div[class*="ServerRow__StatusIndicatorBox"]');
    rows.forEach(function (row) {
      if (row.classList.contains('relisys-row-enhanced')) return;
      row.classList.add('relisys-row-enhanced');

      // Remove any duplicate dots
      var existingDots = row.querySelectorAll('.relisys-server-dot');
      existingDots.forEach(function (d) { d.remove(); });

      // Detect status from status bar
      var bar = row.querySelector('.status-bar');
      var status = 'offline';
      if (bar) {
        var bg = window.getComputedStyle(bar).backgroundColor;
        if (bg.indexOf('16, 185, 129') !== -1 || bg.indexOf('52, 199, 123') !== -1) {
          status = 'online';
        } else if (bg.indexOf('245, 158, 11') !== -1 || bg.indexOf('245, 185, 66') !== -1) {
          status = 'starting';
        }
      }

      var dot = document.createElement('span');
      dot.className = 'relisys-server-dot ' + status;

      var nameEl = row.querySelector('p[class*="ServerRow___StyledP-"]');
      if (nameEl) {
        nameEl.prepend(dot);
      }
    });
  }

  // 5. File Manager Folder Icons
  function enhanceFileManager() {
    var fileRows = document.querySelectorAll('div.style-module_1WqkLT9X');
    fileRows.forEach(function (row) {
      var iconWrap = row.querySelector('div.FileObjectRow___StyledDiv-sc-wrdnyp-0');
      if (iconWrap && !iconWrap.classList.contains('relisys-file-icon-styled')) {
        iconWrap.classList.add('relisys-file-icon-styled');
        var svg = iconWrap.querySelector('svg');
        if (svg) {
          var isFolder = svg.getAttribute('data-icon') === 'folder' || iconWrap.innerHTML.indexOf('M464') !== -1 || !row.querySelector('div.FileObjectRow___StyledDiv3-sc-wrdnyp-2');
          if (isFolder) {
            svg.classList.add('relisys-folder-svg');
          } else {
            svg.classList.add('relisys-file-svg');
          }
        }
      }
    });
  }

  // Master Enhancement Runner
  function runAll() {
    enhanceConsole();
    enhanceButtons();
    enhanceLoginPage();
    enhanceServerRows();
    enhanceFileManager();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }

  // Observe dynamic React SPA modifications
  var debounceTimer = null;
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function () {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runAll, 200);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  setInterval(runAll, 3000);
})();
