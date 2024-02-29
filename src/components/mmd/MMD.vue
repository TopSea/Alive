<script setup lang="ts">
import { Engine } from "@babylonjs/core/Engines/engine";

import { AliveMmdOptions, BaseRuntime } from "./MMDRuntime";
// import { SceneBuilder } from "./MMDSceneBuilder";
import { SceneBuilder } from "./MMDBuilder";
import { onMounted, ref } from "vue";
import {
  ArrowPathIcon, CameraIcon, PlayIcon, PauseIcon, Cog6ToothIcon, SpeakerWaveIcon, SpeakerXMarkIcon,
  FilmIcon as DancingIcon, ArrowsPointingInIcon,
} from '@heroicons/vue/24/solid'
import { FilmIcon } from '@heroicons/vue/24/outline'
import { UnlistenFn, listen, emit as tauriEmit } from '@tauri-apps/api/event';
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import NumChange from "../NumChange.vue";
import { txt, txtHover } from "../../theme/color";
import { writeTextFile } from '@tauri-apps/api/fs';
import { onBeforeUnmount } from "vue";
import { onUnmounted } from "vue";

const resourceDirPath = await resourceDir();
const path = await join(resourceDirPath, 'data', 'sets_mmd.json');
const store = new Store(path);
const mmdAliveUrl = await store.get("mmd_alive_url") as string;
const sVolume = ref(await store.get("volume") as number)
const sMmdCamera = ref(await store.get("is_mmd_camera") as boolean)
const sPaused = ref(await store.get("is_paused") as boolean)

const isVolumeChanging = ref(false)
const dancing = ref(false)
const mmd_canvas = ref();
const mmd_runtime = ref();
var options: AliveMmdOptions|null = null;
var eventMMDUrl: UnlistenFn|null = null;
var eventChangeVolume: UnlistenFn|null = null;

function reloadPage() {
  location.reload()
}

async function listenEvents() {
  console.log("listenEvents");

  eventMMDUrl = await listen('event_mmd_url', (_event: any) => {
    console.log("event_model_url");
    reloadPage()
  });
  eventChangeVolume = await listen('change_mmd_volume', async (event: any) => {
    console.log("event_model_url");
    var volume = event.payload.volume
    if (volume >= 1) {
      volume = 1
    } else if (volume <= 0) {
      volume = 0
    }
    sVolume.value = volume
    const filePath = event.payload.uu_json;
    writeTextFile(filePath, '{"mode":"mmd","volume":' + volume + '}')
    await store.set("volume", volume);
    await store.save();
    await tauriEmit('event_mmd_voice', volume);
  });
}
async function changeCamera() {
  await tauriEmit('event_change_camera', true);
}
async function pauseAnimation() {
  sPaused.value = !sPaused.value
  await tauriEmit('event_pause_animation', sPaused.value);
  await store.set("", sPaused.value);
  await store.save();
}
async function mmdDancing() {
  dancing.value = !dancing.value
  // 切换后默认开启播放
  sPaused.value = false
  await tauriEmit('event_mmd_dancing', dancing.value);
}
async function openSettings() {
  await tauriEmit('event_open_settings', true);
}
async function minify() {
  await tauriEmit('minify_alive', { minify: true });
}
async function changeModelVoice(isAdding: boolean) {
  if (isAdding) {
    if (sVolume.value < 1) {
      sVolume.value += 0.1;
    } else {
      sVolume.value = 1;
    }
  } else {
    if (sVolume.value > 0) {
      sVolume.value -= 0.1;
    } else {
      sVolume.value = 0;
    }
  }
  await tauriEmit('event_mmd_voice', sVolume.value);
  await store.set("volume", sVolume.value);
  await store.save();
}

onMounted(async () => {
  console.log("MMD onMounted");
  listenEvents()
  const mmdCanvas = mmd_canvas.value as HTMLCanvasElement

  mmdCanvas.addEventListener('pointerdown', function (event) {
    event.stopPropagation();
    event.preventDefault();
  }, true);

  const engine = new Engine(mmdCanvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    alpha: true,
    powerPreference: "high-performance",
    doNotHandleTouchAction: true,
    doNotHandleContextLost: true,
    audioEngine: false
  }, true);

  options = {
    mmdAliveUrl: mmdAliveUrl,
    mmdCamera: sMmdCamera.value,
    paused: sPaused.value,
    volume: sVolume.value,
    eventChangeCamera: null,
    eventPauseAnimation: null,
    eventMMDVoice: null,
    eventMMDMotion: null,
    eventMMDDancing: null,
  }

  mmd_runtime.value = await BaseRuntime.Create({
    canvas: mmdCanvas,
    engine,
    sceneBuilder: new SceneBuilder(),
    aliveMmdOptions: options
  });
  mmd_runtime.value.run()
})

