/**
 * Relisys Dynamic Chart.js Restyling Engine
 * Connects directly with Relisys Theme variables and live updates on accent change
 * Author: Mohamed Khire
 * Version: 2.0.0
 */
(function () {
  'use strict';

  function getThemeColors() {
    var root = getComputedStyle(document.documentElement);
    var accent = root.getPropertyValue('--relisys-accent').trim() || '#6366f1';
    var rgb = root.getPropertyValue('--relisys-accent-rgb').trim() || '99, 102, 241';
    return {
      colors: [accent, '#38bdf8', '#a855f7', '#10b981'],
      fills: [
        ['rgba(' + rgb + ', 0.35)', 'rgba(' + rgb + ', 0.0)'],
        ['rgba(56, 189, 248, 0.30)', 'rgba(56, 189, 248, 0.0)'],
        ['rgba(168, 85, 247, 0.25)', 'rgba(168, 85, 247, 0.0)'],
        ['rgba(16, 185, 129, 0.25)', 'rgba(16, 185, 129, 0.0)']
      ]
    };
  }

  var activeCharts = [];

  function datasetsOf(chart) {
    if (chart.data && chart.data.datasets) return chart.data.datasets;
    if (chart.config && chart.config.data && chart.config.data.datasets) return chart.config.data.datasets;
    return [];
  }

  function gradient(chart, index, theme) {
    var ctx = chart.ctx || (chart.chart && chart.chart.ctx);
    if (!ctx || typeof ctx.createLinearGradient !== 'function') {
      return theme.fills[index % theme.fills.length][0];
    }
    var area = chart.chartArea || { top: 0, bottom: chart.height || 140 };
    var top = area.top || 0;
    var bottom = area.bottom || chart.height || 140;
    if (bottom <= top) bottom = top + 140;

    var g = ctx.createLinearGradient(0, top, 0, bottom);
    var stops = theme.fills[index % theme.fills.length];
    g.addColorStop(0, stops[0]);
    g.addColorStop(1, stops[1]);
    return g;
  }

  function restyle(chart) {
    if (!chart || !chart.options) return;
    var theme = getThemeColors();

    chart.options.animation = false;
    chart.options.responsive = true;
    chart.options.maintainAspectRatio = false;

    chart.options.elements = chart.options.elements || {};
    chart.options.elements.line = Object.assign({}, chart.options.elements.line, {
      tension: 0.42,
      borderWidth: 2.5,
      borderJoinStyle: 'round',
      capBezierPoints: true
    });
    chart.options.elements.point = Object.assign({}, chart.options.elements.point, {
      radius: 0,
      hoverRadius: 5,
      hoverBorderWidth: 2,
      hitRadius: 10
    });

    var scales = chart.options.scales || {};
    ['x', 'y', 'xAxes', 'yAxes'].forEach(function (key) {
      var scale = scales[key];
      if (!scale) return;
      var list = Array.isArray(scale) ? scale : [scale];
      list.forEach(function (s) {
        s.grid = Object.assign({}, s.grid, {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'transparent',
          drawBorder: false,
          tickLength: 0
        });
        s.gridLines = Object.assign({}, s.gridLines, {
          color: 'rgba(255, 255, 255, 0.05)',
          zeroLineColor: 'transparent',
          drawBorder: false
        });
        s.ticks = Object.assign({}, s.ticks, {
          color: '#64748b',
          fontColor: '#64748b',
          padding: 8,
          font: { size: 11, family: 'Inter, system-ui, sans-serif' }
        });
      });
    });

    // Dark Glass Tooltip
    chart.options.plugins = chart.options.plugins || {};
    chart.options.plugins.legend = { display: false };
    chart.options.plugins.tooltip = Object.assign({}, chart.options.plugins.tooltip, {
      enabled: true,
      backgroundColor: 'rgba(15, 18, 28, 0.94)',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 10,
      displayColors: true,
      boxPadding: 5
    });

    // Datasets
    datasetsOf(chart).forEach(function (ds, i) {
      ds.borderColor = theme.colors[i % theme.colors.length];
      ds.backgroundColor = gradient(chart, i, theme);
      ds.fill = true;
      ds.pointBackgroundColor = theme.colors[i % theme.colors.length];
      ds.pointBorderColor = '#0b0d14';
      ds.pointRadius = 0;
      ds.pointHoverRadius = 5;
      ds.borderWidth = 2.5;
      ds.lineTension = 0.42;
    });

    if (activeCharts.indexOf(chart) === -1) {
      activeCharts.push(chart);
    }
  }

  function fiber(el) {
    var key = Object.keys(el).find(function (k) {
      return k.indexOf('__reactFiber$') === 0 || k.indexOf('__reactInternalInstance$') === 0;
    });
    return key ? el[key] : null;
  }

  function fromCanvas(canvas) {
    if (window.Chart && typeof window.Chart.getChart === 'function') {
      var direct = window.Chart.getChart(canvas);
      if (direct) return direct;
    }
    if (canvas.chart && canvas.chart.data) return canvas.chart;
    var node = fiber(canvas);
    var depth = 0;
    while (node && depth < 60) {
      var state = node.stateNode;
      if (state) {
        if (state.config && state.data && typeof state.update === 'function') return state;
        if (state.chart && state.chart.data && typeof state.chart.update === 'function') return state.chart;
      }
      node = node.return;
      depth += 1;
    }
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (ctx && ctx.$chartjs && ctx.$chartjs.chart) return ctx.$chartjs.chart;
    return null;
  }

  function scan() {
    document.querySelectorAll('canvas').forEach(function (canvas) {
      var chart = fromCanvas(canvas);
      if (!chart) return;
      try {
        restyle(chart);
        if (typeof chart.update === 'function') chart.update('none');
      } catch (e) {}
    });
  }

  // Live theme change listener
  window.addEventListener('relisys:theme-changed', function () {
    activeCharts.forEach(function (chart) {
      try {
        restyle(chart);
        if (typeof chart.update === 'function') chart.update('none');
      } catch (e) {}
    });
    scan();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  setInterval(scan, 3000);
})();
