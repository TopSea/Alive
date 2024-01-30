<script setup lang="ts">
import { Engine } from "@babylonjs/core/Engines/engine";

import { AliveMmdOptions, BaseRuntime } from "./MMDRuntime";
// import { SceneBuilder } from "./MMDSceneBuilder";
import { SceneBuilder } from "./MMDBuilder";
import { onMounted, ref } from "vue";
import {
  ArrowPathIcon, CameraIcon, PlayIcon, PauseIcon, Cog6ToothIcon, SpeakerWaveIcon, SpeakerXMarkIcon,
  FilmIcon as DancingIcon
} from '@heroicons/vue/24/solid'
import { FilmIcon } from '@heroicons/vue/24/outline'
import { emit as tauriEmit } from '@tauri-apps/api/event';
import { join, resourceDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import NumChange from "../NumChange.vue";

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

function reloadPage() {
  location.reload()
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

onMounted(() => {
  console.log("MMD onMounted");
  const mmdCanvas = mmd_canvas.value as HTMLCanvasElement

  const engine = new Engine(mmdCanvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    alpha: true,
    powerPreference: "high-performance",
    doNotHandleTouchAction: true,
    doNotHandleContextLost: true,
    audioEngine: false
  }, true);

  const options: AliveMmdOptions = {
      mmdAliveUrl: mmdAliveUrl,
      mmdCamera: sMmdCamera.value,
      paused: sPaused.value,
      volume: sVolume.value
  }

  BaseRuntime.Create({
    canvas: mmdCanvas,
    engine,
    sceneBuilder: new SceneBuilder(),
    aliveMmdOptions: options
  }).then(runtime => runtime.run());

})
</script>


<template>
  <div class="w-full h-full static group/menu-mmd">
    <canvas ref="mmd_canvas" class="w-full h-full group-hover/menu-mmd:border border-dashed border-gray-100"></canvas>
    <ul data-tauri-drag-region
      class=" invisible group-hover/menu-mmd:visible absolute flex flex-col inset-y-0 right-0 mx-4 my-4 py-4 px-2 space-y-4 backdrop-blur-3xl bg-white/30">
      <li class="w-8 h-8" @click="reloadPage">
        <ArrowPathIcon class="icon-menu" />
      </li>
      <li class="w-8 h-8" @click="changeCamera">
        <CameraIcon class="icon-menu" />
      </li>
      
      <li class="w-8 h-8">
        <SpeakerWaveIcon v-if="isVolumeChanging && sVolume > 0" :class="'w-8 h-8 text-blue-800 brightness-200 blur-sm'" />
        <SpeakerXMarkIcon v-else-if="isVolumeChanging && sVolume <= 0" :class="'w-8 h-8 text-blue-800 brightness-200 blur-sm'" />
        <SpeakerWaveIcon v-if="sVolume > 0" @click="() => { isVolumeChanging = !isVolumeChanging }" :class="isVolumeChanging ? 'w-8 h-8 text-blue-800 relative -top-8 ' : ' w-8 h-8 text-zinc-700 hover:text-zinc-500'" />
        <SpeakerXMarkIcon v-else @click="() => { isVolumeChanging = !isVolumeChanging }"
          :class="isVolumeChanging ? 'w-8 h-8 text-blue-800 relative -top-8 ' : ' w-8 h-8 text-zinc-700 hover:text-zinc-500'" />
        <NumChange v-if="isVolumeChanging" :posTop="112" @minus-event="() => { changeModelVoice(false) }"
          @plus-event="() => { changeModelVoice(true) }" />
      </li>
      <!-- <li class="w-8 h-8" @click="changeModelVoice">
        <SpeakerWaveIcon v-if="sVolume" class="icon-menu" />
        <SpeakerXMarkIcon v-else class="icon-menu" />
      </li> -->
      <li class="w-8 h-8" @click="pauseAnimation">
        <PauseIcon v-if="!sPaused" class="icon-menu" />
        <PlayIcon v-else class="icon-menu" />
      </li>
      <li class="w-8 h-8" @click="mmdDancing">
        <FilmIcon class="icon-menu" v-if="!dancing" />
        <DancingIcon class="icon-menu" v-else />
      </li>
      <li class="w-8 h-8" @click="openSettings">
        <Cog6ToothIcon class="icon-menu" />
      </li>
    </ul>
  </div>
</template>

