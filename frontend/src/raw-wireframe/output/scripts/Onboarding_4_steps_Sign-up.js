// 코스콕 — Onboarding (4 steps) + Sign-up
(function () {
  const { Icon } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button, Input, Checkbox, Stepper, Mascot } = DS;

  const STEPS = [
    { icon: 'compass', tint: 'var(--coral-500)', soft: 'var(--coral-50)', title: '여행지를 둘러보세요', desc: '한국관광공사가 인증한 관광지·맛집·숙소·축제를 지역과 카테고리로 쉽게 찾아봐요.' },
    { icon: 'bookmark', tint: 'var(--mint-500)', soft: 'var(--mint-50)', title: '가고 싶은 곳을 콕 저장하세요', desc: '마음에 드는 장소를 여행 바구니에 콕! 담아두면 코스의 재료가 돼요.', mascot: 'saved' },
    { icon: 'sparkles', tint: 'var(--sky-500)', soft: 'var(--sky-50)', title: 'AI가 코스를 만들어드려요', desc: '저장한 장소와 여행 기간·스타일에 맞춰 AI가 Day별 일정을 짜드려요.' },
    { icon: 'copy', tint: 'var(--amber-500)', soft: 'var(--amber-50)', title: 'TripLog에서 코스를 담아오세요', desc: '다른 여행자의 기록이 마음에 들면, 그 코스를 그대로 내 계획으로 가져올 수 있어요.' },
  ];

  function Scene({ step }) {
    return (
      <div style={{ position: 'relative', height: 240, borderRadius: 'var(--radius-xl)', background: step.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: `2px dashed ${step.tint}`, opacity: 0.25 }} />
        <Mascot variant={step.mascot || 'default'} size={130} />
        <div style={{ position: 'absolute', top: 26, right: 30, width: 56, height: 56, borderRadius: '50%', background: 'var(--surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.tint }}>
          <Icon name={step.icon} size={26} />
        </div>
      </div>
    );
  }

  function SignUp({ onDone, onBack }) {
    const [agree, setAgree] = React.useState(false);
    return (
      <div>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginBottom: 14 }}>
          <Icon name="chevronL" size={18} />뒤로
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>회원가입</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 6, marginBottom: 22 }}>30초면 끝나요. 콕이가 기다리고 있어요!</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="닉네임" placeholder="여행자 닉네임" leftIcon={<Icon name="user" size={18} />} />
          <Input label="이메일" type="email" placeholder="you@example.com" leftIcon={<Icon name="mail" size={18} />} />
          <Input label="비밀번호" type="password" placeholder="8자 이상" leftIcon={<Icon name="lock" size={18} />} hint="영문·숫자 포함 8자 이상" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
            <Checkbox label="(필수) 이용약관 및 개인정보 처리방침에 동의합니다" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <Checkbox label="(선택) 새로운 여행지·이벤트 알림 받기" />
          </div>
          <Button variant="primary" size="lg" fullWidth disabled={!agree} onClick={onDone} style={{ marginTop: 6 }}>
            코스콕 시작하기
          </Button>
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            이미 계정이 있나요? <a href="#" onClick={(e) => { e.preventDefault(); onDone(); }} style={{ color: 'var(--coral-600)', fontWeight: 700 }}>로그인</a>
          </div>
        </div>
      </div>
    );
  }

  function Onboarding({ onComplete }) {
    const [i, setI] = React.useState(0);
    const signup = i >= STEPS.length;

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
        <div style={{ width: 'min(460px, 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={(window.__resources && window.__resources.markSvg) || "../../assets/mark.svg"} alt="" style={{ width: 30, height: 30 }} />
              <b style={{ fontSize: 19, letterSpacing: '-0.02em' }}>코스<span style={{ color: 'var(--coral-500)' }}>콕</span></b>
            </div>
            {!signup && <button onClick={onComplete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>건너뛰기</button>}
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)', padding: 24 }}>
            {!signup ? (
              <div key={i} style={{ animation: 'kok-fade-up var(--dur-base) var(--ease-out)' }}>
                <Scene step={STEPS[i]} />
                <div style={{ padding: '24px 6px 8px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: STEPS[i].tint, marginBottom: 8 }}>STEP {i + 1}</div>
                  <h1 style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{STEPS[i].title}</h1>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: 12 }}>{STEPS[i].desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
                  <Stepper steps={STEPS.length} current={i} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    {i > 0 && <Button variant="ghost" onClick={() => setI(i - 1)}>이전</Button>}
                    <Button variant="primary" rightIcon={<Icon name="arrowR" size={18} />} onClick={() => setI(i + 1)}>
                      {i === STEPS.length - 1 ? '시작하기' : '다음'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <SignUp onDone={onComplete} onBack={() => setI(STEPS.length - 1)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  window.Onboarding = Onboarding;
})();
