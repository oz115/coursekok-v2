/**
 * src/data/mockData.js
 * ─────────────────────────────────────────────────
 * 코스콕 UI kit — 목 데이터 (한국관광공사 API + TripLog 모사)
 *
 * 원본 출처: raw-wireframe/output/scripts/mock_data_for_the_UI_kit_...js
 * 변환: window.KK.* 전역 → ES Module named exports
 *
 * 사용법:
 *   import { regions, categories, places, tripLogs, comments, aiPlan, moveModes, journalSeed } from '@/data/mockData'
 * ─────────────────────────────────────────────────
 */

// ── 이미지 해결 헬퍼 ──────────────────────────────────────────────────────────
// 실제 프로덕션에서는 window.__resources(번들러가 주입하는 Base64 blob URL)를 사용하고,
// 개발 환경에서는 picsum.photos 더미 이미지로 폴백한다.
const img = (seed) =>
  (typeof window !== 'undefined' && window.__resources?.['img_' + seed]) ||
  `https://picsum.photos/seed/${seed}/800/600`;

// ── 지역 목록 ─────────────────────────────────────────────────────────────────
export const regions = ['전체', '서울', '제주', '부산', '강릉', '경주', '여수', '전주'];

// ── 카테고리 목록 ──────────────────────────────────────────────────────────────
// icon 필드는 src/components/icons/index.js 의 아이콘 이름에 대응
export const categories = [
  { key: 'all',  label: '전체',  icon: 'compass'      },
  { key: 'spot', label: '관광지', icon: 'mountain'     },
  { key: 'food', label: '음식점', icon: 'utensils'     },
  { key: 'stay', label: '숙박',   icon: 'bed'          },
  { key: 'fest', label: '축제',   icon: 'sparkles'     },
];

// ── 장소 데이터 ───────────────────────────────────────────────────────────────
export const places = [
  {
    id: 'p1', cat: '관광지', title: '성산일출봉', region: '제주 서귀포시',
    rating: 4.8, reviews: 1204, meta: '차로 15분',
    img: img('seongsan'),
    tags: ['일출', '유네스코', '오름'],
    desc: '제주 동쪽 끝, 바다 위로 솟은 분화구. 이른 아침 일출 명소로 사랑받는 곳이에요.',
  },
  {
    id: 'p2', cat: '관광지', title: '협재 해변', region: '제주 한림읍',
    rating: 4.7, reviews: 980, meta: '차로 8분',
    img: img('hyeopjae'),
    tags: ['에메랄드빛', '해변', '산책'],
    desc: '비양도를 배경으로 한 에메랄드빛 바다. 가족 단위 여행객에게 인기.',
  },
  {
    id: 'p3', cat: '음식점', title: '올레 국수', region: '제주 제주시',
    rating: 4.6, reviews: 642, meta: '도보 3분',
    img: img('noodle'),
    tags: ['고기국수', '현지맛집', '웨이팅'],
    desc: '진한 돼지 육수의 제주식 고기국수. 점심엔 웨이팅이 있어요.',
  },
  {
    id: 'p4', cat: '숙박', title: '바다뷰 스테이', region: '제주 서귀포시',
    rating: 4.9, reviews: 312, meta: '체크인 15시',
    img: img('staysea'),
    tags: ['오션뷰', '조식', '감성숙소'],
    desc: '통창 너머로 바다가 펼쳐지는 부티크 스테이. 조식 포함.',
  },
  {
    id: 'p5', cat: '축제', title: '제주 들불축제', region: '제주 애월읍',
    rating: 4.5, reviews: 220, meta: '3월',
    img: img('festival'),
    tags: ['봄축제', '야간', '불꽃'],
    desc: '오름에 불을 놓아 한 해의 안녕을 비는 제주의 대표 봄 축제.',
  },
  {
    id: 'p6', cat: '관광지', title: '카멜리아 힐', region: '제주 안덕면',
    rating: 4.6, reviews: 540, meta: '차로 20분',
    img: img('camellia'),
    tags: ['수목원', '포토', '동백'],
    desc: '동백과 야생화가 가득한 수목원. 계절마다 다른 풍경.',
  },
  {
    id: 'p7', cat: '음식점', title: '해녀의 부엌', region: '제주 구좌읍',
    rating: 4.7, reviews: 410, meta: '예약 필수',
    img: img('haenyeo'),
    tags: ['해산물', '공연', '로컬'],
    desc: '해녀 이야기를 곁들인 다이닝. 예약제로 운영돼요.',
  },
  {
    id: 'p8', cat: '관광지', title: '사려니 숲길', region: '제주 조천읍',
    rating: 4.8, reviews: 720, meta: '상시 개방',
    img: img('saryeoni'),
    tags: ['삼나무', '트레킹', '힐링'],
    desc: '삼나무가 늘어선 평탄한 숲길. 산책과 명상에 좋아요.',
  },
];

