// 코스콕 — App shell: NavBar, BasketDrawer, Toaster
(function () {
  const { Icon, KK } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button, Avatar, Badge, PlaceCard } = DS;

  const NAV = [
    { key: 'explore', label: '여행지 탐색', icon: 'compass' },
    { key: 'planner', label: 'AI 플래너', icon: 'sparkles' },
    { key: 'trips', label: '내 여행', icon: 'route' },
    { key: 'today', label: '오늘의 여행', icon: 'sun' },
    { key: 'triplog', label: 'TripLog', icon: 'users' },
  ];

  function NavBar({ view, onNav, basketCount, onOpenBasket }) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,249,244,0.85)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', height: 68, padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <button onClick={() => onNav('explore')} style={{
            display: 'flex', alignItems: 'center', gap: 9, border: 'none', background: 'none', cursor: 'pointer', padding: 0,
          }}>
            <img src={(window.__resources && window.__resources.markSvg) || "../../assets/mark.svg"} alt="" style={{ width: 34, height: 34 }} />
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--gray-900)' }}>
              코스<span style={{ color: 'var(--coral-500)' }}>콕</span>
            </span>
          </button>

          <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            {NAV.map((n) => {
              const on = view === n.key;
              return (
                <button key={n.key} onClick={() => onNav(n.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 14px',
                  border: 'none', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                  background: on ? 'var(--coral-50)' : 'transparent',
                  color: on ? 'var(--coral-700)' : 'var(--text-secondary)',
                  fontWeight: on ? 700 : 500, fontSize: 15, fontFamily: 'var(--font-sans)',
                  transition: 'background var(--dur-fast) var(--ease-out)',
                }}>
                  <Icon name={n.icon} size={18} />
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div style={{ flex: 1 }} />

          <button onClick={onOpenBasket} aria-label="여행 바구니" style={{
            position: 'relative', width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border)',
            background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}>
            <Icon name="bag" size={20} />
            {basketCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px',
                borderRadius: 'var(--radius-pill)', background: 'var(--coral-500)', color: '#fff',
                fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-primary)',
              }}>{basketCount}</span>
            )}
          </button>
          <Avatar name="나" size={40} ring />
        </div>
      </header>
    );
  }

  function BasketDrawer({ open, places, onClose, onRemove, onPlan }) {
    return (
      <>
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, zIndex: 50, background: 'var(--overlay-scrim)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity var(--dur-base) var(--ease-out)',
        }} />
        <aside style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, maxWidth: '92vw', zIndex: 51,
          background: 'var(--bg-base)', boxShadow: 'var(--shadow-xl)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--dur-slow) var(--ease-out)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
            <Icon name="bag" size={22} color="var(--coral-500)" />
            <h2 style={{ fontSize: 19, fontWeight: 800 }}>여행 바구니</h2>
            <Badge tone="coral" solid>{places.length}</Badge>
            <div style={{ flex: 1 }} />
            <button onClick={onClose} aria-label="닫기" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Icon name="x" size={22} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {places.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 15 }}>
                아직 담은 장소가 없어요.<br />마음에 드는 곳을 콕 찍어보세요.
              </div>
            ) : places.map((p) => (
              <div key={p.id} style={{
                display: 'flex', gap: 12, padding: 10, background: 'var(--surface)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', alignItems: 'center',
              }}>
                <img src={p.img} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{p.region}</div>
                </div>
                <button onClick={() => onRemove(p.id)} aria-label="빼기" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <Icon name="x" size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: 18, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <Button variant="ai" size="lg" fullWidth disabled={places.length === 0}
              leftIcon={<Icon name="sparkles" size={18} />} onClick={onPlan}>
              {places.length}곳으로 AI 코스 짜기
            </Button>
          </div>
        </aside>
      </>
    );
  }

  function Toaster({ toast }) {
    if (!toast) return null;
    const { Toast } = DS;
    return (
      <div style={{ position: 'fixed', left: '50%', bottom: 36, transform: 'translateX(-50%)', zIndex: 70 }}>
        <Toast tone={toast.tone} icon={<Icon name={toast.icon || 'check'} size={14} />} message={toast.message} action={toast.action} />
      </div>
    );
  }

  window.Shell = { NavBar, BasketDrawer, Toaster, NAV };
})();
