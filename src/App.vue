<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import { PhysicalPosition, PhysicalSize, WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { changeDisplayMode, } from "./theme/theme";
import { onUnmounted } from "vue";
import { checkAliveUpdate } from "./components/updater/updater";
import { useRouter } from 'vue-router'
import { currentMonitor } from '@tauri-apps/api/window';
import { writeTextFile } from "@tauri-apps/api/fs";

const router = useRouter()
var settingsOpened = false
const minified = ref(true)
const isMMD = ref()
const autoCheck = ref()
const store = ref()
var unlistenSys: UnlistenFn | null = null;
var unlistenUpdate: UnlistenFn | null = null;

async function initSettings() {
  const resourceDirPath = await resourceDir();
  const path = await join(resourceDirPath, 'data', 'sets_alive.json');
  console.log("path: ", path);
  store.value = new Store(path);
  isMMD.value = await store.value.get("is_mmd") as boolean
  autoCheck.value = await store.value.get("auto_check") as boolean
  const sDisplayMode = await store.value.get("display_mode") as string

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
    changeMode(isMMD.value? "mmd":"live2d")
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
  await listen('minify_alive', (event: any) => {
    const minify = event.payload
    const mode = isMMD.value?'mmd':'live2d'
    console.log("mode:", mode);
    
    if (minify.minify) {
      changeMode("/")
      if (minify.uu_json) {
        const filePath = minify.uu_json;
        writeTextFile(
          filePath, 
          '{"mode":"' + mode + '","minified":' + true + '}'
        )
      }
    } else {
      if (minify.uu_json) {
        const filePath = minify.uu_json;
        writeTextFile(
          filePath, 
          '{"mode":"' + mode + '","minified":' + false + '}'
        )
      }
      unminify()
    }
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
  await listen('change_volume', async (event: any) => {
    const volume = event.payload;
    console.log("Changing volume: ", volume);
    
    // 先只做 MMD 吧
    if (isMMD.value && volume.mode === "mmd") {
      await appWindow.emit("change_mmd_volume", volume)
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

function unminify() {
  changeMode(isMMD.value? "mmd":"live2d")
}

async function changeMode(mode: string) {
  if (mode === "/") {
    minified.value = true
    appWindow.setResizable(false)
    if (isMMD.value) {
      appWindow.setSize(new PhysicalSize(75, 75))
    } else {
      appWindow.setSize(new PhysicalSize(75, 75))
    }
    router.push(mode)
  } else {
    minified.value = false
    const width = await store.value.get("win_w") as number
    const height = await store.value.get("win_h") as number
    const pos = await appWindow.outerPosition()
    var posX = pos.x
    var posY = pos.y

    const monitor = await currentMonitor();
    if (monitor !== null) {
      const screenSize = monitor.size
      // 如果宽度超出了
      if (pos.x + width > screenSize.width) {
        posX = pos.x + 75 - width
      }
      // 如果高度超出了
      if (pos.y + height > screenSize.height) {
        posY = pos.y + 75 - height
      }
      
      const p2 = await appWindow.innerPosition()
      console.log("screenSize: ", screenSize);
      console.log("p1: ", pos);
      console.log("p2: ", p2);
      
      appWindow.setResizable(true)
      appWindow.setPosition(new PhysicalPosition(posX, posY))
      appWindow.setSize(new PhysicalSize(width, height))
      router.push({
        name: mode
      })
    }
  }
}

onBeforeMount(() => {
  appWindow.setSize(new PhysicalSize(75, 75))
  appWindow.setResizable(false)
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
    <div class="w-full h-full">
      <router-view />
    
      <div v-if="minified" @click="unminify" :class="'absolute w-14 h-14 bottom-0 right-0'">
        <img data-tauri-drag-region 
         class="object-cover h-14 w-14 rounded-full" 
         src="/floating-icon.png" alt="" />
      </div>
    </div>

    <template #fallback>
      <div>
        Loading ...
      </div>
    </template>
  </Suspense>
</template>

