// 사이트 전체 설정값 모음 — 나중에 값만 바꾸면 됩니다.
const CONFIG = {
  // Google Apps Script 웹앱 주소 (구글 시트와 연결된 저장소 주소)
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxnme_fyoKvEklruZGnW5upY6j2aAqqWbKX-w1GzNtkcixr_50gAgiXiVg4roEr4yICdg/exec',

  // 관리자 비밀번호는 여기 두지 않습니다 — 구글 Apps Script의 '스크립트 속성'에만 저장돼요.

  // 졸업식 날짜 (연, 월-1, 일) — JS Date 규칙상 월은 0부터 시작(2월=1)
  CEREMONY_DATE: { year: 2027, month: 1, day: 19 },
  CEREMONY_LABEL: '2027년 2월 19일 (금)',
  CEREMONY_PLACE: '창원대학교 운동장',
  CEREMONY_ADDRESS: '경남 창원시 의창구 용동',

  // 지도 사진 — 비워두면 placeholder가 보입니다. 예: 'assets/map.jpg'
  MAP_PHOTO: 'assets/map.jpg',

  // 사진 설정 — 아직 실제 사진이 없으므로 비워둠. 나중에 파일을 assets 폴더에 넣고
  // 아래 경로를 채우면 자동으로 사진이 보이고, 비워두면 예쁜 placeholder가 보입니다.
  COVER_PHOTO: 'assets/cover.jpg',
  // 갤러리 — 폴라로이드 3×3, 위에서부터 순서대로 (최대 9장). caption은 사진 아래 글씨
  GALLERY_PHOTOS: [
    { src: 'assets/gallery-1.jpg', caption: '경제학술동아리' },
    { src: 'assets/gallery-2.jpg', caption: '베트남 METALEX 2025' },
    { src: 'assets/gallery-3.jpg', caption: '라스베가스 CES 2026' },
    { src: 'assets/gallery-4.jpg', caption: '프랑스 교환학생 친구들과 서울 나들이' },
    { src: 'assets/gallery-5.jpg', caption: '방산중소기업 말레이시아 수출 상담회' },
    { src: 'assets/gallery-6.jpg', caption: '제주도 다이빙' },
    { src: 'assets/gallery-7.jpg', caption: 'CNUSS에서의 네 번째 거제' },
    { src: 'assets/gallery-8.jpg', caption: '캐나다 단기 어학연수' },
    { src: 'assets/gallery-9.jpg', caption: '다문화 멘토링' }
  ]
};
