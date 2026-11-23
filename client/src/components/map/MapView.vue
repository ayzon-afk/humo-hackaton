<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import L from 'leaflet';
import { project } from '@/config/project';

// points: [{ id, lat, lng, title, color }]
const props = defineProps({
  points: { type: Array, default: () => [] },
  height: { type: String, default: '500px' },
});
const emit = defineEmits(['pick', 'select']);

const el = ref(null);
let map = null;
let layer = null;

function draw() {
  if (!map) return;
  layer.clearLayers();
  for (const p of props.points) {
    if (p.lat == null || p.lng == null) continue;
    L.circleMarker([p.lat, p.lng], {
      radius: 8,
      color: p.color || '#38bdf8',
      fillColor: p.color || '#38bdf8',
      fillOpacity: 0.7,
      weight: 2,
    })
      .bindTooltip(p.title || '')
      .on('click', () => emit('select', p))
      .addTo(layer);
  }
}

onMounted(() => {
  map = L.map(el.value).setView(project.city.center, project.city.zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  }).addTo(map);
  layer = L.layerGroup().addTo(map);
  map.on('click', (e) => emit('pick', { lat: e.latlng.lat, lng: e.latlng.lng }));
  draw();
});

watch(() => props.points, draw, { deep: true });
onBeforeUnmount(() => map?.remove());
</script>

<template>
  <div ref="el" :style="{ height }" class="w-full" />
</template>
