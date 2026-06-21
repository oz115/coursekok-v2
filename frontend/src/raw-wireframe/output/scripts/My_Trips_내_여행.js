// 코스콕 — My Trips (내 여행: 편집 가능한 코스 + 장소별 기록 + 공개 설정)
(function () {
  const { Icon, KK } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button, Badge, Card, Switch } = DS;
  const { catColor, catTone, MoveRow, DotField } = window.Kit;
  const JournalBlock = window.JournalBlock;
  const CourseMap = window.CourseMap;
  const CourseMapToggle = window.CourseMapToggle;

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = () => 'u' + Math.random().toString(36).slice(2, 8);

  // ── 리스트: 여행 카드 ─────────────────────────────────────
  function TripCard({ trip, onOpen }) {
    return (
      <Card padding="none" interactive onClick={onOpen} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ position: 'relative', width: 156, flex: 'none' }}>
            <img src={trip.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 'var(--radius-pill)', background: trip.visibility === 'public' ? 'var(--mint-500)' : 'rgba(26,22,17,0.6)', color: '#fff', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', backdropFilter: 'blur(4px)' }}>
              <Icon name={trip.visibility === 'public' ? 'globe' : 'lock'} size={12} />{trip.visibility === 'public' ? '공개' : '비공개'}
            </span>
          </div>
          <div style={{ padding: '16px 18px', flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <Badge tone="coral">{trip.region}</Badge>
              <Badge tone="neutral">{trip.period}</Badge>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' }}>{trip.title}</h3>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, color: 'var(--text-muted)', fontSize: 13 }}>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="calendar" size={15} />{trip.days}일</span>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="pin" size={15} />{trip.places}곳</span>
            </div>
          </div>
          <div style={{ alignSelf: 'center', paddingRight: 16, color: 'var(--text-muted)' }}><Icon name="chevronR" size={22} /></div>
        </div>
      </Card>
    );
  }

  // ── 코스 편집 + 기록: 한 정차지 ───────────────────────────
  function StopRow({ it, idx, count, journal, onJournal, onDelete, onMove, drag }) {
    const [open, setOpen] = React.useState((journal || []).length > 0);
    const nEntries = (journal || []).length;
    const nPhotos = (journal || []).reduce((a, e) => a + (e.photos ? e.photos.length : 0), 0);

    return (
      <div
        draggable
        onDragStart={() => drag.start(idx)}
        onDragOver={(e) => { e.preventDefault(); drag.over(idx); }}
        onDrop={(e) => { e.preventDefault(); drag.drop(idx); }}
        style={{ background: drag.current === idx ? 'var(--coral-50)' : 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)', overflow: 'hidden', transition: 'background var(--dur-fast)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px' }}>
          <span style={{ color: 'var(--gray-300)', cursor: 'grab', flex: 'none' }} title="끌어서 순서 변경"><Icon name="grip2" size={18} /></span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', width: 42, flex: 'none' }}>{it.time}</span>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: catColor[it.cat], flex: 'none' }} />
          <img src={it.img} alt="" style={{ width: 46, height: 46, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <b style={{ fontSize: 15 }}>{it.title}</b>
              <Badge tone={catTone(it.cat)} size="sm">{it.cat}</Badge>
            </div>
            {it.move && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <MoveRow move={it.move} compact />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 'none' }}>
            <button onClick={() => onMove(idx, -1)} disabled={idx === 0} aria-label="위로" style={{ ...miniBtn, opacity: idx === 0 ? 0.3 : 1 }}><Icon name="chevronU" size={15} /></button>
            <button onClick={() => onMove(idx, 1)} disabled={idx === count - 1} aria-label="아래로" style={{ ...miniBtn, opacity: idx === count - 1 ? 0.3 : 1 }}><Icon name="chevronD" size={15} /></button>
          </div>
          <button onClick={onDelete} aria-label="장소 삭제" style={{ ...miniBtn, color: 'var(--red-500)', flex: 'none' }}><Icon name="trash" size={16} /></button>
        </div>

        <button onClick={() => setOpen((o) => !o)} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 16px', border: 'none',
          borderTop: '1px solid var(--border-subtle)', background: open ? 'var(--coral-50)' : 'var(--gray-50)', cursor: 'pointer',
          color: open ? 'var(--coral-700)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-sans)',
        }}>
          <Icon name="camera" size={15} />
          {nEntries ? `내 기록 ${nEntries}개 · 사진 ${nPhotos}장` : '이곳에서의 추억 기록하기'}
          <div style={{ flex: 1 }} />
          <Icon name={open ? 'chevronU' : 'chevronD'} size={16} />
        </button>
        {open && (
          <div style={{ padding: 14, background: 'var(--coral-50)' }}>
            <JournalBlock entries={journal || []} onChange={onJournal} />
          </div>
        )}
      </div>
    );
  }

  // ── 장소 추가 패널 ─────────────────────────────────────────
  function AddStopPanel({ existing, onAdd, onClose }) {
    const have = new Set(existing);
    const candidates = KK.places.filter((p) => !have.has(p.title));
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--coral-200)', padding: 14, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <b style={{ fontSize: 14 }}>이 날에 추가할 장소</b>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} aria-label="닫기" style={miniBtn}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {candidates.map((p) => (
            <button key={p.id} onClick={() => onAdd(p)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: 8, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
              background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
            }}>
              <img src={p.img} alt="" style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.cat}</div>
              </div>
              <Icon name="plusCircle" size={18} color="var(--coral-500)" />
            </button>
          ))}
          {candidates.length === 0 && <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: 8 }}>추가할 수 있는 장소를 모두 넣었어요.</span>}
        </div>
      </div>
    );
  }

  // ── 상세: 코스 편집 + 기록 + 공개 설정 ───────────────────
  function TripDetail({ trip, onBack, onVisibility, onStartTrip }) {
    const [days, setDays] = React.useState(() =>
      clone(trip.plan && trip.plan.days ? trip.plan.days : KK.aiPlan.days)
        .map((d) => ({ ...d, items: d.items.map((it) => ({ ...it, uid: it.uid || uid() })) })));
    const [journal, setJournal] = React.useState(() => {
      const j = {};
      days.forEach((d) => d.items.forEach((it) => { if (KK.journalSeed[it.title]) j[it.uid] = clone(KK.journalSeed[it.title]); }));
      return j;
    });
    const [visibility, setVisibility] = React.useState(trip.visibility || 'private');
    const [adding, setAdding] = React.useState(null); // dayIdx
    const dragRef = React.useRef({ dayIdx: null, from: null });
    const [dragCur, setDragCur] = React.useState(null);
    const [courseView, setCourseView] = React.useState('list');

    const setJ = (u, entries) => setJournal((j) => ({ ...j, [u]: entries }));
    const totalPhotos = Object.values(journal).reduce((a, arr) => a + arr.reduce((b, e) => b + (e.photos ? e.photos.length : 0), 0), 0);

    const moveItem = (dayIdx, idx, dir) => setDays((ds) => {
      const n = clone(ds); const arr = n[dayIdx].items; const to = idx + dir;
      if (to < 0 || to >= arr.length) return ds;
      [arr[idx], arr[to]] = [arr[to], arr[idx]]; return n;
    });
    const delItem = (dayIdx, idx) => setDays((ds) => { const n = clone(ds); n[dayIdx].items.splice(idx, 1); return n; });
    const addItem = (dayIdx, place) => {
      setDays((ds) => { const n = clone(ds); n[dayIdx].items.push({ uid: uid(), time: '시간 미정', title: place.title, cat: place.cat, note: (place.desc || '').slice(0, 24), img: place.img, move: { mode: '차', time: '15분', cost: 0 } }); return n; });
      setAdding(null);
    };
    const makeDrag = (dayIdx) => ({
      current: dragRef.current.dayIdx === dayIdx ? dragCur : null,
      start: (i) => { dragRef.current = { dayIdx, from: i }; },
      over: (i) => { if (dragRef.current.dayIdx === dayIdx) setDragCur(i); },
      drop: (i) => {
        const d = dragRef.current;
        if (d.dayIdx === dayIdx && d.from != null && d.from !== i) {
          setDays((ds) => { const n = clone(ds); const arr = n[dayIdx].items; const [m] = arr.splice(d.from, 1); arr.splice(i, 0, m); return n; });
        }
        dragRef.current = { dayIdx: null, from: null }; setDragCur(null);
      },
    });

    const applyVisibility = (v) => { setVisibility(v); onVisibility && onVisibility(trip, v); };

    return (
      <div>
        <button onClick={onBack} style={backBtn}><Icon name="chevronL" size={18} />내 여행</button>

        {/* 헤더 */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 18 }}>
          <img src={trip.cover} alt="" style={{ width: '100%', height: 190, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,22,17,0.66), transparent 60%)' }} />
          <div style={{ position: 'absolute', left: 22, bottom: 18, right: 22 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <Badge tone="coral" solid>{trip.region || '제주'}</Badge><Badge tone="neutral" solid>{trip.period || '2박 3일'}</Badge>
            </div>
            <h1 style={{ color: '#fff', fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em' }}>{trip.title}</h1>
          </div>
        </div>

        {/* 여행 시작 CTA — 오늘의 여행(체크인) 모드로 */}
        <button onClick={() => onStartTrip && onStartTrip(trip)} style={{
          display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', cursor: 'pointer',
          padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--coral-100)',
          background: 'linear-gradient(120deg, var(--coral-50), #FFF9F4 80%)', marginBottom: 22, fontFamily: 'var(--font-sans)',
        }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--coral-500)', color: '#fff' }}>
            <Icon name="sun" size={24} />
          </span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15.5 }}>여행 시작하기</b>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>여행 당일, 동선을 따라가며 콕 체크인하고 추억을 남겨요.</div>
          </div>
          <Icon name="chevronR" size={22} color="var(--coral-400)" />
        </button>

        {/* 공개 설정 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: visibility === 'public' ? 'var(--mint-50)' : 'var(--surface)', boxShadow: 'var(--shadow-sm)', marginBottom: 22, transition: 'background var(--dur-base)' }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: visibility === 'public' ? 'var(--mint-100)' : 'var(--gray-50)', color: visibility === 'public' ? 'var(--mint-600)' : 'var(--text-muted)' }}>
            <Icon name={visibility === 'public' ? 'globe' : 'lock'} size={22} />
          </span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15.5 }}>{visibility === 'public' ? 'TripLog에 공개 중' : '나만 보기 (비공개)'}</b>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {visibility === 'public' ? '다른 여행자가 커뮤니티에서 내 코스와 기록을 볼 수 있어요.' : '공개하면 TripLog 커뮤니티에 올라가 다른 사람도 참고할 수 있어요.'}
            </div>
          </div>
          <Switch checked={visibility === 'public'} onChange={(e) => applyVisibility(e.target.checked ? 'public' : 'private')} />
        </div>

        {/* 편집 안내 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, whiteSpace: 'nowrap' }}>코스 &amp; 기록</h2>
          <Badge tone="coral" size="sm" leftIcon={<Icon name="image" size={11} />}>사진 {totalPhotos}장</Badge>
          <div style={{ flex: 1 }} />
          <CourseMapToggle view={courseView} onChange={setCourseView} />
        </div>

        {courseView === 'map' ? (
          <div style={{ marginBottom: 22 }}>
            <CourseMap days={days} height={400} />
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>리스트로 전환하면 순서 변경·장소 추가/삭제와 추억 기록을 남길 수 있어요.</p>
          </div>
        ) : (
        <>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 14, textAlign: 'right' }}>끌거나 ▲▼로 순서 변경 · 추가/삭제 가능</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 22 }}>
          {days.map((day, di) => {
            const drag = makeDrag(di);
            return (
              <div key={di}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--coral-500)', color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{day.day}</span>
                  <b style={{ fontSize: 16 }}>DAY {day.day} · {day.theme}</b>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {day.items.map((it, ii) => (
                    <StopRow key={it.uid} it={it} idx={ii} count={day.items.length}
                      journal={journal[it.uid]} onJournal={(en) => setJ(it.uid, en)}
                      onDelete={() => delItem(di, ii)} onMove={(i, d) => moveItem(di, i, d)} drag={drag} />
                  ))}
                </div>
                {adding === di
                  ? <AddStopPanel existing={day.items.map((x) => x.title)} onAdd={(p) => addItem(di, p)} onClose={() => setAdding(null)} />
                  : (
                    <button onClick={() => setAdding(di)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 10,
                      padding: '11px 0', borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--border)', background: 'transparent',
                      color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, fontFamily: 'var(--font-sans)',
                    }}><Icon name="plus" size={16} />{day.day}일차에 장소 추가</button>
                  )}
              </div>
            );
          })}
        </div>
        </>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button variant={visibility === 'public' ? 'secondary' : 'primary'} size="lg" fullWidth
            leftIcon={<Icon name={visibility === 'public' ? 'check' : 'globe'} size={18} />}
            onClick={() => applyVisibility(visibility === 'public' ? 'private' : 'public')}>
            {visibility === 'public' ? '공개 중 · 비공개로 전환' : 'TripLog에 공개하기'}
          </Button>
          <Button variant="secondary" size="lg" leftIcon={<Icon name="share" size={18} />}>공유</Button>
        </div>
      </div>
    );
  }

  function MyTrips({ savedTrips, onWriteLog, onVisibility, onStartTrip }) {
    const [open, setOpen] = React.useState(null);
    const trips = savedTrips && savedTrips.length ? savedTrips : [KK.tripLogs[0]];

    return (
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '32px 24px 90px' }}>
        {!open ? (
          <>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', background: 'linear-gradient(120deg, var(--coral-50), #FFF9F4 70%)', padding: '24px 26px', marginBottom: 22 }}>
              <DotField color="var(--coral-200)" opacity={0.5} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: 29, fontWeight: 800, letterSpacing: '-0.02em' }}>내 여행</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15.5, marginTop: 4 }}>코스를 다듬고, 사진과 글로 추억을 남겨보세요.</p>
                </div>
                <Badge tone="coral" solid size="md">{trips.length}개의 여행</Badge>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {trips.map((t, i) => <TripCard key={i} trip={t} onOpen={() => setOpen(t)} />)}
            </div>
          </>
        ) : (
          <TripDetail trip={open} onBack={() => setOpen(null)} onVisibility={onVisibility} onStartTrip={onStartTrip} />
        )}
      </div>
    );
  }

  const miniBtn = { border: 'none', background: 'transparent', width: 28, height: 24, borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const backBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600, marginBottom: 16 };

  window.MyTrips = MyTrips;
})();
