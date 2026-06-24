<script setup>
/**
 * PlannerMap.vue — AI Planner 결과 전용 카카오맵
 * ─────────────────────────────────────────────────────────────
 * ExploreMap.vue 방식 + 카카오모빌리티 Directions API로
 * 실제 도로 경로(vertexes)를 받아 폴리라인으로 그립니다.
 * API 실패 시 보간 직선으로 폴백합니다.
 *
 * Props:
 *   - days      : Array<{ day, theme, items: Array<{title, cat, time, img, map_x, map_y}> }>
 *   - activeDay : Number | 'all'
 */

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  days: {
    type: Array,
    required: true,
  },
  activeDay: {
    type: [Number, String],
    default: 'all',
  },
  searchPlaces: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['selectPlace', 'addPlace'])

const mapEl = ref(null)
const mapReady = ref(false)

let map = null
let overlays = []
const searchOverlays = []
let activePopupOverlay = null
let polylines = []
let resizeObserver = null

// 일자별 색상
const DAY_COLORS = ['#ff6b3d', '#2a7bf0', '#06a582', '#f59e0b', '#a855f7']

function clearMap() {
  console.log("[PlannerMap] clearMap 실행. 기존 overlays 수:", overlays.length, "polylines 수:", polylines.length);
  overlays.forEach((o) => o.setMap(null))
  overlays = []
  polylines.forEach((p) => p.setMap(null))
  polylines = []
}

function clearSearchMap() {
  if (activePopupOverlay) {
    activePopupOverlay.setMap(null)
    activePopupOverlay = null
  }
  searchOverlays.forEach((o) => o.setMap(null))
  searchOverlays.length = 0
}

function showSearchPopup(place, position) {
  if (activePopupOverlay) {
    activePopupOverlay.setMap(null)
  }

  const container = document.createElement('div')
  container.className = 'planner-map-popup'

  const title = document.createElement('h4')
  title.className = 'planner-popup-title'
  title.textContent = place.title

  const address = document.createElement('p')
  address.className = 'planner-popup-address'
  address.textContent = place.address || ''

  const btnContainer = document.createElement('div')
  btnContainer.className = 'planner-popup-buttons'

  props.days.forEach((d) => {
    const btn = document.createElement('button')
    btn.className = 'planner-popup-btn'
    btn.textContent = `DAY ${d.day} 추가`
    btn.addEventListener('click', () => {
      emit('addPlace', { place, dayNum: d.day })
      if (activePopupOverlay) {
        activePopupOverlay.setMap(null)
        activePopupOverlay = null
      }
    })
    btnContainer.append(btn)
  })

  const closeBtn = document.createElement('button')
  closeBtn.className = 'planner-popup-close'
  closeBtn.innerHTML = `&times;`
  closeBtn.addEventListener('click', () => {
    if (activePopupOverlay) {
      activePopupOverlay.setMap(null)
      activePopupOverlay = null
    }
  })

  container.append(closeBtn, title, address, btnContainer)

  activePopupOverlay = new window.kakao.maps.CustomOverlay({
    position,
    content: container,
    yAnchor: 1.25,
    zIndex: 20,
  })
  activePopupOverlay.setMap(map)
}

function drawSearchPlaces() {
  if (!map) return
  clearSearchMap()
  
  if (!props.searchPlaces || props.searchPlaces.length === 0) return

  const bounds = new window.kakao.maps.LatLngBounds()
  let hasPoints = false

  props.searchPlaces.forEach((place) => {
    if (!place.map_x || !place.map_y) return
    const lat = parseFloat(place.map_y)
    const lng = parseFloat(place.map_x)
    if (isNaN(lat) || isNaN(lng)) return
    
    const position = new window.kakao.maps.LatLng(lat, lng)
    bounds.extend(position)
    hasPoints = true

    const wrapper = document.createElement('div')
    wrapper.className = 'planner-search-marker'
    
    const pin = document.createElement('span')
    pin.className = 'planner-search-pin'
    
    let emoji = '📍'
    let markerColor = '#8b5cf6'
    if (place.cat === '음식점') {
      emoji = '🍕'
      markerColor = '#f59e0b'
    } else if (place.cat === '숙박') {
      emoji = '🏨'
      markerColor = '#0ea5e9'
    } else if (place.cat === '축제') {
      emoji = '✨'
      markerColor = '#10b981'
    }
    
    wrapper.style.setProperty('--search-marker-color', markerColor)
    pin.textContent = emoji
    
    const label = document.createElement('span')
    label.className = 'planner-search-label'
    label.textContent = place.title

    wrapper.append(pin, label)
    
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation()
      showSearchPopup(place, position)
    })

    const markerOverlay = new window.kakao.maps.CustomOverlay({
      position,
      content: wrapper,
      yAnchor: 1.15,
      zIndex: 10,
    })
    
    markerOverlay.setMap(map)
    searchOverlays.push(markerOverlay)
  })

  if (hasPoints) {
    try {
      map.setBounds(bounds, 120, 120, 120, 120)
    } catch (e) {
      console.error('setBounds error:', e)
    }
  }
}

