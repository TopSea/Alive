<script setup lang="ts">
import SettingAll from './SettingAll.vue';

</script>

<template>
  <Suspense>
    <SettingAll />

    <template #fallback>
      <div>
        Loading ...
      </div>
    </template>
  </Suspense>
</template>

