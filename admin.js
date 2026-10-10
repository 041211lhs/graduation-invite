(function () {
  'use strict';

  var cachedRows = [];

  function initGate() {
    document.getElementById('gate-submit').addEventListener('click', tryUnlock);
    document.getElementById('gate-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
  }

  // 비밀번호 확인은 서버(Apps Script)에서만 합니다. 이 파일에는 비밀번호가 없어요.
  function tryUnlock() {
    var input = document.getElementById('gate-password');
    var errorEl = document.getElementById('gate-error');
    var button = document.getElementById('gate-submit');
    errorEl.textContent = '';
    button.disabled = true;

    fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'admin', password: input.value })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.error === 'locked') {
          errorEl.textContent = '시도가 너무 많아요. 10분 뒤에 다시 해주세요.';
          return;
        }
        if (res.error) {
          errorEl.textContent = '비밀번호가 올바르지 않아요.';
          return;
        }
        input.value = '';
        document.getElementById('gate').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        cachedRows = res.rows || [];
        renderSummary(cachedRows);
        renderList(cachedRows);
      })
      .catch(function () {
        errorEl.textContent = '서버에 연결하지 못했어요. 인터넷 연결을 확인해주세요.';
      })
      .then(function () { button.disabled = false; });
  }

  function renderSummary(rows) {
    var total = rows.length;
    var yes = rows.filter(function (r) { return r.attendance === '예'; }).length;
    var no = rows.filter(function (r) { return r.attendance === '아니요'; }).length;
    var pending = total - yes - no;

    var optionCounts = {
      '같이 사진만 찍기': 0,
      '같이 사진찍고 밥먹기': 0,
      '같이 밥만 먹기': 0
    };
    rows.forEach(function (r) {
      if (optionCounts.hasOwnProperty(r.option)) optionCounts[r.option]++;
    });

    var cards = [
      { num: total, label: '전체 응답' },
      { num: yes, label: '참석' },
      { num: no, label: '불참' },
      { num: pending, label: '응답 대기' },
      { num: optionCounts['같이 사진만 찍기'], label: '사진만' },
      { num: optionCounts['같이 사진찍고 밥먹기'], label: '사진+식사' },
      { num: optionCounts['같이 밥만 먹기'], label: '식사만' }
    ];

    document.getElementById('summary-grid').innerHTML = cards.map(function (c) {
      return '<div class="summary-card"><div class="num">' + c.num + '</div><div class="label">' + c.label + '</div></div>';
    }).join('');
  }

  function badgeFor(attendance) {
    if (attendance === '예') return '<span class="badge badge-yes">참석</span>';
    if (attendance === '아니요') return '<span class="badge badge-no">불참</span>';
    return '<span class="badge badge-pending">응답 대기</span>';
  }

  function renderList(rows) {
    var sorted = rows.slice().sort(function (a, b) {
      return new Date(b.time) - new Date(a.time);
    });

    if (!sorted.length) {
      document.getElementById('response-list').innerHTML = '<div class="empty-msg">아직 도착한 편지가 없어요.</div>';
      return;
    }

    document.getElementById('response-list').innerHTML = sorted.map(function (r, i) {
      var timeStr = formatTime(r.time);
      var optionHtml = r.option ? '<div class="card-option">' + escapeHtml(r.option) + '</div>' : '';
      return (
        '<div class="card">' +
          '<div class="card-top">' +
            '<div><div class="card-name">' + escapeHtml(r.name) + '</div>' +
            '<div class="card-time">' + timeStr + '</div></div>' +
            badgeFor(r.attendance) +
          '</div>' +
          optionHtml +
          '<div class="card-letter" id="letter-' + i + '">' + escapeHtml(r.letter) + '</div>' +
          '<button class="card-toggle" data-target="letter-' + i + '">전체 편지 보기</button>' +
        '</div>'
      );
    }).join('');

    document.querySelectorAll('.card-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var el = document.getElementById(btn.getAttribute('data-target'));
        el.classList.toggle('expanded');
        btn.textContent = el.classList.contains('expanded') ? '접기' : '전체 편지 보기';
      });
    });
  }

  function formatTime(t) {
    var d = new Date(t);
    if (isNaN(d.getTime())) return '';
    var pad = function (n) { return n < 10 ? '0' + n : n; };
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function exportCsv() {
    var header = ['시간', '이름', '참석여부', '선택', '편지'];
    var lines = [header.join(',')];

    cachedRows.forEach(function (r) {
      var row = [formatTime(r.time), r.name, r.attendance || '', r.option || '', r.letter || ''];
      lines.push(row.map(csvEscape).join(','));
    });

    var csvContent = '﻿' + lines.join('\r\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '졸업초대장_응답.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function csvEscape(value) {
    var str = String(value === undefined || value === null ? '' : value);
    if (/[",\n]/.test(str)) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGate();
    document.getElementById('export-btn').addEventListener('click', exportCsv);
  });
})();