function getActiveDays() {
  if (props.activeDay === 'all') return props.days
  const idx = Number(props.activeDay)
  return props.days[idx] ? [props.days[idx]] : []
}



/**
 * 폴백: 두 좌표 사이 보간 웨이포인트 삽입 (직선보다 자연스럽게)
 */
function buildFallbackPath(from, to, segIdx) {
  const midLat = (from.getLat() + to.getLat()) / 2
  const midLng = (from.getLng() + to.getLng()) / 2
  const dLat = to.getLat() - from.getLat()
  const dLng = to.getLng() - from.getLng()
  const len = Math.sqrt(dLat * dLat + dLng * dLng)
  const offset = Math.min(len * 0.07, 0.01)
  const sign = segIdx % 2 === 0 ? 1 : -1
  const perpLat = len > 0 ? (-dLng / len) * offset * sign : 0
  const perpLng = len > 0 ? (dLat / len) * offset * sign : 0
  return [
    from,
    new window.kakao.maps.LatLng(
      from.getLat() + (midLat - from.getLat()) * 0.4 + perpLat * 0.6,
      from.getLng() + (midLng - from.getLng()) * 0.4 + perpLng * 0.6,
    ),
    new window.kakao.maps.LatLng(
      from.getLat() + (midLat - from.getLat()) * 0.8 + perpLat * 0.9,
      from.getLng() + (midLng - from.getLng()) * 0.8 + perpLng * 0.9,
    ),
    to,
  ]
}

/** 이중 레이어 폴리라인 (흰 테두리 + 컬러) */
function drawRouteLine(pathCoords, color) {
  console.log("[PlannerMap] drawRouteLine 시작. 좌표 수:", pathCoords.length, "색상:", color, "지도 객체 존재여부:", !!map);
  const outline = new window.kakao.maps.Polyline({
    path: pathCoords,
    strokeWeight: 8,
    strokeColor: '#ffffff',
    strokeOpacity: 0.85,
    strokeStyle: 'solid',
  })
  outline.setMap(map)
  polylines.push(outline)

  const main = new window.kakao.maps.Polyline({
    path: pathCoords,
    strokeWeight: 5,
    strokeColor: color,
    strokeOpacity: 0.92,
    strokeStyle: 'solid',
  })
  main.setMap(map)
  polylines.push(main)
  console.log("[PlannerMap] drawRouteLine 완료. 생성된 polylines 총 수:", polylines.length);
}

