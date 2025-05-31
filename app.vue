<template>
  <client-only>
    <main>
      <!-- <GeocodeControl /> -->
      <ClientsMap />
    </main>
  </client-only>
</template>

<script setup lang="ts">
import ClientsMap from './components/ClientsMap.vue';
import GeocodeControl from './components/GeocodeControl.vue';
</script>

<style>
main {
  min-width: 100vw;
  min-height: 100vh;
}
</style>