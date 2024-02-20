<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import Live2d from "./components/live2d/Live2d.vue";
import MMD from "./components/mmd/MMD.vue"
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { changeDisplayMode, } from "./theme/theme";
import { onUnmounted } from "vue";
import { checkAliveUpdate } from "./components/updater/updater";

var settingsOpened = false
const isMMD = ref()
const autoCheck = ref()
var unlistenSys: UnlistenFn | null = null;
var unlistenUpdate: UnlistenFn | null = null;

async function initSettings() {
  const resourceDirPath = await resourceDir();
  const path = await join(resourceDirPath, 'data', 'sets_alive.json');
  console.log("path: ", path);
  const store = new Store(path);
  isMMD.value = await store.get("is_mmd") as boolean
  autoCheck.value = await store.get("auto_check") as boolean
  const sDisplayMode = await store.get("display_mode") as string

  checkAliveUpdate(autoCheck.value)

  if (sDisplayMode === "follow") {
    const currTheme = await appWindow.theme();
    changeDisplayMode(currTheme === "dark")
    unlistenSys = await appWindow.onThemeChanged(({ payload: theme }) => {
      console.log('New theme: ' + theme);
      changeDisplayMode(theme === "dark")
    });
  } else {
    changeDisplayMode(sDisplayMode === "dark")
  }
}
async function listenEvents() {
  await listen('event_is_mmd', (event: any) => {
    console.log("event_is_mmd: ", event.payload as boolean);
    isMMD.value = event.payload as boolean
    location.reload()
  });
  await listen('change_mode', async (event: any) => {
    const mode = event.payload as string
    if (mode === "follow") {
      const currTheme = await appWindow.theme();
      console.log('currTheme: ' + currTheme);
      changeDisplayMode(currTheme === "dark")
      unlistenSys = await appWindow.onThemeChanged(({ payload: theme }) => {
        console.log('New theme: ' + theme);
        changeDisplayMode(theme === "dark")
      });
    } else {
      if (unlistenSys !== null) {
        unlistenSys();
      }
      changeDisplayMode(mode === "dark")
    }
  });
  await listen('event_open_settings', (_event: any) => {
    openSettings()
  });
  await listen('hello_alive', (_event: any) => {
    console.log("Hello from client.");
  });
  await listen('change_motion', async (event: any) => {
    console.log("Changing motion.");
    const motion = event.payload;
    // 先只做 MMD 吧
    if (isMMD.value && motion.mode === "mmd") {
      await appWindow.emit("change_mmd_motion", motion)
    }
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
      url: '/pages/settings.html',
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
  initSettings()
})

onMounted(() => {
  console.log("App onMounted");
  listenEvents()
})
onUnmounted(() => {
  if (unlistenSys !== null) {
    unlistenSys();
  }
  if (unlistenUpdate !== null) {
    unlistenUpdate();
  }
})
</script>

<template>
  <Suspense>
    <Live2d v-if="!isMMD" />
    <MMD v-else />

    <template #fallback>
      <div>
        Loading ...
      </div>
    </template>
  </Suspense>
</template>

