<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'

declare global {
  interface Window {
    kakao: any
  }
}

const props = defineProps<{
  lat: number | null | undefined
  lng: number | null | undefined
}>()

const mapEl = ref<HTMLDivElement | null>(null)
let map: any = null
let marker: any = null

function createMap() {
  if (!mapEl.value || !props.lat || !props.lng) return
  const center = new window.kakao.maps.LatLng(props.lat, props.lng)
  map = new window.kakao.maps.Map(mapEl.value, { center, level: 4 })
  marker = new window.kakao.maps.Marker({ position: center, map })
}

function updateMap() {
  if (!map || !props.lat || !props.lng) return
  const pos = new window.kakao.maps.LatLng(props.lat, props.lng)
  map.setCenter(pos)
  if (marker) marker.setPosition(pos)
}

onMounted(() => {
  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(createMap)
  }
})

watch([() => props.lat, () => props.lng], () => {
  if (map) {
    updateMap()
  } else if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(createMap)
  }
})
</script>

<template>
  <div
    ref="mapEl"
    style="height: 280px; border-radius: var(--radius-md); overflow: hidden; background: var(--gray-100);"
  />
</template>
