<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import Live2d from "./components/Live2d.vue";
import MMD from "./components/mmd/MMD.vue"
import { listen } from "@tauri-apps/api/event";
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";

const isMMD = ref()

async function getIsMMD() {
  const resourceDirPath = await resourceDir();
  const path = await join(resourceDirPath, 'data', 'data_settings.json');
  console.log("path: ", path);
  const store = new Store(path);
  isMMD.value = await store.get("is_mmd") as boolean
}
async function listenEvents() {
  await listen('event_is_mmd', (event: any) => {
    console.log("event_is_mmd: ", event.payload as boolean);
    isMMD.value = event.payload as boolean
    location.reload()
  });
}

onBeforeMount(() => {
  getIsMMD()
})

onMounted(() => {
  console.log("App onMounted");
  listenEvents()
})
</script>

<template>
  <Suspense>
    <Live2d v-if="!isMMD" />
    <MMD v-else/>

    <template #fallback >
      <div>
        Loading ...
      </div>
    </template>
  </Suspense>
</template>