/** 두 좌표 중점에 방향 화살표 오버레이 */
function addArrowOverlay(pathCoords, color) {
  if (!pathCoords || pathCoords.length < 2) return

  // 시작점과 끝점 사이의 거리가 너무 가까우면 화살표를 그리지 않음
  const start = pathCoords[0]
  const end = pathCoords[pathCoords.length - 1]
  const dLatTotal = end.getLat() - start.getLat()
  const dLngTotal = end.getLng() - start.getLng()
  if (Math.sqrt(dLatTotal * dLatTotal + dLngTotal * dLngTotal) < 0.001) {
    console.log("[PlannerMap] addArrowOverlay 취소: 시작-끝 거리가 너무 가까움");
    return
  }

  // 중간 지점 인덱스 계산
  const midIdx = Math.floor(pathCoords.length / 2)
  const from = pathCoords[midIdx - 1]
  const to = pathCoords[midIdx]

  const lat = to.getLat()
  const lng = to.getLng()

  const dLat = to.getLat() - from.getLat()
  const dLng = to.getLng() - from.getLng()

  // angleDeg: CSS rotate(0deg)는 오른쪽(동쪽)을 향하므로, 
  // dy(dLat)와 dx(dLng)를 이용하여 시계방향 회전각도를 계산합니다.
  const angleRad = Math.atan2(dLat, dLng)
  const angleDeg = -(angleRad * 180) / Math.PI

  console.log("[PlannerMap] addArrowOverlay 그리기. 위치:", lat, lng, "각도:", angleDeg);

  const el = document.createElement('div')
  el.className = 'planner-route-arrow'
  el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    style="transform:rotate(${angleDeg}deg);display:block">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="${color}"
      stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`

  const overlay = new window.kakao.maps.CustomOverlay({
    position: new window.kakao.maps.LatLng(lat, lng),
    content: el,
    zIndex: 2,
  })
  overlay.setMap(map)
  overlays.push(overlay)
}

async function drawCourse() {
  if (!map) {
    console.warn("[PlannerMap] drawCourse 취소: map이 생성되지 않았습니다.");
    return
  }
  console.log("[PlannerMap] drawCourse 시작. days 수:", props.days.length, "activeDay:", props.activeDay);
  clearMap()

  const activeDays = getActiveDays()
  const bounds = new window.kakao.maps.LatLngBounds()
  let hasValidPoint = false

  for (const day of activeDays) {
    const dayAbsIdx = day.day ? (day.day - 1) : props.days.indexOf(day)
    const color = DAY_COLORS[dayAbsIdx % DAY_COLORS.length] || '#ff6b3d'

    const validItems = day.items.filter(
      (it) =>
        it.map_x &&
        it.map_y &&
        !isNaN(parseFloat(it.map_x)) &&
        !isNaN(parseFloat(it.map_y)),
    )

    const pointCoords = []

    for (const item of validItems) {
      const lat = parseFloat(item.map_y)
      const lng = parseFloat(item.map_x)
      const position = new window.kakao.maps.LatLng(lat, lng)
      pointCoords.push(position)
      bounds.extend(position)
      hasValidPoint = true

      // ── 번호 마커 ──
      const globalIdx = day.items.indexOf(item) + 1
      const wrapper = document.createElement('div')
      wrapper.className = 'planner-map-marker'
      wrapper.style.setProperty('--marker-color', color)

      const numBadge = document.createElement('span')
      numBadge.className = 'planner-marker-num'
      numBadge.textContent = String(globalIdx)

      const label = document.createElement('span')
      label.className = 'planner-marker-label'
      label.textContent = item.title

      wrapper.append(numBadge, label)

      if (item.time) {
        const timeEl = document.createElement('span')
        timeEl.className = 'planner-marker-time'
        timeEl.textContent = item.time
        wrapper.append(timeEl)
      }

      wrapper.addEventListener('click', () =>
        emit('selectPlace', { dayIndex: dayAbsIdx, item }),
      )

      const markerOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: wrapper,
        yAnchor: 1.15,
        zIndex: 5,
      })
      markerOverlay.setMap(map)
      overlays.push(markerOverlay)
    }

    // ── 구간별 경로 그리기 ──
    for (let i = 0; i < pointCoords.length - 1; i++) {
      const from = pointCoords[i]
      const to = pointCoords[i + 1]
      const toItem = validItems[i + 1]

      let realRoute = null
      if (toItem && toItem.move && toItem.move.path) {
        const path = toItem.move.path
        console.log(`[PlannerMap] ${toItem.title}로 이동하는 경로 탐색 완료. 좌표 수:`, path.length / 2);
        realRoute = []
        for (let j = 0; j + 1 < path.length; j += 2) {
          const lat = parseFloat(path[j + 1])
          const lng = parseFloat(path[j])
          if (!isNaN(lat) && !isNaN(lng)) {
            realRoute.push(new window.kakao.maps.LatLng(lat, lng))
          }
        }
      }

      if (realRoute && realRoute.length > 1) {
        console.log(`[PlannerMap] ${toItem.title} 실제 경로 Polyline 드로잉 실행.`);
        drawRouteLine(realRoute, color)
        addArrowOverlay(realRoute, color)
      } else {
        console.log(`[PlannerMap] ${toItem.title} 실제 경로 정보 없음 -> 직선 보간 폴백 실행.`);
        const fallbackPath = buildFallbackPath(from, to, i)
        drawRouteLine(fallbackPath, color)
        addArrowOverlay(fallbackPath, color)
      }
    }
  }

  // 지도 범위 조정
  if (hasValidPoint) {
    try {
      map.setBounds(bounds, 80, 80, 80, 80)
    } catch {
      const first = getActiveDays()
        .flatMap((d) => d.items)
        .find((it) => it.map_x && it.map_y)
      if (first) {
        map.setCenter(
          new window.kakao.maps.LatLng(parseFloat(first.map_y), parseFloat(first.map_x)),
        )
        map.setLevel(6)
      }
    }
  }
}

function createMap() {
  if (!mapEl.value || map) return
  console.log("[PlannerMap] 카카오맵 인스턴스 생성 시작");
  map = new window.kakao.maps.Map(mapEl.value, {
    center: new window.kakao.maps.LatLng(36.35, 127.85),
    level: 12,
  })
  map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT)
  mapReady.value = true
  drawCourse()
  drawSearchPlaces()

  resizeObserver = new ResizeObserver(() => {
    if (map) map.relayout()
  })
  resizeObserver.observe(mapEl.value)
}

onMounted(() => {
  const checkAndLoad = () => {
    if (window.kakao?.maps) {
      console.log("[PlannerMap] Kakao Map SDK 감지됨. 로드 시도.");
      window.kakao.maps.load(createMap)
    } else {
      console.warn("[PlannerMap] Kakao Map SDK 미감지. 100ms 대기 후 재확인.");
      setTimeout(checkAndLoad, 100)
    }
  }
  checkAndLoad()
})

watch(
  [() => props.days, () => props.activeDay],
  ([newDays, newActiveDay]) => {
    console.log("[PlannerMap] watch 트리거됨! activeDay:", newActiveDay, "days 수:", newDays?.length);
    if (mapReady.value) drawCourse()
  },
  { deep: true },
)

watch(
  () => props.searchPlaces,
  (newSearchPlaces) => {
    console.log("[PlannerMap] searchPlaces watch 트리거됨! 개수:", newSearchPlaces?.length);
    if (mapReady.value) drawSearchPlaces()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  clearMap()
  clearSearchMap()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="mapEl" class="planner-map">
    <div v-if="!mapReady" class="planner-map-loading">
      <span>지도를 불러오는 중이에요</span>
    </div>
  </div>
</template>

<style>
.planner-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #eef3ee;
}

.planner-map-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
}

/* ── 번호 마커 ── */
.planner-map-marker {
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 160px;
  padding: 5px 9px 5px 5px;
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 4px 14px rgba(30, 40, 35, 0.2);
  color: #2e2924;
  cursor: pointer;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;
}

.planner-map-marker:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(30, 40, 35, 0.28);
  z-index: 10;
}

.planner-marker-num {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--marker-color);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
}

.planner-marker-label {
  overflow: hidden;
  max-width: 110px;
  text-overflow: ellipsis;
}

.planner-marker-time {
  margin-left: 2px;
  color: #888;
  font-size: 10.5px;
  font-weight: 600;
}

/* ── 방향 화살표 오버레이 ── */
.planner-route-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(30, 40, 35, 0.18);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* ── 검색 결과 마커 ── */
.planner-search-marker {
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 160px;
  padding: 5px 9px 5px 5px;
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
  color: #2e2924;
  cursor: pointer;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.planner-search-marker:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
  z-index: 12;
}

.planner-search-pin {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--search-marker-color, #8b5cf6);
  font-size: 11px;
}

.planner-search-label {
  overflow: hidden;
  max-width: 110px;
  text-overflow: ellipsis;
}

/* ── 지도 오버레이 팝업 ── */
.planner-map-popup {
  position: relative;
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(226, 220, 213, 0.9);
  box-shadow: 0 8px 24px rgba(30, 35, 45, 0.18);
  padding: 14px 16px;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: inherit;
}

.planner-popup-close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: #a09a95;
}

.planner-popup-title {
  font-size: 13.5px;
  font-weight: 800;
  margin: 0;
  padding-right: 12px;
  color: var(--text-primary, #2e2924);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.planner-popup-address {
  font-size: 11px;
  color: var(--text-muted, #888);
  margin: 0;
  line-height: 1.3;
}

.planner-popup-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.planner-popup-btn {
  background: var(--sky-50, #f0f7ff);
  color: var(--sky-700, #0369a1);
  border: 1px solid var(--sky-200, #bae6fd);
  padding: 5px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: all 0.15s;
}

.planner-popup-btn:hover {
  background: var(--sky-500, #0ea5e9);
  color: #fff;
  border-color: var(--sky-500, #0ea5e9);
}
</style>
