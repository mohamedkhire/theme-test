/**
 * Relisys Modern Glass Sidebar Navigation
 * Zero-reload SPA routing, live server context & status sync, and responsive layout
 * Author: Mohamed Khire
 * Version: 2.1.0
 */
(function () {
  'use strict';

  var SIDEBAR_COLLAPSED_KEY = 'relisys_sidebar_collapsed';

  var ICONS = {
    relisysLogo: '<svg viewBox="0 0 175 135" class="relisys-icon-logo"><path fill="currentColor" fill-rule="evenodd" d="M 97 62 L 96 62 L 95 61 L 68 61 L 67 62 L 65 62 L 59 68 L 59 69 L 55 73 L 55 74 L 51 78 L 51 79 L 46 84 L 46 85 L 42 89 L 42 90 L 38 94 L 38 95 L 33 100 L 33 101 L 29 105 L 29 106 L 24 111 L 24 112 L 19 117 L 19 118 L 16 121 L 51 121 L 52 120 L 54 120 L 55 119 L 56 119 L 57 118 L 57 117 L 61 113 L 61 112 L 65 108 L 65 107 L 69 103 L 69 102 L 73 98 L 73 97 L 78 92 L 78 91 L 83 86 L 83 85 L 91 76 L 91 75 L 93 73 L 93 72 L 95 70 L 95 69 L 97 66 Z M 15 16 L 17 18 L 18 18 L 35 35 L 36 35 L 43 42 L 81 42 L 82 43 L 106 43 L 107 44 L 109 44 L 110 45 L 111 45 L 117 51 L 117 52 L 118 53 L 118 61 L 117 62 L 116 65 L 113 68 L 113 69 L 108 74 L 108 75 L 101 82 L 101 83 L 96 88 L 96 89 L 95 90 L 95 92 L 96 93 L 96 94 L 99 97 L 99 98 L 103 102 L 103 103 L 109 109 L 109 110 L 113 114 L 113 115 L 118 120 L 119 120 L 120 121 L 161 121 L 160 120 L 160 119 L 156 115 L 156 114 L 150 108 L 150 107 L 146 103 L 146 102 L 141 97 L 141 96 L 136 91 L 136 90 L 132 86 L 132 83 L 133 82 L 136 81 L 139 78 L 140 78 L 144 74 L 144 73 L 147 70 L 147 69 L 148 68 L 148 67 L 151 62 L 151 60 L 152 59 L 152 54 L 153 53 L 153 47 L 152 46 L 152 42 L 151 41 L 151 38 L 150 37 L 150 36 L 149 35 L 148 32 L 144 28 L 144 27 L 137 21 L 136 21 L 133 19 L 131 19 L 130 18 L 128 18 L 127 17 L 124 17 L 123 16 Z"/></svg>',
    servers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
    account: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    databases: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    schedules: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    backups: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    startup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    collapse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
    studio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
  };

  var isCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';

  var GENERIC_TITLES = [
    'file manager', 'databases', 'schedules', 'users', 'backups',
    'network', 'startup', 'settings', 'activity', 'console', 'relisys'
  ];

  function extractServerInfo() {
    var pathname = window.location.pathname;
    var match = pathname.match(/\/server\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    var serverId = match[1];

    var serverName = '';
    // 1. Check document.title (Pterodactyl sets "<Server Name> | <Panel Name>")
    if (document.title && document.title.indexOf('|') !== -1) {
      var candidate = document.title.split('|')[0].trim();
      if (candidate && GENERIC_TITLES.indexOf(candidate.toLowerCase()) === -1) {
        serverName = candidate;
      }
    }

    // 2. Check heading inside #app
    if (!serverName) {
      var headings = document.querySelectorAll('#app h1, .showcase-breadcrumbs span:last-child');
      for (var i = 0; i < headings.length; i++) {
        var txt = (headings[i].textContent || '').trim();
        if (txt && txt.length < 48 && GENERIC_TITLES.indexOf(txt.toLowerCase()) === -1) {
          serverName = txt;
          break;
        }
      }
    }
    if (!serverName) serverName = 'Server ' + serverId.slice(0, 8);

    // Extract IP:Port from stat blocks or page text
    var bodyText = document.body ? (document.body.innerText || '') : '';
    var ipMatch = bodyText.match(/\b(?:\d{1,3}\.){3}\d{1,3}:\d{2,5}\b/);
    var serverAddress = ipMatch ? ipMatch[0] : '';

    // Determine live status from power buttons or text
    var status = 'online';
    var stopBtn = document.querySelector('button[data-relisys-power="stop"]');
    var startBtn = document.querySelector('button[data-relisys-power="start"]');
    if (stopBtn && stopBtn.disabled && startBtn && !startBtn.disabled) {
      status = 'offline';
    } else if (bodyText.indexOf('Offline') !== -1 && stopBtn && stopBtn.disabled) {
      status = 'offline';
    }

    return {
      id: serverId,
      name: serverName,
      address: serverAddress,
      status: status
    };
  }

  function isNavLinkActive(linkHref, currentServerId) {
    var cur = window.location.pathname.replace(/\/+$/, '') || '/';
    var target = (linkHref || '').replace(/\/+$/, '') || '/';

    if (target === '/') {
      return cur === '/';
    }
    if (currentServerId && target === '/server/' + currentServerId) {
      return cur === target;
    }
    return cur === target || cur.indexOf(target + '/') === 0;
  }

  function getDiscordUrl() {
    if (window.RelisysTheme && typeof window.RelisysTheme.getSettings === 'function') {
      var s = window.RelisysTheme.getSettings();
      if (s && s.discordUrl) return s.discordUrl;
    }
    return 'https://discord.gg';
  }

  function createSidebar() {
    if (window.location.pathname.indexOf('/auth/') !== -1) {
      var existing = document.getElementById('relisys-sidebar-root');
      if (existing) existing.remove();
      document.body.classList.remove('has-relisys-sidebar');
      return;
    }

    if (document.getElementById('relisys-sidebar-root')) return;

    var container = document.createElement('aside');
    container.id = 'relisys-sidebar-root';
    container.className = 'relisys-sidebar-wrapper' + (isCollapsed ? ' collapsed' : '');

    var server = extractServerInfo();
    container.setAttribute('data-server-id', server ? server.id : '');

    var showAdmin = !window.RelisysTheme || !window.RelisysTheme.isRootAdmin || window.RelisysTheme.isRootAdmin();

    var html =
      '<div class="relisys-sidebar-glass">' +
      '  <!-- Brand Header -->' +
      '  <div class="relisys-sb-brand">' +
      '    <a href="/" class="relisys-sb-brand-link" data-spa-link="true" title="Relisys Dashboard">' +
      '      <div class="relisys-sb-logo">' + ICONS.relisysLogo + '</div>' +
      '      <div class="relisys-sb-brand-text">' +
      '        <span class="relisys-sb-brand-title">RELISYS</span>' +
      '        <span class="relisys-sb-brand-sub">CONTROL PLANE</span>' +
      '      </div>' +
      '    </a>' +
      '    <button type="button" class="relisys-sb-collapse-btn relisys-btn-processed" id="relisys-sb-toggle-btn" title="' + (isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar') + '">' +
      '      ' + (isCollapsed ? ICONS.expand : ICONS.collapse) +
      '    </button>' +
      '  </div>' +

      '  <!-- Command Palette Trigger -->' +
      '  <div class="relisys-sb-search-wrap">' +
      '    <button type="button" class="relisys-sb-search-btn relisys-btn-processed" id="relisys-sb-cmd-trigger" title="Quick Jump (Ctrl+K)">' +
      '      ' + ICONS.search +
      '      <span class="relisys-sb-search-label">Quick Jump...</span>' +
      '      <kbd class="relisys-sb-search-kbd">Ctrl+K</kbd>' +
      '    </button>' +
      '  </div>' +

      '  <!-- Navigation Body -->' +
      '  <div class="relisys-sb-body">' +

      '    <!-- Global Nav Section -->' +
      '    <div class="relisys-sb-section">' +
      '      <div class="relisys-sb-section-title">PLATFORM</div>' +
      '      <ul class="relisys-sb-nav-list">' +
      '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/', server && server.id) ? ' active' : '') + '">' +
      '          <a href="/" class="relisys-sb-nav-link" data-spa-link="true" title="Servers Dashboard">' +
      '            <span class="relisys-sb-nav-icon">' + ICONS.servers + '</span>' +
      '            <span class="relisys-sb-nav-text">Servers</span>' +
      '          </a>' +
      '        </li>' +
      '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/account', server && server.id) ? ' active' : '') + '">' +
      '          <a href="/account" class="relisys-sb-nav-link" data-spa-link="true" title="Account Settings">' +
      '            <span class="relisys-sb-nav-icon">' + ICONS.account + '</span>' +
      '            <span class="relisys-sb-nav-text">Account</span>' +
      '          </a>' +
      '        </li>' +
      (showAdmin ?
      '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/admin', server && server.id) ? ' active' : '') + '" id="relisys-sb-admin-item">' +
      '          <a href="/admin" class="relisys-sb-nav-link" title="Admin Control Panel">' +
      '            <span class="relisys-sb-nav-icon relisys-accent-icon">' + ICONS.admin + '</span>' +
      '            <span class="relisys-sb-nav-text">Admin Panel</span>' +
      '          </a>' +
      '        </li>' : '') +
      '      </ul>' +
      '    </div>';

    if (server) {
      var sid = server.id;
      html +=
        '    <!-- Server Context Section -->' +
        '    <div class="relisys-sb-section relisys-sb-server-context">' +
        '      <div class="relisys-sb-section-title">SERVER CONSOLE</div>' +

        '      <!-- Server Mini Card -->' +
        '      <div class="relisys-sb-server-badge">' +
        '        <div class="relisys-sb-server-top">' +
        '          <span class="relisys-sb-server-status-dot ' + server.status + '" id="relisys-sb-live-dot"></span>' +
        '          <span class="relisys-sb-server-name" id="relisys-sb-live-name" title="' + server.name + '">' + server.name + '</span>' +
        '        </div>' +
        '        <div class="relisys-sb-server-ip" id="relisys-sb-copy-ip" data-ip="' + server.address + '" title="Click to copy IP" style="display:' + (server.address ? 'flex' : 'none') + ';">' +
        '          <span id="relisys-sb-live-ip">' + server.address + '</span>' +
        '          ' + ICONS.copy +
        '        </div>' +
        '      </div>' +

        '      <!-- Server Sub Tabs -->' +
        '      <ul class="relisys-sb-nav-list">' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid, sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '" class="relisys-sb-nav-link" data-spa-link="true" title="Terminal Console">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.terminal + '</span>' +
        '            <span class="relisys-sb-nav-text">Terminal</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/files', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/files" class="relisys-sb-nav-link" data-spa-link="true" title="File Manager">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.files + '</span>' +
        '            <span class="relisys-sb-nav-text">Files</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/databases', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/databases" class="relisys-sb-nav-link" data-spa-link="true" title="Databases">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.databases + '</span>' +
        '            <span class="relisys-sb-nav-text">Databases</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/schedules', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/schedules" class="relisys-sb-nav-link" data-spa-link="true" title="Schedules">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.schedules + '</span>' +
        '            <span class="relisys-sb-nav-text">Schedules</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/users', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/users" class="relisys-sb-nav-link" data-spa-link="true" title="Users & Access">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.users + '</span>' +
        '            <span class="relisys-sb-nav-text">Users</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/backups', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/backups" class="relisys-sb-nav-link" data-spa-link="true" title="Backups">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.backups + '</span>' +
        '            <span class="relisys-sb-nav-text">Backups</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/network', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/network" class="relisys-sb-nav-link" data-spa-link="true" title="Network Allocations">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.network + '</span>' +
        '            <span class="relisys-sb-nav-text">Network</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/startup', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/startup" class="relisys-sb-nav-link" data-spa-link="true" title="Startup Parameters">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.startup + '</span>' +
        '            <span class="relisys-sb-nav-text">Startup</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/settings', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/settings" class="relisys-sb-nav-link" data-spa-link="true" title="Server Settings">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.settings + '</span>' +
        '            <span class="relisys-sb-nav-text">Settings</span>' +
        '          </a>' +
        '        </li>' +
        '        <li class="relisys-sb-nav-item' + (isNavLinkActive('/server/' + sid + '/activity', sid) ? ' active' : '') + '">' +
        '          <a href="/server/' + sid + '/activity" class="relisys-sb-nav-link" data-spa-link="true" title="Activity Logs">' +
        '            <span class="relisys-sb-nav-icon">' + ICONS.activity + '</span>' +
        '            <span class="relisys-sb-nav-text">Activity</span>' +
        '          </a>' +
        '        </li>' +
        '      </ul>' +
        '    </div>';
    }

    html +=
      '  </div>' +

      '  <!-- Footer Utility Section -->' +
      '  <div class="relisys-sb-footer">' +
      '    <div class="relisys-sb-actions">' +
      '      <button type="button" class="relisys-sb-action-btn relisys-btn-processed" id="relisys-sb-studio-btn" title="Theme Studio">' +
      '        ' + ICONS.studio +
      '        <span class="relisys-sb-action-label">Theme Studio</span>' +
      '      </button>' +
      '      <a href="' + getDiscordUrl() + '" id="relisys-sb-discord-link" target="_blank" rel="noopener" class="relisys-sb-action-btn" title="Join Discord Community">' +
      '        ' + ICONS.discord +
      '        <span class="relisys-sb-action-label">Community</span>' +
      '      </a>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    container.innerHTML = html;
    document.body.prepend(container);
    document.body.classList.add('has-relisys-sidebar');
    if (isCollapsed) document.body.classList.add('relisys-sidebar-is-collapsed');

    // Intercept SPA links inside sidebar so navigation is instant without full page reload
    container.querySelectorAll('a[data-spa-link="true"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var href = link.getAttribute('href');
        if (href && document.getElementById('app') && window.RelisysTheme && window.RelisysTheme.navigateTo) {
          e.preventDefault();
          if (window.RelisysTheme.playSound) window.RelisysTheme.playSound('click');
          window.RelisysTheme.navigateTo(href);
          // Close mobile drawer if open
          container.classList.remove('mobile-open');
          var overlay = document.getElementById('relisys-mobile-overlay');
          if (overlay) overlay.classList.remove('active');
        }
      });
    });

    // Attach event listeners
    var toggleBtn = document.getElementById('relisys-sb-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        isCollapsed = !isCollapsed;
        container.classList.toggle('collapsed', isCollapsed);
        document.body.classList.toggle('relisys-sidebar-is-collapsed', isCollapsed);
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed ? 'true' : 'false');
        toggleBtn.innerHTML = isCollapsed ? ICONS.expand : ICONS.collapse;
        toggleBtn.setAttribute('title', isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar');
        if (window.RelisysTheme) window.RelisysTheme.playSound('click');
      });
    }

    var cmdTrigger = document.getElementById('relisys-sb-cmd-trigger');
    if (cmdTrigger) {
      cmdTrigger.addEventListener('click', function () {
        if (window.RelisysTheme && window.RelisysTheme.openPalette) {
          window.RelisysTheme.openPalette();
        }
      });
    }

    var studioBtn = document.getElementById('relisys-sb-studio-btn');
    if (studioBtn) {
      studioBtn.addEventListener('click', function () {
        if (window.RelisysTheme && window.RelisysTheme.openStudio) {
          window.RelisysTheme.openStudio();
        }
      });
    }

    var copyIp = document.getElementById('relisys-sb-copy-ip');
    if (copyIp) {
      copyIp.addEventListener('click', function () {
        var ip = copyIp.getAttribute('data-ip');
        if (ip && navigator.clipboard) {
          navigator.clipboard.writeText(ip).then(function () {
            copyIp.classList.add('copied');
            var span = copyIp.querySelector('span');
            var original = span.textContent;
            span.textContent = 'Copied!';
            if (window.RelisysTheme) window.RelisysTheme.playSound('click');
            setTimeout(function () {
              copyIp.classList.remove('copied');
              span.textContent = ip;
            }, 1800);
          });
        }
      });
    }

    initMobileHamburger();
  }

  function initMobileHamburger() {
    if (document.getElementById('relisys-mobile-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'relisys-mobile-toggle';
    btn.className = 'relisys-mobile-toggle-btn relisys-btn-processed';
    btn.setAttribute('aria-label', 'Toggle Menu');
    btn.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '  <line x1="3" y1="12" x2="21" y2="12"/>' +
      '  <line x1="3" y1="6" x2="21" y2="6"/>' +
      '  <line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>';

    var overlay = document.createElement('div');
    overlay.id = 'relisys-mobile-overlay';
    overlay.className = 'relisys-mobile-backdrop';

    btn.addEventListener('click', function () {
      var root = document.getElementById('relisys-sidebar-root');
      if (root) {
        var isOpen = root.classList.toggle('mobile-open');
        overlay.classList.toggle('active', isOpen);
        if (window.RelisysTheme) window.RelisysTheme.playSound('click');
      }
    });

    overlay.addEventListener('click', function () {
      var root = document.getElementById('relisys-sidebar-root');
      if (root) root.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
  }

  function syncLiveServerBadge(server) {
    if (!server) return;
    var nameNode = document.getElementById('relisys-sb-live-name');
    if (nameNode && server.name && nameNode.textContent !== server.name) {
      nameNode.textContent = server.name;
      nameNode.setAttribute('title', server.name);
    }
    var ipBox = document.getElementById('relisys-sb-copy-ip');
    var ipText = document.getElementById('relisys-sb-live-ip');
    if (ipBox && ipText && server.address && !ipBox.classList.contains('copied')) {
      ipBox.setAttribute('data-ip', server.address);
      ipBox.style.display = 'flex';
      if (ipText.textContent !== server.address) {
        ipText.textContent = server.address;
      }
    }
    var dotNode = document.getElementById('relisys-sb-live-dot');
    if (dotNode) {
      dotNode.className = 'relisys-sb-server-status-dot ' + server.status;
    }
  }

  function updateSidebarState() {
    var root = document.getElementById('relisys-sidebar-root');
    if (!root) {
      createSidebar();
      return;
    }

    var server = extractServerInfo();
    var currentServerId = server ? server.id : '';
    var renderedServerId = root.getAttribute('data-server-id') || '';

    // Rebuild if switching between dashboard and server OR switching from Server A to Server B
    if (currentServerId !== renderedServerId) {
      root.remove();
      createSidebar();
      return;
    }

    if (server) {
      syncLiveServerBadge(server);
    }

    // Update active state on all navigation items
    root.querySelectorAll('.relisys-sb-nav-item').forEach(function (item) {
      var link = item.querySelector('a');
      if (!link) return;
      var href = link.getAttribute('href');
      item.classList.toggle('active', isNavLinkActive(href, currentServerId));
    });
  }

  // Listen for theme changes (e.g., Discord link updated)
  window.addEventListener('relisys:theme-changed', function (e) {
    var discordLink = document.getElementById('relisys-sb-discord-link');
    if (discordLink && e.detail && e.detail.discordUrl) {
      discordLink.setAttribute('href', e.detail.discordUrl);
    }
  });

  // Intercept HTML5 history pushState & replaceState for instant updates
  var origPush = history.pushState;
  history.pushState = function () {
    var ret = origPush.apply(this, arguments);
    setTimeout(updateSidebarState, 30);
    return ret;
  };

  var origReplace = history.replaceState;
  history.replaceState = function () {
    var ret = origReplace.apply(this, arguments);
    setTimeout(updateSidebarState, 30);
    return ret;
  };

  window.addEventListener('popstate', function () {
    setTimeout(updateSidebarState, 30);
  });

  // Periodic sync for server title / IP once React finishes fetching server details
  setInterval(updateSidebarState, 800);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSidebar);
  } else {
    createSidebar();
  }
})();
