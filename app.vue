<template>
  <client-only>
    <GeocodeControl />
    <ClientsMap />
  </client-only>
</template>

<script setup lang="ts">
import ClientsMap from './components/ClientsMap.vue';
import GeocodeControl from './components/GeocodeControl.vue';
</script>
