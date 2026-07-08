<script setup>
import { h, onBeforeUnmount, onMounted, ref, render, watch } from 'vue'
import Mascot from '@/components/brand/Mascot.vue'

const props = defineProps({
  places: { type: Array, required: true },
  selectedId: { type: Number, default: null },
  savedIds: { type: Array, default: null },
  focus: { type: Object, default: null },
  focusTarget: { type: Object, default: null },
  autoFit: { type: Boolean, default: undefined },
  compactMarkers: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'viewportChanged'])

const mapEl = ref(null)
const mapReady = ref(false)
let map = null
let overlays = []
let mascotRoots = []
let resizeObserver = null
let suppressViewportEvent = false
let viewportTimer = null
let lastFocusToken = 0

function clearOverlays() {
  overlays.forEach((overlay) => overlay.setMap(null))
  mascotRoots.forEach((root) => render(null, root))
  overlays = []
  mascotRoots = []
}

function markerTone(category) {
  if (category === '음식점') return '#f59e0b'
  if (category === '숙박') return '#2a7bf0'
  if (category === '축제') return '#06a582'
  return '#ff6b3d'
}

function drawPlaces() {
  if (!map) return
  clearOverlays()

  const validPlaces = props.places.filter((place) => place.lat && place.lng)
  const bounds = new window.kakao.maps.LatLngBounds()
  let regularPlaceCount = 0

  validPlaces.forEach((place) => {
    const position = new window.kakao.maps.LatLng(place.lat, place.lng)
    const button = document.createElement('button')
    button.type = 'button'
    const isFeatured = props.savedIds?.includes(place.id) ?? false
    button.className = [
      'coursekok-map-marker',
      place.id === props.selectedId ? 'is-active' : '',
      isFeatured ? 'is-featured' : '',
      props.compactMarkers ? 'is-compact' : '',
    ].filter(Boolean).join(' ')
    button.style.setProperty('--marker-color', markerTone(place.cat))
    button.setAttribute('aria-label', `${place.title} 선택`)
    const marker = document.createElement('span')
    if (isFeatured) {
      marker.className = 'marker-mascot'
      render(h(Mascot, {
        variant: 'default',
        size: 36,
        color: markerTone(place.cat),
      }), marker)
      mascotRoots.push(marker)
    } else {
      marker.className = 'marker-dot'
    }
    const label = document.createElement('span')
    label.className = 'marker-label'
    label.textContent = place.title
    button.append(marker, label)
    button.addEventListener('click', () => emit('select', place.id))

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content: button,
      yAnchor: 1.08,
      zIndex: place.id === props.selectedId ? 10 : 2,
    })
    overlay.setMap(map)
    overlays.push(overlay)
    if (!isFeatured) {
      bounds.extend(position)
      regularPlaceCount += 1
    }
  })

  if (regularPlaceCount === 0) {
    validPlaces.forEach((place) => {
      bounds.extend(new window.kakao.maps.LatLng(place.lat, place.lng))
    })
  }

  if (props.focusTarget && props.focusTarget.token !== lastFocusToken) {
    lastFocusToken = props.focusTarget.token
    suppressViewportEvent = true
    const targetPosition = new window.kakao.maps.LatLng(
      props.focusTarget.lat,
      props.focusTarget.lng,
    )

    // panTo 애니메이션 도중 setLevel을 호출하면 이동이 취소될 수 있으므로
    // 확대 수준을 먼저 맞춘 후 목적지로 이동한다.
    if (map.getLevel() > 6) map.setLevel(6)
    map.panTo(targetPosition)
    setTimeout(() => { suppressViewportEvent = false }, 650)
    return
  }

  const selectedPlace = validPlaces.find((place) => place.id === props.selectedId)
  if (selectedPlace) {
    // 카드 선택 시 현재 지도 위치와 기존 핀을 유지하고,
    // 선택한 장소의 마커 모양만 콕이로 교체한다.
  } else if (props.focus) {
    suppressViewportEvent = true
    map.setCenter(new window.kakao.maps.LatLng(props.focus.lat, props.focus.lng))
    map.setLevel(props.focus.level ?? 7)
    setTimeout(() => { suppressViewportEvent = false }, 180)
  } else if (validPlaces.length > 1 && props.autoFit !== false) {
    suppressViewportEvent = true
    map.setBounds(bounds, 56, 56, 56, 56)
    setTimeout(() => { suppressViewportEvent = false }, 180)
  } else if (validPlaces.length === 1 && props.autoFit !== false) {
    suppressViewportEvent = true
    map.setCenter(new window.kakao.maps.LatLng(validPlaces[0]?.lat, validPlaces[0]?.lng))
    map.setLevel(5)
    setTimeout(() => { suppressViewportEvent = false }, 180)
  }
}

function emitViewport() {
  if (!map || suppressViewportEvent) return
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
  map = new window.kakao.maps.Map(mapEl.value, {
    center: new window.kakao.maps.LatLng(36.35, 127.85),
    level: 13,
  })
  map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT)
  window.kakao.maps.event.addListener(map, 'dragend', emitViewport)
  window.kakao.maps.event.addListener(map, 'zoom_changed', emitViewport)
  mapReady.value = true
  drawPlaces()

  resizeObserver = new ResizeObserver(() => {
    if (!map) return
    map.relayout()
  })
  resizeObserver.observe(mapEl.value)
}

onMounted(() => {
  if (window.kakao?.maps) window.kakao.maps.load(createMap)
})

watch(
  [
    () => props.places,
    () => props.selectedId,
    () => props.savedIds,
    () => props.focus,
    () => props.focusTarget,
  ],
  () => {
    if (mapReady.value) drawPlaces()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  clearOverlays()
  if (viewportTimer) clearTimeout(viewportTimer)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="mapEl" class="explore-map">
    <div v-if="!mapReady" class="map-loading">지도를 불러오는 중이에요</div>
  </div>
</template>

<style>
.explore-map {
  width: 100%;
  height: 100%;
  min-height: 360px;
  background: #eef3ee;
}

.map-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
}

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

.coursekok-map-marker:hover,
.coursekok-map-marker.is-active {
  z-index: 10;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 8px 22px rgba(31, 42, 36, 0.24);
}

.coursekok-map-marker.is-active {
  color: var(--coral-700);
  outline: 3px solid rgba(255, 107, 61, 0.2);
}

.coursekok-map-marker.is-featured {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  outline: 0;
  filter: drop-shadow(0 5px 8px rgba(31, 42, 36, 0.25));
}

.coursekok-map-marker.is-featured:hover,
.coursekok-map-marker.is-featured.is-active {
  box-shadow: none;
  outline: 0;
  filter: drop-shadow(0 8px 11px rgba(31, 42, 36, 0.32));
}

.coursekok-map-marker.is-featured .marker-label {
  display: none;
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

.marker-mascot {
  width: 36px;
  height: 44px;
  flex: none;
  line-height: 0;
}

.marker-mascot > span {
  vertical-align: top;
}

.marker-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.coursekok-map-marker.is-compact:not(.is-active):not(.is-featured) .marker-label {
  display: none;
}

.coursekok-map-marker.is-compact:hover .marker-label {
  display: block;
}
</style>
