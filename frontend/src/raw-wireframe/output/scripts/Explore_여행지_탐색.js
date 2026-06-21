// 코스콕 — Explore (여행지 탐색)
(function () {
  const { Icon, KK } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Tabs, FilterChip, SegmentedControl, PlaceCard, Mascot } = DS;

  function Hero({ query, onQuery }) {
    return (
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, #FFE2D6 0%, #FFF9F4 55%, #D2E7FF 130%)',
        padding: '40px 44px', marginBottom: 28,
      }}>
        <div style={{ maxWidth: 560 }}>
          <div className="ds-eyebrow" style={{ marginBottom: 12 }}>한국관광공사 인증 여행지 · TripLog</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            콕! 찍어 담는<br />나만의 여행 코스
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 14, lineHeight: 1.6 }}>
            가고 싶은 장소를 저장하면, AI가 일정에 맞게 코스를 만들어드려요.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, padding: '6px 6px 6px 18px',
            background: 'var(--surface)', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-md)', maxWidth: 460,
          }}>
            <Icon name="search" size={20} color="var(--text-muted)" />
            <input value={query} onChange={(e) => onQuery(e.target.value)}
              placeholder="제주, 성산일출봉, 고기국수…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontFamily: 'var(--font-sans)', minWidth: 0 }} />
            <button style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--coral-500)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              boxShadow: 'var(--shadow-primary)',
            }}><Icon name="arrowR" size={20} /></button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: 36, bottom: -8, opacity: 0.96 }}>
          <Mascot size={150} />
        </div>
      </div>
    );
  }

  function Explore({ basket, onToggleSave, onOpenPlace }) {
    const [region, setRegion] = React.useState('제주');
    const [cat, setCat] = React.useState('all');
    const [sort, setSort] = React.useState('추천순');
    const [query, setQuery] = React.useState('');

    const catLabel = { all: null, spot: '관광지', food: '음식점', stay: '숙박', fest: '축제' };
    let list = KK.places.filter((p) => !catLabel[cat] || p.cat === catLabel[cat]);
    if (query.trim()) list = list.filter((p) => (p.title + p.region + p.tags.join()).includes(query.trim()));
    if (sort === '평점순') list = [...list].sort((a, b) => b.rating - a.rating);

    const counts = KK.places.reduce((m, p) => { m[p.cat] = (m[p.cat] || 0) + 1; return m; }, {});

    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 80px' }}>
        <Hero query={query} onQuery={setQuery} />

        {/* region chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 18 }}>
          {KK.regions.map((r) => (
            <FilterChip key={r} selected={region === r} onClick={() => setRegion(r)}
              leftIcon={r !== '전체' ? <Icon name="pin" size={15} /> : null}>{r}</FilterChip>
          ))}
        </div>

        {/* category tabs + sort */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
          <Tabs value={cat} onChange={setCat} items={[
            { value: 'all', label: '전체' },
            { value: 'spot', label: '관광지', count: counts['관광지'] },
            { value: 'food', label: '음식점', count: counts['음식점'] },
            { value: 'stay', label: '숙박', count: counts['숙박'] },
            { value: 'fest', label: '축제', count: counts['축제'] },
          ]} />
          <SegmentedControl options={['추천순', '평점순']} value={sort} onChange={setSort} size="sm" />
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 20 }}>
          {list.map((p) => (
            <PlaceCard key={p.id}
              image={p.img} category={p.cat} title={p.title} region={p.region}
              rating={p.rating} reviewCount={p.reviews} meta={p.meta}
              saved={basket.has(p.id)} onSave={() => onToggleSave(p)}
              onClick={() => onOpenPlace(p)} />
          ))}
        </div>
      </div>
    );
  }

  window.Explore = Explore;
})();
