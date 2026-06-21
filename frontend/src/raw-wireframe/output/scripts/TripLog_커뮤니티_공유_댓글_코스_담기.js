// 코스콕 — TripLog (커뮤니티 공유 + 댓글 + 코스 담기)
(function () {
  const { Icon, KK } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button, Badge, Avatar, FilterChip, Rating, Card, Mascot } = DS;
  const { DotField } = window.Kit;

  function Stat({ icon, n }) {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}><Icon name={icon} size={15} />{n}</span>;
  }

  // 여러 장의 추억 사진 모자이크 (장소 카드의 단일 이미지와 구분되는 핵심)
  function PhotoCollage({ photos, days }) {
    const ph = (photos && photos.length ? photos : []).slice(0, 4);
    const [big, ...rest] = ph;
    return (
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: rest.length ? '1.7fr 1fr' : '1fr', gridTemplateRows: '1fr 1fr', gap: 3, height: 188, background: 'var(--gray-100)' }}>
        <img src={big} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', gridRow: '1 / 3' }} />
        {rest.slice(0, 2).map((src, i) => (
          <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {i === 1 && photos.length > 3 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,22,17,0.5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17 }}>+{photos.length - 3}</div>
            )}
          </div>
        ))}
        {/* 추억 앨범임을 알리는 라벨 */}
        <span style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(26,22,17,0.62)', color: '#fff', fontSize: 11.5, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
          <Icon name="image" size={13} />여행 기록 · 사진 {photos.length}장
        </span>
      </div>
    );
  }

  // 코스 경로 미리보기 — '한 장소'가 아니라 '코스 전체'임을 보여줌
  function RoutePreview({ route, total }) {
    const shown = (route || []).slice(0, 3);
    const extra = (total || route.length) - shown.length;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: '10px 12px', background: 'var(--coral-50)', borderRadius: 'var(--radius-md)' }}>
        <Icon name="route" size={16} color="var(--coral-600)" />
        {shown.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevronR" size={13} color="var(--coral-300)" />}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, color: 'var(--coral-700)', whiteSpace: 'nowrap' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--coral-500)' }} />{p}
            </span>
          </React.Fragment>
        ))}
        {extra > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--coral-500)' }}>외 {extra}곳</span>}
      </div>
    );
  }

  function LogCard({ log, onOpen, onAddCourse }) {
    return (
      <article onClick={onOpen} style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>

        {/* 작성자 리본 — 사람(여행자)이 먼저 보이도록 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
          <Avatar name={log.author} size={36} ring />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{log.author}<span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>님의 여행기</span></div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.date} · {log.region} {log.period}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 'var(--radius-pill)', background: 'var(--amber-50)', color: 'var(--amber-600)', fontSize: 12.5, fontWeight: 800 }}>
            <Icon name="star" size={13} />{log.rating}
          </span>
        </div>

        <PhotoCollage photos={log.photos} days={log.days} />

        <div style={{ padding: 15, flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div>
            <h3 style={{ fontSize: 17.5, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.32 }}>{log.title}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{log.excerpt}</p>
          </div>

          <RoutePreview route={log.route} total={log.places} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <Stat icon="heart" n={log.likes} />
            <Stat icon="message" n={log.comments} />
            <Stat icon="bookmark" n={log.saves} />
            <div style={{ flex: 1 }} />
            <Button variant="primary" size="sm" leftIcon={<Icon name="copy" size={15} />}
              onClick={(e) => { e.stopPropagation(); onAddCourse && onAddCourse(log); }}>코스 담기</Button>
          </div>
        </div>
      </article>
    );
  }

  function Comment({ c }) {
    return (
      <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <Avatar name={c.author} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <b style={{ fontSize: 14 }}>{c.author}</b>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.time}</span>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.55 }}>{c.text}</p>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginTop: 6, padding: 0 }}>
            <Icon name="heart" size={14} />{c.likes}
          </button>
        </div>
      </div>
    );
  }

  function LogDetail({ log, onBack, onAddCourse }) {
    const days = KK.aiPlan.days;
    const [text, setText] = React.useState('');
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          <Icon name="chevronL" size={18} />TripLog
        </button>

        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: 300 }}>
          <img src={log.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,22,17,0.6), transparent 50%)' }} />
          <div style={{ position: 'absolute', left: 24, bottom: 20, right: 24 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <Badge tone="coral" solid>{log.region}</Badge><Badge tone="neutral" solid>{log.period}</Badge><Badge tone="mint" solid>{log.style}</Badge>
            </div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{log.title}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
          <Avatar name={log.author} size={42} />
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15 }}>{log.author}</b>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{log.days}일 · {log.places}곳 방문</div>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Icon name="heart" size={16} />}>{log.likes}</Button>
          <Button variant="primary" size="sm" leftIcon={<Icon name="copy" size={16} />} onClick={() => onAddCourse(log)}>코스 담기</Button>
        </div>

        {/* day-by-day record with photos + 만족도 */}
        <div style={{ padding: '22px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {days.map((day) => (
            <div key={day.day}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--coral-500)', color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{day.day}</span>
                <b style={{ fontSize: 17 }}>DAY {day.day} · {day.theme}</b>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
                {day.items.slice(0, 2).map((it, i) => (
                  <div key={i} style={{ paddingLeft: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <b style={{ fontSize: 15 }}>{it.title}</b>
                      <Rating value={5 - i * 0.5} size={14} />
                    </div>
                    <img src={it.img} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: 10 }}>
                      {it.note}. 사진보다 실물이 훨씬 좋았어요. 다음에 또 오고 싶은 곳 👍
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* comments */}
        <div style={{ paddingTop: 8 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>댓글 <span style={{ color: 'var(--coral-500)' }}>{KK.comments.length}</span></h2>
          <div style={{ display: 'flex', gap: 10, padding: '14px 0' }}>
            <Avatar name="나" size={36} ring />
            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-pill)', padding: '4px 4px 4px 16px' }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="이 여행에 댓글을 남겨보세요"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontFamily: 'var(--font-sans)' }} />
              <button aria-label="등록" style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: text ? 'var(--coral-500)' : 'var(--gray-200)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', transition: 'background var(--dur-fast)' }}>
                <Icon name="arrowR" size={18} />
              </button>
            </div>
          </div>
          {KK.comments.map((c) => <Comment key={c.id} c={c} />)}
        </div>
      </div>
    );
  }

  function TripLogFeed({ onAddCourse }) {
    const [open, setOpen] = React.useState(null);
    const [region, setRegion] = React.useState('전체');
    const filters = ['전체', '제주', '부산', '강릉', '경주'];
    const styleFilters = ['힐링', '미식', '감성', '액티비티'];

    if (open) return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 90px' }}>
        <LogDetail log={open} onBack={() => setOpen(null)} onAddCourse={(l) => { onAddCourse(l); setOpen(null); }} />
      </div>
    );

    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 90px' }}>
        <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', background: 'linear-gradient(120deg, var(--mint-50), var(--sky-50) 80%)', padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <DotField color="var(--mint-200)" opacity={0.55} />
          <Mascot variant="wink" size={76} style={{ position: 'relative', flex: 'none' }} />
          <div style={{ position: 'relative' }}>
            <Badge tone="mint" leftIcon={<Icon name="users" size={12} />}>TRIPLOG 커뮤니티</Badge>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>여행자들의 진짜 여행 기록</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>사진과 후기가 담긴 코스를 구경하고, 마음에 들면 그대로 담아오세요.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {filters.map((r) => <FilterChip key={r} selected={region === r} onClick={() => setRegion(r)} leftIcon={r !== '전체' ? <Icon name="pin" size={15} /> : null}>{r}</FilterChip>)}
          <span style={{ width: 1, background: 'var(--border)', margin: '4px 4px' }} />
          {styleFilters.map((s) => <FilterChip key={s}>{s}</FilterChip>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, marginTop: 16 }}>
          {KK.tripLogs.map((log) => <LogCard key={log.id} log={log} onOpen={() => setOpen(log)} onAddCourse={onAddCourse} />)}
        </div>
      </div>
    );
  }

  window.TripLogFeed = TripLogFeed;
})();
