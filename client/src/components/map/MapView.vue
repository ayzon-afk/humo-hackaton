<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import L from 'leaflet';
import { project } from '@/config/project';
import { useTheme } from '@/composables/useTheme';
import { themeColors } from '@/components/charts/registerCharts';

// points: [{ id, lat, lng, title, color }]
const props = defineProps({
  points: { type: Array, default: () => [] },
  height: { type: String, default: '500px' },
});
const emit = defineEmits(['pick', 'select']);

const el = ref(null);
let map = null;
let layer = null;
let tiles = null;
const { theme } = useTheme();
const TILE = (t) => `https://{s}.basemaps.cartocdn.com/${t === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`;

function draw() {
  if (!map) return;
  layer.clearLayers();
  for (const p of props.points) {
    if (p.lat == null || p.lng == null) continue;
    L.circleMarker([p.lat, p.lng], {
      radius: 7,
      color: themeColors().surface,
      fillColor: p.color || themeColors().accent,
      fillOpacity: 1,
      weight: 2,
    })
      .bindTooltip(p.title || '')
      .on('click', () => emit('select', p))
      .addTo(layer);
  }
}

onMounted(() => {
  map = L.map(el.value, { zoomControl: false }).setView(project.city.center, project.city.zoom);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  tiles = L.tileLayer(TILE(theme.value), { attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
  layer = L.layerGroup().addTo(map);
  map.on('click', (e) => emit('pick', { lat: e.latlng.lat, lng: e.latlng.lng }));
  draw();
});

watch(() => props.points, draw, { deep: true });
watch(theme, (t) => {
  tiles?.setUrl(TILE(t));
  draw();
});
onBeforeUnmount(() => map?.remove());
</script>

<template>
  <div ref="el" :style="{ height }" class="w-full" />
</template>
