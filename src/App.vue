<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import Live2d from "./components/live2d/Live2d.vue";
import MMD from "./components/mmd/MMD.vue"
import { listen } from "@tauri-apps/api/event";
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { changeDisplayMode,} from "./theme/theme";

var settingsOpened = false
const isMMD = ref()
const autoCheck = ref()

async function getIsMMD() {
  const resourceDirPath = await resourceDir();
  const path = await join(resourceDirPath, 'data', 'sets_alive.json');
  console.log("path: ", path);
  const store = new Store(path);
  isMMD.value = await store.get("is_mmd") as boolean
  autoCheck.value = await store.get("auto_check") as boolean
  const sDisplayMode = await store.get("display_mode") as string
  changeDisplayMode(sDisplayMode === "dark")
}
async function listenEvents() {
  await listen('event_is_mmd', (event: any) => {
    console.log("event_is_mmd: ", event.payload as boolean);
    isMMD.value = event.payload as boolean
    location.reload()
  });
  await listen('change_mode', (event: any) => {
    const mode = event.payload as string
    changeDisplayMode(mode === "dark")
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
  // document.documentElement.classList.add('dark')
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

