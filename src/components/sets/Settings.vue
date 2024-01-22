<script setup lang="ts">
import Live2dSetting from './Live2dSetting.vue';
import MMDSetting from './MMDSetting.vue';
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import { onBeforeMount, ref } from 'vue';

const isMMD = ref()

async function getIsMMD() {
  const resourceDirPath = await resourceDir();
  const path = await join(resourceDirPath, 'data', 'sets_alive.json');
  console.log("path: ", path);
  const store = new Store(path);
  isMMD.value = await store.get("is_mmd") as boolean
}

onBeforeMount(() => {
  getIsMMD()
})
</script>

<template>
  <Suspense>
    <Live2dSetting v-if="!isMMD" />
    <MMDSetting v-else/>

    <template #fallback >
      <div>
        Loading ...
      </div>
    </template>
  </Suspense>
</template>

