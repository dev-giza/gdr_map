<template>
    <div style="margin-bottom: 32px; padding: 16px; border: 1px solid #ccc; border-radius: 8px;">
        <h2>Геокодирование клиентов</h2>
        <div style="margin-bottom: 8px;">
            <button @click="start" :disabled="status.running" style="margin-right: 8px;">Старт / Продолжить</button>
            <button @click="stop" :disabled="!status.running">Стоп</button>
        </div>
        <div>
            <span v-if="status.total > 0">
                Прогресс: {{ status.current }} / {{ status.total }}
                <span v-if="status.running" style="color: green;">(идет процесс)</span>
                <span v-else style="color: gray;">(остановлено)</span>
            </span>
            <span v-else>Нет данных о прогрессе</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const status = ref({ current: 0, total: 0, running: false });
let interval: any = null;

async function fetchStatus() {
    const res = await fetch('/api/geocode-status');
    status.value = await res.json();
}

async function start() {
    await fetch('/api/geocode-start');
    fetchStatus();
}

async function stop() {
    await fetch('/api/geocode-stop');
    fetchStatus();
}

onMounted(() => {
    fetchStatus();
    interval = setInterval(fetchStatus, 2000);
});
</script>