// ── TripLog (커뮤니티 피드) ───────────────────────────────────────────────────
export const tripLogs = [
  {
    id: 't1',
    title: '제주 동쪽만 콕콕 찍은 2박 3일',
    author: '지민',
    avatar: 'jimin',
    region: '제주',
    period: '2박 3일',
    style: '힐링',
    cover: img('jejueast'),
    photos: [img('jejueast'), img('seongsan'), img('saryeoni'), img('hyeopjae')],
    route: ['성산일출봉', '협재 해변', '사려니 숲길'],
    rating: 4.8,
    likes: 342,
    saves: 128,
    comments: 24,
    days: 3,
    places: 8,
    date: '3일 전',
    excerpt: '오름과 바다 위주로 천천히 돌았어요. 성산에서 일출 보고 사려니에서 숲멍...',
    liked: false,
  },
  {
    id: 't2',
    title: '부산 미식 여행, 먹으러 갑니다',
    author: '서연',
    avatar: 'seoyeon',
    region: '부산',
    period: '1박 2일',
    style: '미식',
    cover: img('busanfood'),
    photos: [img('busanfood'), img('noodle'), img('haenyeo'), img('busanfood')],
    route: ['자갈치시장', '밀면집', '돼지국밥'],
    rating: 4.6,
    likes: 210,
    saves: 76,
    comments: 12,
    days: 2,
    places: 6,
    date: '1주 전',
    excerpt: '밀면부터 돼지국밥, 씨앗호떡까지. 칼로리는 잠시 잊기로 했어요.',
    liked: false,
  },
  {
    id: 't3',
    title: '강릉 카페투어 + 바다멍',
    author: '현우',
    avatar: 'hyunwoo',
    region: '강릉',
    period: '당일치기',
    style: '감성',
    cover: img('gangneung'),
    photos: [img('gangneung'), img('camellia'), img('staysea'), img('gangneung')],
    route: ['안목해변', '커피거리', '경포호'],
    rating: 4.9,
    likes: 156,
    saves: 54,
    comments: 8,
    days: 1,
    places: 5,
    date: '2주 전',
    excerpt: '안목해변 커피거리에서 시작해 경포까지. 파도 소리 BGM 최고.',
    liked: true,
  },
  {
    id: 't4',
    title: '서울 야경 투어 - 한강공원 야경 명소',
    author: '영희',
    avatar: 'younghee',
    region: '서울',
    period: '당일치기',
    style: '야경',
    cover: img('seoul'),
    photos: [img('seoul'), img('hangang'), img('tower'), img('seoul')],
    route: ['반포대교', '여의도 공원', '서울타워'],
    rating: 4.7,
    likes: 298,
    saves: 112,
    comments: 18,
    days: 1,
    places: 4,
    date: '5일 전',
    excerpt: '야경 스팟만 콕콕 찍었어요. 사진 좋게 나오는 팁도 공유합니다!',
    liked: false,
  },
  {
    id: 't5',
    title: '경주 역사 여행 - 불국사와 석굴암',
    author: '민준',
    avatar: 'minjun',
    region: '경주',
    period: '1박 2일',
    style: '역사',
    cover: img('gyeongju'),
    photos: [img('gyeongju'), img('seokguram'), img('bulguksa'), img('gyeongju')],
    route: ['불국사', '석굴암', '대릉원'],
    rating: 4.5,
    likes: 178,
    saves: 89,
    comments: 14,
    days: 2,
    places: 5,
    date: '1주 전',
    excerpt: '천년의 역사를 품은 경주. 문화유산 투어로 힐링하고 왔습니다.',
    liked: false,
  },
];

