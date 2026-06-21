// 코스콕 — shared kit helpers (vibe + reusable bits across screens)
(function () {
  const { Icon, KK } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Badge } = DS;

  // ── money ────────────────────────────────────────────────
  const won = (n) => (n || 0).toLocaleString('ko-KR') + '원';

  const catColor = { '관광지': 'var(--coral-500)', '음식점': 'var(--amber-500)', '숙박': 'var(--sky-500)', '축제': 'var(--mint-500)' };
  const catTone = (c) => c === '음식점' ? 'amber' : c === '숙박' ? 'sky' : c === '축제' ? 'mint' : 'coral';
  const catSoft = { '관광지': 'var(--coral-50)', '음식점': 'var(--amber-50)', '숙박': 'var(--sky-50)', '축제': 'var(--mint-50)' };

  // ── playful dotted field (decorative) ────────────────────
  function DotField({ color = 'var(--coral-200)', size = 16, opacity = 0.5, style }) {
    return (
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity,
        backgroundImage: `radial-gradient(${color} 2px, transparent 2px)`,
        backgroundSize: `${size}px ${size}px`,
        ...style,
      }} />
    );
  }

  // ── color band (a soft rounded section background) ───────
  function Band({ tone = 'coral', children, style }) {
    const map = {
      coral: 'var(--coral-50)', sky: 'var(--sky-50)', mint: 'var(--mint-50)', amber: 'var(--amber-50)', cream: '#FFFCFA',
    };
    return (
      <div style={{ position: 'relative', background: map[tone], borderRadius: 'var(--radius-2xl)', overflow: 'hidden', ...style }}>
        {children}
      </div>
    );
  }

  // ── transport row between two stops ──────────────────────
  function MoveRow({ move, compact }) {
    if (!move) return null;
    const meta = (KK.moveModes && KK.moveModes[move.mode]) || { icon: 'car', label: move.mode };
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, padding: compact ? '2px 0' : '5px 10px',
        borderRadius: 'var(--radius-pill)', background: compact ? 'transparent' : 'var(--sky-50)',
        color: 'var(--sky-700)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        <Icon name={meta.icon} size={15} />
        <span>{move.time}</span>
        {move.cost > 0 && <span style={{ color: 'var(--sky-600)' }}>· {won(move.cost)}</span>}
      </div>
    );
  }

  // ── cost summary card (breakdown by 카테고리 + 교통/고정) ──
  function CostSummary({ days, fixedCost, people = 1, dense }) {
    const sum = { '관광지': 0, '음식점': 0, '숙박': 0, '축제': 0, move: 0 };
    days.forEach((d) => d.items.forEach((it) => {
      sum[it.cat] = (sum[it.cat] || 0) + (it.cost || 0);
      if (it.move) sum.move += it.move.cost || 0;
    }));
    const fixed = (fixedCost ? (fixedCost.rental || 0) + (fixedCost.fuel || 0) : 0);
    const perPerson = sum['관광지'] + sum['음식점'] + sum['숙박'] + sum['축제'] + sum.move;
    const total = perPerson * people + fixed;

    const rows = [
      { label: '숙박', icon: 'bed', v: sum['숙박'], color: 'var(--sky-500)' },
      { label: '식비', icon: 'utensils', v: sum['음식점'], color: 'var(--amber-500)' },
      { label: '관광·입장', icon: 'ticket', v: sum['관광지'] + sum['축제'], color: 'var(--coral-500)' },
      { label: '교통·렌터카', icon: 'car', v: sum.move + fixed, color: 'var(--mint-500)' },
    ];
    const max = Math.max(...rows.map((r) => r.v), 1);

    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', padding: dense ? 18 : 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--mint-50)', color: 'var(--mint-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wallet" size={19} />
          </span>
          <b style={{ fontSize: 16 }}>예상 경비</b>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>{people}인 기준</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 26, color: r.color, flex: 'none' }}><Icon name={r.icon} size={18} /></span>
              <span style={{ fontSize: 13.5, fontWeight: 600, width: 84, flex: 'none' }}>{r.label}</span>
              <div style={{ flex: 1, height: 7, borderRadius: 99, background: 'var(--gray-50)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(8, (r.v / max) * 100)}%`, height: '100%', borderRadius: 99, background: r.color }} />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, width: 86, textAlign: 'right', flex: 'none' }}>{won(r.v)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 14, borderTop: '1px dashed var(--border)' }}>
          <b style={{ fontSize: 15 }}>총 합계</b>
          <div style={{ flex: 1 }} />
          <b style={{ fontSize: 24, fontWeight: 800, color: 'var(--coral-600)', letterSpacing: '-0.02em' }}>{won(total)}</b>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
          1인 {won(perPerson)} · 렌터카·주유 {won(fixed)} 포함
        </div>
      </div>
    );
  }

  // ── image downscale → dataURL ────────────────────────────
  function fileToThumb(file, maxDim = 1200) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const im = new Image();
        im.onload = () => {
          let { width, height } = im;
          const scale = Math.min(1, maxDim / Math.max(width, height));
          width = Math.round(width * scale); height = Math.round(height * scale);
          const c = document.createElement('canvas');
          c.width = width; c.height = height;
          c.getContext('2d').drawImage(im, 0, 0, width, height);
          resolve(c.toDataURL('image/jpeg', 0.82));
        };
        im.onerror = () => resolve(reader.result);
        im.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ── photo uploader (file input → thumbs, removable) ──────
  function PhotoUploader({ photos = [], onChange, max = 4, tileSize = 92, addLabel = '사진 추가' }) {
    const inputRef = React.useRef(null);
    const [busy, setBusy] = React.useState(false);

    const pick = async (e) => {
      const files = Array.from(e.target.files || []).slice(0, max - photos.length);
      if (!files.length) return;
      setBusy(true);
      const thumbs = await Promise.all(files.map((f) => fileToThumb(f)));
      onChange([...photos, ...thumbs]);
      setBusy(false);
      e.target.value = '';
    };
    const remove = (i) => onChange(photos.filter((_, idx) => idx !== i));

    return (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {photos.map((src, i) => (
          <div key={i} style={{ position: 'relative', width: tileSize, height: tileSize }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
            <button onClick={() => remove(i)} aria-label="사진 삭제" style={{
              position: 'absolute', top: -7, right: -7, width: 24, height: 24, borderRadius: '50%',
              border: '2px solid var(--surface)', background: 'var(--gray-900)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)',
            }}><Icon name="x" size={13} /></button>
          </div>
        ))}
        {photos.length < max && (
          <button onClick={() => inputRef.current && inputRef.current.click()} disabled={busy} style={{
            width: tileSize, height: tileSize, borderRadius: 'var(--radius-md)', cursor: busy ? 'wait' : 'pointer',
            border: '2px dashed var(--coral-200)', background: 'var(--coral-50)', color: 'var(--coral-600)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12,
          }}>
            <Icon name={busy ? 'clock' : 'camera'} size={22} />
            {busy ? '불러오는 중' : addLabel}
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={pick} style={{ display: 'none' }} />
      </div>
    );
  }

  // ── tiny rating stars (read-only or editable) ────────────
  function StarPick({ value = 0, onChange, size = 22, readOnly }) {
    const Star = ({ on }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}
        fill={on ? 'var(--star)' : 'var(--gray-200)'}>
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
      </svg>
    );
    return (
      <div style={{ display: 'inline-flex', gap: 3 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} disabled={readOnly} onClick={() => onChange && onChange(n)} aria-label={`${n}점`} style={{
            border: 'none', background: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer', lineHeight: 0,
          }}>
            <Star on={n <= value} />
          </button>
        ))}
      </div>
    );
  }

  window.Kit = { won, catColor, catTone, catSoft, DotField, Band, MoveRow, CostSummary, PhotoUploader, StarPick, fileToThumb };
})();
