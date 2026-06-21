// 코스콕 — App router & state
(function () {
  let Shell, Explore, PlaceDetail, AIPlanner, MyTrips, TodayTrip, TripLogFeed, Onboarding, KK;

  function App() {
    const [onboarded, setOnboarded] = React.useState(false);
    const [view, setView] = React.useState('explore');
    const [basket, setBasket] = React.useState(() => new Map());
    const [basketOpen, setBasketOpen] = React.useState(false);
    const [place, setPlace] = React.useState(null);
    const [toast, setToast] = React.useState(null);
    const [savedTrips, setSavedTrips] = React.useState([]);
    const [activeTrip, setActiveTrip] = React.useState(null); // 오늘의 여행으로 따라가는 여행
    const toastTimer = React.useRef(null);

    const fireToast = (t) => {
      setToast(t);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3200);
    };

    const toggleSave = (p) => {
      setBasket((prev) => {
        const next = new Map(prev);
        if (next.has(p.id)) {
          next.delete(p.id);
          fireToast({ tone: 'default', icon: 'x', message: `${p.title} 저장을 취소했어요` });
        } else {
          next.set(p.id, p);
          fireToast({ tone: 'success', icon: 'check', message: `${p.title}을(를) 바구니에 담았어요`, action: { label: '바구니', onClick: () => setBasketOpen(true) } });
        }
        return next;
      });
    };

    const removeFromBasket = (id) => setBasket((prev) => { const n = new Map(prev); n.delete(id); return n; });

    const goPlanner = () => { setBasketOpen(false); setView('planner'); };

    const savePlan = (plan) => {
      const trip = {
        ...KK.tripLogs[0],
        title: `${plan.period || '2박 3일'} ${plan.style || '힐링'} 제주 코스`,
        cover: (basketPlaces[0] && basketPlaces[0].img) || KK.places[0].img,
        region: '제주', period: plan.period || '2박 3일', days: (plan.days && plan.days.length) || 3,
        places: (plan.days ? plan.days.reduce((a, d) => a + d.items.length, 0) : basket.size) || 8,
        visibility: 'private', plan,
      };
      setSavedTrips((p) => [trip, ...p]);
      setView('trips');
      fireToast({ tone: 'success', icon: 'check', message: '내 여행에 코스를 저장했어요 · 이제 사진과 글을 남겨보세요' });
    };

    // 오늘의 여행 시작
    const startTrip = (trip) => { setActiveTrip(trip); setView('today'); };

    // 여행 기록 → TripLog 공개
    const publishAlbum = ({ trip, visitedStops, cover, allPhotos, ratings }) => {
      const route = visitedStops.map((s) => s.it.title);
      const firstMemo = (visitedStops.find((s) => s.rec.memo) || {}).rec;
      const log = {
        id: 'mine-' + Date.now(), title: trip.title, author: '나', avatar: 'me',
        region: trip.region || '제주', period: trip.period || '2박 3일', style: '기록',
        cover, photos: allPhotos.length ? allPhotos : [cover],
        route, rating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 5,
        likes: 0, saves: 0, comments: 0, days: (trip.plan && trip.plan.days ? trip.plan.days.length : 3),
        places: route.length, date: '방금 전',
        excerpt: (firstMemo && firstMemo.memo) || '직접 다녀온 고의 기록이에요.',
      };
      KK.tripLogs = [log, ...KK.tripLogs];
      setView('triplog');
      fireToast({ tone: 'success', icon: 'globe', message: 'TripLog에 여행 기록을 공개했어요' });
    };

    const setTripVisibility = (trip, v) => {
      setSavedTrips((p) => p.map((t) => (t === trip || t.title === trip.title ? { ...t, visibility: v } : t)));
      fireToast(v === 'public'
        ? { tone: 'success', icon: 'globe', message: 'TripLog에 공개했어요 · 다른 여행자가 볼 수 있어요' }
        : { tone: 'default', icon: 'lock', message: '비공개로 전환했어요 · 나만 볼 수 있어요' });
    };

    const addCourse = (log) => {
      // copy the log's course into the basket
      const next = new Map(basket);
      KK.places.slice(0, 6).forEach((p) => next.set(p.id, p));
      setBasket(next);
      setView('planner');
      fireToast({ tone: 'success', icon: 'copy', message: `${log.author}님의 코스를 담았어요 · AI로 다시 조정해보세요` });
    };

    const basketPlaces = Array.from(basket.values());

    if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

    return (
      <div style={{ minHeight: '100vh' }}>
        <Shell.NavBar view={view} onNav={setView} basketCount={basket.size} onOpenBasket={() => setBasketOpen(true)} />

        {view === 'explore' && <Explore basket={basket} onToggleSave={toggleSave} onOpenPlace={setPlace} />}
        {view === 'planner' && <AIPlanner basketPlaces={basketPlaces} onSavePlan={savePlan} onNav={setView} />}
        {view === 'trips' && <MyTrips savedTrips={savedTrips} onWriteLog={() => setView('triplog')} onVisibility={setTripVisibility} onStartTrip={startTrip} />}
        {view === 'today' && <TodayTrip trip={activeTrip} onPublish={publishAlbum} />}
        {view === 'triplog' && <TripLogFeed onAddCourse={addCourse} />}

        <PlaceDetail place={place} saved={place && basket.has(place.id)} onToggleSave={toggleSave} onClose={() => setPlace(null)} />
        <Shell.BasketDrawer open={basketOpen} places={basketPlaces} onClose={() => setBasketOpen(false)} onRemove={removeFromBasket} onPlan={goPlanner} />
        <Shell.Toaster toast={toast} />
      </div>
    );
  }

  function mount() {
    if (window.__kkMounted) { return; }
    const keys = ['Shell', 'Explore', 'PlaceDetail', 'AIPlanner', 'MyTrips', 'TodayTrip', 'TripLogFeed', 'Onboarding', 'KK'];
    if (!keys.every((k) => window[k])) { return setTimeout(mount, 30); }
    window.__kkMounted = true;
    ({ Shell, Explore, PlaceDetail, AIPlanner, MyTrips, TodayTrip, TripLogFeed, Onboarding, KK } = window);
    ReactDOM.createRoot(document.getElementById('kk-root')).render(<App />);
  }
  mount();
})();
