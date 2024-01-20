<script setup lang="ts">
import SettingComp from './SettingComp.vue';
</script>

<template>
  <Suspense>
    <SettingComp />

    <template #fallback >
      <div>
        Loading ...
      </div>
    </template>
  </Suspense>
</template>

