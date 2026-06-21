// 코스콕 — PlaceDetail overlay
(function () {
  const { Icon } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button, Badge, Rating, IconButton } = DS;

  function PlaceDetail({ place, saved, onToggleSave, onClose }) {
    if (!place) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto' }}>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--overlay-scrim)' }} />
        <div style={{
          position: 'relative', width: 'min(720px, 94vw)', margin: '48px 0', background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)',
          animation: 'kok-fade-up var(--dur-base) var(--ease-out)',
        }}>
          <div style={{ position: 'relative', height: 320 }}>
            <img src={place.img} alt={place.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,22,17,0.5), transparent 45%)' }} />
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <IconButton aria-label="닫기" variant="glass" onClick={onClose}><Icon name="x" size={20} /></IconButton>
            </div>
            <div style={{ position: 'absolute', left: 22, bottom: 18, right: 22 }}>
              <Badge tone="coral" solid>{place.cat}</Badge>
              <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginTop: 10, letterSpacing: '-0.02em' }}>{place.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.92)', fontSize: 15, marginTop: 4 }}>
                <Icon name="pin" size={16} />{place.region}
              </div>
            </div>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <Rating value={place.rating} showValue count={place.reviews} size={20} />
              <span style={{ width: 1, height: 18, background: 'var(--border)' }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                <Icon name="clock" size={16} color="var(--text-muted)" />{place.meta}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--mint-600)', fontSize: 14, fontWeight: 600 }}>
                <Icon name="check" size={16} />관광공사 인증
              </span>
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 18 }}>{place.desc}</p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
              {place.tags.map((t) => (
                <span key={t} style={{ padding: '6px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-pill)', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>#{t}</span>
              ))}
            </div>

            {/* map placeholder */}
            <div style={{
              height: 150, borderRadius: 'var(--radius-md)', marginBottom: 22, position: 'relative', overflow: 'hidden',
              background: 'repeating-linear-gradient(45deg, var(--gray-50), var(--gray-50) 14px, var(--gray-100) 14px, var(--gray-100) 28px)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <Icon name="map" size={26} />
                <span style={{ fontSize: 13 }}>지도 영역 (Kakao/관광공사 좌표)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant={saved ? 'secondary' : 'primary'} size="lg" fullWidth
                leftIcon={<Icon name={saved ? 'check' : 'bookmark'} size={18} />}
                onClick={() => onToggleSave(place)}>
                {saved ? '바구니에 담김' : '장소 저장'}
              </Button>
              <Button variant="secondary" size="lg" leftIcon={<Icon name="share" size={18} />}>공유</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  window.PlaceDetail = PlaceDetail;
})();