onBeforeUnmount(() => {
  console.log("onBeforeUnmount");

  // 注销监听的事件
  if (options !== null) {
    if (options.eventChangeCamera !== null) {
      options.eventChangeCamera()
      options.eventChangeCamera = null
    }
    if (options.eventMMDDancing !== null) {
      options.eventMMDDancing()
      options.eventMMDDancing = null
    }
    if (options.eventMMDMotion !== null) {
      options.eventMMDMotion()
      options.eventMMDMotion = null
    }
    if (options.eventMMDVoice !== null) {
      options.eventMMDVoice()
      options.eventMMDVoice = null
    }
    if (options.eventPauseAnimation !== null) {
      options.eventPauseAnimation()
      options.eventPauseAnimation = null
    }
  }
  if (eventMMDUrl !== null) {
    eventMMDUrl()
    eventMMDUrl = null
  }
  if (eventChangeVolume !== null) {
    eventChangeVolume()
    eventChangeVolume = null
  }

  if (mmd_runtime.value !== null) {
    mmd_runtime.value.dispose()
  }
})
onUnmounted(() => {
  console.log("onUnmounted");

})
</script>


<template>
  <div class="w-full h-full p-1 static group/menu-mmd hover:border-2 border-dashed border-gray-100">
    <canvas ref="mmd_canvas" class=" w-full h-full "></canvas>
    <ul data-tauri-drag-region
      class=" invisible group-hover/menu-mmd:visible absolute flex flex-col inset-y-0 right-0 mx-4 my-4 py-4 px-2 space-y-4 backdrop-blur-3xl bg-alive-active/30 dark:bg-alive-actived/30">
      <li class="w-8 h-8" @click="reloadPage">
        <ArrowPathIcon :class="[txt, txtHover, 'w-8 h-8']" />
      </li>
      <li class="w-8 h-8" @click="changeCamera">
        <CameraIcon :class="[txt, txtHover, 'w-8 h-8']" />
      </li>

      <li class="w-8 h-8">
        <SpeakerWaveIcon v-if="isVolumeChanging && sVolume > 0"
          :class="['text-alive-txthd brightness-120 w-8 h-8 blur-sm']" />
        <SpeakerXMarkIcon v-else-if="isVolumeChanging && sVolume <= 0"
          :class="['text-alive-txthd brightness-120 w-8 h-8 blur-sm']" />
        <SpeakerWaveIcon v-if="sVolume > 0" @click="() => { isVolumeChanging = !isVolumeChanging }"
          :class="isVolumeChanging ? [txtHover, 'text-alive-txth dark:text-alive-txthd w-8 h-8 relative -top-8 '] : [txt, txtHover, 'w-8 h-8']" />
        <SpeakerXMarkIcon v-else @click="() => { isVolumeChanging = !isVolumeChanging }"
          :class="isVolumeChanging ? [txtHover, 'text-alive-txth dark:text-alive-txthd w-8 h-8 relative -top-8 '] : [txt, txtHover, 'w-8 h-8']" />
        <NumChange v-if="isVolumeChanging" :posTop="112" @minus-event="() => { changeModelVoice(false) }"
          @plus-event="() => { changeModelVoice(true) }" />
      </li>
      <li class="w-8 h-8" @click="pauseAnimation">
        <PauseIcon v-if="!sPaused" :class="[txt, txtHover, 'w-8 h-8']" />
        <PlayIcon v-else :class="[txt, txtHover, 'w-8 h-8']" />
      </li>
      <li class="w-8 h-8" @click="mmdDancing">
        <FilmIcon :class="[txt, txtHover, 'w-8 h-8']" v-if="!dancing" />
        <DancingIcon :class="[txt, txtHover, 'w-8 h-8']" v-else />
      </li>
      <li class="w-8 h-8" @click="openSettings">
        <Cog6ToothIcon :class="[txt, txtHover, 'w-8 h-8']" />
      </li>
      <li class="w-8 h-8" @click="minify">
        <ArrowsPointingInIcon :class="[txt, txtHover, 'w-8 h-8']" />
      </li>
    </ul>
  </div>
</template>