// ── 댓글 ─────────────────────────────────────────────────────────────────────
export const comments = [
  { id: 'c1', author: '하늘', avatar: 'haneul', text: '성산 일출 진짜 인생샷이죠 😍 저도 담아갈게요!', time: '2시간 전', likes: 12 },
  { id: 'c2', author: '준',   avatar: 'jun',    text: '사려니 숲길 주차 어디에 하셨어요? 참고하고 싶어요', time: '5시간 전', likes: 3  },
  { id: 'c3', author: '민지', avatar: 'minji',  text: '코스 담아서 다음 주에 똑같이 가보려구요 ㅎㅎ',   time: '1일 전',  likes: 8  },
];

// ── AI 생성 일정표 ─────────────────────────────────────────────────────────────
// move: 직전 장소 → 이 장소 이동 정보 { mode, time, cost }
// cost: 이 장소 1인 예상 비용 (입장료/식대/숙박 등, 단위: 원)
export const aiPlan = {
  period: '2박 3일',
  style: '힐링',
  days: [
    {
      day: 1, theme: '바다와 일출',
      items: [
        { time: '09:00', title: '협재 해변',   cat: '관광지', note: '에메랄드빛 바다 산책',  img: img('hyeopjae'), cost: 0,      move: { mode: '차', time: '공항에서 40분', cost: 0 } },
        { time: '12:30', title: '올레 국수',   cat: '음식점', note: '점심 — 고기국수',       img: img('noodle'),   cost: 9000,  move: { mode: '차', time: '25분',       cost: 0 } },
        { time: '15:00', title: '카멜리아 힐', cat: '관광지', note: '수목원 포토 타임',       img: img('camellia'), cost: 10000, move: { mode: '차', time: '15분',       cost: 0 } },
        { time: '19:00', title: '바다뷰 스테이', cat: '숙박', note: '체크인 · 휴식',         img: img('staysea'),  cost: 180000, move: { mode: '차', time: '30분',      cost: 0 } },
      ],
    },
    {
      day: 2, theme: '숲과 로컬',
      items: [
        { time: '10:00', title: '사려니 숲길',  cat: '관광지', note: '숲멍 트레킹',           img: img('saryeoni'), cost: 0,     move: { mode: '차', time: '숙소에서 35분', cost: 0 } },
        { time: '13:00', title: '해녀의 부엌',  cat: '음식점', note: '예약 다이닝 + 공연',    img: img('haenyeo'),  cost: 65000, move: { mode: '차', time: '20분',       cost: 0 } },
        { time: '17:30', title: '성산일출봉',   cat: '관광지', note: '노을 무렵 산책',         img: img('seongsan'), cost: 5000,  move: { mode: '차', time: '40분',       cost: 0 } },
      ],
    },
    {
      day: 3, theme: '마무리',
      items: [
        { time: '06:00', title: '성산일출봉',   cat: '관광지', note: '일출 보기',              img: img('seongsan'), cost: 0,    move: { mode: '도보', time: '숙소에서 5분', cost: 0 } },
        { time: '09:30', title: '제주 들불축제', cat: '축제',  note: '시즌 한정 이벤트',       img: img('festival'), cost: 0,    move: { mode: '차',   time: '1시간',       cost: 0 } },
      ],
    },
  ],
  // 렌터카·주유 등 일자 무관 공통 비용 (단위: 원)
  fixedCost: { rental: 90000, fuel: 30000 },
};

// ── 교통수단 메타 ──────────────────────────────────────────────────────────────
// icon 필드는 src/components/icons/index.js 의 아이콘 이름에 대응
export const moveModes = {
  '차':    { icon: 'car',   label: '자동차' },
  '도보':  { icon: 'walk',  label: '도보'   },
  '버스':  { icon: 'bus',   label: '대중교통' },
  '비행기': { icon: 'plane', label: '비행기' },
};

// ── 여행 일지(Journal) 시드 ────────────────────────────────────────────────────
// journal[장소명] = [{ id, photos, text, rating, date }]
// 빈 배열이면 사용자가 직접 추가(CRUD). 데모용 시드 1개.
export const journalSeed = {
  '협재 해변': [
    {
      id: 'j1', photos: [],
      text: '오전이라 사람이 적어서 인생샷 건졌어요. 물빛이 진짜 에메랄드 🥹',
      rating: 5, date: '여행 1일차',
    },
  ],
};

// ── 기본 export (하위 호환 / 한 번에 import 용) ────────────────────────────────
export default {
  regions,
  categories,
  places,
  tripLogs,
  comments,
  aiPlan,
  moveModes,
  journalSeed,
};
