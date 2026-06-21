// 코스콕 — CourseMap: 코스(일정)를 지도 위에 동선으로 보여주는 뷰
// 프로토타입용 스타일라이즈드 벡터 지도. 프로덕션에서는 이 자리에
// Kakao/Naver Map JS SDK 컨테이너를 끼우고 COORD를 실제 위경도로 교체하면 됨.
(function () {
  const { Icon } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Badge } = DS;

  // 데모(제주) 장소별 좌표 — 0..100(x) · 0..72(y) 캔버스 기준
  const COORD = {
    '협재 해변':      { x: 20, y: 27 },
    '오션뷰 카페':    { x: 23, y: 22 },
    '올레 국수':      { x: 27, y: 33 },
    '제주 들불축제':  { x: 31, y: 41 },
    '카멜리아 힐':    { x: 33, y: 49 },
    '바다뷰 스테이':  { x: 45, y: 55 },
    '제주 게스트하우스': { x: 45, y: 55 },
    '사려니 숲길':    { x: 58, y: 34 },
    '제주 흑돼지 맛집': { x: 69, y: 43 },
    '해녀의 부엌':    { x: 75, y: 31 },
    '성산일출봉':     { x: 86, y: 39 },
  };
  const fallback = (i) => ({ x: 22 + (i * 13) % 60, y: 26 + (i * 19) % 30 });
  const coordOf = (title, i) => COORD[title] || fallback(i);

  const DAYC = ['var(--coral-500)', 'var(--sky-500)', 'var(--mint-500)', 'var(--amber-500)'];
  const DAYSOFT = ['var(--coral-50)', 'var(--sky-50)', 'var(--mint-50)', 'var(--amber-50)'];

  // 지도 배경(제주 실루엣 + 바다 + 도로 + 한라산)
  function MapBackground() {
    return (
      <g>
        {/* 바다 잔물결 */}
        <g stroke="#BFE3FB" strokeWidth="0.5" strokeLinecap="round" opacity="0.7" fill="none">
          <path d="M6 10 q3 -2 6 0 t6 0" /><path d="M78 12 q3 -2 6 0 t6 0" />
          <path d="M8 62 q3 -2 6 0 t6 0" /><path d="M80 60 q3 -2 6 0 t6 0" />
        </g>
        {/* 섬 본체 */}
        <path d="M12 36 C12 24 26 17 40 16 C54 15 66 16 78 20 C88 23 92 30 91 38
                 C90 48 78 55 62 57 C46 59 30 58 20 52 C14 48 12 42 12 36 Z"
          fill="#FBF4EC" stroke="#F2D9C8" strokeWidth="0.8" strokeLinejoin="round" />
        {/* 해안 모래 톤 */}
        <path d="M12 36 C12 24 26 17 40 16 C54 15 66 16 78 20 C88 23 92 30 91 38
                 C90 48 78 55 62 57 C46 59 30 58 20 52 C14 48 12 42 12 36 Z"
          fill="none" stroke="#FFE9DC" strokeWidth="2.4" strokeLinejoin="round" opacity="0.6" />
        {/* 녹지(숲) */}
        <ellipse cx="58" cy="35" rx="9" ry="6" fill="#DDF3E8" opacity="0.8" />
        <ellipse cx="34" cy="48" rx="6" ry="4" fill="#DDF3E8" opacity="0.7" />
        {/* 한라산 */}
        <g>
          <circle cx="50" cy="37" r="9" fill="#E7F6EE" />
          <circle cx="50" cy="37" r="5.5" fill="#CDEBDC" />
          <path d="M47 39 l3 -5 3 5 z" fill="#9FD9BC" />
        </g>
        {/* 일주도로(점선 링) */}
        <path d="M20 34 C22 25 34 21 46 21 C60 21 74 23 82 30 C86 34 84 42 74 47 C60 53 40 53 28 48 C20 44 18 40 20 34 Z"
          fill="none" stroke="#E7D6C6" strokeWidth="0.7" strokeDasharray="1.4 1.6" />
        {/* 오름 점들 */}
        <g fill="#CDEBDC">
          <circle cx="40" cy="30" r="1.1" /><circle cx="66" cy="44" r="1.1" /><circle cx="28" cy="40" r="1" /><circle cx="72" cy="36" r="1" />
        </g>
      </g>
    );
  }

  // days: [{day, theme, items:[{title, cat, time, img}]}]
  function CourseMap({ days, activeDay = 'all', height = 360 }) {
    const [sel, setSel] = React.useState(null); // {di, ii}

    // 표시할 day 목록
    const shownDays = activeDay === 'all' ? days.map((_, i) => i) : [activeDay];

    const selStop = sel ? days[sel.di] && days[sel.di].items[sel.ii] : null;

    return (
      <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', background: 'linear-gradient(165deg, #EAF6FF, #E9FBF4)' }}>
        {/* 도트 텍스처 */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.35, backgroundImage: 'radial-gradient(#CDE8FB 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />

        <svg viewBox="0 0 100 72" preserveAspectRatio="xMidYMid meet" style={{ position: 'relative', width: '100%', height, display: 'block' }}>
          <MapBackground />

          {/* 동선(점선) */}
          {shownDays.map((di) => {
            const pts = days[di].items.map((it, ii) => coordOf(it.title, ii));
            if (pts.length < 2) return null;
            const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
            return <path key={'r' + di} d={d} fill="none" stroke={DAYC[di % 4]} strokeWidth="1" strokeDasharray="2 1.8" strokeLinecap="round" opacity="0.85" />;
          })}

          {/* 핀 */}
          {shownDays.map((di) => days[di].items.map((it, ii) => {
            const p = coordOf(it.title, ii);
            const isSel = sel && sel.di === di && sel.ii === ii;
            return (
              <g key={di + '-' + ii} style={{ cursor: 'pointer' }} onClick={() => setSel(isSel ? null : { di, ii })}>
                {isSel && <circle cx={p.x} cy={p.y} r="4.6" fill={DAYC[di % 4]} opacity="0.22" />}
                <circle cx={p.x} cy={p.y} r={isSel ? 3.2 : 2.6} fill={DAYC[di % 4]} stroke="#fff" strokeWidth="0.7"
                  style={{ transition: 'r 0.15s' }} />
                <text x={p.x} y={p.y + 0.9} textAnchor="middle" fontSize="2.4" fontWeight="800" fill="#fff" style={{ pointerEvents: 'none', fontFamily: 'var(--font-sans)' }}>{ii + 1}</text>
              </g>
            );
          }))}
        </svg>

        {/* 범례 */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {shownDays.map((di) => (
            <span key={di} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-xs)', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: DAYC[di % 4] }} />DAY {days[di].day}
            </span>
          ))}
        </div>

        {/* 선택 정보 / 안내 */}
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
          {selStop ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 10, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: DAYC[sel.di % 4], color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{sel.ii + 1}</span>
              <img src={selStop.img} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <b style={{ fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selStop.title}</b>
                  <Badge tone="neutral" size="sm">{selStop.cat}</Badge>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap' }}>DAY {days[sel.di].day} · {selStop.time}</div>
              </div>
              <button onClick={() => setSel(null)} aria-label="닫기" style={{ border: 'none', background: 'var(--gray-50)', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="x" size={14} /></button>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-xs)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Icon name="pin" size={14} color="var(--coral-500)" />번호 핀을 눌러 장소를 확인하세요
            </div>
          )}
        </div>
      </div>
    );
  }

  // 리스트/지도 토글 (재사용)
  function ViewToggle({ view, onChange }) {
    const opts = [{ k: 'list', icon: 'list', label: '리스트' }, { k: 'map', icon: 'map', label: '지도' }];
    return (
      <div style={{ display: 'inline-flex', padding: 3, background: 'var(--gray-50)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-subtle)' }}>
        {opts.map((o) => (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
            background: view === o.k ? 'var(--surface)' : 'transparent', color: view === o.k ? 'var(--coral-600)' : 'var(--text-muted)',
            fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', boxShadow: view === o.k ? 'var(--shadow-xs)' : 'none',
          }}><Icon name={o.icon} size={15} />{o.label}</button>
        ))}
      </div>
    );
  }

  window.CourseMap = CourseMap;
  window.CourseMapToggle = ViewToggle;
})();
