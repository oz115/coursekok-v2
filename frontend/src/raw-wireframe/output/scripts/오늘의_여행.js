// 코스콕 — 오늘의 여행: 여행 중 동행(체크인) + 여행 기록(추억 앨범) → TripLog 공개
// 여정 후반부 허브. 'live'(오늘 동선 따라가며 콕! 체크인) ↔ 'album'(다녀온 곳 자동 앨범).
(function () {
  const { Icon, KK } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button, Badge, Mascot } = DS;
  const { catColor, catTone, MoveRow, DotField, PhotoUploader, StarPick } = window.Kit;

  const keyOf = (di, ii) => di + '-' + ii;
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  // ── 도착 기록 시트(체크인 시 즉석 캡처) ─────────────────────
  function CaptureSheet({ stop, onSave, onSkip, onClose }) {
    const [rating, setRating] = React.useState(5);
    const [photos, setPhotos] = React.useState([]);
    const [memo, setMemo] = React.useState('');
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--overlay-scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', animation: 'kok-fade-up var(--dur-base) var(--ease-spring)' }}>
          <div style={{ position: 'relative', height: 116, overflow: 'hidden' }}>
            <img src={stop.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,22,17,0.72), transparent 70%)' }} />
            <div style={{ position: 'absolute', left: 18, bottom: 14, color: '#fff' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, opacity: 0.9 }}>
                <Icon name="check" size={14} />도착 체크인
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>{stop.title}</h3>
            </div>
            <button onClick={onClose} aria-label="닫기" style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.35)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={18} /></button>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>이곳, 어땠어요?</span>
              <StarPick value={rating} onChange={setRating} size={26} />
            </div>
            <PhotoUploader photos={photos} onChange={setPhotos} max={3} tileSize={80} addLabel="사진" />
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2}
              placeholder="한 줄 메모 — 무엇이 좋았나요? (선택)"
              style={{ width: '100%', marginTop: 12, padding: '11px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', resize: 'vertical', fontSize: 14.5, fontFamily: 'var(--font-sans)', lineHeight: 1.55, outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Button variant="ghost" size="lg" onClick={onSkip}>기록 없이 체크인</Button>
              <div style={{ flex: 1 }} />
              <Button variant="primary" size="lg" leftIcon={<Icon name="check" size={18} />}
                onClick={() => onSave({ rating, photos, memo: memo.trim() })}>다녀왔어요</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 지금 향할 곳(다음 정차지) 카드 ──────────────────────────
  function NextStopCard({ stop, idx, onCheckIn }) {
    return (
      <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-subtle)' }}>
        <img src={stop.img} alt="" style={{ width: '100%', height: 290, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,22,17,0.84), rgba(26,22,17,0.05) 58%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', fontSize: 12.5, fontWeight: 800, color: 'var(--coral-600)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--coral-500)', boxShadow: '0 0 0 0 var(--coral-500)', animation: 'kok-pulse 1.8s infinite' }} />지금 향할 곳
        </div>
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--coral-500)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{idx + 1}</span>
            <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.92 }}>{stop.time}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: catColor[stop.cat] }} />{stop.cat}
            </span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{stop.title}</h2>
          <p style={{ fontSize: 14.5, opacity: 0.9, marginTop: 4 }}>{stop.note}</p>
          {stop.move && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 12, padding: '7px 13px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(4px)', fontSize: 13, fontWeight: 700 }}>
              <Icon name={(KK.moveModes[stop.move.mode] || {}).icon || 'car'} size={16} />
              {(KK.moveModes[stop.move.mode] || {}).label || stop.move.mode} · {stop.move.time}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" size="lg" fullWidth leftIcon={<Icon name="pin" size={18} />} onClick={onCheckIn}>
              여기 도착! 콕 체크인
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── 오늘 동선 리스트(상태 표시) ────────────────────────────
  function TodayList({ items, di, visited }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it, ii) => {
          const rec = visited[keyOf(di, ii)];
          const done = !!rec;
          const isNext = !done && items.slice(0, ii).every((_, k) => visited[keyOf(di, k)]);
          return (
            <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px' }}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
                  background: done ? 'var(--mint-500)' : isNext ? 'var(--coral-500)' : 'var(--gray-100)',
                  color: done || isNext ? '#fff' : 'var(--text-muted)',
                  boxShadow: isNext ? '0 0 0 4px var(--coral-50)' : 'none' }}>
                  {done ? <Icon name="check" size={16} /> : ii + 1}
                </span>
                {ii < items.length - 1 && <span style={{ width: 2, height: 22, background: done ? 'var(--mint-200)' : 'var(--border)', marginTop: 2 }} />}
              </div>
              <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flex: 'none', position: 'relative' }}>
                <img src={(rec && rec.photos && rec.photos[0]) || it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: done ? 'none' : isNext ? 'none' : 'grayscale(0.35) opacity(0.7)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <b style={{ fontSize: 15, color: done || isNext ? 'var(--text-primary)' : 'var(--text-muted)' }}>{it.title}</b>
                  {done && rec.rating ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12.5, fontWeight: 700, color: 'var(--amber-600)' }}><Icon name="star" size={13} />{rec.rating}</span> : null}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{it.time} · {done ? '다녀옴' : isNext ? '다음 차례' : '예정'}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── 여행 기록(앨범) 모드 ───────────────────────────────────
  function AlbumStop({ it, rec, onMemo }) {
    return (
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: catColor[it.cat], border: '2.5px solid var(--surface)', boxShadow: '0 0 0 1.5px ' + catColor[it.cat] }} />
          <span style={{ flex: 1, width: 2, background: 'var(--border)', marginTop: 4 }} />
        </div>
        <div style={{ flex: 1, paddingBottom: 22, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>{it.time}</span>
            <b style={{ fontSize: 16 }}>{it.title}</b>
            <Badge tone={catTone(it.cat)} size="sm">{it.cat}</Badge>
            <div style={{ flex: 1 }} />
            <StarPick value={rec.rating || 0} readOnly size={15} />
          </div>
          {rec.photos && rec.photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(rec.photos.length, 3)}, 1fr)`, gap: 7, marginBottom: 10 }}>
              {rec.photos.map((src, i) => <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />)}
            </div>
          )}
          <textarea value={rec.memo || ''} onChange={(e) => onMemo(e.target.value)} rows={2}
            placeholder="이곳에서의 추억을 적어보세요…"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', resize: 'vertical', fontSize: 14, fontFamily: 'var(--font-sans)', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', background: 'var(--gray-50)' }} />
        </div>
      </div>
    );
  }

  function Album({ trip, days, visited, onMemo, onPublish }) {
    const visitedStops = [];
    days.forEach((d, di) => d.items.forEach((it, ii) => { const r = visited[keyOf(di, ii)]; if (r) visitedStops.push({ di, ii, it, rec: r }); }));
    const allPhotos = visitedStops.flatMap((s) => s.rec.photos || []);
    const ratings = visitedStops.map((s) => s.rec.rating).filter(Boolean);
    const cover = allPhotos[0] || trip.cover || (visitedStops[0] && visitedStops[0].it.img);

    if (visitedStops.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Mascot variant="wink" size={92} />
          <p style={{ fontSize: 15.5, marginTop: 12, lineHeight: 1.6 }}>아직 다녀온 곳이 없어요.<br />오늘 일정에서 콕 체크인하면 이곳에 추억이 쌓여요.</p>
        </div>
      );
    }

    return (
      <div>
        {/* 앨범 헤더 */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 20 }}>
          <img src={cover} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,22,17,0.78), transparent 64%)' }} />
          <div style={{ position: 'absolute', left: 22, right: 22, bottom: 18, color: '#fff' }}>
            <Badge tone="mint" solid leftIcon={<Icon name="image" size={12} />}>여행 기록</Badge>
            <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>{trip.title}</h1>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13.5, fontWeight: 600, opacity: 0.94 }}>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="pin" size={15} />{visitedStops.length}곳 다녀옴</span>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="camera" size={15} />사진 {allPhotos.length}장</span>
              {ratings.length > 0 && <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="star" size={15} />평균 {avg(ratings).toFixed(1)}</span>}
            </div>
          </div>
        </div>

        {/* day별 타임라인 */}
        {days.map((d, di) => {
          const stops = d.items.map((it, ii) => ({ it, ii, rec: visited[keyOf(di, ii)] })).filter((s) => s.rec);
          if (!stops.length) return null;
          return (
            <div key={di} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--coral-500)', color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d.day}</span>
                <b style={{ fontSize: 16.5 }}>DAY {d.day} · {d.theme}</b>
              </div>
              {stops.map((s) => <AlbumStop key={s.ii} it={s.it} rec={s.rec} onMemo={(v) => onMemo(keyOf(di, s.ii), v)} />)}
            </div>
          );
        })}

        {/* 공개 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 'var(--radius-xl)', background: 'var(--mint-50)', border: '1px solid var(--mint-100)', marginTop: 8 }}>
          <Mascot variant="cheer" size={56} style={{ flex: 'none' }} />
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15.5 }}>이 기록, 다른 여행자와 나눠볼까요?</b>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>TripLog에 올리면 내 코스와 사진이 커뮤니티에 공유돼요.</div>
          </div>
          <Button variant="primary" size="lg" leftIcon={<Icon name="globe" size={18} />}
            onClick={() => onPublish({ trip, visitedStops, cover, allPhotos, ratings })}>TripLog에 공개</Button>
        </div>
      </div>
    );
  }

  // ── 메인 ───────────────────────────────────────────────────
  function TodayTrip({ trip, onPublish, onBack }) {
    const baseTrip = trip || { title: '제주 힐링 코스', cover: KK.places[0].img, region: '제주', period: '2박 3일' };
    const days = (baseTrip.plan && baseTrip.plan.days) || KK.aiPlan.days;

    const [mode, setMode] = React.useState('live'); // live | album
    const [di, setDi] = React.useState(0);
    const [visited, setVisited] = React.useState({});
    const [capture, setCapture] = React.useState(null); // {di, ii}

    const items = days[di].items;
    const nextIi = items.findIndex((_, ii) => !visited[keyOf(di, ii)]);
    const nextStop = nextIi >= 0 ? items[nextIi] : null;
    const doneCount = items.filter((_, ii) => visited[keyOf(di, ii)]).length;
    const totalVisited = Object.keys(visited).length;
    const totalStops = days.reduce((a, d) => a + d.items.length, 0);

    const commit = (rec) => {
      setVisited((v) => ({ ...v, [keyOf(capture.di, capture.ii)]: rec }));
      setCapture(null);
    };
    const setMemo = (k, val) => setVisited((v) => ({ ...v, [k]: { ...v[k], memo: val } }));

    return (
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '28px 24px 90px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ds-eyebrow" style={{ marginBottom: 4 }}>{baseTrip.region} · {baseTrip.period}</div>
            <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em' }}>{baseTrip.title}</h1>
          </div>
          {/* live ↔ album 토글 */}
          <div style={{ display: 'inline-flex', padding: 4, background: 'var(--gray-100)', borderRadius: 'var(--radius-pill)', flex: 'none' }}>
            {[{ k: 'live', icon: 'pin', label: '오늘 일정' }, { k: 'album', icon: 'image', label: `여행 기록${totalVisited ? ' ' + totalVisited : ''}` }].map((o) => (
              <button key={o.k} onClick={() => setMode(o.k)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
                background: mode === o.k ? 'var(--surface)' : 'transparent', color: mode === o.k ? 'var(--coral-600)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', boxShadow: mode === o.k ? 'var(--shadow-xs)' : 'none', transition: 'background var(--dur-fast)',
              }}><Icon name={o.icon} size={16} />{o.label}</button>
            ))}
          </div>
        </div>

        {mode === 'live' ? (
          <>
            {/* day chips + 진행 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {days.map((d, i) => {
                const dDone = d.items.every((_, ii) => visited[keyOf(i, ii)]);
                return (
                  <button key={i} onClick={() => setDi(i)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 15px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                    border: '1px solid ' + (di === i ? 'transparent' : 'var(--border)'),
                    background: di === i ? 'var(--coral-500)' : 'var(--surface)', color: di === i ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-sans)',
                  }}>
                    {dDone && <Icon name="check" size={15} color={di === i ? '#fff' : 'var(--mint-500)'} />}
                    DAY {d.day}
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-secondary)' }}>오늘 {doneCount}/{items.length} 곳</span>
            </div>

            {/* 진행 바 */}
            <div style={{ height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--gray-100)', overflow: 'hidden', marginBottom: 22 }}>
              <div style={{ height: '100%', width: `${(doneCount / items.length) * 100}%`, background: 'linear-gradient(90deg, var(--coral-400), var(--coral-500))', borderRadius: 'var(--radius-pill)', transition: 'width var(--dur-slow) var(--ease-spring)' }} />
            </div>

            {nextStop ? (
              <NextStopCard stop={nextStop} idx={nextIi} onCheckIn={() => setCapture({ di, ii: nextIi })} />
            ) : (
              <div style={{ position: 'relative', textAlign: 'center', padding: '36px 24px', borderRadius: 'var(--radius-2xl)', background: 'linear-gradient(135deg, var(--mint-50), var(--sky-50))', border: '1px solid var(--mint-100)', overflow: 'hidden' }}>
                <DotField color="var(--mint-200)" opacity={0.5} />
                <div style={{ position: 'relative' }}>
                  <Mascot variant="cheer" size={104} pop />
                  <h2 style={{ fontSize: 23, fontWeight: 800, marginTop: 8, letterSpacing: '-0.02em' }}>DAY {days[di].day} 코스를 모두 다녀왔어요!</h2>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 6 }}>오늘의 추억이 여행 기록에 차곡차곡 담겼어요.</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
                    {di < days.length - 1 && <Button variant="secondary" size="lg" leftIcon={<Icon name="arrowR" size={18} />} onClick={() => setDi(di + 1)}>다음 날 일정 보기</Button>}
                    <Button variant="primary" size="lg" leftIcon={<Icon name="image" size={18} />} onClick={() => setMode('album')}>여행 기록 보기</Button>
                  </div>
                </div>
              </div>
            )}

            {/* 오늘 동선 */}
            <div style={{ marginTop: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: 16.5, fontWeight: 800 }}>DAY {days[di].day} 동선</h3>
                <Badge tone="neutral" size="sm">{days[di].theme}</Badge>
              </div>
              <TodayList items={items} di={di} visited={visited} />
            </div>
          </>
        ) : (
          <Album trip={baseTrip} days={days} visited={visited} onMemo={setMemo} onPublish={onPublish} />
        )}

        {capture && <CaptureSheet
          stop={days[capture.di].items[capture.ii]}
          onSave={commit}
          onSkip={() => commit({ rating: 0, photos: [], memo: '' })}
          onClose={() => setCapture(null)} />}
      </div>
    );
  }

  window.TodayTrip = TodayTrip;
})();
