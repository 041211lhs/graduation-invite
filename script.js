(function () {
  'use strict';

  var state = {
    name: '',
    letter: '',
    attendance: null // '예' | '아니요' | null
  };

  var historyStack = [];

  function showStep(stepName) {
    var steps = document.querySelectorAll('.step');
    steps.forEach(function (el) {
      el.classList.remove('active', 'show');
    });
    var target = document.querySelector('.step[data-step="' + stepName + '"]');
    if (!target) return;
    target.classList.add('active');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        target.classList.add('show');
      });
    });
    window.scrollTo(0, 0);
  }

  function currentStepName() {
    var current = document.querySelector('.step.active');
    return current ? current.getAttribute('data-step') : null;
  }

  function goTo(stepName) {
    var current = currentStepName();
    if (current) historyStack.push(current);
    showStep(stepName);
  }

  function goBack() {
    var prev = historyStack.pop();
    if (prev) showStep(prev);
  }

  var MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function initCover() {
    var frame = document.getElementById('cover-photo-frame');

    var inner = document.createElement('div');
    inner.className = 'photo-inner';
    if (CONFIG.COVER_PHOTO) {
      var img = document.createElement('img');
      img.src = CONFIG.COVER_PHOTO;
      img.alt = '이현서';
      inner.appendChild(img);
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'photo-placeholder';
      placeholder.innerHTML = '<div class="icon">🎓</div><div>사진이 곧 채워질 거예요</div>';
      inner.appendChild(placeholder);
    }
    frame.appendChild(inner);

    var badgeLabel = 'GRADUATION · ' + MONTH_ABBR[CONFIG.CEREMONY_DATE.month] + ' ' + CONFIG.CEREMONY_DATE.day + ' · ';
    var repeated = (badgeLabel + badgeLabel + badgeLabel);
    var badge = document.createElement('div');
    badge.className = 'orbit-badge';
    badge.innerHTML =
      '<svg viewBox="0 0 120 120">' +
        '<defs><path id="orbitPath" d="M 60,60 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0" /></defs>' +
        '<text><textPath href="#orbitPath">' + repeated + '</textPath></text>' +
      '</svg>';
    frame.appendChild(badge);
  }

  function initCalendar() {
    document.getElementById('ceremony-label').textContent = CONFIG.CEREMONY_LABEL + ' 졸업식';

    var target = new Date(CONFIG.CEREMONY_DATE.year, CONFIG.CEREMONY_DATE.month, CONFIG.CEREMONY_DATE.day);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    var ddayEl = document.getElementById('dday-text');
    if (diff > 0) ddayEl.textContent = 'D-' + diff;
    else if (diff === 0) ddayEl.textContent = 'D-DAY';
    else ddayEl.textContent = 'D+' + Math.abs(diff);

    var grid = document.getElementById('calendar-grid');
    var dows = ['일', '월', '화', '수', '목', '금', '토'];
    var html = '';
    dows.forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });

    var year = CONFIG.CEREMONY_DATE.year;
    var month = CONFIG.CEREMONY_DATE.month;
    var firstDay = new Date(year, month, 1).getDay();
    var lastDate = new Date(year, month + 1, 0).getDate();

    for (var i = 0; i < firstDay; i++) {
      html += '<div class="day empty"></div>';
    }
    for (var d2 = 1; d2 <= lastDate; d2++) {
      var cls = 'day' + (d2 === CONFIG.CEREMONY_DATE.day ? ' highlight' : '');
      html += '<div class="' + cls + '">' + d2 + '</div>';
    }
    grid.innerHTML = html;
  }

  function initGalleryEnd() {
    var grid = document.getElementById('gallery-grid');
    var photos = CONFIG.GALLERY_PHOTOS || [];
    var html = '';
    for (var i = 0; i < 9; i++) {
      var photo = photos[i];
      if (photo) {
        html += '<div class="cell"><img src="' + photo.src + '" alt="' + photo.caption + '" loading="lazy" draggable="false">' +
          '<div class="caption">' + photo.caption + '</div></div>';
      } else {
        html += '<div class="cell"><div class="num">' + (i + 1) + '</div></div>';
      }
    }
    grid.innerHTML = html;
  }

  // 사진 꾹 누르기(저장)·우클릭·끌어가기를 막습니다. 화면 캡처 자체는 웹에서 막을 수 없어요.
  function blockImageSaving() {
    ['contextmenu', 'dragstart'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        if (e.target.tagName === 'IMG' || (e.target.closest && e.target.closest('.gallery-grid, .photo-frame'))) e.preventDefault();
      });
    });
  }

  function initPlace() {
    document.getElementById('place-name').textContent = CONFIG.CEREMONY_PLACE;
    var addressEl = document.getElementById('place-address');
    if (CONFIG.CEREMONY_ADDRESS) {
      addressEl.textContent = CONFIG.CEREMONY_ADDRESS;
    } else {
      addressEl.style.display = 'none';
    }

    var mapBox = document.getElementById('map');
    if (CONFIG.MAP_PHOTO) {
      var img = document.createElement('img');
      img.src = CONFIG.MAP_PHOTO;
      img.alt = CONFIG.CEREMONY_PLACE + ' 지도';
      mapBox.appendChild(img);
    } else {
      mapBox.innerHTML = '<div class="photo-placeholder"><div class="icon">📍</div><div>지도 사진이 곧 채워질 거예요</div></div>';
    }
  }

  function initAttendanceQuestion() {
    document.getElementById('attendance-question').textContent =
      CONFIG.CEREMONY_LABEL + ' 졸업식에 참여할 수 있나요?';
  }

  function initCopyLink() {
    document.getElementById('copy-link-btn').addEventListener('click', function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          alert('링크가 복사되었어요.');
        }).catch(function () {
          fallbackCopy(url);
        });
      } else {
        fallbackCopy(url);
      }
    });
  }

  function fallbackCopy(text) {
    var temp = document.createElement('input');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); alert('링크가 복사되었어요.'); }
    catch (e) { alert('복사에 실패했어요. 주소창의 링크를 직접 복사해주세요.'); }
    document.body.removeChild(temp);
  }

  function initNavButtons() {
    document.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goTo(btn.getAttribute('data-next'));
      });
    });
    document.querySelectorAll('[data-back]').forEach(function (btn) {
      btn.addEventListener('click', goBack);
    });
  }

  function initAttendanceToggle() {
    var yesBtn = document.getElementById('attend-yes-btn');
    var noBtn = document.getElementById('attend-no-btn');

    function select(value) {
      state.attendance = value;
      yesBtn.classList.toggle('selected', value === '예');
      noBtn.classList.toggle('selected', value === '아니요');
    }

    yesBtn.addEventListener('click', function () { select('예'); });
    noBtn.addEventListener('click', function () { select('아니요'); });
  }

  function initLetterForm() {
    var nameInput = document.getElementById('input-name');
    var letterInput = document.getElementById('input-letter');
    var charCount = document.getElementById('char-count');
    var errorText = document.getElementById('letter-error');
    var submitBtn = document.getElementById('letter-submit-btn');

    letterInput.addEventListener('input', function () {
      charCount.textContent = letterInput.value.length;
    });

    submitBtn.addEventListener('click', function () {
      var name = nameInput.value.trim();
      var letter = letterInput.value.trim();

      if (!name) { errorText.textContent = '이름을 입력해주세요.'; return; }
      if (!letter) { errorText.textContent = '편지 내용을 입력해주세요.'; return; }
      if (!state.attendance) { errorText.textContent = '참석 여부를 선택해주세요.'; return; }

      errorText.textContent = '';
      state.name = name;
      state.letter = letter;

      if (state.attendance === '아니요') {
        setSubmitting(true);
        sendToSheet({ name: name, letter: letter, attendance: '아니요', option: '' })
          .then(function (res) {
            if (res && res.result === 'success') {
              goTo('end');
            } else {
              throw new Error((res && res.message) || '저장에 실패했어요.');
            }
          })
          .catch(function () {
            errorText.textContent = '전송 중 문제가 생겼어요. 인터넷 연결을 확인하고 다시 시도해주세요.';
          })
          .finally(function () { setSubmitting(false); });
      } else {
        goTo('options');
      }
    });

    function setSubmitting(isSubmitting) {
      submitBtn.disabled = isSubmitting;
      submitBtn.textContent = isSubmitting ? '전송 중...' : '확인';
    }
  }

  function initOptions() {
    var errorText = document.getElementById('options-error');
    var buttons = document.querySelectorAll('.option-btn');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.disabled = true; });
        errorText.textContent = '';

        sendToSheet({
          name: state.name,
          letter: state.letter,
          attendance: '예',
          option: btn.getAttribute('data-option')
        })
          .then(function (res) {
            if (res && res.result === 'success') {
              goTo('end');
            } else {
              throw new Error((res && res.message) || '저장에 실패했어요.');
            }
          })
          .catch(function () {
            errorText.textContent = '전송 중 문제가 생겼어요. 인터넷 연결을 확인하고 다시 시도해주세요.';
            buttons.forEach(function (b) { b.disabled = false; });
          });
      });
    });
  }

  function showSending(on) {
    document.getElementById('sending').classList.toggle('on', on);
  }

  function sendToSheet(payload) {
    showSending(true);
    return fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .finally(function () { showSending(false); });
  }

  if (!Promise.prototype.finally) {
    Promise.prototype.finally = function (callback) {
      return this.then(
        function (value) { callback(); return value; },
        function (reason) { callback(); throw reason; }
      );
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCover();
    blockImageSaving();
    initCalendar();
    initGalleryEnd();
    initPlace();
    initAttendanceQuestion();
    initCopyLink();
    initNavButtons();
    initAttendanceToggle();
    initLetterForm();
    initOptions();
  });
})();
