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
import { getPlannerDirections } from '@/api/aiPlanner.js'

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
  surroundingPlaces: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['selectPlace', 'addPlace', 'viewportChanged'])

const mapEl = ref(null)
const mapReady = ref(false)

let map = null
let overlays = []
const searchOverlays = []
const surroundingOverlays = []
let activePopupOverlay = null
let polylines = []
let resizeObserver = null
let drawSequence = 0
const routeCache = new Map()

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

function clearSurroundingMap() {
  surroundingOverlays.forEach((o) => o.setMap(null))
  surroundingOverlays.length = 0
}

function markerTone(category) {
  if (category === '음식점') return '#f59e0b'
  if (category === '숙박') return '#2a7bf0'
  if (category === '축제') return '#06a582'
  return '#ff6b3d'
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

function drawSurroundingPlaces() {
  if (!map) return
  clearSurroundingMap()
  
  if (!props.surroundingPlaces || props.surroundingPlaces.length === 0) return

  props.surroundingPlaces.forEach((place) => {
    const map_x = place.map_x ?? place.mapX ?? place.lng
    const map_y = place.map_y ?? place.mapY ?? place.lat
    if (!map_x || !map_y) return
    const lat = parseFloat(map_y)
    const lng = parseFloat(map_x)
    if (isNaN(lat) || isNaN(lng)) return
    
    const position = new window.kakao.maps.LatLng(lat, lng)

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'coursekok-map-marker'
    button.style.setProperty('--marker-color', markerTone(place.cat))
    button.setAttribute('aria-label', `${place.title} 선택`)
    
    const marker = document.createElement('span')
    marker.className = 'marker-dot'
    
    const label = document.createElement('span')
    label.className = 'marker-label'
    label.textContent = place.title
    
    button.append(marker, label)

    button.addEventListener('click', () => {
      emit('selectPlace', { item: place })
    })

    const markerOverlay = new window.kakao.maps.CustomOverlay({
      position,
      content: button,
      yAnchor: 1.08,
      zIndex: 2,
    })
    
    markerOverlay.setMap(map)
    surroundingOverlays.push(markerOverlay)
  })
}

function getActiveDays() {
  if (props.activeDay === 'all') return props.days
  const idx = Number(props.activeDay)
  return props.days[idx] ? [props.days[idx]] : []
}

function toFiniteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function makeLatLng(lngValue, latValue) {
  const lng = toFiniteNumber(lngValue)
  const lat = toFiniteNumber(latValue)
  if (lat === null || lng === null) return null
  return new window.kakao.maps.LatLng(lat, lng)
}

function routePathSource(item) {
  const candidates = [
    item?.move?.path,
    item?.transport?.path,
    item?.move?.vertexes,
    item?.transport?.vertexes,
    item?.routePath,
    item?.route_path,
    item?.path,
    item?.vertexes,
  ]
  return candidates.find((path) => Array.isArray(path) && path.length > 0) ?? null
}

function normalizeRoutePath(rawPath) {
  if (!Array.isArray(rawPath) || rawPath.length === 0) return []
  const points = []
  const first = rawPath[0]

  if (Array.isArray(first)) {
    rawPath.forEach((pair) => {
      if (!Array.isArray(pair) || pair.length < 2) return
      const point = makeLatLng(pair[0], pair[1])
      if (point) points.push(point)
    })
    return points
  }

  if (first && typeof first === 'object') {
    rawPath.forEach((coord) => {
      const lng = coord.lng ?? coord.x ?? coord.map_x ?? coord.mapX ?? coord.longitude
      const lat = coord.lat ?? coord.y ?? coord.map_y ?? coord.mapY ?? coord.latitude
      const point = makeLatLng(lng, lat)
      if (point) points.push(point)
    })
    return points
  }

  for (let j = 0; j + 1 < rawPath.length; j += 2) {
    const point = makeLatLng(rawPath[j], rawPath[j + 1])
    if (point) points.push(point)
  }
  return points
}

function routeCacheKey(fromItem, toItem) {
  return [fromItem?.map_x, fromItem?.map_y, toItem?.map_x, toItem?.map_y]
    .map((value) => Number(value).toFixed(7))
    .join(',')
}


async function loadRoutePath(fromItem, toItem) {
  // 1순위: 아이템에 이미 경로 데이터가 내장된 경우 (AI 코스 응답에서 transport.path 등)
  const embeddedPath = routePathSource(toItem)
  if (embeddedPath && embeddedPath.length >= 4) {
    console.log('[PlannerMap] 내장 경로 사용:', toItem?.title, '좌표 수:', embeddedPath.length / 2)
    return normalizeRoutePath(embeddedPath)
  }

  const originX = toFiniteNumber(fromItem?.map_x)
  const originY = toFiniteNumber(fromItem?.map_y)
  const destinationX = toFiniteNumber(toItem?.map_x)
  const destinationY = toFiniteNumber(toItem?.map_y)
  if ([originX, originY, destinationX, destinationY].some((value) => value === null)) {
    console.warn('[PlannerMap] 좌표 누락으로 경로 조회 불가:', fromItem?.title, '->', toItem?.title)
    return []
  }

  console.log(`[PlannerMap] Kakao Mobility API 호출: ${fromItem?.title} -> ${toItem?.title}`, { originX, originY, destinationX, destinationY })

  const cacheKey = routeCacheKey(fromItem, toItem)
  if (!routeCache.has(cacheKey)) {
    routeCache.set(
      cacheKey,
      getPlannerDirections({ originX, originY, destinationX, destinationY }).catch((error) => {
        console.warn('[PlannerMap] Kakao Mobility API 호출 실패:', error)
        return { success: false }
      }),
    )
  }

  const response = await routeCache.get(cacheKey)

  if (!response || response.success === false) {
    console.warn('[PlannerMap] 경로 조회 실패 (fallback 사용):', fromItem?.title, '->', toItem?.title)
    return []
  }

  const rawPath = response?.vertexes ?? response?.path ?? []
  console.log(`[PlannerMap] 경로 수신 성공: ${fromItem?.title} -> ${toItem?.title}, 좌표 수: ${rawPath.length / 2}`)
  return normalizeRoutePath(rawPath)
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
    zIndex: 20,
  })
  outline.setMap(map)
  polylines.push(outline)

  const main = new window.kakao.maps.Polyline({
    path: pathCoords,
    strokeWeight: 5,
    strokeColor: color,
    strokeOpacity: 0.92,
    strokeStyle: 'solid',
    zIndex: 21,
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
  const currentDraw = ++drawSequence
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
    console.log(`[PlannerMap] DAY ${day.day}: 이클 수 ${day.items.length}개, 유효 좌표 이클 수 ${validItems.length}개`)
    if (validItems.length === 0) {
      console.warn(`[PlannerMap] DAY ${day.day}: 유효한 좌표가 있는 이클이 없어 경로를 그릴 수 없습니다.`)
    }

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

    // Draw route segments between places.
    for (let i = 0; i < pointCoords.length - 1; i++) {
      const from = pointCoords[i]
      const to = pointCoords[i + 1]
      const fromItem = validItems[i]
      const toItem = validItems[i + 1]

      const realRoute = await loadRoutePath(fromItem, toItem)
      if (currentDraw !== drawSequence) return

      if (realRoute && realRoute.length > 1) {
        drawRouteLine(realRoute, color)
        addArrowOverlay(realRoute, color)
        realRoute.forEach((point) => bounds.extend(point))
      } else {
        const fallbackPath = buildFallbackPath(from, to, i)
        drawRouteLine(fallbackPath, color)
        addArrowOverlay(fallbackPath, color)
        fallbackPath.forEach((point) => bounds.extend(point))
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

let viewportTimer = null
function emitViewport() {
  if (!map) return
  if (viewportTimer) clearTimeout(viewportTimer)
  viewportTimer = setTimeout(() => {
    const bounds = map.getBounds()
    const southWest = bounds.getSouthWest()
    const northEast = bounds.getNorthEast()
    emit('viewportChanged', {
      level: map.getLevel(),
      minLng: southWest.getLng(),
      maxLng: northEast.getLng(),
      minLat: southWest.getLat(),
      maxLat: northEast.getLat(),
    })
  }, 300)
}

function createMap() {
  if (!mapEl.value || map) return
  console.log("[PlannerMap] 카카오맵 인스턴스 생성 시작");
  map = new window.kakao.maps.Map(mapEl.value, {
    center: new window.kakao.maps.LatLng(36.35, 127.85),
    level: 12,
  })
  map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT)
  window.kakao.maps.event.addListener(map, 'dragend', emitViewport)
  window.kakao.maps.event.addListener(map, 'zoom_changed', emitViewport)
  mapReady.value = true
  drawCourse()
  drawSearchPlaces()
  drawSurroundingPlaces()

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

watch(
  () => props.surroundingPlaces,
  (newSurrounding) => {
    console.log("[PlannerMap] surroundingPlaces watch 트리거됨! 개수:", newSurrounding?.length);
    if (mapReady.value) drawSurroundingPlaces()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  clearMap()
  clearSearchMap()
  clearSurroundingMap()
  routeCache.clear()
  if (viewportTimer) clearTimeout(viewportTimer)
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

.planner-map img,
.planner-map svg {
  max-width: none;
}

.planner-route-arrow svg {
  max-width: 100%;
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
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  background: var(--marker-color);
  box-shadow: 0 4px 14px rgba(30, 40, 35, 0.25);
  color: #ffffff;
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
  box-shadow: 0 8px 20px rgba(30, 40, 35, 0.35);
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
  background: #ffffff;
  color: var(--marker-color);
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
  color: rgba(255, 255, 255, 0.82);
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
/* ── 주변 탐색 마커 스타일 (ExploreMap.vue에서 복사) ── */
.coursekok-map-marker {
  display: flex;
  align-items: center;
  gap: 7px;
  max-width: 150px;
  padding: 7px 10px 7px 8px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 5px 16px rgba(31, 42, 36, 0.18);
  color: #2e2924;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.coursekok-map-marker:hover {
  z-index: 10;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 8px 22px rgba(31, 42, 36, 0.24);
}

.marker-dot {
  width: 10px;
  height: 10px;
  flex: none;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--marker-color);
  box-shadow: 0 0 0 2px var(--marker-color);
}

.marker-label {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
