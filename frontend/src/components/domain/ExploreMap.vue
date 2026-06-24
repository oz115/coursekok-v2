<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

declare global {
  interface Window {
    kakao: any
  }
}

interface MapPlace {
  id: number
  title: string
  cat: string
  lat: number | null
  lng: number | null
}

const props = defineProps<{
  places: MapPlace[]
  selectedId?: number | null
  focus?: { lat: number; lng: number; level?: number } | null
}>()

const emit = defineEmits<{
  select: [id: number]
}>()

const mapEl = ref<HTMLDivElement | null>(null)
const mapReady = ref(false)
let map: any = null
let overlays: any[] = []
let resizeObserver: ResizeObserver | null = null

function clearOverlays() {
  overlays.forEach((overlay) => overlay.setMap(null))
  overlays = []
}

function markerTone(category: string) {
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

  validPlaces.forEach((place) => {
    const position = new window.kakao.maps.LatLng(place.lat, place.lng)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `coursekok-map-marker${place.id === props.selectedId ? ' is-active' : ''}`
    button.style.setProperty('--marker-color', markerTone(place.cat))
    button.setAttribute('aria-label', `${place.title} 선택`)
    const dot = document.createElement('span')
    dot.className = 'marker-dot'
    const label = document.createElement('span')
    label.className = 'marker-label'
    label.textContent = place.title
    button.append(dot, label)
    button.addEventListener('click', () => emit('select', place.id))

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content: button,
      yAnchor: 1.08,
      zIndex: place.id === props.selectedId ? 10 : 2,
    })
    overlay.setMap(map)
    overlays.push(overlay)
    bounds.extend(position)
  })

  const selectedPlace = validPlaces.find((place) => place.id === props.selectedId)
  if (selectedPlace) {
    map.panTo(new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng))
    if (map.getLevel() > 6) map.setLevel(6)
  } else if (props.focus) {
    map.setCenter(new window.kakao.maps.LatLng(props.focus.lat, props.focus.lng))
    map.setLevel(props.focus.level ?? 7)
  } else if (validPlaces.length > 1) {
    map.setBounds(bounds, 56, 56, 56, 56)
  } else if (validPlaces.length === 1) {
    map.setCenter(new window.kakao.maps.LatLng(validPlaces[0]?.lat, validPlaces[0]?.lng))
    map.setLevel(5)
  }
}

function createMap() {
  if (!mapEl.value || map) return
  map = new window.kakao.maps.Map(mapEl.value, {
    center: new window.kakao.maps.LatLng(36.35, 127.85),
    level: 13,
  })
  map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT)
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
  [() => props.places, () => props.selectedId, () => props.focus],
  () => {
    if (mapReady.value) drawPlaces()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  clearOverlays()
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
