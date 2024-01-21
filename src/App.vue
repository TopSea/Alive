<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import Live2d from "./components/Live2d.vue";
import MMD from "./components/mmd/MMD.vue"
import { listen } from "@tauri-apps/api/event";
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import { WebviewWindow } from "@tauri-apps/api/window";

var settingsOpened = false
const isMMD = ref()

async function getIsMMD() {
  const resourceDirPath = await resourceDir();
  const path = await join(resourceDirPath, 'data', 'sets_alive.json');
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
  await listen('event_open_settings', (_event: any) => {
    openSettings()
  });
}

function openSettings() {
  if (settingsOpened) {
    const settingsWindow = WebviewWindow.getByLabel('tauri_win_settings');
    settingsWindow?.show();
    settingsWindow?.unminimize();
    settingsWindow?.setFocus();
  } else {
    const settingsWindow = new WebviewWindow('tauri_win_settings', {
      url: 'settings.html',
      x: 64,
      y: 64,
      width: 640,
      height: 440,
      resizable: false,
      title: "Settings",
      fullscreen: false,
    });

    settingsWindow.once('tauri://created', function () {
      console.log('tauri://created');
      settingsOpened = true;
    });
    settingsWindow.once('tauri://destroyed', function () {
      console.log('tauri://destroyed');
      settingsOpened = false;
    });
  }
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

