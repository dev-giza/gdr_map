<template>
    <div>
        <l-map style="height: 600px; width: 100%" :zoom="zoom" :center="center">
            <l-tile-layer :url="url" :attribution="attribution" />
            <l-marker v-for="(marker, idx) in markers" :key="idx" :lat-lng="[marker.lat, marker.lng]">
                <l-popup>
                    <div>
                        <strong>ID:</strong> {{ marker.id }}<br>
                        <strong>Имя:</strong> {{ marker.first_name }}<br>
                        <strong>Фамилия:</strong> {{ marker.last_name }}<br>
                        <strong>Компания:</strong> {{ marker.client_company_name }}<br>
                        <strong>Email:</strong> {{ marker.email_address }}<br>
                        <strong>Телефон:</strong> {{ marker.primary_phone }}<br>
                        <strong>Дата создания:</strong> {{ marker.created }}<br>
                        <strong>Доп. телефон:</strong> {{ marker.secondary_phone }}<br>
                        <strong>Адрес:</strong> {{ marker.address }}<br>
                        <strong>Ad Group:</strong> {{ marker.ad_group }}<br>
                        <strong>WO Paperwork:</strong> {{ marker.wo_paperwork }}<br>
                    </div>
                </l-popup>
            </l-marker>
        </l-map>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Фикс для иконок маркеров Leaflet в Nuxt/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Центр и зум для Чикаго и пригородов
const center = ref([41.85, -87.75]);
const zoom = ref(9);
const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const markers = ref<any[]>([]);

async function fetchMarkers() {
    const res = await fetch('/clients_with_coords.json');
    const data = await res.json();
    // Фильтруем только те, у кого есть координаты
    markers.value = data.filter((c: any) => c.lat && c.lng);
}

onMounted(() => {
    fetchMarkers();
    // Можно добавить автообновление, если нужно:
    // setInterval(fetchMarkers, 10000);
});
</script>