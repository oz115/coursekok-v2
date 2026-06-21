// 코스콕 — AI Planner (저장 장소 기반 일정 생성 + 챗봇 수정 + 이동수단·경비)
(function () {
  const { Icon, KK } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button, Select, Badge, Mascot, SegmentedControl } = DS;
  const { won, catTone, catColor, MoveRow, CostSummary, DotField } = window.Kit;
  const CourseMap = window.CourseMap;
  const CourseMapToggle = window.CourseMapToggle;

  const clone = (o) => JSON.parse(JSON.stringify(o));

  // 하나의 정차지(stop)
  function Stop({ it, last, onRemove }) {
    return (
      <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
        <div style={{ width: 52, flex: 'none', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', paddingTop: 14 }}>{it.time}</div>
        <div style={{ position: 'relative', flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16 }}>
          <span style={{ width: 13, height: 13, borderRadius: '50%', background: catColor[it.cat], border: '2.5px solid var(--surface)', boxShadow: '0 0 0 1.5px ' + catColor[it.cat] }} />
          {!last && <span style={{ flex: 1, width: 2, background: 'var(--border)', marginTop: 4 }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 4 : 14 }}>
          <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
            <img src={it.img} alt="" style={{ width: 58, height: 58, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <b style={{ fontSize: 15.5 }}>{it.title}</b>
                <Badge tone={catTone(it.cat)} size="sm">{it.cat}</Badge>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{it.note}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flex: 'none' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', color: it.cost ? 'var(--text-primary)' : 'var(--mint-600)' }}>{it.cost ? won(it.cost) : '무료'}</span>
              {onRemove && (
                <button onClick={onRemove} aria-label="제외" style={{ border: 'none', background: 'var(--gray-50)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x" size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DayTimeline({ day, onRemoveItem }) {
    return (
      <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--coral-500)', color: '#fff', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)' }}>{day.day}</span>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--coral-600)', fontWeight: 800, letterSpacing: '0.04em' }}>DAY {day.day}</div>
            <div style={{ fontWeight: 700, fontSize: 17, whiteSpace: 'nowrap' }}>{day.theme}</div>
          </div>
          <div style={{ flex: 1 }} />
          <Badge tone="neutral" size="sm">{day.items.length}곳</Badge>
        </div>
        <div style={{ padding: '6px 18px 14px' }}>
          {day.items.map((it, i) => (
            <React.Fragment key={i}>
              {it.move && (
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 52, flex: 'none' }} />
                  <div style={{ width: 13, flex: 'none', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ width: 2, background: 'repeating-linear-gradient(var(--sky-200) 0 5px, transparent 5px 10px)', flex: 1, margin: '3px 0' }} />
                  </div>
                  <div style={{ flex: 1, padding: '7px 0' }}><MoveRow move={it.move} /></div>
                </div>
              )}
              <Stop it={it} last={i === day.items.length - 1} onRemove={onRemoveItem ? () => onRemoveItem(i) : null} />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // ── 콕이 챗봇 수정 ─────────────────────────────────────────
  const QUICK = ['숙소 저렴하게 바꿔줘', '2일차에 카페 추가', '더 여유롭게', '맛집 한 곳 더'];

  function applyIntent(plan, text) {
    const p = clone(plan);
    const t = text.replace(/\s/g, '');
    // 저렴하게
    if (/(저렴|아껴|싸게|줄여|예산|비용)/.test(t)) {
      let changed = false;
      p.days.forEach((d) => d.items.forEach((it) => {
        if (it.cat === '숙박' && it.cost > 90000) { it.title = '제주 게스트하우스'; it.note = '가성비 좋은 감성 숙소'; it.cost = 55000; changed = true; }
      }));
      return { plan: p, reply: changed ? '숙소를 가성비 게스트하우스로 바꿨어요. 1박에 12.5만원 아꼈네요! 💸 경비가 확 줄었어요.' : '이미 알뜰한 코스예요. 식비를 줄여볼까요?' };
    }
    // 카페 추가
    if (/(카페|커피|디저트)/.test(t)) {
      const dayIdx = /3일|셋|day3/i.test(t) ? 2 : /2일|둘|day2/i.test(t) ? 1 : 0;
      const d = p.days[dayIdx] || p.days[0];
      d.items.splice(Math.max(1, d.items.length - 1), 0, { time: '16:00', title: '오션뷰 카페', cat: '음식점', note: '바다 보며 커피 한 잔', img: (window.__resources && window.__resources.img_cafejeju) || 'https://picsum.photos/seed/cafejeju/800/600', cost: 8000, move: { mode: '차', time: '10분', cost: 0 } });
      return { plan: p, reply: `${d.day}일차에 바다 보이는 카페를 넣었어요 ☕ 오후 일정에 여유가 생겼죠?` };
    }
    // 맛집/음식 추가
    if (/(맛집|음식|먹|식당|점심|저녁)/.test(t)) {
      const d = p.days[1] || p.days[0];
      d.items.splice(d.items.length - 1, 0, { time: '18:30', title: '제주 흑돼지 맛집', cat: '음식점', note: '두툼한 근고기 한 점', img: (window.__resources && window.__resources.img_blackpork) || 'https://picsum.photos/seed/blackpork/800/600', cost: 22000, move: { mode: '차', time: '15분', cost: 0 } });
      return { plan: p, reply: '근처 흑돼지 맛집을 추가했어요 🐷 저녁이 든든해지겠네요!' };
    }
    // 여유롭게 — 가장 빡빡한 날의 마지막 정차지 제거
    if (/(여유|천천|느긋|줄이|빼)/.test(t)) {
      let target = p.days.reduce((a, b) => (b.items.length > a.items.length ? b : a), p.days[0]);
      if (target.items.length > 1) { const removed = target.items.pop(); return { plan: p, reply: `${target.day}일차에서 '${removed.title}'를 빼서 한결 여유로워졌어요 🌿 쉬엄쉬엄 다녀오세요.` }; }
    }
    return { plan: p, reply: '이렇게 적어보세요 — "숙소 저렴하게", "2일차에 카페 추가", "더 여유롭게" 처럼요. 바로 코스를 손봐드릴게요!' };
  }

  function ChatDock({ plan, setPlan }) {
    const [msgs, setMsgs] = React.useState([{ role: 'kok', text: '코스가 마음에 드세요? 바꾸고 싶은 점을 말해주면 제가 바로 손봐드릴게요 ✨' }]);
    const [text, setText] = React.useState('');
    const bodyRef = React.useRef(null);

    const send = (raw) => {
      const v = (raw || text).trim();
      if (!v) return;
      const { plan: next, reply } = applyIntent(plan, v);
      setMsgs((m) => [...m, { role: 'me', text: v }, { role: 'kok', text: reply }]);
      setPlan(next);
      setText('');
      requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
    };

    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--sky-100)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'linear-gradient(100deg, var(--sky-50), var(--mint-50))', borderBottom: '1px solid var(--sky-100)' }}>
          <Mascot variant="guide" size={38} />
          <div>
            <b style={{ fontSize: 15 }}>콕이에게 수정 요청하기</b>
            <div style={{ fontSize: 12.5, color: 'var(--sky-700)', fontWeight: 600 }}>대화로 코스를 자유롭게 바꿔보세요</div>
          </div>
        </div>
        <div ref={bodyRef} style={{ maxHeight: 230, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'me' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 16, fontSize: 14.5, lineHeight: 1.5,
                background: m.role === 'me' ? 'var(--coral-500)' : 'var(--gray-50)',
                color: m.role === 'me' ? '#fff' : 'var(--text-primary)',
                borderBottomRightRadius: m.role === 'me' ? 4 : 16, borderBottomLeftRadius: m.role === 'me' ? 16 : 4,
              }}>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 14px 12px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)} style={{ padding: '7px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--sky-200)', background: 'var(--sky-50)', color: 'var(--sky-700)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>{q}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 12px 14px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-50)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-pill)', padding: '4px 4px 4px 16px' }}>
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="예) 3일차에 카페 추가해줘"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, fontFamily: 'var(--font-sans)', minWidth: 0 }} />
            <button onClick={() => send()} aria-label="보내기" style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: text.trim() ? 'var(--coral-500)' : 'var(--gray-200)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name="send" size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function AIPlanner({ basketPlaces, onSavePlan, onNav }) {
    const [stage, setStage] = React.useState('setup');
    const [period, setPeriod] = React.useState('2박 3일');
    const [style, setStyle] = React.useState('힐링');
    const [pace, setPace] = React.useState('여유롭게');
    const [people, setPeople] = React.useState(2);
    const [plan, setPlan] = React.useState(() => clone(KK.aiPlan));

    const run = () => { setStage('loading'); setTimeout(() => setStage('result'), 1900); };
    const [resultView, setResultView] = React.useState('list');
    const removeItem = (dayIdx, itemIdx) => {
      setPlan((p) => { const n = clone(p); n.days[dayIdx].items.splice(itemIdx, 1); return n; });
    };

    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 90px' }}>
        {stage === 'setup' && (
          <>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', background: 'linear-gradient(120deg, var(--sky-50), var(--mint-50) 70%)', padding: '26px 30px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
              <DotField color="var(--sky-200)" opacity={0.5} />
              <Mascot variant="guide" size={92} style={{ position: 'relative', flex: 'none' }} />
              <div style={{ position: 'relative' }}>
                <Badge tone="sky" leftIcon={<Icon name="sparkles" size={12} />}>AI PLANNER</Badge>
                <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>콕이가 코스를 짜드릴게요</h1>
                <p style={{ fontSize: 15.5, color: 'var(--text-secondary)', marginTop: 4 }}>저장한 장소와 조건만 알려주면 이동·경비까지 한 번에!</p>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', padding: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon name="bag" size={16} color="var(--coral-500)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>여행 바구니 · {basketPlaces.length}곳</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {basketPlaces.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>먼저 여행지 탐색에서 장소를 담아주세요.</span>}
                {basketPlaces.map((p) => (
                  <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px 6px 6px', background: 'var(--coral-50)', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 600 }}>
                    <img src={p.img} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />{p.title}
                  </span>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                <Select label="여행 기간" options={['당일치기', '1박 2일', '2박 3일', '3박 4일']} value={period} onChange={(e) => setPeriod(e.target.value)} />
                <Select label="여행 스타일" options={['힐링', '액티비티', '미식', '감성']} value={style} onChange={(e) => setStyle(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'end', marginBottom: 26 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>하루 일정 밀도</div>
                  <SegmentedControl options={['여유롭게', '적당히', '알차게']} value={pace} onChange={setPace} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>인원</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
                    <button onClick={() => setPeople((n) => Math.max(1, n - 1))} style={stepBtn}><Icon name="minus" size={16} /></button>
                    <span style={{ width: 40, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>{people}</span>
                    <button onClick={() => setPeople((n) => Math.min(9, n + 1))} style={stepBtn}><Icon name="plus" size={16} /></button>
                  </div>
                </div>
              </div>

              <Button variant="ai" size="lg" fullWidth disabled={basketPlaces.length === 0}
                leftIcon={<Icon name="sparkles" size={20} />} onClick={run}>AI로 코스 생성하기</Button>
            </div>
          </>
        )}

        {stage === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, padding: '90px 0' }}>
            <div style={{ animation: 'kok-pop 1.1s var(--ease-spring) infinite' }}><Mascot variant="guide" size={130} /></div>
            <div style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}>저장한 {basketPlaces.length}곳을 {period} {style} 코스로 짜는 중…</div>
            <div style={{ width: 220, height: 6, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--sky-500), var(--mint-400))', animation: 'kokload 1.9s var(--ease-out) forwards' }} />
            </div>
            <style>{`@keyframes kokload{from{width:8%}to{width:100%}}`}</style>
          </div>
        )}

        {stage === 'result' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <Mascot variant="cheer" size={72} />
              <div style={{ flex: 1 }}>
                <Badge tone="sky" leftIcon={<Icon name="sparkles" size={12} />}>AI 추천 코스</Badge>
                <h1 style={{ fontSize: 27, fontWeight: 800, marginTop: 8, letterSpacing: '-0.02em' }}>{period} {style} 제주 코스</h1>
              </div>
              <Button variant="ghost" size="sm" leftIcon={<Icon name="undo" size={16} />} onClick={() => { setPlan(clone(KK.aiPlan)); }}>처음으로</Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>코스 한눈에 보기</h2>
              <div style={{ flex: 1 }} />
              <CourseMapToggle view={resultView} onChange={setResultView} />
            </div>

            {resultView === 'map' ? (
              <div style={{ marginBottom: 18 }}>
                <CourseMap days={plan.days} height={380} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 18 }}>
                {plan.days.map((d, di) => <DayTimeline key={di} day={d} onRemoveItem={(ii) => removeItem(di, ii)} />)}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <CostSummary days={plan.days} fixedCost={plan.fixedCost} people={people} />
            </div>

            <div style={{ marginBottom: 22 }}>
              <ChatDock plan={plan} setPlan={setPlan} />
            </div>

            <div style={{ display: 'flex', gap: 12, position: 'sticky', bottom: 18 }}>
              <Button variant="primary" size="lg" fullWidth leftIcon={<Icon name="route" size={18} />}
                onClick={() => onSavePlan({ ...plan, period, style, people })}>이 코스로 내 여행 만들기</Button>
              <Button variant="secondary" size="lg" leftIcon={<Icon name="share" size={18} />}>공유</Button>
            </div>
          </>
        )}
      </div>
    );
  }

  const stepBtn = { width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--gray-50)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  window.AIPlanner = AIPlanner;
})();
